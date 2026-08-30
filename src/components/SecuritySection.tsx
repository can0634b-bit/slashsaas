'use client';

import React from 'react';
import { ShieldCheck, Lock, EyeOff, FileCheck, CheckCircle2 } from 'lucide-react';

export const SecuritySection: React.FC = () => {
  const securityPillars = [
    {
      icon: EyeOff,
      title: '%100 Read-Only (Yalnızca Okuma)',
      desc: 'GhostSpend hiçbir zaman şifrelerinizi, dosyalarınızı veya mesaj içeriklerinizi görmez. Yalnızca kimlik giriş zaman damgalarını (login timestamps) okur.'
    },
    {
      icon: Lock,
      title: 'Sıfır Şifre Depolama',
      desc: 'Google Workspace ve Slack\'in resmi OAuth 2.0 protokolü kullanılır. Sistemimizde hiçbir kullanıcı şifresi saklanmaz.'
    },
    {
      icon: ShieldCheck,
      title: 'SOC2 Type II & GDPR Uyumlu',
      desc: 'Tüm veri iletişimi TLS 1.3 ve 256-bit AES şifreleme standartlarında, Avrupa ve ABD regülasyonlarına tam uyumlu olarak işlenir.'
    },
    {
      icon: FileCheck,
      title: 'Anında Bağlantı Kesme & Silme',
      desc: 'İstediğiniz an Google veya Slack yönetim panelinizden tek tıkla GhostSpend erişimini iptal edebilir ve verilerinizi tamamen silebilirsiniz.'
    }
  ];

  return (
    <section id="security" className="py-24 border-t border-white/[0.06] bg-black">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Kurumsal Güvenlik & Gizlilik
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Verileriniz En Yüksek Standartlarda Korunur
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            Gizliliğinize ve şirket verilerinizin güvenliğine en üst düzeyde önem veriyoruz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {securityPillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-white/[0.08] bg-zinc-950/80 p-7 flex items-start gap-4 hover:border-white/20 transition-all group shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1.5">{p.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
