'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Building2,
  Swords,
  Search,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Globe,
  Tag,
  Check,
} from 'lucide-react';
import { completeOnboardingAction } from '@/lib/actions/geo';

interface OnboardingWizardProps {
  orgId: string;
  orgName: string;
}

interface CompetitorItem {
  id: string;
  name: string;
  domain: string;
}

interface PromptItem {
  id: string;
  text: string;
  topic: string;
}

export function OnboardingWizard({ orgId, orgName }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isPending, startTransition] = useTransition();
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Step 1: Self Brand State
  const [brandName, setBrandName] = useState('');
  const [brandDomain, setBrandDomain] = useState('');
  const [brandAliases, setBrandAliases] = useState('');
  const [step1Errors, setStep1Errors] = useState<{ name?: string; domain?: string }>({});

  // Step 2: Competitors State
  const [competitors, setCompetitors] = useState<CompetitorItem[]>([]);
  const [newCompName, setNewCompName] = useState('');
  const [newCompDomain, setNewCompDomain] = useState('');
  const [compInputError, setCompInputError] = useState<string | null>(null);

  // Step 3: Prompts State
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [newPromptText, setNewPromptText] = useState('');
  const [newPromptTopic, setNewPromptTopic] = useState('');
  const [promptInputError, setPromptInputError] = useState<string | null>(null);

  // Prompt Generator Helper State
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatorTopic, setGeneratorTopic] = useState('');
  const [generatorAudience, setGeneratorAudience] = useState('startups');
  const [generatedSuggestions, setGeneratedSuggestions] = useState<
    Array<{ text: string; topic: string; selected: boolean }>
  >([]);

  // -------------------------------------------------------------
  // Step 1 Handlers
  // -------------------------------------------------------------
  const handleValidateStep1 = () => {
    const errors: { name?: string; domain?: string } = {};
    if (!brandName.trim()) {
      errors.name = 'Brand name is required';
    }
    if (!brandDomain.trim()) {
      errors.domain = 'Domain is required (e.g. acme.com)';
    } else if (brandDomain.includes(' ')) {
      errors.domain = 'Domain cannot contain spaces';
    }

    setStep1Errors(errors);
    if (Object.keys(errors).length === 0) {
      if (!generatorTopic) {
        // Pre-fill prompt generator topic
        setGeneratorTopic(brandName.trim());
      }
      setStep(2);
    }
  };

  // -------------------------------------------------------------
  // Step 2 Handlers
  // -------------------------------------------------------------
  const handleAddCompetitor = () => {
    const trimmed = newCompName.trim();
    if (!trimmed) {
      setCompInputError('Competitor brand name is required');
      return;
    }

    if (competitors.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setCompInputError('This competitor is already in your list');
      return;
    }

    if (competitors.length >= 10) {
      setCompInputError('Maximum 10 competitors allowed during onboarding');
      return;
    }

    setCompetitors((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: trimmed,
        domain: newCompDomain.trim(),
      },
    ]);

    setNewCompName('');
    setNewCompDomain('');
    setCompInputError(null);
  };

  const handleRemoveCompetitor = (id: string) => {
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
  };

  const handleValidateStep2 = () => {
    if (competitors.length === 0) {
      setCompInputError('Please add at least 1 competitor brand to benchmark against.');
      return;
    }
    setStep(3);
  };

  // -------------------------------------------------------------
  // Step 3 Handlers (Prompts & Generator)
  // -------------------------------------------------------------
  const handleAddPrompt = () => {
    const trimmed = newPromptText.trim();
    if (!trimmed || trimmed.length < 5) {
      setPromptInputError('Prompt query must be at least 5 characters long');
      return;
    }

    if (prompts.some((p) => p.text.toLowerCase() === trimmed.toLowerCase())) {
      setPromptInputError('This prompt query is already added');
      return;
    }

    if (prompts.length >= 25) {
      setPromptInputError('Maximum 25 prompts allowed');
      return;
    }

    setPrompts((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        text: trimmed,
        topic: newPromptTopic.trim() || 'General',
      },
    ]);

    setNewPromptText('');
    setNewPromptTopic('');
    setPromptInputError(null);
  };

  const handleRemovePrompt = (id: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
  };

  const generatePromptTemplates = () => {
    const topic = generatorTopic.trim() || brandName.trim() || 'software';
    const audience = generatorAudience.trim() || 'teams';
    const brand = brandName.trim() || 'our brand';
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
        text: `Is ${brand} good for ${topic}?`,
        topic: 'Brand Evaluation',
      },
      {
        text: `${brand} vs ${topComp} comparison`,
        topic: 'Head to Head',
      },
      {
        text: `What is the easiest ${topic} tool for ${audience}?`,
        topic: 'Usability',
      },
      {
        text: `Affordable ${topic} platforms with great customer support`,
        topic: 'Value',
      },
      {
        text: `How does ${brand} compare to other ${topic} tools?`,
        topic: 'Market Comparison',
      },
    ];

    setGeneratedSuggestions(
      templates.map((t) => ({
        ...t,
        selected: !prompts.some((p) => p.text.toLowerCase() === t.text.toLowerCase()),
      }))
    );
  };

  const handleAcceptGeneratedPrompts = () => {
    const selectedToAdd = generatedSuggestions
      .filter((s) => s.selected)
      .filter((s) => !prompts.some((p) => p.text.toLowerCase() === s.text.toLowerCase()));

    setPrompts((prev) => [
      ...prev,
      ...selectedToAdd.map((s) => ({
        id: Math.random().toString(36).substring(2, 9),
        text: s.text,
        topic: s.topic,
      })),
    ]);

    setShowGenerator(false);
  };

  // -------------------------------------------------------------
  // Final Submission
  // -------------------------------------------------------------
  const handleSubmitOnboarding = () => {
    if (prompts.length === 0) {
      setPromptInputError('Please add at least 1 prompt query to track.');
      return;
    }

    setGeneralError(null);
    startTransition(async () => {
      const aliasList = brandAliases
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a.length > 0);

      const res = await completeOnboardingAction({
        selfBrand: {
          name: brandName.trim(),
          domain: brandDomain.trim(),
          aliases: aliasList,
        },
        competitors: competitors.map((c) => ({
          name: c.name,
          domain: c.domain || undefined,
        })),
        prompts: prompts.map((p) => ({
          text: p.text,
          topic: p.topic,
          locale: 'en',
        })),
      });

      if (!res.success) {
        setGeneralError(res.error || 'Failed to complete onboarding');
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#8ce04a]/30 bg-[#8ce04a]/10 text-xs font-semibold text-[#8ce04a] mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Search Visibility (GEO) Setup</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Monitor How AI Assistants Answer About Your Brand
        </h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-xl mx-auto">
          Configure your brand, key competitors, and customer prompt queries. We&apos;ll monitor recommendations across ChatGPT, Perplexity, Google AI, and Gemini.
        </p>
      </div>

      {/* Progress Steps Bar */}
      <div className="mb-8 grid grid-cols-3 gap-2">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${
            step >= 1 ? 'bg-[#8ce04a]' : 'bg-white/10'
          }`}
        />
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${
            step >= 2 ? 'bg-[#8ce04a]' : 'bg-white/10'
          }`}
        />
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${
            step >= 3 ? 'bg-[#8ce04a]' : 'bg-white/10'
          }`}
        />
      </div>

      {generalError && (
        <div className="mb-6 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* STEP CONTAINER */}
      <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        {/* ========================================================= */}
        {/* STEP 1: YOUR BRAND */}
        {/* ========================================================= */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-white/[0.08] pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#8ce04a]/10 text-[#8ce04a] border border-[#8ce04a]/20">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Step 1 of 3: Your Brand</h2>
                    <p className="text-xs text-zinc-400">The primary brand and domain to track in AI answers</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-zinc-500">Step 1/3</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Brand Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Cloud or SlashSaaS"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-black/50 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 transition-all ${
                    step1Errors.name
                      ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30'
                      : 'border-white/10 focus:border-[#8ce04a] focus:ring-[#8ce04a]/30'
                  }`}
                />
                {step1Errors.name && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {step1Errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Primary Domain <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="acme.com"
                    value={brandDomain}
                    onChange={(e) => setBrandDomain(e.target.value)}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-black/50 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 transition-all ${
                      step1Errors.domain
                        ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30'
                        : 'border-white/10 focus:border-[#8ce04a] focus:ring-[#8ce04a]/30'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Used to detect link citations and source mentions in AI responses.
                </p>
                {step1Errors.domain && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {step1Errors.domain}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Alternate Aliases / Spelling Variants{' '}
                  <span className="text-zinc-500">(Optional, comma-separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. AcmeApp, Acme Software, Acme Cloud Platform"
                  value={brandAliases}
                  onChange={(e) => setBrandAliases(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/50 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#8ce04a] focus:ring-1 focus:ring-[#8ce04a]/30 transition-all"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Helps detect variations when AI engines misspell or abbreviate your brand name.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex justify-end">
              <button
                type="button"
                onClick={handleValidateStep1}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8ce04a] text-black font-semibold text-xs hover:bg-[#9ee862] transition-colors"
              >
                <span>Continue to Competitors</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: COMPETITORS */}
        {/* ========================================================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="border-b border-white/[0.08] pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#8ce04a]/10 text-[#8ce04a] border border-[#8ce04a]/20">
                    <Swords className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Step 2 of 3: Competitors</h2>
                    <p className="text-xs text-zinc-400">Add 3 to 5 rival brands to benchmark your visibility against</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-zinc-500">Step 2/3</span>
              </div>
            </div>

            {/* Input Row */}
            <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Competitor Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Asana, Linear, Monday"
                    value={newCompName}
                    onChange={(e) => setNewCompName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCompetitor();
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/60 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#8ce04a]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Domain <span className="text-zinc-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. linear.app"
                    value={newCompDomain}
                    onChange={(e) => setNewCompDomain(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCompetitor();
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/60 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#8ce04a]"
                  />
                </div>
              </div>

              {compInputError && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {compInputError}
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddCompetitor}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-zinc-200 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 text-[#8ce04a]" />
                  <span>Add Competitor</span>
                </button>
              </div>
            </div>

            {/* List of Added Competitors */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Tracked Competitors ({competitors.length}/10)</span>
                <span className="text-[11px] text-zinc-500">3–5 recommended</span>
              </div>

              {competitors.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-white/10 text-center text-xs text-zinc-500">
                  No competitors added yet. Add at least one competitor to proceed.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {competitors.map((comp) => (
                    <div
                      key={comp.id}
                      className="p-3 rounded-xl border border-white/[0.08] bg-black/40 flex items-center justify-between group"
                    >
                      <div className="truncate">
                        <div className="text-xs font-medium text-zinc-200 truncate">{comp.name}</div>
                        {comp.domain ? (
                          <div className="text-[10px] text-zinc-500 truncate">{comp.domain}</div>
                        ) : (
                          <div className="text-[10px] text-zinc-600 italic">No domain provided</div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCompetitor(comp.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1 rounded transition-colors"
                        title="Remove competitor"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleValidateStep2}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8ce04a] text-black font-semibold text-xs hover:bg-[#9ee862] transition-colors"
              >
                <span>Continue to Prompts</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: PROMPTS TO TRACK */}
        {/* ========================================================= */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="border-b border-white/[0.08] pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#8ce04a]/10 text-[#8ce04a] border border-[#8ce04a]/20">
                    <Search className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Step 3 of 3: Prompts to Track</h2>
                    <p className="text-xs text-zinc-400">
                      Add 5 to 10 natural queries potential buyers ask AI assistants
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-zinc-500">Step 3/3</span>
              </div>
            </div>

            {/* Helper Bar with Suggest Prompts Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-[#8ce04a]/20 bg-[#8ce04a]/[0.05]">
              <div className="text-xs text-zinc-300">
                <span className="font-semibold text-white">Need inspiration?</span> Use our starter template generator to create industry benchmark queries.
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowGenerator(!showGenerator);
                  if (!showGenerator) {
                    generatePromptTemplates();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8ce04a] text-black font-semibold text-xs hover:bg-[#9ee862] shrink-0 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{showGenerator ? 'Close Generator' : 'Suggest Prompts'}</span>
              </button>
            </div>

            {/* Template Suggestion Helper Modal / Panel */}
            {showGenerator && (
              <div className="p-5 rounded-xl border border-white/10 bg-zinc-900/90 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-zinc-200">
                    Prompt Idea Generator (Client-Side Templates)
                  </div>
                  <button
                    type="button"
                    onClick={generatePromptTemplates}
                    className="text-[11px] text-[#8ce04a] hover:underline"
                  >
                    Refresh Templates
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Topic / Category</label>
                    <input
                      type="text"
                      placeholder="e.g. CRM, project management, developer API"
                      value={generatorTopic}
                      onChange={(e) => setGeneratorTopic(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-white/10 bg-black/60 text-xs text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Target Audience / Persona</label>
                    <input
                      type="text"
                      placeholder="e.g. startups, enterprise, freelance designers"
                      value={generatorAudience}
                      onChange={(e) => setGeneratorAudience(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-white/10 bg-black/60 text-xs text-zinc-100"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                  <div className="text-[11px] text-zinc-400">Select templates to include:</div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
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
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGenerator(false)}
                    className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptGeneratedPrompts}
                    className="px-4 py-1.5 rounded-lg bg-[#8ce04a] text-black font-semibold text-xs hover:bg-[#9ee862]"
                  >
                    Add Selected to Prompts
                  </button>
                </div>
              </div>
            )}

            {/* Custom Prompt Input */}
            <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Custom Prompt Query <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Best database migration tools for Next.js"
                    value={newPromptText}
                    onChange={(e) => setNewPromptText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPrompt();
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/60 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#8ce04a]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Topic Label <span className="text-zinc-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Developer Tools"
                    value={newPromptTopic}
                    onChange={(e) => setNewPromptTopic(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPrompt();
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/60 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#8ce04a]"
                  />
                </div>
              </div>

              {promptInputError && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {promptInputError}
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddPrompt}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-zinc-200 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 text-[#8ce04a]" />
                  <span>Add Query</span>
                </button>
              </div>
            </div>

            {/* List of Added Prompts */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Tracked Queries ({prompts.length}/25)</span>
                <span className="text-[11px] text-zinc-500">5–10 recommended</span>
              </div>

              {prompts.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-white/10 text-center text-xs text-zinc-500">
                  No prompts added yet. Add at least one prompt query or use the generator above.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {prompts.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl border border-white/[0.08] bg-black/40 flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Search className="h-3.5 w-3.5 text-[#8ce04a] shrink-0" />
                        <span className="text-xs text-zinc-200 truncate">{p.text}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.06] text-zinc-400 border border-white/[0.04] shrink-0">
                          {p.topic}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePrompt(p.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1 rounded transition-colors shrink-0"
                        title="Remove prompt"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 text-xs font-medium text-zinc-400 hover:text-white disabled:opacity-50 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitOnboarding}
                disabled={isPending || prompts.length === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#8ce04a] text-black font-semibold text-xs hover:bg-[#9ee862] disabled:opacity-50 transition-colors shadow-lg shadow-[#8ce04a]/10"
              >
                {isPending ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Configuring Workspace...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Complete Setup & Launch Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
