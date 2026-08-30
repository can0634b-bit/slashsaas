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
  Clock
} from 'lucide-react';
import { ZombieUserSeat, SaaSApp } from '@/lib/types';
import { getInactivityBadgeStyle, getNudgeStatusBadge, formatUSD } from '@/lib/utils';

interface ZombieSeatsTabProps {
  zombieSeats: ZombieUserSeat[];
  apps: SaaSApp[];
  onSingleNudge: (seat: ZombieUserSeat, actionType: 'nudge' | 'reclaim') => void;
  onBatchNudge: () => void;
}

export const ZombieSeatsTab: React.FC<ZombieSeatsTabProps> = ({
  zombieSeats,
  apps,
  onSingleNudge,
  onBatchNudge,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedBucket, setSelectedBucket] = useState('all');

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
      {/* FILTER & CONTROL BAR */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by employee name, email, or SaaS app..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* App Filter */}
            <select
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All SaaS Apps</option>
              {apps.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name} (${app.costPerSeatMonthly}/mo)
                </option>
              ))}
            </select>

            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none"
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

            {/* Inactivity Duration */}
            <select
              value={selectedBucket}
              onChange={(e) => setSelectedBucket(e.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Inactivity Brackets</option>
              <option value="30-59">30-59 Days Inactive</option>
              <option value="60-89">60-89 Days Inactive</option>
              <option value="90+">90+ Days (Severe Zombie)</option>
            </select>

            {/* Batch Action */}
            <button
              onClick={onBatchNudge}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Send className="h-3.5 w-3.5 fill-zinc-950" />
              <span>Nudge All ({filteredSeats.length})</span>
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between text-xs text-zinc-400">
          <span>Showing <strong>{filteredSeats.length}</strong> inactive seats</span>
          <span className="text-rose-400 font-semibold">
            Filtered Monthly Waste: <strong>{formatUSD(totalFilteredWaste)}/mo</strong> ({formatUSD(totalFilteredWaste * 12)}/yr)
          </span>
        </div>
      </div>

      {/* ZOMBIE SEATS TABLE */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/60 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Application</th>
                <th className="px-5 py-3.5">Monthly Cost</th>
                <th className="px-5 py-3.5">Last Active</th>
                <th className="px-5 py-3.5">Inactivity Score</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Reclamation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-zinc-300">
              {filteredSeats.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-zinc-500">
                    No zombie seats found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSeats.map((seat) => {
                  const badge = getInactivityBadgeStyle(seat.inactivityBucket);
                  const statusBadge = getNudgeStatusBadge(seat.nudgeStatus);

                  return (
                    <tr key={seat.id} className="hover:bg-zinc-900/40 transition-colors">
                      {/* User Info */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-xs shrink-0">
                            {seat.userName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <span className="font-semibold text-white block">{seat.userName}</span>
                            <span className="text-[11px] text-zinc-400 block">{seat.userEmail}</span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-5 py-3.5">
                        <span className="rounded-md bg-zinc-900 px-2 py-0.5 text-zinc-300 border border-zinc-800">
                          {seat.department}
                        </span>
                      </td>

                      {/* App */}
                      <td className="px-5 py-3.5 font-medium text-white">
                        {seat.appName}
                      </td>

                      {/* Cost */}
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-rose-400">${seat.costMonthly}</span>
                        <span className="text-[10px] text-zinc-500 block">${seat.costMonthly * 12}/yr</span>
                      </td>

                      {/* Last Active Date */}
                      <td className="px-5 py-3.5 text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-zinc-500" />
                          {seat.lastActiveDate}
                        </span>
                      </td>

                      {/* Inactivity Badge */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${badge.bg} ${badge.text}`}>
                          <AlertTriangle className="h-3 w-3" />
                          {seat.daysInactive} Days
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${statusBadge.bg} ${statusBadge.text}`}>
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {seat.nudgeStatus !== 'reclaimed' ? (
                            <>
                              <button
                                onClick={() => onSingleNudge(seat, 'nudge')}
                                title="Send Automated Slack DM"
                                className="rounded-lg bg-zinc-900 hover:bg-zinc-850 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 border border-zinc-800 flex items-center gap-1 hover:border-emerald-500/40 transition-colors"
                              >
                                <MessageSquare className="h-3 w-3" />
                                <span>Slack Nudge</span>
                              </button>
                              <button
                                onClick={() => onSingleNudge(seat, 'reclaim')}
                                title="Mark License Reclaimed"
                                className="rounded-lg bg-zinc-900 hover:bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-zinc-400 hover:text-emerald-300 border border-zinc-800 transition-colors"
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
