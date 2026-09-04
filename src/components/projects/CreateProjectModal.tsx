'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Globe, Sparkles, Building, Search, ArrowRight, AlertCircle } from 'lucide-react';
import { createProject } from '@/lib/actions/projects';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();

  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [brandDomain, setBrandDomain] = useState('');
  const [initialQueries, setInitialQueries] = useState('');
  const [initialCompetitors, setInitialCompetitors] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !brandName.trim() || !brandDomain.trim()) {
      setError('Project name, brand name, and domain are required.');
      return;
    }

    setLoading(true);

    try {
      const queriesList = initialQueries
        .split('\n')
        .map((q) => q.trim())
        .filter((q) => q.length > 0);

      const competitorsList = initialCompetitors
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      const res = await createProject({
        name: name.trim(),
        brandName: brandName.trim(),
        brandDomain: brandDomain.trim(),
        initialQueries: queriesList,
        initialCompetitors: competitorsList,
      });

      if (res.success && res.projectId) {
        onClose();
        router.push(`/app/projects/${res.projectId}`);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-6 sm:p-8 shadow-2xl shadow-black/90">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8ce04a]/15 text-[#8ce04a] border border-[#8ce04a]/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Create AI Visibility Monitor</h3>
            <p className="text-xs text-zinc-400">Track your brand in Google Gemini & AI search answers</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-zinc-300 mb-1" htmlFor="p-name">
              Project Name <span className="text-[#8ce04a]">*</span>
            </label>
            <input
              id="p-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. SlashSaaS Global Visibility"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1" htmlFor="p-brand">
                Brand Name <span className="text-[#8ce04a]">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input
                  id="p-brand"
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="SlashSaaS"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1" htmlFor="p-domain">
                Brand Domain <span className="text-[#8ce04a]">*</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input
                  id="p-domain"
                  type="text"
                  required
                  value={brandDomain}
                  onChange={(e) => setBrandDomain(e.target.value)}
                  placeholder="slashsaas.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1" htmlFor="p-queries">
              Initial Search Prompts <span className="text-zinc-500">(1 per line)</span>
            </label>
            <textarea
              id="p-queries"
              rows={3}
              value={initialQueries}
              onChange={(e) => setInitialQueries(e.target.value)}
              placeholder={`best AI search visibility tools
top generative engine optimization software
how to track brand in Gemini`}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1" htmlFor="p-competitors">
              Competitor Brands <span className="text-zinc-500">(comma separated)</span>
            </label>
            <input
              id="p-competitors"
              type="text"
              value={initialCompetitors}
              onChange={(e) => setInitialCompetitors(e.target.value)}
              placeholder="e.g. Otterly.AI, Profet.ai, Truenorth"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span>Creating Project...</span>
              ) : (
                <>
                  <span>Create & Open Project</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
