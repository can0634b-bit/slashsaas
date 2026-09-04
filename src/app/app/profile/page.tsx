import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateUserOrganization } from '@/lib/supabase/organizations';
import { SlashLogo } from '@/components/Logo';
import { ProfileEditor } from '@/components/dashboard/ProfileEditor';
import { LogOut, Building2, LayoutDashboard } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/app/profile');
  }

  const organization = await getOrCreateUserOrganization(user);
  if (!organization) {
    redirect('/login');
  }

  const userDisplayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const orgDisplayName = organization.name || `${userDisplayName}'s Organization`;

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col selection:bg-white selection:text-black">
      {/* Top Application Header */}
      <header className="border-b border-white/[0.08] bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/app" className="hover:opacity-90 transition-opacity">
              <SlashLogo size="sm" />
            </Link>

            <span className="text-zinc-700 hidden sm:inline">|</span>

            {/* Workspace Link */}
            <Link
              href="/app"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-[#8ce04a]" />
              <span>Workspace</span>
            </Link>

            {/* Organization Selector / Label */}
            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-zinc-300">
              <Building2 className="h-3.5 w-3.5 text-[#8ce04a]" />
              <span>{orgDisplayName}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User Profile info */}
            <div className="flex items-center gap-2 text-right text-xs">
              <span className="font-semibold text-zinc-300">{user.email}</span>
            </div>

            {/* Sign Out Form */}
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Profile Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <ProfileEditor
          user={{
            id: user.id,
            email: user.email,
            fullName: user.user_metadata?.full_name,
            companyName: user.user_metadata?.company_name,
            createdAt: user.created_at,
          }}
          organization={{
            id: organization.id,
            name: organization.name,
            role: 'Owner',
            createdAt: organization.created_at,
          }}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-zinc-600">
        <p>SlashSaaS Foundation v2.0 • Supabase PostgreSQL & Auth</p>
      </footer>
    </div>
  );
}
