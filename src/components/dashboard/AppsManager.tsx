'use client';

import React, { useState } from 'react';
import { DetectedApp } from '@/lib/types/dashboard';
import { deleteDetectedApp } from '@/lib/actions/dashboard';
import { Layers, Plus, Trash2, Edit2, Calendar, Sparkles } from 'lucide-react';

interface AppsManagerProps {
  apps: DetectedApp[];
  onOpenAddApp: () => void;
  onEditApp: (app: DetectedApp) => void;
}

export const AppsManager: React.FC<AppsManagerProps> = ({
  apps,
  onOpenAddApp,
  onEditApp,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (appId: string) => {
    if (!confirm('Are you sure you want to remove this tool from your catalog?')) return;
    setDeletingId(appId);
    try {
      await deleteDetectedApp(appId);
    } catch (err) {
      alert('Failed to delete tool');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-zinc-950 p-6 sm:p-8 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="h-4 w-4 text-amber-400" />
            <span>Monitored SaaS & AI Subscriptions</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Active vendor licenses tracked for your organization.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddApp}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Tool / SaaS</span>
        </button>
      </div>

      {apps.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-zinc-400">
            <Layers className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-white">No Monitored Tools Configured</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Add tools like Figma, Notion, ChatGPT Team, or Copilot to track seat costs and eliminate dormant licenses.
          </p>
          <button
            type="button"
            onClick={onOpenAddApp}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add First Tool</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app) => (
            <div
              key={app.id}
              className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-5 flex flex-col justify-between hover:border-white/20 transition-all shadow-sm relative group"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-bold text-white text-sm">{app.app_name}</span>
                  <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] uppercase font-mono text-zinc-300">
                    {app.category}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-zinc-400 mb-4">
                  <p>
                    Cost:{' '}
                    <strong className="text-white">${app.monthly_seat_cost} / seat / mo</strong>
                  </p>
                  <p>
                    Cycle:{' '}
                    <span className="text-zinc-300 capitalize">{app.billing_cycle}</span> •{' '}
                    {app.seats_total} total seats
                  </p>
                  {app.renewal_date && (
                    <p className="text-[#a3e635] flex items-center gap-1 text-[11px] pt-1">
                      <Calendar className="h-3 w-3" />
                      <span>Renews: {app.renewal_date}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => onEditApp(app)}
                  className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors text-xs flex items-center gap-1"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(app.id)}
                  disabled={deletingId === app.id}
                  className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors text-xs flex items-center gap-1 disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
