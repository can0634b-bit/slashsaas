'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'GhostSpend şirketimizin verilerine veya mesajlarına erişir mi?',
      a: 'Hayır. GhostSpend %100 Read-Only (Yalnızca Okuma) yetkisiyle çalışır. Mesajlarınızı, dosyalarınızı veya e-postalarınızı asla okumaz. Sadece kullanıcıların araçlara en son ne zaman giriş yaptığının zaman damgasını (timestamp) okur.'
    },
    {
      q: 'Kurulum ne kadar sürer? Bir yazılım indirmemiz gerekiyor mu?',
      a: 'Kurulum tam 60 saniye sürer. Bilgisayarlara veya sunuculara herhangi bir ajan ya da program kurmanız gerekmez. Sadece şirket yöneticinizin Google Workspace veya Slack ile tek tıkla oturum açması yeterlidir.'
    },
    {
      q: 'Slack Nudge özelliği nasıl çalışır?',
      a: 'Bir çalışanın (örneğin bir tasarımcının) son 60 gündür Figma açmadığı tespit edilirse, GhostSpend Bot çalışana özelden kibar bir Slack mesajı atar: "Figma hesabınızı son 60 gündür kullanmadığınız görüldü. Lisansınızı boşa çıkarmak ister misiniz?" Çalışan tek tıkla "Evet" dediğinde lisans güvenle geri kazanılır.'
    },
    {
      q: 'Hangi SaaS araçları otomatik taranır?',
      a: 'Figma, Notion, OpenAI ChatGPT Team, GitHub Copilot, Linear, Loom, Miro, Slack, Salesforce, HubSpot, Datadog, Zoom, Canva ve Google Workspace üzerindeki tüm OAuth bağlantılı araçlar taranır.'
    },
    {
      q: 'İstediğimiz an iptal edebilir miyiz?',
      a: 'Evet. GhostSpend\'de hiçbir bağlayıcı yıllık taahhüt yoktur. İstediğiniz an tek tıkla aboneliğinizi sonlandırabilir ve tüm entegrasyon erişimini kaldırabilirsiniz.'
    }
  ];

  return (
    <section id="faq" className="py-24 border-t border-white/[0.06] bg-black">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Sıkça Sorulan Sorular
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Aklınıza Takılan Sorular
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/[0.08] bg-zinc-950/80 overflow-hidden transition-colors hover:border-white/20"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4"
                >
                  <span className="text-sm sm:text-base font-bold text-white">
                    {faq.q}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/[0.04] pt-4 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
