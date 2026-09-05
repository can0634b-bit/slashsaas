'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { SlashLogo } from './Logo';
import { createClient } from '@/lib/supabase/client';

interface NavbarProps {
  onOpenWaitlistModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenWaitlistModal }) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string; id: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ email: session.user.email, id: session.user.id });
      } else {
        setUser(null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ email: session.user.email, id: session.user.id });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 sm:px-6">
      <nav className="w-full max-w-5xl rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl px-5 py-3 shadow-2xl shadow-black/60 flex items-center justify-between transition-all">
        <Link href="/" className="flex items-center gap-2 group hover:opacity-90 transition-opacity">
          <SlashLogo size="md" />
        </Link>

        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7c5cff]/20 text-[#a78bfa] text-[10px] font-bold">
                    {user.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user.email?.split('@')[0]}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-2xl p-2 shadow-2xl space-y-1 text-xs font-medium animate-in fade-in slide-in-from-top-1 z-50">
                    <div className="px-3 py-2 border-b border-white/5 text-[11px] text-zinc-400 truncate">
                      Signed in as<br />
                      <strong className="text-white text-xs">{user.email}</strong>
                    </div>

                    <Link
                      href="/app"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-[#a78bfa]" />
                      <span>Workspace</span>
                    </Link>

                    <Link
                      href="/app/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <User className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Account Profile</span>
                    </Link>

                    <form action="/api/auth/signout" method="POST">
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>

              <Link
                href="/app"
                className="group inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all active:scale-95 shadow-sm"
              >
                <span>Workspace</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                Sign In
              </Link>

              {onOpenWaitlistModal ? (
                <button
                  type="button"
                  onClick={onOpenWaitlistModal}
                  className="group inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all active:scale-95 shadow-sm"
                >
                  <span>Early Access</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              ) : (
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all active:scale-95 shadow-sm"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
          className="sm:hidden text-zinc-400 hover:text-white p-1"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5 text-zinc-300" />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="sm:hidden fixed top-20 left-4 right-4 rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-2xl p-6 shadow-2xl space-y-4 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          {user ? (
            <div className="space-y-2.5">
              <div className="px-1 text-xs text-zinc-400">
                Signed in as <strong className="text-white">{user.email}</strong>
              </div>
              <Link
                href="/app"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold text-zinc-950 bg-white rounded-xl block"
              >
                Go to Workspace
              </Link>
              <Link
                href="/app/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-semibold text-zinc-300 border border-white/10 rounded-xl block"
              >
                Account Profile
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="w-full py-2 text-center text-xs text-rose-400 hover:underline"
                >
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-2.5">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-semibold text-zinc-300 border border-white/10 rounded-xl block"
              >
                Sign In
              </Link>
              {onOpenWaitlistModal ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenWaitlistModal();
                  }}
                  className="w-full py-2.5 text-center text-xs font-bold text-zinc-950 bg-white rounded-xl"
                >
                  Request Early Access
                </button>
              ) : (
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold text-zinc-950 bg-white rounded-xl block"
                >
                  Create Account
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
