'use client';

import React from 'react';
import { Quote, TrendingDown, Sparkles, Info } from 'lucide-react';
import { TESTIMONIALS_DATA } from '@/lib/testimonialsData';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-24 border-t border-white/[0.06] bg-zinc-950/30 relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8ce04a]">
            Modeled Impact & Scenarios
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            What Early Access Teams Will See
          </h2>
          <p className="mt-3 text-zinc-400 text-xs sm:text-sm flex items-center justify-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-[#8ce04a] shrink-0" />
            <span>Illustrative examples based on benchmark data — real design-partner results coming soon.</span>
          </p>
        </div>

        {/* 3 Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS_DATA.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-white/[0.08] bg-zinc-950/80 p-6 sm:p-8 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl relative group"
            >
              <div>
                {/* Top Metrics Row */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06] text-xs">
                  <span className="inline-flex items-center gap-1 text-[#8ce04a] font-bold">
                    <TrendingDown className="h-3.5 w-3.5" />
                    {item.annualSavings}
                  </span>

                  {item.isIllustrative ? (
                    <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                      Illustrative
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#8ce04a]/10 border border-[#8ce04a]/20 px-2 py-0.5 text-[9px] font-bold text-[#a3e635]">
                      Verified Customer
                    </span>
                  )}
                </div>

                <Quote className="h-6 w-6 text-white/20 mb-3" />

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed italic mb-6">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                    {item.avatarText}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{item.author}</h3>
                    <p className="text-[11px] text-zinc-400">{item.role}</p>
                    <span className="inline-block text-[10px] text-[#a3e635] bg-[#8ce04a]/10 px-1.5 py-0.2 rounded border border-[#8ce04a]/20 mt-0.5">
                      {item.companyBadge}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
