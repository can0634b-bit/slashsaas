'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  Sparkles,
  ExternalLink,
  Send,
  Trash2,
  Clock,
  Zap
} from 'lucide-react';
import { ZombieUserSeat, SaaSApp } from '@/lib/types';
import { getInactivityBadgeStyle, getNudgeStatusBadge, formatUSD } from '@/lib/utils';

interface ZombieSeatsTabProps {
  zombieSeats: ZombieUserSeat[];
  apps: SaaSApp[];
  onSingleNudge: (seat: ZombieUserSeat, actionType: 'nudge' | 'reclaim') => void;
  onBatchNudge: () => void;
  onOpenConnectModal: () => void;
}

export const ZombieSeatsTab: React.FC<ZombieSeatsTabProps> = ({
  zombieSeats,
  apps,
  onSingleNudge,
  onBatchNudge,
  onOpenConnectModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedBucket, setSelectedBucket] = useState('all');

  if (zombieSeats.length === 0) {
    return (
      <div className="py-16 text-center max-w-xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-zinc-950 p-8 sm:p-12 shadow-2xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-zinc-950 font-black">
            /S
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Inactive Seats Detected</h3>
          <p className="text-xs sm:text-sm text-zinc-400 mb-6">
            Connect your company Workspace to discover dormant accounts, or your current team has 100% active seat utilization.
          </p>
          <button
            onClick={onOpenConnectModal}
            className="rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-zinc-200"
          >
            Connect Workspace & Scan
          </button>
        </div>
      </div>
    );
  }

  const filteredSeats = zombieSeats.filter((seat) => {
    const matchesSearch = 
      seat.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seat.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seat.appName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesApp = selectedApp === 'all' || seat.appId === selectedApp;
    const matchesDept = selectedDept === 'all' || seat.department === selectedDept;
    const matchesBucket = selectedBucket === 'all' || seat.inactivityBucket === selectedBucket;

    return matchesSearch && matchesApp && matchesDept && matchesBucket;
  });

  const totalFilteredWaste = filteredSeats.reduce((acc, curr) => acc + curr.costMonthly, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Filters Bar */}
      <div className="rounded-3xl border border-white/[0.08] bg-zinc-950 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by team member name, email, or SaaS application..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:border-white/30 focus:outline-none"
            >
              <option value="all">All SaaS Subscriptions</option>
              {apps.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name} (${app.costPerSeatMonthly}/mo)
                </option>
              ))}
            </select>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:border-white/30 focus:outline-none"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
              <option value="Finance">Finance</option>
              <option value="HR">HR</option>
            </select>

            <select
              value={selectedBucket}
              onChange={(e) => setSelectedBucket(e.target.value)}
              className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:border-white/30 focus:outline-none"
            >
              <option value="all">All Inactivity Brackets</option>
              <option value="30-59">30-59 Days Inactive</option>
              <option value="60-89">60-89 Days Inactive</option>
              <option value="90+">90+ Days (Severe Zombie)</option>
            </select>

            <button
              onClick={onBatchNudge}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-zinc-200 shadow-md active:scale-95 transition-all"
            >
              <Send className="h-3.5 w-3.5 fill-zinc-950" />
              <span>Nudge All ({filteredSeats.length})</span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
          <span>Displaying <strong>{filteredSeats.length}</strong> dormant seats</span>
          <span className="text-rose-400 font-semibold">
            Filtered Waste: <strong>{formatUSD(totalFilteredWaste)}/mo</strong> ({formatUSD(totalFilteredWaste * 12)}/yr)
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-white/[0.08] bg-zinc-950 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] text-zinc-400 uppercase tracking-wider font-semibold border-b border-white/[0.06]">
              <tr>
                <th className="px-6 py-3.5">Team Member</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Application</th>
                <th className="px-6 py-3.5">Monthly Cost</th>
                <th className="px-6 py-3.5">Last Active</th>
                <th className="px-6 py-3.5">Inactivity Score</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-zinc-300">
              {filteredSeats.map((seat) => {
                const badge = getInactivityBadgeStyle(seat.inactivityBucket);
                const statusBadge = getNudgeStatusBadge(seat.nudgeStatus);

                return (
                  <tr key={seat.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center font-bold text-white text-xs shrink-0">
                          {seat.userName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <span className="font-semibold text-white block">{seat.userName}</span>
                          <span className="text-[11px] text-zinc-400 block">{seat.userEmail}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-zinc-900 px-2.5 py-1 text-zinc-300 border border-white/[0.08]">
                        {seat.department}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-medium text-white">
                      {seat.appName}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-rose-400">${seat.costMonthly}</span>
                      <span className="text-[10px] text-zinc-500 block">${seat.costMonthly * 12}/yr</span>
                    </td>

                    <td className="px-6 py-4 text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-zinc-500" />
                        {seat.lastActiveDate}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${badge.bg} ${badge.text}`}>
                        <AlertTriangle className="h-3 w-3" />
                        {seat.daysInactive} Days
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${statusBadge.bg} ${statusBadge.text}`}>
                        {statusBadge.label}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {seat.nudgeStatus !== 'reclaimed' ? (
                          <>
                            <button
                              onClick={() => onSingleNudge(seat, 'nudge')}
                              title="Send Automated Slack DM"
                              className="rounded-xl bg-white/[0.04] hover:bg-white/[0.08] px-2.5 py-1 text-[11px] font-semibold text-emerald-400 border border-white/10 flex items-center gap-1 transition-colors"
                            >
                              <MessageSquare className="h-3 w-3" />
                              <span>Slack Nudge</span>
                            </button>
                            <button
                              onClick={() => onSingleNudge(seat, 'reclaim')}
                              title="Mark License Reclaimed"
                              className="rounded-xl bg-white/[0.04] hover:bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-zinc-400 hover:text-emerald-300 border border-white/10 transition-colors"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Reclaim</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Reclaimed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
