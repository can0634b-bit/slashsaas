'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Mail, User, Building, Layers, Calendar, AlertCircle, Edit2 } from 'lucide-react';
import { DetectedApp, Seat } from '@/lib/types/dashboard';
import { createSeat, updateSeat } from '@/lib/actions/dashboard';

interface AddSeatModalProps {
  isOpen: boolean;
  onClose: () => void;
  apps: DetectedApp[];
  editingSeat?: Seat | null;
}

export const AddSeatModal: React.FC<AddSeatModalProps> = ({
  isOpen,
  onClose,
  apps,
  editingSeat = null,
}) => {
  const [email, setEmail] = useState(editingSeat?.email || '');
  const [name, setName] = useState(editingSeat?.name || '');
  const [department, setDepartment] = useState(editingSeat?.department || 'Engineering');
  const [appId, setAppId] = useState(editingSeat?.app_id || '');
  const [lastActiveDate, setLastActiveDate] = useState(
    editingSeat?.last_active_at ? editingSeat.last_active_at.split('T')[0] : ''
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state whenever modal opens or editingSeat changes
  useEffect(() => {
    if (isOpen) {
      if (editingSeat) {
        setEmail(editingSeat.email || '');
        setName(editingSeat.name || '');
        setDepartment(editingSeat.department || 'Engineering');
        setAppId(editingSeat.app_id || '');
        setLastActiveDate(
          editingSeat.last_active_at ? editingSeat.last_active_at.split('T')[0] : ''
        );
      } else {
        setEmail('');
        setName('');
        setDepartment('Engineering');
        setAppId(apps[0]?.id || '');
        setLastActiveDate('');
      }
      setError(null);
    }
  }, [isOpen, editingSeat, apps]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid employee email address.');
      return;
    }

    setLoading(true);

    try {
      if (editingSeat) {
        await updateSeat(editingSeat.id, {
          email: email.trim(),
          name: name.trim() || undefined,
          department: department.trim() || undefined,
          app_id: appId ? appId : null,
          last_active_at: lastActiveDate ? lastActiveDate : null,
        });
      } else {
        await createSeat({
          email: email.trim(),
          name: name.trim() || undefined,
          department: department.trim() || undefined,
          app_id: appId ? appId : null,
          last_active_at: lastActiveDate ? lastActiveDate : null,
        });
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save seat.');
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
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            {editingSeat ? <Edit2 className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {editingSeat ? 'Edit Employee Seat & Assignment' : 'Add Monitored Employee Seat'}
            </h2>
            <p className="text-xs text-zinc-400">
              Assign a SaaS/AI tool to calculate exact monthly waste.
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
          <div>
            <label className="block font-medium text-zinc-300 mb-1" htmlFor="seat-email">
              Work Email <span className="text-[#8ce04a]">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                id="seat-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-3.5 py-2.5 text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1" htmlFor="seat-name">
                Full Name <span className="text-zinc-500 text-[10px]">(Optional)</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input
                  id="seat-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Jenkins"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-3 py-2.5 text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1" htmlFor="seat-dept">
                Department
              </label>
              <select
                id="seat-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-white focus:border-white/30 focus:outline-none"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="Executive">Executive</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1" htmlFor="seat-app">
                Assigned SaaS / AI Tool
              </label>
              <select
                id="seat-app"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="w-full rounded-xl border border-[#8ce04a]/30 bg-zinc-900 px-3 py-2.5 text-white focus:border-[#8ce04a] focus:outline-none font-medium"
              >
                <option value="">-- Unassigned ($0/mo) --</option>
                {apps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.app_name} (${app.monthly_seat_cost}/seat/mo)
                  </option>
                ))}
              </select>
              {apps.length === 0 && (
                <p className="text-[10px] text-amber-400 mt-1">
                  No tools created yet. Add a tool in the Subscriptions section below.
                </p>
              )}
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1" htmlFor="seat-last-active">
                Last Active Date
              </label>
              <input
                id="seat-last-active"
                type="date"
                value={lastActiveDate}
                onChange={(e) => setLastActiveDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-white focus:border-white/30 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3 font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? <span>Saving Seat...</span> : <span>{editingSeat ? 'Update Seat' : 'Assign Seat'}</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
