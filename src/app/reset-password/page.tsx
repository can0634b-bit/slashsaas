import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SlashLogo } from '@/components/Logo';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your SlashSaaS account.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-white selection:text-black">
      <header className="p-6 sm:p-8 flex justify-between items-center max-w-6xl mx-auto w-full">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <SlashLogo size="md" />
        </Link>
        <Link
          href="/login"
          className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          Remember your password? <span className="text-[#8ce04a]">Sign In</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/80 p-8 text-center text-xs text-zinc-400">
            Loading password recovery...
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </main>

      <footer className="p-6 text-center text-xs text-zinc-600">
        <p>© 2026 SlashSaaS. All rights reserved.</p>
      </footer>
    </div>
  );
}
