'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Swords,
  Search,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Power,
  Sparkles,
  AlertCircle,
  Globe,
  Tag,
  CheckCircle2,
  X,
  Lock,
  BarChart3,
  TrendingUp,
  Play,
  Loader2,
  Clock,
  FileText,
  Check,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import {
  Brand,
  Prompt,
  Run,
  GeoWorkspaceMetrics,
  PromptAuditSummary,
} from '@/lib/types';
import {
  addCompetitorAction,
  removeBrandAction,
  updateSelfBrandAction,
  addPromptAction,
  togglePromptActiveAction,
  updatePromptAction,
  deletePromptAction,
} from '@/lib/actions/geo';
import { runAudit, runAuditAllActive } from '@/lib/actions/audit';

interface GeoDashboardViewProps {
  orgId: string;
  orgName: string;
  userEmail: string;
  selfBrand: Brand;
  competitors: Brand[];
  prompts: Prompt[];
  metrics: GeoWorkspaceMetrics;
  promptSummaries: Record<string, PromptAuditSummary>;
  recentRuns: Array<Run & { promptText?: string }>;
}

function formatTimeAgo(dateStr?: string | null): string {
  if (!dateStr) return 'Never';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function GeoDashboardView({
  orgId,
  orgName,
  userEmail,
  selfBrand,
  competitors,
  prompts,
  metrics,
  promptSummaries,
  recentRuns,
}: GeoDashboardViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Audit state
  const [runningPromptId, setRunningPromptId] = useState<string | null>(null);
  const [isAuditingAll, setIsAuditingAll] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  // Evidence Modal state
  const [inspectingRun, setInspectingRun] = useState<(Run & { promptText?: string }) | null>(null);

  // Modals state (Brand & Prompts management)
  const [isEditingBrand, setIsEditingBrand] = useState(false);
  const [editBrandName, setEditBrandName] = useState(selfBrand.name);
  const [editBrandDomain, setEditBrandDomain] = useState(selfBrand.domain || '');
  const [editBrandAliases, setEditBrandAliases] = useState(selfBrand.aliases?.join(', ') || '');

  const [isAddingComp, setIsAddingComp] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompDomain, setNewCompDomain] = useState('');

  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [newPromptText, setNewPromptText] = useState('');
  const [newPromptTopic, setNewPromptTopic] = useState('');

  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [editPromptText, setEditPromptText] = useState('');
  const [editPromptTopic, setEditPromptTopic] = useState('');

  const [isSuggestingPrompts, setIsSuggestingPrompts] = useState(false);
  const [suggestTopic, setSuggestTopic] = useState(selfBrand.name);
  const [suggestAudience, setSuggestAudience] = useState('modern teams');
  const [generatedSuggestions, setGeneratedSuggestions] = useState<
    Array<{ text: string; topic: string; selected: boolean }>
  >([]);

  // -------------------------------------------------------------
  // Audit Handlers (Monitoring Engine)
  // -------------------------------------------------------------
  const handleRunSinglePrompt = async (promptId: string) => {
    if (runningPromptId) return;
    setRunningPromptId(promptId);
    setNotification(null);

    try {
      const res = await runAudit(promptId, 'gemini');

      if (res.rateLimited) {
        setNotification({
          type: 'warning',
          message: res.error || 'Cooldown active: Please wait 30 seconds before re-auditing.',
        });
      } else if (!res.success) {
        setNotification({
          type: 'error',
          message: res.error || 'Audit failed. Check server logs for details.',
        });
      } else {
        const mentionNotice = res.selfMentioned
          ? `${selfBrand.name} was mentioned at position #${res.selfPosition || 1}!`
          : `${selfBrand.name} was not mentioned.`;
        const citedNotice = res.selfCited ? ' Link was cited in grounding!' : '';

        setNotification({
          type: 'success',
          message: `Audit complete: ${mentionNotice}${citedNotice}`,
        });
        router.refresh();
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to trigger audit.',
      });
    } finally {
      setRunningPromptId(null);
    }
  };

  const handleRunAuditAll = async () => {
    if (isAuditingAll || prompts.length === 0) return;
    setIsAuditingAll(true);
    setNotification(null);

    try {
      const res = await runAuditAllActive('gemini');

      if (!res.success) {
        setNotification({
          type: 'error',
          message: 'Failed to run full audit batch.',
        });
      } else {
        setNotification({
          type: 'success',
          message: `Batch audit complete! Analyzed ${res.completed} of ${res.total} active prompts with Google Gemini.`,
        });
        router.refresh();
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Error executing batch audit.',
      });
    } finally {
      setIsAuditingAll(false);
    }
  };

  // -------------------------------------------------------------
  // Brand Actions
  // -------------------------------------------------------------
  const handleSaveBrand = () => {
    if (!editBrandName.trim() || !editBrandDomain.trim()) {
      setNotification({ type: 'error', message: 'Brand name and domain are required.' });
      return;
    }
    setNotification(null);
    startTransition(async () => {
      const aliasList = editBrandAliases
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a.length > 0);

      const res = await updateSelfBrandAction({
        name: editBrandName.trim(),
        domain: editBrandDomain.trim(),
        aliases: aliasList,
      });

      if (!res.success) {
        setNotification({ type: 'error', message: res.error || 'Failed to update brand.' });
      } else {
        setIsEditingBrand(false);
        router.refresh();
      }
    });
  };

  // -------------------------------------------------------------
  // Competitor Actions
  // -------------------------------------------------------------
  const handleAddCompetitor = () => {
    if (!newCompName.trim()) {
      setNotification({ type: 'error', message: 'Competitor name is required.' });
      return;
    }
    setNotification(null);
    startTransition(async () => {
      const res = await addCompetitorAction({
        name: newCompName.trim(),
        domain: newCompDomain.trim() || undefined,
      });
      if (!res.success) {
        setNotification({ type: 'error', message: res.error || 'Failed to add competitor.' });
      } else {
        setNewCompName('');
        setNewCompDomain('');
        setIsAddingComp(false);
        router.refresh();
      }
    });
  };

  const handleRemoveCompetitor = (comp: Brand) => {
    if (!confirm(`Are you sure you want to remove competitor "${comp.name}"?`)) return;
    setNotification(null);
    startTransition(async () => {
      const res = await removeBrandAction(comp.id);
      if (!res.success) {
        setNotification({ type: 'error', message: res.error || 'Failed to remove competitor.' });
      } else {
        router.refresh();
      }
    });
  };

  // -------------------------------------------------------------
  // Prompt Actions
  // -------------------------------------------------------------
  const handleAddPrompt = () => {
    if (!newPromptText.trim() || newPromptText.trim().length < 5) {
      setNotification({ type: 'error', message: 'Prompt query must be at least 5 characters long.' });
      return;
    }
    setNotification(null);
    startTransition(async () => {
      const res = await addPromptAction({
        text: newPromptText.trim(),
        topic: newPromptTopic.trim() || undefined,
        locale: 'en',
      });
      if (!res.success) {
        setNotification({ type: 'error', message: res.error || 'Failed to add prompt.' });
      } else {
        setNewPromptText('');
        setNewPromptTopic('');
        setIsAddingPrompt(false);
        router.refresh();
      }
    });
  };

  const handleTogglePrompt = (prompt: Prompt) => {
    setNotification(null);
    startTransition(async () => {
      const res = await togglePromptActiveAction(prompt.id, !prompt.is_active);
      if (!res.success) {
        setNotification({ type: 'error', message: res.error || 'Failed to update prompt status.' });
      } else {
        router.refresh();
      }
    });
  };

  const handleSavePromptEdit = () => {
    if (!editingPrompt) return;
    if (!editPromptText.trim() || editPromptText.trim().length < 5) {
      setNotification({ type: 'error', message: 'Prompt query must be at least 5 characters long.' });
      return;
    }
    setNotification(null);
    startTransition(async () => {
      const res = await updatePromptAction(editingPrompt.id, {
        text: editPromptText.trim(),
        topic: editPromptTopic.trim() || undefined,
      });
      if (!res.success) {
        setNotification({ type: 'error', message: res.error || 'Failed to update prompt.' });
      } else {
        setEditingPrompt(null);
        router.refresh();
      }
    });
  };

  const handleDeletePrompt = (prompt: Prompt) => {
    if (!confirm(`Are you sure you want to delete prompt "${prompt.text}"?`)) return;
    setNotification(null);
    startTransition(async () => {
      const res = await deletePromptAction(prompt.id);
      if (!res.success) {
        setNotification({ type: 'error', message: res.error || 'Failed to delete prompt.' });
      } else {
        router.refresh();
      }
    });
  };

  // -------------------------------------------------------------
  // Prompt Generator
  // -------------------------------------------------------------
  const generateTemplates = () => {
    const topic = suggestTopic.trim() || selfBrand.name;
    const audience = suggestAudience.trim() || 'teams';
    const topComp = competitors[0]?.name || 'competitors';

    const templates = [
      {
        text: `Best ${topic} software for ${audience} in 2026`,
        topic: 'Best In Category',
      },
      {
        text: `Top ${topic} alternatives to ${topComp}`,
        topic: 'Competitor Alternative',
      },
      {
        text: `Is ${selfBrand.name} good for ${topic}?`,
        topic: 'Brand Evaluation',
      },
      {
        text: `${selfBrand.name} vs ${topComp} comparison`,
        topic: 'Head to Head',
      },
      {
        text: `What is the easiest ${topic} tool with great support?`,
        topic: 'Usability',
      },
      {
        text: `Affordable ${topic} platforms for ${audience}`,
        topic: 'Pricing',
      },
    ];

    setGeneratedSuggestions(
      templates.map((t) => ({
        ...t,
        selected: !prompts.some((p) => p.text.toLowerCase() === t.text.toLowerCase()),
      }))
    );
  };

  const handleAddBatchGeneratedPrompts = () => {
    const toAdd = generatedSuggestions.filter((s) => s.selected);
    if (toAdd.length === 0) return;

    setNotification(null);
    startTransition(async () => {
      let anyError: string | null = null;
      for (const item of toAdd) {
        if (prompts.length >= 25) break;
        const res = await addPromptAction({
          text: item.text,
          topic: item.topic,
          locale: 'en',
        });
        if (!res.success) {
          anyError = res.error || 'Failed to add prompt.';
          break;
        }
      }
      if (anyError) {
        setNotification({ type: 'error', message: anyError });
      }
      setIsSuggestingPrompts(false);
      router.refresh();
    });
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between transition-all ${
            notification.type === 'success'
              ? 'border-[#8ce04a]/30 bg-[#8ce04a]/10 text-[#8ce04a]'
              : notification.type === 'warning'
              ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-zinc-400 hover:text-white ml-3">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* TOP ROW: BRAND CARD + AI SEARCH VISIBILITY SCORE CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Your Brand Card */}
        <div className="lg:col-span-1 rounded-2xl border border-white/[0.08] bg-zinc-950/80 backdrop-blur-xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#8ce04a]/10 text-[#8ce04a] border border-[#8ce04a]/20">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Your Brand
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditBrandName(selfBrand.name);
                  setEditBrandDomain(selfBrand.domain || '');
                  setEditBrandAliases(selfBrand.aliases?.join(', ') || '');
                  setIsEditingBrand(true);
                }}
                className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
                title="Edit Brand"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{selfBrand.name}</h2>
              {selfBrand.domain && (
                <a
                  href={`https://${selfBrand.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#8ce04a] hover:underline"
                >
                  <Globe className="h-3 w-3" />
                  <span>{selfBrand.domain}</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>

            {selfBrand.aliases && selfBrand.aliases.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <div className="text-[11px] font-medium text-zinc-400 mb-2">Tracked Aliases:</div>
                <div className="flex flex-wrap gap-1.5">
                  {selfBrand.aliases.map((alias, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.04] border border-white/[0.08] text-zinc-300"
                    >
                      {alias}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1.5 text-[#8ce04a]">
              <span className="h-2 w-2 rounded-full bg-[#8ce04a] animate-pulse" />
              <span>Active Monitor</span>
            </span>
            <span>Locale: EN</span>
          </div>
        </div>

        {/* AI SEARCH VISIBILITY SCORE CARD (LIVE IN PHASE 3) */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-zinc-950/80 backdrop-blur-xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#8ce04a]/10 text-[#8ce04a] border border-[#8ce04a]/20">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">AI Search Visibility Score</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#8ce04a]/15 text-[#8ce04a] border border-[#8ce04a]/30">
                      <Sparkles className="h-2.5 w-2.5" />
                      <span>Google Gemini Grounded</span>
                    </span>
                    {metrics.lastAuditedAt && (
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(metrics.lastAuditedAt)}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleRunAuditAll}
                disabled={isAuditingAll || prompts.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8ce04a] text-black font-semibold text-xs hover:bg-[#9ee862] transition-all disabled:opacity-50 shadow-lg shadow-[#8ce04a]/10 shrink-0 self-start sm:self-center"
              >
                {isAuditingAll ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Auditing Prompts...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>{metrics.totalRuns === 0 ? 'Run First Audit' : 'Run Audit Now'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Metrics Display */}
            {metrics.totalRuns === 0 ? (
              <div className="mt-4">
                <p className="text-xs text-zinc-400 max-w-xl mb-6">
                  No audit runs recorded yet. Click <strong>&quot;Run First Audit&quot;</strong> to query Google Gemini with Google Search grounding across all your tracked queries.
                </p>

                {/* Empty State Faded Gauges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 opacity-30 select-none pointer-events-none">
                  <div className="p-3.5 rounded-xl border border-white/[0.08] bg-black/40">
                    <div className="text-[11px] text-zinc-400 font-medium">Brand Mention Rate</div>
                    <div className="text-2xl font-bold text-zinc-300 mt-1">--%</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">Across all queries</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-white/[0.08] bg-black/40">
                    <div className="text-[11px] text-zinc-400 font-medium">Share of Voice</div>
                    <div className="text-2xl font-bold text-zinc-300 mt-1">--%</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">vs. {competitors.length} competitors</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-white/[0.08] bg-black/40">
                    <div className="text-[11px] text-zinc-400 font-medium">Citations Found</div>
                    <div className="text-2xl font-bold text-zinc-300 mt-1">--</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">Grounding URLs</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                {/* 1. Brand Mention Rate */}
                <div className="p-4 rounded-xl border border-white/[0.08] bg-black/50 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-zinc-400">Brand Mention Rate</div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold text-white tracking-tight">
                        {metrics.brandMentionRate}%
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Recommended in answers
                    </p>
                  </div>
                  <div className="mt-3">
                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, metrics.brandMentionRate)}%` }}
                        className="h-full bg-[#8ce04a] rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Share of Voice */}
                <div className="p-4 rounded-xl border border-white/[0.08] bg-black/50 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-zinc-400">Share of Voice</div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold text-white tracking-tight">
                        {metrics.shareOfVoice}%
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      vs. {competitors.length} benchmark rivals
                    </p>
                  </div>
                  <div className="mt-3">
                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, metrics.shareOfVoice)}%` }}
                        className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Citations Found */}
                <div className="p-4 rounded-xl border border-white/[0.08] bg-black/50 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-zinc-400">Top Citations</div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold text-white tracking-tight">
                        {metrics.topCitationsCount}
                      </span>
                      <span className="text-[10px] text-zinc-500">direct links</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {metrics.topCitedDomains.length > 0 ? (
                        metrics.topCitedDomains.slice(0, 2).map((d, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[9px] bg-white/[0.06] text-zinc-300 truncate max-w-[110px]"
                          >
                            {d.domain}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-zinc-500 italic">No web links cited</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 text-[10px] text-zinc-500">
                    {metrics.totalRuns} total audit runs
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between text-xs text-zinc-500 gap-2">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-[#8ce04a]" />
              <span>Engine Active: Gemini 2.5/2.0 Flash • Groq Structured Extraction</span>
            </span>
            <span className="text-[11px] text-zinc-600">
              OpenAI & Perplexity scheduled for Phase 4
            </span>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: COMPETITORS BENCHMARK */}
      <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/80 backdrop-blur-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#8ce04a]/10 text-[#8ce04a] border border-[#8ce04a]/20">
              <Swords className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Competitor Benchmarks</h3>
              <p className="text-xs text-zinc-400">
                Rival brands benchmarked alongside yours in each audit run
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 hidden sm:inline font-mono">
              {competitors.length} / 15 tracked
            </span>
            <button
              onClick={() => setIsAddingComp(true)}
              disabled={competitors.length >= 15 || isPending}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-zinc-200 hover:text-white transition-colors disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5 text-[#8ce04a]" />
              <span>Add Competitor</span>
            </button>
          </div>
        </div>

        {competitors.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-white/10 text-center text-xs text-zinc-500">
            No competitors currently tracked. Click &quot;Add Competitor&quot; to begin benchmarking.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {competitors.map((comp) => (
              <div
                key={comp.id}
                className="p-4 rounded-xl border border-white/[0.06] bg-black/40 flex items-center justify-between gap-3 group hover:border-white/20 transition-all"
              >
                <div className="truncate">
                  <div className="text-xs font-semibold text-zinc-200 truncate">{comp.name}</div>
                  {comp.domain ? (
                    <div className="text-[11px] text-zinc-500 truncate flex items-center gap-1 mt-0.5">
                      <Globe className="h-2.5 w-2.5" />
                      <span>{comp.domain}</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-zinc-600 italic mt-0.5">No domain tracked</div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveCompetitor(comp)}
                  disabled={isPending}
                  className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0"
                  title="Remove competitor"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM SECTION: TRACKED PROMPTS & INLINE AUDIT ACTIONS */}
      <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/80 backdrop-blur-xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#8ce04a]/10 text-[#8ce04a] border border-[#8ce04a]/20">
              <Search className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Tracked Prompt Queries</h3>
              <p className="text-xs text-zinc-400">
                Natural queries evaluated across AI models — click Run (Play) to audit a single prompt
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 hidden sm:inline font-mono mr-2">
              {prompts.length} / 25 queries
            </span>
            <button
              onClick={() => {
                setIsSuggestingPrompts(true);
                generateTemplates();
              }}
              disabled={prompts.length >= 25 || isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8ce04a]/10 border border-[#8ce04a]/30 text-xs font-semibold text-[#8ce04a] hover:bg-[#8ce04a]/20 transition-colors disabled:opacity-40"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Suggest Prompts</span>
            </button>

            <button
              onClick={() => setIsAddingPrompt(true)}
              disabled={prompts.length >= 25 || isPending}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-zinc-200 hover:text-white transition-colors disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5 text-[#8ce04a]" />
              <span>Add Query</span>
            </button>
          </div>
        </div>

        {prompts.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-white/10 text-center text-xs text-zinc-500">
            No prompts currently tracked. Use &quot;Add Query&quot; or &quot;Suggest Prompts&quot; to begin monitoring search visibility.
          </div>
        ) : (
          <div className="space-y-2.5">
            {prompts.map((prompt) => {
              const summary = promptSummaries[prompt.id];
              const isRunningThis = runningPromptId === prompt.id;

              return (
                <div
                  key={prompt.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    prompt.is_active
                      ? 'border-white/[0.08] bg-black/40 hover:border-white/20'
                      : 'border-white/[0.04] bg-black/20 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3 truncate">
                    {/* Run Single Prompt Button */}
                    <button
                      type="button"
                      onClick={() => handleRunSinglePrompt(prompt.id)}
                      disabled={isRunningThis || !prompt.is_active || isAuditingAll}
                      className={`p-2 rounded-lg border transition-all shrink-0 mt-0.5 ${
                        isRunningThis
                          ? 'border-[#8ce04a] bg-[#8ce04a]/20 text-[#8ce04a]'
                          : 'border-[#8ce04a]/30 bg-[#8ce04a]/10 text-[#8ce04a] hover:bg-[#8ce04a] hover:text-black hover:border-[#8ce04a]'
                      } disabled:opacity-40`}
                      title="Run audit now for this query"
                    >
                      {isRunningThis ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Play className="h-3.5 w-3.5 fill-current" />
                      )}
                    </button>

                    <div className="truncate">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xs font-semibold text-zinc-100 truncate">{prompt.text}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {prompt.topic && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.04] border border-white/[0.06] text-zinc-400">
                            {prompt.topic}
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-500 uppercase font-mono">
                          {prompt.locale}
                        </span>

                        {!prompt.is_active && (
                          <span className="text-[10px] text-yellow-500 font-semibold">Paused</span>
                        )}

                        {/* Inline Latest Result */}
                        {summary?.statusSummary ? (
                          <div className="flex items-center gap-1.5 ml-1">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                summary.selfMentioned
                                  ? 'border-[#8ce04a]/40 bg-[#8ce04a]/15 text-[#8ce04a]'
                                  : 'border-white/10 bg-white/[0.04] text-zinc-400'
                              }`}
                            >
                              {summary.statusSummary}
                            </span>

                            {summary.selfCited && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold border border-blue-500/30 bg-blue-500/10 text-blue-400 flex items-center gap-1">
                                <ExternalLink className="h-2.5 w-2.5" />
                                <span>Cited</span>
                              </span>
                            )}

                            <span className="text-[10px] text-zinc-500">
                              • {formatTimeAgo(summary.lastRunAt)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-600 italic ml-1">
                            • Not audited yet
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTogglePrompt(prompt)}
                      disabled={isPending}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        prompt.is_active
                          ? 'border-[#8ce04a]/30 bg-[#8ce04a]/10 text-[#8ce04a] hover:text-rose-400'
                          : 'border-white/10 bg-white/[0.04] text-zinc-500 hover:text-[#8ce04a]'
                      }`}
                      title={prompt.is_active ? 'Pause prompt' : 'Activate prompt'}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingPrompt(prompt);
                        setEditPromptText(prompt.text);
                        setEditPromptTopic(prompt.topic || '');
                      }}
                      disabled={isPending}
                      className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
                      title="Edit prompt"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeletePrompt(prompt)}
                      disabled={isPending}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete prompt"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RECENT AUDIT EVIDENCE HISTORY */}
      {recentRuns.length > 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/80 backdrop-blur-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#8ce04a]" />
              <h3 className="text-sm font-bold text-white">Recent Audit History & Evidence</h3>
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              {recentRuns.length} most recent audits
            </span>
          </div>

          <div className="space-y-2">
            {recentRuns.slice(0, 8).map((run) => (
              <div
                key={run.id}
                className="p-3 rounded-xl border border-white/[0.06] bg-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="truncate">
                  <div className="font-medium text-zinc-200 truncate">
                    {run.promptText || 'Custom Query'}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                    <span className="capitalize">{run.engine}</span>
                    <span>•</span>
                    <span>{run.model || 'gemini-2.5-flash'}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(run.run_at)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectingRun(run)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-colors self-start sm:self-center shrink-0"
                >
                  <FileText className="h-3 w-3 text-[#8ce04a]" />
                  <span>Inspect Response</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: INSPECT RAW AUDIT EVIDENCE */}
      {/* ============================================================= */}
      {inspectingRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-sm font-bold text-white">Raw AI Assistant Response</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Model: {inspectingRun.model || inspectingRun.engine} • Audited {formatTimeAgo(inspectingRun.run_at)}
                </p>
              </div>
              <button onClick={() => setInspectingRun(null)} className="text-zinc-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <div className="p-4 rounded-xl border border-white/[0.06] bg-black/60 font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {inspectingRun.raw_response || 'No response recorded.'}
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={() => setInspectingRun(null)}
                className="px-4 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: EDIT BRAND */}
      {/* ============================================================= */}
      {isEditingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Edit Your Brand Information</h3>
              <button onClick={() => setIsEditingBrand(false)} className="text-zinc-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">Brand Name *</label>
                <input
                  type="text"
                  value={editBrandName}
                  onChange={(e) => setEditBrandName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/60 text-xs text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">Primary Domain *</label>
                <input
                  type="text"
                  value={editBrandDomain}
                  onChange={(e) => setEditBrandDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/60 text-xs text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                  Aliases (comma-separated)
                </label>
                <input
                  type="text"
                  value={editBrandAliases}
                  onChange={(e) => setEditBrandAliases(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/60 text-xs text-zinc-100"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex justify-end gap-2">
              <button
                onClick={() => setIsEditingBrand(false)}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBrand}
                disabled={isPending}
                className="px-4 py-1.5 rounded-lg bg-[#8ce04a] text-black font-semibold text-xs hover:bg-[#9ee862] disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: ADD COMPETITOR */}
      {/* ============================================================= */}
      {isAddingComp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Add Competitor Brand</h3>
              <button onClick={() => setIsAddingComp(false)} className="text-zinc-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">Competitor Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Notion, Linear, ClickUp"
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/60 text-xs text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">Domain (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. notion.so"
                  value={newCompDomain}
                  onChange={(e) => setNewCompDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/60 text-xs text-zinc-100"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex justify-end gap-2">
              <button
                onClick={() => setIsAddingComp(false)}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCompetitor}
                disabled={isPending}
                className="px-4 py-1.5 rounded-lg bg-[#8ce04a] text-black font-semibold text-xs hover:bg-[#9ee862] disabled:opacity-50"
              >
                Add Competitor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: ADD PROMPT */}
      {/* ============================================================= */}
      {isAddingPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Add Query to Track</h3>
              <button onClick={() => setIsAddingPrompt(false)} className="text-zinc-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">Natural Search Query *</label>
                <input
                  type="text"
                  placeholder="e.g. Best database migration tools for Next.js"
                  value={newPromptText}
                  onChange={(e) => setNewPromptText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/60 text-xs text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">Topic Tag (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Developer Tools, CRM"
                  value={newPromptTopic}
                  onChange={(e) => setNewPromptTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/60 text-xs text-zinc-100"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex justify-end gap-2">
              <button
                onClick={() => setIsAddingPrompt(false)}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPrompt}
                disabled={isPending}
                className="px-4 py-1.5 rounded-lg bg-[#8ce04a] text-black font-semibold text-xs hover:bg-[#9ee862] disabled:opacity-50"
              >
                Save Query
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: EDIT PROMPT */}
      {/* ============================================================= */}
      {editingPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Edit Query</h3>
              <button onClick={() => setEditingPrompt(null)} className="text-zinc-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">Search Query *</label>
                <input
                  type="text"
                  value={editPromptText}
                  onChange={(e) => setEditPromptText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/60 text-xs text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">Topic Tag</label>
                <input
                  type="text"
                  value={editPromptTopic}
                  onChange={(e) => setEditPromptTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/60 text-xs text-zinc-100"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex justify-end gap-2">
              <button
                onClick={() => setEditingPrompt(null)}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePromptEdit}
                disabled={isPending}
                className="px-4 py-1.5 rounded-lg bg-[#8ce04a] text-black font-semibold text-xs hover:bg-[#9ee862] disabled:opacity-50"
              >
                Update Query
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: SUGGEST PROMPTS (CLIENT TEMPLATES) */}
      {/* ============================================================= */}
      {isSuggestingPrompts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#8ce04a]" />
                <h3 className="text-sm font-bold text-white">Starter Prompt Idea Generator</h3>
              </div>
              <button onClick={() => setIsSuggestingPrompts(false)} className="text-zinc-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Topic / Category</label>
                <input
                  type="text"
                  value={suggestTopic}
                  onChange={(e) => setSuggestTopic(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-white/10 bg-black/60 text-xs text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Audience</label>
                <input
                  type="text"
                  value={suggestAudience}
                  onChange={(e) => setSuggestAudience(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-white/10 bg-black/60 text-xs text-zinc-100"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={generateTemplates}
                className="text-xs text-[#8ce04a] hover:underline"
              >
                Regenerate Ideas
              </button>
            </div>

            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {generatedSuggestions.map((s, idx) => (
                <label
                  key={idx}
                  className="flex items-start gap-2 p-2 rounded-lg border border-white/[0.06] bg-black/40 hover:bg-white/[0.02] cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={s.selected}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setGeneratedSuggestions((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, selected: checked } : item))
                      );
                    }}
                    className="mt-0.5 rounded border-white/20 bg-black text-[#8ce04a] focus:ring-[#8ce04a]"
                  />
                  <div className="flex-1">
                    <span className="text-zinc-200">{s.text}</span>
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-white/[0.06] text-zinc-400">
                      {s.topic}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex justify-end gap-2">
              <button
                onClick={() => setIsSuggestingPrompts(false)}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBatchGeneratedPrompts}
                disabled={isPending || !generatedSuggestions.some((s) => s.selected)}
                className="px-4 py-1.5 rounded-lg bg-[#8ce04a] text-black font-semibold text-xs hover:bg-[#9ee862] disabled:opacity-50"
              >
                Add Selected to Prompts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
