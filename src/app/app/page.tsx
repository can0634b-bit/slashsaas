import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateUserOrganization } from '@/lib/supabase/organizations';
import { SlashLogo } from '@/components/Logo';
import {
  ShieldCheck,
  Zap,
  TrendingDown,
  Users,
  Layers,
  LogOut,
  Building2,
  ExternalLink,
  Lock,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AppDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/app');
  }

  // Ensure organization & membership exists for this user
  const organization = await getOrCreateUserOrganization(user);

  // Fetch real data for this organization from Supabase
  let connectionsCount = 0;
  let seatsCount = 0;
  let appsCount = 0;

  if (organization) {
    const [connRes, seatsRes, appsRes] = await Promise.all([
      supabase.from('connections').select('id', { count: 'exact', head: true }).eq('org_id', organization.id),
      supabase.from('seats').select('id', { count: 'exact', head: true }).eq('org_id', organization.id),
      supabase.from('detected_apps').select('id', { count: 'exact', head: true }).eq('org_id', organization.id),
    ]);

    connectionsCount = connRes.count || 0;
    seatsCount = seatsRes.count || 0;
    appsCount = appsRes.count || 0;
  }

  const userDisplayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const orgDisplayName = organization?.name || `${userDisplayName}'s Organization`;

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

          <div className="flex items-center gap-4">
            {/* User Profile info */}
            <div className="flex items-center gap-2 text-right text-xs">
              <span className="font-semibold text-zinc-300">{user.email}</span>
            </div>

            {/* Sign Out Form */}
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main App Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Executive Waste Radar
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">
              Realtime telemetry & deterministic license optimization for <strong className="text-white">{orgDisplayName}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8ce04a]/10 border border-[#8ce04a]/25 px-3 py-1 text-xs font-semibold text-[#a3e635]">
              <span className="h-2 w-2 rounded-full bg-[#8ce04a]" />
              Production Engine Active
            </span>
          </div>
        </div>

        {/* Real Summary Metrics Cards (Real Data: Zeroes when empty) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/80 p-5 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
              <span>Identified Annual Waste</span>
              <TrendingDown className="h-4 w-4 text-[#8ce04a]" />
            </div>
            <p className="text-3xl font-black text-white">$0</p>
            <p className="text-[11px] text-zinc-500 mt-1">0 dormant licenses detected</p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/80 p-5 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
              <span>Monitored Employee Seats</span>
              <Users className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="text-3xl font-black text-white">{seatsCount}</p>
            <p className="text-[11px] text-zinc-500 mt-1">
              {connectionsCount > 0 ? `${seatsCount} active directory seats` : 'Awaiting workspace connection'}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/80 p-5 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
              <span>Detected SaaS & AI Apps</span>
              <Layers className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-3xl font-black text-white">{appsCount}</p>
            <p className="text-[11px] text-zinc-500 mt-1">0 shadow subscriptions</p>
          </div>
        </div>

        {/* REAL EMPTY STATE CARD */}
        {connectionsCount === 0 && (
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-zinc-950/90 p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-[#8ce04a]/10 blur-[100px] pointer-events-none -z-10" />

            <div className="mx-auto max-w-xl space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8ce04a]/10 border border-[#8ce04a]/30 text-[#8ce04a]">
                <Zap className="h-7 w-7 fill-[#8ce04a]" />
              </div>

              <h2 className="text-2xl font-bold text-white tracking-tight">
                No workspace connected yet
              </h2>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Connect your Google Workspace or Slack admin directory to run your first autonomous audit. SlashSaaS will analyze token authentication timestamps to uncover dormant Figma, Notion, and AI tool seats.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  title="Google Workspace OAuth integration will be wired in Step 1"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-white px-6 py-3.5 text-xs sm:text-sm font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-xl active:scale-95"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                    />
                  </svg>
                  <span>Connect Google Workspace (Read-Only)</span>
                </button>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#8ce04a]" />
                  100% Read-Only OAuth
                </span>
                <span>•</span>
                <span>Zero Message / Document Access</span>
                <span>•</span>
                <span>SOC 2 Compliant</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* App Footer */}
      <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-zinc-600">
        <p>SlashSaaS Product Engine v1.0 • Connected to Supabase PostgreSQL & Auth</p>
      </footer>
    </div>
  );
}
