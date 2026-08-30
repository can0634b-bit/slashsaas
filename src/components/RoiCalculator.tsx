'use client';

import React, { useState } from 'react';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { formatUSD } from '@/lib/utils';

interface RoiCalculatorProps {
  onOpenAuthModal: () => void;
}

export const RoiCalculator: React.FC<RoiCalculatorProps> = ({ onOpenAuthModal }) => {
  const [employees, setEmployees] = useState(50);
  const [appsPerUser, setAppsPerUser] = useState(8);
  const [seatCost, setSeatCost] = useState(30);

  // Exact Financial Math
  const totalMonthlySpend = employees * appsPerUser * seatCost;
  const totalAnnualSpend = totalMonthlySpend * 12;
  const estimatedWasteRatio = 0.22; // 22% average SaaS waste
  const annualWaste = Math.round(totalAnnualSpend * estimatedWasteRatio);
  const slashSaasAnnualCost = 49 * 12; // /yr
  const netSavings = Math.max(0, annualWaste - slashSaasAnnualCost);
  const roiMultiple = Math.round(netSavings / slashSaasAnnualCost);

  return (
    <section id="calculator" className="py-24 border-t border-zinc-200 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-zinc-950/40 relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Interactive ROI Calculator
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            How Much Budget Are You Losing Right Now?
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
            Calculated across data from 25,000+ audited tech company seats. Adjust the sliders to see your projected recoverable waste.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Controls (Sliders) */}
          <div className="lg:col-span-7 rounded-3xl border border-zinc-200/80 dark:border-white/[0.08] bg-white dark:bg-zinc-950 p-6 sm:p-8 space-y-7 shadow-sm dark:shadow-xl">
            {/* Slider 1: Team Size */}
            <div>
              <div className="flex justify-between items-center mb-2 text-xs font-medium">
                <label className="uppercase tracking-wider text-zinc-500 font-semibold">
                  Company Team Size
                </label>
                <span className="text-sm font-bold text-zinc-950 dark:text-white bg-zinc-100 dark:bg-white/5 px-3 py-1 rounded-xl border border-zinc-200 dark:border-white/10">
                  {employees} Employees
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="250"
                step="5"
                value={employees}
                onChange={(e) => setEmployees(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-950 dark:accent-white"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 mt-1.5">
                <span>10 People</span>
                <span>100 People</span>
                <span>250+ People</span>
              </div>
            </div>

            {/* Slider 2: Apps Per User */}
            <div>
              <div className="flex justify-between items-center mb-2 text-xs font-medium">
                <label className="uppercase tracking-wider text-zinc-500 font-semibold">
                  Average Paid SaaS Tools Per Person
                </label>
                <span className="text-sm font-bold text-zinc-950 dark:text-white bg-zinc-100 dark:bg-white/5 px-3 py-1 rounded-xl border border-zinc-200 dark:border-white/10">
                  {appsPerUser} Apps
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="16"
                step="1"
                value={appsPerUser}
                onChange={(e) => setAppsPerUser(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-950 dark:accent-white"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 mt-1.5">
                <span>3 Tools</span>
                <span>8 Tools (Average)</span>
                <span>16 Tools</span>
              </div>
            </div>

            {/* Slider 3: Cost Per Seat */}
            <div>
              <div className="flex justify-between items-center mb-2 text-xs font-medium">
                <label className="uppercase tracking-wider text-zinc-500 font-semibold">
                  Blended Average Monthly Cost Per Seat
                </label>
                <span className="text-sm font-bold text-zinc-950 dark:text-white bg-zinc-100 dark:bg-white/5 px-3 py-1 rounded-xl border border-zinc-200 dark:border-white/10">
                   / mo
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={seatCost}
                onChange={(e) => setSeatCost(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-950 dark:accent-white"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 mt-1.5">
                <span> (Slack/Notion)</span>
                <span> (Blended)</span>
                <span> (Salesforce/AI)</span>
              </div>
            </div>

            {/* Total Annual SaaS Spend Box */}
            <div className="pt-4 border-t border-zinc-100 dark:border-white/[0.06] flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <span>Estimated Annual SaaS Spend:</span>
              <strong className="text-sm font-bold text-zinc-900 dark:text-zinc-200">
                {formatUSD(totalAnnualSpend)} / year
              </strong>
            </div>
          </div>

          {/* Results Card */}
          <div className="lg:col-span-5 rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.08] via-white to-white dark:from-emerald-950/20 dark:via-zinc-950 dark:to-zinc-950 p-6 sm:p-8 flex flex-col justify-between shadow-xl dark:shadow-2xl relative">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{roiMultiple}X ESTIMATED ROI</span>
              </div>

              <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold block">
                Recoverable Annual Waste
              </span>

              <p className="text-4xl sm:text-5xl font-black text-zinc-950 dark:text-white tracking-tight mt-1">
                {formatUSD(annualWaste)}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                wasted every year on forgotten and inactive seats
              </p>

              <div className="my-6 space-y-2 border-t border-zinc-200/80 dark:border-white/[0.08] pt-6 text-xs">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>SlashSaaS Annual Investment:</span>
                  <span className="text-zinc-900 dark:text-zinc-200 font-medium"> / yr</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <span>Net Annual Profit to Your Bank:</span>
                  <span>+{formatUSD(netSavings)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenAuthModal}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-950 dark:bg-white py-3.5 text-xs sm:text-sm font-bold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-xl active:scale-95"
            >
              <Zap className="h-4 w-4 fill-current" />
              <span>Claim {formatUSD(annualWaste)} in Savings</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};