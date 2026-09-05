'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CookieBanner } from '@/components/CookieBanner';
import { track } from '@vercel/analytics';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Please enter a valid work email.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), planInterest: 'early_access', source: 'homepage_cta' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit. Please try again.');
      try {
        track('waitlist_signup', { source: 'homepage_cta' });
      } catch {}
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased relative min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      {/* Ambient background: aurora glows + dotted grid */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1000px] max-w-full h-[550px] bg-primary-container/15 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-tertiary-container/10 rounded-full blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#34343d_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
        <div className="h-16 max-w-[80rem] mx-auto px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop flex items-center justify-between">
          <Link href="/" className="flex items-center gap-space-sm group">
            <span className="material-symbols-outlined text-primary text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              blur_on
            </span>
            <span className="font-headline-md text-headline-md tracking-tight text-on-surface">SlashSaaS</span>
            <span className="font-label-mono-sm text-label-mono-sm px-space-xs py-space-2xs rounded-full bg-tertiary-container/20 text-tertiary border border-tertiary/30 uppercase tracking-wider hidden sm:inline-block">
              AI Visibility
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-space-lg">
            <a className="font-nav-pill text-nav-pill text-on-surface-variant hover:text-on-surface transition-colors" href="#how-it-works">How it works</a>
            <a className="font-nav-pill text-nav-pill text-on-surface-variant hover:text-on-surface transition-colors" href="#features">Features</a>
            <a className="font-nav-pill text-nav-pill text-on-surface-variant hover:text-on-surface transition-colors" href="#faq">FAQ</a>
          </nav>
          <div className="flex items-center gap-space-md">
            <Link className="font-nav-pill text-nav-pill text-on-surface-variant hover:text-on-surface transition-colors hidden sm:inline-block" href="/login">
              Sign in
            </Link>
            <Link
              className="font-headline-sm text-headline-sm px-space-md py-space-xs rounded-lg bg-gradient-to-r from-primary-container via-secondary-container to-tertiary text-on-primary shadow-[0_0_20px_rgba(148,125,255,0.35)] hover:shadow-[0_0_25px_rgba(47,217,244,0.45)] hover:-translate-y-0.5 transition-all duration-200"
              href="/signup"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full pt-16 relative z-10">
        <div className="flex flex-col w-full">
          {/* 1. HERO */}
          <section className="relative w-full overflow-hidden px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop py-space-2xl lg:py-space-3xl">
            <div className="max-w-[80rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
              {/* Left: copy */}
              <div className="lg:col-span-7 flex flex-col items-start gap-space-md z-10 animate-reveal">
                <div className="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-surface-container border border-outline-variant/30 shadow-[0_0_15px_rgba(148,125,255,0.15)]">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_8px_rgba(47,217,244,0.9)]" />
                  <span className="font-label-mono-sm text-label-mono-sm text-on-surface uppercase tracking-widest">AI Search Visibility Monitoring</span>
                  <span className="font-label-mono-sm text-label-mono-sm px-1.5 py-0.5 rounded bg-primary-container/25 text-primary text-[9px] uppercase font-semibold">Live</span>
                </div>
                <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero tracking-tight text-on-surface">
                  Own the answer,<br />
                  <span className="bg-gradient-to-r from-primary-container via-secondary-container to-tertiary bg-clip-text text-transparent">not just the ranking.</span>
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                  Your buyers ask ChatGPT, Perplexity and Gemini for a recommendation — SlashSaaS watches those answers every day and shows whether it&apos;s you or your competitor.
                </p>
                <div className="flex flex-wrap items-center gap-space-md pt-space-xs w-full sm:w-auto">
                  <Link className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs font-headline-sm text-headline-sm px-space-lg py-space-sm rounded-xl bg-gradient-to-r from-primary-container via-secondary-container to-tertiary text-on-primary shadow-[0_0_24px_rgba(148,125,255,0.4)] hover:shadow-[0_0_35px_rgba(47,217,244,0.6)] hover:-translate-y-0.5 transition-all duration-200" href="/signup">
                    <span>Start free</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </Link>
                  <a className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs font-headline-sm text-headline-sm px-space-lg py-space-sm rounded-xl bg-surface-container/60 hover:bg-surface-container text-on-surface border border-outline-variant/40 hover:border-primary/50 transition-all duration-200 backdrop-blur-md" href="#how-it-works">
                    <span className="material-symbols-outlined text-tertiary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                    <span>See how it works</span>
                  </a>
                </div>
                <div className="pt-space-md mt-space-xs flex flex-col sm:flex-row items-start sm:items-center gap-space-sm text-on-surface-variant">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-2 h-2 rounded-full bg-tertiary" />
                    <span className="font-label-mono-sm text-label-mono-sm text-tertiary uppercase tracking-wider font-semibold">No credit card · public data only</span>
                  </div>
                  <span className="hidden sm:inline-block text-outline-variant">•</span>
                  <div className="flex items-center gap-space-xs flex-wrap font-label-mono-sm text-label-mono-sm text-on-surface">
                    <span className="px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant/20">ChatGPT</span>
                    <span className="px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant/20">Perplexity</span>
                    <span className="px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant/20">Google AI</span>
                    <span className="px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant/20">Gemini</span>
                  </div>
                </div>
              </div>
              {/* Right: crystal visual */}
              <div className="lg:col-span-5 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-container/20 via-tertiary/10 to-transparent rounded-full blur-[100px] -z-10 pointer-events-none" />
                <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
                  <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_50px_rgba(148,125,255,0.25)] border border-primary/20 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="AI Search Visibility crystalline prism" className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-700" src="/hero-crystal.jpg" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-dim/80 via-transparent to-transparent" />
                  </div>
                  <div className="absolute -top-3 -right-2 sm:right-0 bg-surface-container-high/90 backdrop-blur-xl border border-tertiary/30 px-space-sm py-space-xs rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] flex items-center gap-space-xs animate-bounce" style={{ animationDuration: '4s' }}>
                    <div className="w-6 h-6 rounded-lg bg-tertiary-container/30 flex items-center justify-center text-tertiary">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                    </div>
                    <div>
                      <p className="font-label-mono-sm text-[10px] text-tertiary uppercase font-bold">Perplexity</p>
                      <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">Recommended #1</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -left-2 sm:left-0 bg-surface-container-high/90 backdrop-blur-xl border border-primary/30 px-space-sm py-space-xs rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] flex items-center gap-space-xs">
                    <div className="w-6 h-6 rounded-lg bg-primary-container/30 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[16px]">insights</span>
                    </div>
                    <div>
                      <p className="font-label-mono-sm text-[10px] text-primary uppercase font-bold">Visibility score</p>
                      <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">62% this month</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. PRODUCT PREVIEW */}
          <section className="w-full px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop py-space-xl">
            <div className="max-w-[80rem] mx-auto">
              <div className="w-full rounded-2xl bg-surface-container/70 backdrop-blur-xl border border-outline-variant/30 shadow-[0_25px_70px_rgba(0,0,0,0.6)] overflow-hidden">
                <div className="px-space-md py-space-sm bg-surface-container-highest/60 border-b border-outline-variant/20 flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-3 h-3 rounded-full bg-error/70" />
                    <span className="w-3 h-3 rounded-full bg-surface-bright" />
                    <span className="w-3 h-3 rounded-full bg-tertiary/70" />
                    <span className="font-label-mono-sm text-label-mono-sm text-outline ml-space-xs hidden sm:inline">slashsaas · monitored intents · b2b-saas</span>
                  </div>
                  <div className="flex items-center gap-space-sm">
                    <span className="font-label-mono-sm text-label-mono-sm px-2 py-0.5 rounded bg-tertiary/10 text-tertiary border border-tertiary/20">SAMPLE PREVIEW</span>
                    <span className="material-symbols-outlined text-outline text-[18px]">sync</span>
                  </div>
                </div>
                <div className="p-space-md sm:p-space-lg lg:p-space-xl grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
                  {/* Visibility score + sparkline */}
                  <div className="lg:col-span-5 rounded-xl bg-surface-container-low/90 p-space-md border border-outline-variant/20 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-label-mono-md text-label-mono-md text-on-surface-variant uppercase tracking-wider">AI Visibility Score</span>
                        <span className="font-label-mono-sm text-label-mono-sm px-2 py-0.5 rounded-full bg-tertiary/15 text-tertiary border border-tertiary/30 font-semibold">+14% this month</span>
                      </div>
                      <div className="flex items-baseline gap-space-xs mt-space-xs">
                        <span className="font-display-hero text-[48px] leading-tight font-extrabold text-on-surface">62%</span>
                        <span className="font-label-mono-sm text-label-mono-sm text-outline">/ 100 index</span>
                      </div>
                    </div>
                    <div className="mt-space-md">
                      <svg className="w-full h-24 overflow-visible" viewBox="0 0 400 110">
                        <defs>
                          <linearGradient id="scoreGlow" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#2fd9f4" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#947dff" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d="M0,85 Q40,78 80,82 T160,60 T240,48 T320,38 T400,12 L400,110 L0,110 Z" fill="url(#scoreGlow)" />
                        <path d="M0,85 Q40,78 80,82 T160,60 T240,48 T320,38 T400,12" fill="none" stroke="#2fd9f4" strokeLinecap="round" strokeWidth="3" />
                        <circle className="animate-ping" cx="400" cy="12" fill="#2fd9f4" r="5" style={{ transformOrigin: '400px 12px' }} />
                        <circle cx="400" cy="12" fill="#ffffff" r="4" />
                      </svg>
                      <div className="flex justify-between font-label-mono-sm text-[11px] text-outline mt-1">
                        <span>30 days ago</span>
                        <span>15 days ago</span>
                        <span className="text-tertiary">Today</span>
                      </div>
                    </div>
                  </div>
                  {/* Share of voice */}
                  <div className="lg:col-span-7 rounded-xl bg-surface-container-low/90 p-space-md border border-outline-variant/20 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-space-xs">
                      <span className="font-label-mono-md text-label-mono-md text-on-surface-variant uppercase tracking-wider">Share of voice in AI answers</span>
                      <span className="font-label-mono-sm text-label-mono-sm text-outline">Category: B2B SaaS</span>
                    </div>
                    <div className="space-y-space-sm my-auto">
                      <SovBar label="Your brand (SlashSaaS)" pct={44} dot="bg-tertiary" bar="bg-gradient-to-r from-primary-container via-secondary-container to-tertiary" pctColor="text-tertiary font-bold" self />
                      <SovBar label="Rival A (incumbent)" pct={31} dot="bg-secondary" bar="bg-secondary/60" pctColor="text-on-surface-variant" />
                      <SovBar label="Rival B (legacy)" pct={25} dot="bg-outline" bar="bg-outline-variant/70" pctColor="text-on-surface-variant" />
                    </div>
                    <div className="pt-space-xs text-right">
                      <span className="font-label-mono-sm text-label-mono-sm text-tertiary">+13% visibility lead over Rival A</span>
                    </div>
                  </div>
                  {/* Sample audit row */}
                  <div className="lg:col-span-12 rounded-xl bg-surface-container-high/80 p-space-md border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-label-mono-sm text-label-mono-sm uppercase text-outline">Tracked prompt:</span>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">&ldquo;best project tool for startups&rdquo;</span>
                      </div>
                      <div className="flex items-center gap-space-xs flex-wrap font-label-mono-sm text-label-mono-sm mt-1">
                        <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant/20">ChatGPT: <strong className="text-secondary">Mentioned #2</strong></span>
                        <span className="px-2 py-0.5 rounded bg-tertiary/15 text-tertiary border border-tertiary/30">Perplexity: <strong className="text-tertiary font-bold">Recommended #1</strong></span>
                        <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant/20">Google AI: <strong className="text-primary">Cited 4×</strong></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-md pt-2 md:pt-0 border-t md:border-t-0 border-outline-variant/20">
                      <div>
                        <span className="font-label-mono-sm text-[11px] text-outline block">Sentiment</span>
                        <span className="font-headline-sm text-headline-sm text-tertiary font-bold">Positive</span>
                      </div>
                      <div className="h-8 w-px bg-outline-variant/30 hidden sm:block" />
                      <div>
                        <span className="font-label-mono-sm text-[11px] text-outline block">Citation sources</span>
                        <span className="font-body-sm text-body-sm text-on-surface font-medium">G2 • Reddit • Blog</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-space-xs font-label-mono-sm text-label-mono-sm text-outline text-center">Illustrative preview with sample data.</p>
            </div>
          </section>

          {/* 3. THE SHIFT */}
          <section className="w-full px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop py-space-2xl my-space-lg relative">
            <div className="absolute inset-0 bg-surface-container-low/50 -skew-y-1 -z-10" />
            <div className="max-w-[80rem] mx-auto flex flex-col items-center text-center">
              <span className="font-label-mono-sm text-label-mono-sm uppercase tracking-widest text-tertiary px-space-sm py-1 rounded-full bg-tertiary/10 border border-tertiary/20 mb-space-md">
                The search paradigm shift
              </span>
              <blockquote className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-surface max-w-4xl font-extrabold leading-tight">
                &ldquo;Buyers are skipping ten blue links on Google. They ask an AI assistant for a definitive shortlist, and they buy from the one or two names it recommends.&rdquo;
              </blockquote>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-lg mt-space-xl w-full max-w-2xl">
                <div className="p-space-md rounded-xl bg-surface-container border border-outline-variant/20 flex flex-col items-center">
                  <span className="font-display-hero text-headline-xl font-extrabold text-tertiary">0 clicks</span>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">needed for an AI answer to name a winner before a buyer ever visits a website</p>
                </div>
                <div className="p-space-md rounded-xl bg-surface-container border border-outline-variant/20 flex flex-col items-center">
                  <span className="font-display-hero text-headline-xl font-extrabold text-primary">1–2 names</span>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">is all an assistant usually recommends — and buyers act on exactly those</p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. HOW IT WORKS */}
          <section id="how-it-works" className="w-full px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop py-space-2xl scroll-mt-20">
            <div className="max-w-[80rem] mx-auto">
              <div className="flex flex-col items-start mb-space-xl">
                <span className="font-label-mono-sm text-label-mono-sm uppercase text-tertiary tracking-wider font-semibold">Continuous telemetry</span>
                <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-surface font-extrabold mt-1">Three steps to complete answer control.</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
                <Step n="01" numColor="text-primary" iconBg="bg-primary-container/20 text-primary" icon="tune" hover="hover:border-primary/40" title="Define what to watch" foot="• Instant onboarding • No code required" footColor="text-outline">
                  Add your brand, the buyer prompts you care about (e.g. <span className="text-on-surface font-mono text-xs">&lsquo;best project tool for startups&rsquo;</span>), and your direct competitors in under 2 minutes.
                </Step>
                <Step n="02" numColor="text-tertiary" iconBg="bg-tertiary-container/20 text-tertiary" icon="smart_toy" hover="hover:border-tertiary/40" title="We run the audits" foot="• Runs on a schedule" footColor="text-tertiary">
                  On a schedule, we ask real AI engines your exact prompts and read every answer — starting with Google Gemini, expanding across ChatGPT, Perplexity and Google AI.
                </Step>
                <Step n="03" numColor="text-secondary" iconBg="bg-secondary-container/20 text-secondary" icon="notifications_active" hover="hover:border-secondary/40" title="You see the truth over time" foot="• Email & webhook alerts" footColor="text-outline">
                  Track visibility drift, uncover the exact sources influencing the AI, and get alerted when a rival takes your spot in a high-value prompt.
                </Step>
              </div>
            </div>
          </section>

          {/* 5. BENTO FEATURES */}
          <section id="features" className="w-full px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop py-space-2xl scroll-mt-20">
            <div className="max-w-[80rem] mx-auto">
              <div className="flex flex-col items-start mb-space-xl">
                <span className="font-label-mono-sm text-label-mono-sm uppercase text-primary tracking-wider font-semibold">What you get</span>
                <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-surface font-extrabold mt-1">Precision GEO telemetry at every model layer.</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg">
                {/* Card 1: Visibility over time */}
                <div className="md:col-span-8 p-space-lg rounded-2xl bg-surface-container/70 border border-outline-variant/20 flex flex-col justify-between hover:border-outline-variant/40 transition-all">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-primary text-[20px]">show_chart</span>
                        <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Visibility score over time</h3>
                      </div>
                      <span className="font-label-mono-sm text-label-mono-sm px-2 py-0.5 rounded bg-primary-container/20 text-primary border border-primary/30">Time-series moat</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-xl">
                      AI answers change daily and can never be recovered after the fact. Every audit is stored, so you build a history no competitor can reconstruct.
                    </p>
                  </div>
                  <div className="mt-space-lg pt-space-md border-t border-outline-variant/20">
                    <svg className="w-full h-32 overflow-visible" viewBox="0 0 600 140">
                      <line opacity="0.3" stroke="#484555" strokeDasharray="3 3" x1="0" x2="600" y1="35" y2="35" />
                      <line opacity="0.3" stroke="#484555" strokeDasharray="3 3" x1="0" x2="600" y1="75" y2="75" />
                      <line opacity="0.3" stroke="#484555" strokeDasharray="3 3" x1="0" x2="600" y1="115" y2="115" />
                      <path d="M0,120 C100,110 150,90 220,70 C280,50 340,65 420,35 C480,15 540,25 600,10" fill="none" stroke="#2fd9f4" strokeLinecap="round" strokeWidth="3" />
                      <circle cx="420" cy="35" fill="#947dff" r="5" stroke="#ffffff" strokeWidth="2" />
                      <path d="M0,45 C120,50 200,60 300,75 C400,90 500,100 600,110" fill="none" stroke="#484555" strokeDasharray="4 4" strokeWidth="2" />
                    </svg>
                    <div className="flex justify-between font-label-mono-sm text-[11px] text-outline mt-2">
                      <span>Start</span>
                      <span className="text-primary font-semibold">Refinement</span>
                      <span className="text-tertiary font-semibold">#1 recommended</span>
                    </div>
                  </div>
                </div>
                {/* Card 2: Share of voice */}
                <div className="md:col-span-4 p-space-lg rounded-2xl bg-surface-container/70 border border-outline-variant/20 flex flex-col justify-between hover:border-outline-variant/40 transition-all">
                  <div>
                    <div className="flex items-center gap-space-xs mb-space-xs">
                      <span className="material-symbols-outlined text-tertiary text-[20px]">pie_chart</span>
                      <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Share of voice</h3>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">See which competitor owns which prompt, per intent and overall.</p>
                  </div>
                  <div className="my-space-md space-y-space-xs">
                    <div className="flex items-center justify-between font-label-mono-sm text-label-mono-sm">
                      <span className="text-on-surface">Prompt A</span>
                      <span className="text-tertiary font-bold">58% own</span>
                    </div>
                    <div className="w-full h-2 rounded bg-surface-container-highest overflow-hidden"><div className="h-full bg-tertiary rounded" style={{ width: '58%' }} /></div>
                    <div className="flex items-center justify-between font-label-mono-sm text-label-mono-sm pt-2">
                      <span className="text-on-surface">Prompt B</span>
                      <span className="text-secondary font-bold">42% own</span>
                    </div>
                    <div className="w-full h-2 rounded bg-surface-container-highest overflow-hidden"><div className="h-full bg-secondary rounded" style={{ width: '42%' }} /></div>
                  </div>
                  <div className="font-label-mono-sm text-label-mono-sm text-outline border-t border-outline-variant/20 pt-space-xs">Updated after every audit</div>
                </div>
                {/* Card 3: Citation intelligence */}
                <div className="md:col-span-4 p-space-lg rounded-2xl bg-surface-container/70 border border-outline-variant/20 flex flex-col justify-between hover:border-outline-variant/40 transition-all">
                  <div>
                    <div className="flex items-center gap-space-xs mb-space-xs">
                      <span className="material-symbols-outlined text-secondary text-[20px]">account_tree</span>
                      <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Citation intelligence</h3>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">Trace the exact docs, Reddit threads, and review pages the AI pulls from — so you know where to earn a mention.</p>
                  </div>
                  <div className="mt-space-md p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/20 font-label-mono-sm text-label-mono-sm space-y-1 text-on-surface-variant">
                    <p className="text-tertiary">• reddit.com/r/startups</p>
                    <p className="text-on-surface">• g2.com/categories</p>
                    <p className="text-outline">• your-blog.com/compare</p>
                  </div>
                </div>
                {/* Card 4: Change alerts */}
                <div className="md:col-span-4 p-space-lg rounded-2xl bg-surface-container/70 border border-outline-variant/20 flex flex-col justify-between hover:border-outline-variant/40 transition-all">
                  <div>
                    <div className="flex items-center gap-space-xs mb-space-xs">
                      <span className="material-symbols-outlined text-error text-[20px]">crisis_alert</span>
                      <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Change alerts</h3>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">Get an email or webhook notification the moment you drop out of an answer or a rival overtakes you.</p>
                  </div>
                  <div className="mt-space-md p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/20 flex items-center gap-space-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping" />
                    <span className="font-label-mono-sm text-label-mono-sm text-error">Alert: Rival A cited #1 in ChatGPT</span>
                  </div>
                </div>
                {/* Card 5: Evidence */}
                <div className="md:col-span-4 p-space-lg rounded-2xl bg-surface-container/70 border border-outline-variant/20 flex flex-col justify-between hover:border-outline-variant/40 transition-all">
                  <div>
                    <div className="flex items-center gap-space-xs mb-space-xs">
                      <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
                      <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Evidence, not vibes</h3>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">Every AI response is cached and timestamped, so you can inspect the exact wording behind each score.</p>
                  </div>
                  <div className="mt-space-md font-label-mono-sm text-[11px] text-outline p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/20 overflow-hidden font-mono">
                    Cached response • timestamped audit log
                  </div>
                </div>
                {/* Card 6: Every engine */}
                <div className="md:col-span-12 p-space-lg rounded-2xl bg-surface-container-low/90 border border-outline-variant/20 flex flex-col lg:flex-row items-center justify-between gap-space-lg">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Built to monitor every major AI assistant</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">One view across the engines your buyers actually use — because they don&apos;t all ask the same assistant.</p>
                  </div>
                  <div className="flex items-center gap-space-sm flex-wrap">
                    {['ChatGPT', 'Perplexity', 'Google AI', 'Gemini'].map((e) => (
                      <span key={e} className="px-space-sm py-space-xs rounded-lg bg-surface-container border border-outline-variant/30 font-label-mono-md text-label-mono-md text-on-surface">{e}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 6. TRUST */}
          <section className="w-full px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop py-space-2xl">
            <div className="max-w-[80rem] mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-space-xl">
                <span className="font-label-mono-sm text-label-mono-sm uppercase text-tertiary tracking-widest font-semibold">Security &amp; reliability</span>
                <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-surface font-extrabold mt-1">Zero-risk by design.</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">SlashSaaS acts as an outside buyer asking natural questions. We never touch your systems or your data.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
                <Trust icon="visibility" title="Read-only">We never post on your behalf, email for you, or alter anything you own.</Trust>
                <Trust icon="public" title="Public data only">We only process public brand names, public prompts, and the public answers AI gives.</Trust>
                <Trust icon="key_off" title="No account connections">Zero OAuth, zero API keys, zero security questionnaires. Nothing to plug in.</Trust>
                <Trust icon="cancel" title="Cancel anytime">Self-serve plans with a 1-click export of all your history whenever you leave.</Trust>
              </div>
            </div>
          </section>

          {/* 7. FAQ */}
          <section id="faq" className="w-full px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop py-space-2xl scroll-mt-20">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-space-xl">
                <span className="font-label-mono-sm text-label-mono-sm uppercase text-secondary tracking-widest font-semibold">Answers to common questions</span>
                <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-surface font-extrabold mt-1">Frequently asked questions</h2>
              </div>
              <div className="space-y-space-sm">
                <Faq q="How is GEO (Generative Engine Optimization) different from classic SEO?">
                  Classic SEO ranks links on a search page. GEO tracks whether conversational AI models synthesize and recommend your brand as the answer. Instead of counting links, it analyzes mentions, ranking position, and citation sources inside AI answers.
                </Faq>
                <Faq q="Which AI models does SlashSaaS monitor?">
                  We run your prompts against the assistants your buyers use — ChatGPT, Perplexity, Google AI Overviews, and Google Gemini. As frontier labs ship model refreshes, they flow into your workspace.
                </Faq>
                <Faq q="How often are the prompts refreshed?">
                  Audits run on a schedule (daily or more often, depending on your plan), and you can trigger an on-demand run any time you publish fresh content or PR.
                </Faq>
                <Faq q="Do we need engineers to set this up?">
                  Not at all. There are no tracking scripts or SDKs to install. Setup takes under two minutes — just specify your brand and the prompts you care about.
                </Faq>
              </div>
            </div>
          </section>

          {/* 8. FINAL CTA */}
          <section className="w-full px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop py-space-3xl mb-space-2xl">
            <div className="max-w-5xl mx-auto rounded-3xl bg-surface-container-high relative overflow-hidden p-space-xl md:p-space-3xl border border-outline-variant/30 shadow-[0_30px_90px_rgba(0,0,0,0.8)]">
              <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[700px] max-w-full h-[350px] bg-gradient-to-b from-primary-container/30 via-tertiary/20 to-transparent rounded-full blur-[100px] pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
                <span className="font-label-mono-sm text-label-mono-sm px-space-sm py-1 rounded-full bg-surface-container border border-primary/30 text-primary uppercase font-bold tracking-widest mb-space-md">
                  Continuous AI intelligence
                </span>
                <h2 className="font-display-hero text-display-hero-mobile md:text-headline-xl text-on-surface font-extrabold tracking-tight">
                  Start watching your AI visibility today.
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-sm mb-space-xl">
                  Create a free workspace, add your brand and competitors, and run your first audit in minutes.
                </p>
                <div className="w-full flex flex-col sm:flex-row items-center gap-space-xs max-w-lg justify-center">
                  <Link
                    href="/signup"
                    className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-space-xs font-headline-sm text-headline-sm px-space-lg py-space-sm rounded-xl bg-gradient-to-r from-primary-container via-secondary-container to-tertiary text-on-primary shadow-[0_0_25px_rgba(148,125,255,0.4)] hover:shadow-[0_0_35px_rgba(47,217,244,0.6)] hover:-translate-y-0.5 transition-all duration-200 font-semibold"
                  >
                    Create free workspace
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </Link>
                </div>
                <div className="mt-space-md flex items-center gap-space-xs font-label-mono-sm text-label-mono-sm text-outline">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                  <span>No credit card · public data only · cancel anytime</span>
                </div>

                {/* Secondary: launch updates */}
                <div className="mt-space-lg pt-space-lg border-t border-outline-variant/20 w-full max-w-lg">
                  <p className="font-label-mono-sm text-label-mono-sm text-outline mb-space-xs">Prefer updates first? Get our launch notes.</p>
                  {!submitted ? (
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-space-xs">
                      <input
                        className="w-full px-space-md py-space-sm rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface placeholder:text-outline focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary font-body-md text-body-md transition-all"
                        placeholder="you@company.com"
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto shrink-0 font-headline-sm text-headline-sm px-space-lg py-space-sm rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface hover:border-primary/50 transition-all duration-200 disabled:opacity-50"
                      >
                        {loading ? 'Joining…' : 'Notify me'}
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-center gap-space-xs font-body-sm text-body-sm text-tertiary">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      You&apos;re on the list — we&apos;ll be in touch.
                    </div>
                  )}
                  {error && <p className="mt-space-xs font-body-sm text-body-sm text-error">{error}</p>}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low/90 backdrop-blur-md relative z-10 mt-space-3xl">
        <div className="max-w-[80rem] mx-auto px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop py-space-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-space-xl mb-space-2xl">
            <div className="md:col-span-5 flex flex-col items-start gap-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>blur_on</span>
                <span className="font-headline-md text-headline-md tracking-tight text-on-surface">SlashSaaS</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">AI Search Visibility Monitoring for modern teams. Continuous intelligence across generative search models.</p>
              <a className="font-label-mono-md text-label-mono-md text-tertiary hover:underline mt-space-xs" href="mailto:support@slashsaas.com">support@slashsaas.com</a>
            </div>
            <div className="md:col-span-4 flex flex-col gap-space-xs">
              <span className="font-label-mono-sm text-label-mono-sm uppercase text-outline tracking-wider mb-space-xs">Resources</span>
              <div className="flex flex-wrap gap-x-space-lg gap-y-space-xs">
                <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/privacy">Privacy Policy</Link>
                <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/terms">Terms of Service</Link>
                <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/login">Sign in</Link>
              </div>
            </div>
            <div className="md:col-span-3 flex flex-col md:items-end justify-start">
              <div className="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container border border-outline-variant/40">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_8px_rgba(47,217,244,0.8)]" />
                <span className="font-label-mono-sm text-label-mono-sm text-on-surface">All engines operational</span>
              </div>
            </div>
          </div>
          <div className="pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-sm text-on-surface-variant border-t border-outline-variant/20">
            <p className="font-body-sm text-body-sm">© 2026 SlashSaaS · slashsaas.com</p>
            <p className="font-label-mono-sm text-label-mono-sm text-outline">Early access</p>
          </div>
        </div>
      </footer>

      <CookieBanner />
    </div>
  );
}

/* ---------- small helpers ---------- */

function SovBar({ label, pct, dot, bar, pctColor, self }: { label: string; pct: number; dot: string; bar: string; pctColor: string; self?: boolean }) {
  return (
    <div>
      <div className="flex justify-between font-body-sm text-body-sm mb-1">
        <span className={`flex items-center gap-1.5 ${self ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}>
          <span className={`w-2 h-2 rounded-full ${dot}`} /> {label}
        </span>
        <span className={`font-label-mono-sm text-label-mono-sm ${pctColor}`}>{pct}%</span>
      </div>
      <div className="w-full h-3 rounded-full bg-surface-container-highest overflow-hidden">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Step({ n, numColor, iconBg, icon, hover, title, foot, footColor, children }: { n: string; numColor: string; iconBg: string; icon: string; hover: string; title: string; foot: string; footColor: string; children: React.ReactNode }) {
  return (
    <div className={`p-space-lg rounded-2xl bg-surface-container/70 border border-outline-variant/20 flex flex-col justify-between ${hover} transition-all duration-300`}>
      <div>
        <div className="flex items-center justify-between mb-space-md">
          <span className={`font-label-mono-lg text-label-mono-lg font-bold ${numColor}`}>{n}</span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </div>
        </div>
        <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-space-xs">{title}</h3>
        <p className="font-body-md text-body-md text-on-surface-variant">{children}</p>
      </div>
      <div className={`mt-space-lg pt-space-sm border-t border-outline-variant/10 font-label-mono-sm text-label-mono-sm ${footColor}`}>{foot}</div>
    </div>
  );
}

function Trust({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="p-space-md rounded-xl bg-surface-container/60 border border-outline-variant/20 hover:border-tertiary/30 transition-all">
      <div className="w-8 h-8 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center mb-space-sm">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">{title}</h4>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{children}</p>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl bg-surface-container border border-outline-variant/30 overflow-hidden">
      <summary className="w-full px-space-lg py-space-md text-left flex items-center justify-between gap-space-sm cursor-pointer list-none">
        <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">{q}</span>
        <span className="material-symbols-outlined text-outline transition-transform duration-200 group-open:rotate-180">expand_more</span>
      </summary>
      <div className="px-space-lg pb-space-md pt-0 text-on-surface-variant font-body-md text-body-md">{children}</div>
    </details>
  );
}
