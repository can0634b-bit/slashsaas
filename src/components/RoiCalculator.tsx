'use client';

import React, { useState } from 'react';
import { ArrowRight, Zap, TrendingDown, DollarSign } from 'lucide-react';
import { formatUSD } from '@/lib/utils';

interface RoiCalculatorProps {
  onOpenAuthModal: () => void;
}

export const RoiCalculator: React.FC<RoiCalculatorProps> = ({ onOpenAuthModal }) => {
  const [teamSize, setTeamSize] = useState<number>(50);
  const [appsCount, setAppsCount] = useState<number>(8);
  const [costPerSeat, setCostPerSeat] = useState<number>(30);

  // Benchmarked metric: 22% of total SaaS seats in 10-250 person startups go unused
  const totalAnnualSpend = teamSize * appsCount * costPerSeat * 12;
  const estimatedWastedAnnual = Math.round(totalAnnualSpend * 0.22);
  const ghostSpendCostAnnual = 49 * 12; // $588/yr
  const netProfit = estimatedWastedAnnual - ghostSpendCostAnnual;
  const roiMultiple = Math.max(1, Math.round(netProfit / ghostSpendCostAnnual));

  return (
    <section id="calculator" className="py-24 border-t border-white/[0.06] bg-zinc-950/60 relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Canlı Tasarruf Hesaplayıcı
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Şu Anda Ne Kadar Bütçe Kaybediyorsunuz?
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            25.000+ taranmış teknoloji çalışanı verilerine dayanarak hesaplanır. Sürgüleri kaydırarak şirketinizin tahmini israfını görün.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          {/* Sliders Input Panel */}
          <div className="lg:col-span-7 rounded-3xl border border-white/[0.08] bg-zinc-900/50 p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-md">
            {/* Slider 1: Team Size */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Şirket Çalışan Sayısı
                </label>
                <span className="text-sm font-extrabold text-white bg-white/10 px-3 py-1 rounded-lg">
                  {teamSize} Kişi
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="250"
                step="5"
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>10 Kişi</span>
                <span>100 Kişi</span>
                <span>250+ Kişi</span>
              </div>
            </div>

            {/* Slider 2: Apps Count */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Kişi Başı Ortalama Ücretli SaaS Aracı
                </label>
                <span className="text-sm font-extrabold text-white bg-white/10 px-3 py-1 rounded-lg">
                  {appsCount} Araç
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="16"
                step="1"
                value={appsCount}
                onChange={(e) => setAppsCount(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>3 Araç</span>
                <span>8 Araç (Ortalama)</span>
                <span>16 Araç</span>
              </div>
            </div>

            {/* Slider 3: Seat Cost */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Koltuk Başı Ortalama Aylık Maliyet
                </label>
                <span className="text-sm font-extrabold text-white bg-white/10 px-3 py-1 rounded-lg">
                  ${costPerSeat} / ay
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="2"
                value={costPerSeat}
                onChange={(e) => setCostPerSeat(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>$10 (Slack/Notion)</span>
                <span>$30 (Harmanlanmış)</span>
                <span>$60 (Salesforce/AI)</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-black/40 p-3.5 text-xs text-zinc-400 flex items-center justify-between">
              <span>Yıllık Toplam SaaS Bütçeniz:</span>
              <strong className="text-white text-sm">{formatUSD(totalAnnualSpend)} / yıl</strong>
            </div>
          </div>

          {/* Savings Result Card */}
          <div className="lg:col-span-5 rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 via-zinc-950 to-zinc-950 p-6 sm:p-8 text-center shadow-2xl shadow-emerald-950/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 bg-emerald-400 text-zinc-950 font-bold text-[10px] uppercase tracking-wider rounded-bl-xl">
              {roiMultiple}x Yatırım Getirisi (ROI)
            </div>

            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Kurtarılabilir Yıllık İsraf
            </span>

            <div className="my-4">
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {formatUSD(estimatedWastedAnnual)}
              </span>
              <p className="text-xs text-zinc-400 mt-1">
                kullanılmayan ve unutulmuş lisanslarda / yıl
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-black/50 p-4 mb-6 text-left space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>GhostSpend Maliyeti:</span>
                <span className="text-zinc-200 font-semibold">$588 / yıl</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold pt-2 border-t border-white/[0.08]">
                <span>Şirketinize Kalan Net Kâr:</span>
                <span>+{formatUSD(netProfit)}</span>
              </div>
            </div>

            <button
              onClick={onOpenAuthModal}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-xs sm:text-sm font-bold text-zinc-950 hover:bg-zinc-200 shadow-xl active:scale-95 transition-all"
            >
              <Zap className="h-4 w-4 fill-zinc-950" />
              <span>{formatUSD(estimatedWastedAnnual)} Tasarrufu Başlat</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
