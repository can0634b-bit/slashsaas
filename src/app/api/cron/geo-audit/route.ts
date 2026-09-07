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

interface AlertEvent {
  prompt: string;
  change: 'gained' | 'lost';
}

/**
 * Reads the self-brand's mention status from the most recent successful run of a
 * prompt (before a new audit is recorded). Returns null when there is no prior
 * run to compare against.
 */
async function getPriorSelfMention(
  supabase: ReturnType<typeof createAdminClient>,
  orgId: string,
  promptId: string,
  selfBrandId: string
): Promise<boolean | null> {
  const { data: lastRun } = await supabase
    .from('runs')
    .select('id')
    .eq('org_id', orgId)
    .eq('prompt_id', promptId)
    .eq('status', 'ok')
    .order('run_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!lastRun) return null;

  const { data: mention } = await supabase
    .from('mentions')
    .select('mentioned')
    .eq('run_id', lastRun.id)
    .eq('brand_id', selfBrandId)
    .maybeSingle();
  return mention ? !!mention.mentioned : false;
}

/**
 * Dispatches a visibility-change alert to a user-configured webhook (e.g. a
 * Make.com scenario that emails the user). Public data only. No-op if
 * ALERT_WEBHOOK_URL is unset. Never throws — alerting must not fail the cron.
 */
async function dispatchAlert(brand: string, orgId: string, events: AlertEvent[]) {
  const url = (process.env.ALERT_WEBHOOK_URL || '').trim();
  if (!url || events.length === 0) return;

  const gained = events.filter((e) => e.change === 'gained').length;
  const lost = events.filter((e) => e.change === 'lost').length;

  const payload = {
    type: 'visibility_alert',
    brand,
    orgId,
    at: new Date().toISOString(),
    changeCount: events.length,
    gained,
    lost,
    summary: `${brand}: ${gained} newly mentioned, ${lost} lost across ${events.length} change${events.length === 1 ? '' : 's'}.`,
    events,
  };

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(t);
  } catch (err: any) {
    console.warn('[CRON_GEO_AUDIT] alert webhook failed:', err?.message || err);
  }
}

/**
 * Autonomous daily GEO audit. For every organization that has a self-brand and
 * active prompts, runs each active prompt once, records a new time-series run,
 * and — when the self-brand's mention status flips vs. the previous run —
 * dispatches a change alert to the org's webhook. Same public-data-only audit as
 * the manual "Run" button, on a schedule. Uses the service-role admin client but
 * scopes every operation by org_id, so each org only ever touches its own data.
 */
async function runGeoAuditCron(engine: EngineType = 'openai') {
  const started = Date.now();
  const supabase = createAdminClient();

  const summary = {
    ok: true,
    orgsProcessed: 0,
    promptsSeen: 0,
    audited: 0,
    skipped: 0,
    failed: 0,
    alertsSent: 0,
    changes: 0,
    timedOut: false,
    errors: [] as string[],
  };

  // Organizations that have a self-brand configured (+ its id and name).
  const { data: selfBrands, error: brandsErr } = await supabase
    .from('brands')
    .select('org_id, id, name')
    .eq('is_self', true);

  if (brandsErr) {
    summary.ok = false;
    summary.errors.push(`brands query failed: ${brandsErr.message}`);
    return summary;
  }

  // One self-brand per org; keep the first seen.
  const orgBrand = new Map<string, { selfBrandId: string; brandName: string }>();
  for (const b of selfBrands || []) {
    if (!orgBrand.has(b.org_id)) orgBrand.set(b.org_id, { selfBrandId: b.id, brandName: b.name });
  }

  const recentThreshold = new Date(Date.now() - RECENT_OK_WINDOW_MS).toISOString();

  for (const [orgId, { selfBrandId, brandName }] of orgBrand) {
    if (Date.now() - started > TIME_BUDGET_MS) {
      summary.timedOut = true;
      break;
    }

    const { data: prompts, error: promptsErr } = await supabase
      .from('prompts')
      .select('id, text')
      .eq('org_id', orgId)
      .eq('is_active', true);

    if (promptsErr) {
      summary.errors.push(`org ${orgId} prompts query failed: ${promptsErr.message}`);
      continue;
    }
    if (!prompts || prompts.length === 0) continue;

    summary.orgsProcessed++;
    const events: AlertEvent[] = [];

    for (const p of prompts) {
      if (Date.now() - started > TIME_BUDGET_MS) {
        summary.timedOut = true;
        break;
      }
      summary.promptsSeen++;

      // Idempotent for the day: skip prompts already audited OK recently.
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

      // Capture the prior mention state so we can detect a flip after auditing.
      const prior = await getPriorSelfMention(supabase, orgId, p.id, selfBrandId);

      if (summary.audited > 0 || summary.failed > 0) {
        await sleep(DELAY_BETWEEN_PROMPTS_MS);
      }

      const res = await auditPromptCore(supabase, orgId, p.id, engine);
      if (res.success) {
        summary.audited++;
        const now = !!res.selfMentioned;
        if (prior !== null && prior !== now) {
          summary.changes++;
          events.push({ prompt: p.text, change: now ? 'gained' : 'lost' });
        }
      } else {
        summary.failed++;
        if (res.error) summary.errors.push(`${p.id}: ${res.error}`);
      }
    }

    if (events.length > 0) {
      await dispatchAlert(brandName, orgId, events);
      summary.alertsSent++;
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
    const engineParam = (req.nextUrl.searchParams.get('engine') || 'openai') as EngineType;
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
