'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight, Lock, AlertCircle, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Check if recovery code is in query params
    const code = searchParams.get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (!error) {
          setHasValidSession(true);
        } else {
          setErrorMessage('Recovery link is invalid or has expired. Please request a new one.');
        }
        setVerifyingSession(false);
      });
      return;
    }

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setHasValidSession(true);
      } else {
        // Also listen for auth state change event (e.g. PASSWORD_RECOVERY)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (session || event === 'PASSWORD_RECOVERY') {
            setHasValidSession(true);
          }
        });
        return () => subscription.unsubscribe();
      }
      setVerifyingSession(false);
    });
  }, [searchParams]);

  // Password strength calculation
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score; // 0 to 5
  };

  const strength = calculateStrength(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      setSuccessMessage('Password successfully updated! Redirecting to your workspace...');
      setTimeout(() => {
        router.push('/app');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update password. Please request a new link.');
    } finally {
      setLoading(false);
    }
  };

  if (verifyingSession) {
    return (
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/80 p-8 text-center text-xs text-zinc-400">
        Verifying password recovery session...
      </div>
    );
  }

  if (!hasValidSession && !successMessage) {
    return (
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-black relative text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Invalid or Expired Link</h2>
        <p className="text-xs text-zinc-400 mb-6">
          This password reset link has either expired or was already used. Please request a new link.
        </p>
        <Link
          href="/forgot-password"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all"
        >
          <span>Request New Reset Link</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-black relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#8ce04a]/15 blur-3xl pointer-events-none -z-10" />

      <div className="text-center mb-8">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#8ce04a]/10 border border-[#8ce04a]/30 text-[#8ce04a] mb-3">
          <KeyRound className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">
          Set New Password
        </h1>
        <p className="mt-2 text-xs text-zinc-400">
          Create a secure password for your SlashSaaS account.
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

      <form onSubmit={handlePasswordUpdate} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5" htmlFor="new-password">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              id="new-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
            />
          </div>

          {/* Password strength meter */}
          {password.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1 h-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    className={`flex-1 rounded-full transition-all ${
                      lvl <= strength
                        ? strength <= 2
                          ? 'bg-rose-500'
                          : strength <= 3
                          ? 'bg-amber-400'
                          : 'bg-[#8ce04a]'
                        : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-zinc-400">
                Strength:{' '}
                <span
                  className={
                    strength <= 2
                      ? 'text-rose-400'
                      : strength <= 3
                      ? 'text-amber-400'
                      : 'text-[#8ce04a]'
                  }
                >
                  {strength <= 2 ? 'Weak' : strength <= 3 ? 'Medium' : 'Strong'}
                </span>
                {password.length < 8 && ' (must be at least 8 chars)'}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5" htmlFor="confirm-password">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              id="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
            />
          </div>
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="mt-1 text-[11px] text-rose-400">Passwords do not match.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || password.length < 8 || !passwordsMatch}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.99] disabled:opacity-50 mt-2"
        >
          {loading ? (
            <span>Updating password...</span>
          ) : (
            <>
              <span>Update Password</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
