import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SlashLogo } from '@/components/Logo';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your SlashSaaS account password.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPage() {
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
        <ForgotPasswordForm />
      </main>

      <footer className="p-6 text-center text-xs text-zinc-600">
        <p>© 2026 SlashSaaS. All rights reserved.</p>
      </footer>
    </div>
  );
}
