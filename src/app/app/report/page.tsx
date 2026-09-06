import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getCurrentOrg, getGeoWorkspaceData } from '@/lib/supabase/geo';
import { ReportPrintButton } from '@/components/geo/ReportPrintButton';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Visibility Report',
  robots: { index: false, follow: false },
};

/**
 * Print-friendly, shareable AI Visibility report. Deliberately LIGHT-themed
 * (not the dark app theme) so it prints and exports to PDF cleanly and reads
 * like a professional document a customer can forward to their team.
 */
export default async function ReportPage() {
  let organization;
  try {
    const context = await getCurrentOrg();
    organization = context.org;
  } catch {
    redirect('/login?redirect=/app/report');
  }

  const { selfBrand, competitors, metrics, citationIntelligence, sentimentPositioning, visibilityChanges } =
    await getGeoWorkspaceData(organization.id);

  if (!selfBrand) redirect('/app');

  const generatedAt = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const summary = [
    { label: 'Mention Rate', value: metrics.totalRuns > 0 ? `${metrics.brandMentionRate}%` : '—' },
    { label: 'Share of Voice', value: metrics.totalRuns > 0 ? `${metrics.shareOfVoice}%` : '—' },
    { label: 'Avg. Rank', value: sentimentPositioning.avgPosition !== null ? `#${sentimentPositioning.avgPosition}` : '—' },
    { label: 'Audits Run', value: String(metrics.totalRuns) },
  ];

  return (
    <div className="min-h-screen bg-zinc-100 print:bg-white py-8 px-4 text-zinc-900">
      <div className="max-w-3xl mx-auto">
        {/* Toolbar — screen only */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link href="/app" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
            ← Back to workspace
          </Link>
          <ReportPrintButton />
        </div>

        {/* Report document */}
        <div className="bg-white rounded-xl shadow-sm print:shadow-none border border-zinc-200 print:border-0 p-8 sm:p-10 space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-6">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-violet-600 mb-1">
                SlashSaaS · AI Search Visibility
              </div>
              <h1 className="text-2xl font-black tracking-tight">{selfBrand.name}</h1>
              {selfBrand.domain && <p className="text-sm text-zinc-500 mt-0.5">{selfBrand.domain}</p>}
            </div>
            <div className="text-right text-sm text-zinc-500 shrink-0">
              <div className="font-semibold text-zinc-900">Visibility Report</div>
              <div>{generatedAt}</div>
            </div>
          </div>

          {/* Summary metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {summary.map((m, i) => (
              <div key={i} className="rounded-lg bg-zinc-50 border border-zinc-200 p-4">
                <div className="text-[11px] uppercase tracking-wide text-zinc-500">{m.label}</div>
                <div className="text-2xl font-extrabold mt-1 tabular-nums">{m.value}</div>
              </div>
            ))}
          </div>

          {/* Citation sources */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-700 mb-3">Where the AI gets its answers</h2>
            {citationIntelligence.sources.length === 0 ? (
              <p className="text-sm text-zinc-500">No citation sources recorded yet — run grounded audits to populate this.</p>
            ) : (
              <ol className="space-y-1.5">
                {citationIntelligence.sources.slice(0, 8).map((s, i) => (
                  <li key={i} className="flex items-center justify-between text-sm border-b border-zinc-100 pb-1.5">
                    <span className="truncate pr-3">
                      <span className="text-zinc-400 mr-2">{i + 1}.</span>
                      {s.label}
                      {s.isSelf && <span className="ml-1.5 text-violet-600 font-semibold">(you)</span>}
                    </span>
                    <span className="text-zinc-500 shrink-0">{s.count}×</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Sentiment & positioning */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-700 mb-3">Sentiment &amp; positioning</h2>
            {sentimentPositioning.totalMentions === 0 ? (
              <p className="text-sm text-zinc-500">No brand mentions to analyze yet.</p>
            ) : (
              <p className="text-sm text-zinc-700 leading-relaxed">
                Across <strong>{sentimentPositioning.totalMentions}</strong> mention
                {sentimentPositioning.totalMentions === 1 ? '' : 's'}: {sentimentPositioning.positive} positive,{' '}
                {sentimentPositioning.neutral} neutral, {sentimentPositioning.negative} negative — mostly{' '}
                <strong className="capitalize">{sentimentPositioning.dominant}</strong>.
                {sentimentPositioning.avgPosition !== null && (
                  <>
                    {' '}
                    Average rank when mentioned: <strong>#{sentimentPositioning.avgPosition}</strong>
                    {sentimentPositioning.bestPosition !== null && <> (best #{sentimentPositioning.bestPosition})</>}.
                  </>
                )}
              </p>
            )}
          </section>

          {/* Recent changes */}
          {visibilityChanges.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-700 mb-3">Recent changes</h2>
              <ul className="space-y-1.5">
                {visibilityChanges.slice(0, 6).map((c, i) => (
                  <li key={i} className="text-sm text-zinc-700">
                    <strong>{c.promptText}:</strong> {c.detail}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Competitors tracked */}
          {competitors.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-700 mb-3">Competitors tracked</h2>
              <p className="text-sm text-zinc-700">{competitors.map((c) => c.name).join(' · ')}</p>
            </section>
          )}

          {/* Footer */}
          <div className="border-t border-zinc-200 pt-6 text-[11px] text-zinc-400 leading-relaxed">
            Generated by SlashSaaS · AI Search Visibility monitoring on {generatedAt}. Based only on public AI-answer
            data — no private, account, or personal data is collected.
          </div>
        </div>
      </div>
    </div>
  );
}
