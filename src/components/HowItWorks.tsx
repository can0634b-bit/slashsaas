'use client';

import React from 'react';
import { KeyRound, Search, MessageSquareCheck, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: '60 Saniyede Google veya Slack ile Bağlanın',
      desc: 'Hiçbir kurulum dosyası indirmeniz veya şifre paylaşmanız gerekmez. Resmi OAuth 2.0 (Read-Only) üzerinden güvenle bağlanır.',
      tag: 'Sıfır Kurulum Eforu'
    },
    {
      num: '02',
      title: 'Otonom İnaktivite ve Zombi Koltuk Analizi',
      desc: 'GhostSpend arka planda token yenileme ve SAML kayıtlarını tarar. 30, 60 ve 90+ gündür açılmayan araçları anında tespit eder.',
      tag: 'Tam İsabetli Tespit'
    },
    {
      num: '03',
      title: '1-Tıkla Slack Nudge & Lisans Devri',
      desc: 'GhostSpend Bot çalışana nazik bir bildirim atar: "60 gündür Figma kullanmadığınız görüldü. Lisansı boşa çıkaralım mı?" Tek tıkla bütçenizi kurtarın.',
      tag: 'Nakit Tasarruf'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 border-t border-white/[0.06] bg-black">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Kolay 3 Adım
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            GhostSpend Nasıl Çalışır?
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            Karmaşık kurumsal süreçler yok. 3 dakika içinde çalışan ve şirketinizin parasını kurtaran modern iş akışı.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-white/[0.08] bg-zinc-950/80 p-8 flex flex-col justify-between hover:border-white/20 transition-all group shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-black text-zinc-800 group-hover:text-emerald-400/60 transition-colors">
                    {s.num}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                    {s.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2.5 leading-snug">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Otonom & Güvenli</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
