import type { SupabaseClient } from '@supabase/supabase-js';
import { EngineType, Brand } from '@/lib/types';
import { getEngineAdapter } from './index';
import { resolveGeminiModel, isGeminiRateLimitError } from './gemini';
import { analyzeMentions } from './parser';
import { getPlan, isUnlimited } from '@/lib/billing/plans';

export interface AuditRunResponse {
  success: boolean;
  runId?: string;
  promptId: string;
  engine: EngineType;
  model?: string;
  error?: string;
  rateLimited?: boolean;
  selfMentioned?: boolean;
  selfPosition?: number | null;
  selfCited?: boolean;
  competitorsMentioned?: Array<{ name: string; position: number | null }>;
}

/**
 * Session-less core of a single-prompt audit. Callers pass an explicit `orgId`
 * and an already-constructed Supabase client (a session/RLS client for the
 * manual "Run" action, or the service-role admin client for the autonomous
 * cron). Every query is scoped by `orgId`, so it stays org-safe even under the
 * RLS-bypassing admin client. Records a new time-series run row (ok or error)
 * exactly like the manual path, and never trusts client-supplied org ids.
 */
export async function auditPromptCore(
  supabase: SupabaseClient,
  orgId: string,
  promptId: string,
  engine: EngineType = 'gemini'
): Promise<AuditRunResponse> {
  let resolvedModel = 'gemini-3.6-flash';

  try {
    if (engine === 'gemini') {
      try {
        resolvedModel = await resolveGeminiModel();
      } catch (err) {
        console.warn('[AUDIT] Failed to resolve Gemini model, using default:', err);
      }
    }

    // 1. Anti-hammering rate guard (reject if run for same prompt occurred <30s ago)
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
    const { data: recentRun } = await supabase
      .from('runs')
      .select('id, run_at')
      .eq('org_id', orgId)
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
        model: resolvedModel,
        error: 'Cooldown active: This prompt was audited less than 30 seconds ago.',
        rateLimited: true,
      };
    }

    // 1b. Per-plan daily audit cap — the primary COST guard.
    // Counts SUCCESSFUL audits for this org in the last rolling 24h and rejects
    // further audits once the plan's cap is reached, BEFORE any paid engine call
    // (so a blocked audit costs $0). Only status='ok' runs consume the allowance,
    // so users are never penalised for our engine's own failures. Fail-open: a
    // counter-query error must never block a legitimate (billable) audit.
    try {
      const { data: orgRow } = await supabase
        .from('organizations')
        .select('plan')
        .eq('id', orgId)
        .maybeSingle();
      const plan = getPlan(orgRow?.plan as string | null | undefined);

      if (!isUnlimited(plan.dailyAuditCap)) {
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count } = await supabase
          .from('runs')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('status', 'ok')
          .gte('run_at', dayAgo);

        if ((count ?? 0) >= plan.dailyAuditCap) {
          return {
            success: false,
            promptId,
            engine,
            model: resolvedModel,
            error: `Daily audit limit reached — ${plan.dailyAuditCap} audits/day on the ${plan.label} plan. This is a rolling 24-hour window, so it frees up as your earliest audits pass the 24h mark. Upgrade for a higher cap.`,
            rateLimited: true,
          };
        }
      }
    } catch (capErr) {
      console.warn('[AUDIT] Daily cap check failed (allowing audit):', capErr);
    }

    // 2. Load prompt (must belong to org and be active)
    const { data: prompt, error: promptErr } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', promptId)
      .eq('org_id', orgId)
      .eq('is_active', true)
      .single();

    if (promptErr || !prompt) {
      return {
        success: false,
        promptId,
        engine,
        model: resolvedModel,
        error: 'Prompt not found or is currently paused.',
      };
    }

    // 3. Load self brand and competitors
    const { data: brandsData, error: brandsErr } = await supabase
      .from('brands')
      .select('*')
      .eq('org_id', orgId);

    if (brandsErr || !brandsData || brandsData.length === 0) {
      return {
        success: false,
        promptId,
        engine,
        model: resolvedModel,
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
        model: resolvedModel,
        error: 'Organization does not have an active self brand configured.',
      };
    }

    const competitors = brandList.filter((b) => !b.is_self);

    // 4. STEP A: Query the engine naturally
    let effectiveEngine: EngineType = engine;
    let stepAResult;
    try {
      stepAResult = await getEngineAdapter(engine).run(prompt.text, { locale: prompt.locale });
      resolvedModel = stepAResult.model;
    } catch (stepAErr: any) {
      const fullError = stepAErr?.message || String(stepAErr);
      const isRateLimit = isGeminiRateLimitError(stepAErr) || /429|resource_exhausted|quota/i.test(fullError);

      // Auto-fallback: if the grounded engine is rate-limited / quota-exhausted,
      // retry with Groq (Llama, ungrounded) so the audit still completes on the
      // free tier. The run is recorded as engine 'groq' to stay honest about
      // which model actually produced the answer.
      const groqConfigured = !!(process.env.GROQ_API_KEY || '').trim();
      if (isRateLimit && (engine === 'gemini' || engine === 'google_ai') && groqConfigured) {
        try {
          stepAResult = await getEngineAdapter('groq').run(prompt.text, { locale: prompt.locale });
          effectiveEngine = 'groq';
          resolvedModel = stepAResult.model;
          console.warn(`[AUDIT] "${engine}" was rate-limited; fell back to Groq for prompt "${prompt.text}".`);
        } catch (groqErr: any) {
          console.warn('[AUDIT] Groq fallback also failed:', groqErr?.message || groqErr);
        }
      }

      if (!stepAResult) {
        console.error(`[AUDIT_ERROR] Step A generation failed for prompt "${prompt.text}" (model: ${resolvedModel}):`, fullError);

        // Persist failed run row for error visibility
        await supabase.from('runs').insert({
          org_id: orgId,
          prompt_id: prompt.id,
          engine,
          model: resolvedModel,
          raw_response: null,
          cost_usd: 0,
          status: 'error',
          error: fullError,
          run_at: new Date().toISOString(),
        });

        return {
          success: false,
          promptId,
          engine,
          model: resolvedModel,
          error: fullError,
          rateLimited: isRateLimit,
        };
      }
    }

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

    // 6. Record successful run as a new time-series record
    const runPayload: Record<string, unknown> = {
      org_id: orgId,
      prompt_id: prompt.id,
      engine: effectiveEngine,
      model: stepAResult.model,
      raw_response: stepAResult.rawResponse,
      cost_usd: stepAResult.costUsd || null,
      // Full grounding source list → powers Citation Source Intelligence.
      // Empty for ungrounded (Groq-fallback) runs.
      citations: stepAResult.citations && stepAResult.citations.length > 0 ? stepAResult.citations : null,
      status: 'ok',
      error: null,
      run_at: new Date().toISOString(),
    };

    let { data: newRun, error: runInsertErr } = await supabase
      .from('runs')
      .insert(runPayload)
      .select('id')
      .single();

    // Resilience: if the `citations` column hasn't been migrated yet, the insert
    // errors on that column. Retry once WITHOUT it so audits never break on a
    // lagging migration (the citation data is simply omitted until it's applied).
    if (runInsertErr && /citations/i.test(runInsertErr.message || '')) {
      console.warn('[AUDIT] runs.citations column missing — retrying insert without citations (run the run_citations migration).');
      const { citations: _omit, ...withoutCitations } = runPayload;
      ({ data: newRun, error: runInsertErr } = await supabase
        .from('runs')
        .insert(withoutCitations)
        .select('id')
        .single());
    }

    if (runInsertErr || !newRun) {
      console.error('[AUDIT] Failed to insert run record:', runInsertErr);
      return {
        success: false,
        promptId,
        engine,
        model: resolvedModel,
        error: runInsertErr?.message || 'Failed to save audit run to database.',
      };
    }

    // 7. Insert mentions per brand linked to this run
    const mentionRows = extractions.map((e) => ({
      org_id: orgId,
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

    return {
      success: true,
      runId: newRun.id,
      promptId,
      engine: effectiveEngine,
      model: resolvedModel,
      selfMentioned: selfExtraction ? selfExtraction.mentioned : false,
      selfPosition: selfExtraction ? selfExtraction.position : null,
      selfCited: selfExtraction ? selfExtraction.cited : false,
      competitorsMentioned: compMentions,
    };
  } catch (err: any) {
    const fullError = err?.message || String(err);
    console.error(`[AUDIT_UNEXPECTED] Failure for prompt ${promptId} (model: ${resolvedModel}):`, fullError);

    try {
      await supabase.from('runs').insert({
        org_id: orgId,
        prompt_id: promptId,
        engine,
        model: resolvedModel,
        raw_response: null,
        cost_usd: 0,
        status: 'error',
        error: fullError,
        run_at: new Date().toISOString(),
      });
    } catch (insertErr) {
      console.error('[AUDIT] Could not insert error run row:', insertErr);
    }

    const isRateLimit = isGeminiRateLimitError(err) || /429|resource_exhausted|quota|cooldown/i.test(fullError);
    return {
      success: false,
      promptId,
      engine,
      model: resolvedModel,
      error: fullError,
      rateLimited: isRateLimit,
    };
  }
}
