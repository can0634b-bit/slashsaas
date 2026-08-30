'use client';

import React from 'react';
import { Search, MessageSquare, Layers, FileSpreadsheet, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export const BentoGrid: React.FC = () => {
  return (
    <section id="solutions" className="py-24 border-t border-white/[0.06] bg-zinc-950/40 relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Neden GhostSpend?
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Şirket Bütçenizi Koruyan Akıllı Mimari
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            Geleneksel hantal yazılımlar gibi aylarca kurulum istemez. 60 saniyede bağlanır ve arka planda çalışır.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 (Large - Spans 2 cols) */}
          <div className="md:col-span-2 rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-8 flex flex-col justify-between hover:border-white/20 transition-all group shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white font-bold">
                  <Search className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Gerçek Zamanlı Veri
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Derin OAuth & SAML Giriş Taraması
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-lg">
                GhostSpend sadece kredi kartı dökümlerine bakıp tahmin yürütmez. Google ve Slack üzerindeki gerçek token yenileme kayıtlarını inceler; bir çalışanın Figma veya ChatGPT hesabını 30, 60 veya 90+ gündür açıp açmadığını dakikası dakikasına tespit eder.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-white/[0.06] bg-black/40 p-4 flex items-center justify-between text-xs text-zinc-300">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Dormancy Algoritması: 30 / 60 / 90+ Günlük İnaktivite Analizi
              </span>
              <span className="text-emerald-400 font-bold">%100 İsabet</span>
            </div>
          </div>

          {/* Card 2 (Single col) */}
          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-8 flex flex-col justify-between hover:border-white/20 transition-all group shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white font-bold">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                  Slack Entegrasyonu
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                1-Tıkla Slack Nudge Botu
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                İnsanları tek tek arayıp hesap sormayın. Botumuz çalışana nazik bir Slack DM'i atar ve tek tıkla lisansı boşa çıkarmasını sağlar.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Sıfır İkili Sürtüşme, %94 Onay Oranı</span>
            </div>
          </div>

          {/* Card 3 (Single col) */}
          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-8 flex flex-col justify-between hover:border-white/20 transition-all group shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white font-bold">
                  <Layers className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  Gölge IT Radarı
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Çift & Mükerrer Araç Tespiti
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Pazarlama ekibi Loom kullanırken satış ekibi Vidyard mı ödüyor? Şirket içinde çakışan ve gereksiz mükerrer araçları anında tek çatı altında toplar.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs text-zinc-400 flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Gereksiz Çift Ödemeleri Önler</span>
            </div>
          </div>

          {/* Card 4 (Large - Spans 2 cols) */}
          <div className="md:col-span-2 rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-8 flex flex-col justify-between hover:border-white/20 transition-all group shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white font-bold">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                  Finans & Muhasebe
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                CFO & Yönetim Kurulu İçin Resmi Raporlama
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-lg">
                Yıllık yazılım sözleşmesi yenilemelerinde (Figma, Salesforce, Notion vb.) muhasebe ve finans ekibinize sunabileceğiniz satır satır kanıtlanmış tasarruf raporunu tek tıkla CSV veya PDF olarak indirin.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-white/[0.06] bg-black/40 p-4 flex items-center justify-between text-xs text-zinc-300">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-purple-400" />
                Her Yenileme Öncesi Otomatik Finans Özeti
              </span>
              <span className="text-purple-400 font-bold">Tek Tıkla İndir</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
