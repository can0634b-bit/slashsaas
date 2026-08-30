'use client';

import React, { useState } from 'react';
import { Check, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

interface PricingProps {
  onOpenAuthModal: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onOpenAuthModal }) => {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      id: 'starter',
      name: 'Ücretsiz Denetim (Audit)',
      desc: 'Şirketinizdeki kullanılmayan lisansları ve israfı anında keşfetmek için.',
      priceMonthly: 0,
      priceAnnual: 0,
      popular: false,
      ctaText: 'Ücretsiz Başla',
      features: [
        '15 Çalışana Kadar',
        'Tek Seferlik Google / Slack Taraması',
        'En Çok İsraf Yapan 5 SaaS Aracı',
        'Temel İnaktivite Raporu (30+ Gün)',
        'CSV Formatında İndirme'
      ]
    },
    {
      id: 'growth',
      name: 'Growth & Optimizasyon',
      desc: 'Büyüyen startuplar için haftalık otomatik tarama ve 1-tıkla Slack kurtarma.',
      priceMonthly: 49,
      priceAnnual: 39,
      popular: true,
      ctaText: '14 Gün Ücretsiz Dene',
      features: [
        '60 Çalışana Kadar',
        'Haftalık Otomatik Arka Plan Taraması',
        '1-Tıkla Otonom Slack Bot Nudgeları',
        'Tüm 40+ SaaS Araç Kataloğu',
        'Çift Araç ve Gölge IT Uyarıları',
        'Departman Bütçe Matrisi',
        'CFO Onaylı Resmi Raporlar'
      ]
    },
    {
      id: 'scale',
      name: 'Scale & Kurumsal',
      desc: 'Özel SAML SSO ve otomatik lisans düşürme webhookları isteyen şirketler için.',
      priceMonthly: 119,
      priceAnnual: 95,
      popular: false,
      ctaText: 'Scale Başlat',
      features: [
        'Sınırsız Çalışan',
        'Günlük Gerçek Zamanlı Token Denetimi',
        'Çoklu SSO (Google + Slack + Okta + 365)',
        'Özel Otomatik İptal Webhookları',
        'Özel SaaS Fiyatlandırma Düzenleyici',
        'Öncelikli 7/24 Destek',
        'Özel SOC2 ve DPA Sözleşmeleri'
      ]
    }
  ];

  return (
    <section id="pricing" className="py-24 border-t border-white/[0.06] bg-zinc-950/40 relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Şeffaf Fiyatlandırma
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            İlk 3 Günde Kendi Parasını Çıkarır
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            Uzun vadeli taahhüt yok, gizli ücret yok. İstediğiniz an tek tıkla iptal edebilirsiniz.
          </p>

          {/* Billing Switch */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/60 p-1.5 backdrop-blur-md">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                !annual ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Aylık Ödeme
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                annual ? 'bg-white text-zinc-950 font-bold shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Yıllık Ödeme</span>
              <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full ${annual ? 'bg-zinc-900 text-emerald-400 font-bold' : 'bg-emerald-500/20 text-emerald-400'}`}>
                %20 İndirim
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 max-w-6xl mx-auto">
          {plans.map((p) => {
            const price = annual ? p.priceAnnual : p.priceMonthly;

            return (
              <div
                key={p.id}
                className={`relative rounded-3xl border p-8 flex flex-col justify-between transition-all ${
                  p.popular
                    ? 'border-emerald-500/60 bg-gradient-to-b from-white/[0.07] to-white/[0.01] shadow-2xl shadow-emerald-950/30'
                    : 'border-white/[0.08] bg-zinc-950/80 hover:border-white/20'
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-400 px-3.5 py-0.5 text-[10px] font-extrabold text-zinc-950 uppercase tracking-wider shadow-md">
                    EN ÇOK TERCİH EDİLEN
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-white mb-1.5">{p.name}</h3>
                  <p className="text-xs text-zinc-400 mb-6 min-h-[32px]">{p.desc}</p>

                  <div className="mb-6 pb-6 border-b border-white/[0.06]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-black text-white">
                        ${price}
                      </span>
                      <span className="text-xs text-zinc-400 font-medium">
                        {p.priceMonthly > 0 ? (annual ? '/ay (yıllık faturalandırılır)' : '/ay') : 'ömür boyu ücretsiz'}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 text-xs text-zinc-300">
                    {p.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={onOpenAuthModal}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs sm:text-sm font-bold transition-all active:scale-[0.99] ${
                    p.popular
                      ? 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-xl'
                      : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5 fill-current" />
                  <span>{p.ctaText}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
