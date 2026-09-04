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
  Award,
  Globe,
  Users,
  Search,
} from 'lucide-react';

interface ScanResult {
  id: string;
  query_text: string;
  brand_mentioned: boolean;
  brand_rank: number | null;
  visibility_score: number;
  competitors_mentioned: string[];
  sources_cited: string[];
  raw_answer: string;
  samples_data?: Array<{
    sampleIndex: number;
    rawAnswer: string;
    brandMentioned: boolean;
    brandRank: number | null;
    competitorsMentioned: string[];
    sourcesCited: string[];
  }>;
  created_at: string;
}

interface Scan {
  id: string;
  status: string;
  overall_score: number;
  brand_mention_rate: number;
  share_of_voice: number;
  engine_name: string;
  created_at: string;
  error_message?: string | null;
}

interface ScanResultsViewProps {
  scan: Scan | null;
  results: ScanResult[];
  brandName: string;
}

export const ScanResultsView: React.FC<ScanResultsViewProps> = ({ scan, results, brandName }) => {
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

  const overallScore = Math.round(scan.overall_score || 0);
  const mentionRate = Math.round((scan.brand_mention_rate || 0) * 100);
  const shareOfVoice = Math.round((scan.share_of_voice || 0) * 100);

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

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overall Score */}
        <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6 backdrop-blur-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-semibold uppercase tracking-wider font-mono text-[10px]">Overall GEO Score</span>
            <Award className="h-4 w-4 text-[#8ce04a]" />
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
            <Percent className="h-4 w-4 text-zinc-300" />
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
            <TrendingUp className="h-4 w-4 text-emerald-400" />
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
          const samples = result.samples_data && result.samples_data.length > 0
            ? result.samples_data
            : [
                {
                  sampleIndex: 0,
                  rawAnswer: result.raw_answer,
                  brandMentioned: result.brand_mentioned,
                  brandRank: result.brand_rank,
                  competitorsMentioned: result.competitors_mentioned || [],
                  sourcesCited: result.sources_cited || [],
                },
              ];

          const activeSample = samples[currentSampleIdx] || samples[0];

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
                        <span className="text-zinc-500 font-mono text-[11px]">
                          Visibility Score: {Math.round(result.visibility_score)}/100
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
                    {result.competitors_mentioned && result.competitors_mentioned.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {result.competitors_mentioned.map((comp, idx) => (
                          <span
                            key={idx}
                            className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-zinc-300 font-medium"
                          >
                            {comp}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-zinc-500 text-[11px] italic">None identified</span>
                    )}
                  </div>

                  {/* Sources Cited */}
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block mb-1">
                      Sources & Citations
                    </span>
                    {result.sources_cited && result.sources_cited.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {result.sources_cited.map((src, idx) => (
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
                    {activeSample.competitorsMentioned && activeSample.competitorsMentioned.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500">Competitors:</span>
                        <span className="text-zinc-300">{activeSample.competitorsMentioned.join(', ')}</span>
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
