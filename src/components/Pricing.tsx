'use client';

import React, { useState } from 'react';
import { Check, Zap, Sparkles, ArrowRight, ShieldCheck, Lock, Calendar } from 'lucide-react';

interface PricingProps {
  onSelectPlan: (plan: 'growth' | 'scale') => void;
  onBookDemo?: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onSelectPlan, onBookDemo }) => {
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

  const handlePlanClick = (planId: 'growth' | 'scale') => {
    const growthUrl = process.env.NEXT_PUBLIC_LEMONSQUEEZY_GROWTH_URL;
    const scaleUrl = process.env.NEXT_PUBLIC_LEMONSQUEEZY_SCALE_URL;
    const checkoutUrl = planId === 'growth' ? growthUrl : scaleUrl;

    if (checkoutUrl && checkoutUrl.trim().length > 0) {
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Fall back to early access / waitlist modal
      onSelectPlan(planId);
    }
  };

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
    <section id="pricing" className="py-24 border-t border-white/[0.06] bg-zinc-950/40 relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8ce04a]">
            Transparent Pricing
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Pays for Itself in Your Very First Audit
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            No long-term commitments. Instant activation or request private early access.
          </p>

          {/* Billing Switch */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-zinc-950/80 p-1.5 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setAnnualBilling(false)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                !annualBilling ? 'bg-white text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setAnnualBilling(true)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                annualBilling ? 'bg-white text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-full ${
                annualBilling ? 'bg-zinc-900 text-[#8ce04a]' : 'bg-[#8ce04a]/20 text-[#a3e635]'
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
                    ? 'border-[#8ce04a]/50 bg-gradient-to-b from-[#8ce04a]/[0.08] via-zinc-950 to-zinc-950 shadow-2xl shadow-emerald-950/30 ring-1 ring-[#8ce04a]/30'
                    : 'border-white/[0.08] bg-zinc-950 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8ce04a]">
                      {plan.badge}
                    </span>
                    {plan.popular && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#a3e635] bg-[#8ce04a]/10 px-2.5 py-0.5 rounded-full border border-[#8ce04a]/20">
                        <Sparkles className="h-3 w-3" /> Recommended
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">{plan.desc}</p>

                  <div className="flex items-baseline gap-1.5 mb-8 pb-6 border-b border-white/[0.08]">
                    <span className="text-4xl sm:text-5xl font-black text-white">${price}</span>
                    <span className="text-xs text-zinc-400 font-medium">/ month</span>
                    {annualBilling && (
                      <span className="text-[11px] text-[#8ce04a] font-semibold ml-2">
                        (Billed annually)
                      </span>
                    )}
                  </div>

                  {/* Feature List */}
                  <ul className="space-y-3.5 text-xs text-zinc-300 mb-8">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-[#8ce04a] shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => handlePlanClick(plan.id)}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs sm:text-sm font-bold transition-all shadow-xl active:scale-95 ${
                      plan.popular
                        ? 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-white/10'
                        : 'border border-white/20 bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Choose {plan.name}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleDemoClick}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Book a 15-Min Walkthrough</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#8ce04a]" />
          <span>All payments processed securely via LemonSqueezy with instant license key activation.</span>
        </div>
      </div>
    </section>
  );
};
