'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { track } from '@vercel/analytics';

interface PromptResult {
  prompt: string;
  mentioned: boolean;
  excerpt: string;
  citations?: Array<{url: string; title?: string}>;
  error?: string;
}
interface ScorecardResult {
  brand: string;
  category: string;
  score: number;
  mentionedCount: number;
  total: number;
  results: PromptResult[];
}

export function ScorecardTool() {
  const [brand, setBrand] = useState('');
  const [domain, setDomain] = useState('');
  const [category, setCategory] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScorecardResult | null>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (brand.trim().length < 2) return setError('Please enter your brand name.');
    if (category.trim().length < 2) return setError('Please describe your category (e.g. "CRM software").');
    if (!emailRegex.test(email.trim())) return setError('Please enter a valid email.');

    setLoading(true);
    try {
      const res = await fetch('/api/scorecard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand: brand.trim(), domain: domain.trim(), category: category.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.limitReached && data.upgradeUrl) {
          window.location.href = `${data.upgradeUrl}?message=${encodeURIComponent("You've used your free checks — see plans to track continuously.")}`;
          return;
        }
        throw new Error(data.error || 'Failed to run the scorecard.');
      }

      // Capture the lead into the existing waitlist pipeline (fire-and-forget).
      fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          company: brand.trim(),
          planInterest: 'scorecard',
          source: 'scorecard',
        }),
      }).catch(() => {});

      try {
        track('scorecard_run', { source: 'scorecard' });
      } catch {}

      setResult(data as ScorecardResult);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  const inputCls =
    'w-full px-space-md py-space-sm rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary transition-all';
  const labelCls = 'block font-label-mono-sm text-label-mono-sm text-on-surface-variant mb-1.5';

  // ---------------- RESULT VIEW ----------------
  if (result) {
    const scoreColor =
      result.score >= 67 ? 'text-tertiary' : result.score >= 34 ? 'text-primary' : 'text-error';
    const verdict =
      result.score >= 67
        ? 'Strong — AI assistants already recommend you.'
        : result.score >= 34
        ? 'Partial — you show up sometimes, but rivals win the rest.'
        : result.score === 0
        ? 'Invisible — AI never named you for these buyer questions.'
        : 'Weak — you rarely surface when buyers ask AI.';

    return (
      <div className="w-full max-w-2xl mx-auto space-y-space-lg">
        {/* Score card */}
        <div className="rounded-2xl border border-outline-variant/25 bg-surface-container-low/80 backdrop-blur-xl p-space-xl text-center shadow-md relative overflow-hidden">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <p className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase tracking-widest relative">
            AI Visibility Score · {result.brand}
          </p>
          <div className={`font-display-hero text-[64px] leading-none font-black my-space-sm relative ${scoreColor}`}>
            {result.score}
            <span className="text-[28px]">%</span>
          </div>
          <p className="font-body-md text-body-md text-on-surface relative">{verdict}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 relative">
            Mentioned in {result.mentionedCount} of {result.total} AI answers about “{result.category}”.
          </p>
        </div>

        {/* Per-prompt evidence */}
        <div className="space-y-space-sm">
          {result.results.map((r, i) => (
            <div
              key={i}
              className="rounded-xl border border-outline-variant/20 bg-surface-container-low/60 p-space-md"
            >
              <div className="flex items-start justify-between gap-space-sm">
                <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">{r.prompt}</p>
                <span
                  className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-mono-sm text-label-mono-sm font-semibold ${
                    r.mentioned ? 'bg-tertiary/15 text-tertiary' : 'bg-surface-container-highest text-on-surface-variant'
                  }`}
                >
                  {r.mentioned ? 'Mentioned' : 'Not mentioned'}
                </span>
              </div>
                            {r.excerpt && (
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 line-clamp-3 border-l-2 border-outline-variant/30 pl-space-sm">
                  {r.excerpt}…
                </p>
              )}
              {r.citations && r.citations.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.citations.slice(0, 2).map((cit, idx) => {
                    let domain = '';
                    try { domain = new URL(cit.url).hostname; } catch(e) {}
                    return (
                      <a
                        key={idx}
                        href={cit.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors font-label-mono-sm text-[10px]"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        <span className="truncate max-w-[150px]">{cit.title || domain || cit.url}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-primary/30 bg-surface-container-low/80 backdrop-blur-xl p-space-lg text-center shadow-[0_0_30px_rgba(148,125,255,0.15)]">
          <h3 className="font-headline-md text-headline-md text-on-surface tracking-tight">
            This is one snapshot. Visibility changes daily.
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-md mx-auto">
            SlashSaaS tracks this every day across AI engines, benchmarks you against competitors, and alerts you when your score moves.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-space-sm mt-space-md">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs font-headline-sm text-headline-sm px-space-lg py-space-sm rounded-xl bg-gradient-to-r from-primary-container via-secondary-container to-tertiary text-on-primary shadow-[0_0_24px_rgba(148,125,255,0.4)] hover:-translate-y-0.5 transition-all"
            >
              Track it continuously — free
            </Link>
            <button
              onClick={reset}
              className="w-full sm:w-auto inline-flex items-center justify-center font-body-md text-body-md px-space-lg py-space-sm rounded-xl bg-surface-container text-on-surface border border-outline-variant/40 hover:bg-surface-container-high transition-colors"
            >
              Check another brand
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- FORM VIEW ----------------
  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl mx-auto rounded-2xl border border-outline-variant/25 bg-surface-container-low/80 backdrop-blur-xl p-space-lg sm:p-space-xl shadow-md space-y-space-md relative overflow-hidden"
    >
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-tertiary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md relative">
        <div>
          <label className={labelCls}>Brand name *</label>
          <input className={inputCls} placeholder="e.g. Notion" value={brand} onChange={(e) => setBrand(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Website (optional)</label>
          <input className={inputCls} placeholder="e.g. notion.so" value={domain} onChange={(e) => setDomain(e.target.value)} />
        </div>
      </div>

      <div className="relative">
        <label className={labelCls}>What do you sell? (category) *</label>
        <input
          className={inputCls}
          placeholder="e.g. note-taking app, CRM software, project management tool"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>

      <div className="relative">
        <label className={labelCls}>Work email *  ·  for occasional GEO tips &amp; product updates</label>
        <input className={inputCls} type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      {error && (
        <p className="font-body-sm text-body-sm text-error relative">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-space-xs font-headline-sm text-headline-sm px-space-lg py-space-sm rounded-xl bg-gradient-to-r from-primary-container via-secondary-container to-tertiary text-on-primary shadow-[0_0_24px_rgba(148,125,255,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 relative"
      >
        {loading ? 'Asking the AI…' : 'Get my free AI Visibility Score'}
      </button>
      <div className="space-y-1 mt-3">
        <p className="font-label-mono-sm text-label-mono-sm text-outline text-center relative">
          Your score appears right here in a few seconds — no inbox required.
        </p>
        <p className="font-label-mono-sm text-label-mono-sm text-outline text-center relative">
          Public data only · takes ~15 seconds · no credit card
        </p>
      </div>
    </form>
  );
}
