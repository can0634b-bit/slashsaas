import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateUserOrganization } from '@/lib/supabase/organizations';
import { computeWasteMetrics } from '@/lib/engine/wasteCalculator';
import { recordScanAudit } from '@/lib/actions/dashboard';
import { SlashLogo } from '@/components/Logo';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { DetectedApp, Seat } from '@/lib/types/dashboard';
import { LogOut, Building2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AppDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/app');
  }

  // Ensure organization exists for this user
  const organization = await getOrCreateUserOrganization(user);
  if (!organization) {
    redirect('/login');
  }

  // Fetch real apps and seats for this organization from Supabase
  const [appsRes, seatsRes] = await Promise.all([
    supabase
      .from('detected_apps')
      .select('*')
      .eq('org_id', organization.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('seats')
      .select('*')
      .eq('org_id', organization.id)
      .order('created_at', { ascending: false }),
  ]);

  const rawApps = (appsRes.data || []) as DetectedApp[];
  const rawSeats = (seatsRes.data || []) as Seat[];

  // Compute real mathematical metrics from actual rows
  const metrics = computeWasteMetrics(rawApps, rawSeats, 45);

  // Persist scan audit summary in scans table (non-blocking)
  if (rawApps.length > 0 || rawSeats.length > 0) {
    try {
      await recordScanAudit({
        total_annual_waste: metrics.totalAnnualWaste,
        total_monthly_waste: metrics.totalMonthlyWaste,
        monitored_seats: metrics.totalMonitoredSeats,
        dormant_seats: metrics.dormantSeatsCount,
        detected_apps: metrics.totalDetectedApps,
        computed_at: new Date().toISOString(),
      });
    } catch {}
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <DashboardClient
          apps={rawApps}
          seats={rawSeats}
          metrics={metrics}
          orgName={orgDisplayName}
        />
      </main>

      {/* App Footer */}
      <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-zinc-600">
        <p>SlashSaaS Product Engine v1.0 • Connected to Supabase PostgreSQL & Auth</p>
      </footer>
    </div>
  );
}
