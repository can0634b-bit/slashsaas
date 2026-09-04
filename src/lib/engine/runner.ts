import { createClient } from '../supabase/server';
import { createAdminClient } from '../supabase/admin';
import { GeminiSearchEngine, extractGroundedMentions } from './gemini';
import { calculateSampleScore, aggregateQuerySamples, computeProjectScanSummary } from './scorer';
import { computeScanDiff } from './diff';
import { AiSearchEngine, Competitor, Project, QuerySample, TrackedQuery } from './types';

export interface RunScanOptions {
  projectId: string;
  engineName?: string;
  sampleCount?: number;
  isAutonomous?: boolean;
}

export async function runProjectScan(options: RunScanOptions) {
  const { projectId, engineName = 'gemini', sampleCount = 3, isAutonomous = false } = options;

  // 1. Initialize Supabase Client (Admin client for autonomous cron scans, user client for web sessions)
  const supabase = isAutonomous ? createAdminClient() : await createClient();

  if (!isAutonomous) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized: You must be signed in to execute a scan.');
    }
  }

  // 2. Fetch Project
  const { data: projectData, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (projectError || !projectData) {
    throw new Error('Project not found or you do not have permission to access it.');
  }

  const project = projectData as Project;

  // 3. Fetch Tracked Queries & Competitors
  const [queriesRes, competitorsRes] = await Promise.all([
    supabase.from('tracked_queries').select('*').eq('project_id', project.id).order('created_at', { ascending: true }),
    supabase.from('competitors').select('*').eq('project_id', project.id).order('created_at', { ascending: true }),
  ]);

  if (queriesRes.error) {
    throw new Error(`Failed to load tracked queries: ${queriesRes.error.message}`);
  }

  const queries = (queriesRes.data || []) as TrackedQuery[];
  const competitors = (competitorsRes.data || []) as Competitor[];
  const competitorNames = competitors.map((c) => c.name);

  if (queries.length === 0) {
    throw new Error('Please add at least one tracked query prompt before initiating a scan.');
  }

  // 4. Initialize Swappable Engine
  let engine: AiSearchEngine;
  if (engineName === 'gemini') {
    engine = new GeminiSearchEngine();
  } else {
    engine = new GeminiSearchEngine();
  }

  // 5. Create Scan Record in DB (status: 'running')
  const { data: scanRecord, error: scanInsertError } = await supabase
    .from('scans')
    .insert({
      project_id: project.id,
      engine: engine.name,
      status: 'running',
      started_at: new Date().toISOString(),
      summary_json: {},
    })
    .select()
    .single();

  if (scanInsertError || !scanRecord) {
    throw new Error(`Failed to create scan record: ${scanInsertError?.message || 'Database error'}`);
  }

  const scanId = scanRecord.id;

  try {
    const aggregatedResults = [];

    // 6. Execute Collector, Extractor & Scorer per Query
    for (const query of queries) {
      const samples: QuerySample[] = [];

      // Sample query N times (default: 3x) to handle non-determinism
      for (let sIdx = 1; sIdx <= sampleCount; sIdx++) {
        try {
          // a. Collector (Agent 2)
          const { rawAnswer, sources: rawSources } = await engine.sampleQuery(query.query_text);

          // b. Extractor (Agent 3 - Strict Grounding)
          const extraction = await extractGroundedMentions(
            rawAnswer,
            project.brand_name,
            project.brand_domain,
            competitorNames
          );

          // Combined unique sources
          const allSources = Array.from(new Set([...extraction.sources, ...rawSources]));

          // c. Scorer (Agent 4 - Sample Level)
          const score = calculateSampleScore(extraction.brandMentioned, extraction.brandRank);

          samples.push({
            sampleIndex: sIdx,
            rawAnswer,
            brandMentioned: extraction.brandMentioned,
            brandRank: extraction.brandRank,
            competitorsFound: extraction.competitorsFound,
            sources: allSources,
            score,
          });
        } catch (sampleErr: any) {
          console.warn(`[SAMPLE_FAILED] Query: "${query.query_text}", Sample: ${sIdx}`, sampleErr?.message || sampleErr);
          samples.push({
            sampleIndex: sIdx,
            rawAnswer: `Query sample execution failed: ${sampleErr?.message || 'Timeout or API limit'}`,
            brandMentioned: false,
            brandRank: null,
            competitorsFound: competitorNames.map((n) => ({ name: n, mentioned: false, rank: null })),
            sources: [],
            score: 0,
          });
        }
      }

      // Aggregate query samples
      const queryResult = aggregateQuerySamples(query.id, query.query_text, engine.name, samples);
      aggregatedResults.push(queryResult);
    }

    // 7. Compute Project Scan Summary (Agent 4)
    const summary = computeProjectScanSummary(aggregatedResults, competitorNames, engine.name);

    // 8. Compute History & Diff (Agent 5)
    const { data: previousScanRows } = await supabase
      .from('scans')
      .select('id, created_at, overall_score, summary_json')
      .eq('project_id', project.id)
      .eq('status', 'done')
      .neq('id', scanId)
      .order('created_at', { ascending: false })
      .limit(1);

    const previousScan = previousScanRows && previousScanRows.length > 0 ? previousScanRows[0] : null;

    let previousResults: any[] = [];
    if (previousScan) {
      const { data: prevRes } = await supabase
        .from('scan_results')
        .select('query_id, query_text, brand_mentioned, brand_rank, visibility_score, competitors_found')
        .eq('scan_id', previousScan.id);
      previousResults = prevRes || [];
    }

    const diff = computeScanDiff(summary, aggregatedResults, previousScan, previousResults);
    summary.diff = diff;

    // 9. Store Scan Results in DB
    const scanResultsToInsert = aggregatedResults.map((r) => ({
      scan_id: scanId,
      query_id: r.query_id || null,
      query_text: r.query_text,
      engine: r.engine,
      brand_mentioned: r.brand_mentioned,
      brand_rank: r.brand_rank,
      competitors_found: r.competitors_found,
      sources: r.sources,
      visibility_score: r.visibility_score,
      raw_answer: r.raw_answer,
      sample_count: r.sample_count,
      samples_json: r.samples_json,
    }));

    const { error: resultsInsertError } = await supabase.from('scan_results').insert(scanResultsToInsert);

    if (resultsInsertError) {
      console.error('[RESULTS_INSERT_ERROR]', resultsInsertError);
    }

    // 10. Update Scan Record (status: 'done' + summary + diff)
    const { error: scanUpdateError } = await supabase
      .from('scans')
      .update({
        status: 'done',
        overall_score: summary.overallVisibilityScore,
        brand_mention_rate: summary.brandMentionRate,
        share_of_voice: summary.shareOfVoice,
        finished_at: new Date().toISOString(),
        summary_json: summary,
      })
      .eq('id', scanId);

    if (scanUpdateError) {
      console.error('[SCAN_UPDATE_ERROR]', scanUpdateError);
    }

    return {
      success: true,
      scanId,
      summary,
      diff,
      resultsCount: scanResultsToInsert.length,
    };
  } catch (err: any) {
    console.error('[RUN_SCAN_FATAL_ERROR]', err);
    await supabase
      .from('scans')
      .update({
        status: 'failed',
        error_message: err.message || 'Scan execution failed',
        finished_at: new Date().toISOString(),
        summary_json: { error: err.message || 'Scan execution failed' },
      })
      .eq('id', scanId);

    throw err;
  }
}
