'use client';

import React from 'react';
import { 
  Bot, 
  Search, 
  MessageSquare, 
  FileSpreadsheet, 
  ShieldCheck, 
  Layers, 
  Zap, 
  TrendingDown,
  Users,
  BellRing
} from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      icon: Search,
      title: 'Deep OAuth & SAML Token Audit',
      description: 'GhostSpend doesn\'t just guess based on credit card receipts. We inspect real OAuth 2.0 refresh timestamps to see who actually logged into the product.',
      badge: 'Accurate to the minute'
    },
    {
      icon: MessageSquare,
      title: 'Automated 1-Click Slack Bot Nudges',
      description: 'Avoid awkward manual emails. Our Slack bot pings inactive team members: "Hey Mark, notice you haven\'t used Figma in 60 days. Still need it?" with 1-click yes/no buttons.',
      badge: 'Zero Friction'
    },
    {
      icon: Layers,
      title: 'Shadow IT & Duplicate Tool Discovery',
      description: 'Discover when marketing is paying for Loom while sales is paying for Vidyard, or when engineering has 3 different diagramming apps running simultaneously.',
      badge: 'Eliminate Redundancy'
    },
    {
      icon: FileSpreadsheet,
      title: 'CFO & Board-Ready Audit Exports',
      description: 'Generate polished CSV and executive PDF audit packs in 1 click. Give your finance team line-by-line justification for every software renewal.',
      badge: 'Finance Approved'
    },
    {
      icon: Users,
      title: 'Department Waste Breakdown',
      description: 'See which teams (Engineering, Sales, Marketing, Product) have the highest license waste and track your optimization progress month-over-month.',
      badge: 'Team Insights'
    },
    {
      icon: ShieldCheck,
      title: 'Privacy-by-Design & Zero Password Access',
      description: 'Built with enterprise-grade privacy. We never access your documents, files, or message contents. We only read user identity metadata.',
      badge: 'Privacy First'
    }
  ];

  return (
    <section id="features" className="py-20 sm:py-28 border-t border-zinc-800/80 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Enterprise Power • Startup Simplicity
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Everything You Need to End SaaS Waste Forever
          </h2>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base">
            Built specifically for fast-moving startups who don\'t have 6 months or \$20,000 for complex enterprise procurement suites.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-7 hover:border-zinc-700 hover:bg-zinc-900/70 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-zinc-800/90 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-400 border border-zinc-700/60">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
