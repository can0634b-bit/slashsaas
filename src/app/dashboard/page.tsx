'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { OverviewTab } from '@/components/dashboard/OverviewTab';
import { ZombieSeatsTab } from '@/components/dashboard/ZombieSeatsTab';
import { AppsCatalogTab } from '@/components/dashboard/AppsCatalogTab';
import { AutomationsTab } from '@/components/dashboard/AutomationsTab';
import { IntegrationsTab } from '@/components/dashboard/IntegrationsTab';
import { ConnectWorkspaceModal } from '@/components/ConnectWorkspaceModal';
import { LemonSqueezyModal } from '@/components/LemonSqueezyModal';
import { ScanSummary, ZombieUserSeat, UserProfile, IntegrationStatus, NudgeStatus } from '@/lib/types';
import { 
  getStoredSession, 
  saveSession, 
  clearSession, 
  getStoredIntegrations, 
  saveIntegrations,
  DEFAULT_INTEGRATIONS 
} from '@/lib/authStore';
import confetti from 'canvas-confetti';
import { Check, MessageSquare, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [scanData, setScanData] = useState<ScanSummary | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>(DEFAULT_INTEGRATIONS);
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Modals
  const [connectModalProvider, setConnectModalProvider] = useState<'Google Workspace' | 'Slack' | 'Microsoft 365' | 'Okta' | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  // Initialize or load persistent user profile and scan data
  useEffect(() => {
    try {
      const session = getStoredSession();
      if (session) {
        setUserProfile(session);
      } else {
        // Default initialized owner profile
        const defaultProfile: UserProfile = {
          id: 'user-' + Math.random().toString(36).substring(2, 9),
          email: 'founder@slashsaas.com',
          fullName: 'Founder',
          organizationId: 'org-1',
          organizationName: 'My Organization',
          role: 'owner',
          plan: 'growth',
          createdAt: new Date().toISOString(),
          rememberMe: true,
        };
        setUserProfile(defaultProfile);
        saveSession(defaultProfile, true);
      }

      // Load saved scan if present
      const savedScan = localStorage.getItem('slashsaas_current_scan');
      if (savedScan) {
        setScanData(JSON.parse(savedScan));
      }

      setIntegrations(getStoredIntegrations());
    } catch (err) {
      console.error(err);
    }
  }, []);

  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLogout = () => {
    clearSession();
    router.push('/');
  };

  // Handle Connecting Workspace
  const handleConnectedWorkspace = (newScan: ScanSummary, providerName: string) => {
    setScanData(newScan);
    localStorage.setItem('slashsaas_current_scan', JSON.stringify(newScan));

    // Update integration status
    const updatedInts = integrations.map(int => {
      if (int.name === providerName) {
        return {
          ...int,
          status: 'connected' as const,
          lastSyncAt: 'Just now',
          accountsFound: newScan.totalEmployees,
        };
      }
      return int;
    });

    setIntegrations(updatedInts);
    saveIntegrations(updatedInts);

    if (userProfile) {
      const updatedProfile = { ...userProfile, organizationName: newScan.organizationName };
      setUserProfile(updatedProfile);
      saveSession(updatedProfile, userProfile.rememberMe);
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#ffffff']
      });
    } catch {}

    showToast(
      `${providerName} Connected!`,
      `Audited ${newScan.totalEmployees} accounts. Found $${newScan.annualWastedSpend.toLocaleString()}/yr in recoverable licenses.`
    );
  };

  // Handle Disconnecting Integration
  const handleDisconnect = (id: string) => {
    const updatedInts = integrations.map(int => {
      if (int.id === id) {
        return {
          ...int,
          status: 'disconnected' as const,
          lastSyncAt: undefined,
          accountsFound: undefined,
        };
      }
      return int;
    });
    setIntegrations(updatedInts);
    saveIntegrations(updatedInts);
    showToast('Integration Disconnected', 'Revoked OAuth permissions for this provider.');
  };

  // Handle Single Nudge / Reclaim
  const handleSingleNudge = async (seat: ZombieUserSeat, actionType: 'nudge' | 'reclaim') => {
    if (!scanData) return;

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

      setScanData((prev) => {
        if (!prev) return prev;
        const updatedZombies: ZombieUserSeat[] = prev.zombieSeats.map((z) => {
          if (z.id === seat.id) {
            return {
              ...z,
              nudgeStatus: (actionType === 'reclaim' ? 'reclaimed' : 'nudged') as NudgeStatus,
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
              colors: ['#10b981', '#34d399', '#ffffff']
            });
          } catch {}
        }

        const newScan: ScanSummary = {
          ...prev,
          zombieSeats: updatedZombies,
          monthlyWastedSpend: updatedMonthlyWaste,
          annualWastedSpend: updatedMonthlyWaste * 12,
          zombieSeatCount: updatedZombieCount,
        };
        localStorage.setItem('slashsaas_current_scan', JSON.stringify(newScan));
        return newScan;
      });

      if (actionType === 'reclaim') {
        showToast('License Reclaimed', `Marked ${seat.userName}'s ${seat.appName} seat as reclaimed. Saved $${seat.costMonthly * 12}/yr.`);
      } else {
        showToast('Slack Nudge Sent', `Dispatched automated Slack DM to ${seat.userName} regarding ${seat.appName}.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Batch Slack Nudge
  const handleBatchNudge = async () => {
    if (!scanData) return;

    showToast('Batch Nudge Dispatched', `Automated Slack DMs sent to all ${scanData.zombieSeatCount} dormant seat holders.`);
    
    setScanData((prev) => {
      if (!prev) return prev;
      const updatedZombies: ZombieUserSeat[] = prev.zombieSeats.map((z) => ({
        ...z,
        nudgeStatus: (z.nudgeStatus === 'reclaimed' ? 'reclaimed' : 'nudged') as NudgeStatus,
        nudgeSentAt: new Date().toISOString(),
      }));

      const newScan: ScanSummary = {
        ...prev,
        zombieSeats: updatedZombies,
      };
      localStorage.setItem('slashsaas_current_scan', JSON.stringify(newScan));
      return newScan;
    });

    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#10b981', '#60a5fa', '#ffffff']
      });
    } catch {}
  };

  // Handle App Price Edit
  const handleUpdateAppPrice = (appId: string, newCost: number) => {
    if (!scanData) return;

    setScanData((prev) => {
      if (!prev) return prev;
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

      const newScan: ScanSummary = {
        ...prev,
        apps: updatedApps,
        zombieSeats: updatedZombies,
        monthlyWastedSpend: newMonthlyWaste,
        annualWastedSpend: newMonthlyWaste * 12,
      };
      localStorage.setItem('slashsaas_current_scan', JSON.stringify(newScan));
      return newScan;
    });

    showToast('Seat Price Updated', 'Recalculated organizational spend with new pricing.');
  };

  // Handle CSV Export
  const handleExportCsv = async () => {
    if (!scanData) return;

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
      a.download = `slashsaas-${scanData.organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-audit.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('CSV Downloaded', 'Audit summary export generated successfully.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-white/20 bg-zinc-900/95 backdrop-blur-xl p-4 shadow-2xl shadow-black/80 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3 max-w-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-zinc-950 font-bold shrink-0 mt-0.5 text-xs">
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
        userProfile={userProfile}
        onOpenConnectModal={() => setConnectModalProvider('Google Workspace')}
        onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        onExportCsv={handleExportCsv}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 w-full">
        {activeTab === 'overview' && (
          <OverviewTab
            scanData={scanData}
            onOpenConnectModal={() => setConnectModalProvider('Google Workspace')}
            onNavigateToZombies={() => setActiveTab('zombies')}
            onBatchNudge={handleBatchNudge}
          />
        )}

        {activeTab === 'zombies' && (
          <ZombieSeatsTab
            zombieSeats={scanData?.zombieSeats || []}
            apps={scanData?.apps || []}
            onSingleNudge={handleSingleNudge}
            onBatchNudge={handleBatchNudge}
            onOpenConnectModal={() => setConnectModalProvider('Google Workspace')}
          />
        )}

        {activeTab === 'apps' && (
          <AppsCatalogTab
            apps={scanData?.apps || []}
            onUpdateAppPrice={handleUpdateAppPrice}
          />
        )}

        {activeTab === 'automations' && <AutomationsTab />}

        {activeTab === 'integrations' && (
          <IntegrationsTab
            integrations={integrations}
            onOpenConnectModal={(prov) => setConnectModalProvider(prov)}
            onDisconnect={handleDisconnect}
          />
        )}
      </main>

      {/* Connect Workspace Modal */}
      <ConnectWorkspaceModal
        isOpen={!!connectModalProvider}
        provider={connectModalProvider}
        onClose={() => setConnectModalProvider(null)}
        onConnected={handleConnectedWorkspace}
      />

      {/* LemonSqueezy Upgrade Modal */}
      <LemonSqueezyModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onSuccess={(plan) => {
          if (userProfile) {
            const updated = { ...userProfile, plan };
            setUserProfile(updated);
            saveSession(updated, userProfile.rememberMe);
          }
          showToast('Upgraded Successfully!', `Your SlashSaaS account has been upgraded to ${plan.toUpperCase()}.`);
        }}
      />
    </div>
  );
}
