'use client';

import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { OverviewTab } from '@/components/dashboard/OverviewTab';
import { ZombieSeatsTab } from '@/components/dashboard/ZombieSeatsTab';
import { AppsCatalogTab } from '@/components/dashboard/AppsCatalogTab';
import { AutomationsTab } from '@/components/dashboard/AutomationsTab';
import { IntegrationsTab } from '@/components/dashboard/IntegrationsTab';
import { LiveScanModal } from '@/components/LiveScanModal';
import { ScanSummary, ZombieUserSeat } from '@/lib/types';
import { INITIAL_MOCK_SCAN } from '@/lib/mockData';
import confetti from 'canvas-confetti';
import { Check, MessageSquare, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const [scanData, setScanData] = useState<ScanSummary>(INITIAL_MOCK_SCAN);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  // Load custom scan from localStorage if exists
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ghostspend_scan');
      if (saved) {
        setScanData(JSON.parse(saved));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle single seat Slack Nudge or Reclaim
  const handleSingleNudge = async (seat: ZombieUserSeat, actionType: 'nudge' | 'reclaim') => {
    try {
      await fetch('/api/actions/nudge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seatId: seat.id,
          userName: seat.userName,
          userEmail: seat.userEmail,
          appName: seat.appName,
          daysInactive: seat.daysInactive,
          actionType,
        }),
      });

      // Update state locally
      setScanData((prev) => {
        const updatedZombies = prev.zombieSeats.map((z) => {
          if (z.id === seat.id) {
            return {
              ...z,
              nudgeStatus: actionType === 'reclaim' ? ('reclaimed' as const) : ('nudged' as const),
              nudgeSentAt: new Date().toISOString(),
            };
          }
          return z;
        });

        let updatedMonthlyWaste = prev.monthlyWastedSpend;
        let updatedZombieCount = prev.zombieSeatCount;

        if (actionType === 'reclaim') {
          updatedMonthlyWaste = Math.max(0, updatedMonthlyWaste - seat.costMonthly);
          updatedZombieCount = Math.max(0, updatedZombieCount - 1);
          
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#10b981', '#34d399', '#3b82f6']
            });
          } catch (e) {}
        }

        return {
          ...prev,
          zombieSeats: updatedZombies,
          monthlyWastedSpend: updatedMonthlyWaste,
          annualWastedSpend: updatedMonthlyWaste * 12,
          zombieSeatCount: updatedZombieCount,
        };
      });

      if (actionType === 'reclaim') {
        showToast('License Reclaimed!', `Marked ${seat.userName}'s ${seat.appName} seat as reclaimed. Saved $${seat.costMonthly * 12}/yr.`);
      } else {
        showToast('Slack Nudge Dispatched', `Sent automated Slack DM to ${seat.userName} asking if they still require ${seat.appName}.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Batch Slack Nudge
  const handleBatchNudge = async () => {
    try {
      showToast('Batch Nudge Campaign Started', `Sent automated Slack DMs to all ${scanData.zombieSeatCount} dormant seat owners.`);
      
      setScanData((prev) => ({
        ...prev,
        zombieSeats: prev.zombieSeats.map((z) => ({
          ...z,
          nudgeStatus: z.nudgeStatus === 'reclaimed' ? 'reclaimed' : 'nudged',
          nudgeSentAt: new Date().toISOString(),
        })),
      }));

      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#10b981', '#60a5fa', '#f59e0b']
        });
      } catch (e) {}
    } catch (err) {
      console.error(err);
    }
  };

  // Handle App Price Edit
  const handleUpdateAppPrice = (appId: string, newCost: number) => {
    setScanData((prev) => {
      const updatedApps = prev.apps.map((app) => {
        if (app.id === appId) {
          const monthlyWaste = app.zombieSeats * newCost;
          return {
            ...app,
            costPerSeatMonthly: newCost,
            monthlyWaste,
            annualWaste: monthlyWaste * 12,
          };
        }
        return app;
      });

      const updatedZombies = prev.zombieSeats.map((z) => {
        if (z.appId === appId) {
          return { ...z, costMonthly: newCost };
        }
        return z;
      });

      const newMonthlyWaste = updatedApps.reduce((acc, curr) => acc + curr.monthlyWaste, 0);

      showToast('Price Updated', `Recalculated organizational spend with new seat cost.`);

      return {
        ...prev,
        apps: updatedApps,
        zombieSeats: updatedZombies,
        monthlyWastedSpend: newMonthlyWaste,
        annualWastedSpend: newMonthlyWaste * 12,
      };
    });
  };

  // Handle CSV Export
  const handleExportCsv = async () => {
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanData }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ghostspend-${scanData.organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-audit.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('CSV Downloaded', 'Audit summary export successfully downloaded.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleScanComplete = (newScan: ScanSummary) => {
    setScanData(newScan);
    showToast('Scan Completed', `Discovered $${newScan.annualWastedSpend.toLocaleString()}/yr recoverable bleed across ${newScan.totalAppsDiscovered} apps.`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-emerald-500/40 bg-zinc-900 p-4 shadow-2xl shadow-emerald-950/60 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3 max-w-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
            <Check className="h-4 w-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-white">{toastMessage.title}</h5>
            <p className="text-[11px] text-zinc-400 mt-0.5">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <DashboardHeader
        scanData={scanData}
        onOpenScanModal={() => setIsScanModalOpen(true)}
        onExportCsv={handleExportCsv}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 w-full">
        {activeTab === 'overview' && (
          <OverviewTab
            scanData={scanData}
            onNavigateToZombies={() => setActiveTab('zombies')}
            onBatchNudge={handleBatchNudge}
          />
        )}

        {activeTab === 'zombies' && (
          <ZombieSeatsTab
            zombieSeats={scanData.zombieSeats}
            apps={scanData.apps}
            onSingleNudge={handleSingleNudge}
            onBatchNudge={handleBatchNudge}
          />
        )}

        {activeTab === 'apps' && (
          <AppsCatalogTab
            apps={scanData.apps}
            onUpdateAppPrice={handleUpdateAppPrice}
          />
        )}

        {activeTab === 'automations' && <AutomationsTab />}

        {activeTab === 'integrations' && <IntegrationsTab />}
      </main>

      {/* Live Scan Modal */}
      <LiveScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onScanComplete={handleScanComplete}
      />
    </div>
  );
}
