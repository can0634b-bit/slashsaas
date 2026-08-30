'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowRight } from 'lucide-react';
import { saveSession } from '@/lib/authStore';
import { UserProfile } from '@/lib/types';
import { SlashLogoIcon } from './Logo';

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
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const userProfile: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: email || 'user@company.com',
      fullName: fullName || (email ? email.split('@')[0] : 'Admin User'),
      organizationId: 'org_' + Math.random().toString(36).substring(2, 9),
      organizationName: company || 'My Organization',
      role: 'owner',
      plan: 'growth',
      createdAt: new Date().toISOString(),
      rememberMe,
    };

    saveSession(userProfile, rememberMe);

    setTimeout(() => {
      setLoading(false);
      onClose();
      router.push('/dashboard');
    }, 600);
  };

  const handleQuickSso = (provider: string) => {
    if (provider === 'Google') {
      window.location.href = '/api/auth/google';
      return;
    }
    setLoading(true);
    const domain = email ? email.split('@')[1] : 'company.io';
    const userProfile: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: email || `founder@${domain}`,
      fullName: 'Organization Admin',
      organizationId: 'org_' + Math.random().toString(36).substring(2, 9),
      organizationName: company || 'My Organization',
      role: 'owner',
      plan: 'growth',
      createdAt: new Date().toISOString(),
      rememberMe,
    };

    saveSession(userProfile, rememberMe);

    setTimeout(() => {
      setLoading(false);
      onClose();
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-6 sm:p-8 shadow-2xl shadow-black/90">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header with Official Logo Icon */}
        <div className="flex items-center gap-3.5 mb-6">
          <SlashLogoIcon size={34} />
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {mode === 'signup' ? 'Create Your Account' : 'Sign in to SlashSaaS'}
            </h3>
            <p className="text-xs text-zinc-400">
              {mode === 'signup' ? 'Autonomous license waste elimination' : 'Access your organization dashboard'}
            </p>
          </div>
        </div>

        {/* SSO Quick Buttons */}
        <div className="space-y-2.5 mb-6">
          <button
            onClick={() => handleQuickSso('Google')}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs font-semibold text-white hover:bg-white/[0.08] transition-all"
          >
            <span>Continue with Google Workspace</span>
          </button>

          <button
            onClick={() => handleQuickSso('Slack')}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs font-semibold text-white hover:bg-white/[0.08] transition-all"
          >
            <span>Continue with Slack</span>
          </button>
        </div>

        <div className="relative mb-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.08]"></div></div>
          <span className="relative bg-zinc-950 px-3 text-[11px] text-zinc-500 uppercase tracking-wider">or with work email</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Company / Organization Name</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corporation"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Work Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@acmecorp.com"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
            />
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between text-xs text-zinc-400 py-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/20 bg-zinc-900 text-white accent-white focus:ring-0"
              />
              <span>Remember me on this device</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.99]"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'signup' ? 'Get Started' : 'Sign In'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-400">
          {mode === 'signup' ? (
            <span>
              Already have an account?{' '}
              <button onClick={() => setMode('signin')} className="text-white font-semibold hover:underline">
                Sign in
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button onClick={() => setMode('signup')} className="text-white font-semibold hover:underline">
                Create one
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
