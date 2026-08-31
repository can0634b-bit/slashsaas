'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Mail, Building, User } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SlashLogoIcon } from './Logo';
import { track } from '@vercel/analytics';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: 'growth' | 'scale' | 'audit' | null;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({
  isOpen,
  onClose,
  initialPlan = 'audit',
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsSubmitted(false);
    }
  }, [isOpen]);

  // Keyboard accessibility: Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic client validation
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
          name: name.trim() || undefined,
          company: company.trim() || undefined,
          planInterest: initialPlan || 'early_access',
          source: 'landing_modal',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit. Please try again.');
      }

      // Track key conversion in Vercel Analytics
      try {
        track('waitlist_signup', {
          plan: initialPlan || 'early_access',
          source: 'landing_modal',
        });
      } catch (trackErr) {
        console.error('Analytics tracking error:', trackErr);
      }

      setIsSubmitted(true);
      try {
        confetti({
          particleCount: 80,
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

  const getTitle = () => {
    if (initialPlan === 'growth') return 'Request Early Access: Growth Plan';
    if (initialPlan === 'scale') return 'Request Early Access: Scale Plan';
    return 'Get Early Access to SlashSaaS';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-6 sm:p-8 shadow-2xl shadow-black/90">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {!isSubmitted ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3.5 mb-6">
              <SlashLogoIcon size={34} />
              <div>
                <h3 id="waitlist-title" className="text-lg font-bold text-white tracking-tight">
                  {getTitle()}
                </h3>
                <p className="text-xs text-zinc-400">
                  Join our priority cohort. 100% read-only license waste elimination.
                </p>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-300"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="work-email">
                  Work Email Address <span className="text-[#8ce04a]">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    id="work-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@yourcompany.com"
                    autoFocus
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="full-name">
                  Full Name <span className="text-zinc-500 text-[10px]">(Optional)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    id="full-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="company-name">
                  Company / Organization <span className="text-zinc-500 text-[10px]">(Optional)</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    id="company-name"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Technologies"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-black/40 p-3 text-[11px] text-zinc-400 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-[#8ce04a] shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Privacy:</strong> We will only email you regarding your access status. No spam, ever.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-xs sm:text-sm font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <span>Securing your spot...</span>
                ) : (
                  <>
                    <span>Request Priority Access</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#8ce04a]/15 text-[#a3e635] border border-[#8ce04a]/30">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              You&apos;re on the Priority List!
            </h3>
            <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed">
              Thank you for requesting access for <strong>{email}</strong>. Our team is rolling out invitations in batches to ensure seamless onboarding.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 px-6 py-2.5 text-xs font-semibold text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
