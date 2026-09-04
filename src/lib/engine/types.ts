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

export interface QueryDiff {
  queryId?: string | null;
  queryText: string;
  previousScore: number | null;
  currentScore: number;
  scoreDelta: number;
  previousRank: number | null;
  currentRank: number | null;
  rankDelta: number | null;
  statusChange: 'gained_mention' | 'lost_mention' | 'retained_mention' | 'still_unmentioned';
  newCompetitors: string[];
  droppedCompetitors: string[];
}

export interface CompetitorShift {
  name: string;
  previousSoV: number;
  currentSoV: number;
  sovDelta: number;
  isNewEmergence: boolean;
}

export interface ScanDiff {
  isBaseline: boolean;
  previousScanId: string | null;
  previousScanDate: string | null;
  overallScoreDelta: number;
  mentionRateDelta: number;
  shareOfVoiceDelta: number;
  queriesGainedCount: number;
  queriesLostCount: number;
  ranksImprovedCount: number;
  ranksDroppedCount: number;
  newCompetitorsDetected: string[];
  isSignificantDrop: boolean;
  queryDiffs: QueryDiff[];
  competitorShifts: CompetitorShift[];
}

export interface ProjectScanSummary {
  totalQueries: number;
  overallVisibilityScore: number;
  brandMentionRate: number;
  shareOfVoice: number;
  competitorBreakdown: CompetitorShare[];
  engine: string;
  scannedAt: string;
  diff?: ScanDiff;
}

export interface Scan {
  id: string;
  project_id: string;
  engine: string;
  status: 'running' | 'done' | 'failed';
  overall_score?: number | null;
  brand_mention_rate?: number | null;
  share_of_voice?: number | null;
  error_message?: string | null;
  started_at: string;
  finished_at?: string | null;
  created_at: string;
  summary_json: ProjectScanSummary;
}

export interface AiSearchEngine {
  name: string;
  displayName: string;
  sampleQuery(queryText: string): Promise<{ rawAnswer: string; sources: string[] }>;
}
