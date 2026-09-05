'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight, Lock, Mail, Building, User, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function SignupForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationPending, setVerificationPending] = useState(false);

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
  const isFormValid =
    fullName.trim().length > 0 &&
    companyName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8 &&
    passwordsMatch &&
    agreedToTerms;

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!agreedToTerms) {
      setErrorMessage('You must agree to the Terms of Service and Privacy Policy to proceed.');
      return;
    }

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
      const origin = window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/app`,
          data: {
            full_name: fullName.trim(),
            company_name: companyName.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user && !data.session) {
        // Confirmation email required
        setVerificationPending(true);
      } else if (data.session) {
        router.push('/app');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=/app`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initiate Google signup.');
      setGoogleLoading(false);
    }
  };

  if (verificationPending) {
    return (
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-black relative text-center overflow-hidden animate-in fade-in">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#8ce04a]/15 blur-3xl pointer-events-none -z-10" />

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8ce04a]/10 border border-[#8ce04a]/30 text-[#8ce04a] mx-auto mb-5 shadow-lg shadow-[#8ce04a]/10">
          <ShieldCheck className="h-7 w-7" />
        </div>

        <h2 className="text-2xl font-black tracking-tight text-white mb-2">
          Verify Your Email
        </h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed mb-6">
          Account created! We&apos;ve sent a confirmation link to{' '}
          <span className="text-white font-semibold break-all">{email}</span>.
          Please check your inbox (and spam folder) to activate your account.
        </p>

        <div className="space-y-3">
          <Link
            href={`/verify-email?email=${encodeURIComponent(email)}`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.99]"
          >
            <span>Go to Email Verification</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-2.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
          >
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-black relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#8ce04a]/15 blur-3xl pointer-events-none -z-10" />

      <div className="text-center mb-8">
        <h1 className="text-2xl font-black tracking-tight text-white">
          Create Your SlashSaaS Account
        </h1>
        <p className="mt-2 text-xs text-zinc-400">
          Get started with your multi-tenant organization workspace.
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

      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[0.04] py-3 text-xs font-semibold text-white hover:bg-white/[0.08] hover:border-white/25 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
          />
          <path
            fill="#FBBC05"
            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
          />
        </svg>
        <span>{googleLoading ? 'Connecting Google...' : 'Sign up with Google'}</span>
      </button>

      <div className="relative my-6 text-center text-xs text-zinc-500">
        <span className="bg-zinc-950 px-3 relative z-10 font-medium">Or register with email</span>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
      </div>

      <form onSubmit={handleEmailSignup} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1" htmlFor="signup-name">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              id="signup-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Rivera"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1" htmlFor="signup-company">
            Company Name
          </label>
          <div className="relative">
            <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              id="signup-company"
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Technologies"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1" htmlFor="signup-email">
            Work Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              id="signup-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1" htmlFor="signup-password">
            Password (min. 8 characters)
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              id="signup-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
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
              <div className="flex justify-between items-center text-[10px] text-zinc-400">
                <span>
                  Strength:{' '}
                  <strong
                    className={
                      strength <= 2
                        ? 'text-rose-400'
                        : strength <= 3
                        ? 'text-amber-400'
                        : 'text-[#8ce04a]'
                    }
                  >
                    {strength <= 2 ? 'Weak' : strength <= 3 ? 'Medium' : 'Strong'}
                  </strong>
                </span>
                {password.length < 8 && <span className="text-rose-400">Min 8 characters required</span>}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1" htmlFor="signup-confirm-password">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              id="signup-confirm-password"
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
          {passwordsMatch && confirmPassword.length >= 8 && (
            <p className="mt-1 text-[11px] text-[#8ce04a] flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Passwords match</span>
            </p>
          )}
        </div>

        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer text-zinc-300 hover:text-white select-none">
            <input
              type="checkbox"
              required
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-zinc-900 text-[#8ce04a] focus:ring-[#8ce04a] focus:ring-offset-black accent-[#8ce04a] mt-0.5 shrink-0"
            />
            <span className="text-xs text-zinc-400 leading-tight">
              I agree to the{' '}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline hover:text-[#8ce04a] font-medium"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline hover:text-[#8ce04a] font-medium"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading || !isFormValid}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.99] disabled:opacity-50 mt-4 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <span>Creating account...</span>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
