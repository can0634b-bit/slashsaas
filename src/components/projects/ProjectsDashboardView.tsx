'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Plus,
  ArrowRight,
  Globe,
  Search,
  Users,
  Award,
  ShieldCheck,
  Building2,
  Bot,
} from 'lucide-react';
import { CreateProjectModal } from './CreateProjectModal';
import { AgentFleetHub } from './AgentFleetHub';

interface ProjectSummary {
  id: string;
  name: string;
  brand_name: string;
  brand_domain: string;
  created_at: string;
  tracked_queries_count?: number;
  competitors_count?: number;
  latest_scan?: {
    overall_score: number;
    brand_mention_rate: number;
    created_at: string;
    status: string;
  } | null;
}

interface ProjectsDashboardViewProps {
  orgName: string;
  orgId: string;
  userEmail: string;
  projects: ProjectSummary[];
}

export const ProjectsDashboardView: React.FC<ProjectsDashboardViewProps> = ({
  orgName,
  orgId,
  userEmail,
  projects,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-8 w-full">
      <CreateProjectModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Hero Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-[#8ce04a]/10 blur-3xl pointer-events-none" />

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-[#8ce04a]/30 bg-[#8ce04a]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#8ce04a]">
              Generative Engine Optimization (GEO)
            </span>
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-zinc-400">
              5/7 Ajan Aktif
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            AI Search Visibility Monitors
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            Monitor how your brand is cited, ranked, and recommended in generative AI search answers (Google Gemini).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-bold text-zinc-950 hover:bg-[#8ce04a] hover:text-black transition-all shadow-lg active:scale-95 shrink-0 self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          <span>New Project Monitor</span>
        </button>
      </div>

      {/* Live Agent Fleet Hub Panel */}
      <AgentFleetHub />

      {/* Section Title */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Active Brand Monitors</h2>
          <p className="text-xs text-zinc-400">Your monitored brands and real-time visibility scores</p>
        </div>

        {projects.length > 0 && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8ce04a] hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Monitor</span>
          </button>
        )}
      </div>

      {/* Projects Grid or Empty State */}
      {projects.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-zinc-950/50 p-12 text-center backdrop-blur-xl space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8ce04a]/15 text-[#8ce04a] border border-[#8ce04a]/30 shadow-[0_0_25px_rgba(140,224,74,0.2)]">
            <Sparkles className="h-8 w-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white tracking-tight">No active brand monitors yet</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Create your first project monitor to configure search prompts, benchmark competitors, and start the autonomous 7-agent intelligence loop across Google Gemini.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-xs font-bold text-zinc-950 hover:bg-[#8ce04a] hover:text-black transition-all shadow-md active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Your First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => {
            const score = p.latest_scan?.overall_score != null ? Math.round(p.latest_scan.overall_score) : null;

            return (
              <Link
                key={p.id}
                href={`/app/projects/${p.id}`}
                className="group block rounded-3xl border border-white/10 bg-zinc-950/70 p-6 backdrop-blur-xl hover:border-white/20 hover:bg-white/[0.03] transition-all relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-base font-bold text-white group-hover:text-[#8ce04a] transition-colors truncate">
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="font-medium text-zinc-200">{p.brand_name}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-zinc-500 font-mono text-[11px]">
                        <Globe className="h-3 w-3" />
                        {p.brand_domain}
                      </span>
                    </div>
                  </div>

                  {score != null ? (
                    <div className="shrink-0 text-right">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-2xl font-black text-white">{score}</span>
                        <span className="text-[10px] font-mono text-zinc-500">/100</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#8ce04a]">
                        Visibility Score
                      </span>
                    </div>
                  ) : (
                    <span className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-1 text-[10px] font-mono text-zinc-500">
                      No scans yet
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-zinc-400">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-zinc-400">
                      <Search className="h-3.5 w-3.5 text-zinc-500" />
                      <span className="font-mono text-xs">{p.tracked_queries_count || 0} prompts</span>
                    </div>
                    <div className="flex items-center gap-1 text-zinc-400">
                      <Users className="h-3.5 w-3.5 text-zinc-500" />
                      <span className="font-mono text-xs">{p.competitors_count || 0} competitors</span>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors">
                    <span>View Monitor</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
