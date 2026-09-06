import { createClient } from './server';
import { getOrCreateUserOrganization, Organization } from './organizations';
import {
  Brand,
  Prompt,
  Run,
  Mention,
  GeoWorkspaceMetrics,
  PromptAuditSummary,
  VisibilityTrendPoint,
  CitationItem,
  CitationIntelligence,
  VisibilityChange,
  SentimentPositioning,
} from '@/lib/types';
import { User } from '@supabase/supabase-js';

/**
 * Resolves the authenticated user and their canonical organization.
 * Idempotently creates an organization if none exists.
 */
export async function getCurrentOrg(): Promise<{ user: User; org: Organization }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const org = await getOrCreateUserOrganization(user);
  if (!org) {
    throw new Error('Organization not found');
  }

  return { user, org };
}

/**
 * Returns the canonical org_id for the currently authenticated user.
 */
export async function getCurrentOrgId(): Promise<string> {
  const { org } = await getCurrentOrg();
  return org.id;
}

export interface GeoWorkspaceData {
  selfBrand: Brand | null;
  competitors: Brand[];
  prompts: Prompt[];
  metrics: GeoWorkspaceMetrics;
  promptSummaries: Record<string, PromptAuditSummary>;
  recentRuns: Array<Run & { promptText?: string }>;
  visibilityTrend: VisibilityTrendPoint[];
  citationIntelligence: CitationIntelligence;
  visibilityChanges: VisibilityChange[];
  sentimentPositioning: SentimentPositioning;
}

function extractDomainFromUrl(urlStr?: string | null): string | null {
  if (!urlStr) return null;
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return urlStr.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] || null;
  }
}

/** Normalizes a brand-entered domain ("https://www.x.com/path") to "x.com". */
function normalizeBrandDomain(domain?: string | null): string | null {
  if (!domain) return null;
  const d = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split('?')[0];
  return d || null;
}

/**
 * Aggregates every source the AI cited across successful runs into ranked
 * Citation Source Intelligence. Gemini grounding URLs are usually Google
 * redirect links, so the human-readable `title` (site name) is the reliable
 * source identifier — we key on it, falling back to the URL domain.
 */
function computeCitationIntelligence(
  okRuns: Run[],
  selfBrandDomain?: string | null
): CitationIntelligence {
  const selfDomain = normalizeBrandDomain(selfBrandDomain);
  const agg = new Map<string, { label: string; domain: string | null; url: string; count: number; isSelf: boolean }>();
  let totalCitations = 0;
  let runsWithCitations = 0;

  for (const r of okRuns) {
    const cits = Array.isArray(r.citations) ? (r.citations as CitationItem[]) : [];
    if (cits.length > 0) runsWithCitations++;
    for (const c of cits) {
      if (!c || !c.url) continue;
      totalCitations++;
      const domain = extractDomainFromUrl(c.url);
      const title = (c.title || '').trim();
      const label = title || domain || c.url;
      const key = label.toLowerCase();
      const isSelf = !!selfDomain && (
        (!!domain && domain.toLowerCase().includes(selfDomain)) ||
        title.toLowerCase().includes(selfDomain) ||
        c.url.toLowerCase().includes(selfDomain)
      );
      const existing = agg.get(key);
      if (existing) {
        existing.count++;
        if (isSelf) existing.isSelf = true;
      } else {
        agg.set(key, { label, domain, url: c.url, count: 1, isSelf });
      }
    }
  }

  const all = Array.from(agg.values());
  const sources = all
    .sort((a, b) => b.count - a.count)
    .slice(0, 12)
    .map((s) => ({ label: s.label, domain: s.domain, url: s.url, count: s.count, isSelf: s.isSelf }));

  return {
    totalCitations,
    uniqueSources: all.length,
    runsWithCitations,
    selfSourceCount: all.filter((s) => s.isSelf).length,
    sources,
  };
}

/**
 * Fetches all GEO workspace data (self brand, competitors, prompts, runs, mentions)
 * and computes real visibility scores, share of voice, and per-prompt audit history.
 */
export async function getGeoWorkspaceData(orgId: string): Promise<GeoWorkspaceData> {
  const supabase = await createClient();

  // 1. Query Brands
  const { data: brands, error: brandsError } = await supabase
    .from('brands')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true });

  if (brandsError) {
    console.error('[GEO_DATA] Error fetching brands:', brandsError);
  }

  const brandList = (brands || []) as Brand[];
  const selfBrand = brandList.find((b) => b.is_self) || null;
  const competitors = brandList.filter((b) => !b.is_self);
  const brandMap = new Map<string, Brand>(brandList.map((b) => [b.id, b]));

  // 2. Query Prompts
  const { data: prompts, error: promptsError } = await supabase
    .from('prompts')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (promptsError) {
    console.error('[GEO_DATA] Error fetching prompts:', promptsError);
  }

  const promptList = (prompts || []) as Prompt[];
  const promptMap = new Map<string, Prompt>(promptList.map((p) => [p.id, p]));

  // 3. Query Recent Runs (up to 200)
  const { data: rawRuns, error: runsError } = await supabase
    .from('runs')
    .select('*')
    .eq('org_id', orgId)
    .order('run_at', { ascending: false })
    .limit(200);

  if (runsError) {
    console.error('[GEO_DATA] Error fetching runs:', runsError);
  }

  const runList = (rawRuns || []) as Run[];

  // 4. Query Mentions for these runs
  const runIds = runList.map((r) => r.id);
  let mentionList: Mention[] = [];

  if (runIds.length > 0) {
    const { data: rawMentions, error: mentionsError } = await supabase
      .from('mentions')
      .select('*')
      .eq('org_id', orgId)
      .in('run_id', runIds);

    if (mentionsError) {
      console.error('[GEO_DATA] Error fetching mentions:', mentionsError);
    }
    mentionList = (rawMentions || []) as Mention[];
  }

  // 5. Compute Metrics (only ok runs contribute to percentage metrics)
  const okRuns = runList.filter((r) => r.status !== 'error');
  const totalRuns = okRuns.length;
  let selfMentionsCount = 0;
  let competitorMentionsCount = 0;
  let topCitationsCount = 0;
  const domainCitationCounts = new Map<string, number>();

  const selfBrandId = selfBrand?.id;

  for (const m of mentionList) {
    if (selfBrandId && m.brand_id === selfBrandId) {
      if (m.mentioned) selfMentionsCount++;
      if (m.cited) {
        topCitationsCount++;
        const domain = extractDomainFromUrl(m.citation_url);
        if (domain) {
          domainCitationCounts.set(domain, (domainCitationCounts.get(domain) || 0) + 1);
        }
      }
    } else if (m.mentioned) {
      competitorMentionsCount++;
    }

    // Also collect cited domains from any citation_url
    if (m.cited && m.citation_url) {
      const domain = extractDomainFromUrl(m.citation_url);
      if (domain && (!selfBrand?.domain || !domain.includes(selfBrand.domain))) {
        domainCitationCounts.set(domain, (domainCitationCounts.get(domain) || 0) + 1);
      }
    }
  }

  const brandMentionRate = totalRuns > 0 ? Math.round((selfMentionsCount / totalRuns) * 100) : 0;
  const totalMentions = selfMentionsCount + competitorMentionsCount;
  const shareOfVoice = totalMentions > 0 ? Math.round((selfMentionsCount / totalMentions) * 100) : 0;

  const sortedDomains = Array.from(domainCitationCounts.entries())
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const metrics: GeoWorkspaceMetrics = {
    totalRuns,
    brandMentionRate,
    shareOfVoice,
    topCitationsCount,
    topCitedDomains: sortedDomains,
    lastAuditedAt: runList.length > 0 ? runList[0].run_at : null,
  };

  // 5b. Compute Visibility Trend (daily time-series — the accumulated-history moat)
  // Bucket successful runs + their mentions by UTC calendar day.
  const runDayById = new Map<string, string>();
  const dayBuckets = new Map<
    string,
    { runs: number; selfMentions: number; competitorMentions: number }
  >();

  for (const r of okRuns) {
    const day = r.run_at.slice(0, 10); // run_at is ISO → YYYY-MM-DD
    runDayById.set(r.id, day);
    const bucket = dayBuckets.get(day) || { runs: 0, selfMentions: 0, competitorMentions: 0 };
    bucket.runs++;
    dayBuckets.set(day, bucket);
  }

  for (const m of mentionList) {
    const day = runDayById.get(m.run_id);
    if (!day) continue; // mention belongs to an error/absent run
    const bucket = dayBuckets.get(day);
    if (!bucket) continue;
    if (selfBrandId && m.brand_id === selfBrandId) {
      if (m.mentioned) bucket.selfMentions++;
    } else if (m.mentioned) {
      bucket.competitorMentions++;
    }
  }

  const visibilityTrend: VisibilityTrendPoint[] = Array.from(dayBuckets.entries())
    .map(([date, b]) => {
      const mentionRate = b.runs > 0 ? Math.round((b.selfMentions / b.runs) * 100) : 0;
      const totalDayMentions = b.selfMentions + b.competitorMentions;
      const shareOfVoice =
        totalDayMentions > 0 ? Math.round((b.selfMentions / totalDayMentions) * 100) : 0;
      return { date, mentionRate, shareOfVoice, runs: b.runs };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  // 6. Compute Per-Prompt Summaries
  const promptSummaries: Record<string, PromptAuditSummary> = {};
  const mentionsByRunId = new Map<string, Mention[]>();

  for (const m of mentionList) {
    const list = mentionsByRunId.get(m.run_id) || [];
    list.push(m);
    mentionsByRunId.set(m.run_id, list);
  }

  for (const prompt of promptList) {
    // Find latest run for this prompt
    const latestRun = runList.find((r) => r.prompt_id === prompt.id);

    if (!latestRun) {
      promptSummaries[prompt.id] = {
        promptId: prompt.id,
        lastRunAt: null,
        selfMentioned: null,
        selfPosition: null,
        selfCited: null,
        competitorMentionsCount: 0,
        topCompetitorName: null,
        topCompetitorPosition: null,
        statusSummary: null,
      };
      continue;
    }

    if (latestRun.status === 'error') {
      promptSummaries[prompt.id] = {
        promptId: prompt.id,
        lastRunAt: latestRun.run_at,
        selfMentioned: null,
        selfPosition: null,
        selfCited: null,
        competitorMentionsCount: 0,
        topCompetitorName: null,
        topCompetitorPosition: null,
        statusSummary: `Error: ${latestRun.error || 'Audit failed'}`,
      };
      continue;
    }

    const runMentions = mentionsByRunId.get(latestRun.id) || [];
    const selfM = selfBrandId ? runMentions.find((m) => m.brand_id === selfBrandId) : null;
    const compMentions = runMentions
      .filter((m) => m.brand_id !== selfBrandId && m.mentioned)
      .sort((a, b) => (a.position || 99) - (b.position || 99));

    const topComp = compMentions[0];
    const topCompBrand = topComp && topComp.brand_id ? brandMap.get(topComp.brand_id) : null;

    let summaryText = '';
    if (selfBrand) {
      if (selfM?.mentioned) {
        summaryText = `${selfBrand.name}: #${selfM.position || 1}`;
      } else {
        summaryText = `${selfBrand.name}: not mentioned`;
      }
    }

    if (topCompBrand) {
      summaryText += ` · ${topCompBrand.name}: #${topComp.position || 1}`;
    }

    promptSummaries[prompt.id] = {
      promptId: prompt.id,
      lastRunAt: latestRun.run_at,
      selfMentioned: selfM ? selfM.mentioned : false,
      selfPosition: selfM ? selfM.position : null,
      selfCited: selfM ? selfM.cited : false,
      competitorMentionsCount: compMentions.length,
      topCompetitorName: topCompBrand ? topCompBrand.name : null,
      topCompetitorPosition: topComp ? topComp.position : null,
      statusSummary: summaryText || null,
    };
  }

  const enrichedRecentRuns = runList.slice(0, 15).map((r) => ({
    ...r,
    promptText: promptMap.get(r.prompt_id)?.text,
  }));

  // 6b. Visibility Changes — diff the self-brand's standing between the two most
  // recent audits of each prompt ("did the AI change its mind about me?"). Uses
  // mentionsByRunId (built above) and runList (already sorted newest-first).
  const visibilityChanges: VisibilityChange[] = [];
  if (selfBrandId) {
    const okRunsByPrompt = new Map<string, Run[]>();
    for (const r of runList) {
      if (r.status === 'error') continue;
      const arr = okRunsByPrompt.get(r.prompt_id) || [];
      arr.push(r); // runList is desc, so arr[0] is newest
      okRunsByPrompt.set(r.prompt_id, arr);
    }

    const selfStandingOf = (runId: string) => {
      const ms = mentionsByRunId.get(runId) || [];
      const sm = ms.find((m) => m.brand_id === selfBrandId);
      return { mentioned: !!sm?.mentioned, position: sm?.position ?? null, cited: !!sm?.cited };
    };

    for (const [promptId, runs] of okRunsByPrompt.entries()) {
      if (runs.length < 2) continue; // need a prior audit to diff against
      const latest = runs[0];
      const prev = runs[1];
      const cur = selfStandingOf(latest.id);
      const old = selfStandingOf(prev.id);
      const promptText = promptMap.get(promptId)?.text || 'Query';
      const base = { promptId, promptText, changedAt: latest.run_at };

      if (cur.mentioned && !old.mentioned) {
        visibilityChanges.push({ ...base, kind: 'gained_mention', detail: `Now mentioned${cur.position ? ` at #${cur.position}` : ''} — was absent before`, prevPosition: null, newPosition: cur.position });
      } else if (!cur.mentioned && old.mentioned) {
        visibilityChanges.push({ ...base, kind: 'lost_mention', detail: `Dropped from the answer — was ${old.position ? `#${old.position}` : 'mentioned'} before`, prevPosition: old.position, newPosition: null });
      } else if (cur.mentioned && old.mentioned && cur.position && old.position && cur.position !== old.position) {
        const up = cur.position < old.position;
        visibilityChanges.push({ ...base, kind: up ? 'position_up' : 'position_down', detail: `Moved ${up ? 'up' : 'down'} from #${old.position} to #${cur.position}`, prevPosition: old.position, newPosition: cur.position });
      }

      if (cur.cited && !old.cited) {
        visibilityChanges.push({ ...base, kind: 'gained_citation', detail: 'Your site is now cited as a source' });
      } else if (!cur.cited && old.cited) {
        visibilityChanges.push({ ...base, kind: 'lost_citation', detail: 'Your site is no longer cited as a source' });
      }
    }

    visibilityChanges.sort((a, b) => b.changedAt.localeCompare(a.changedAt));
  }

  // 7. Citation Source Intelligence — which sources the AI pulls from
  const citationIntelligence = computeCitationIntelligence(okRuns, selfBrand?.domain);

  // 8. Sentiment & Positioning — how the AI talks about the self brand + rank depth
  let sentPositive = 0;
  let sentNeutral = 0;
  let sentNegative = 0;
  let positionSum = 0;
  let positionCount = 0;
  let bestPosition: number | null = null;
  for (const m of mentionList) {
    if (!selfBrandId || m.brand_id !== selfBrandId || !m.mentioned) continue;
    const s = (m.sentiment || 'neutral').toLowerCase();
    if (s === 'positive') sentPositive++;
    else if (s === 'negative') sentNegative++;
    else sentNeutral++;
    if (typeof m.position === 'number' && m.position > 0) {
      positionSum += m.position;
      positionCount++;
      if (bestPosition === null || m.position < bestPosition) bestPosition = m.position;
    }
  }
  const totalSelfMentions = sentPositive + sentNeutral + sentNegative;
  const dominant: 'positive' | 'neutral' | 'negative' | null =
    totalSelfMentions === 0
      ? null
      : sentNegative > sentPositive && sentNegative >= sentNeutral
      ? 'negative'
      : sentPositive >= sentNeutral && sentPositive >= sentNegative
      ? 'positive'
      : 'neutral';
  const sentimentPositioning: SentimentPositioning = {
    totalMentions: totalSelfMentions,
    positive: sentPositive,
    neutral: sentNeutral,
    negative: sentNegative,
    positivePct: totalSelfMentions > 0 ? Math.round((sentPositive / totalSelfMentions) * 100) : 0,
    dominant,
    avgPosition: positionCount > 0 ? Math.round((positionSum / positionCount) * 10) / 10 : null,
    bestPosition,
  };

  return {
    selfBrand,
    competitors,
    prompts: promptList,
    metrics,
    promptSummaries,
    recentRuns: enrichedRecentRuns,
    visibilityTrend,
    citationIntelligence,
    visibilityChanges: visibilityChanges.slice(0, 10),
    sentimentPositioning,
  };
}
