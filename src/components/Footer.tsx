'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.06] bg-black py-14 text-xs text-zinc-500">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-zinc-950 font-black text-xs">
              /S
            </div>
            <span className="font-bold text-sm text-white tracking-tight">SlashSaaS</span>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-400">Startuplar için Otonom FinOps & Lisans Kesim Platformu</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-zinc-400">
            <a href="#solutions" className="hover:text-white transition-colors">Çözüm</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Nasıl Çalışır?</a>
            <a href="#calculator" className="hover:text-white transition-colors">Tasarruf Hesapla</a>
            <a href="#security" className="hover:text-white transition-colors">Güvenlik</a>
            <a href="#pricing" className="hover:text-white transition-colors">Fiyatlandırma</a>
            <a href="#faq" className="hover:text-white transition-colors">SSS</a>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 SlashSaaS (slashsaas.com). Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Sistemler Canlı & Çalışıyor
            </span>
            <span className="text-zinc-700">•</span>
            <span className="hover:text-zinc-300 cursor-pointer">Gizlilik Politikası</span>
            <span className="text-zinc-700">•</span>
            <span className="hover:text-zinc-300 cursor-pointer">Güvenlik & Uyum</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
