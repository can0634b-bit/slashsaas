import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SlashLogo } from '@/components/Logo';

export const metadata = {
  title: 'Terms of Service — SlashSaaS',
  description: 'Terms of Service for SlashSaaS.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-white selection:text-black">
      <header className="border-b border-white/[0.08] bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <SlashLogo size="md" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
        <div className="mb-12 border-b border-white/[0.08] pb-8">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Last Updated: September 4, 2026 • Effective Immediately
          </p>
        </div>

        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed font-normal">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using <strong>SlashSaaS (slashsaas.com)</strong>, you agree to comply with and be bound by these Terms of Service. If you are using our services on behalf of an organization, you represent that you have authority to bind that entity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Permitted Use & Account Responsibilities</h2>
            <p>
              You agree to use our services in compliance with all applicable laws and regulations. You are responsible for safeguarding your login credentials and for any activity that occurs under your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Intellectual Property</h2>
            <p>
              All software, design tokens, logos, and materials provided on SlashSaaS are the property of SlashSaaS and are protected by intellectual property laws.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Contact & Inquiries</h2>
            <p>
              For legal notices, terms questions, or inquiries:
            </p>
            <p className="text-xs text-[#8ce04a] font-mono">
              Email: support@slashsaas.com<br />
              Website: https://slashsaas.com
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
