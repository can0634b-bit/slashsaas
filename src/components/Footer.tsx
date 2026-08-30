'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-black py-14 text-xs text-zinc-500">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-zinc-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-xs">
              /S
            </div>
            <span className="font-bold text-sm text-zinc-950 dark:text-white tracking-tight">SlashSaaS</span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span className="text-zinc-600 dark:text-zinc-400">Autonomous SaaS Waste Elimination Platform</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-zinc-600 dark:text-zinc-400">
            <a href="#solutions" className="hover:text-black dark:hover:text-white transition-colors">Solutions</a>
            <a href="#how-it-works" className="hover:text-black dark:hover:text-white transition-colors">How It Works</a>
            <a href="#calculator" className="hover:text-black dark:hover:text-white transition-colors">Savings Calculator</a>
            <a href="#security" className="hover:text-black dark:hover:text-white transition-colors">Security</a>
            <a href="#pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-black dark:hover:text-white transition-colors">FAQ</a>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 SlashSaaS (slashsaas.com). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
              All Systems Operational
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="hover:text-zinc-900 dark:hover:text-zinc-300 cursor-pointer">Privacy Policy</span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="hover:text-zinc-900 dark:hover:text-zinc-300 cursor-pointer">Security & Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};