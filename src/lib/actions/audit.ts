'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../supabase/server';
import { getCurrentOrg } from '../supabase/geo';
import { EngineType } from '@/lib/types';
import { isGeminiRateLimitError } from '../engines/gemini';
import { auditPromptCore, type AuditRunResponse } from '../engines/audit-core';

export type { AuditRunResponse };

export interface BatchAuditResponse {
  success: boolean;
  total: number;
  completed: number;
  rateLimitedCount: number;
  failedCount: number;
  message?: string;
  results: AuditRunResponse[];
}

/**
 * Runs an audit for a single prompt against the specified AI engine.
 * Resolves the organization strictly from the authenticated session (never a
 * client-supplied id), then delegates to the session-less core. On error the
 * core records a run row with status='error' and the full error string.
 */
export async function runAudit(
  promptId: string,
  engine: EngineType = 'gemini'
): Promise<AuditRunResponse> {
  const { org } = await getCurrentOrg();
  const supabase = await createClient();
  const result = await auditPromptCore(supabase, org.id, promptId, engine);
  if (result.success) {
    revalidatePath('/app');
  }
  return result;
}

/**
 * Loops through all active prompts for the authenticated organization.
 * Defaults to sequential execution (concurrency 1) with ~1.5s delay between prompts
 * to respect Gemini free-tier rate limits. Configurable via AUDIT_CONCURRENCY.
 */
export async function runAuditAllActive(
  engine: EngineType = 'gemini'
): Promise<BatchAuditResponse> {
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
      rateLimitedCount: 0,
      failedCount: 0,
      message: 'No active prompts to audit.',
      results: [],
    };
  }

  const results: AuditRunResponse[] = [];
  const envConcurrency = parseInt(process.env.AUDIT_CONCURRENCY || '1', 10);
  const concurrencyLimit = !isNaN(envConcurrency) && envConcurrency > 0 ? envConcurrency : 1;
  const DELAY_BETWEEN_PROMPTS_MS = 1500;

  // Process in batches (default 1 = sequential with ~1.5s delay between prompts)
  for (let i = 0; i < prompts.length; i += concurrencyLimit) {
    if (i > 0) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_PROMPTS_MS));
    }

    const chunk = prompts.slice(i, i + concurrencyLimit);
    const chunkPromises = chunk.map((p) =>
      auditPromptCore(supabase, org.id, p.id, engine).catch((err) => {
        const fullErr = err?.message || String(err || 'Unexpected prompt failure');
        return {
          success: false,
          promptId: p.id,
          engine,
          error: fullErr,
          rateLimited: isGeminiRateLimitError(err) || /429|resource_exhausted|quota/i.test(fullErr),
        } as AuditRunResponse;
      })
    );

    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);
  }

  revalidatePath('/app');

  const completed = results.filter((r) => r.success).length;
  const rateLimitedCount = results.filter((r) => !r.success && r.rateLimited).length;
  const failedCount = results.length - completed;

  let message = '';
  if (completed === prompts.length) {
    message = `Batch audit complete! Analyzed ${completed} of ${prompts.length} active prompts with Google Gemini.`;
  } else if (completed > 0) {
    if (rateLimitedCount > 0) {
      message = `Analyzed ${completed} of ${prompts.length} (${rateLimitedCount} rate-limited — retry later).`;
    } else {
      message = `Analyzed ${completed} of ${prompts.length} (${failedCount} failed — check logs).`;
    }
  } else {
    // 0 completed
    if (rateLimitedCount > 0) {
      message = `Audit failed: 0 of ${prompts.length} analyzed (${rateLimitedCount} rate-limited — retry later).`;
    } else {
      const firstError = results.find((r) => r.error)?.error;
      message = firstError ? `Audit failed: ${firstError}` : `Audit finished: Analyzed 0 of ${prompts.length} prompts.`;
    }
  }

  return {
    success: completed > 0,
    total: prompts.length,
    completed,
    rateLimitedCount,
    failedCount,
    message,
    results,
  };
}
