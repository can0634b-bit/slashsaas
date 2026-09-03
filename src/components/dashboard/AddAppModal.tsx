'use client';

import React, { useState } from 'react';
import { X, Plus, Layers, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { AppCategory, BillingCycle, DetectedApp } from '@/lib/types/dashboard';
import { createDetectedApp, updateDetectedApp } from '@/lib/actions/dashboard';

interface AddAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingApp?: DetectedApp | null;
}

export const AddAppModal: React.FC<AddAppModalProps> = ({
  isOpen,
  onClose,
  editingApp = null,
}) => {
  const [appName, setAppName] = useState(editingApp?.app_name || '');
  const [category, setCategory] = useState<AppCategory>(editingApp?.category || 'saas');
  const [monthlySeatCost, setMonthlySeatCost] = useState(
    editingApp?.monthly_seat_cost ? String(editingApp.monthly_seat_cost) : '30'
  );
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    editingApp?.billing_cycle || 'monthly'
  );
  const [seatsTotal, setSeatsTotal] = useState(
    editingApp?.seats_total ? String(editingApp.seats_total) : '10'
  );
  const [renewalDate, setRenewalDate] = useState(editingApp?.renewal_date || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!appName.trim()) {
      setError('App / Tool name is required.');
      return;
    }

    setLoading(true);

    try {
      if (editingApp) {
        await updateDetectedApp(editingApp.id, {
          app_name: appName.trim(),
          category,
          monthly_seat_cost: parseFloat(monthlySeatCost) || 0,
          billing_cycle: billingCycle,
          renewal_date: renewalDate ? renewalDate : null,
          seats_total: parseInt(seatsTotal, 10) || 1,
        });
      } else {
        await createDetectedApp({
          app_name: appName.trim(),
          category,
          monthly_seat_cost: parseFloat(monthlySeatCost) || 0,
          billing_cycle: billingCycle,
          renewal_date: renewalDate ? renewalDate : null,
          seats_total: parseInt(seatsTotal, 10) || 1,
        });
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save tool subscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-6 sm:p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8ce04a]/10 text-[#8ce04a] border border-[#8ce04a]/30">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {editingApp ? 'Edit Subscription Tool' : 'Add Monitored Tool / SaaS'}
            </h2>
            <p className="text-xs text-zinc-400">
              Track license costs and renewal cycles for real waste detection.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Tool Name */}
          <div>
            <label className="block font-medium text-zinc-300 mb-1" htmlFor="tool-name">
              Tool Name <span className="text-[#8ce04a]">*</span>
            </label>
            <input
              id="tool-name"
              type="text"
              required
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="e.g. Figma, Notion, ChatGPT Team, GitHub Copilot"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
            />
          </div>

          {/* Category & Billing Cycle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1" htmlFor="tool-category">
                Category
              </label>
              <select
                id="tool-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as AppCategory)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-white focus:border-white/30 focus:outline-none"
              >
                <option value="saas">SaaS Core Tool</option>
                <option value="ai">AI / GenAI Subscription</option>
                <option value="shadow">Shadow IT / Unapproved</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1" htmlFor="billing-cycle">
                Billing Cycle
              </label>
              <select
                id="billing-cycle"
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-white focus:border-white/30 focus:outline-none"
              >
                <option value="monthly">Monthly ($/mo)</option>
                <option value="annual">Annual ($/yr billed upfront)</option>
              </select>
            </div>
          </div>

          {/* Seat Cost & Total Seats */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1" htmlFor="seat-cost">
                Cost Per Seat ($ / month)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input
                  id="seat-cost"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={monthlySeatCost}
                  onChange={(e) => setMonthlySeatCost(e.target.value)}
                  placeholder="30"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-8 pr-3 py-2.5 text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1" htmlFor="total-seats">
                Total Purchased Seats
              </label>
              <input
                id="total-seats"
                type="number"
                min="1"
                required
                value={seatsTotal}
                onChange={(e) => setSeatsTotal(e.target.value)}
                placeholder="10"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
              />
            </div>
          </div>

          {/* Renewal Date */}
          <div>
            <label className="block font-medium text-zinc-300 mb-1" htmlFor="renewal-date">
              Upcoming Renewal Date <span className="text-zinc-500 text-[10px]">(Optional — enables Renewal Radar)</span>
            </label>
            <div className="relative">
              <input
                id="renewal-date"
                type="date"
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-white focus:border-white/30 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3 font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <span>Saving Tool...</span>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>{editingApp ? 'Update Subscription' : 'Add Tool to Catalog'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
