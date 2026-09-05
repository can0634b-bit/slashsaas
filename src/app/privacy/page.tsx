import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { SlashLogo } from '@/components/Logo';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Official privacy policy for SlashSaaS.',
};

export default function PrivacyPage() {
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
          <div className="inline-flex items-center gap-2 rounded-full border border-[#8ce04a]/30 bg-[#8ce04a]/10 px-3.5 py-1 text-xs font-bold text-[#a3e635] mb-4">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Privacy & Security</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Last Updated: September 4, 2026 • Effective Immediately
          </p>
        </div>

        <div className="space-y-10 text-sm text-zinc-300 leading-relaxed font-normal">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#8ce04a]">1.</span> Overview
            </h2>
            <p>
              SlashSaaS (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates <strong>slashsaas.com</strong>. We respect your privacy and are committed to protecting personal information you provide when using our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#8ce04a]">2.</span> Information We Collect
            </h2>
            <p>We may collect information you provide directly to us, including:</p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li><strong>Account & Contact Info:</strong> Name, work email address, company name, and account credentials.</li>
              <li><strong>Workspace Data:</strong> Organization name and settings configured within the application.</li>
              <li><strong>Usage Telemetry:</strong> Anonymized usage data to help maintain performance and platform stability.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#8ce04a]">3.</span> How We Use Your Information
            </h2>
            <p>We use the collected information to:</p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>Provide, maintain, and improve our services and authentication infrastructure.</li>
              <li>Authenticate your account and preserve your active sessions.</li>
              <li>Notify you regarding important product updates or early access invitations.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#8ce04a]">4.</span> Security & Storage
            </h2>
            <p>
              We implement industry-standard encryption protocols (TLS in transit and AES-256 at rest) to safeguard your data against unauthorized access, loss, or misuse.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#8ce04a]">5.</span> Contact Us
            </h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact:
            </p>
            <p className="text-xs text-[#8ce04a] font-mono">
              Email: privacy@slashsaas.com / support@slashsaas.com<br />
              Website: https://slashsaas.com
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
