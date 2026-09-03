'use client';

import React from 'react';
import { RenewalAlert } from '@/lib/types/dashboard';
import { formatUSD } from '@/lib/utils';
import { Calendar, BellRing, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

interface RenewalRadarProps {
  renewals: RenewalAlert[];
  onOpenAddApp: () => void;
}

export const RenewalRadar: React.FC<RenewalRadarProps> = ({ renewals, onOpenAddApp }) => {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-zinc-950 p-6 sm:p-8 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <BellRing className="h-4 w-4 text-[#8ce04a]" />
            <span>Contract Renewal Radar</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Pre-renewal notifications to downgrade dormant seats before auto-billing triggers.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddApp}
          className="text-xs text-[#8ce04a] hover:underline font-semibold"
        >
          + Set Renewal Date
        </button>
      </div>

      {renewals.length === 0 ? (
        <div className="py-8 text-center text-xs text-zinc-500 space-y-2">
          <p>No upcoming renewal dates set.</p>
          <button
            type="button"
            onClick={onOpenAddApp}
            className="text-xs text-white underline hover:text-[#8ce04a] transition-colors"
          >
            Edit your SaaS tools to set annual/monthly renewal dates.
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renewals.map((r) => {
            const isUrgent = r.days_until_renewal <= 30;

            return (
              <div
                key={r.app_id}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                  isUrgent
                    ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/[0.06] to-zinc-950 shadow-lg'
                    : 'border-white/[0.08] bg-zinc-900/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-bold text-white text-sm">{r.app_name}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        isUrgent
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-white/5 text-zinc-400 border border-white/10'
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {r.days_until_renewal <= 0
                        ? 'Renewal Due Today'
                        : `In ${r.days_until_renewal} days`}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 mb-4">
                    Renewal Date:{' '}
                    <strong className="text-zinc-200">
                      {new Date(r.renewal_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </strong>{' '}
                    • {r.total_seats} total seats (${r.monthly_seat_cost}/mo)
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-black/40 p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[11px] text-zinc-400 block">Dormant Seats in Tool:</span>
                    <span className="font-semibold text-white">{r.dormant_seats_count} seats</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-zinc-400 block">Reclaimable before renewal:</span>
                    <span className="font-bold text-[#8ce04a]">
                      +{formatUSD(r.reclaimable_annual_amount)} / yr
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
