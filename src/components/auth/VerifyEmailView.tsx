'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Mail, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export function VerifyEmailView() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || cooldown > 0 || loading) return;

    setFeedback(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/app`,
        },
      });

      if (error) {
        throw error;
      }

      setFeedback({
        type: 'success',
        message: 'Confirmation email resent! Please check your inbox and spam folder.',
      });
      setCooldown(60);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to resend confirmation email. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-black relative text-center overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#8ce04a]/15 blur-3xl pointer-events-none -z-10" />

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8ce04a]/10 border border-[#8ce04a]/30 text-[#8ce04a] mx-auto mb-5 shadow-lg shadow-[#8ce04a]/10">
        <Mail className="h-7 w-7" />
      </div>

      <h1 className="text-2xl font-black tracking-tight text-white mb-2">
        Check Your Email
      </h1>
      <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed mb-6">
        We sent an account confirmation link to{' '}
        <span className="text-white font-semibold break-all">
          {email || 'your email address'}
        </span>
        . Click the link to activate your workspace.
      </p>

      {feedback && (
        <div
          role="alert"
          className={`mb-6 rounded-2xl border p-4 text-xs flex items-start gap-2.5 text-left animate-in fade-in ${
            feedback.type === 'success'
              ? 'border-[#8ce04a]/30 bg-[#8ce04a]/10 text-[#a3e635]'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#8ce04a]" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="space-y-3">
        {!email && (
          <div className="mb-3 text-left">
            <label className="block text-xs font-semibold text-zinc-300 mb-1" htmlFor="verify-email-input">
              Enter your email to resend link
            </label>
            <input
              id="verify-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
            />
          </div>
        )}

        <button
          type="button"
          onClick={handleResend}
          disabled={loading || cooldown > 0 || !email}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] py-3 text-xs font-bold text-white hover:bg-white/[0.1] hover:border-white/25 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>
            {loading
              ? 'Sending email...'
              : cooldown > 0
              ? `Resend available in ${cooldown}s`
              : 'Resend Confirmation Email'}
          </span>
        </button>

        <Link
          href="/login"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.99]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>

      <p className="mt-6 text-[11px] text-zinc-500">
        Did not receive it? Check your spam folder or ensure the email entered is correct.
      </p>
    </div>
  );
}
