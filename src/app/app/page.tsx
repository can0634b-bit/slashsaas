import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateUserOrganization } from '@/lib/supabase/organizations';
import { SlashLogo } from '@/components/Logo';
import { LogOut, Building2, User, Sparkles, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AppDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/app');
  }

  // Ensure organization exists for this user (canonical org)
  const organization = await getOrCreateUserOrganization(user);
  if (!organization) {
    redirect('/login');
  }

  const userDisplayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const orgDisplayName = organization.name || `${userDisplayName}'s Organization`;

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col selection:bg-white selection:text-black">
      {/* Top Application Header */}
      <header className="border-b border-white/[0.08] bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/app" className="hover:opacity-90 transition-opacity">
              <SlashLogo size="sm" />
            </Link>

            <span className="text-zinc-700 hidden sm:inline">|</span>

            {/* Organization Selector / Label */}
            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-zinc-300">
              <Building2 className="h-3.5 w-3.5 text-[#8ce04a]" />
              <span>{orgDisplayName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* User Profile info */}
            <Link
              href="/app/profile"
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8ce04a]/20 text-[#8ce04a] text-[10px] font-bold">
                {user.email ? user.email[0].toUpperCase() : 'U'}
              </div>
              <span className="font-semibold max-w-[130px] truncate">{user.email}</span>
            </Link>

            {/* Sign Out Form */}
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Workspace Content (Clean Empty State) */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-zinc-950/70 backdrop-blur-xl p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#8ce04a]/10 blur-3xl pointer-events-none -z-10" />

          {/* Icon Badge */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8ce04a]/15 text-[#8ce04a] border border-[#8ce04a]/30 shadow-[0_0_25px_rgba(140,224,74,0.2)]">
            <Sparkles className="h-8 w-8" />
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Your workspace is ready
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              Welcome to <span className="text-white font-semibold">{orgDisplayName}</span>. Your multi-tenant account and organization infrastructure are actively provisioned.
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                Organization
              </span>
              <p className="text-xs font-bold text-zinc-200 truncate">{orgDisplayName}</p>
              <p className="text-[10px] text-zinc-500 font-mono truncate">ID: {organization.id}</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                Authenticated User
              </span>
              <p className="text-xs font-bold text-zinc-200 truncate">{user.email}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-[#8ce04a]">
                <CheckCircle2 className="h-3 w-3" />
                <span>Session Active & Verified</span>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/app/profile"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-md active:scale-95"
            >
              <User className="h-3.5 w-3.5" />
              <span>Manage Account & Organization</span>
            </Link>
          </div>
        </div>
      </main>

      {/* App Footer */}
      <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-zinc-600">
        <p>SlashSaaS Foundation v2.0 • Supabase PostgreSQL & Multi-Tenant Core</p>
      </footer>
    </div>
  );
}
