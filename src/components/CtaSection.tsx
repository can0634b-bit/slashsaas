'use client';

import React from 'react';
import { Zap, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CtaSectionProps {
  onOpenAuthModal: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onOpenAuthModal }) => {
  return (
    <section className="py-24 border-t border-white/[0.06] bg-zinc-950/80 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-8 sm:p-14 shadow-2xl backdrop-blur-xl">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Hemen Tasarrufa Başlayın
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Şirket Bütçenizi Boşa Harcamayın.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-zinc-400">
            60 saniyede Google Workspace veya Slack ile bağlanın. Unutulmuş lisanslarınızı anında tespit edin.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-zinc-950 hover:bg-zinc-200 shadow-xl shadow-white/10 active:scale-95 transition-all"
            >
              <Zap className="h-4 w-4 fill-zinc-950" />
              <span>Ücretsiz Denetimi Başlat</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> %100 Read-Only
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Kredi Kartı İstemez
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 14 Gün Deneme
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
