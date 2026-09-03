'use client';

import React from 'react';
import { DepartmentWaste } from '@/lib/types/dashboard';
import { formatUSD } from '@/lib/utils';
import { Building, PieChart } from 'lucide-react';

interface DepartmentMatrixProps {
  breakdown: DepartmentWaste[];
  totalAnnualWaste: number;
}

export const DepartmentMatrix: React.FC<DepartmentMatrixProps> = ({
  breakdown,
  totalAnnualWaste,
}) => {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-zinc-950 p-6 sm:p-8 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <PieChart className="h-4 w-4 text-[#8ce04a]" />
            <span>Department Waste Matrix</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Identified dormant license spend grouped by organizational team.
          </p>
        </div>
      </div>

      {breakdown.length === 0 ? (
        <div className="py-8 text-center text-xs text-zinc-500">
          No department waste data yet. Add seats with assigned departments to view distribution.
        </div>
      ) : (
        <div className="space-y-4">
          {breakdown.map((item) => (
            <div key={item.department} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-200 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#8ce04a]" />
                  {item.department}
                </span>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-zinc-400 text-[11px]">
                    {item.dormant_seats} dormant seats
                  </span>
                  <span className="font-bold text-white">
                    {formatUSD(item.annual_waste)} / yr
                  </span>
                  <span className="font-mono text-[#8ce04a] text-[11px] w-8 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-white/5">
                <div
                  style={{ width: `${Math.max(4, item.percentage)}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#8ce04a] transition-all duration-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
