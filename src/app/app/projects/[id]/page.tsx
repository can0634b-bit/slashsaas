import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateUserOrganization } from '@/lib/supabase/organizations';
import { SlashLogo } from '@/components/Logo';
import {
  LogOut,
  Building2,
  Globe,
  ChevronRight,
  Sparkles,
  History,
  Calendar,
  Layers,
} from 'lucide-react';
import { QueryManager } from '@/components/projects/QueryManager';
import { CompetitorManager } from '@/components/projects/CompetitorManager';
import { ProjectScanRunner } from '@/components/projects/ProjectScanRunner';
import { ScanResultsView } from '@/components/projects/ScanResultsView';
import { ProjectDeleteButton } from '@/components/projects/ProjectDeleteButton';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id: projectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/app/projects/${projectId}`);
  }

  const organization = await getOrCreateUserOrganization(user);
  if (!organization) {
    redirect('/login');
  }

  // Fetch project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('org_id', organization.id)
    .single();

  if (projectError || !project) {
    notFound();
  }

  // Fetch tracked queries
  const { data: queries } = await supabase
    .from('tracked_queries')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  // Fetch competitors
  const { data: competitors } = await supabase
    .from('competitors')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  // Fetch scans history
  const { data: scans } = await supabase
    .from('scans')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(10);

  const latestScan = scans && scans.length > 0 ? scans[0] : null;

  // Fetch scan_results for the latest scan if available
  let scanResults: any[] = [];
  if (latestScan) {
    const { data: results } = await supabase
      .from('scan_results')
      .select('*')
      .eq('scan_id', latestScan.id)
      .order('created_at', { ascending: true });
    scanResults = results || [];
  }

  const userDisplayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const orgDisplayName = organization.name || `${userDisplayName}'s Organization`;

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col selection:bg-white selection:text-black">
      {/* Top App Header */}
      <header className="border-b border-white/[0.08] bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <Link href="/app" className="hover:opacity-90 transition-opacity shrink-0">
              <SlashLogo size="sm" />
            </Link>

            <span className="text-zinc-700 hidden sm:inline">|</span>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 min-w-0 truncate">
              <Link href="/app" className="hover:text-white transition-colors">
                Monitors
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
              <span className="font-semibold text-white truncate">{project.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-zinc-300">
              <Building2 className="h-3.5 w-3.5 text-[#8ce04a]" />
              <span>{orgDisplayName}</span>
            </div>

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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Project Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {project.name}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
              <span className="text-zinc-200 font-medium">Brand: {project.brand_name}</span>
              <span>•</span>
              <a
                href={`https://${project.brand_domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-zinc-400 hover:text-white font-mono transition-colors"
              >
                <Globe className="h-3 w-3" />
                <span>{project.brand_domain}</span>
              </a>
              <span>•</span>
              <span className="text-zinc-500 font-mono text-[11px]">
                Created {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ProjectDeleteButton projectId={project.id} projectName={project.name} />
          </div>
        </div>

        {/* Scan Runner Component */}
        <ProjectScanRunner
          projectId={project.id}
          hasQueries={(queries || []).length > 0}
          queriesCount={(queries || []).length}
        />

        {/* Two-column layout: Results + Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column (2/3): Scan Results & Proof */}
          <div className="lg:col-span-2 space-y-6">
            <ScanResultsView
              scan={latestScan}
              results={scanResults}
              brandName={project.brand_name}
            />

            {/* Scan History if multiple */}
            {scans && scans.length > 1 && (
              <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-6 backdrop-blur-xl space-y-4">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-zinc-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
                    Scan History ({scans.length} runs)
                  </h4>
                </div>
                <div className="divide-y divide-white/5">
                  {scans.map((s) => (
                    <div
                      key={s.id}
                      className="py-3 flex items-center justify-between text-xs text-zinc-400"
                    >
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <Calendar className="h-3.5 w-3.5 text-zinc-600" />
                        <span>{new Date(s.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-white font-bold">
                          {Math.round(s.overall_score || s.summary_json?.overallVisibilityScore || 0)}/100
                        </span>
                        <span className="text-[10px] uppercase font-mono text-zinc-500">
                          {s.engine || s.engine_name || 'gemini'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column (1/3): Queries & Competitor Management */}
          <div className="space-y-6">
            <QueryManager projectId={project.id} queries={queries || []} />
            <CompetitorManager projectId={project.id} competitors={competitors || []} />
          </div>
        </div>
      </main>

      {/* App Footer */}
      <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-zinc-600">
        <p>SlashSaaS GEO Monitor v1.0 • Grounded AI Engine Audit</p>
      </footer>
    </div>
  );
}
