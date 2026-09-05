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
  const { selfBrand, competitors, prompts, metrics, promptSummaries, recentRuns } =
    await getGeoWorkspaceData(organization.id);

  const userDisplayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const orgDisplayName = organization.name || `${userDisplayName}'s Organization`;

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col relative">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(#34343d_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.15] pointer-events-none" />

      {/* Top Application Header */}
      <header className="border-b border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/app" className="hover:opacity-90 transition-opacity">
              <SlashLogo size="sm" />
            </Link>

            <span className="text-outline-variant hidden sm:inline">|</span>

            {/* Organization Selector / Label */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container px-3 py-1 font-nav-pill text-nav-pill font-semibold text-on-surface-variant">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <span>{orgDisplayName}</span>
            </div>
          </div>

          <div className="flex items-center gap-space-sm">
            {/* User Profile Link */}
            <Link
              href="/app/profile"
              className="flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-low px-2.5 py-1 font-nav-pill text-nav-pill text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary text-[11px] font-bold">
                {user.email ? user.email[0].toUpperCase() : 'U'}
              </div>
              <span className="font-medium max-w-[130px] truncate hidden lg:inline">{user.email}</span>
            </Link>

            {/* Sign Out Form */}
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-1.5 font-nav-pill text-nav-pill font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
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
            metrics={metrics}
            promptSummaries={promptSummaries}
            recentRuns={recentRuns}
          />
        )}
      </main>

      {/* App Footer */}
      <footer className="border-t border-outline-variant/20 py-6 text-center font-label-mono-sm text-label-mono-sm text-outline">
        <p>SlashSaaS · AI Search Visibility (GEO) Monitor</p>
      </footer>
    </div>
  );
}
