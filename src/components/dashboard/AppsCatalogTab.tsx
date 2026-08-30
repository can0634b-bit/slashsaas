'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Layers, 
  ExternalLink, 
  Edit3, 
  Check, 
  AlertTriangle,
  TrendingDown,
  ShieldCheck
} from 'lucide-react';
import { SaaSApp } from '@/lib/types';
import { formatUSD } from '@/lib/utils';

interface AppsCatalogTabProps {
  apps: SaaSApp[];
  onUpdateAppPrice: (appId: string, newCost: number) => void;
}

export const AppsCatalogTab: React.FC<AppsCatalogTabProps> = ({ apps, onUpdateAppPrice }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempCost, setTempCost] = useState<number>(0);

  const handleStartEdit = (app: SaaSApp) => {
    setEditingId(app.id);
    setTempCost(app.costPerSeatMonthly);
  };

  const handleSaveEdit = (appId: string) => {
    onUpdateAppPrice(appId, tempCost);
    setEditingId(null);
  };

  if (apps.length === 0) {
    return (
      <div className="py-16 text-center max-w-xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-zinc-950 p-8 sm:p-12 shadow-2xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-zinc-950 font-black">
            /S
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Subscriptions Discovered</h3>
          <p className="text-xs sm:text-sm text-zinc-400">
            Connect your company Single Sign-On (Google Workspace or Slack) to populate your SaaS subscription catalog.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-3xl border border-white/[0.08] bg-zinc-950 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Discovered SaaS Subscriptions</h3>
          <p className="text-xs text-zinc-400">
            Detected via OAuth 2.0 and SAML application registries.
          </p>
        </div>

        <button
          onClick={() => alert('Custom SaaS tool addition modal')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/[0.08] hover:text-white transition-colors"
        >
          <Plus className="h-4 w-4 text-emerald-400" />
          <span>Add Custom SaaS Tool</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {apps.map((app) => {
          const wastePercent = Math.round((app.zombieSeats / app.totalSeats) * 100);
          const isEditing = editingId === app.id;

          return (
            <div
              key={app.id}
              className="rounded-3xl border border-white/[0.08] bg-zinc-950 p-6 flex flex-col justify-between hover:border-white/20 transition-all group shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      {app.category}
                    </span>
                  </div>

                  <a
                    href={app.appUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-600 hover:text-zinc-300 transition-colors p-1"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                <h4 className="text-base font-bold text-white mb-1">{app.name}</h4>

                {/* Price per seat with inline edit */}
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4 pb-3 border-b border-white/[0.06]">
                  <span>Seat Cost:</span>
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <span className="text-white">$</span>
                      <input
                        type="number"
                        value={tempCost}
                        onChange={(e) => setTempCost(Number(e.target.value))}
                        className="w-16 rounded-lg bg-zinc-900 px-2 py-0.5 text-xs text-white border border-white/30 focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveEdit(app.id)}
                        className="rounded-lg bg-white p-1 text-zinc-950 hover:bg-zinc-200"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <span>${app.costPerSeatMonthly}/mo</span>
                      <button
                        onClick={() => handleStartEdit(app)}
                        className="text-zinc-500 hover:text-emerald-400 transition-colors"
                        title="Edit Seat Price"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Seats Stats Bar */}
                <div className="space-y-1.5 mb-4 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Seats: <strong className="text-zinc-200">{app.activeSeats} Active</strong> / {app.totalSeats} Total</span>
                    <span className="text-rose-400 font-bold">{app.zombieSeats} Zombie ({wastePercent}%)</span>
                  </div>

                  <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full rounded-l-full"
                      style={{ width: `${100 - wastePercent}%` }}
                    />
                    <div
                      className="bg-rose-500 h-full rounded-r-full"
                      style={{ width: `${wastePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Summary */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Monthly Bleed</span>
                  <span className="font-bold text-rose-400">${app.monthlyWaste}/mo</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Annual Bleed</span>
                  <span className="font-extrabold text-white">{formatUSD(app.annualWaste)}/yr</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
