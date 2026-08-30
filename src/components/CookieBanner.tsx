'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, X } from 'lucide-react';

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('slashsaas_cookie_consent');
    if (!consent) {
      // Small delay for smooth entry
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('slashsaas_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('slashsaas_cookie_consent', 'essential_only');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl p-4 sm:p-5 shadow-2xl shadow-black/90 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#8ce04a]/10 text-[#8ce04a] shrink-0 mt-0.5">
          <ShieldCheck className="h-4 w-4" />
        </div>

        <div className="space-y-2 flex-1">
          <p className="text-xs text-zinc-300 leading-relaxed">
            We use essential cookies and privacy-friendly telemetry to analyze site traffic and protect your sessions. We never sell your personal data.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleAccept}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-colors shadow-xs"
            >
              Accept All
            </button>
            <button
              type="button"
              onClick={handleDecline}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              Essential Only
            </button>
            <Link
              href="/privacy"
              className="text-[11px] text-zinc-400 hover:text-white underline ml-auto transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};
