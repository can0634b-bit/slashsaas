'use client';

import React from 'react';
import { 
  TrendingDown, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  MessageSquare,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { ScanSummary, SaaSApp } from '@/lib/types';
import { formatUSD } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface OverviewTabProps {
  scanData: ScanSummary;
  onNavigateToZombies: () => void;
  onBatchNudge: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  scanData,
  onNavigateToZombies,
  onBatchNudge,
}) => {
  // Chart Data preparation
  const deptChartData = scanData.departmentBreakdown.map((dept) => ({
    name: dept.department,
    activeSpend: dept.totalSpend - dept.wastedSpend,
    wastedSpend: dept.wastedSpend,
    zombieCount: dept.zombieSeats,
  }));

  const inactivityData = [
    { name: '30-59 Days', value: scanData.inactivityBreakdown.bucket30to59Days, color: '#f59e0b' },
    { name: '60-89 Days', value: scanData.inactivityBreakdown.bucket60to89Days, color: '#f97316' },
    { name: '90+ Days (Zombie)', value: scanData.inactivityBreakdown.bucket90PlusDays, color: '#ef4444' },
  ];

  const topWasteApps = [...scanData.apps].sort((a, b) => b.monthlyWaste - a.monthlyWaste).slice(0, 5);

  return (
    <div className="space-y-8 pb-12">
      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Annual Waste */}
        <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/20 to-zinc-900/90 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-400 mb-2">
            <span>RECOVERABLE ANNUAL WASTE</span>
            <span className="rounded-full bg-rose-500/10 px-2 py-0.5 border border-rose-500/20">
              {scanData.potentialSavingsPercentage}% of budget
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white tracking-tight">
            {formatUSD(scanData.annualWastedSpend)}
          </p>
          <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
            <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
            <span>${scanData.monthlyWastedSpend.toLocaleString()} leaking every month</span>
          </p>
        </div>

        {/* KPI 2: Zombie Seats */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-zinc-900/90 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400 mb-2">
            <span>DORMANT ZOMBIE SEATS</span>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 border border-amber-500/20">
              {scanData.zombieSeatPercentage}% of total
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white tracking-tight">
            {scanData.zombieSeatCount} <span className="text-lg font-normal text-zinc-500">/ {scanData.totalSeatCount}</span>
          </p>
          <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span>Zero login activity in 30-120+ days</span>
          </p>
        </div>

        {/* KPI 3: Monthly SaaS Burn */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 mb-2">
            <span>TOTAL MONTHLY SAAS BURN</span>
            <span className="text-zinc-500">{scanData.apps.length} Subscriptions</span>
          </div>
          <p className="text-3xl font-extrabold text-white tracking-tight">
            {formatUSD(scanData.totalMonthlySpend)}
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            Across {scanData.totalEmployees} employee accounts
          </p>
        </div>

        {/* KPI 4: Top Offender */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 mb-2">
            <span>HIGHEST LEAKAGE APP</span>
            <span className="text-rose-400 font-bold">Top Offender</span>
          </div>
          <p className="text-xl font-bold text-white truncate">
            {topWasteApps[0]?.name || 'Figma'}
          </p>
          <p className="text-xs text-rose-400 mt-1 font-semibold">
            {formatUSD((topWasteApps[0]?.monthlyWaste || 0) * 12)} / year wasted
          </p>
        </div>
      </div>

      {/* QUICK BATCH ACTION CALLOUT */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-zinc-900 to-zinc-900 p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-left">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 border border-emerald-500/30">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Instant 1-Click License Reclamation
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              Send automated Slack nudges to all {scanData.zombieSeatCount} inactive team members asking if they still need their seats.
            </p>
          </div>
        </div>

        <button
          onClick={onBatchNudge}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs sm:text-sm font-bold text-zinc-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all shrink-0"
        >
          <MessageSquare className="h-4 w-4 fill-zinc-950" />
          <span>Launch Slack Nudge Bot</span>
        </button>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: Department Spend Breakdown */}
        <div className="lg:col-span-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white">Department Spend & Waste Matrix</h3>
              <p className="text-xs text-zinc-400">Comparing active utilization vs wasted license spend</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Active
              </span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" /> Wasted
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  formatter={(value: any) => [`$${value}`, '']}
                />
                <Bar dataKey="activeSpend" name="Active Spend" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="wastedSpend" name="Wasted Spend" fill="#f43f5e" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Inactivity Aging Curve */}
        <div className="lg:col-span-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Inactivity Aging Breakdown</h3>
            <p className="text-xs text-zinc-400 mb-4">Dormancy duration across all seats</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inactivityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {inactivityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-zinc-850 pt-4">
            {inactivityData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold">{item.value} seats</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOP APPS TABLE */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Top 5 Waste Offender Apps</h3>
            <p className="text-xs text-zinc-400">Applications generating the largest monthly budget leakage</p>
          </div>
          <button
            onClick={onNavigateToZombies}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            <span>View All Zombie Seats</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/50 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-5 py-3">Application</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Seat Cost</th>
                <th className="px-5 py-3">Total / Inactive</th>
                <th className="px-5 py-3">Monthly Waste</th>
                <th className="px-5 py-3">Annual Waste</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-zinc-300">
              {topWasteApps.map((app) => (
                <tr key={app.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-white flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    {app.name}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-400">{app.category}</td>
                  <td className="px-5 py-3.5 text-zinc-300">${app.costPerSeatMonthly}/mo</td>
                  <td className="px-5 py-3.5">
                    <span className="text-zinc-200">{app.totalSeats} seats</span>
                    <span className="text-rose-400 font-bold ml-1.5">({app.zombieSeats} dormant)</span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-rose-400">${app.monthlyWaste}/mo</td>
                  <td className="px-5 py-3.5 font-extrabold text-white">${app.annualWaste.toLocaleString()}/yr</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={onNavigateToZombies}
                      className="rounded-lg bg-zinc-850 hover:bg-zinc-800 px-3 py-1.5 text-[11px] font-semibold text-emerald-400 border border-zinc-700 transition-colors"
                    >
                      Audit Seats
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
