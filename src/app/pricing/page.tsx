import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MarketingAuthNav } from '@/components/marketing/MarketingAuthNav';
import { SlashLogoIcon } from '@/components/Logo';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple, transparent pricing for SlashSaaS AI Search Visibility monitoring. Track how AI assistants answer about your brand.',
};

type Plan = {
  name: string;
  tagline: string;
  price: string;
  cadence: string;
  highlight?: boolean;
  badge?: string;
  cta: string;
  features: string[];
};

const plans: Plan[] = [
  {
    name: 'Radar',
    tagline: 'Start watching the answers that decide your deals.',
    price: '$29',
    cadence: '/ month',
    cta: 'Start with Radar',
    features: [
      '1 brand monitored',
      'Up to 15 tracked buyer prompts',
      'Track up to 5 competitors',
      'Daily autonomous audits (Premium Live AI, grounded)',
      'Visibility Score, Share of Voice & trend over time',
      'AI action-plan recommendations',
      'Change alerts (email / webhook)',
      '30-day answer history',
    ],
  },
  {
    name: 'Command',
    tagline: 'The full-depth intelligence layer on how AI answers about you.',
    price: '$59',
    cadence: '/ month',
    highlight: true,
    badge: 'Most popular',
    cta: 'Start with Command',
    features: [
      'Everything in Radar, plus:',
      'Up to 3 brands monitored',
      'Up to 45 tracked buyer prompts',
      'Track up to 15 competitors',
      'Daily autonomous monitoring + change alerts',
      'Citation Source Intelligence — where the AI gets its answers',
      'Sentiment & tone analysis (positive / neutral / negative)',
      'Average-rank positioning when you’re mentioned',
      '“What changed” answer-diff history — your moat',
      'Competitor benchmark matrix',
      'Shareable, branded PDF visibility reports',
      'Full audit history & raw-answer evidence',
      'Priority GEO action-plan recommendations',
      'Public-data-only — we never touch your accounts',
    ],
  },
];

import { createClient } from '@/lib/supabase/server';

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  let userPlan = 'free';

  if (session?.user) {
    const { data: memberData } = await supabase
      .from('memberships')
      .select('org_id')
      .eq('user_id', session.user.id)
      .single();

    if (memberData?.org_id) {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('plan')
        .eq('id', memberData.org_id)
        .single();
      userPlan = orgData?.plan || 'free';
    }
  }

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased relative min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[20%] right-[-10%] w-[800px] h-[600px] bg-primary-container/10 rounded-full blur-[160px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-tertiary-container/10 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#34343d_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
        <div className="h-16 max-w-[80rem] mx-auto px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop flex items-center justify-between">
          <Link href="/" className="flex items-center gap-space-sm group">
            <SlashLogoIcon size={28} className="h-7 w-7" />
            <span className="font-headline-md text-headline-md tracking-tight text-on-surface">SlashSaaS</span>
            <span className="font-label-mono-sm text-label-mono-sm px-space-xs py-space-2xs rounded-full bg-tertiary-container/20 text-tertiary border border-tertiary/30 uppercase tracking-wider hidden sm:inline-block">
              AI Visibility
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-space-lg">
            <Link className="font-nav-pill text-nav-pill text-on-surface-variant hover:text-on-surface transition-colors" href="/#how-it-works">How it works</Link>
            <Link className="font-nav-pill text-nav-pill text-on-surface-variant hover:text-on-surface transition-colors" href="/#features">Features</Link>
            <Link className="font-nav-pill text-nav-pill text-tertiary hover:opacity-80 transition-opacity" href="/scorecard">Free check</Link>
            <Link className="font-nav-pill text-nav-pill text-primary transition-colors" href="/pricing">Pricing</Link>
            <Link className="font-nav-pill text-nav-pill text-on-surface-variant hover:text-on-surface transition-colors" href="/#faq">FAQ</Link>
          </nav>
          <div className="flex items-center gap-space-md">
            <MarketingAuthNav />
          </div>
        </div>
      </header>

      <main className="w-full pt-16 relative z-10">
        {/* Heading */}
        <section className="px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop pt-space-2xl lg:pt-space-3xl pb-space-lg">
          <div className="max-w-[52rem] mx-auto text-center flex flex-col items-center gap-space-md">
            <div className="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-surface-container border border-outline-variant/30 shadow-[0_0_15px_rgba(148,125,255,0.15)]">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_8px_rgba(47,217,244,0.9)]" />
              <span className="font-label-mono-sm text-label-mono-sm text-on-surface uppercase tracking-widest">Pricing</span>
            </div>
            
            {userPlan === 'free' ? (
              <>
                <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero tracking-tight text-on-surface">
                  Pay for visibility,<br />
                  <span className="bg-gradient-to-r from-primary-container via-secondary-container to-tertiary bg-clip-text text-transparent">
                    not for dashboards.
                  </span>
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                  Every plan runs real audits against live AI engines and stores a history no competitor can reconstruct. Start small, scale when the answers start mentioning you.
                </p>
              </>
            ) : (
              <>
                <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero tracking-tight text-on-surface mt-space-md">
                  <span className="bg-gradient-to-r from-primary-container via-secondary-container to-tertiary bg-clip-text text-transparent">
                    {userPlan === 'command' ? 'You already have the best package.' : 'You currently have the Radar plan.'}
                  </span>
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                  You are actively subscribed to SlashSaaS. Head over to your workspace to manage your monitored intents, view reports, or adjust your settings.
                </p>
                <Link
                  href="/app"
                  className="mt-space-md inline-flex items-center justify-center gap-space-xs font-headline-sm text-headline-sm px-space-lg py-space-sm rounded-xl bg-gradient-to-r from-primary-container via-secondary-container to-tertiary text-on-primary shadow-[0_0_24px_rgba(148,125,255,0.4)] hover:shadow-[0_0_35px_rgba(47,217,244,0.6)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span>Go to workspace</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Pricing cards */}
        {userPlan === 'free' && (
        <section className="px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop pb-space-2xl">
          <div className="max-w-[64rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-space-lg items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-space-lg lg:p-space-xl flex flex-col backdrop-blur-xl shadow-md ${
                  plan.highlight
                    ? 'bg-surface-container-low/90 border border-primary/40 shadow-[0_0_40px_rgba(148,125,255,0.2)]'
                    : 'bg-surface-container-low/70 border border-outline-variant/25'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 right-space-lg inline-flex items-center gap-1 px-space-sm py-space-2xs rounded-full bg-gradient-to-r from-primary-container via-secondary-container to-tertiary text-on-primary font-label-mono-sm text-label-mono-sm font-bold uppercase tracking-wider shadow-lg">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    {plan.badge}
                  </span>
                )}

                <div className="flex flex-col gap-space-xs">
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">{plan.name}</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant min-h-[40px]">{plan.tagline}</p>
                </div>

                <div className="flex items-end gap-1 pt-space-md pb-space-lg">
                  <span className="font-display-hero text-[44px] leading-none font-black text-on-surface">{plan.price}</span>
                  <span className="font-body-md text-body-md text-on-surface-variant pb-1">{plan.cadence}</span>
                </div>

                <Link
                  href={plan.name === 'Radar' ? '/api/checkout?plan=radar' : plan.name === 'Command' ? '/api/checkout?plan=command' : '/signup'}
                  className={`w-full inline-flex items-center justify-center gap-space-xs font-headline-sm text-headline-sm px-space-lg py-space-sm rounded-xl transition-all duration-200 ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-primary-container via-secondary-container to-tertiary text-on-primary shadow-[0_0_24px_rgba(148,125,255,0.4)] hover:shadow-[0_0_35px_rgba(47,217,244,0.6)] hover:-translate-y-0.5'
                      : 'bg-surface-container/60 hover:bg-surface-container text-on-surface border border-outline-variant/40 hover:border-primary/50'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>

                <div className="mt-space-lg pt-space-lg border-t border-outline-variant/20 flex flex-col gap-space-sm">
                  {plan.features.map((feature, i) => {
                    const isIntro = feature.endsWith('plus:');
                    return (
                      <div key={i} className="flex items-start gap-space-xs">
                        {isIntro ? (
                          <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase tracking-wider">{feature}</span>
                        ) : (
                          <>
                            <span
                              className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${plan.highlight ? 'text-tertiary' : 'text-primary'}`}
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              check_circle
                            </span>
                            <span className="font-body-md text-body-md text-on-surface">{feature}</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Trust line */}
          <div className="max-w-[64rem] mx-auto mt-space-xl flex flex-col sm:flex-row items-center justify-center gap-space-md text-on-surface-variant">
            <span className="inline-flex items-center gap-space-xs font-label-mono-sm text-label-mono-sm">
              <span className="material-symbols-outlined text-tertiary text-[18px]">shield</span>
              Public data only — we never touch your accounts
            </span>
            <span className="hidden sm:inline text-outline-variant">·</span>
            <span className="inline-flex items-center gap-space-xs font-label-mono-sm text-label-mono-sm">
              <span className="material-symbols-outlined text-tertiary text-[18px]">credit_card_off</span>
              No credit card to start · cancel anytime
            </span>
          </div>
        </section>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-outline-variant/20 py-space-lg">
        <div className="max-w-[80rem] mx-auto px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <span className="font-label-mono-sm text-label-mono-sm text-outline">© {new Date().getFullYear()} SlashSaaS · AI Search Visibility (GEO)</span>
          <div className="flex items-center gap-space-md font-body-sm text-body-sm text-on-surface-variant">
            <Link className="hover:text-on-surface transition-colors" href="/">Home</Link>
            <Link className="hover:text-on-surface transition-colors" href="/privacy">Privacy</Link>
            <Link className="hover:text-on-surface transition-colors" href="/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
