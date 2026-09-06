export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  companyName?: string;
  organizationId: string;
  organizationName: string;
  role: 'owner' | 'admin' | 'member';
  createdAt: string;
}

export type EngineType = 'openai' | 'perplexity' | 'google_ai' | 'gemini' | 'groq' | 'nvidia';

export interface Brand {
  id: string;
  org_id: string;
  name: string;
  domain: string | null;
  is_self: boolean;
  aliases: string[];
  created_at: string;
  updated_at: string;
}

export interface Prompt {
  id: string;
  org_id: string;
  text: string;
  topic: string | null;
  locale: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Run {
  id: string;
  org_id: string;
  prompt_id: string;
  engine: EngineType;
  run_at: string;
  model: string | null;
  raw_response: string | null;
  cost_usd: number | null;
  status: 'ok' | 'error';
  error: string | null;
  citations?: CitationItem[] | null;
  created_at: string;
  updated_at: string;
}

export interface Mention {
  id: string;
  org_id: string;
  run_id: string;
  brand_id: string | null;
  mentioned: boolean;
  position: number | null;
  cited: boolean;
  citation_url: string | null;
  sentiment: string | null;
  snippet: string | null;
  created_at: string;
  updated_at: string;
}

export interface OnboardingPayload {
  selfBrand: {
    name: string;
    domain: string;
    aliases?: string[];
  };
  competitors: Array<{
    name: string;
    domain?: string;
  }>;
  prompts: Array<{
    text: string;
    topic?: string;
    locale?: string;
  }>;
}

export interface CitationItem {
  url: string;
  title?: string;
}

export interface EngineRunResult {
  model: string;
  rawResponse: string;
  citations: CitationItem[];
  costUsd?: number;
}

export interface BrandMentionExtraction {
  brand_id: string;
  brand_name: string;
  is_self: boolean;
  mentioned: boolean;
  position: number | null;
  cited: boolean;
  citation_url: string | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  snippet: string | null;
}

export interface PromptAuditSummary {
  promptId: string;
  lastRunAt: string | null;
  selfMentioned: boolean | null;
  selfPosition: number | null;
  selfCited: boolean | null;
  competitorMentionsCount: number;
  topCompetitorName: string | null;
  topCompetitorPosition: number | null;
  statusSummary: string | null;
}

export interface VisibilityTrendPoint {
  date: string; // YYYY-MM-DD (UTC day bucket)
  mentionRate: number; // 0 - 100 %
  shareOfVoice: number; // 0 - 100 %
  runs: number; // successful audit runs that day
}

export interface GeoWorkspaceMetrics {
  totalRuns: number;
  brandMentionRate: number; // 0 - 100 %
  shareOfVoice: number; // 0 - 100 %
  topCitationsCount: number;
  topCitedDomains: Array<{ domain: string; count: number }>;
  lastAuditedAt: string | null;
}

/** One source the AI cited (aggregated across audit runs). */
export interface CitationSource {
  label: string; // display name — the grounding title, else the domain
  domain: string | null;
  url: string; // a representative citation URL
  count: number; // how many times this source was cited across runs
  isSelf: boolean; // matches the self-brand domain (you're already there)
}

/**
 * Citation Source Intelligence — which web sources the AI pulls from when
 * answering the org's buyer prompts, and whether the brand appears among them.
 * The actionable output: "get listed on the sources where you're missing."
 */
export interface CitationIntelligence {
  totalCitations: number; // total citation instances across runs
  uniqueSources: number;
  runsWithCitations: number;
  selfSourceCount: number; // # of cited sources that are the self brand
  sources: CitationSource[]; // top sources, ranked by frequency
}

/**
 * How the AI talks about the brand when it mentions it — sentiment mix +
 * ranking depth. Answers "am I described well, and where do I land?"
 */
export interface SentimentPositioning {
  totalMentions: number; // self-brand mentions analyzed
  positive: number;
  neutral: number;
  negative: number;
  positivePct: number; // 0-100 of analyzed mentions
  dominant: 'positive' | 'neutral' | 'negative' | null;
  avgPosition: number | null; // average rank when mentioned (1 = best)
  bestPosition: number | null; // best (lowest) rank achieved
}

export type VisibilityChangeKind =
  | 'gained_mention'
  | 'lost_mention'
  | 'position_up'
  | 'position_down'
  | 'gained_citation'
  | 'lost_citation';

/**
 * A detected change in the brand's standing between the two most recent audits
 * of a prompt — the "did the AI change its mind about me?" signal (the moat).
 */
export interface VisibilityChange {
  promptId: string;
  promptText: string;
  changedAt: string; // run_at of the newer audit
  kind: VisibilityChangeKind;
  detail: string;
  prevPosition?: number | null;
  newPosition?: number | null;
}
