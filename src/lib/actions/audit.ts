'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../supabase/server';
import { getCurrentOrg } from '../supabase/geo';
import { EngineType, Brand } from '@/lib/types';
import { getEngineAdapter } from '../engines';
import { analyzeMentions } from '../engines/parser';

export interface AuditRunResponse {
  success: boolean;
  runId?: string;
  promptId: string;
  engine: EngineType;
  error?: string;
  rateLimited?: boolean;
  selfMentioned?: boolean;
  selfPosition?: number | null;
  selfCited?: boolean;
  competitorsMentioned?: Array<{ name: string; position: number | null }>;
}

/**
 * Runs an audit for a single prompt against the specified AI engine.
 * Never trusts a client-supplied org_id; resolves strictly from session.
 */
export async function runAudit(
  promptId: string,
  engine: EngineType = 'gemini'
): Promise<AuditRunResponse> {
  try {
    const { org } = await getCurrentOrg();
    const supabase = await createClient();

    // 1. Anti-hammering rate guard (reject if run for same prompt occurred <30s ago)
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
    const { data: recentRun } = await supabase
      .from('runs')
      .select('id, run_at')
      .eq('org_id', org.id)
      .eq('prompt_id', promptId)
      .gte('run_at', thirtySecondsAgo)
      .order('run_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentRun) {
      return {
        success: false,
        promptId,
        engine,
        error: 'Cooldown active: This prompt was audited less than 30 seconds ago.',
        rateLimited: true,
      };
    }

    // 2. Load prompt (must belong to org and be active)
    const { data: prompt, error: promptErr } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', promptId)
      .eq('org_id', org.id)
      .eq('is_active', true)
      .single();

    if (promptErr || !prompt) {
      return {
        success: false,
        promptId,
        engine,
        error: 'Prompt not found or is currently paused.',
      };
    }

    // 3. Load self brand and competitors
    const { data: brandsData, error: brandsErr } = await supabase
      .from('brands')
      .select('*')
      .eq('org_id', org.id);

    if (brandsErr || !brandsData || brandsData.length === 0) {
      return {
        success: false,
        promptId,
        engine,
        error: 'No brands configured for this organization.',
      };
    }

    const brandList = brandsData as Brand[];
    const selfBrand = brandList.find((b) => b.is_self);
    if (!selfBrand) {
      return {
        success: false,
        promptId,
        engine,
        error: 'Organization does not have an active self brand configured.',
      };
    }

    const competitors = brandList.filter((b) => !b.is_self);

    // 4. STEP A: Query the engine naturally
    const adapter = getEngineAdapter(engine);
    const stepAResult = await adapter.run(prompt.text, { locale: prompt.locale });

    // 5. STEP B: Analyze mentions structured extraction
    const extractions = await analyzeMentions({
      rawResponse: stepAResult.rawResponse,
      citations: stepAResult.citations,
      selfBrand: {
        id: selfBrand.id,
        name: selfBrand.name,
        domain: selfBrand.domain,
        aliases: selfBrand.aliases,
      },
      competitors: competitors.map((c) => ({
        id: c.id,
        name: c.name,
        domain: c.domain,
      })),
    });

    // 6. Record run as a new time-series record
    const { data: newRun, error: runInsertErr } = await supabase
      .from('runs')
      .insert({
        org_id: org.id,
        prompt_id: prompt.id,
        engine,
        model: stepAResult.model,
        raw_response: stepAResult.rawResponse,
        cost_usd: stepAResult.costUsd || null,
        run_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (runInsertErr || !newRun) {
      console.error('[AUDIT] Failed to insert run record:', runInsertErr);
      return {
        success: false,
        promptId,
        engine,
        error: runInsertErr?.message || 'Failed to save audit run to database.',
      };
    }

    // 7. Insert mentions per brand linked to this run
    const mentionRows = extractions.map((e) => ({
      org_id: org.id,
      run_id: newRun.id,
      brand_id: e.brand_id,
      mentioned: e.mentioned,
      position: e.position,
      cited: e.cited,
      citation_url: e.citation_url,
      sentiment: e.sentiment,
      snippet: e.snippet,
    }));

    const { error: mentionsErr } = await supabase.from('mentions').insert(mentionRows);
    if (mentionsErr) {
      console.error('[AUDIT] Error recording mentions:', mentionsErr);
    }

    const selfExtraction = extractions.find((e) => e.brand_id === selfBrand.id);
    const compMentions = extractions
      .filter((e) => e.brand_id !== selfBrand.id && e.mentioned)
      .map((e) => ({ name: e.brand_name, position: e.position }));

    revalidatePath('/app');

    return {
      success: true,
      runId: newRun.id,
      promptId,
      engine,
      selfMentioned: selfExtraction ? selfExtraction.mentioned : false,
      selfPosition: selfExtraction ? selfExtraction.position : null,
      selfCited: selfExtraction ? selfExtraction.cited : false,
      competitorsMentioned: compMentions,
    };
  } catch (err: any) {
    console.error('[AUDIT] Unexpected audit failure:', err);
    return {
      success: false,
      promptId,
      engine,
      error: err?.message || 'An unexpected error occurred during audit.',
    };
  }
}

/**
 * Loops through all active prompts for the authenticated organization with bounded concurrency (~3).
 * Tolerates individual failures and aggregates per-prompt statuses.
 */
export async function runAuditAllActive(
  engine: EngineType = 'gemini'
): Promise<{
  success: boolean;
  total: number;
  completed: number;
  results: AuditRunResponse[];
}> {
  const { org } = await getCurrentOrg();
  const supabase = await createClient();

  const { data: prompts, error } = await supabase
    .from('prompts')
    .select('id, text')
    .eq('org_id', org.id)
    .eq('is_active', true);

  if (error || !prompts || prompts.length === 0) {
    return {
      success: true,
      total: 0,
      completed: 0,
      results: [],
    };
  }

  const results: AuditRunResponse[] = [];
  const concurrencyLimit = 3;

  // Process in batches of 3
  for (let i = 0; i < prompts.length; i += concurrencyLimit) {
    const chunk = prompts.slice(i, i + concurrencyLimit);
    const chunkPromises = chunk.map((p) =>
      runAudit(p.id, engine).catch((err) => ({
        success: false,
        promptId: p.id,
        engine,
        error: err?.message || 'Unexpected prompt failure',
      }))
    );

    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);
  }

  revalidatePath('/app');

  const completed = results.filter((r) => r.success).length;
  return {
    success: true,
    total: prompts.length,
    completed,
    results,
  };
}
