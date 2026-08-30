'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  Key, 
  Plus, 
  AlertCircle,
  Check
} from 'lucide-react';
import { IntegrationStatus } from '@/lib/types';
import { MOCK_INTEGRATIONS } from '@/lib/mockData';

export const IntegrationsTab: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>(MOCK_INTEGRATIONS);
  const [toast, setToast] = useState<string | null>(null);

  const handleToggleConnect = (id: string) => {
    setIntegrations(prev => prev.map(int => {
      if (int.id === id) {
        const nextStatus = int.status === 'connected' ? 'disconnected' : 'connected';
        setToast(`${int.name} is now ${nextStatus.toUpperCase()}`);
        setTimeout(() => setToast(null), 3000);
        return {
          ...int,
          status: nextStatus,
          lastSyncAt: nextStatus === 'connected' ? 'Just now' : undefined,
          accountsFound: nextStatus === 'connected' ? 64 : undefined,
        };
      }
      return int;
    }));
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Identity & Billing Integrations</h3>
          <p className="text-xs text-zinc-400">
            Connect your Single Sign-On (SSO) and accounting systems for real-time license tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
          <ShieldCheck className="h-4 w-4" />
          <span>SOC2 Type II Certified Pipeline</span>
        </div>
      </div>

      {toast && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {integrations.map((int) => {
          const isConnected = int.status === 'connected';

          return (
            <div
              key={int.id}
              className={`rounded-2xl border p-5 sm:p-6 transition-all flex flex-col justify-between ${
                isConnected
                  ? 'border-zinc-800 bg-zinc-950 shadow-md'
                  : 'border-zinc-850 bg-zinc-950/40 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold text-xs ${
                      isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-900 text-zinc-500'
                    }`}>
                      {int.name.substring(0, 2).toUpperCase()}
                    </div>
                    <h4 className="text-base font-bold text-white">{int.name}</h4>
                  </div>

                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                    isConnected
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                  }`}>
                    {isConnected ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" /> Connected
                      </>
                    ) : (
                      'Disconnected'
                    )}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  {int.description}
                </p>

                {isConnected && int.accountsFound && (
                  <div className="mb-4 rounded-xl bg-zinc-900/70 p-3 text-xs text-zinc-300 flex items-center justify-between border border-zinc-800">
                    <span>Active Indexed Accounts:</span>
                    <strong className="text-emerald-400">{int.accountsFound} accounts</strong>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-zinc-850 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">
                  {isConnected ? `Sync: ${int.lastSyncAt}` : 'Setup in 2 mins'}
                </span>

                <button
                  onClick={() => handleToggleConnect(int.id)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    isConnected
                      ? 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
                  }`}
                >
                  {isConnected ? 'Disconnect' : 'Connect Integration'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
