'use client';

import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server, CheckCircle2 } from 'lucide-react';

export const SecuritySection: React.FC = () => {
  const securityPoints = [
    {
      icon: EyeOff,
      title: 'Strict Read-Only Access',
      desc: 'SlashSaaS never reads private messages, documents, emails, or source code. We strictly audit OAuth authentication and last-login timestamps.',
    },
    {
      icon: Lock,
      title: 'Zero Password Storage',
      desc: 'All connections run exclusively via industry-standard OAuth 2.0 and SAML directory scopes. We never ask for, see, or store passwords.',
    },
    {
      icon: Server,
      title: 'Built to SOC 2 Controls & GDPR',
      desc: 'End-to-end 256-bit AES encryption at rest and in transit. Hosted on enterprise-grade cloud infrastructure with complete data residency controls.',
    },
    {
      icon: ShieldCheck,
      title: 'Instant Admin Revocation',
      desc: 'Revoke SlashSaaS access with a single click at any time directly from your Google Workspace or Slack admin console with immediate data purge.',
    },
  ];

  return (
    <section id="security" className="py-24 border-t border-white/[0.06] bg-black relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8ce04a]">
            Security & Privacy First
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built for Security-Conscious Engineering Teams
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            Your security and employee privacy are non-negotiable. Here is how SlashSaaS protects your workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityPoints.map((point, idx) => {
            const Icon = point.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-white/[0.08] bg-zinc-950/70 p-6 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl"
              >
                <div>
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#8ce04a]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{point.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{point.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-1 text-[11px] text-[#8ce04a] font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Enforced by Architecture</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
