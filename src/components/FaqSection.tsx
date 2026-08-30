'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Does SlashSaaS have access to our company emails, files, or messages?',
      a: 'Absolutely not. SlashSaaS connects strictly through Read-Only OAuth 2.0 and SAML directory scopes. We only read user authentication timestamps (e.g. "Last login: 45 days ago"). We never access, parse, or store documents, emails, Slack messages, or passwords.',
    },
    {
      q: 'How does the 1-Click Slack Nudge Bot work?',
      a: 'When an employee hasn’t logged into a paid app (like Figma or Notion) for 30+ days, SlashSaaS can send an automated, friendly DM in Slack: "Hey Alex, we noticed you haven\'t used Figma in 45 days. Do you still need this $75/mo license?" Alex can click "Keep" or "Relinquish" directly in Slack with zero awkwardness.',
    },
    {
      q: 'How long does onboarding take?',
      a: 'Less than 60 seconds. You authenticate your Google Workspace or Slack admin account with one click. SlashSaaS immediately audits your active OAuth tokens and builds your full organizational waste breakdown.',
    },
    {
      q: 'Which SaaS tools and apps does SlashSaaS support?',
      a: 'We monitor over 40+ premier tech SaaS tools out of the box, including Figma, Notion, ChatGPT Team/Enterprise, GitHub Copilot, Linear, Loom, Salesforce, Miro, Asana, Datadog, Slack, and Zoom. You can also define custom pricing for any internal software.',
    },
    {
      q: 'How does billing work?',
      a: 'Payments are handled securely via LemonSqueezy. You can choose monthly or annual billing (with a 20% discount). You can upgrade, downgrade, or cancel your subscription at any time with a single click.',
    },
  ];

  return (
    <section id="faq" className="py-24 border-t border-zinc-200 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-black relative">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Frequently Asked Questions
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Everything You Need to Know
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
            Have questions about security, integration, or ROI? Here are quick answers.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-3xl border border-zinc-200/80 dark:border-white/[0.08] bg-white dark:bg-zinc-950/70 overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-zinc-950 dark:text-white' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-white/[0.04] pt-4 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
