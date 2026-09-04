'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, X, Loader2 } from 'lucide-react';
import { addCompetitor, deleteCompetitor } from '@/lib/actions/projects';

interface CompetitorManagerProps {
  projectId: string;
  competitors: Array<{
    id: string;
    name: string;
    created_at: string;
  }>;
}

export const CompetitorManager: React.FC<CompetitorManagerProps> = ({ projectId, competitors }) => {
  const router = useRouter();
  const [newCompetitor, setNewCompetitor] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompetitor.trim()) return;

    setAdding(true);
    setError(null);

    try {
      await addCompetitor({
        projectId,
        name: newCompetitor.trim(),
      });
      setNewCompetitor('');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to add competitor');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (compID: string) => {
    setDeletingId(compID);
    setError(null);

    try {
      await deleteCompetitor(compID, projectId);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete competitor');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-6 backdrop-blur-xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] text-white">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Competitor Benchmark</h3>
            <p className="text-[11px] text-zinc-400">Track competitors cited by AI answers</p>
          </div>
        </div>
        <span className="rounded-full bg-white/[0.05] border border-white/10 px-2.5 py-0.5 text-[11px] font-mono text-zinc-300">
          {competitors.length} tracked
        </span>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newCompetitor}
          onChange={(e) => setNewCompetitor(e.target.value)}
          placeholder="e.g. CompetitorBrand"
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={adding || !newCompetitor.trim()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors disabled:opacity-40"
        >
          {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          <span>Add</span>
        </button>
      </form>

      {/* Competitor Chips */}
      <div className="flex flex-wrap gap-2">
        {competitors.length === 0 ? (
          <div className="w-full rounded-2xl border border-dashed border-white/10 p-4 text-center text-xs text-zinc-500">
            No competitors added. Add competitors to track share of voice against them.
          </div>
        ) : (
          competitors.map((c) => (
            <div
              key={c.id}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] pl-3 pr-1.5 py-1 text-xs text-zinc-200 hover:border-white/20 transition-colors group"
            >
              <span className="font-medium">{c.name}</span>
              <button
                type="button"
                onClick={() => handleDelete(c.id)}
                disabled={deletingId === c.id}
                title="Remove competitor"
                className="text-zinc-500 hover:text-rose-400 p-1 rounded-md transition-colors"
              >
                {deletingId === c.id ? (
                  <Loader2 className="h-3 w-3 animate-spin text-rose-400" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
