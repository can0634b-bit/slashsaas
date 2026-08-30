'use client';

import React, { useState } from 'react';
import { Check, Zap, Sparkles, ArrowRight, ShieldCheck, Lock } from 'lucide-react';

interface PricingProps {
  onSelectPlan: (plan: 'growth' | 'scale') => void;
}

export const Pricing: React.FC<PricingProps> = ({ onSelectPlan }) => {
  const [annualBilling, setAnnualBilling] = useState(true);

  const plans = [
    {
      id: 'growth' as const,
      name: 'Growth Plan',
      desc: 'Perfect for fast-growing startups and scale-ups managing up to 60 team seats.',
      monthlyPrice: 49,
      annualPrice: 39,
      popular: true,
      badge: 'MOST POPULAR',
      features: [
        'Up to 60 tracked employee seats',
        'Continuous 24/7 OAuth & SAML token audit',
        'Autonomous 1-click Slack license nudge bot',
        'Google Workspace & Slack integrations',
        'Shadow IT & duplicate software detector',
        'CFO & Board-ready CSV audit exports',
        'Priority email & Slack support',
      ],
    },
    {
      id: 'scale' as const,
      name: 'Scale Plan',
      desc: 'For larger organizations demanding custom SSO, Okta SAML, and dedicated support.',
      monthlyPrice: 119,
      annualPrice: 95,
      popular: false,
      badge: 'UNLIMITED SCALE',
      features: [
        'Unlimited tracked employee seats',
        'Everything in Growth Plan',
        'Okta & Microsoft Azure Entra ID SSO',
        'Custom Slack bot branding & workflows',
        'Automated pre-renewal budget alerts',
        'Direct finance accounting sync',
        'Dedicated account manager & SLA',
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 border-t border-zinc-200 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-zinc-950/40 relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Transparent Pricing
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Pays for Itself in Your Very First Audit
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
            No long-term commitments. Instant activation via LemonSqueezy.
          </p>

          {/* Billing Switch */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-1.5 backdrop-blur-md shadow-xs">
            <button
              onClick={() => setAnnualBilling(false)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                !annualBilling ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setAnnualBilling(true)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                annualBilling ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-full ${
                annualBilling ? 'bg-emerald-500 text-white dark:bg-zinc-900 dark:text-emerald-400' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              }`}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const price = annualBilling ? plan.annualPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl border p-8 flex flex-col justify-between transition-all ${
                  plan.popular
                    ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-500/[0.06] via-white to-white dark:from-emerald-950/20 dark:via-zinc-950 dark:to-zinc-950 shadow-xl shadow-emerald-500/10 dark:shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                    : 'border-zinc-200/80 dark:border-white/[0.08] bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-white/20 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {plan.badge}
                    </span>
                    {plan.popular && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        <Sparkles className="h-3 w-3" /> Recommended
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-zinc-950 dark:text-white mb-2">{plan.name}</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">{plan.desc}</p>

                  <div className="flex items-baseline gap-1.5 mb-8 pb-6 border-b border-zinc-100 dark:border-white/[0.08]">
                    <span className="text-4xl sm:text-5xl font-black text-zinc-950 dark:text-white">${price}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">/ month</span>
                    {annualBilling && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold ml-2">
                        (Billed annually)
                      </span>
                    )}
                  </div>

                  {/* Feature List */}
                  <ul className="space-y-3.5 text-xs text-zinc-700 dark:text-zinc-300 mb-8">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onSelectPlan(plan.id)}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs sm:text-sm font-bold transition-all shadow-xl active:scale-95 ${
                    plan.popular
                      ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200'
                      : 'border border-zinc-200 dark:border-white/20 bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-white/10'
                  }`}
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Choose {plan.name}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>All payments processed securely via LemonSqueezy with instant license key activation.</span>
        </div>
      </div>
    </section>
  );
};
