import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getCurrentOrg, getGeoWorkspaceData } from '@/lib/supabase/geo';
import { SlashLogo } from '@/components/Logo';
import { LogOut, Building2, User } from 'lucide-react';
import { OnboardingWizard } from '@/components/geo/OnboardingWizard';
import { GeoDashboardView } from '@/components/geo/GeoDashboardView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Workspace',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AppDashboardPage() {
  let user;
  let organization;

  try {
    const context = await getCurrentOrg();
    user = context.user;
    organization = context.org;
  } catch (e) {
    redirect('/login?redirect=/app');
  }

  // Load organization-scoped GEO data via authenticated RLS query
  const { selfBrand, competitors, prompts } = await getGeoWorkspaceData(organization.id);

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
            {/* User Profile Link */}
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

      {/* Main Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!selfBrand ? (
          // Step 1-3 Onboarding Wizard if no self-brand exists for this organization
          <OnboardingWizard orgId={organization.id} orgName={orgDisplayName} />
        ) : (
          // Full GEO Monitoring Management Dashboard once onboarded
          <GeoDashboardView
            orgId={organization.id}
            orgName={orgDisplayName}
            userEmail={user.email || ''}
            selfBrand={selfBrand}
            competitors={competitors}
            prompts={prompts}
          />
        )}
      </main>

      {/* App Footer */}
      <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-zinc-600">
        <p>SlashSaaS AI Search Visibility (GEO) Monitor • Phase 2</p>
      </footer>
    </div>
  );
}
