'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { BentoGrid } from '@/components/BentoGrid';
import { HowItWorks } from '@/components/HowItWorks';
import { RoiCalculator } from '@/components/RoiCalculator';
import { SecuritySection } from '@/components/SecuritySection';
import { Pricing } from '@/components/Pricing';
import { FaqSection } from '@/components/FaqSection';
import { CtaSection } from '@/components/CtaSection';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';

export default function HomePage() {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signup',
  });

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signup') => {
    setAuthModal({ isOpen: true, mode });
  };

  const handleCloseAuth = () => {
    setAuthModal(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-white selection:text-black font-sans antialiased">
      {/* Top Floating Glassmorphic Navbar */}
      <Navbar onOpenAuthModal={handleOpenAuth} />

      {/* Main Sections */}
      <main>
        <Hero onOpenAuthModal={() => handleOpenAuth('signup')} />
        <BentoGrid />
        <HowItWorks />
        <RoiCalculator onOpenAuthModal={() => handleOpenAuth('signup')} />
        <SecuritySection />
        <Pricing onOpenAuthModal={() => handleOpenAuth('signup')} />
        <FaqSection />
        <CtaSection onOpenAuthModal={() => handleOpenAuth('signup')} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Authentication / Free Trial Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        mode={authModal.mode}
        onClose={handleCloseAuth}
      />
    </div>
  );
}
