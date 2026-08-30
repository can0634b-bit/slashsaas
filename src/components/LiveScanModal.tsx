'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Ghost, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  Building2, 
  Users, 
  AlertTriangle,
  Zap,
  TrendingDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LiveScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete?: (scanData: any) => void;
}

export const LiveScanModal: React.FC<LiveScanModalProps> = ({ isOpen, onClose, onScanComplete }) => {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'scanning' | 'complete'>('form');
  const [companyName, setCompanyName] = useState('Acme Corp');
  const [employeeCount, setEmployeeCount] = useState(65);
  const [provider, setProvider] = useState<'google' | 'slack' | 'microsoft'>('google');
  
  // Scanning animation steps
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [discoveredWaste, setDiscoveredWaste] = useState(0);
  const [discoveredZombies, setDiscoveredZombies] = useState(0);
  const [finalResult, setFinalResult] = useState<any>(null);

  const scanSteps = [
    { title: 'Connecting to Directory API...', detail: `Querying ${provider === 'google' ? 'Google Workspace Admin SDK' : provider === 'slack' ? 'Slack Enterprise Grid' : 'Microsoft Entra ID'}` },
    { title: 'Auditing Active Team Members...', detail: `Indexed ${employeeCount} employee accounts and organizational units` },
    { title: 'Inspecting OAuth Tokens & SSO Logins...', detail: 'Scanning active refresh tokens for Figma, Notion, OpenAI, GitHub, Loom...' },
    { title: 'Calculating Dormancy & Zombie Days...', detail: 'Cross-referencing login activity against 30/60/90-day inactivity thresholds' },
    { title: 'Generating Executive Waste Report...', detail: 'Calculating annual financial bleed and 1-click reclaim opportunities' }
  ];

  useEffect(() => {
    if (!isOpen) {
      setStep('form');
      setScanStepIndex(0);
      setScanProgress(0);
      setDiscoveredWaste(0);
      setDiscoveredZombies(0);
    }
  }, [isOpen]);

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('scanning');
    setScanProgress(5);

    try {
      // Trigger scan API in background
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, employeeCount, provider }),
      });
      const data = await res.json();
      setFinalResult(data);

      // Run animated scan stages
      let progress = 10;
      const interval = setInterval(() => {
        progress += 4;
        setScanProgress(Math.min(96, progress));

        if (progress > 20 && progress < 45) {
          setScanStepIndex(1);
        } else if (progress >= 45 && progress < 70) {
          setScanStepIndex(2);
          setDiscoveredZombies(Math.floor(data.zombieSeatCount * 0.4));
          setDiscoveredWaste(Math.floor(data.annualWastedSpend * 0.4));
        } else if (progress >= 70 && progress < 90) {
          setScanStepIndex(3);
          setDiscoveredZombies(Math.floor(data.zombieSeatCount * 0.8));
          setDiscoveredWaste(Math.floor(data.annualWastedSpend * 0.8));
        } else if (progress >= 90) {
          setScanStepIndex(4);
          setDiscoveredZombies(data.zombieSeatCount);
          setDiscoveredWaste(data.annualWastedSpend);
        }

        if (progress >= 100) {
          clearInterval(interval);
          setScanProgress(100);
          setStep('complete');
          
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#10b981', '#34d399', '#6ee7b7', '#3b82f6']
            });
          } catch (err) {
            // ignore if canvas not available
          }
        }
      }, 120);

    } catch (err) {
      console.error(err);
      setStep('form');
    }
  };

  const handleGoToDashboard = () => {
    if (finalResult) {
      localStorage.setItem('ghostspend_scan', JSON.stringify(finalResult));
    }
    if (onScanComplete) {
      onScanComplete(finalResult);
    }
    onClose();
    router.push('/dashboard');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 sm:p-8 shadow-2xl shadow-emerald-950/40">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-teal-500/15 blur-3xl" />

        {/* Close Button */}
        {step !== 'scanning' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* STEP 1: INITIAL FORM */}
        {step === 'form' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Ghost className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Run Free Instant SaaS Audit</h3>
                <p className="text-xs text-zinc-400">60-second read-only scan to uncover unused licenses</p>
              </div>
            </div>

            <form onSubmit={handleStartScan} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Company / Organization Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Technologies"
                    className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950/70 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-zinc-400" />
                    Team Size: <span className="text-emerald-400 font-bold">{employeeCount} employees</span>
                  </label>
                </div>
                <input
                  type="range"
                  min="10"
                  max="250"
                  step="5"
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>10 users</span>
                  <span>100 users</span>
                  <span>250+ users</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Connect SSO / Identity Provider
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setProvider('google')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                      provider === 'google'
                        ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-400 shadow-sm shadow-emerald-500/10'
                        : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="font-semibold mb-0.5">Google</span>
                    <span className="text-[10px] text-zinc-500">Workspace</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProvider('slack')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                      provider === 'slack'
                        ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-400 shadow-sm shadow-emerald-500/10'
                        : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="font-semibold mb-0.5">Slack</span>
                    <span className="text-[10px] text-zinc-500">Workspace</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProvider('microsoft')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                      provider === 'microsoft'
                        ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-400 shadow-sm shadow-emerald-500/10'
                        : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="font-semibold mb-0.5">Microsoft</span>
                    <span className="text-[10px] text-zinc-500">Entra / 365</span>
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3 flex items-start gap-2.5 text-[11px] text-zinc-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-zinc-200">100% Read-Only & SOC2 Compliant:</strong> GhostSpend never requests password or write access. We only read user login timestamps to calculate dormancy.
                </span>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-semibold text-zinc-950 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25 active:scale-[0.99] transition-all"
              >
                <Zap className="h-4 w-4 fill-zinc-950" />
                <span>Launch Instant Scan & Discovery</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: SCANNING IN PROGRESS */}
        {step === 'scanning' && (
          <div className="py-4">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 animate-pulse">
                  <Ghost className="h-8 w-8" />
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-emerald-500/20 blur-md -z-10 animate-ping opacity-50" />
              </div>

              <h4 className="text-lg font-bold text-white mb-1">
                Auditing {companyName}...
              </h4>
              <p className="text-xs text-zinc-400">
                Running automated token inspection across {employeeCount} accounts
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1.5">
                <span>{scanSteps[scanStepIndex]?.title}</span>
                <span className="text-emerald-400">{Math.round(scanProgress)}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1.5 italic">
                {scanSteps[scanStepIndex]?.detail}
              </p>
            </div>

            {/* Live Ticker of Discovered Waste */}
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3.5 text-center">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Zombie Seats Found</span>
                <p className="text-xl font-bold text-amber-400 mt-0.5 flex items-center justify-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  {discoveredZombies}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Annual Bleed Detected</span>
                <p className="text-xl font-bold text-rose-400 mt-0.5 flex items-center justify-center gap-1">
                  <TrendingDown className="h-4 w-4" />
                  ${discoveredWaste.toLocaleString()}/yr
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SCAN COMPLETE */}
        {step === 'complete' && finalResult && (
          <div className="py-2 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h3 className="text-2xl font-bold text-white tracking-tight mb-1">
              Audit Complete!
            </h3>
            <p className="text-xs text-zinc-400 mb-6">
              We analyzed {finalResult.totalEmployees} accounts & {finalResult.totalAppsDiscovered} SaaS subscriptions for {finalResult.organizationName}.
            </p>

            <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-center">
              <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
                Total Recoverable Waste
              </span>
              <p className="text-3xl font-extrabold text-white mt-1">
                ${finalResult.annualWastedSpend.toLocaleString()}<span className="text-sm font-normal text-rose-300">/year</span>
              </p>
              <div className="mt-2 flex items-center justify-center gap-4 text-xs text-zinc-300">
                <span>⚠️ <strong>{finalResult.zombieSeatCount}</strong> Zombie Seats</span>
                <span>•</span>
                <span>📉 <strong>{finalResult.potentialSavingsPercentage}%</strong> of Total SaaS Budget</span>
              </div>
            </div>

            <button
              onClick={handleGoToDashboard}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-bold text-zinc-950 hover:from-emerald-400 hover:to-teal-400 shadow-xl shadow-emerald-500/25 active:scale-[0.99] transition-all"
            >
              <span>Explore Interactive Audit Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
