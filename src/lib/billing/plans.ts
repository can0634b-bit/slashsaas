/**
 * Plan definitions + per-plan usage limits.
 *
 * The **daily audit cap** is the primary COST lever: every audit makes one paid
 * Gemini (grounded) + Groq call, so capping *successful* audits per rolling 24h
 * bounds spend per organization. Caps are env-overridable (per the project rule
 * "volatile config → env override → fallback constant") so they can be tuned
 * without a redeploy.
 *
 * Numbers reflect the "balanced" tier chosen 2026-09-06 (Radar 15/day, Command
 * 45/day), targeting ~67% gross margin at scale assuming ~$0.022/audit incl.
 * paid Google Search grounding (grounding is free under 5,000 audits/month
 * account-wide, so early margins are far higher).
 */

export type PlanId = 'free' | 'radar' | 'command' | 'unlimited';

export interface PlanLimits {
  id: PlanId;
  label: string;
  /** Max SUCCESSFUL audits per rolling 24h window — the cost ceiling. */
  dailyAuditCap: number;
  /** Max tracked prompts (plan-value differentiator; not itself a cost lever). */
  maxPrompts: number;
  /** Max tracked competitors. */
  maxCompetitors: number;
  /** Monthly price in USD, or null for the internal/unlimited plan. */
  priceUsd: number | null;
}

/** Sentinel meaning "no cap". Compare with {@link isUnlimited}. */
export const UNLIMITED = Number.MAX_SAFE_INTEGER;

/** Reads a positive integer env override, falling back to the given default. */
function envCap(name: string, fallback: number): number {
  const raw = (process.env[name] || '').trim();
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const PLANS: Record<PlanId, PlanLimits> = {
  free: {
    id: 'free',
    label: 'Free',
    dailyAuditCap: envCap('PLAN_FREE_DAILY_CAP', 5),
    maxPrompts: 3,
    maxCompetitors: 3,
    priceUsd: 0,
  },
  radar: {
    id: 'radar',
    label: 'Radar',
    dailyAuditCap: envCap('PLAN_RADAR_DAILY_CAP', 15),
    maxPrompts: 15,
    maxCompetitors: 5,
    priceUsd: 29,
  },
  command: {
    id: 'command',
    label: 'Command',
    dailyAuditCap: envCap('PLAN_COMMAND_DAILY_CAP', 45),
    maxPrompts: 45,
    maxCompetitors: 15,
    priceUsd: 89,
  },
  unlimited: {
    id: 'unlimited',
    label: 'Internal',
    dailyAuditCap: UNLIMITED,
    maxPrompts: UNLIMITED,
    maxCompetitors: UNLIMITED,
    priceUsd: null,
  },
};

/** Resolves a stored plan string (or null) to its limits, defaulting to Free. */
export function getPlan(planId: string | null | undefined): PlanLimits {
  const key = (planId || 'free').toLowerCase();
  return PLANS[key as PlanId] ?? PLANS.free;
}

/** True when a cap value represents "no limit". */
export function isUnlimited(cap: number): boolean {
  return cap >= UNLIMITED;
}
