'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { BentoGrid } from '@/components/BentoGrid';
import { HowItWorks } from '@/components/HowItWorks';
import { RoiCalculator } from '@/components/RoiCalculator';
import { ComparisonTable } from '@/components/ComparisonTable';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { SecuritySection } from '@/components/SecuritySection';
import { Pricing } from '@/components/Pricing';
import { FaqSection } from '@/components/FaqSection';
import { CtaSection } from '@/components/CtaSection';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { WaitlistModal } from '@/components/WaitlistModal';
import { LemonSqueezyModal } from '@/components/LemonSqueezyModal';
import { CookieBanner } from '@/components/CookieBanner';

export default function LandingPage() {
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | null>(null);
  const [waitlistPlan, setWaitlistPlan] = useState<'growth' | 'scale' | 'audit' | null>(null);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [isLemonModalOpen, setIsLemonModalOpen] = useState(false);

  const handleOpenWaitlist = (plan: 'growth' | 'scale' | 'audit' = 'audit') => {
    setWaitlistPlan(plan);
    setIsWaitlistOpen(true);
  };

  const handleSelectPlan = (plan: 'growth' | 'scale') => {
    const growthUrl = process.env.NEXT_PUBLIC_LEMONSQUEEZY_GROWTH_URL;
    const scaleUrl = process.env.NEXT_PUBLIC_LEMONSQUEEZY_SCALE_URL;
    const checkoutUrl = plan === 'growth' ? growthUrl : scaleUrl;

    if (checkoutUrl && checkoutUrl.trim().length > 0) {
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback to waitlist modal with pre-selected plan
      handleOpenWaitlist(plan);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Floating Glass Navigation */}
      <Navbar
        onOpenAuthModal={(mode) => setAuthModalMode(mode)}
        onOpenWaitlistModal={() => handleOpenWaitlist('audit')}
      />

      {/* Main Sections */}
      <main>
        <Hero
          onOpenWaitlistModal={() => handleOpenWaitlist('audit')}
        />
        <BentoGrid />
        <HowItWorks />
        <RoiCalculator onOpenWaitlistModal={() => handleOpenWaitlist('audit')} />
        <ComparisonTable />
        <TestimonialsSection />
        <SecuritySection />
        <Pricing
          onSelectPlan={handleSelectPlan}
        />
        <FaqSection />
        <CtaSection
          onOpenWaitlistModal={() => handleOpenWaitlist('audit')}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Early Access / Lead Capture Waitlist Modal */}
      <WaitlistModal
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        initialPlan={waitlistPlan}
      />

      {/* Auth Modal for Sign In */}
      <AuthModal
        isOpen={!!authModalMode}
        mode={authModalMode || 'signin'}
        onClose={() => setAuthModalMode(null)}
      />

      {/* LemonSqueezy Checkout Modal */}
      <LemonSqueezyModal
        isOpen={isLemonModalOpen}
        onClose={() => setIsLemonModalOpen(false)}
      />

      {/* GDPR Cookie / Privacy Consent Banner */}
      <CookieBanner />
    </div>
  );
}
