'use client';

import React from 'react';
import { Search, MessageSquare, Layers, FileSpreadsheet, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export const BentoGrid: React.FC = () => {
  return (
    <section id="solutions" className="py-24 border-t border-white/[0.06] bg-zinc-950/40 relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Why SlashSaaS?
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Intelligent Architecture to Protect Your Runway
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            No 6-month enterprise onboarding. No invasive desktop agents. Connects via API in 60 seconds.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 (Large - Spans 2 cols) */}
          <div className="md:col-span-2 rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-8 flex flex-col justify-between hover:border-white/20 transition-all group shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white font-bold">
                  <Search className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Real-Time Login Telemetry
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Deep OAuth & SAML Activity Inspection
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-lg">
                SlashSaaS doesn't just guess based on credit card receipts. We inspect real OAuth 2.0 refresh timestamps across Google and Slack to calculate exact dormancy scores across 30, 60, and 90+ day inactivity thresholds.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-white/[0.06] bg-black/40 p-4 flex items-center justify-between text-xs text-zinc-300">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Dormancy Algorithm: 30 / 60 / 90+ Day Granular Classification
              </span>
              <span className="text-emerald-400 font-bold">100% Accuracy</span>
            </div>
          </div>

          {/* Card 2 (Single col) */}
          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-8 flex flex-col justify-between hover:border-white/20 transition-all group shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white font-bold">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                  Slack Bot Integration
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                1-Click Slack Nudge Bot
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Eliminate awkward manual emails. Our bot sends polite, automated Slack DMs allowing team members to relinquish unused seats with a single click.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Zero Interpersonal Friction, 94% Resolution Rate</span>
            </div>
          </div>

          {/* Card 3 (Single col) */}
          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-8 flex flex-col justify-between hover:border-white/20 transition-all group shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white font-bold">
                  <Layers className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  Shadow IT Radar
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Redundant & Duplicate Tool Detection
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Discover when marketing is paying for Loom while sales is paying for Vidyard. Consolidate your tool stack and stop double-paying.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs text-zinc-400 flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Eliminates Redundant Tool Sprawl</span>
            </div>
          </div>

          {/* Card 4 (Large - Spans 2 cols) */}
          <div className="md:col-span-2 rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-8 flex flex-col justify-between hover:border-white/20 transition-all group shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white font-bold">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                  Finance & Accounting
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                CFO & Board-Ready Audit Reports
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-lg">
                Arm your finance team with line-by-line justification for every software renewal (Figma, Salesforce, Notion). Generate executive CSV audit packages in 1 click.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-white/[0.06] bg-black/40 p-4 flex items-center justify-between text-xs text-zinc-300">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-purple-400" />
                Automatic Pre-Renewal Financial Audit Summaries
              </span>
              <span className="text-purple-400 font-bold">1-Click Export</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
