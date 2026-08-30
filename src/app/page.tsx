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
import { LemonSqueezyModal } from '@/components/LemonSqueezyModal';

export default function LandingPage() {
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | null>(null);
  const [isLemonModalOpen, setIsLemonModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Floating Glass Navigation */}
      <Navbar
        onOpenAuthModal={(mode) => setAuthModalMode(mode)}
        onOpenUpgradeModal={() => setIsLemonModalOpen(true)}
      />

      {/* Main Sections */}
      <main>
        <Hero onOpenAuthModal={() => setAuthModalMode('signup')} />
        <BentoGrid />
        <HowItWorks />
        <RoiCalculator onOpenAuthModal={() => setAuthModalMode('signup')} />
        <SecuritySection />
        <Pricing
          onSelectPlan={() => setIsLemonModalOpen(true)}
        />
        <FaqSection />
        <CtaSection onOpenAuthModal={() => setAuthModalMode('signup')} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={!!authModalMode}
        mode={authModalMode || 'signup'}
        onClose={() => setAuthModalMode(null)}
      />

      {/* LemonSqueezy Checkout Modal */}
      <LemonSqueezyModal
        isOpen={isLemonModalOpen}
        onClose={() => setIsLemonModalOpen(false)}
      />
    </div>
  );
}
