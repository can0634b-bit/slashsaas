'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export function HeroCTA() {
  const [state, setState] = useState<'loading' | 'anon' | 'free' | 'paid'>('loading');

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function checkPlan() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        if (active) setState('anon');
        return;
      }
      
      const { data: memberData } = await supabase
        .from('memberships')
        .select('org_id')
        .eq('user_id', session.user.id)
        .single();
        
      if (memberData?.org_id) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('plan')
          .eq('id', memberData.org_id)
          .single();
          
        if (active) {
          if (orgData?.plan === 'free') {
             setState('free');
          } else {
             setState('paid');
          }
        }
      } else {
        if (active) setState('anon');
      }
    }
    
    checkPlan();
    return () => { active = false; };
  }, []);

  if (state === 'loading') {
    return <div className="h-12 w-32" aria-hidden />;
  }

  return (
    <div className="flex flex-wrap items-center gap-space-md pt-space-xs w-full sm:w-auto">
      {state !== 'paid' && (
        <Link 
          className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs font-headline-sm text-headline-sm px-space-lg py-space-sm rounded-xl bg-gradient-to-r from-primary-container via-secondary-container to-tertiary text-on-primary shadow-[0_0_24px_rgba(148,125,255,0.4)] hover:shadow-[0_0_35px_rgba(47,217,244,0.6)] hover:-translate-y-0.5 transition-all duration-200" 
          href={state === 'anon' ? "/signup" : "/app"}
        >
          <span>{state === 'anon' ? 'Start free' : 'Go to workspace'}</span>
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </Link>
      )}
      <a 
        className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs font-headline-sm text-headline-sm px-space-lg py-space-sm rounded-xl bg-surface-container/60 hover:bg-surface-container text-on-surface border border-outline-variant/40 hover:border-primary/50 transition-all duration-200 backdrop-blur-md" 
        href="#how-it-works"
      >
        <span className="material-symbols-outlined text-tertiary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
        <span>See how it works</span>
      </a>
    </div>
  );
}
