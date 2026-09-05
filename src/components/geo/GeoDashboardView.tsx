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
} from 'lucide-react';
import { Brand, Prompt } from '@/lib/types';
import {
  addCompetitorAction,
  removeBrandAction,
  updateSelfBrandAction,
  addPromptAction,
  togglePromptActiveAction,
  updatePromptAction,
  deletePromptAction,
} from '@/lib/actions/geo';

interface GeoDashboardViewProps {
  orgId: string;
  orgName: string;
  userEmail: string;
  selfBrand: Brand;
  competitors: Brand[];
  prompts: Prompt[];
}

export function GeoDashboardView({
  orgId,
  orgName,
  userEmail,
  selfBrand,
  competitors,
  prompts,
}: GeoDashboardViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  // Edit Brand Modal
  const [isEditingBrand, setIsEditingBrand] = useState(false);
  const [editBrandName, setEditBrandName] = useState(selfBrand.name);
  const [editBrandDomain, setEditBrandDomain] = useState(selfBrand.domain || '');
  const [editBrandAliases, setEditBrandAliases] = useState(selfBrand.aliases?.join(', ') || '');

  // Add Competitor Modal
  const [isAddingComp, setIsAddingComp] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompDomain, setNewCompDomain] = useState('');

  // Add Prompt Modal
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [newPromptText, setNewPromptText] = useState('');
  const [newPromptTopic, setNewPromptTopic] = useState('');

  // Edit Prompt Modal
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [editPromptText, setEditPromptText] = useState('');
  const [editPromptTopic, setEditPromptTopic] = useState('');

  // Suggest Prompts Modal
  const [isSuggestingPrompts, setIsSuggestingPrompts] = useState(false);
  const [suggestTopic, setSuggestTopic] = useState(selfBrand.name);
  const [suggestAudience, setSuggestAudience] = useState('modern teams');
  const [generatedSuggestions, setGeneratedSuggestions] = useState<
    Array<{ text: string; topic: string; selected: boolean }>
  >([]);

  // -------------------------------------------------------------
  // Brand Actions
  // -------------------------------------------------------------
  const handleSaveBrand = () => {
    if (!editBrandName.trim() || !editBrandDomain.trim()) {
      setActionError('Brand name and domain are required.');
      return;
    }
    setActionError(null);
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
        setActionError(res.error || 'Failed to update brand.');
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
      setActionError('Competitor name is required.');
      return;
    }
    setActionError(null);
    startTransition(async () => {
      const res = await addCompetitorAction({
        name: newCompName.trim(),
        domain: newCompDomain.trim() || undefined,
      });
      if (!res.success) {
        setActionError(res.error || 'Failed to add competitor.');
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
    setActionError(null);
    startTransition(async () => {
      const res = await removeBrandAction(comp.id);
      if (!res.success) {
        setActionError(res.error || 'Failed to remove competitor.');
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
      setActionError('Prompt query must be at least 5 characters long.');
      return;
    }
    setActionError(null);
    startTransition(async () => {
      const res = await addPromptAction({
        text: newPromptText.trim(),
        topic: newPromptTopic.trim() || undefined,
        locale: 'en',
      });
      if (!res.success) {
        setActionError(res.error || 'Failed to add prompt.');
      } else {
        setNewPromptText('');
        setNewPromptTopic('');
        setIsAddingPrompt(false);
        router.refresh();
      }
    });
  };

  const handleTogglePrompt = (prompt: Prompt) => {
    setActionError(null);
    startTransition(async () => {
      const res = await togglePromptActiveAction(prompt.id, !prompt.is_active);
      if (!res.success) {
        setActionError(res.error || 'Failed to update prompt status.');
      } else {
        router.refresh();
      }
    });
  };

  const handleSavePromptEdit = () => {
    if (!editingPrompt) return;
    if (!editPromptText.trim() || editPromptText.trim().length < 5) {
      setActionError('Prompt query must be at least 5 characters long.');
      return;
    }
    setActionError(null);
    startTransition(async () => {
      const res = await updatePromptAction(editingPrompt.id, {
        text: editPromptText.trim(),
        topic: editPromptTopic.trim() || undefined,
      });
      if (!res.success) {
        setActionError(res.error || 'Failed to update prompt.');
      } else {
        setEditingPrompt(null);
        router.refresh();
      }
    });
  };

  const handleDeletePrompt = (prompt: Prompt) => {
    if (!confirm(`Are you sure you want to delete prompt "${prompt.text}"?`)) return;
    setActionError(null);
    startTransition(async () => {
      const res = await deletePromptAction(prompt.id);
      if (!res.success) {
        setActionError(res.error || 'Failed to delete prompt.');
      } else {
        router.refresh();
      }
    });
  };

  // -------------------------------------------------------------
  // Prompt Template Generator Helper
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

    setActionError(null);
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
        setActionError(anyError);
      }
      setIsSuggestingPrompts(false);
      router.refresh();
    });
  };

  return (
    <div className="space-y-8">
      {/* Action Notification / Error */}
      {actionError && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* TOP ROW: BRAND CARD + VISIBILITY SCORE PLACEHOLDER */}
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

        {/* Visibility Score Placeholder Card (Phase 3 Prep) */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-zinc-950/80 backdrop-blur-xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-semibold">
              <Lock className="h-3 w-3" />
              <span>Coming in Next Build (Phase 3)</span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-white/[0.05] text-zinc-400 border border-white/10">
                <BarChart3 className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-white">AI Search Visibility Score</h3>
            </div>

            <p className="text-xs text-zinc-400 max-w-xl mb-6">
              Automated multi-engine audits will query ChatGPT, Perplexity, Google AI, and Gemini across your tracked prompts to calculate your brand mention frequency, ranking position, and sentiment compared to rivals.
            </p>

            {/* Mocked Disabled Metric Gauges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 opacity-40 select-none pointer-events-none">
              <div className="p-3.5 rounded-xl border border-white/[0.08] bg-black/40">
                <div className="text-[11px] text-zinc-400 font-medium">Brand Mention Rate</div>
                <div className="text-2xl font-bold text-zinc-300 mt-1">--%</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Across all models</div>
              </div>

              <div className="p-3.5 rounded-xl border border-white/[0.08] bg-black/40">
                <div className="text-[11px] text-zinc-400 font-medium">Share of Voice</div>
                <div className="text-2xl font-bold text-zinc-300 mt-1">--%</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">vs. {competitors.length} competitors</div>
              </div>

              <div className="p-3.5 rounded-xl border border-white/[0.08] bg-black/40">
                <div className="text-[11px] text-zinc-400 font-medium">Top 3 Citations</div>
                <div className="text-2xl font-bold text-zinc-300 mt-1">--</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Active sources cited</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-zinc-400" />
              <span>Engines ready: OpenAI • Perplexity • Google AI • Gemini</span>
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

      {/* BOTTOM SECTION: TRACKED PROMPTS */}
      <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/80 backdrop-blur-xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#8ce04a]/10 text-[#8ce04a] border border-[#8ce04a]/20">
              <Search className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Tracked Prompt Queries</h3>
              <p className="text-xs text-zinc-400">
                Natural search queries evaluated across AI models
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
          <div className="space-y-2">
            {prompts.map((prompt) => (
              <div
                key={prompt.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  prompt.is_active
                    ? 'border-white/[0.08] bg-black/40 hover:border-white/20'
                    : 'border-white/[0.04] bg-black/20 opacity-60'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3 truncate">
                  <button
                    type="button"
                    onClick={() => handleTogglePrompt(prompt)}
                    disabled={isPending}
                    className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
                      prompt.is_active
                        ? 'border-[#8ce04a]/30 bg-[#8ce04a]/10 text-[#8ce04a] hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400'
                        : 'border-white/10 bg-white/[0.04] text-zinc-500 hover:text-[#8ce04a]'
                    }`}
                    title={prompt.is_active ? 'Click to Pause prompt' : 'Click to Activate prompt'}
                  >
                    <Power className="h-3.5 w-3.5" />
                  </button>

                  <div className="truncate">
                    <span className="text-xs font-medium text-zinc-100">{prompt.text}</span>
                    <div className="flex items-center gap-2 mt-1">
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
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
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
            ))}
          </div>
        )}
      </div>

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
