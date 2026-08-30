import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { SlashLogo } from '@/components/Logo';

export const metadata = {
  title: 'Terms of Service — SlashSaaS',
  description: 'Terms of Service for using the SlashSaaS SaaS optimization platform.',
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
            Last Updated: August 30, 2026 • Effective Immediately
          </p>
        </div>

        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed font-normal">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using <strong>SlashSaaS (slashsaas.com)</strong>, you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company, you represent that you have the authority to bind such entity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Subscription & Billing (LemonSqueezy)</h2>
            <p>
              Our order process is conducted by our online reseller and Merchant of Record, <strong>LemonSqueezy</strong>. LemonSqueezy handles all customer service inquiries and returns. Subscriptions renew automatically unless cancelled before the renewal date through your dashboard or by contacting support.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Acceptable Use & Security</h2>
            <p>
              You agree not to misuse SlashSaaS or help anyone else do so. You may only connect organizations, Google Workspace domains, and Slack workspaces that you own or have explicit administrative authorization to audit.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Contact & Support</h2>
            <p>
              For legal notices, terms inquiries, or billing assistance:
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
