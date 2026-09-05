import { createClient } from './server';
import { getOrCreateUserOrganization, Organization } from './organizations';
import {
  Brand,
  Prompt,
  Run,
  Mention,
  GeoWorkspaceMetrics,
  PromptAuditSummary,
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

  return {
    selfBrand,
    competitors,
    prompts: promptList,
    metrics,
    promptSummaries,
    recentRuns: enrichedRecentRuns,
  };
}
