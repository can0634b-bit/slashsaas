'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

/**
 * Auth-aware header actions for the marketing site.
 * - signed out → "Sign in" + "Start free"
 * - signed in  → "Go to workspace" (so a returning, remembered user never sees
 *   a misleading "Sign in / Start free" while their session is live)
 *
 * The landing page is statically cached, so auth is resolved on the client. A
 * fixed-size placeholder is rendered until the session is known to avoid layout
 * shift and any logged-out → logged-in flash.
 */
export function MarketingAuthNav() {
  const [state, setState] = useState<'loading' | 'authed' | 'anon'>('loading');

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setState(session?.user ? 'authed' : 'anon');
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setState(session?.user ? 'authed' : 'anon');
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (state === 'loading') {
    // Reserve horizontal space to prevent CLS while the session resolves.
    return <div className="h-9 w-[152px]" aria-hidden />;
  }

  if (state === 'authed') {
    return (
      <Link
        href="/app"
        className="group inline-flex items-center gap-space-xs font-headline-sm text-headline-sm px-space-md py-space-xs rounded-lg bg-gradient-to-r from-primary-container via-secondary-container to-tertiary text-on-primary shadow-[0_0_20px_rgba(148,125,255,0.35)] hover:shadow-[0_0_25px_rgba(47,217,244,0.45)] hover:-translate-y-0.5 transition-all duration-200"
      >
        <span
          className="material-symbols-outlined text-[18px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          grid_view
        </span>
        <span>Go to workspace</span>
      </Link>
    );
  }

  return (
    <>
      <Link
        className="font-nav-pill text-nav-pill text-on-surface-variant hover:text-on-surface transition-colors hidden sm:inline-block"
        href="/login"
      >
        Sign in
      </Link>
      <Link
        className="font-headline-sm text-headline-sm px-space-md py-space-xs rounded-lg bg-gradient-to-r from-primary-container via-secondary-container to-tertiary text-on-primary shadow-[0_0_20px_rgba(148,125,255,0.35)] hover:shadow-[0_0_25px_rgba(47,217,244,0.45)] hover:-translate-y-0.5 transition-all duration-200"
        href="/signup"
      >
        Start free
      </Link>
    </>
  );
}
