'use client';

import React from 'react';
import { Check, X, Sparkles, Zap, ShieldCheck } from 'lucide-react';

export const ComparisonTable: React.FC = () => {
  const rows = [
    {
      feature: 'Setup & Onboarding Time',
      slashsaas: '60 Seconds (API Connect)',
      legacy: '3 to 6 Months',
      manual: 'Never-ending maintenance',
      highlight: true,
    },
    {
      feature: 'Invasive Desktop Agent Required',
      slashsaas: 'Never (100% Cloud API)',
      legacy: 'Yes (Endpoint MDM Agent)',
      manual: 'No',
      highlight: false,
    },
    {
      feature: 'Autonomous Slack DM Nudges',
      slashsaas: '1-Click Direct in Slack',
      legacy: 'Manual IT Helpdesk Tickets',
      manual: 'Awkward manual emails',
      highlight: true,
    },
    {
      feature: 'Pricing & Transparency',
      slashsaas: '$39 – $95 / month (Public)',
      legacy: '$20,000+ / yr + Hidden Fees',
      manual: '$0 (Costly in wasted hours)',
      highlight: true,
    },
    {
      feature: 'Contract Lock-in',
      slashsaas: 'Month-to-month, cancel anytime',
      legacy: '1 to 3 Year Enterprise Lock-in',
      manual: 'None',
      highlight: false,
    },
    {
      feature: 'Privacy & Permissions',
      slashsaas: 'Strict Read-Only Login Scopes',
      legacy: 'Broad system & file read access',
      manual: 'Full admin access required',
      highlight: false,
    },
    {
      feature: 'Pre-Renewal Board Reports',
      slashsaas: 'Instant 1-Click Executive CSV',
      legacy: 'Complex BI Report Builders',
      manual: 'Manual Excel pivot tables',
      highlight: true,
    },
  ];

  return (
    <section id="comparisons" className="py-24 border-t border-white/[0.06] bg-black relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8ce04a]">
            Honest Comparison
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built for Startups, Not 10,000-Person Bureaucracies
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            See why fast-moving engineering teams choose SlashSaaS over bloated legacy IT tools and manual spreadsheets.
          </p>
        </div>

        {/* Comparison Table Container */}
        <div className="overflow-x-auto rounded-3xl border border-white/[0.08] bg-zinc-950/80 shadow-2xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                <th className="p-5 sm:p-6 font-bold text-zinc-400 w-2/5">Evaluation Metric</th>
                <th className="p-5 sm:p-6 font-extrabold text-white bg-[#8ce04a]/[0.08] border-x border-[#8ce04a]/20 w-1/3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#8ce04a]" />
                    <span className="text-base text-white">SlashSaaS</span>
                    <span className="text-[10px] text-[#a3e635] bg-[#8ce04a]/20 px-2 py-0.5 rounded-full uppercase font-bold">Modern</span>
                  </div>
                </th>
                <th className="p-5 sm:p-6 font-semibold text-zinc-400">
                  Legacy Enterprise Tools <br />
                  <span className="text-[11px] text-zinc-500 font-normal">(Zylo, Torii, Productiv)</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-zinc-300">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-5 sm:p-6 font-medium text-zinc-300 flex items-center gap-2">
                    <span>{row.feature}</span>
                  </td>

                  {/* SlashSaaS Column */}
                  <td className="p-5 sm:p-6 font-bold text-white bg-[#8ce04a]/[0.04] border-x border-[#8ce04a]/20">
                    <div className="flex items-center gap-2 text-[#a3e635]">
                      <Check className="h-4 w-4 text-[#8ce04a] shrink-0" />
                      <span>{row.slashsaas}</span>
                    </div>
                  </td>

                  {/* Legacy Column */}
                  <td className="p-5 sm:p-6 text-zinc-400">
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-zinc-600 shrink-0" />
                      <span>{row.legacy}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
