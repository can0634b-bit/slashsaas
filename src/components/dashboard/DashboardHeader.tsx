'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Ghost, 
  RefreshCw, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft,
  Building2,
  Share2,
  Check
} from 'lucide-react';
import { ScanSummary } from '@/lib/types';

interface DashboardHeaderProps {
  scanData: ScanSummary;
  onOpenScanModal: () => void;
  onExportCsv: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  scanData,
  onOpenScanModal,
  onExportCsv,
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Company Info */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-zinc-950 shadow-md hover:scale-105 transition-transform"
              title="Return to Home"
            >
              <Ghost className="h-5 w-5" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  {scanData.organizationName}
                </h1>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  {scanData.totalEmployees} Members
                </span>
                <span className="hidden sm:inline-flex rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 border border-zinc-700">
                  Live Audit
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 flex items-center gap-2">
                <span>{scanData.totalAppsDiscovered} Connected Apps</span>
                <span>•</span>
                <span className="text-zinc-500">Last Synced: Just now</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-zinc-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onOpenScanModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
              <span>Re-Scan Org</span>
            </button>

            <a
              href="#pricing"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Upgrade to Pro</span>
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 mt-4 -mb-3.5 overflow-x-auto pb-1 text-xs font-medium text-zinc-400 border-t border-zinc-850 pt-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-t-lg transition-colors border-b-2 font-semibold ${
              activeTab === 'overview'
                ? 'text-emerald-400 border-emerald-500 bg-emerald-500/5'
                : 'border-transparent hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            Executive Overview
          </button>

          <button
            onClick={() => setActiveTab('zombies')}
            className={`px-3 py-2 rounded-t-lg transition-colors border-b-2 font-semibold flex items-center gap-1.5 ${
              activeTab === 'zombies'
                ? 'text-emerald-400 border-emerald-500 bg-emerald-500/5'
                : 'border-transparent hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            <span>Zombie Seats</span>
            <span className="rounded-full bg-rose-500/20 text-rose-300 px-1.5 py-0.2 text-[10px] font-bold">
              {scanData.zombieSeatCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('apps')}
            className={`px-3 py-2 rounded-t-lg transition-colors border-b-2 font-semibold ${
              activeTab === 'apps'
                ? 'text-emerald-400 border-emerald-500 bg-emerald-500/5'
                : 'border-transparent hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            SaaS App Subscriptions ({scanData.apps.length})
          </button>

          <button
            onClick={() => setActiveTab('automations')}
            className={`px-3 py-2 rounded-t-lg transition-colors border-b-2 font-semibold ${
              activeTab === 'automations'
                ? 'text-emerald-400 border-emerald-500 bg-emerald-500/5'
                : 'border-transparent hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            Slack Nudge Rules
          </button>

          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-3 py-2 rounded-t-lg transition-colors border-b-2 font-semibold ${
              activeTab === 'integrations'
                ? 'text-emerald-400 border-emerald-500 bg-emerald-500/5'
                : 'border-transparent hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            SSO & Integrations
          </button>
        </div>
      </div>
    </div>
  );
};
