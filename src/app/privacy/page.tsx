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
            Last Updated: September 5, 2026 • Effective Immediately
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
            <p>We only collect what we need to run the service:</p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li><strong>Account &amp; contact info:</strong> Your name, work email, company name, and authentication credentials.</li>
              <li><strong>Monitoring configuration:</strong> The public brand and competitor names you choose to track, and the prompts you ask us to run against AI assistants.</li>
              <li><strong>Generated results:</strong> The public answers that AI assistants return to your prompts, stored over time so you can see how they change.</li>
              <li><strong>Usage telemetry:</strong> Privacy-friendly, aggregated usage data to keep the platform fast and stable.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#8ce04a]">3.</span> What We Do <em>Not</em> Collect
            </h2>
            <p>
              SlashSaaS is built around data minimization. We never ask for, and never store:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>Your customers&apos; or employees&apos; personal data.</li>
              <li>Credentials, API keys, or tokens for your other accounts — the product requires no integrations to connect.</li>
              <li>Any private or confidential business data. We only ever process public brand names, public prompts, and the public answers AI assistants give to them.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#8ce04a]">4.</span> How We Use Your Information
            </h2>
            <p>We use the information above to:</p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>Run your configured prompts against AI assistants and record the results over time.</li>
              <li>Provide, maintain, secure, and improve the service and your account.</li>
              <li>Notify you about your monitoring results, important product updates, or early-access invitations.</li>
            </ul>
            <p>We do not sell your personal data, and we do not use it for third-party advertising.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#8ce04a]">5.</span> Service Providers
            </h2>
            <p>
              We rely on a small set of trusted providers that process data only to deliver the service on our behalf:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li><strong>Supabase</strong> — database and authentication.</li>
              <li><strong>Vercel</strong> — hosting and privacy-friendly analytics.</li>
              <li><strong>AI providers</strong> (such as Google and Groq) — to run your prompts and analyze the public answers.</li>
              <li><strong>LemonSqueezy</strong> — payment processing, if and when you subscribe.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#8ce04a]">6.</span> Cookies
            </h2>
            <p>
              We use essential cookies required to sign you in and keep your session active, plus privacy-friendly analytics to understand aggregate traffic. We do not use advertising or cross-site tracking cookies. You can choose &quot;Essential Only&quot; in our cookie banner.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#8ce04a]">7.</span> Data Retention &amp; Your Rights
            </h2>
            <p>
              We keep your account and monitoring history for as long as your account is active. You can access, correct, export, or delete your data at any time — delete your account or email us and we will remove your personal data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#8ce04a]">8.</span> Security &amp; Storage
            </h2>
            <p>
              Data is encrypted in transit (TLS) and at rest by our infrastructure providers. We restrict access to your data and isolate each organization&apos;s records so they are only accessible to that organization.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#8ce04a]">9.</span> Contact Us
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
