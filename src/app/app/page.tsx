import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateUserOrganization } from '@/lib/supabase/organizations';
import { SlashLogo } from '@/components/Logo';
import { LogOut, Building2, User } from 'lucide-react';
import { ProjectsDashboardView } from '@/components/projects/ProjectsDashboardView';

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

  // Fetch projects belonging to this organization
  const { data: rawProjects, error } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      brand_name,
      brand_domain,
      created_at,
      tracked_queries ( id ),
      competitors ( id ),
      scans (
        id,
        overall_score,
        brand_mention_rate,
        share_of_voice,
        created_at,
        status
      )
    `)
    .eq('org_id', organization.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
  }

  const projects = (rawProjects || []).map((p: any) => {
    const scans = Array.isArray(p.scans) ? p.scans : [];
    const sortedScans = scans.sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const latestScan = sortedScans.length > 0 ? sortedScans[0] : null;

    return {
      id: p.id,
      name: p.name,
      brand_name: p.brand_name,
      brand_domain: p.brand_domain,
      created_at: p.created_at,
      tracked_queries_count: Array.isArray(p.tracked_queries) ? p.tracked_queries.length : 0,
      competitors_count: Array.isArray(p.competitors) ? p.competitors.length : 0,
      latest_scan: latestScan,
    };
  });

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

      {/* Main Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <ProjectsDashboardView
          orgName={orgDisplayName}
          orgId={organization.id}
          userEmail={user.email || ''}
          projects={projects}
        />
      </main>

      {/* App Footer */}
      <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-zinc-600">
        <p>SlashSaaS GEO Monitor v1.0 • Powered by Google Gemini & Supabase</p>
      </footer>
    </div>
  );
}
