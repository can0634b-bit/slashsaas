'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, ArrowRight, Zap, CheckCircle2, Building2, Users } from 'lucide-react';
import { ScanSummary } from '@/lib/types';
import { generateCustomScan } from '@/lib/scanEngine';

interface ConnectWorkspaceModalProps {
  isOpen: boolean;
  provider: 'Google Workspace' | 'Slack' | 'Microsoft 365' | 'Okta' | null;
  onClose: () => void;
  onConnected: (scan: ScanSummary, providerName: string) => void;
}

export const ConnectWorkspaceModal: React.FC<ConnectWorkspaceModalProps> = ({
  isOpen,
  provider,
  onClose,
  onConnected,
}) => {
  const [orgName, setOrgName] = useState('');
  const [memberCount, setMemberCount] = useState(45);
  const [adminEmail, setAdminEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !provider) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: orgName || 'My Organization',
          employeeCount: memberCount,
          provider: provider.toLowerCase(),
        }),
      });
      const scanData = await res.json();

      setTimeout(() => {
        setLoading(false);
        onConnected(scanData, provider);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-6 sm:p-8 shadow-2xl shadow-black/90">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-950 font-black text-sm">
            /S
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Connect {provider}
            </h3>
            <p className="text-xs text-zinc-400">Read-Only OAuth 2.0 Identity Connection</p>
          </div>
        </div>

        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Organization / Domain Name</label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Acme Corporation"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Workspace Admin Email</label>
            <input
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@yourcompany.com"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 text-xs">
              <label className="font-medium text-zinc-300 flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-zinc-500" />
                <span>Active Team Members:</span>
              </label>
              <strong className="text-white font-bold">{memberCount} Employees</strong>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={memberCount}
              onChange={(e) => setMemberCount(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-black/40 p-3 text-[11px] text-zinc-400 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>100% Read-Only:</strong> SlashSaaS only requests access to user login timestamps. No messages, documents, or passwords are accessed.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-xs sm:text-sm font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.99]"
          >
            {loading ? (
              <span>Auditing {provider}...</span>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5 fill-zinc-950" />
                <span>Authorize & Run Live Audit</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
