'use client';

import React from 'react';
import Link from 'next/link';
import { SlashLogo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.06] bg-black py-14 text-xs text-zinc-500">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <SlashLogo size="sm" showPro={false} />
            </Link>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-400">Autonomous SaaS Waste Elimination Platform</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-zinc-400">
            <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#calculator" className="hover:text-white transition-colors">Savings Calculator</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 SlashSaaS (slashsaas.com). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#8ce04a]">
              <span className="h-2 w-2 rounded-full bg-[#8ce04a] animate-ping" />
              All Systems Operational
            </span>
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
