import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Server, FileText } from 'lucide-react';
import { SlashLogo } from '@/components/Logo';

export const metadata = {
  title: 'Privacy Policy — SlashSaaS',
  description: 'Official privacy policy and Google API Services User Data Policy compliance for SlashSaaS.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-white selection:text-black">
      {/* Header */}
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

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
        <div className="mb-12 border-b border-white/[0.08] pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#8ce04a]/30 bg-[#8ce04a]/10 px-3.5 py-1 text-xs font-bold text-[#a3e635] mb-4">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Google API Limited Use & GDPR Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Last Updated: August 30, 2026 • Effective Immediately
          </p>
        </div>

        <div className="space-y-10 text-sm text-zinc-300 leading-relaxed font-normal">
          {/* Section 1: Overview */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#8ce04a]">1.</span> Overview & Scope
            </h2>
            <p>
              SlashSaaS (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates <strong>slashsaas.com</strong> and provides autonomous software license optimization and FinOps auditing services for organizations. We are deeply committed to protecting the privacy of your organization and team members.
            </p>
            <p>
              This Privacy Policy explains what information we collect, how it is used, and the rigorous safeguards we maintain when you connect Google Workspace, Slack, Microsoft 365, or other Single Sign-On (SSO) providers.
            </p>
          </section>

          {/* Section 2: Google API Limited Use Disclosure */}
          <section className="rounded-3xl border border-[#8ce04a]/30 bg-[#8ce04a]/[0.04] p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#8ce04a]" />
              <span>2. Google API Services User Data Policy Compliance</span>
            </h2>
            <p>
              SlashSaaS&apos;s use and transfer of information received from Google APIs to any other app will adhere to the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
                className="text-[#8ce04a] underline hover:text-white"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-zinc-300">
              <li>
                <strong>Read-Only Access:</strong> We strictly request read-only access to user authentication logs and OAuth token metadata (e.g. last active login timestamps) to identify dormant licenses.
              </li>
              <li>
                <strong>Zero Document/Email Access:</strong> We do NOT request, access, parse, or store Google Drive files, Gmail messages, calendar entries, or contacts.
              </li>
              <li>
                <strong>No AI Training:</strong> Customer data obtained via Google Workspace APIs is NEVER used to train machine learning or AI models.
              </li>
              <li>
                <strong>No Data Resale:</strong> We never sell, rent, or trade your organization&apos;s data to third parties or advertisers.
              </li>
            </ul>
          </section>

          {/* Section 3: Data We Collect */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#8ce04a]">3.</span> Information We Collect
            </h2>
            <p>We only collect data strictly necessary to deliver our license optimization service:</p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li><strong>Account Information:</strong> Name, work email address, company name, and organization domain.</li>
              <li><strong>Workspace Telemetry (Read-Only):</strong> OAuth token timestamps, user login timestamps, and assigned SaaS application titles.</li>
              <li><strong>Billing Information:</strong> Payments are processed directly through LemonSqueezy (our Merchant of Record). SlashSaaS never stores credit card numbers or banking passwords.</li>
            </ul>
          </section>

          {/* Section 4: Security & Encryption */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#8ce04a]">4.</span> Security & Storage
            </h2>
            <p>
              All data transmitted to and from SlashSaaS is encrypted using industry-standard TLS 1.3 in transit and AES-256 at rest. Access tokens are stored with cryptographic hashing and can be revoked at any moment by workspace administrators.
            </p>
          </section>

          {/* Section 5: Data Retention & Deletion */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#8ce04a]">5.</span> Data Retention & Right to Erasure
            </h2>
            <p>
              You have the right to request immediate deletion of all organization data, audit records, and user profiles. To exercise this right, email{' '}
              <a href="mailto:privacy@slashsaas.com" className="text-[#8ce04a] underline">
                privacy@slashsaas.com
              </a>{' '}
              or disconnect the integration directly from your admin dashboard.
            </p>
          </section>

          {/* Section 6: Contact Us */}
          <section className="rounded-3xl border border-white/[0.08] bg-zinc-950 p-6 space-y-2">
            <h3 className="text-base font-bold text-white">6. Contact Information</h3>
            <p className="text-xs text-zinc-400">
              If you have any questions regarding this Privacy Policy or our security protocols, please contact our Data Protection Officer:
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
