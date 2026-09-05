'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CookieBanner } from '@/components/CookieBanner';
import Hero3D from '@/components/Hero3D';
import {
  ArrowRight,
  Search,
  TrendingUp,
  Quote,
  Bell,
  ShieldCheck,
  Eye,
  Check,
  Mail,
  CheckCircle2,
  Radar,
  Sparkles,
} from 'lucide-react';
import { track } from '@vercel/analytics';

const ENGINES = ['ChatGPT', 'Perplexity', 'Google AI Overviews', 'Gemini'];

const STEPS = [
  {
    n: '01',
    title: 'Define what to watch',
    body: 'Add your brand, your real competitors, and the prompts your buyers actually type into an AI assistant. No integrations, no tracking pixels.',
  },
  {
    n: '02',
    title: 'We run the audits',
    body: 'SlashSaaS asks live AI engines those exact questions on a schedule and reads every answer — including the web sources each model cites.',
  },
  {
    n: '03',
    title: 'You see the truth over time',
    body: 'A visibility score, share of voice against each rival, the sources shaping the answers, and an alert the moment your position moves.',
  },
];

const FEATURES = [
  {
    icon: TrendingUp,
    title: 'Visibility score over time',
    body: 'AI answers change daily and can never be recovered after the fact. Every audit is stored, so you build a history no competitor can reconstruct.',
    span: 'lg:col-span-2',
  },
  {
    icon: Radar,
    title: 'Share of voice vs rivals',
    body: 'See exactly who the models name instead of you — per prompt and overall — and watch the gap widen or close.',
    span: '',
  },
  {
    icon: Quote,
    title: 'Citation intelligence',
    body: 'See which pages the models pull from, so you know precisely where to earn a mention.',
    span: '',
  },
  {
    icon: Bell,
    title: 'Change alerts',
    body: 'Get told the moment you drop out of an answer or a rival overtakes you — not three months later.',
    span: '',
  },
  {
    icon: Eye,
    title: 'Evidence, not vibes',
    body: 'Every number links back to the raw AI response that produced it. Inspect the exact wording behind each score.',
    span: '',
  },
  {
    icon: Search,
    title: 'Every major engine',
    body: 'ChatGPT, Perplexity, Google AI Overviews and Gemini in one view — because your buyers do not all ask the same assistant.',
    span: 'lg:col-span-2',
  },
];

const TRUST = [
  'Read-only — SlashSaaS never posts, emails, or acts on your behalf.',
  'Public data only — no customer data, no employee data, ever.',
  'No account connections — nothing to plug in, nothing to breach.',
  'Cancel anytime — your history exports with you.',
];

const FAQS = [
  {
    q: 'How is this different from an SEO or rank tracker?',
    a: 'SEO tools measure where you rank on a page of ten blue links. SlashSaaS measures whether an AI assistant names you at all when it gives a single, spoken recommendation — a fundamentally different surface with no public leaderboard to check.',
  },
  {
    q: 'Do I have to connect any accounts or install anything?',
    a: 'No. You enter your brand name, your competitors, and the prompts you care about. That is the only input. There is nothing to authorize and no code to add to your site.',
  },
  {
    q: 'Which engines and questions do you track?',
    a: 'You choose the prompts. We run them against the assistants your buyers actually use — ChatGPT, Perplexity, Google AI Overviews and Gemini — and read each answer with its grounded sources.',
  },
  {
    q: 'Is my data safe?',
    a: 'We only ever store public prompts and the public answers AI models give to them. We do not hold sensitive business data, credentials, or anything about your customers.',
  },
];

const ACCENT = '#7c5cff';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), planInterest: 'early_access', source: 'homepage_inline' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit. Please try again.');
      try {
        track('waitlist_signup', { source: 'homepage_inline' });
      } catch {}
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08070f] text-zinc-100 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* ===================== HERO (3D) ===================== */}
        <section className="relative overflow-hidden min-h-[94vh] flex items-center">
          <Hero3D />
          {/* legibility scrims over the 3D */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#08070f] via-[#08070f]/85 to-[#08070f]/20 sm:to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#08070f] to-transparent" />

          <div className="relative z-10 mx-auto max-w-6xl px-6 w-full pt-28 pb-16">
            <div className="max-w-2xl animate-reveal">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#7c5cff]/30 bg-[#7c5cff]/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#a78bfa] backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                AI Search Visibility Monitoring
              </div>

              <h1 className="mt-6 text-5xl sm:text-6xl lg:text-[4rem] font-bold tracking-tight leading-[1.03] text-white">
                Own the answer,
                <br />
                <span className="bg-gradient-to-r from-[#a78bfa] via-[#7c5cff] to-[#5b8cff] bg-clip-text text-transparent">
                  not just the ranking.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-zinc-300/90">
                Your buyers ask ChatGPT, Perplexity and Gemini for a recommendation — and act on the
                names they hear. SlashSaaS watches those answers every day and shows whether it&apos;s
                you or your competitor.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#7c5cff] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#7c5cff]/25 hover:bg-[#8b6dff] hover:shadow-[#7c5cff]/40 transition-all active:scale-[0.98]"
                >
                  Start free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.03] px-7 py-3.5 text-sm font-medium text-zinc-200 backdrop-blur-sm hover:bg-white/[0.07] hover:border-white/25 transition-colors"
                >
                  See how it works
                </a>
              </div>

              <p className="mt-4 text-xs text-zinc-500">
                No credit card. Public data only. We never touch your accounts.
              </p>

              <div className="mt-12 border-t border-white/[0.08] pt-6">
                <p className="text-[11px] uppercase tracking-wider text-zinc-600 mb-3">
                  Monitors the assistants your buyers use
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-zinc-400">
                  {ENGINES.map((e) => (
                    <span key={e}>{e}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== PRODUCT PREVIEW ===================== */}
        <section className="relative border-t border-white/[0.06]">
          <div className="mx-auto max-w-6xl px-6 py-24 lg:py-28">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-center">
              <div>
                <p className="text-sm font-semibold text-[#a78bfa]">Your visibility, at a glance</p>
                <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                  One dashboard for how AI talks about you.
                </h2>
                <p className="mt-5 text-[15px] leading-relaxed text-zinc-400 max-w-md">
                  A live score, share of voice against every rival, the sources shaping the answers,
                  and the exact prompts where you win or lose — building day after day into a history
                  only you own.
                </p>
              </div>
              <div className="relative">
                <div
                  className="absolute -inset-6 -z-10 rounded-[2rem] opacity-40 blur-2xl"
                  style={{ background: `radial-gradient(60% 60% at 60% 40%, ${ACCENT}55, transparent)` }}
                />
                <VisibilityPanel />
              </div>
            </div>
          </div>
        </section>

        {/* ===================== THE SHIFT ===================== */}
        <section className="border-t border-white/[0.06] bg-white/[0.015]">
          <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-[#a78bfa]">The search box moved.</p>
              <h2 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-snug">
                More buyers now skip Google and ask an AI assistant for the best tool, agency, or
                product — then act on the one or two names it gives them.
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-zinc-400 max-w-2xl">
                If the model doesn&apos;t mention you, you never enter the shortlist. And unlike a
                search ranking, there&apos;s no public position to check — the recommendation happens
                in a private chat you never see. SlashSaaS is how you see it.
              </p>
            </div>
          </div>
        </section>

        {/* ===================== HOW IT WORKS ===================== */}
        <section id="how" className="mx-auto max-w-6xl px-6 py-24 lg:py-28 scroll-mt-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[#a78bfa]">How it works</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">
              From blind spot to daily signal in three steps.
            </h2>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-4">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 hover:border-[#7c5cff]/30 transition-colors"
              >
                <div className="text-sm font-mono font-semibold text-[#a78bfa]">{s.n}</div>
                <h3 className="mt-4 text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===================== FEATURES (bento) ===================== */}
        <section className="border-t border-white/[0.06] bg-white/[0.015]">
          <div className="mx-auto max-w-6xl px-6 py-24 lg:py-28">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-[#a78bfa]">What you get</p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Everything you need to defend your place in the answer.
              </h2>
            </div>

            <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className={`group rounded-2xl border border-white/[0.08] bg-[#0c0b16] p-6 hover:border-[#7c5cff]/30 hover:bg-white/[0.03] transition-all ${f.span}`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7c5cff]/[0.12] text-[#a78bfa] group-hover:bg-[#7c5cff]/20 transition-colors">
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <h3 className="mt-5 text-base font-semibold text-white">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================== TRUST ===================== */}
        <section className="mx-auto max-w-6xl px-6 py-24 lg:py-28">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-[#7c5cff]/30 bg-[#7c5cff]/[0.08] px-3 py-1.5 text-xs font-semibold text-[#a78bfa]">
                <ShieldCheck className="h-4 w-4" />
                Zero-risk by design
              </div>
              <h2 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Built for a solo founder or a Fortune 500 — the same way.
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-zinc-400 max-w-lg">
                Most monitoring tools ask you to connect accounts and hand over data. SlashSaaS asks
                for none of it. It watches public AI answers, so there&apos;s nothing sensitive to
                store and nothing to breach.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3">
              <ul className="divide-y divide-white/[0.06]">
                {TRUST.map((t) => (
                  <li key={t} className="flex items-start gap-3 px-4 py-4">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7c5cff]/20 text-[#a78bfa]">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                    <span className="text-sm text-zinc-300">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ===================== FAQ ===================== */}
        <section className="border-t border-white/[0.06] bg-white/[0.015]">
          <div className="mx-auto max-w-3xl px-6 py-24 lg:py-28">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white text-center">
              Questions, answered.
            </h2>
            <div className="mt-12 divide-y divide-white/[0.07] border-y border-white/[0.07]">
              {FAQS.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-white">
                    {f.q}
                    <span className="text-[#a78bfa] transition-transform group-open:rotate-45 text-xl leading-none">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== FINAL CTA ===================== */}
        <section className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
          <div className="relative overflow-hidden rounded-3xl border border-[#7c5cff]/20 bg-gradient-to-b from-[#7c5cff]/[0.08] to-transparent p-10 sm:p-16 text-center">
            <div
              className="absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-[36rem] max-w-full opacity-40 blur-3xl -z-10"
              style={{ background: `radial-gradient(50% 50% at 50% 50%, ${ACCENT}66, transparent)` }}
            />
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Start watching your AI visibility today.
            </h2>
            <p className="mt-4 text-[15px] text-zinc-400 max-w-xl mx-auto">
              Create a free workspace, add your brand and competitors, and run your first audit in
              minutes.
            </p>

            <div className="mt-8 flex justify-center">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#7c5cff] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#7c5cff]/25 hover:bg-[#8b6dff] transition-all active:scale-[0.98]"
              >
                Create your free workspace
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-10 mx-auto max-w-md border-t border-white/[0.08] pt-8">
              <p className="text-xs text-zinc-500 mb-3">Prefer updates first? Get our launch notes.</p>
              {!submitted ? (
                <form onSubmit={handleInlineSubmit} className="flex flex-col sm:flex-row gap-2">
                  <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/12 bg-[#08070f] px-3 focus-within:border-[#7c5cff]/50 transition-colors">
                    <Mail className="h-4 w-4 text-zinc-500 shrink-0" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full bg-transparent py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl border border-white/12 bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/[0.09] transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Joining…' : 'Notify me'}
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 text-sm text-[#a78bfa]">
                  <CheckCircle2 className="h-4 w-4" />
                  You&apos;re on the list — we&apos;ll be in touch.
                </div>
              )}
              {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <CookieBanner />
    </div>
  );
}

/* Product visual — an illustrative AI Visibility panel (sample data). */
function VisibilityPanel() {
  const competitors = [
    { name: 'Your brand', value: 62, self: true },
    { name: 'Rival A', value: 71, self: false },
    { name: 'Rival B', value: 38, self: false },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.1] bg-[#0c0b16]/90 backdrop-blur-sm p-5 shadow-2xl shadow-black/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7c5cff]/[0.14] text-[#a78bfa]">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-white leading-none">AI Visibility Score</div>
            <div className="mt-1 text-[10px] text-zinc-500 leading-none">Last 30 days · 4 engines</div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7c5cff]/[0.14] px-2 py-1 text-[10px] font-semibold text-[#a78bfa]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7c5cff] animate-pulse" />
          Live
        </span>
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <div className="text-4xl font-bold tracking-tight text-white">62%</div>
          <div className="text-[11px] text-zinc-500">Mention rate across tracked prompts</div>
        </div>
        <div className="flex items-center gap-1 rounded-md bg-[#7c5cff]/[0.14] px-2 py-1 text-[11px] font-semibold text-[#a78bfa]">
          <TrendingUp className="h-3 w-3" />
          +9 pts
        </div>
      </div>

      <div className="mt-4 flex items-end gap-1 h-12">
        {[34, 41, 38, 45, 52, 48, 55, 51, 58, 62].map((v, i) => (
          <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-[#7c5cff]/50 to-[#a78bfa]" style={{ height: `${v}%` }} />
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Share of voice</div>
        {competitors.map((c) => (
          <div key={c.name}>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className={c.self ? 'font-semibold text-white' : 'text-zinc-400'}>{c.name}</span>
              <span className={c.self ? 'text-[#a78bfa]' : 'text-zinc-500'}>{c.value}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div className={`h-full rounded-full ${c.self ? 'bg-[#7c5cff]' : 'bg-white/25'}`} style={{ width: `${c.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-white/[0.07] bg-[#08070f] p-3">
        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
          <Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
          <span className="truncate">&ldquo;best project tool for startups&rdquo;</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[10px]">
          <span className="rounded bg-[#7c5cff]/[0.16] px-1.5 py-0.5 font-semibold text-[#a78bfa]">You · #2</span>
          <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-zinc-400">Rival A · #1</span>
          <span className="ml-auto text-zinc-600">Perplexity</span>
        </div>
      </div>
    </div>
  );
}
