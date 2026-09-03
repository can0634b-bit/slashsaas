'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SlashLogo } from '@/components/Logo';
import { ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/app';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push(redirectPath);
      }
    });

    if (errorParam === 'auth_callback_failed') {
      setErrorMessage('Authentication failed or was cancelled. Please try again.');
    }
  }, [errorParam, redirectPath, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        router.push(redirectPath);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initiate Google sign in.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-black relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#8ce04a]/15 blur-3xl pointer-events-none -z-10" />

      <div className="text-center mb-8">
        <h1 className="text-2xl font-black tracking-tight text-white">
          Sign In to SlashSaaS
        </h1>
        <p className="mt-2 text-xs text-zinc-400">
          Access your workspace audit engine and license radar.
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

      {/* Social Sign In (Google Workspace) */}
      <button
        type="button"
        onClick={handleGoogleLogin}
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
        <span>{googleLoading ? 'Connecting Google...' : 'Continue with Google'}</span>
      </button>

      <div className="relative my-6 text-center text-xs text-zinc-500">
        <span className="bg-zinc-950 px-3 relative z-10 font-medium">Or with work email</span>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
      </div>

      {/* Email / Password Form */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5" htmlFor="login-email">
            Work Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              id="login-email"
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
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5" htmlFor="login-password">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
            />
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-zinc-900 text-[#8ce04a] focus:ring-[#8ce04a] focus:ring-offset-black accent-[#8ce04a]"
            />
            <span className="font-medium text-xs">Remember me on this device</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.99] disabled:opacity-50 mt-2"
        >
          {loading ? (
            <span>Signing in...</span>
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Top Brand Bar */}
      <header className="p-6 sm:p-8 flex justify-between items-center max-w-6xl mx-auto w-full">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <SlashLogo size="md" />
        </Link>
        <Link
          href="/signup"
          className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          Don&apos;t have an account? <span className="text-[#8ce04a]">Sign Up</span>
        </Link>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/80 p-8 text-center text-xs text-zinc-400">
            Loading sign in...
          </div>
        }>
          <LoginForm />
        </Suspense>
      </main>

      {/* Bottom Footer */}
      <footer className="p-6 text-center text-xs text-zinc-600">
        <p>© 2026 SlashSaaS. 100% Read-Only OAuth & Privacy-by-Design.</p>
      </footer>
    </div>
  );
}
