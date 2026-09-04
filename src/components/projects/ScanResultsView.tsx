'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Percent,
  TrendingUp,
  TrendingDown,
  Award,
  Globe,
  Users,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertTriangle,
  History,
  Radio,
} from 'lucide-react';
import { TrendChart } from './TrendChart';
import { ScanDiff } from '@/lib/engine/types';

interface CompetitorMention {
  name: string;
  mentioned: boolean;
  rank?: number | null;
}

interface QuerySample {
  sampleIndex: number;
  rawAnswer: string;
  brandMentioned: boolean;
  brandRank: number | null;
  competitorsFound?: CompetitorMention[];
  sources?: string[];
  score?: number;
}

interface ScanResult {
  id: string;
  query_id?: string | null;
  query_text: string;
  brand_mentioned: boolean;
  brand_rank: number | null;
  visibility_score: number;
  competitors_found?: CompetitorMention[] | string[];
  sources?: string[];
  sources_cited?: string[];
  raw_answer: string;
  samples_json?: QuerySample[];
  samples_data?: QuerySample[];
  created_at: string;
}

interface Scan {
  id: string;
  status: string;
  overall_score?: number | null;
  brand_mention_rate?: number | null;
  share_of_voice?: number | null;
  engine?: string;
  engine_name?: string;
  created_at: string;
  summary_json?: any;
  error_message?: string | null;
}

interface ScanResultsViewProps {
  scan: Scan | null;
  results: ScanResult[];
  brandName: string;
  historyScans?: Scan[];
}

export const ScanResultsView: React.FC<ScanResultsViewProps> = ({
  scan,
  results,
  brandName,
  historyScans = [],
}) => {
  const [expandedQueryId, setExpandedQueryId] = useState<string | null>(null);
  const [selectedSampleMap, setSelectedSampleMap] = useState<Record<string, number>>({});

  if (!scan) {
    return (
      <div className="rounded-3xl border border-white/10 bg-zinc-950/40 p-12 text-center backdrop-blur-xl space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-500">
          <Sparkles className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-bold text-white">No Scan Results Yet</h4>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          Run your first AI visibility scan above to see how Google Gemini perceives and recommends{' '}
          <span className="text-white font-medium">{brandName}</span>.
        </p>
      </div>
    );
  }

  // Calculate scores gracefully whether stored as integer (80) or ratio (0.8)
  const rawOverall = scan.overall_score ?? scan.summary_json?.overallVisibilityScore ?? 0;
  const overallScore = Math.round(rawOverall);

  const rawMentionRate = scan.brand_mention_rate ?? scan.summary_json?.brandMentionRate ?? 0;
  const mentionRate = Math.round(rawMentionRate > 1 ? rawMentionRate : rawMentionRate * 100);

  const rawSoV = scan.share_of_voice ?? scan.summary_json?.shareOfVoice ?? 0;
  const shareOfVoice = Math.round(rawSoV > 1 ? rawSoV : rawSoV * 100);

  // Extract Diff Data if present
  const diff: ScanDiff | undefined = scan.summary_json?.diff;

  const getScoreRating = (score: number) => {
    if (score >= 80) return { label: 'Dominant Visibility', color: 'text-[#8ce04a] bg-[#8ce04a]/15 border-[#8ce04a]/30' };
    if (score >= 50) return { label: 'Moderate Presence', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };
    if (score >= 20) return { label: 'Low Visibility', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };
    return { label: 'Invisible in AI Search', color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' };
  };

  const scoreRating = getScoreRating(overallScore);

  const toggleExpand = (id: string) => {
    setExpandedQueryId((prev) => (prev === id ? null : id));
  };

  const setSampleIndex = (queryId: string, index: number) => {
    setSelectedSampleMap((prev) => ({ ...prev, [queryId]: index }));
  };

  // Helper for delta badge
  const renderDelta = (delta: number | undefined, isPercentage = false) => {
    if (delta === undefined || diff?.isBaseline) {
      return (
        <span className="inline-flex items-center gap-0.5 rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono text-zinc-400">
          <Radio className="h-2.5 w-2.5 text-zinc-500" />
          <span>Baseline</span>
        </span>
      );
    }

    if (delta > 0) {
      return (
        <span className="inline-flex items-center gap-0.5 rounded-md border border-[#8ce04a]/30 bg-[#8ce04a]/10 px-2 py-0.5 text-[10px] font-mono font-bold text-[#8ce04a]">
          <ArrowUpRight className="h-3 w-3" />
          <span>+{delta}{isPercentage ? '%' : ' pts'}</span>
        </span>
      );
    }

    if (delta < 0) {
      return (
        <span className="inline-flex items-center gap-0.5 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-400">
          <ArrowDownRight className="h-3 w-3" />
          <span>{delta}{isPercentage ? '%' : ' pts'}</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-0.5 rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono text-zinc-400">
        <Minus className="h-2.5 w-2.5" />
        <span>No change</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Historical Trend Chart (Recharts) */}
      {historyScans && historyScans.length >= 2 && (
        <TrendChart scans={historyScans} brandName={brandName} />
      )}

      {/* Critical Movement Alert Banner if Drop Detected */}
      {diff && !diff.isBaseline && diff.isSignificantDrop && (
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 backdrop-blur-xl flex items-start gap-3.5 text-xs text-amber-200">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-100">
              Significant Visibility Drop Detected ({diff.overallScoreDelta} pts vs. previous run)
            </p>
            <p className="text-zinc-400 leading-relaxed">
              Google Gemini changed recommendations across {diff.queriesLostCount} tracked prompts. Review the query breakdowns below to see where positions shifted.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Row with Deltas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overall Score */}
        <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6 backdrop-blur-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-semibold uppercase tracking-wider font-mono text-[10px]">Overall GEO Score</span>
            {renderDelta(diff?.overallScoreDelta)}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              {overallScore}
            </span>
            <span className="text-xs text-zinc-500 font-mono">/ 100</span>
          </div>
          <span className={`inline-block rounded-lg border px-2.5 py-1 text-[10px] font-bold ${scoreRating.color}`}>
            {scoreRating.label}
          </span>
        </div>

        {/* Brand Mention Rate */}
        <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6 backdrop-blur-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-semibold uppercase tracking-wider font-mono text-[10px]">Brand Mention Rate</span>
            {renderDelta(diff?.mentionRateDelta, true)}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              {mentionRate}%
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            {results.filter((r) => r.brand_mentioned).length} of {results.length} queries mentioned {brandName}
          </p>
        </div>

        {/* Share of Voice */}
        <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6 backdrop-blur-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-semibold uppercase tracking-wider font-mono text-[10px]">Share of Voice</span>
            {renderDelta(diff?.shareOfVoiceDelta, true)}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              {shareOfVoice}%
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Total share of brand citations vs. detected competitors
          </p>
        </div>
      </div>

      {/* Diff / Movement Summary Bar if not baseline */}
      {diff && !diff.isBaseline && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs flex flex-wrap items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[#8ce04a]" />
            <span className="font-bold text-white">Movement vs Previous Run:</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-zinc-400 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">Ranks Improved:</span>
              <span className="text-[#8ce04a] font-bold">+{diff.ranksImprovedCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">Ranks Dropped:</span>
              <span className={diff.ranksDroppedCount > 0 ? 'text-rose-400 font-bold' : 'text-zinc-400'}>
                -{diff.ranksDroppedCount}
              </span>
            </div>
            {diff.newCompetitorsDetected && diff.newCompetitorsDetected.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 font-semibold">New Competitor Emerged:</span>
                <span className="text-white">{diff.newCompetitorsDetected.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Header & Scan Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Query-Level Visibility Breakdown</h3>
          <p className="text-xs text-zinc-400">
            Tested across 3 non-deterministic engine runs per prompt • Engine: Google Gemini 2.5
          </p>
        </div>
        <div className="text-[11px] font-mono text-zinc-500">
          Last scan: {new Date(scan.created_at).toLocaleString()}
        </div>
      </div>

      {/* Per-Query Cards */}
      <div className="space-y-4">
        {results.map((result) => {
          const isExpanded = expandedQueryId === result.id;
          const currentSampleIdx = selectedSampleMap[result.id] || 0;
          
          const samples = (result.samples_json && result.samples_json.length > 0)
            ? result.samples_json
            : (result.samples_data && result.samples_data.length > 0)
            ? result.samples_data
            : [
                {
                  sampleIndex: 0,
                  rawAnswer: result.raw_answer,
                  brandMentioned: result.brand_mentioned,
                  brandRank: result.brand_rank,
                  competitorsFound: Array.isArray(result.competitors_found)
                    ? (result.competitors_found as any[]).map((c) =>
                        typeof c === 'string' ? { name: c, mentioned: true, rank: null } : c
                      )
                    : [],
                  sources: result.sources || result.sources_cited || [],
                },
              ];

          const activeSample = samples[currentSampleIdx] || samples[0];

          // Check query diff item if available
          const queryDiff = diff?.queryDiffs?.find(
            (qd) => qd.queryId === result.query_id || qd.queryText.trim().toLowerCase() === result.query_text.trim().toLowerCase()
          );

          // Normalize competitors list
          const competitorList: CompetitorMention[] = Array.isArray(result.competitors_found)
            ? (result.competitors_found as any[]).map((c) =>
                typeof c === 'string' ? { name: c, mentioned: true, rank: null } : c
              )
            : [];
          const mentionedCompetitors = competitorList.filter((c) => c.mentioned);

          // Normalize sources
          const sourcesList: string[] = result.sources || result.sources_cited || [];

          return (
            <div
              key={result.id}
              className="rounded-3xl border border-white/10 bg-zinc-950/70 overflow-hidden backdrop-blur-xl transition-all"
            >
              {/* Summary Bar */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5">
                      {result.brand_mentioned ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8ce04a]/20 text-[#8ce04a] shrink-0 border border-[#8ce04a]/30">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 shrink-0 border border-white/10">
                          <XCircle className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm font-semibold text-white break-words">
                        "{result.query_text}"
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {result.brand_mentioned ? (
                          <span className="rounded-lg bg-[#8ce04a]/15 text-[#8ce04a] border border-[#8ce04a]/30 px-2.5 py-0.5 font-semibold text-[10px]">
                            Mentioned {result.brand_rank ? `• Rank #${result.brand_rank}` : '• Listed'}
                          </span>
                        ) : (
                          <span className="rounded-lg bg-zinc-800 text-zinc-400 border border-white/10 px-2.5 py-0.5 font-semibold text-[10px]">
                            Not Mentioned
                          </span>
                        )}

                        {/* Rank Shift Badge */}
                        {queryDiff && !diff?.isBaseline && queryDiff.rankDelta !== null && queryDiff.rankDelta !== 0 && (
                          <span
                            className={`rounded-lg px-2 py-0.5 text-[10px] font-mono font-bold flex items-center gap-0.5 border ${
                              queryDiff.rankDelta > 0
                                ? 'bg-[#8ce04a]/10 text-[#8ce04a] border-[#8ce04a]/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {queryDiff.rankDelta > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            <span>
                              {queryDiff.rankDelta > 0
                                ? `Rank +${queryDiff.rankDelta} pos`
                                : `Rank ${queryDiff.rankDelta} pos`}
                            </span>
                          </span>
                        )}

                        {/* Status Change Tag */}
                        {queryDiff && !diff?.isBaseline && queryDiff.statusChange === 'gained_mention' && (
                          <span className="rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold">
                            + Newly Mentioned
                          </span>
                        )}
                        {queryDiff && !diff?.isBaseline && queryDiff.statusChange === 'lost_mention' && (
                          <span className="rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 text-[10px] font-semibold">
                            - Lost Visibility
                          </span>
                        )}

                        <span className="text-zinc-500 font-mono text-[11px]">
                          Score: {Math.round(result.visibility_score)}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleExpand(result.id)}
                    className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors shrink-0"
                  >
                    <FileText className="h-3.5 w-3.5 text-[#8ce04a]" />
                    <span>{isExpanded ? 'Hide AI Proof' : 'Inspect AI Evidence'}</span>
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* Details Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5 text-xs">
                  {/* Competitors detected */}
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block mb-1">
                      Competitors Cited by AI
                    </span>
                    {mentionedCompetitors.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {mentionedCompetitors.map((comp, idx) => (
                          <span
                            key={idx}
                            className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-zinc-300 font-medium"
                          >
                            {comp.name} {comp.rank ? `(#${comp.rank})` : ''}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-zinc-500 text-[11px] italic">None identified in responses</span>
                    )}
                  </div>

                  {/* Sources Cited */}
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block mb-1">
                      Sources & Citations
                    </span>
                    {sourcesList.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {sourcesList.map((src, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-zinc-300 font-mono truncate max-w-[200px]"
                          >
                            <Globe className="h-2.5 w-2.5 text-zinc-400 shrink-0" />
                            <span className="truncate">{src}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-zinc-500 text-[11px] italic">No URL citations extracted</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Collapsible Evidence Accordion */}
              {isExpanded && (
                <div className="border-t border-white/10 bg-black/60 p-5 sm:p-6 space-y-4 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        Verbatim AI Answer Proof
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        (Raw output from Google Gemini)
                      </span>
                    </div>

                    {/* Sample Tabs */}
                    {samples.length > 1 && (
                      <div className="flex items-center gap-1 bg-white/[0.05] p-1 rounded-xl border border-white/10 self-start">
                        {samples.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSampleIndex(result.id, idx)}
                            className={`rounded-lg px-2.5 py-1 text-[10px] font-mono font-semibold transition-colors ${
                              currentSampleIdx === idx
                                ? 'bg-white text-zinc-950'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            Sample {idx + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Active Sample Breakdown */}
                  <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4 font-mono text-xs text-zinc-300 space-y-3 leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap selection:bg-[#8ce04a] selection:text-black">
                    {activeSample.rawAnswer || 'No raw output available.'}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-zinc-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">Mentioned:</span>
                      <span className={activeSample.brandMentioned ? 'text-[#8ce04a] font-bold' : 'text-zinc-400'}>
                        {activeSample.brandMentioned ? 'YES' : 'NO'}
                      </span>
                    </div>
                    {activeSample.brandRank && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500">Rank:</span>
                        <span className="text-white font-bold">#{activeSample.brandRank}</span>
                      </div>
                    )}
                    {activeSample.competitorsFound && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500">Competitors:</span>
                        <span className="text-zinc-300">
                          {activeSample.competitorsFound
                            .filter((c) => c.mentioned)
                            .map((c) => c.name)
                            .join(', ') || 'None'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
