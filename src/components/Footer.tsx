'use client';

import React from 'react';
import Link from 'next/link';
import { SlashLogo } from './Logo';
import { Mail, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.06] bg-black py-14 text-xs text-zinc-500">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <SlashLogo size="sm" />
            </Link>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-400">Autonomous SaaS Waste Elimination Platform</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-zinc-400">
            <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#calculator" className="hover:text-white transition-colors">Savings Calculator</a>
            <a href="#comparisons" className="hover:text-white transition-colors">Why SlashSaaS</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-zinc-400">
            <p>© 2026 SlashSaaS (slashsaas.com). All rights reserved.</p>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <a
              href="mailto:support@slashsaas.com"
              className="hover:text-white transition-colors flex items-center gap-1 text-[#8ce04a]"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>support@slashsaas.com</span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://slashsaas.com"
              className="flex items-center gap-1.5 text-[#8ce04a] hover:opacity-90 transition-opacity"
            >
              <span className="h-2 w-2 rounded-full bg-[#8ce04a] animate-ping" />
              <span>Platform Status: All Systems Operational (100% Uptime SLA)</span>
            </a>
            <span className="text-zinc-700">•</span>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-zinc-700">•</span>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
