'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Download, 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft,
  Building2,
  LogOut,
  Plus,
  RefreshCw
} from 'lucide-react';
import { ScanSummary, UserProfile } from '@/lib/types';
import { ThemeToggle } from '../ThemeToggle';

interface DashboardHeaderProps {
  scanData: ScanSummary | null;
  userProfile: UserProfile | null;
  onOpenConnectModal: () => void;
  onOpenUpgradeModal: () => void;
  onExportCsv: () => void;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  scanData,
  userProfile,
  onOpenConnectModal,
  onOpenUpgradeModal,
  onExportCsv,
  onLogout,
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="border-b border-zinc-200 dark:border-white/[0.08] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo & Org Details */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-xs shadow-md hover:scale-105 transition-transform"
              title="Return to Home"
            >
              /S
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white tracking-tight flex items-center gap-1.5">
                  {scanData?.organizationName || userProfile?.organizationName || 'My Organization'}
                </h1>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.2 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400">
                  {userProfile?.plan === 'scale' ? 'SCALE' : userProfile?.plan === 'growth' ? 'GROWTH' : 'PRO'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <span>{scanData ? `${scanData.totalAppsDiscovered} Connected Apps` : 'No workspace connected'}</span>
                <span>•</span>
                <span className="text-zinc-400 dark:text-zinc-500">{userProfile?.email || 'Logged In'}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <ThemeToggle />

            {scanData && (
              <button
                onClick={onExportCsv}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-white/[0.08] transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                <span>Export CSV</span>
              </button>
            )}

            <button
              onClick={onOpenConnectModal}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-white/[0.08] transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{scanData ? 'Re-Scan' : 'Connect Workspace'}</span>
            </button>

            <button
              onClick={onOpenUpgradeModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 dark:bg-white px-3.5 py-1.5 text-xs font-bold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-md active:scale-95 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Upgrade to Pro</span>
            </button>

            <button
              onClick={onLogout}
              className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 mt-4 -mb-3.5 overflow-x-auto pb-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-white/[0.06] pt-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-t-xl transition-colors border-b-2 font-semibold ${
              activeTab === 'overview'
                ? 'text-zinc-950 dark:text-white border-zinc-950 dark:border-white bg-zinc-100 dark:bg-white/[0.04]'
                : 'border-transparent hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-white/[0.02]'
            }`}
          >
            Executive Overview
          </button>

          <button
            onClick={() => setActiveTab('zombies')}
            className={`px-3 py-2 rounded-t-xl transition-colors border-b-2 font-semibold flex items-center gap-1.5 ${
              activeTab === 'zombies'
                ? 'text-zinc-950 dark:text-white border-zinc-950 dark:border-white bg-zinc-100 dark:bg-white/[0.04]'
                : 'border-transparent hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-white/[0.02]'
            }`}
          >
            <span>Zombie Seats</span>
            {scanData && (
              <span className="rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-300 px-1.5 py-0.2 text-[9px] font-bold">
                {scanData.zombieSeatCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('apps')}
            className={`px-3 py-2 rounded-t-xl transition-colors border-b-2 font-semibold ${
              activeTab === 'apps'
                ? 'text-zinc-950 dark:text-white border-zinc-950 dark:border-white bg-zinc-100 dark:bg-white/[0.04]'
                : 'border-transparent hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-white/[0.02]'
            }`}
          >
            SaaS Subscriptions ({scanData?.apps.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('automations')}
            className={`px-3 py-2 rounded-t-xl transition-colors border-b-2 font-semibold ${
              activeTab === 'automations'
                ? 'text-zinc-950 dark:text-white border-zinc-950 dark:border-white bg-zinc-100 dark:bg-white/[0.04]'
                : 'border-transparent hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-white/[0.02]'
            }`}
          >
            Slack Nudge Rules
          </button>

          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-3 py-2 rounded-t-xl transition-colors border-b-2 font-semibold ${
              activeTab === 'integrations'
                ? 'text-zinc-950 dark:text-white border-zinc-950 dark:border-white bg-zinc-100 dark:bg-white/[0.04]'
                : 'border-transparent hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-white/[0.02]'
            }`}
          >
            SSO & Integrations
          </button>
        </div>
      </div>
    </div>
  );
};
