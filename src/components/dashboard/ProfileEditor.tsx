'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Building,
  Mail,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Key,
} from 'lucide-react';
import Link from 'next/link';
import { updateUserProfile } from '@/lib/actions/dashboard';
import { createClient } from '@/lib/supabase/client';

interface ProfileEditorProps {
  user: {
    id: string;
    email?: string;
    fullName?: string;
    companyName?: string;
    createdAt?: string;
  };
  organization: {
    id: string;
    name: string;
    role: string;
    createdAt?: string;
  };
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, organization }) => {
  const router = useRouter();

  const [fullName, setFullName] = useState(user.fullName || '');
  const [companyName, setCompanyName] = useState(user.companyName || '');
  const [orgName, setOrgName] = useState(organization.name || '');

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [passwordResetSent, setPasswordResetSent] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setLoading(true);

    try {
      await updateUserProfile({
        fullName,
        companyName,
        orgName,
      });

      setSuccessMessage('Your profile and organization details have been saved successfully.');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!user.email) return;
    try {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/login`,
      });
      setPasswordResetSent(true);
    } catch {
      alert('Failed to send reset email.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <Link
          href="/app"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Workspace</span>
        </Link>

        <span className="text-xs text-zinc-500">
          User ID: <span className="font-mono text-zinc-400">{user.id.slice(0, 8)}...</span>
        </span>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Account & Organization Profile
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400">
          Manage your personal details and workspace identity.
        </p>
      </div>

      {successMessage && (
        <div
          role="alert"
          className="rounded-2xl border border-[#8ce04a]/30 bg-[#8ce04a]/10 p-4 text-xs text-[#a3e635] flex items-center gap-2.5 animate-in fade-in"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#8ce04a]" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center gap-2.5 animate-in fade-in"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="rounded-3xl border border-white/[0.08] bg-zinc-950 p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <User className="h-4 w-4 text-[#8ce04a]" />
              <span>Personal & Workspace Details</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-zinc-400 mb-1" htmlFor="prof-email">
                  Work Email (Primary Login)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    id="prof-email"
                    type="email"
                    disabled
                    value={user.email || ''}
                    className="w-full rounded-xl border border-white/5 bg-white/[0.02] pl-10 pr-3.5 py-2.5 text-zinc-400 cursor-not-allowed font-mono text-[11px]"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">Managed via Supabase Auth</p>
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1" htmlFor="prof-name">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    id="prof-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3.5 py-2.5 text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1" htmlFor="prof-company">
                  Company Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    id="prof-company"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Technologies"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3.5 py-2.5 text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1" htmlFor="prof-org">
                  Organization Workspace Name
                </label>
                <input
                  id="prof-org"
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Workspace"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {loading ? <span>Saving Changes...</span> : <span>Save Changes</span>}
              </button>
            </div>
          </form>

          <div className="rounded-3xl border border-white/[0.08] bg-zinc-950 p-6 sm:p-8 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="h-4 w-4 text-amber-400" />
              <span>Security & Password</span>
            </h2>

            <p className="text-xs text-zinc-400">
              Need to change your password or update your login credentials?
            </p>

            {passwordResetSent ? (
              <div className="rounded-xl border border-[#8ce04a]/30 bg-[#8ce04a]/10 p-3 text-xs text-[#a3e635]">
                Password reset link sent to <strong>{user.email}</strong>. Check your inbox!
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSendPasswordReset}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                <span>Send Password Reset Email</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/[0.08] bg-zinc-950 p-6 shadow-xl space-y-4 text-xs">
            <h3 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#8ce04a]" />
              <span>Workspace Status</span>
            </h3>

            <div className="space-y-2.5 text-zinc-400">
              <div className="flex justify-between">
                <span>Role:</span>
                <strong className="text-white capitalize">{organization.role}</strong>
              </div>
              <div className="flex justify-between">
                <span>Organization:</span>
                <span className="text-zinc-200 font-medium truncate max-w-[140px]">{organization.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Org ID:</span>
                <span className="font-mono text-zinc-500 text-[11px]">{organization.id.slice(0, 13)}...</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5">
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out of SlashSaaS</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
