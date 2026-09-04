'use client';

import React from 'react';
import {
  Calendar,
  Search,
  Cpu,
  Calculator,
  TrendingUp,
  Lightbulb,
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Bot,
} from 'lucide-react';

interface AgentFleetHubProps {
  compact?: boolean;
}

export const AgentFleetHub: React.FC<AgentFleetHubProps> = ({ compact = false }) => {
  const agents = [
    {
      id: 1,
      name: 'Orkestratör',
      role: 'Zamanlayıcı & Cron',
      desc: 'Günlük 02:00 UTC otonom taramaları yönetir ve filoyu tetikler',
      icon: Calendar,
      status: 'active',
      statusText: 'Aktif (Vercel Cron)',
      type: 'Kod (Deterministik)',
      color: '#8ce04a',
    },
    {
      id: 2,
      name: 'Toplayıcı',
      role: 'Gemini AI Arama',
      desc: '3x örneklemeli sorgularla AI arama motorlarından ham cevapları toplar',
      icon: Search,
      status: 'active',
      statusText: 'Aktif (Gemini 2.5)',
      type: 'AI + Kod',
      color: '#38bdf8',
    },
    {
      id: 3,
      name: 'Ayrıştırıcı',
      role: 'Grounded Extractor',
      desc: 'Ham metinden marka sırasını, rakipleri ve linkleri sıfır halüsinasyonla ayıklar',
      icon: Cpu,
      status: 'active',
      statusText: 'Aktif (Grounded)',
      type: 'AI (JSON Schema)',
      color: '#a855f7',
    },
    {
      id: 4,
      name: 'Skorlayıcı',
      role: 'GEO Puanlama',
      desc: '100/80/65/50/40/0 matrisiyle şeffaf 0-100 görünürlük ve Ses Payı hesaplar',
      icon: Calculator,
      status: 'active',
      statusText: 'Aktif (Matematik)',
      type: 'Kod (Deterministik)',
      color: '#10b981',
    },
    {
      id: 5,
      name: 'Geçmiş & Diff',
      role: 'Zaman-Serisi Kıyas',
      desc: 'Önceki taramayla delta farklarını, sıra artış/düşüşlerini ve yeni rakipleri yakalar',
      icon: TrendingUp,
      status: 'active',
      statusText: 'Aktif (Diff Engine)',
      type: 'Kod (Zaman Serisi)',
      color: '#f59e0b',
    },
    {
      id: 6,
      name: 'İçgörü Motoru',
      role: 'Aksiyon Tavsiyeleri',
      desc: 'Sıra kayıplarını analiz edip 1. sıraya çıkmak için SEO/GEO içerik önerisi üretir',
      icon: Lightbulb,
      status: 'upcoming',
      statusText: 'Sıradaki Ajan',
      type: 'AI (Akıl Yürütme)',
      color: '#eab308',
    },
    {
      id: 7,
      name: 'Uyarı Ajanı',
      role: 'Bildirim Motoru',
      desc: 'Önemli sıra kayıplarında ve yeni rakip belirdiğinde anında bildirim gönderir',
      icon: Bell,
      status: 'pending',
      statusText: 'Geliştirilecek',
      type: 'Kod (Webhook/Email)',
      color: '#ec4899',
    },
  ];

  const activeCount = agents.filter((a) => a.status === 'active').length;

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden space-y-6">
      {/* Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-40 bg-[#8ce04a]/5 blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#8ce04a]/15 text-[#8ce04a] border border-[#8ce04a]/30">
              <Bot className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Otonom Ajan Filosu (Autonomous Agent Fleet)
            </h3>
            <span className="rounded-full border border-[#8ce04a]/30 bg-[#8ce04a]/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#8ce04a]">
              {activeCount}/7 Ajan Canlıda Aktif
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            SlashSaaS, 7 özelleştirilmiş otonom ajanın döngüsel çalışmasıyla markanızı AI arama motorlarında izler.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300 font-mono">
            <span className="h-2 w-2 rounded-full bg-[#8ce04a] animate-pulse" />
            <span>Otonom Döngü Devrede</span>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {agents.map((agent) => {
          const IconComponent = agent.icon;
          const isActive = agent.status === 'active';

          return (
            <div
              key={agent.id}
              className={`rounded-2xl border p-4 space-y-3 transition-all relative overflow-hidden ${
                isActive
                  ? 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                  : 'border-white/5 bg-white/[0.01] opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl shrink-0"
                  style={{
                    backgroundColor: `${agent.color}20`,
                    color: agent.color,
                    borderColor: `${agent.color}40`,
                    borderWidth: '1px',
                  }}
                >
                  <IconComponent className="h-4 w-4" />
                </div>

                <span
                  className={`rounded-md border px-2 py-0.5 text-[9px] font-mono font-bold ${
                    isActive
                      ? 'border-[#8ce04a]/30 bg-[#8ce04a]/10 text-[#8ce04a]'
                      : agent.status === 'upcoming'
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                      : 'border-zinc-700 bg-zinc-800/50 text-zinc-400'
                  }`}
                >
                  {agent.statusText}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500 font-mono text-[10px]">#{agent.id}</span>
                  <h4 className="text-xs font-bold text-white tracking-tight">{agent.name}</h4>
                </div>
                <p className="text-[10px] text-zinc-400 font-mono">{agent.role}</p>
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
                {agent.desc}
              </p>

              <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>Tür:</span>
                <span className="text-zinc-300">{agent.type}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
