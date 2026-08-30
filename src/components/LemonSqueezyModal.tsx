'use client';

import React, { useState } from 'react';
import { X, Check, ShieldCheck, Zap, Lock, CreditCard, Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LemonSqueezyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (plan: 'growth' | 'scale') => void;
}

export const LemonSqueezyModal: React.FC<LemonSqueezyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedPlan, setSelectedPlan] = useState<'growth' | 'scale'>('growth');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const basePrice = selectedPlan === 'growth' ? (billingInterval === 'annual' ? 39 : 49) : (billingInterval === 'annual' ? 95 : 119);
  const finalPrice = discountApplied ? Math.round(basePrice * 0.8) : basePrice;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'LAUNCH20' || couponCode.toUpperCase() === 'SLASH20') {
      setDiscountApplied(true);
    } else {
      alert('Invalid coupon code. Try code: SLASH20');
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'lemonsqueezy',
          planId: selectedPlan,
          billingInterval,
          discountApplied,
        }),
      });
      const data = await res.json();
      
      // Simulate successful checkout activation
      setTimeout(() => {
        setLoading(false);
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399', '#6ee7b7', '#ffffff']
          });
        } catch {}

        if (onSuccess) onSuccess(selectedPlan);
        onClose();
      }, 1000);

    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-6 sm:p-8 shadow-2xl shadow-black/90">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-950 font-black text-sm">
            /S
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Upgrade to SlashSaaS Pro</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                LemonSqueezy Secure
              </span>
            </h3>
            <p className="text-xs text-zinc-400">Autonomous SaaS waste elimination for modern teams</p>
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-1 flex items-center">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              billingInterval === 'monthly' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingInterval('annual')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              billingInterval === 'annual' ? 'bg-white text-zinc-950 font-bold shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Annual Billing</span>
            <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded-full ${
              billingInterval === 'annual' ? 'bg-zinc-900 text-emerald-400 font-bold' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              Save 20%
            </span>
          </button>
        </div>

        {/* Plan Selection Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Growth Plan */}
          <div
            onClick={() => setSelectedPlan('growth')}
            className={`cursor-pointer rounded-2xl border p-4 transition-all flex flex-col justify-between ${
              selectedPlan === 'growth'
                ? 'border-emerald-500/60 bg-emerald-500/[0.06] shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-white">Growth Plan</h4>
                {selectedPlan === 'growth' && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
              </div>
              <p className="text-[11px] text-zinc-400 mb-3">Up to 60 team seats</p>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-white">
                ${billingInterval === 'annual' ? 39 : 49}
              </span>
              <span className="text-[10px] text-zinc-400">/mo</span>
            </div>
          </div>

          {/* Scale Plan */}
          <div
            onClick={() => setSelectedPlan('scale')}
            className={`cursor-pointer rounded-2xl border p-4 transition-all flex flex-col justify-between ${
              selectedPlan === 'scale'
                ? 'border-emerald-500/60 bg-emerald-500/[0.06] shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-white">Scale Plan</h4>
                {selectedPlan === 'scale' && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
              </div>
              <p className="text-[11px] text-zinc-400 mb-3">Unlimited team seats</p>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-white">
                ${billingInterval === 'annual' ? 95 : 119}
              </span>
              <span className="text-[10px] text-zinc-400">/mo</span>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="rounded-2xl border border-white/[0.06] bg-black/40 p-4 mb-6 text-xs text-zinc-300 space-y-2">
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span>Continuous 24/7 background OAuth & SAML token audit</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span>1-Click automated Slack bot license recovery DMs</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span>Official CFO & Board-ready CSV audit exports</span>
          </div>
        </div>

        {/* Coupon Code Input */}
        <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-6">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Promo code (e.g. SLASH20)"
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none uppercase"
          />
          <button
            type="submit"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
          >
            Apply
          </button>
        </form>

        {/* Checkout Button via LemonSqueezy */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-xs sm:text-sm font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.99]"
        >
          {loading ? (
            <span>Connecting to LemonSqueezy...</span>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" />
              <span>Complete Payment (${finalPrice}/mo)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>

        {/* Security Trust Note */}
        <div className="mt-4 text-center text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Processed securely via LemonSqueezy Merchant of Record with 256-bit encryption.</span>
        </div>
      </div>
    </div>
  );
};
