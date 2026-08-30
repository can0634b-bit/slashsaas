'use client';

import React from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  Key, 
  Plus, 
  Zap
} from 'lucide-react';
import { IntegrationStatus } from '@/lib/types';

interface IntegrationsTabProps {
  integrations: IntegrationStatus[];
  onOpenConnectModal: (provider: 'Google Workspace' | 'Slack' | 'Microsoft 365' | 'Okta') => void;
  onDisconnect: (id: string) => void;
}

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({
  integrations,
  onOpenConnectModal,
  onDisconnect,
}) => {
  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-3xl border border-white/[0.08] bg-zinc-950 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Identity & Billing Integrations</h3>
          <p className="text-xs text-zinc-400">
            Connect your company Single Sign-On (SSO) and billing systems for real-time license tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20">
          <ShieldCheck className="h-4 w-4" />
          <span>SOC2 Type II Certified Pipeline</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {integrations.map((int) => {
          const isConnected = int.status === 'connected';

          return (
            <div
              key={int.id}
              className={`rounded-3xl border p-6 transition-all flex flex-col justify-between ${
                isConnected
                  ? 'border-white/20 bg-zinc-950 shadow-xl'
                  : 'border-white/[0.08] bg-zinc-950/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl font-bold text-xs ${
                      isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-zinc-400 border border-white/10'
                    }`}>
                      {int.name.substring(0, 2).toUpperCase()}
                    </div>
                    <h4 className="text-base font-bold text-white">{int.name}</h4>
                  </div>

                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                    isConnected
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-zinc-500'
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
                  <div className="mb-4 rounded-2xl bg-white/[0.03] p-3 text-xs text-zinc-300 flex items-center justify-between border border-white/[0.06]">
                    <span>Active Indexed Accounts:</span>
                    <strong className="text-emerald-400">{int.accountsFound} accounts</strong>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">
                  {isConnected ? `Sync: ${int.lastSyncAt}` : '60-second connection'}
                </span>

                {isConnected ? (
                  <button
                    onClick={() => onDisconnect(int.id)}
                    className="rounded-xl bg-white/5 hover:bg-rose-500/10 px-3.5 py-1.5 text-xs font-semibold text-zinc-400 hover:text-rose-400 border border-white/10 transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenConnectModal(int.name as any)}
                    className="rounded-xl bg-white hover:bg-zinc-200 px-3.5 py-1.5 text-xs font-bold text-zinc-950 shadow-md active:scale-95 transition-all"
                  >
                    Connect {int.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
