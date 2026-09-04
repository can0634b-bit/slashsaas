import { CompetitorMention, CompetitorShare, ProjectScanSummary, ScanResult } from './types';

export interface QueryDiff {
  queryId?: string | null;
  queryText: string;
  previousScore: number | null;
  currentScore: number;
  scoreDelta: number;
  previousRank: number | null;
  currentRank: number | null;
  rankDelta: number | null; // e.g. +2 means improved by 2 positions (from #3 to #1), -3 means dropped 3 positions
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

/**
 * Computes deterministic diff between current scan and the immediately preceding scan.
 */
export function computeScanDiff(
  currentSummary: ProjectScanSummary,
  currentResults: Array<Omit<ScanResult, 'id' | 'scan_id' | 'created_at'>>,
  previousScan: { id: string; created_at: string; summary_json?: any; overall_score?: number } | null,
  previousResults: Array<{
    query_id?: string | null;
    query_text: string;
    brand_mentioned: boolean;
    brand_rank: number | null;
    visibility_score: number;
    competitors_found?: any;
  }> = []
): ScanDiff {
  // If there is no prior scan, mark as initial baseline
  if (!previousScan) {
    return {
      isBaseline: true,
      previousScanId: null,
      previousScanDate: null,
      overallScoreDelta: 0,
      mentionRateDelta: 0,
      shareOfVoiceDelta: 0,
      queriesGainedCount: 0,
      queriesLostCount: 0,
      ranksImprovedCount: 0,
      ranksDroppedCount: 0,
      newCompetitorsDetected: [],
      isSignificantDrop: false,
      queryDiffs: currentResults.map((curr) => ({
        queryId: curr.query_id,
        queryText: curr.query_text,
        previousScore: null,
        currentScore: curr.visibility_score,
        scoreDelta: 0,
        previousRank: null,
        currentRank: curr.brand_rank,
        rankDelta: null,
        statusChange: curr.brand_mentioned ? 'gained_mention' : 'still_unmentioned',
        newCompetitors: [],
        droppedCompetitors: [],
      })),
      competitorShifts: (currentSummary.competitorBreakdown || []).map((c) => ({
        name: c.name,
        previousSoV: 0,
        currentSoV: c.shareOfVoice,
        sovDelta: 0,
        isNewEmergence: false,
      })),
    };
  }

  const prevSummary: ProjectScanSummary = previousScan.summary_json || {};
  const prevOverall = typeof prevSummary.overallVisibilityScore === 'number'
    ? prevSummary.overallVisibilityScore
    : typeof previousScan.overall_score === 'number'
    ? previousScan.overall_score
    : 0;

  const prevMentionRate = prevSummary.brandMentionRate || 0;
  const prevSoV = prevSummary.shareOfVoice || 0;

  // 1. Metric deltas
  const overallScoreDelta = Math.round((currentSummary.overallVisibilityScore - prevOverall) * 10) / 10;
  const mentionRateDelta = currentSummary.brandMentionRate - prevMentionRate;
  const shareOfVoiceDelta = currentSummary.shareOfVoice - prevSoV;

  // 2. Map previous results by query_text or query_id for fast lookup
  const prevResultsMap = new Map<string, typeof previousResults[0]>();
  previousResults.forEach((pr) => {
    if (pr.query_id) prevResultsMap.set(pr.query_id, pr);
    prevResultsMap.set(pr.query_text.trim().toLowerCase(), pr);
  });

  let queriesGained = 0;
  let queriesLost = 0;
  let ranksImproved = 0;
  let ranksDropped = 0;

  // 3. Compute per-query diffs
  const queryDiffs: QueryDiff[] = currentResults.map((curr) => {
    const prev = (curr.query_id && prevResultsMap.get(curr.query_id)) ||
      prevResultsMap.get(curr.query_text.trim().toLowerCase());

    const prevScore = prev ? prev.visibility_score : null;
    const scoreDelta = prevScore !== null ? Math.round((curr.visibility_score - prevScore) * 10) / 10 : 0;

    const prevRank = prev ? prev.brand_rank : null;
    const currRank = curr.brand_rank;

    let rankDelta: number | null = null;
    if (prevRank !== null && currRank !== null) {
      // Lower number is better rank: e.g. from 3 to 1 => 3 - 1 = +2 (improved)
      rankDelta = prevRank - currRank;
      if (rankDelta > 0) ranksImproved += 1;
      else if (rankDelta < 0) ranksDropped += 1;
    } else if (prevRank === null && currRank !== null) {
      // Gained a ranking position
      rankDelta = 1;
      ranksImproved += 1;
    } else if (prevRank !== null && currRank === null) {
      // Lost ranking position
      rankDelta = -1;
      ranksDropped += 1;
    }

    // Status change
    let statusChange: QueryDiff['statusChange'] = 'still_unmentioned';
    const prevMentioned = prev ? Boolean(prev.brand_mentioned) : false;
    const currMentioned = Boolean(curr.brand_mentioned);

    if (!prevMentioned && currMentioned) {
      statusChange = 'gained_mention';
      queriesGained += 1;
    } else if (prevMentioned && !currMentioned) {
      statusChange = 'lost_mention';
      queriesLost += 1;
    } else if (prevMentioned && currMentioned) {
      statusChange = 'retained_mention';
    } else {
      statusChange = 'still_unmentioned';
    }

    // Competitor changes on this query
    const currComps = (curr.competitors_found || [])
      .filter((c: any) => (typeof c === 'string' ? true : c.mentioned))
      .map((c: any) => (typeof c === 'string' ? c : c.name));

    const prevCompsRaw = prev?.competitors_found || [];
    const prevComps = (Array.isArray(prevCompsRaw) ? prevCompsRaw : [])
      .filter((c: any) => (typeof c === 'string' ? true : c.mentioned))
      .map((c: any) => (typeof c === 'string' ? c : c.name));

    const newCompetitors = currComps.filter((c) => !prevComps.includes(c));
    const droppedCompetitors = prevComps.filter((c: string) => !currComps.includes(c));

    return {
      queryId: curr.query_id,
      queryText: curr.query_text,
      previousScore: prevScore,
      currentScore: curr.visibility_score,
      scoreDelta,
      previousRank: prevRank,
      currentRank: currRank,
      rankDelta,
      statusChange,
      newCompetitors,
      droppedCompetitors,
    };
  });

  // 4. Competitor shifts
  const prevCompetitorMap = new Map<string, number>();
  (prevSummary.competitorBreakdown || []).forEach((c) => {
    prevCompetitorMap.set(c.name.toLowerCase(), c.shareOfVoice);
  });

  const allDetectedNewCompetitors = new Set<string>();

  const competitorShifts: CompetitorShift[] = (currentSummary.competitorBreakdown || []).map((curr) => {
    const prevSov = prevCompetitorMap.get(curr.name.toLowerCase()) || 0;
    const isNew = !prevCompetitorMap.has(curr.name.toLowerCase()) && curr.mentionsCount > 0;
    if (isNew) allDetectedNewCompetitors.add(curr.name);

    return {
      name: curr.name,
      previousSoV: prevSov,
      currentSoV: curr.shareOfVoice,
      sovDelta: curr.shareOfVoice - prevSov,
      isNewEmergence: isNew,
    };
  });

  // Check if significant drop occurred (>= 10 pts drop, or loss of multiple queries)
  const isSignificantDrop = overallScoreDelta <= -10 || queriesLost > 0;

  return {
    isBaseline: false,
    previousScanId: previousScan.id,
    previousScanDate: previousScan.created_at,
    overallScoreDelta,
    mentionRateDelta,
    shareOfVoiceDelta,
    queriesGainedCount: queriesGained,
    queriesLostCount: queriesLost,
    ranksImprovedCount: ranksImproved,
    ranksDroppedCount: ranksDropped,
    newCompetitorsDetected: Array.from(allDetectedNewCompetitors),
    isSignificantDrop,
    queryDiffs,
    competitorShifts,
  };
}
