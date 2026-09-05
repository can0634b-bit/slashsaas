'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { SlashLogo } from '@/components/Logo';
import { RotateCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for observability; never swallow silently.
    console.error('[APP_ERROR]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center px-6 text-center">
      <Link href="/" className="mb-12">
        <SlashLogo size="md" />
      </Link>

      <p className="text-sm font-mono font-semibold text-[#a78bfa]">Something broke</p>
      <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">
        This page hit an unexpected error.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
        It&apos;s on our side, not yours. Try again, and if it keeps happening, let us know at{' '}
        <a href="mailto:support@slashsaas.com" className="text-[#a78bfa] hover:underline">
          support@slashsaas.com
        </a>
        .
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7c5cff] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#8b6dff] transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.02] px-5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/[0.05] transition-colors"
        >
          <Home className="h-4 w-4" />
          Back home
        </Link>
      </div>

      {error?.digest && (
        <p className="mt-8 text-[11px] font-mono text-zinc-600">Reference: {error.digest}</p>
      )}
    </div>
  );
}
