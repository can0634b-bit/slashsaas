'use client';

import React from 'react';
import Link from 'next/link';
import { SlashLogo } from './Logo';
import { Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.06] bg-black py-12 text-xs text-zinc-500">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <SlashLogo size="sm" />
            </Link>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-400">AI Search Visibility Monitoring</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="mailto:support@slashsaas.com"
              className="hover:text-white transition-colors flex items-center gap-1.5 text-[#8ce04a]"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>support@slashsaas.com</span>
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-400">© 2026 SlashSaaS (slashsaas.com). All rights reserved.</p>

          <div className="flex items-center gap-4">
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
