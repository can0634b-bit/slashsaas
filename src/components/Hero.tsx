'use client';

import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Sparkles, TrendingDown, Layers, Bot, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onOpenAuthModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAuthModal }) => {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
      {/* Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-cyan-500/10 blur-[120px] pointer-events-none -z-10" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-100/80 dark:bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 backdrop-blur-md mb-8 hover:border-zinc-300 dark:hover:border-white/20 transition-colors">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
          <span>SlashSaaS: Autonomous License Waste Hunter for Startups</span>
          <span className="text-zinc-400 dark:text-zinc-600">|</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            Next-Gen FinOps
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="mx-auto max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.1]">
          Stop Bleeding Money on SaaS Seats Your Team{' '}
          <span className="bg-gradient-to-r from-zinc-800 via-zinc-600 to-zinc-400 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-500 bg-clip-text text-transparent">
            Forgot Existed.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
          The average 50-person startup wastes <strong className="text-zinc-900 dark:text-white font-semibold">,000+/month</strong> on inactive Figma, Notion, and AI tool seats. <strong>SlashSaaS</strong> connects to Google Workspace & Slack to uncover zombie licenses and reclaim your budget with 1-click autonomous nudges.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={onOpenAuthModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-zinc-950 dark:bg-white px-7 py-3.5 text-sm font-bold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-xl shadow-zinc-900/10 dark:shadow-white/10 active:scale-95"
          >
            <Zap className="h-4 w-4 fill-current" />
            <span>Start Waste Audit</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100/60 dark:bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/[0.08] hover:text-black dark:hover:text-white transition-all backdrop-blur-sm"
          >
            <span>How It Works (2 Mins)</span>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 dark:text-zinc-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /> 100% Read-Only (Zero Document Access)
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /> Zero Password Storage
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /> 60-Second Setup
          </span>
        </div>

        {/* Showcase Card */}
        <div className="mt-16 mx-auto max-w-5xl rounded-3xl border border-zinc-200 dark:border-white/10 bg-gradient-to-b from-zinc-100/80 to-zinc-50/40 dark:from-white/[0.06] dark:to-white/[0.01] p-2.5 sm:p-4 shadow-2xl shadow-zinc-400/20 dark:shadow-black/80 backdrop-blur-xl">
          <div className="rounded-2xl border border-zinc-200/80 dark:border-white/[0.08] bg-white dark:bg-zinc-950/90 p-6 sm:p-8 text-left shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-sm">
                  /S
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white">SlashSaaS Autonomous Radar</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Live Synchronized with Google Workspace & Slack</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                  System Active & Protecting
                </span>
              </div>
            </div>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="rounded-xl border border-zinc-200/80 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-white/[0.02] p-4">
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Detected Budget Waste</span>
                <p className="text-2xl font-extrabold text-zinc-950 dark:text-white mt-1">22.4% <span className="text-xs font-normal text-rose-500 dark:text-rose-400 font-sans">average excess</span></p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">40+ dormant licenses detected per 50 seats</p>
              </div>

              <div className="rounded-xl border border-zinc-200/80 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-white/[0.02] p-4">
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Annual Recovered Budget</span>
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">+,600 / yr</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Direct bottom-line profit back to your bank</p>
              </div>

              <div className="rounded-xl border border-zinc-200/80 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-white/[0.02] p-4">
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Slack Nudge Resolution Rate</span>
                <p className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-1">94% Success</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Team members voluntarily relinquish seats</p>
              </div>
            </div>

            {/* Visual SaaS App Pills */}
            <div className="rounded-xl border border-zinc-200/80 dark:border-white/[0.06] bg-zinc-50/80 dark:bg-white/[0.01] p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-800 dark:text-zinc-300">Monitored SaaS Ecosystems:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300">
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] shadow-2xs">Figma</span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] shadow-2xs">OpenAI ChatGPT</span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] shadow-2xs">Notion</span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] shadow-2xs">GitHub Copilot</span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] shadow-2xs">Loom</span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] shadow-2xs">Slack</span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] text-zinc-500 shadow-2xs">+35 Apps</span>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Logos Strip */}
        <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-white/[0.06]">
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-6">
            Seamlessly Integrated with Your Tech Stack
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-70 grayscale hover:grayscale-0 transition-all text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <span className="flex items-center gap-2">Google Workspace</span>
            <span className="flex items-center gap-2">Slack Enterprise</span>
            <span className="flex items-center gap-2">Microsoft 365</span>
            <span className="flex items-center gap-2">Okta SAML SSO</span>
            <span className="flex items-center gap-2">Stripe Invoicing</span>
          </div>
        </div>
      </div>
    </section>
  );
};