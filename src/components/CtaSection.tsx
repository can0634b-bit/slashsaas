'use client';

import React from 'react';
import { ArrowRight, Zap, ShieldCheck } from 'lucide-react';

interface CtaSectionProps {
  onOpenAuthModal: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onOpenAuthModal }) => {
  return (
    <section className="py-24 border-t border-white/[0.06] bg-gradient-to-b from-black via-zinc-950 to-black relative overflow-hidden text-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] pointer-events-none -z-10" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          60-Second Setup
        </span>

        <h2 className="mt-4 text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Start Slashing Your SaaS Waste Today.
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-zinc-400 leading-relaxed">
          Join high-growth tech companies saving tens of thousands of dollars each year with automated zombie seat reclaim.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={onOpenAuthModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-2xl active:scale-95"
          >
            <Zap className="h-4 w-4 fill-zinc-950" />
            <span>Audit Your Organization</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            100% Read-Only OAuth
          </span>
          <span>•</span>
          <span>Zero Password Storage</span>
        </div>
      </div>
    </section>
  );
};
