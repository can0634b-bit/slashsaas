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
import { LineChart as LineChartIcon, TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react';
import { VisibilityTrendPoint } from '@/lib/types';

interface VisibilityTrendChartProps {
  trend: VisibilityTrendPoint[];
  brandName: string;
}

type MetricKey = 'mentionRate' | 'shareOfVoice';

const METRICS: Record<
  MetricKey,
  { label: string; color: string; gradientId: string }
> = {
  mentionRate: { label: 'Brand Mention Rate', color: '#947dff', gradientId: 'trendMention' },
  shareOfVoice: { label: 'Share of Voice', color: '#2fd9f4', gradientId: 'trendSov' },
};

function formatDay(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function VisibilityTrendChart({ trend, brandName }: VisibilityTrendChartProps) {
  const [metric, setMetric] = useState<MetricKey>('mentionRate');
  const config = METRICS[metric];

  const chartData = trend.map((p) => ({
    name: formatDay(p.date),
    mentionRate: p.mentionRate,
    shareOfVoice: p.shareOfVoice,
    runs: p.runs,
  }));

  // Change since the first tracked day (for the delta chip)
  const first = trend[0];
  const last = trend[trend.length - 1];
  const delta = first && last ? last[metric] - first[metric] : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const runs = payload[0]?.payload?.runs;
      return (
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest/95 backdrop-blur-xl p-space-sm shadow-2xl space-y-1 font-label-mono-sm text-label-mono-sm">
          <p className="text-on-surface-variant">{label}</p>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: config.color }} />
            <span className="text-on-surface-variant">{config.label}:</span>
            <span className="text-on-surface font-bold">{payload[0].value}%</span>
          </div>
          {typeof runs === 'number' && (
            <p className="text-outline">{runs} audit{runs === 1 ? '' : 's'} that day</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <section className="bg-surface-container-low/90 backdrop-blur-xl rounded-xl p-space-lg shadow-md space-y-space-md relative overflow-hidden">
      <div className="absolute -top-16 -left-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm relative">
        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <LineChartIcon className="h-4 w-4" />
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface tracking-tight">
            Visibility Over Time
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-mono-sm text-label-mono-sm">
            {trend.length} day{trend.length === 1 ? '' : 's'} tracked
          </span>
          {trend.length >= 2 && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-mono-sm text-label-mono-sm font-semibold ${
                delta > 0
                  ? 'bg-tertiary/15 text-tertiary'
                  : delta < 0
                  ? 'bg-error-container/40 text-error'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {delta > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : delta < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {delta > 0 ? '+' : ''}
              {delta} pts since start
            </span>
          )}
        </div>

        {/* Metric toggle */}
        <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant/20 self-start lg:self-center">
          {(Object.keys(METRICS) as MetricKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setMetric(key)}
              className={`rounded-md px-2.5 py-1 font-label-mono-sm text-label-mono-sm font-semibold transition-colors ${
                metric === key
                  ? 'bg-surface-container-highest text-on-surface'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {METRICS[key].label}
            </button>
          ))}
        </div>
      </div>

      {trend.length < 2 ? (
        // Not enough history yet
        <div className="flex flex-col items-center justify-center text-center gap-space-xs py-space-xl rounded-xl border border-dashed border-outline-variant/30 relative">
          <div className="p-3 rounded-full bg-surface-container text-on-surface-variant">
            <Clock className="h-5 w-5" />
          </div>
          <p className="font-body-md text-body-md text-on-surface">Your history is building.</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
            The trend line appears once <strong className="text-on-surface">{brandName}</strong> has audits on{' '}
            <strong className="text-on-surface">2 or more days</strong>. Run an audit today and again tomorrow —
            or let the daily monitor accumulate it automatically.
          </p>
        </div>
      ) : (
        <div className="h-64 w-full pt-1 relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id={config.gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#8a8996"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#8a8996"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={metric}
                stroke={config.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${config.gradientId})`}
                dot={{ r: 2.5, fill: config.color, strokeWidth: 0 }}
                activeDot={{ r: 4, fill: config.color, stroke: '#13131b', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
