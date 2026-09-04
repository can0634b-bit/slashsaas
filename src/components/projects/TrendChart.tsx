'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Activity, Award, Percent } from 'lucide-react';

interface ScanDataPoint {
  id: string;
  created_at: string;
  overall_score?: number | null;
  brand_mention_rate?: number | null;
  share_of_voice?: number | null;
  summary_json?: any;
}

interface TrendChartProps {
  scans: ScanDataPoint[];
  brandName: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ scans, brandName }) => {
  const [metric, setMetric] = useState<'score' | 'sov' | 'mentionRate'>('score');

  if (!scans || scans.length < 2) {
    return null;
  }

  // Sort chronologically ascending for time-series chart
  const sortedScans = [...scans].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const chartData = sortedScans.map((s, idx) => {
    const rawScore = s.overall_score ?? s.summary_json?.overallVisibilityScore ?? 0;
    const rawSoV = s.share_of_voice ?? s.summary_json?.shareOfVoice ?? 0;
    const rawMentionRate = s.brand_mention_rate ?? s.summary_json?.brandMentionRate ?? 0;

    const dateObj = new Date(s.created_at);
    const dateFormatted = `${dateObj.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })} ${dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;

    return {
      name: dateFormatted,
      run: `Run #${idx + 1}`,
      score: Math.round(rawScore),
      shareOfVoice: Math.round(rawSoV > 1 ? rawSoV : rawSoV * 100),
      mentionRate: Math.round(rawMentionRate > 1 ? rawMentionRate : rawMentionRate * 100),
    };
  });

  const getMetricConfig = () => {
    switch (metric) {
      case 'sov':
        return {
          dataKey: 'shareOfVoice',
          label: 'Share of Voice',
          color: '#10b981',
          gradientId: 'sovGradient',
          unit: '%',
        };
      case 'mentionRate':
        return {
          dataKey: 'mentionRate',
          label: 'Brand Mention Rate',
          color: '#38bdf8',
          gradientId: 'mentionGradient',
          unit: '%',
        };
      case 'score':
      default:
        return {
          dataKey: 'score',
          label: 'Overall Visibility Score',
          color: '#8ce04a',
          gradientId: 'scoreGradient',
          unit: ' pts',
        };
    }
  };

  const config = getMetricConfig();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/95 p-3.5 shadow-2xl backdrop-blur-xl space-y-1.5 text-xs font-mono">
          <p className="text-zinc-400 font-semibold text-[11px]">{label}</p>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: config.color }} />
            <span className="text-zinc-300">{config.label}:</span>
            <span className="text-white font-bold">
              {payload[0].value}
              {config.unit}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6 backdrop-blur-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#8ce04a]" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Historical Visibility Trajectory
            </h3>
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-zinc-400">
              {scans.length} Time-Series Snapshots
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Track {brandName}'s progress, generative volatility, and competitive shifts over time
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 bg-white/[0.05] p-1 rounded-xl border border-white/10 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setMetric('score')}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              metric === 'score'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            GEO Score
          </button>
          <button
            type="button"
            onClick={() => setMetric('sov')}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              metric === 'sov'
                ? 'bg-emerald-400 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Share of Voice
          </button>
          <button
            type="button"
            onClick={() => setMetric('mentionRate')}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              metric === 'mentionRate'
                ? 'bg-sky-400 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Mention Rate
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8ce04a" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#8ce04a" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="sovGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="mentionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="run"
              stroke="#71717a"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#71717a"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={config.dataKey}
              stroke={config.color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#${config.gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
