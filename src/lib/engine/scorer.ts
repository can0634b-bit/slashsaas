import { CompetitorMention, CompetitorShare, ProjectScanSummary, QuerySample, ScanResult } from './types';

/**
 * Calculates deterministic visibility score for a single sample run.
 */
export function calculateSampleScore(brandMentioned: boolean, brandRank: number | null): number {
  if (!brandMentioned) return 0;

  if (brandRank === 1) return 100;
  if (brandRank === 2) return 80;
  if (brandRank === 3) return 65;
  if (brandRank === 4 || brandRank === 5) return 50;
  if (brandRank !== null && brandRank > 5) return 40;

  // Unranked mention (e.g. general recommendation or in paragraph)
  return 40;
}

/**
 * Aggregates 3 samples for a single query into a query-level visibility score and metadata.
 */
export function aggregateQuerySamples(
  queryId: string | undefined,
  queryText: string,
  engineName: string,
  samples: QuerySample[]
): Omit<ScanResult, 'id' | 'scan_id' | 'created_at'> {
  if (samples.length === 0) {
    return {
      query_id: queryId,
      query_text: queryText,
      engine: engineName,
      brand_mentioned: false,
      brand_rank: null,
      competitors_found: [],
      sources: [],
      visibility_score: 0,
      raw_answer: '',
      sample_count: 0,
      samples_json: [],
    };
  }

  // 1. Average visibility score across samples (rounded to 1 decimal)
  const totalScore = samples.reduce((sum, s) => sum + s.score, 0);
  const avgScore = Math.round((totalScore / samples.length) * 10) / 10;

  // 2. Brand mentioned in majority or any sample?
  const mentionedCount = samples.filter((s) => s.brandMentioned).length;
  const brandMentioned = mentionedCount > 0;

  // 3. Best rank achieved across samples
  const ranks = samples.map((s) => s.brandRank).filter((r): r is number => typeof r === 'number' && r > 0);
  const brandRank = ranks.length > 0 ? Math.min(...ranks) : null;

  // 4. Competitors aggregated across samples
  const competitorMap = new Map<string, { mentionedCount: number; bestRank: number | null }>();
  samples.forEach((s) => {
    s.competitorsFound.forEach((comp) => {
      const current = competitorMap.get(comp.name) || { mentionedCount: 0, bestRank: null };
      if (comp.mentioned) {
        current.mentionedCount += 1;
        if (typeof comp.rank === 'number') {
          current.bestRank = current.bestRank === null ? comp.rank : Math.min(current.bestRank, comp.rank);
        }
      }
      competitorMap.set(comp.name, current);
    });
  });

  const aggregatedCompetitors: CompetitorMention[] = Array.from(competitorMap.entries()).map(
    ([name, data]) => ({
      name,
      mentioned: data.mentionedCount > 0,
      rank: data.bestRank,
    })
  );

  // 5. Aggregate all unique sources
  const allSources = Array.from(new Set(samples.flatMap((s) => s.sources)));

  // 6. Use the latest or most complete raw answer as primary evidence
  const rawAnswer = samples[0]?.rawAnswer || '';

  return {
    query_id: queryId,
    query_text: queryText,
    engine: engineName,
    brand_mentioned: brandMentioned,
    brand_rank: brandRank,
    competitors_found: aggregatedCompetitors,
    sources: allSources,
    visibility_score: avgScore,
    raw_answer: rawAnswer,
    sample_count: samples.length,
    samples_json: samples,
  };
}

/**
 * Computes overall project scan summary and share of voice.
 */
export function computeProjectScanSummary(
  results: Array<Omit<ScanResult, 'id' | 'scan_id' | 'created_at'>>,
  competitorNames: string[],
  engineName: string
): ProjectScanSummary {
  if (results.length === 0) {
    return {
      totalQueries: 0,
      overallVisibilityScore: 0,
      brandMentionRate: 0,
      shareOfVoice: 0,
      competitorBreakdown: [],
      engine: engineName,
      scannedAt: new Date().toISOString(),
    };
  }

  // 1. Overall Visibility Score: Average of query visibility scores
  const totalScore = results.reduce((sum, r) => sum + r.visibility_score, 0);
  const overallVisibilityScore = Math.round((totalScore / results.length) * 10) / 10;

  // 2. Brand Mention Rate: Total sample runs with brand / Total sample runs
  let totalSamples = 0;
  let brandSampleMentions = 0;
  const competitorMentionCounts = new Map<string, number>();

  competitorNames.forEach((name) => competitorMentionCounts.set(name, 0));

  results.forEach((r) => {
    (r.samples_json || []).forEach((sample) => {
      totalSamples += 1;
      if (sample.brandMentioned) {
        brandSampleMentions += 1;
      }
      (sample.competitorsFound || []).forEach((comp) => {
        if (comp.mentioned) {
          const current = competitorMentionCounts.get(comp.name) || 0;
          competitorMentionCounts.set(comp.name, current + 1);
        }
      });
    });
  });

  const brandMentionRate = totalSamples > 0 ? Math.round((brandSampleMentions / totalSamples) * 100) : 0;

  // 3. Share of Voice calculation
  const totalCompetitorMentions = Array.from(competitorMentionCounts.values()).reduce((a, b) => a + b, 0);
  const totalAllMentions = brandSampleMentions + totalCompetitorMentions;

  const shareOfVoice =
    totalAllMentions > 0 ? Math.round((brandSampleMentions / totalAllMentions) * 100) : (brandSampleMentions > 0 ? 100 : 0);

  const competitorBreakdown: CompetitorShare[] = competitorNames.map((name) => {
    const count = competitorMentionCounts.get(name) || 0;
    const sov = totalAllMentions > 0 ? Math.round((count / totalAllMentions) * 100) : 0;
    return {
      name,
      mentionsCount: count,
      shareOfVoice: sov,
    };
  });

  return {
    totalQueries: results.length,
    overallVisibilityScore,
    brandMentionRate,
    shareOfVoice,
    competitorBreakdown,
    engine: engineName,
    scannedAt: new Date().toISOString(),
  };
}
