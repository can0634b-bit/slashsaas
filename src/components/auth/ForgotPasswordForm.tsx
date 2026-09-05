'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      });

      if (error) {
        throw error;
      }

      setSuccessMessage(
        'Password reset link sent! Please check your email inbox and spam folder for instructions.'
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-black relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#8ce04a]/15 blur-3xl pointer-events-none -z-10" />

      <div className="text-center mb-8">
        <h1 className="text-2xl font-black tracking-tight text-white">
          Reset Your Password
        </h1>
        <p className="mt-2 text-xs text-zinc-400">
          Enter your account email and we&apos;ll send you a secure recovery link.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-[#8ce04a]/30 bg-[#8ce04a]/10 p-4 text-xs text-[#a3e635] flex items-start gap-2.5 animate-in fade-in"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#8ce04a]" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleResetRequest} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5" htmlFor="forgot-email">
            Account Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              id="forgot-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.99] disabled:opacity-50 mt-2"
        >
          {loading ? (
            <span>Sending recovery link...</span>
          ) : (
            <>
              <span>Send Recovery Link</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </form>
    </div>
  );
}
