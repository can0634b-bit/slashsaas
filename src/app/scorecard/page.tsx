import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MarketingAuthNav } from '@/components/marketing/MarketingAuthNav';
import { SlashLogoIcon } from '@/components/Logo';
import { ScorecardTool } from '@/components/scorecard/ScorecardTool';

export const metadata: Metadata = {
  title: 'Free AI Visibility Scorecard',
  description:
    'Check for free how visible your brand is inside AI answers. Enter your brand and category and get an instant AI Visibility Score.',
  alternates: { canonical: '/scorecard' },
};

export default function ScorecardPage() {
  return (
    <div className="bg-surface font-body-md text-on-surface antialiased relative min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1000px] max-w-full h-[550px] bg-primary-container/15 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-tertiary-container/10 rounded-full blur-[160px]" />
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
            <Link className="font-nav-pill text-nav-pill text-on-surface-variant hover:text-on-surface transition-colors" href="/pricing">Pricing</Link>
          </nav>
          <div className="flex items-center gap-space-md">
            <MarketingAuthNav />
          </div>
        </div>
      </header>

      <main className="w-full pt-16 relative z-10">
        <section className="px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop pt-space-2xl lg:pt-space-3xl pb-space-2xl">
          {/* Heading */}
          <div className="max-w-[46rem] mx-auto text-center flex flex-col items-center gap-space-md mb-space-xl">
            <div className="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-surface-container border border-outline-variant/30 shadow-[0_0_15px_rgba(148,125,255,0.15)]">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_8px_rgba(47,217,244,0.9)]" />
              <span className="font-label-mono-sm text-label-mono-sm text-on-surface uppercase tracking-widest">Free Scorecard</span>
            </div>
            <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero tracking-tight text-on-surface">
              Does AI recommend<br />
              <span className="bg-gradient-to-r from-primary-container via-secondary-container to-tertiary bg-clip-text text-transparent">
                your brand?
              </span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Enter your brand and category. We ask real AI models the questions your buyers ask — and show whether you show up, instantly and free.
            </p>
          </div>

          <ScorecardTool />
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-outline-variant/20 py-space-lg">
        <div className="max-w-[80rem] mx-auto px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <span className="font-label-mono-sm text-label-mono-sm text-outline">© {new Date().getFullYear()} SlashSaaS · AI Search Visibility (GEO)</span>
          <div className="flex items-center gap-space-md font-body-sm text-body-sm text-on-surface-variant">
            <Link className="hover:text-on-surface transition-colors" href="/">Home</Link>
            <Link className="hover:text-on-surface transition-colors" href="/pricing">Pricing</Link>
            <Link className="hover:text-on-surface transition-colors" href="/privacy">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
