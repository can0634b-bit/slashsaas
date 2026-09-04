'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Trash2, HelpCircle, Sparkles, Loader2 } from 'lucide-react';
import { addTrackedQuery, deleteTrackedQuery } from '@/lib/actions/projects';

interface QueryManagerProps {
  projectId: string;
  queries: Array<{
    id: string;
    query_text: string;
    created_at: string;
  }>;
}

export const QueryManager: React.FC<QueryManagerProps> = ({ projectId, queries }) => {
  const router = useRouter();
  const [newQuery, setNewQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuery.trim()) return;

    setAdding(true);
    setError(null);

    try {
      await addTrackedQuery({
        projectId,
        queryText: newQuery.trim(),
      });
      setNewQuery('');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to add query');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (queryId: string) => {
    setDeletingId(queryId);
    setError(null);

    try {
      await deleteTrackedQuery(queryId, projectId);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete query');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-6 backdrop-blur-xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] text-white">
            <Search className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Tracked Search Prompts</h3>
            <p className="text-[11px] text-zinc-400">Queries simulated across AI search engines</p>
          </div>
        </div>
        <span className="rounded-full bg-white/[0.05] border border-white/10 px-2.5 py-0.5 text-[11px] font-mono text-zinc-300">
          {queries.length} active
        </span>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Add query form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={newQuery}
            onChange={(e) => setNewQuery(e.target.value)}
            placeholder="e.g. best customer feedback tool for SaaS"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-3.5 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={adding || !newQuery.trim()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors disabled:opacity-40"
        >
          {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          <span>Add</span>
        </button>
      </form>

      {/* Queries list */}
      <div className="space-y-2">
        {queries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs text-zinc-500">
            No queries added yet. Add a query above to start tracking.
          </div>
        ) : (
          queries.map((q) => (
            <div
              key={q.id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs hover:border-white/10 transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className="text-zinc-600 font-mono text-[10px] select-none">"</span>
                <span className="text-zinc-200 font-medium truncate">{q.query_text}</span>
                <span className="text-zinc-600 font-mono text-[10px] select-none">"</span>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(q.id)}
                disabled={deletingId === q.id}
                title="Delete query"
                className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 p-1 rounded-lg transition-all"
              >
                {deletingId === q.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-400" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
