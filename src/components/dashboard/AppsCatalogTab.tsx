'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Layers, 
  ExternalLink, 
  Edit3, 
  Save, 
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

  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Discovered SaaS Subscriptions</h3>
          <p className="text-xs text-zinc-400">
            Detected via Google Workspace OAuth and SAML application registry.
          </p>
        </div>

        <button
          onClick={() => alert('Custom SaaS manual entry added to catalog')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-850 hover:text-white transition-colors"
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
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 flex flex-col justify-between hover:border-zinc-700 transition-all group shadow-md"
            >
              <div>
                {/* Top Title & Category */}
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
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4 pb-3 border-b border-zinc-850">
                  <span>Seat Cost:</span>
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <span className="text-white">$</span>
                      <input
                        type="number"
                        value={tempCost}
                        onChange={(e) => setTempCost(Number(e.target.value))}
                        className="w-16 rounded bg-zinc-900 px-2 py-0.5 text-xs text-white border border-emerald-500 focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveEdit(app.id)}
                        className="rounded bg-emerald-500 p-1 text-zinc-950 hover:bg-emerald-400"
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

                  <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden flex">
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

              {/* Bottom Bleed Summary */}
              <div className="pt-3 border-t border-zinc-850 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Monthly Leakage</span>
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
