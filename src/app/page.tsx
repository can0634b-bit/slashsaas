'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WaitlistModal } from '@/components/WaitlistModal';
import { CookieBanner } from '@/components/CookieBanner';
import { ArrowRight, Sparkles, Shield, Zap, Layers, Mail, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { track } from '@vercel/analytics';

export default function LandingPage() {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Please enter a valid work email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          planInterest: 'early_access',
          source: 'homepage_inline',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit. Please try again.');
      }

      try {
        track('waitlist_signup', {
          source: 'homepage_inline',
        });
      } catch {}

      setSubmitted(true);
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#8ce04a', '#a3e635', '#22c55e', '#ffffff'],
        });
      } catch {}
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Floating Glass Navigation */}
      <Navbar onOpenWaitlistModal={() => setIsWaitlistOpen(true)} />

      {/* Hero / Coming Soon Teaser */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 pt-32 pb-20 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[#8ce04a]/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-1/4 w-[350px] h-[250px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-3xl mx-auto text-center space-y-8 relative z-10">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#8ce04a]/30 bg-[#8ce04a]/10 px-4 py-1.5 text-xs font-bold text-[#a3e635] shadow-[0_0_20px_rgba(140,224,74,0.15)] animate-in fade-in zoom-in-95 duration-500">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#8ce04a]" />
            <span>Next Generation In Progress</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08]">
              SlashSaaS — <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
                Something new is coming.
              </span>
            </h1>
            <p className="max-w-xl mx-auto text-sm sm:text-base text-zinc-400 leading-relaxed">
              We are building the next evolution of modern SaaS tooling. Clean, fast, and engineered for high-performance teams.
            </p>
          </div>

          {/* Inline Waitlist Form */}
          <div className="max-w-md mx-auto pt-2">
            {!submitted ? (
              <form onSubmit={handleInlineSubmit} className="space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-2.5 bg-zinc-950/80 border border-white/10 p-1.5 rounded-2xl sm:rounded-full backdrop-blur-xl shadow-2xl focus-within:border-white/25 transition-all">
                  <div className="relative w-full flex-1 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-zinc-500 shrink-0" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your work email"
                      className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl sm:rounded-full bg-white px-6 py-2.5 text-xs sm:text-sm font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-md active:scale-95 disabled:opacity-50 shrink-0"
                  >
                    {loading ? (
                      <span>Joining...</span>
                    ) : (
                      <>
                        <span>Get Early Access</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <p className="text-xs text-rose-400 animate-in fade-in">{error}</p>
                )}
              </form>
            ) : (
              <div className="rounded-2xl border border-[#8ce04a]/30 bg-[#8ce04a]/10 p-4 text-xs text-[#a3e635] flex items-center justify-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#8ce04a]" />
                <span>You&apos;re on the priority early access list. We will notify you first.</span>
              </div>
            )}
          </div>

          {/* Value Pillars / Teaser Tags */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#8ce04a]" />
              <span>Engineered for Speed</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>Multi-Tenant Architecture</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Enterprise-Grade Security</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Early Access Modal */}
      <WaitlistModal
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
      />

      {/* Cookie Consent */}
      <CookieBanner />
    </div>
  );
}
