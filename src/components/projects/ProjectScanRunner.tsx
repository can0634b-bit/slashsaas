'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Bot,
  Calendar,
  Search,
  Cpu,
  Calculator,
  TrendingUp,
} from 'lucide-react';
import { triggerProjectScan } from '@/lib/actions/projects';

interface ProjectScanRunnerProps {
  projectId: string;
  hasQueries: boolean;
  queriesCount: number;
}

const AGENT_PIPELINE_STEPS = [
  {
    agentId: 1,
    name: 'Ajan 1 (Orkestratör)',
    desc: 'Tarama görevi başlatıldı ve arama kuyruğu hazırlandı...',
    icon: Calendar,
  },
  {
    agentId: 2,
    name: 'Ajan 2 (Toplayıcı)',
    desc: 'Google Gemini 2.5 motoru her sorgu için 3x bağımsız oturumda sorgulanıyor...',
    icon: Search,
  },
  {
    agentId: 3,
    name: 'Ajan 3 (Ayrıştırıcı)',
    desc: 'Ham yanıtlardan marka konumu, rakipler ve linkler halüsinasyonsuz ayıklanıyor...',
    icon: Cpu,
  },
  {
    agentId: 4,
    name: 'Ajan 4 (Skorlayıcı)',
    desc: '0-100 Deterministik Görünürlük Puanı ve Ses Payı (SoV) hesaplanıyor...',
    icon: Calculator,
  },
  {
    agentId: 5,
    name: 'Ajan 5 (Geçmiş & Diff)',
    desc: 'Önceki tarama ile kıyaslanıp sıra artış/azalışları ve yeni rakipler işleniyor...',
    icon: TrendingUp,
  },
];

export const ProjectScanRunner: React.FC<ProjectScanRunnerProps> = ({
  projectId,
  hasQueries,
  queriesCount,
}) => {
  const router = useRouter();
  const [selectedEngine, setSelectedEngine] = useState<'gemini' | 'groq'>('gemini');
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let interval: any;
    if (running) {
      interval = setInterval(() => {
        setStepIndex((prev) => (prev + 1) % AGENT_PIPELINE_STEPS.length);
      }, 3200);
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
      const res = await triggerProjectScan(projectId, selectedEngine);
      if (res.success) {
        setSuccess(true);
        router.refresh();
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(
        err.message ||
          'Tarama tamamlanamadı. Lütfen API anahtarınızın yapılandırıldığından emin olun.'
      );
    } finally {
      setRunning(false);
    }
  };

  const currentStep = AGENT_PIPELINE_STEPS[stepIndex];
  const StepIcon = currentStep.icon;

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-200">Ajan Döngüsü Hatası</p>
            <p className="text-zinc-400">{error}</p>
          </div>
        </div>
      )}

      {success && !running && (
        <div className="rounded-2xl border border-[#8ce04a]/30 bg-[#8ce04a]/10 p-3 text-xs text-[#8ce04a] flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>5 Ajanlık tarama döngüsü başarıyla tamamlandı! Sonuçlar ve Diff güncellendi.</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-white/10 bg-zinc-950/80 p-6 backdrop-blur-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-[#8ce04a]/5 blur-3xl pointer-events-none" />

        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Bot className="h-4 w-4 text-[#8ce04a]" />
            <span className="text-sm font-bold text-white tracking-tight">Otonom Ajan İzleme Hattı</span>
            <span className="rounded-md border border-[#8ce04a]/30 bg-[#8ce04a]/10 px-2 py-0.5 text-[10px] font-mono text-[#8ce04a]">
              5 Ajan Devrede
            </span>
          </div>
          <p className="text-xs text-zinc-400 max-w-xl">
            Her arama sorgusunu 3 bağımsız oturumda ({queriesCount * 3} toplam LLM etkileşimi) tarayıp; ayrıştırma, puanlama ve zaman serisi kıyaslamasını anlık tamamlar.
          </p>
        </div>

        <div className="w-full sm:w-auto shrink-0 flex flex-col items-center sm:items-end gap-2.5">
          {/* Engine Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              type="button"
              onClick={() => setSelectedEngine('gemini')}
              disabled={running}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                selectedEngine === 'gemini'
                  ? 'bg-[#8ce04a] text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Google Gemini 2.5
            </button>
            <button
              type="button"
              onClick={() => setSelectedEngine('groq')}
              disabled={running}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                selectedEngine === 'groq'
                  ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Groq (Llama 3.3)
            </button>
          </div>

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
                <span>Ajanlar Çalışıyor...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Otonom Taramayı Başlat</span>
              </>
            )}
          </button>

          {!hasQueries && (
            <span className="text-[10px] text-zinc-500">Taramak için en az 1 arama promptu ekleyin</span>
          )}
        </div>
      </div>

      {running && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-300 font-mono">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#8ce04a]/20 text-[#8ce04a] shrink-0 border border-[#8ce04a]/30">
              <StepIcon className="h-3.5 w-3.5" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-[11px]">{currentStep.name}</span>
                <span className="text-[#8ce04a] text-[10px] animate-pulse">Çalışıyor</span>
              </div>
              <p className="text-zinc-400 text-[10px] truncate">{currentStep.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {AGENT_PIPELINE_STEPS.map((s, idx) => (
              <div
                key={s.agentId}
                className={`h-1.5 w-5 rounded-full transition-all ${
                  idx === stepIndex
                    ? 'bg-[#8ce04a]'
                    : idx < stepIndex
                    ? 'bg-emerald-600'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
