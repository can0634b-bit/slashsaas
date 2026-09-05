import Link from 'next/link';
import { SlashLogo } from '@/components/Logo';
import { ArrowLeft, Home } from 'lucide-react';

export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center px-6 text-center">
      <Link href="/" className="mb-12">
        <SlashLogo size="md" />
      </Link>

      <p className="text-sm font-mono font-semibold text-[#a78bfa]">404</p>
      <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">
        This page isn&apos;t on our radar.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
        The page you&apos;re looking for doesn&apos;t exist or may have moved. Let&apos;s get you
        back to something useful.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7c5cff] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#8b6dff] transition-colors"
        >
          <Home className="h-4 w-4" />
          Back home
        </Link>
        <Link
          href="/app"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.02] px-5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/[0.05] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Go to workspace
        </Link>
      </div>
    </div>
  );
}
