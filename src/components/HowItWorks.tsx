'use client';

import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Bot, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: '60-Second Read-Only Sync',
      desc: 'Connect your company Google Workspace or Slack via secure OAuth 2.0. SlashSaaS only reads login activity timestamps—zero document or private communication access.',
      tag: '60-Sec Connect',
    },
    {
      num: '02',
      title: 'Autonomous Inactivity Radar',
      desc: 'Our engine maps all 30+, 60+, and 90+ day dormant seats across Figma, Notion, ChatGPT Team, GitHub Copilot, and 30+ other subscriptions.',
      tag: 'Zero Manual Work',
    },
    {
      num: '03',
      title: '1-Click Slack Recovery Nudges',
      desc: 'Launch automated Slack bot DMs asking inactive users to voluntarily surrender their licenses, or export an executive CSV for your CFO to reclaim budget before renewals.',
      tag: 'Instant ROI',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 border-t border-white/[0.06] bg-black relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Autonomous Pipeline
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How SlashSaaS Eliminates Waste in 3 Steps
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            Set up once and let our background algorithms monitor and optimize your software spend continuously.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative rounded-3xl border border-white/[0.08] bg-zinc-950/80 p-8 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-black text-white/20 font-mono">
                    {step.num}
                  </span>
                  <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] font-semibold text-zinc-300">
                    {step.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Verified Automation</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
