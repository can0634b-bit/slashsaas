'use client';

import React, { useState } from 'react';
import { Seat } from '@/lib/types/dashboard';
import { formatUSD } from '@/lib/utils';
import { deleteSeat } from '@/lib/actions/dashboard';
import { Trash2, AlertTriangle, CheckCircle2, Edit2, PlusCircle } from 'lucide-react';

interface DormantSeatsTableProps {
  dormantSeats: Seat[];
  onEditSeat: (seat: Seat) => void;
}

export const DormantSeatsTable: React.FC<DormantSeatsTableProps> = ({
  dormantSeats,
  onEditSeat,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (seatId: string) => {
    if (!confirm('Are you sure you want to remove this seat from tracking?')) return;
    setDeletingId(seatId);
    try {
      await deleteSeat(seatId);
    } catch (err) {
      alert('Failed to delete seat');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-zinc-950 p-6 sm:p-8 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Identified Dormant Licenses & Evidence
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Seats with zero login activity exceeding your 45-day dormancy threshold.
          </p>
        </div>

        <div className="text-xs text-zinc-400 font-medium">
          <span>Total Actionable: <strong className="text-white">{dormantSeats.length} seats</strong></span>
        </div>
      </div>

      {dormantSeats.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8ce04a]/10 text-[#8ce04a] border border-[#8ce04a]/20">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Zero Zombie Licenses</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            All monitored employee seats are active, or no dormant accounts match the 45-day threshold.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Employee</th>
                <th className="pb-3 font-semibold">Department</th>
                <th className="pb-3 font-semibold">Assigned Tool</th>
                <th className="pb-3 font-semibold">Dormancy Evidence</th>
                <th className="pb-3 font-semibold">Annual Waste</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {dormantSeats.map((seat) => {
                const hasApp = Boolean(seat.app);
                const monthlyCost = Number(seat.app?.monthly_seat_cost || 0);
                const annualCost = monthlyCost * 12;

                return (
                  <tr key={seat.id} className="hover:bg-white/[0.01] transition-colors">
                    {/* Employee */}
                    <td className="py-4 pr-4">
                      <p className="font-bold text-white">{seat.name || 'Unnamed User'}</p>
                      <p className="text-zinc-400 text-[11px]">{seat.email}</p>
                    </td>

                    {/* Department */}
                    <td className="py-4 pr-4">
                      <span className="inline-block rounded-lg bg-zinc-900 border border-white/10 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
                        {seat.department || 'General'}
                      </span>
                    </td>

                    {/* Tool & Cost */}
                    <td className="py-4 pr-4">
                      {hasApp ? (
                        <div>
                          <p className="font-semibold text-white">{seat.app!.app_name}</p>
                          <p className="text-[#a3e635] text-[10px] font-medium">${monthlyCost} / mo</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                            Unassigned
                          </span>
                          <button
                            type="button"
                            onClick={() => onEditSeat(seat)}
                            className="text-[#8ce04a] hover:underline text-[11px] font-semibold flex items-center gap-0.5"
                          >
                            <PlusCircle className="h-3 w-3" />
                            <span>Assign Tool</span>
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Evidence */}
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>Last active: {seat.dormancy_days} days ago</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        {seat.last_active_at
                          ? new Date(seat.last_active_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Never logged in'}
                      </p>
                    </td>

                    {/* Annual Waste */}
                    <td className="py-4 pr-4">
                      {hasApp && annualCost > 0 ? (
                        <span className="font-bold text-[#8ce04a] text-sm">
                          +{formatUSD(annualCost)} / yr
                        </span>
                      ) : (
                        <span className="text-zinc-500 font-mono text-[11px]">$0 / yr</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEditSeat(seat)}
                          title="Edit seat & tool assignment"
                          className="inline-flex items-center text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(seat.id)}
                          disabled={deletingId === seat.id}
                          title="Remove seat from tracking"
                          className="inline-flex items-center text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
