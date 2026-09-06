import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { auditPromptCore } from '@/lib/engines/audit-core';
import { EngineType } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // up to 5 minutes on Vercel

// Stop starting new audits past this to avoid being killed mid-run.
const TIME_BUDGET_MS = 270 * 1000;
// Skip a prompt already audited successfully within this window (idempotent day).
const RECENT_OK_WINDOW_MS = 20 * 60 * 60 * 1000;
// Pace between audits to respect free-tier rate limits.
const DELAY_BETWEEN_PROMPTS_MS = 1500;

/**
 * Validates authorization for Vercel Cron (or a manual trigger). When CRON_SECRET
 * is set it is strictly enforced via Bearer header, x-cron-secret, or ?secret.
 */
function isAuthorizedCron(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && cronSecret.trim().length > 0) {
    const authHeader = req.headers.get('authorization');
    const xCronHeader = req.headers.get('x-cron-secret');
    const urlSecret = req.nextUrl.searchParams.get('secret');
    return (
      authHeader === `Bearer ${cronSecret}` ||
      xCronHeader === cronSecret ||
      urlSecret === cronSecret
    );
  }
  // No secret configured → allow (Vercel Cron only). Set CRON_SECRET to lock down.
  return true;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Autonomous daily GEO audit. For every organization that has a self-brand and
 * active prompts, runs each active prompt once and records a new time-series
 * run — the same public-data-only audit as the manual "Run" button, on a
 * schedule. Uses the service-role admin client (RLS-bypassing) but scopes every
 * operation by org_id via auditPromptCore, so each org only ever touches its own
 * public data. No third-party accounts, tokens, or private data are involved.
 */
async function runGeoAuditCron(engine: EngineType = 'gemini') {
  const started = Date.now();
  const supabase = createAdminClient();

  const summary = {
    ok: true,
    orgsProcessed: 0,
    promptsSeen: 0,
    audited: 0,
    skipped: 0,
    failed: 0,
    timedOut: false,
    errors: [] as string[],
  };

  // Organizations that have a self-brand configured.
  const { data: selfBrands, error: brandsErr } = await supabase
    .from('brands')
    .select('org_id')
    .eq('is_self', true);

  if (brandsErr) {
    summary.ok = false;
    summary.errors.push(`brands query failed: ${brandsErr.message}`);
    return summary;
  }

  const orgIds = Array.from(new Set((selfBrands || []).map((b: any) => b.org_id)));
  const recentThreshold = new Date(Date.now() - RECENT_OK_WINDOW_MS).toISOString();

  for (const orgId of orgIds) {
    if (Date.now() - started > TIME_BUDGET_MS) {
      summary.timedOut = true;
      break;
    }

    const { data: prompts, error: promptsErr } = await supabase
      .from('prompts')
      .select('id')
      .eq('org_id', orgId)
      .eq('is_active', true);

    if (promptsErr) {
      summary.errors.push(`org ${orgId} prompts query failed: ${promptsErr.message}`);
      continue;
    }
    if (!prompts || prompts.length === 0) continue;

    summary.orgsProcessed++;

    for (const p of prompts) {
      if (Date.now() - started > TIME_BUDGET_MS) {
        summary.timedOut = true;
        break;
      }
      summary.promptsSeen++;

      // Idempotent for the day: skip prompts already audited OK recently so a
      // manual trigger + the scheduled run don't double-spend the quota.
      const { data: recent } = await supabase
        .from('runs')
        .select('id')
        .eq('org_id', orgId)
        .eq('prompt_id', p.id)
        .eq('status', 'ok')
        .gte('run_at', recentThreshold)
        .limit(1)
        .maybeSingle();

      if (recent) {
        summary.skipped++;
        continue;
      }

      if (summary.audited > 0 || summary.failed > 0) {
        await sleep(DELAY_BETWEEN_PROMPTS_MS);
      }

      const res = await auditPromptCore(supabase, orgId as string, p.id, engine);
      if (res.success) {
        summary.audited++;
      } else {
        summary.failed++;
        if (res.error) summary.errors.push(`${p.id}: ${res.error}`);
      }
    }
  }

  return summary;
}

async function handle(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: invalid or missing CRON_SECRET.' },
      { status: 401 }
    );
  }

  try {
    const engineParam = (req.nextUrl.searchParams.get('engine') || 'gemini') as EngineType;
    const summary = await runGeoAuditCron(engineParam);
    return NextResponse.json({ success: summary.ok, ...summary });
  } catch (err: any) {
    console.error('[CRON_GEO_AUDIT] Unexpected failure:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Unexpected cron failure.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
