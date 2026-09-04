'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { triggerProjectScan } from '@/lib/actions/projects';

interface ProjectScanRunnerProps {
  projectId: string;
  hasQueries: boolean;
  queriesCount: number;
}

const SCAN_STEPS = [
  'Querying Google Gemini engine (3× sampling per query)...',
  'Analyzing generative answers for brand presence...',
  'Extracting grounded competitor mentions & web citations...',
  'Calculating deterministic GEO visibility score...',
  'Persisting audit records and proof...',
];

export const ProjectScanRunner: React.FC<ProjectScanRunnerProps> = ({
  projectId,
  hasQueries,
  queriesCount,
}) => {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let interval: any;
    if (running) {
      interval = setInterval(() => {
        setStepIndex((prev) => (prev + 1) % SCAN_STEPS.length);
      }, 3500);
    } else {
      setStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [running]);

  const handleRunScan = async () => {
    if (!hasQueries || running) return;

    setRunning(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await triggerProjectScan(projectId);
      if (res.success) {
        setSuccess(true);
        router.refresh();
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(
        err.message ||
          'Failed to complete scan. Please ensure GEMINI_API_KEY is configured in your environment.'
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-200">Scan Failed</p>
            <p className="text-zinc-400">{error}</p>
          </div>
        </div>
      )}

      {success && !running && (
        <div className="rounded-2xl border border-[#8ce04a]/30 bg-[#8ce04a]/10 p-3 text-xs text-[#8ce04a] flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Scan completed successfully! Results updated below.</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-white/10 bg-zinc-950/80 p-6 backdrop-blur-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-[#8ce04a]/5 blur-3xl pointer-events-none" />

        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="h-4 w-4 text-[#8ce04a]" />
            <span className="text-sm font-bold text-white tracking-tight">AI Visibility Scan Engine</span>
            <span className="rounded-md border border-[#8ce04a]/30 bg-[#8ce04a]/10 px-2 py-0.5 text-[10px] font-mono text-[#8ce04a]">
              Google Gemini 2.5
            </span>
          </div>
          <p className="text-xs text-zinc-400 max-w-xl">
            Runs 3 non-deterministic samples per tracked prompt ({queriesCount * 3} total engine interactions) to guarantee grounded visibility accuracy.
          </p>
        </div>

        <div className="w-full sm:w-auto shrink-0 flex flex-col items-center sm:items-end gap-2">
          <button
            type="button"
            onClick={handleRunScan}
            disabled={!hasQueries || running}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl px-6 py-3 text-xs font-bold transition-all shadow-lg active:scale-95 ${
              running
                ? 'bg-white/10 text-zinc-300 border border-white/10 cursor-not-allowed'
                : !hasQueries
                ? 'bg-zinc-800 text-zinc-500 border border-white/5 cursor-not-allowed'
                : 'bg-white text-zinc-950 hover:bg-[#8ce04a] hover:text-black border border-white/20 hover:border-[#8ce04a]'
            }`}
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#8ce04a]" />
                <span>Running Scan...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Run AI Search Scan</span>
              </>
            )}
          </button>

          {!hasQueries && (
            <span className="text-[10px] text-zinc-500">Add at least 1 prompt to run scan</span>
          )}
        </div>
      </div>

      {running && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs flex items-center gap-3 animate-in fade-in duration-300">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8ce04a]/20 text-[#8ce04a] shrink-0">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          </div>
          <span className="text-zinc-300 font-mono text-[11px] animate-pulse">
            {SCAN_STEPS[stepIndex]}
          </span>
        </div>
      )}
    </div>
  );
};
