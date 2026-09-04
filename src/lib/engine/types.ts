export interface Project {
  id: string;
  org_id: string;
  name: string;
  brand_name: string;
  brand_domain: string;
  created_at: string;
}

export interface TrackedQuery {
  id: string;
  project_id: string;
  query_text: string;
  created_at: string;
}

export interface Competitor {
  id: string;
  project_id: string;
  name: string;
  created_at: string;
}

export interface CompetitorMention {
  name: string;
  rank: number | null;
  mentioned: boolean;
}

export interface QuerySample {
  sampleIndex: number;
  rawAnswer: string;
  brandMentioned: boolean;
  brandRank: number | null;
  competitorsFound: CompetitorMention[];
  sources: string[];
  score: number;
}

export interface ScanResult {
  id: string;
  scan_id: string;
  query_id?: string | null;
  query_text: string;
  engine: string;
  brand_mentioned: boolean;
  brand_rank: number | null;
  competitors_found: CompetitorMention[];
  sources: string[];
  visibility_score: number;
  raw_answer: string;
  sample_count: number;
  samples_json: QuerySample[];
  created_at: string;
}

export interface CompetitorShare {
  name: string;
  mentionsCount: number;
  shareOfVoice: number;
}

export interface ProjectScanSummary {
  totalQueries: number;
  overallVisibilityScore: number;
  brandMentionRate: number;
  shareOfVoice: number;
  competitorBreakdown: CompetitorShare[];
  engine: string;
  scannedAt: string;
}

export interface Scan {
  id: string;
  project_id: string;
  engine: string;
  status: 'running' | 'done' | 'failed';
  started_at: string;
  finished_at?: string | null;
  summary_json: ProjectScanSummary;
}

export interface AiSearchEngine {
  name: string;
  displayName: string;
  sampleQuery(queryText: string): Promise<{ rawAnswer: string; sources: string[] }>;
}
