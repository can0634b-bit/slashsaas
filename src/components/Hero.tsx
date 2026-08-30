'use client';

import React from 'react';
import { ArrowRight, ShieldCheck, Zap, CheckCircle2, Calendar } from 'lucide-react';
import { Interactive3DModel } from './Interactive3DModel';
import { IntegrationsStrip } from './IntegrationsStrip';

interface HeroProps {
  onOpenWaitlistModal: () => void;
  onBookDemo?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenWaitlistModal, onBookDemo }) => {
  const handleDemoClick = () => {
    if (onBookDemo) {
      onBookDemo();
    } else {
      const calUrl = process.env.NEXT_PUBLIC_CAL_EMBED_URL;
      if (calUrl && calUrl.trim().length > 0) {
        window.open(calUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = 'mailto:support@slashsaas.com?subject=Book%20a%20Demo%20-%20SlashSaaS';
      }
    }
  };

  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
      {/* Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-[#8ce04a]/20 via-emerald-500/10 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-cyan-500/10 blur-[120px] pointer-events-none -z-10" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#8ce04a]/30 bg-[#8ce04a]/[0.06] px-4 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-md mb-8 hover:border-[#8ce04a]/50 transition-colors">
          <span className="flex h-2 w-2 rounded-full bg-[#8ce04a] animate-pulse" />
          <span>SlashSaaS: Autonomous License Waste Hunter for Startups</span>
          <span className="text-zinc-600">|</span>
          <span className="text-[#a3e635] font-semibold flex items-center gap-1">
            Next-Gen FinOps
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="mx-auto max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          Stop Bleeding Money on SaaS Seats Your Team{' '}
          <span className="bg-gradient-to-r from-zinc-100 via-zinc-300 to-[#a3e635] bg-clip-text text-transparent">
            Forgot Existed.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
          The average 50-person startup wastes <strong className="text-white font-semibold">$2,000+/month</strong> on inactive Figma, Notion, and AI tool seats. <strong>SlashSaaS</strong> connects to Google Workspace & Slack to uncover zombie licenses and reclaim your budget with 1-click autonomous nudges.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            type="button"
            onClick={onOpenWaitlistModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-xl shadow-white/10 active:scale-95"
          >
            <Zap className="h-4 w-4 fill-zinc-950" />
            <span>Start Waste Audit</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleDemoClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-950/80 px-6 py-3.5 text-sm font-semibold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-all backdrop-blur-sm"
          >
            <Calendar className="h-4 w-4" />
            <span>Book a Demo (15 Min)</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#8ce04a]" /> 100% Read-Only OAuth (Zero Message/Document Access)
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#8ce04a]" /> Zero Password Storage
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#8ce04a]" /> 60-Second Setup
          </span>
        </div>

        {/* Interactive 3D Model Section */}
        <div className="mt-12">
          <Interactive3DModel />
        </div>

        {/* Showcase Metrics Card */}
        <div className="mt-6 mx-auto max-w-5xl rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-2.5 sm:p-4 shadow-2xl shadow-black/80 backdrop-blur-xl">
          <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/90 p-6 sm:p-8 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="h-9 w-9 drop-shadow-[0_0_10px_#8ce04a]" aria-hidden="true">
                    <path
                      d="M32 20 C32 38 18 50 4 50 C18 50 32 62 32 80 C32 62 46 50 60 50 C46 50 32 38 32 20 Z"
                      fill="#8ce04a"
                    />
                    <path
                      d="M68 20 C68 38 54 50 40 50 C54 50 68 62 68 80 C68 62 82 50 96 50 C82 50 68 38 68 20 Z"
                      fill="#a3e635"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">SlashSaaS Autonomous Radar</h3>
                  <p className="text-xs text-zinc-400">Live Synchronized with Google Workspace & Slack</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8ce04a]/10 border border-[#8ce04a]/25 px-3 py-1 text-xs font-semibold text-[#a3e635]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8ce04a] animate-ping" />
                  System Active & Protecting
                </span>
              </div>
            </div>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Typical Identified Waste</span>
                <p className="text-2xl font-extrabold text-white mt-1">22.4% <span className="text-xs font-normal text-rose-400 font-sans">average excess</span></p>
                <p className="text-[11px] text-zinc-400 mt-1">40+ dormant licenses detected per 50 seats</p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Projected Recoverable Budget</span>
                <p className="text-2xl font-extrabold text-[#a3e635] mt-1">+$24,600 / yr</p>
                <p className="text-[11px] text-zinc-400 mt-1">Direct bottom-line profit back to your bank</p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Slack Nudge Target Resolution</span>
                <p className="text-2xl font-extrabold text-cyan-400 mt-1">90%+ Target</p>
                <p className="text-[11px] text-zinc-400 mt-1">Team members voluntarily relinquish seats</p>
              </div>
            </div>

            {/* Visual SaaS App Pills */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-300">Monitored SaaS Ecosystems:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 font-medium text-zinc-300">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/[0.06]">Figma</span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/[0.06]">OpenAI ChatGPT</span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/[0.06]">Notion</span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/[0.06]">GitHub Copilot</span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/[0.06]">Loom</span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/[0.06]">Slack</span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/[0.06] text-zinc-500">+35 Apps</span>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Logos Strip */}
        <IntegrationsStrip />
      </div>
    </section>
  );
};
