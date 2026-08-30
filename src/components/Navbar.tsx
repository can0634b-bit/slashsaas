'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';
import { SlashLogo } from './Logo';

interface NavbarProps {
  onOpenAuthModal: (mode: 'signin' | 'signup') => void;
  onOpenUpgradeModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal, onOpenUpgradeModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 sm:px-6">
      <nav className="w-full max-w-6xl rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-xl px-5 py-3 shadow-2xl shadow-black/60 flex items-center justify-between transition-all">
        {/* Official Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group hover:opacity-90 transition-opacity">
          <SlashLogo size="md" />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-400">
          <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#calculator" className="hover:text-white transition-colors">Savings Calculator</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => onOpenAuthModal('signin')}
            className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            Sign In
          </button>
          
          <button
            onClick={() => onOpenAuthModal('signup')}
            className="group inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all active:scale-95 shadow-sm"
          >
            <span>Get Started</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
          <a href="#security" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-300 hover:text-white py-1">Security</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-300 hover:text-white py-1">Pricing</a>
          <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-300 hover:text-white py-1">FAQ</a>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAuthModal('signin'); }}
              className="w-full py-2.5 text-center text-xs font-semibold text-zinc-300 border border-white/10 rounded-xl"
            >
              Sign In
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAuthModal('signup'); }}
              className="w-full py-2.5 text-center text-xs font-bold text-zinc-950 bg-white rounded-xl"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
