import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SlashLogo } from '@/components/Logo';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your SlashSaaS organization workspace.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between">
      <header className="p-6 sm:p-8 flex justify-between items-center max-w-6xl mx-auto w-full">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <SlashLogo size="md" />
        </Link>
        <Link
          href="/signup"
          className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          Don&apos;t have an account? <span className="text-[#947dff]">Sign Up</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Suspense
          fallback={
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-surface-container-low/90 p-8 text-center text-xs text-zinc-400">
              Loading sign in...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>

      <footer className="p-6 text-center text-xs text-zinc-600">
        <p>© 2026 SlashSaaS. All rights reserved.</p>
      </footer>
    </div>
  );
}
