'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Ghost, ShieldCheck, ArrowRight, Zap, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  mode: 'signin' | 'signup';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, mode: initialMode, onClose }) => {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onClose();
      router.push('/dashboard');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-6 sm:p-8 shadow-2xl shadow-black/80">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-950 font-bold shadow-md">
            <Ghost className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {mode === 'signup' ? 'Ücretsiz Hesap Oluşturun' : 'GhostSpend\'e Giriş Yapın'}
            </h3>
            <p className="text-xs text-zinc-400">
              {mode === 'signup' ? '60 saniyede şirket lisanslarınızı tarayın' : 'Hesabınıza güvenle erişin'}
            </p>
          </div>
        </div>

        {/* SSO Quick Buttons */}
        <div className="space-y-2.5 mb-6">
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => { setLoading(false); onClose(); router.push('/dashboard'); }, 800);
            }}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs font-semibold text-white hover:bg-white/[0.08] transition-all"
          >
            <span>Google Workspace ile Devam Et</span>
          </button>

          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => { setLoading(false); onClose(); router.push('/dashboard'); }, 800);
            }}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs font-semibold text-white hover:bg-white/[0.08] transition-all"
          >
            <span>Slack ile Devam Et</span>
          </button>
        </div>

        <div className="relative mb-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.08]"></div></div>
          <span className="relative bg-zinc-950 px-3 text-[11px] text-zinc-500 uppercase tracking-wider">veya e-posta ile</span>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Şirket / Organizasyon Adı</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Örn: Acme Teknoloji A.Ş."
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Şirket E-posta Adresiniz</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ahmet@sirketiniz.com"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.99]"
          >
            {loading ? (
              <span>Yükleniyor...</span>
            ) : (
              <>
                <span>{mode === 'signup' ? 'Ücretsiz Başla' : 'Giriş Yap'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-6 text-center text-xs text-zinc-400">
          {mode === 'signup' ? (
            <span>
              Zaten hesabınız var mı?{' '}
              <button onClick={() => setMode('signin')} className="text-white font-semibold hover:underline">
                Giriş Yapın
              </button>
            </span>
          ) : (
            <span>
              Hesabınız yok mu?{' '}
              <button onClick={() => setMode('signup')} className="text-white font-semibold hover:underline">
                Ücretsiz Hesap Açın
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
