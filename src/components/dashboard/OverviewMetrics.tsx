'use client';

import React from 'react';
import { TrendingDown, Users, Layers, Zap, AlertTriangle } from 'lucide-react';
import { DashboardComputedMetrics } from '@/lib/types/dashboard';
import { formatUSD } from '@/lib/utils';

interface OverviewMetricsProps {
  metrics: DashboardComputedMetrics;
  onOpenAddApp: () => void;
  onOpenAddSeat: () => void;
  onOpenCsvImport: () => void;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({
  metrics,
  onOpenAddApp,
  onOpenAddSeat,
  onOpenCsvImport,
}) => {
  return (
    <div className="space-y-6">
      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Identified Waste */}
        <div className="rounded-3xl border border-[#8ce04a]/30 bg-gradient-to-b from-[#8ce04a]/[0.08] via-zinc-950 to-zinc-950 p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
            <span className="uppercase tracking-wider">Identified Annual Waste</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#8ce04a]/20 text-[#8ce04a]">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>

          <p className="text-4xl font-black text-white tracking-tight">
            {formatUSD(metrics.totalAnnualWaste)}
          </p>

          <p className="text-xs text-[#a3e635] mt-2 font-medium flex items-center gap-1">
            <span>{metrics.dormantSeatsCount} dormant licenses detected</span>
            <span className="text-zinc-500 font-normal">(${formatUSD(metrics.totalMonthlyWaste)}/mo)</span>
          </p>
        </div>

        {/* Card 2: Monitored Seats */}
        <div className="rounded-3xl border border-white/[0.08] bg-zinc-950/80 p-6 shadow-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
            <span className="uppercase tracking-wider">Monitored Seats</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <Users className="h-4 w-4" />
            </div>
          </div>

          <p className="text-4xl font-black text-white tracking-tight">
            {metrics.totalMonitoredSeats}
          </p>

          <p className="text-xs text-zinc-400 mt-2">
            {metrics.activeSeatsCount} active • {metrics.dormantSeatsCount} dormant
          </p>
        </div>

        {/* Card 3: Detected SaaS & AI Apps */}
        <div className="rounded-3xl border border-white/[0.08] bg-zinc-950/80 p-6 shadow-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
            <span className="uppercase tracking-wider">SaaS & AI Subscriptions</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>

          <p className="text-4xl font-black text-white tracking-tight">
            {metrics.totalDetectedApps}
          </p>

          <p className="text-xs text-zinc-400 mt-2">
            Continuous license audit active
          </p>
        </div>
      </div>
    </div>
  );
};
