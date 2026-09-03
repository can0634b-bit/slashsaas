'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Menu, X, User, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { SlashLogo } from './Logo';
import { createClient } from '@/lib/supabase/client';

interface NavbarProps {
  onOpenWaitlistModal: (plan?: 'growth' | 'scale' | 'audit' | 'signin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenWaitlistModal }) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string; id: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ email: session.user.email, id: session.user.id });
      } else {
        setUser(null);
      }
    });

    // 2. Subscribe to auth state changes
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

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 sm:px-6">
      <nav className="w-full max-w-6xl rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl px-5 py-3 shadow-2xl shadow-black/60 flex items-center justify-between transition-all">
        {/* Official Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group hover:opacity-90 transition-opacity">
          <SlashLogo size="md" />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-400">
          <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#calculator" className="hover:text-white transition-colors">Savings Calculator</a>
          <a href="#comparisons" className="hover:text-white transition-colors">Why SlashSaaS</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            /* Authenticated User Menu */
            <div className="flex items-center gap-2.5">
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8ce04a]/20 text-[#8ce04a] text-[10px] font-bold">
                    {user.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user.email?.split('@')[0]}</span>
                </button>

                {/* Account Dropdown */}
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
                      <LayoutDashboard className="h-3.5 w-3.5 text-[#8ce04a]" />
                      <span>Radar Dashboard</span>
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
                <span>Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          ) : (
            /* Unauthenticated Menu */
            <>
              <Link
                href="/login"
                className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                Sign In
              </Link>

              <button
                type="button"
                onClick={() => onOpenWaitlistModal('audit')}
                className="group inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all active:scale-95 shadow-sm"
              >
                <span>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
          className="md:hidden text-zinc-400 hover:text-white p-1"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5 text-zinc-300" />}
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-20 left-4 right-4 rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-2xl p-6 shadow-2xl space-y-4 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <a href="#solutions" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-300 hover:text-white py-1">Solutions</a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-300 hover:text-white py-1">How It Works</a>
          <a href="#calculator" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-300 hover:text-white py-1">Savings Calculator</a>
          <a href="#comparisons" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-300 hover:text-white py-1">Why SlashSaaS</a>
          <a href="#security" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-300 hover:text-white py-1">Security</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-300 hover:text-white py-1">Pricing</a>
          <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-300 hover:text-white py-1">FAQ</a>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
            {user ? (
              <>
                <div className="px-1 text-xs text-zinc-400">
                  Signed in as <strong className="text-white">{user.email}</strong>
                </div>
                <Link
                  href="/app"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold text-zinc-950 bg-white rounded-xl block"
                >
                  Go to Dashboard
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
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-semibold text-zinc-300 border border-white/10 rounded-xl block"
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); onOpenWaitlistModal('audit'); }}
                  className="w-full py-2.5 text-center text-xs font-bold text-zinc-950 bg-white rounded-xl"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
