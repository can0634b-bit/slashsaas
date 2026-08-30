'use client';

import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Sparkles, TrendingDown, Layers, Bot, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onOpenAuthModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAuthModal }) => {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
      {/* Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-cyan-500/10 blur-[120px] pointer-events-none -z-10" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-md mb-8 hover:border-white/20 transition-colors">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SlashSaaS: Startuplar için Otonom Lisans Optimizasyonu</span>
          <span className="text-zinc-600">|</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            Yeni Nesil FinOps
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="mx-auto max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          Şirketinizin Unutulmuş Lisanslarını{' '}
          <span className="bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
            60 Saniyede Kesip Atın.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
          50 kişilik bir teknoloji şirketi her ay ortalama <strong className="text-white font-semibold">2.000$</strong> tutarında kullanılmayan Figma, Notion ve yapay zeka koltuğunu unutur. <strong>SlashSaaS</strong>, Google Workspace ve Slack ile bağlanarak bu israfı anında tespit eder ve kurtarır.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={onOpenAuthModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-xl shadow-white/10 active:scale-95"
          >
            <Zap className="h-4 w-4 fill-zinc-950" />
            <span>Ücretsiz Denetimi Başlat</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-all backdrop-blur-sm"
          >
            <span>Nasıl Çalışır? (2 Dk)</span>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> %100 Read-Only (Yalnızca Okuma)
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Kredi Kartı Gerekmez
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 60 Saniyede Kurulum
          </span>
        </div>

        {/* Showcase Card */}
        <div className="mt-16 mx-auto max-w-5xl rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-2.5 sm:p-4 shadow-2xl shadow-black/80 backdrop-blur-xl">
          <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/90 p-6 sm:p-8 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-zinc-950 font-black text-sm">
                  /S
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">SlashSaaS Otonom Radar</h3>
                  <p className="text-xs text-zinc-400">Google Workspace & Slack API ile Canlı Senkronize</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Sistem Aktif ve Koruyor
                </span>
              </div>
            </div>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Tespit Edilen İsraf Oranı</span>
                <p className="text-2xl font-extrabold text-white mt-1">%22.4 <span className="text-xs font-normal text-rose-400 font-sans">bütçe fazlası</span></p>
                <p className="text-[11px] text-zinc-400 mt-1">Kullanılmayan 40+ koltuk tespit edildi</p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Yıllık Geri Kazanılan Bütçe</span>
                <p className="text-2xl font-extrabold text-emerald-400 mt-1">+24.600$ / yıl</p>
                <p className="text-[11px] text-zinc-400 mt-1">Doğrudan şirketin kasasında kalan nakit</p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Slack Nudge Dönüşümü</span>
                <p className="text-2xl font-extrabold text-cyan-400 mt-1">%94 Başarı</p>
                <p className="text-[11px] text-zinc-400 mt-1">Çalışanlar koltuklarını gönüllü devretti</p>
              </div>
            </div>

            {/* Visual SaaS App Pills */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-300">Otomatik Taranan Popüler Araçlar:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 font-medium text-zinc-300">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/[0.06]">Figma</span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/[0.06]">OpenAI ChatGPT</span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/[0.06]">Notion</span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/[0.06]">GitHub Copilot</span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/[0.06]">Loom</span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/[0.06]">Slack</span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/[0.06] text-zinc-500">+35 Araç</span>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Logos Strip */}
        <div className="mt-16 pt-8 border-t border-white/[0.06]">
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-6">
            Mevcut Altyapınızla Kusursuz Entegre Olur
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-60 grayscale hover:grayscale-0 transition-all text-xs font-semibold text-zinc-400">
            <span className="flex items-center gap-2">Google Workspace</span>
            <span className="flex items-center gap-2">Slack Enterprise</span>
            <span className="flex items-center gap-2">Microsoft 365</span>
            <span className="flex items-center gap-2">Okta SAML SSO</span>
            <span className="flex items-center gap-2">Stripe Invoicing</span>
          </div>
        </div>
      </div>
    </section>
  );
};
