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
  CheckCircle2,
  X,
  BarChart3,
  TrendingUp,
  Play,
  Loader2,
  Clock,
  FileText,
  Star,
  ArrowUpRight,
  RefreshCw,
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

      if (!res.success && res.completed === 0) {
        const firstError = res.results.find((r) => r.error)?.error;
        setNotification({
          type: 'error',
          message: res.message || (firstError ? `Audit failed: ${firstError}` : `Audit finished: Analyzed 0 of ${res.total} prompts. Check API keys and logs.`),
        });
      } else if (res.completed < res.total) {
        setNotification({
          type: 'warning',
          message: res.message || `Analyzed ${res.completed} of ${res.total} (${res.rateLimitedCount} rate-limited — retry later).`,
        });
        router.refresh();
      } else {
        setNotification({
          type: 'success',
          message: res.message || `Batch audit complete! Analyzed ${res.completed} of ${res.total} active prompts with Google Gemini.`,
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
      { text: `Best ${topic} software for ${audience} in 2026`, topic: 'Best In Category' },
      { text: `Top ${topic} alternatives to ${topComp}`, topic: 'Competitor Alternative' },
      { text: `Is ${selfBrand.name} good for ${topic}?`, topic: 'Brand Evaluation' },
      { text: `${selfBrand.name} vs ${topComp} comparison`, topic: 'Head to Head' },
      { text: `What is the easiest ${topic} tool with great support?`, topic: 'Usability' },
      { text: `Affordable ${topic} platforms for ${audience}`, topic: 'Pricing' },
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
        const res = await addPromptAction({ text: item.text, topic: item.topic, locale: 'en' });
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

  const hasRuns = metrics.totalRuns > 0;

  // ---------------- shared modal input class ----------------
  const inputCls =
    'w-full px-space-md py-space-sm rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary transition-all';
  const labelCls = 'block font-label-mono-sm text-label-mono-sm text-on-surface-variant mb-1';
  const primaryBtn =
    'px-space-md py-1.5 rounded-lg bg-gradient-to-r from-primary via-secondary to-tertiary text-surface-container-lowest font-headline-sm text-headline-sm font-bold hover:-translate-y-0.5 transition-all disabled:opacity-50 shadow-[0_0_18px_rgba(124,92,255,0.3)]';
  const ghostBtn =
    'px-space-md py-1.5 rounded-lg border border-outline-variant/40 text-body-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors';

  return (
    <div className="relative space-y-space-lg">
      {/* Ambient glow orbs */}
      <div className="absolute top-8 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none -z-10" />
      <div className="absolute top-56 right-8 w-80 h-80 bg-tertiary/10 rounded-full blur-[110px] pointer-events-none -z-10" />

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-space-md rounded-xl border font-body-sm text-body-sm flex items-center justify-between transition-all ${
            notification.type === 'success'
              ? 'border-tertiary/30 bg-tertiary/10 text-tertiary'
              : notification.type === 'warning'
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-error/40 bg-error-container/30 text-error'
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
          <button onClick={() => setNotification(null)} className="text-on-surface-variant hover:text-on-surface ml-3">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Telemetry sub-bar */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm bg-surface-container-lowest/70 backdrop-blur-md rounded-xl p-space-md shadow-sm">
        <div className="flex items-center gap-space-xs font-nav-pill text-nav-pill text-on-surface-variant flex-wrap">
          <span>Workspaces</span>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-container" />
            {orgName || 'SlashSaaS Core'}
          </span>
          <span className="text-outline-variant">/</span>
          <span className="text-primary font-medium">Overview</span>
        </div>
        <div className="flex items-center gap-space-xs flex-wrap font-label-mono-sm text-label-mono-sm">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-tertiary">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
            <span>Engine: Gemini · Grounded</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">
            <Clock className="h-3 w-3" />
            <span>Last audit: {formatTimeAgo(metrics.lastAuditedAt)}</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">
            <Globe className="h-3 w-3" />
            <span>Region: Global (EN)</span>
          </div>
        </div>
      </section>

      {/* TOP ROW: Brand + Score */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
        {/* Brand card */}
        <div className="lg:col-span-4 bg-surface-container-low/90 backdrop-blur-xl rounded-xl p-space-lg flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between pb-space-sm">
              <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant tracking-wider uppercase flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" /> Monitored Entity
              </span>
              <button
                onClick={() => {
                  setEditBrandName(selfBrand.name);
                  setEditBrandDomain(selfBrand.domain || '');
                  setEditBrandAliases(selfBrand.aliases?.join(', ') || '');
                  setIsEditingBrand(true);
                }}
                className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors font-body-sm text-body-sm px-2 py-0.5 rounded-md hover:bg-surface-container"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="pt-space-xs">
              <h2 className="font-headline-xl text-headline-xl text-on-surface font-extrabold tracking-tight">{selfBrand.name}</h2>
              {selfBrand.domain && (
                <a
                  href={`https://${selfBrand.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-label-mono-md text-label-mono-md text-secondary hover:text-tertiary transition-colors mt-1"
                >
                  <span>{selfBrand.domain}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 pt-space-md flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary/10 text-tertiary font-label-mono-sm text-label-mono-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping" />
                <span className="font-medium">Active Monitor</span>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-mono-sm text-label-mono-sm">
                <Globe className="h-3 w-3" />
                <span>Locale: EN</span>
              </div>
            </div>

            {selfBrand.aliases && selfBrand.aliases.length > 0 && (
              <div className="pt-space-lg space-y-space-xs">
                <p className="font-label-mono-sm text-label-mono-sm text-on-surface-variant tracking-wider uppercase">Tracked Aliases</p>
                <div className="flex flex-wrap gap-1.5">
                  {selfBrand.aliases.map((alias, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md bg-surface-container text-on-surface font-body-sm text-body-sm font-medium">
                      {alias}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-space-lg mt-space-md flex items-center justify-between font-label-mono-sm text-label-mono-sm text-on-surface-variant bg-surface-container-lowest/40 -mx-space-lg -mb-space-lg px-space-lg py-space-sm rounded-b-xl">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-outline" />
              <span>Monitored continuously</span>
            </span>
            <span className="text-tertiary flex items-center gap-1">Live</span>
          </div>
        </div>

        {/* Score card */}
        <div className="lg:col-span-8 bg-surface-container-low/90 backdrop-blur-xl rounded-xl p-space-lg flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-tertiary/10 rounded-full blur-3xl pointer-events-none" />
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-md">
              <div className="flex items-center gap-space-sm flex-wrap">
                <h3 className="font-headline-md text-headline-md text-on-surface tracking-tight">AI Search Visibility Score</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-mono-sm text-label-mono-sm font-medium">
                  <Sparkles className="h-3 w-3 text-tertiary" />
                  Engine: Gemini · Grounded
                </span>
                {metrics.lastAuditedAt && (
                  <span className="text-on-surface-variant font-label-mono-sm text-label-mono-sm">Last run {formatTimeAgo(metrics.lastAuditedAt)}</span>
                )}
              </div>
              <button
                onClick={handleRunAuditAll}
                disabled={isAuditingAll || prompts.length === 0}
                className="inline-flex items-center justify-center gap-2 px-space-md py-2 rounded-lg bg-gradient-to-r from-primary via-secondary to-tertiary text-surface-container-lowest font-headline-sm text-headline-sm font-bold shadow-[0_0_24px_rgba(124,92,255,0.35)] hover:shadow-[0_0_32px_rgba(47,217,244,0.5)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0 shrink-0"
              >
                {isAuditingAll ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Auditing…</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>{hasRuns ? 'Run Audit Now' : 'Run First Audit'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Metric tiles */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-space-sm pt-space-xs ${hasRuns ? '' : 'opacity-40 select-none pointer-events-none'}`}>
              {/* Brand Mention Rate */}
              <div className="bg-surface-container rounded-lg p-space-md flex flex-col justify-between shadow-sm">
                <div className="flex items-start justify-between">
                  <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">Brand Mention Rate</span>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-tertiary/15 text-tertiary font-label-mono-sm text-label-mono-sm font-medium">
                    <TrendingUp className="h-3 w-3" />
                    rate
                  </span>
                </div>
                <div className="py-space-xs">
                  <span className="text-[32px] leading-9 font-extrabold text-on-surface">{hasRuns ? `${metrics.brandMentionRate}%` : '--%'}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-tertiary h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, metrics.brandMentionRate)}%` }} />
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">Recommended in AI answers</p>
                </div>
              </div>

              {/* Share of Voice */}
              <div className="bg-surface-container rounded-lg p-space-md flex flex-col justify-between shadow-sm">
                <div className="flex items-start justify-between">
                  <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">Share of Voice</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-container-high text-secondary font-label-mono-sm text-label-mono-sm">
                    vs {competitors.length} rivals
                  </span>
                </div>
                <div className="py-space-xs">
                  <span className="text-[32px] leading-9 font-extrabold text-on-surface">{hasRuns ? `${metrics.shareOfVoice}%` : '--%'}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                    <div className="bg-tertiary h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, metrics.shareOfVoice)}%` }} />
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">Your slice of the AI conversation</p>
                </div>
              </div>

              {/* Top Citations */}
              <div className="bg-surface-container rounded-lg p-space-md flex flex-col justify-between shadow-sm">
                <div className="flex items-start justify-between">
                  <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">Top Citations</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface font-label-mono-sm text-label-mono-sm">
                    {metrics.totalRuns} runs
                  </span>
                </div>
                <div className="py-space-xs flex items-baseline justify-between gap-2">
                  <span className="text-[32px] leading-9 font-extrabold text-on-surface">{hasRuns ? metrics.topCitationsCount : '--'}</span>
                  <div className="flex items-center gap-1 flex-wrap justify-end">
                    {metrics.topCitedDomains.slice(0, 2).map((d, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface text-[11px] font-bold truncate max-w-[90px]">{d.domain}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                    <div className="bg-secondary-container h-full rounded-full" style={{ width: metrics.topCitationsCount > 0 ? '85%' : '4%' }} />
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {metrics.topCitedDomains.length > 0 ? 'Web sources citing you' : 'No web links cited yet'}
                  </p>
                </div>
              </div>
            </div>

            {!hasRuns && (
              <p className="mt-space-md font-body-sm text-body-sm text-on-surface-variant max-w-xl">
                No audit runs recorded yet. Click <strong className="text-on-surface">&quot;Run First Audit&quot;</strong> to query Google Gemini with grounding across all your tracked prompts.
              </p>
            )}
          </div>

          <div className="pt-space-md mt-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-on-surface-variant font-label-mono-sm text-label-mono-sm bg-surface-container-lowest/40 -mx-space-lg -mb-space-lg px-space-lg py-space-sm rounded-b-xl">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
              <span>Engine active: <strong className="text-on-surface font-medium">Gemini</strong> · Groq extraction (auto-fallback)</span>
            </div>
            <span className="text-outline">OpenAI &amp; Perplexity scheduled next</span>
          </div>
        </div>
      </section>

      {/* COMPETITOR BENCHMARKS */}
      <section className="bg-surface-container-low/90 backdrop-blur-xl rounded-xl p-space-lg shadow-md space-y-space-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <div className="p-2 rounded-lg bg-primary/10 text-primary"><Swords className="h-4 w-4" /></div>
            <h3 className="font-headline-md text-headline-md text-on-surface tracking-tight">Competitor Benchmarks</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-mono-sm text-label-mono-sm">{competitors.length} / 15 tracked</span>
          </div>
          <button
            onClick={() => setIsAddingComp(true)}
            disabled={competitors.length >= 15 || isPending}
            className="inline-flex items-center gap-1.5 px-space-sm py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-all font-body-md text-body-md font-medium disabled:opacity-40"
          >
            <Plus className="h-4 w-4 text-tertiary" />
            <span>Add competitor</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm">
          {competitors.map((comp) => (
            <div key={comp.id} className="bg-surface-container rounded-lg p-space-md flex items-start justify-between group hover:bg-surface-container-high transition-all shadow-sm">
              <div className="flex items-center gap-space-xs min-w-0">
                <div className="w-9 h-9 rounded-md bg-surface-container-highest flex items-center justify-center font-headline-sm text-headline-sm font-bold text-primary shrink-0">
                  {comp.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">{comp.name}</h4>
                  {comp.domain ? (
                    <a href={`https://${comp.domain}`} target="_blank" rel="noreferrer" className="font-label-mono-sm text-label-mono-sm text-on-surface-variant hover:text-secondary flex items-center gap-0.5 truncate">
                      {comp.domain}
                      <ArrowUpRight className="h-2.5 w-2.5 shrink-0" />
                    </a>
                  ) : (
                    <span className="font-label-mono-sm text-label-mono-sm text-outline">No domain tracked</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleRemoveCompetitor(comp)}
                disabled={isPending}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-on-surface-variant hover:text-error shrink-0"
                title="Delete competitor"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {/* Add slot */}
          {competitors.length < 15 && (
            <button
              onClick={() => setIsAddingComp(true)}
              className="bg-surface-container/40 rounded-lg p-space-md flex flex-col items-center justify-center text-center cursor-pointer group hover:bg-surface-container transition-all min-h-[92px]"
            >
              <div className="w-10 h-10 rounded-full bg-surface-container-high group-hover:bg-primary/20 group-hover:text-primary transition-all flex items-center justify-center text-on-surface-variant mb-2">
                <Plus className="h-5 w-5" />
              </div>
              <span className="font-headline-sm text-headline-sm text-on-surface font-medium">Track new rival</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{15 - competitors.length} slots remaining</span>
            </button>
          )}
        </div>
      </section>

      {/* TRACKED PROMPT QUERIES */}
      <section className="bg-surface-container-low/90 backdrop-blur-xl rounded-xl p-space-lg shadow-md space-y-space-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-sm">
              <div className="p-2 rounded-lg bg-primary/10 text-primary"><Search className="h-4 w-4" /></div>
              <h3 className="font-headline-md text-headline-md text-on-surface tracking-tight">Tracked Prompt Queries</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-tertiary font-label-mono-sm text-label-mono-sm font-medium">{prompts.length} / 25 queries</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 ml-11">Natural buyer prompts audited across AI answer engines — click Run to audit a single prompt.</p>
          </div>
          <div className="flex items-center gap-space-xs flex-wrap">
            <button
              onClick={() => { setIsSuggestingPrompts(true); generateTemplates(); }}
              disabled={prompts.length >= 25 || isPending}
              className="inline-flex items-center gap-1.5 px-space-sm py-1.5 rounded-lg bg-surface-container text-primary hover:bg-surface-container-high transition-colors font-body-md text-body-md disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" />
              <span>Suggest prompts</span>
            </button>
            <button
              onClick={() => setIsAddingPrompt(true)}
              disabled={prompts.length >= 25 || isPending}
              className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-lg bg-primary-container text-on-primary font-body-md text-body-md font-semibold hover:bg-primary transition-all shadow-sm disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              <span>Add query</span>
            </button>
          </div>
        </div>

        {prompts.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-outline-variant/40 text-center font-body-sm text-body-sm text-on-surface-variant">
            No prompts tracked yet. Use &quot;Add query&quot; or &quot;Suggest prompts&quot; to begin monitoring.
          </div>
        ) : (
          <div className="space-y-2">
            {prompts.map((prompt) => {
              const summary = promptSummaries[prompt.id];
              const isRunningThis = runningPromptId === prompt.id;
              const isError = summary?.statusSummary?.startsWith('Error:');
              return (
                <div
                  key={prompt.id}
                  className={`flex flex-col xl:flex-row xl:items-center justify-between p-space-sm bg-surface-container hover:bg-surface-container-high rounded-lg gap-space-sm transition-all group shadow-sm ${prompt.is_active ? '' : 'opacity-60'}`}
                >
                  <div className="flex items-center gap-space-sm min-w-0 flex-1">
                    <button
                      onClick={() => handleRunSinglePrompt(prompt.id)}
                      disabled={isRunningThis || !prompt.is_active || isAuditingAll}
                      className="w-8 h-8 rounded-md bg-surface-container-highest group-hover:bg-primary group-hover:text-on-primary text-on-surface-variant flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                      title="Run audit for this prompt"
                    >
                      {isRunningThis ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <span className="font-headline-sm text-headline-sm text-on-surface font-bold truncate block">{prompt.text}</span>
                      <div className="flex items-center gap-1.5 pt-1 flex-wrap font-label-mono-sm text-label-mono-sm">
                        {prompt.topic && <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">{prompt.topic}</span>}
                        <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant uppercase">{prompt.locale}</span>
                        {!prompt.is_active && <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-primary">Paused</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between xl:justify-end gap-space-md flex-shrink-0">
                    <div className="flex flex-col items-start xl:items-end">
                      {summary?.statusSummary ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-mono-sm text-label-mono-sm font-semibold ${
                            isError
                              ? 'bg-error-container/40 text-error'
                              : summary.selfMentioned
                              ? 'bg-tertiary/15 text-tertiary shadow-[0_0_12px_rgba(47,217,244,0.2)]'
                              : 'bg-surface-container-highest text-on-surface-variant'
                          }`}
                          title={isError ? summary.statusSummary : undefined}
                        >
                          {summary.selfMentioned && !isError && <Star className="h-3 w-3 fill-current" />}
                          {isError ? 'Failed' : summary.statusSummary}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-label-mono-sm text-label-mono-sm">Not audited yet</span>
                      )}
                      {summary?.lastRunAt && (
                        <span className="text-on-surface-variant font-label-mono-sm text-label-mono-sm mt-0.5 flex items-center gap-1">
                          {summary.selfCited && !isError && <span className="text-tertiary">Cited ·</span>}
                          {formatTimeAgo(summary.lastRunAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingPrompt(prompt); setEditPromptText(prompt.text); setEditPromptTopic(prompt.topic || ''); }}
                        disabled={isPending}
                        className="p-1.5 rounded hover:bg-surface-variant text-on-surface-variant hover:text-on-surface"
                        title="Edit prompt"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {/* Toggle switch */}
                      <button
                        onClick={() => handleTogglePrompt(prompt)}
                        disabled={isPending}
                        className={`w-8 h-4 rounded-full p-0.5 flex items-center transition-all ${prompt.is_active ? 'bg-tertiary justify-end' : 'bg-surface-container-highest justify-start'}`}
                        title={prompt.is_active ? 'Active — click to pause' : 'Paused — click to activate'}
                      >
                        <span className="w-3 h-3 bg-surface-container-lowest rounded-full shadow-sm" />
                      </button>
                      <button
                        onClick={() => handleDeletePrompt(prompt)}
                        disabled={isPending}
                        className="p-1.5 rounded hover:bg-surface-variant text-on-surface-variant hover:text-error"
                        title="Delete prompt"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* RECENT AUDIT EVIDENCE */}
      {recentRuns.length > 0 && (
        <section className="bg-surface-container-low/90 backdrop-blur-xl rounded-xl p-space-lg shadow-md">
          <div className="flex items-center justify-between mb-space-md pb-space-sm border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-tertiary" />
              <h3 className="font-headline-md text-headline-md text-on-surface tracking-tight">Recent Audit History &amp; Evidence</h3>
            </div>
            <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">{recentRuns.length} recent</span>
          </div>
          <div className="space-y-2">
            {recentRuns.slice(0, 8).map((run) => (
              <div key={run.id} className="p-space-sm rounded-lg bg-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-body-md text-body-md text-on-surface truncate">{run.promptText || 'Custom Query'}</div>
                  <div className="flex items-center gap-2 font-label-mono-sm text-label-mono-sm text-on-surface-variant mt-0.5">
                    <span className="capitalize">{run.engine}</span>
                    <span>·</span>
                    <span className="truncate">{run.model || 'gemini'}</span>
                    <span>·</span>
                    <span>{formatTimeAgo(run.run_at)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setInspectingRun(run)}
                  className="inline-flex items-center gap-1.5 px-space-sm py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors self-start sm:self-center shrink-0 font-body-md text-body-md"
                >
                  <FileText className="h-3.5 w-3.5 text-tertiary" />
                  <span>Inspect response</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===================== MODALS ===================== */}
      {inspectingRun && (
        <Modal onClose={() => setInspectingRun(null)} wide>
          <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Raw AI Assistant Response</h3>
              <p className="font-label-mono-sm text-label-mono-sm text-on-surface-variant mt-0.5">
                Model: {inspectingRun.model || inspectingRun.engine} · {formatTimeAgo(inspectingRun.run_at)}
              </p>
            </div>
            <button onClick={() => setInspectingRun(null)} className="text-on-surface-variant hover:text-on-surface"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 max-h-[60vh] mt-space-md">
            <div className="p-space-md rounded-lg bg-surface-container-lowest font-mono text-body-sm text-on-surface-variant whitespace-pre-wrap leading-relaxed">
              {inspectingRun.raw_response || 'No response recorded.'}
            </div>
          </div>
          <div className="pt-space-md flex justify-end">
            <button onClick={() => setInspectingRun(null)} className={ghostBtn}>Close</button>
          </div>
        </Modal>
      )}

      {isEditingBrand && (
        <Modal onClose={() => setIsEditingBrand(false)}>
          <ModalHeader title="Edit your brand" onClose={() => setIsEditingBrand(false)} />
          <div className="space-y-space-sm mt-space-md">
            <div><label className={labelCls}>Brand name *</label><input className={inputCls} value={editBrandName} onChange={(e) => setEditBrandName(e.target.value)} /></div>
            <div><label className={labelCls}>Primary domain *</label><input className={inputCls} value={editBrandDomain} onChange={(e) => setEditBrandDomain(e.target.value)} /></div>
            <div><label className={labelCls}>Aliases (comma-separated)</label><input className={inputCls} value={editBrandAliases} onChange={(e) => setEditBrandAliases(e.target.value)} /></div>
          </div>
          <div className="pt-space-md flex justify-end gap-2">
            <button onClick={() => setIsEditingBrand(false)} className={ghostBtn}>Cancel</button>
            <button onClick={handleSaveBrand} disabled={isPending} className={primaryBtn}>Save changes</button>
          </div>
        </Modal>
      )}

      {isAddingComp && (
        <Modal onClose={() => setIsAddingComp(false)}>
          <ModalHeader title="Add competitor" onClose={() => setIsAddingComp(false)} />
          <div className="space-y-space-sm mt-space-md">
            <div><label className={labelCls}>Competitor name *</label><input className={inputCls} placeholder="e.g. Notion, Linear, ClickUp" value={newCompName} onChange={(e) => setNewCompName(e.target.value)} /></div>
            <div><label className={labelCls}>Domain (optional)</label><input className={inputCls} placeholder="e.g. notion.so" value={newCompDomain} onChange={(e) => setNewCompDomain(e.target.value)} /></div>
          </div>
          <div className="pt-space-md flex justify-end gap-2">
            <button onClick={() => setIsAddingComp(false)} className={ghostBtn}>Cancel</button>
            <button onClick={handleAddCompetitor} disabled={isPending} className={primaryBtn}>Add competitor</button>
          </div>
        </Modal>
      )}

      {isAddingPrompt && (
        <Modal onClose={() => setIsAddingPrompt(false)}>
          <ModalHeader title="Add query to track" onClose={() => setIsAddingPrompt(false)} />
          <div className="space-y-space-sm mt-space-md">
            <div><label className={labelCls}>Natural search query *</label><input className={inputCls} placeholder="e.g. Best database migration tools for Next.js" value={newPromptText} onChange={(e) => setNewPromptText(e.target.value)} /></div>
            <div><label className={labelCls}>Topic tag (optional)</label><input className={inputCls} placeholder="e.g. Developer Tools, CRM" value={newPromptTopic} onChange={(e) => setNewPromptTopic(e.target.value)} /></div>
          </div>
          <div className="pt-space-md flex justify-end gap-2">
            <button onClick={() => setIsAddingPrompt(false)} className={ghostBtn}>Cancel</button>
            <button onClick={handleAddPrompt} disabled={isPending} className={primaryBtn}>Save query</button>
          </div>
        </Modal>
      )}

      {editingPrompt && (
        <Modal onClose={() => setEditingPrompt(null)}>
          <ModalHeader title="Edit query" onClose={() => setEditingPrompt(null)} />
          <div className="space-y-space-sm mt-space-md">
            <div><label className={labelCls}>Search query *</label><input className={inputCls} value={editPromptText} onChange={(e) => setEditPromptText(e.target.value)} /></div>
            <div><label className={labelCls}>Topic tag</label><input className={inputCls} value={editPromptTopic} onChange={(e) => setEditPromptTopic(e.target.value)} /></div>
          </div>
          <div className="pt-space-md flex justify-end gap-2">
            <button onClick={() => setEditingPrompt(null)} className={ghostBtn}>Cancel</button>
            <button onClick={handleSavePromptEdit} disabled={isPending} className={primaryBtn}>Update query</button>
          </div>
        </Modal>
      )}

      {isSuggestingPrompts && (
        <Modal onClose={() => setIsSuggestingPrompts(false)} wide>
          <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Starter prompt generator</h3>
            </div>
            <button onClick={() => setIsSuggestingPrompts(false)} className="text-on-surface-variant hover:text-on-surface"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-space-sm mt-space-md">
            <div><label className={labelCls}>Topic / category</label><input className={inputCls} value={suggestTopic} onChange={(e) => setSuggestTopic(e.target.value)} /></div>
            <div><label className={labelCls}>Audience</label><input className={inputCls} value={suggestAudience} onChange={(e) => setSuggestAudience(e.target.value)} /></div>
          </div>
          <div className="flex justify-end mt-space-xs">
            <button onClick={generateTemplates} className="inline-flex items-center gap-1 font-label-mono-sm text-label-mono-sm text-primary hover:underline"><RefreshCw className="h-3 w-3" /> Regenerate</button>
          </div>
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 mt-space-sm">
            {generatedSuggestions.map((s, idx) => (
              <label key={idx} className="flex items-start gap-2 p-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high cursor-pointer font-body-sm text-body-sm">
                <input
                  type="checkbox"
                  checked={s.selected}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setGeneratedSuggestions((prev) => prev.map((item, i) => (i === idx ? { ...item, selected: checked } : item)));
                  }}
                  className="mt-0.5 accent-[#947dff]"
                />
                <div className="flex-1">
                  <span className="text-on-surface">{s.text}</span>
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[10px]">{s.topic}</span>
                </div>
              </label>
            ))}
          </div>
          <div className="pt-space-md flex justify-end gap-2">
            <button onClick={() => setIsSuggestingPrompts(false)} className={ghostBtn}>Cancel</button>
            <button onClick={handleAddBatchGeneratedPrompts} disabled={isPending || !generatedSuggestions.some((s) => s.selected)} className={primaryBtn}>Add selected</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- modal helpers ---------- */
function Modal({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div
        className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-2xl border border-outline-variant/30 bg-surface-container-low p-space-lg shadow-2xl flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20">
      <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{title}</h3>
      <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface"><X className="h-4 w-4" /></button>
    </div>
  );
}
