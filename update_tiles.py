import re

with open('src/components/geo/GeoDashboardView.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add MIN_MENTIONS_FOR_CONFIDENCE
text = re.sub(
    r'export default function GeoDashboardView\(\{',
    r'const MIN_MENTIONS_FOR_CONFIDENCE = 5;\n\nexport default function GeoDashboardView({',
    text
)

# 2. Update Brand Mention Rate tile
bm_tile = '''              <div className="bg-surface-container rounded-lg p-space-md flex flex-col justify-between shadow-sm">
                <div className="flex items-start justify-between">
                  <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">Brand Mention Rate</span>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-tertiary/15 text-tertiary font-label-mono-sm text-label-mono-sm font-medium">
                    <TrendingUp className="h-3 w-3" />
                    rate
                  </span>
                </div>
                <div className="py-space-xs">
                  <span className="text-[32px] leading-9 font-extrabold text-on-surface">{hasRuns ? `${metrics.brandMentionRate}%` : '--%'}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-tertiary h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, metrics.brandMentionRate)}%` }} />
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {hasRuns ? `based on ${metrics.isKnowledgeOnlyEstimate ? metrics.totalRuns : metrics.groundedRunsCount} ${metrics.isKnowledgeOnlyEstimate ? 'runs' : 'grounded runs'}` : 'Recommended in AI answers'}
                  </p>
                </div>
              </div>'''
text = re.sub(
    r'<div className="bg-surface-container rounded-lg p-space-md flex flex-col justify-between shadow-sm">\s*<div className="flex items-start justify-between">\s*<span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">Brand Mention Rate</span>.*?<p className="font-body-sm text-body-sm text-on-surface-variant truncate">Recommended in AI answers</p>\s*</div>\s*</div>',
    bm_tile,
    text,
    flags=re.DOTALL
)

# 3. Update Share of Voice tile
sov_tile = '''              <div className="bg-surface-container rounded-lg p-space-md flex flex-col justify-between shadow-sm">
                <div className="flex items-start justify-between">
                  <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">Share of Voice</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-container-high text-secondary font-label-mono-sm text-label-mono-sm">
                    vs {competitors.length} rivals
                  </span>
                </div>
                <div className="py-space-xs">
                  <span className="text-[32px] leading-9 font-extrabold text-on-surface">{hasRuns ? `${metrics.shareOfVoice}%` : '--%'}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                    <div className="bg-tertiary h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, metrics.shareOfVoice)}%` }} />
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {hasRuns ? `based on ${metrics.isKnowledgeOnlyEstimate ? metrics.totalRuns : metrics.groundedRunsCount} ${metrics.isKnowledgeOnlyEstimate ? 'runs' : 'grounded runs'}` : 'Your slice of the AI conversation'}
                  </p>
                </div>
              </div>'''
text = re.sub(
    r'<div className="bg-surface-container rounded-lg p-space-md flex flex-col justify-between shadow-sm">\s*<div className="flex items-start justify-between">\s*<span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">Share of Voice</span>.*?<p className="font-body-sm text-body-sm text-on-surface-variant truncate">Your slice of the AI conversation</p>\s*</div>\s*</div>',
    sov_tile,
    text,
    flags=re.DOTALL
)

# 4. Update Top Citations tile
cit_tile = '''              <div className="bg-surface-container rounded-lg p-space-md flex flex-col justify-between shadow-sm">
                <div className="flex items-start justify-between">
                  <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">Top Citations</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface font-label-mono-sm text-label-mono-sm">
                    {hasRuns ? (metrics.isKnowledgeOnlyEstimate ? '0 grounded' : `${metrics.groundedRunsCount} grounded`) : `${metrics.totalRuns} runs`}
                  </span>
                </div>
                <div className="py-space-xs flex items-baseline justify-between gap-2">
                  <span className="text-[32px] leading-9 font-extrabold text-on-surface">{hasRuns ? metrics.topCitationsCount : '--'}</span>
                  <div className="flex items-center gap-1 flex-wrap justify-end">
                    {metrics.topCitedDomains.slice(0, 2).map((d, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface text-[11px] font-bold truncate max-w-[90px]">{d.domain}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                    <div className="bg-secondary-container h-full rounded-full" style={{ width: metrics.topCitationsCount > 0 ? '85%' : '4%' }} />
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {metrics.topCitedDomains.length > 0 ? 'Web sources citing you' : 'No web links cited yet'}
                  </p>
                </div>
              </div>'''
text = re.sub(
    r'<div className="bg-surface-container rounded-lg p-space-md flex flex-col justify-between shadow-sm">\s*<div className="flex items-start justify-between">\s*<span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">Top Citations</span>.*?<p className="font-body-sm text-body-sm text-on-surface-variant truncate">\s*\{metrics\.topCitedDomains\.length > 0 \? \'Web sources citing you\' : \'No web links cited yet\'\}\s*</p>\s*</div>\s*</div>',
    cit_tile,
    text,
    flags=re.DOTALL
)

# 5. Update Position tile (LOW CONFIDENCE)
pos_tile = '''            <div className="bg-surface-container rounded-lg p-space-md shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">Rank when mentioned</span>
                <Award className="h-4 w-4 text-tertiary" />
              </div>
              <div className="flex items-end gap-space-md py-space-xs">
                <span className={`text-[32px] leading-9 font-extrabold ${sentimentPositioning.totalMentions >= MIN_MENTIONS_FOR_CONFIDENCE ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                  {sentimentPositioning.avgPosition !== null ? `#${sentimentPositioning.avgPosition}` : '—'}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant pb-1">
                  avg{sentimentPositioning.bestPosition !== null ? ` · best #${sentimentPositioning.bestPosition}` : ''}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {sentimentPositioning.totalMentions < MIN_MENTIONS_FOR_CONFIDENCE 
                  ? <span className="text-secondary font-medium">LOW-CONFIDENCE / Provisional (only {sentimentPositioning.totalMentions} mention{sentimentPositioning.totalMentions === 1 ? '' : 's'})</span> 
                  : `Across ${sentimentPositioning.totalMentions} mention${sentimentPositioning.totalMentions === 1 ? '' : 's'} — lower rank is better.`}
              </p>
            </div>'''
text = re.sub(
    r'<div className="bg-surface-container rounded-lg p-space-md shadow-sm flex flex-col justify-between">\s*<div className="flex items-center justify-between">\s*<span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">Rank when mentioned</span>.*?<p className="font-body-sm text-body-sm text-on-surface-variant">\s*Across \{sentimentPositioning\.totalMentions\} mention\{sentimentPositioning\.totalMentions === 1 \? \'\' : \'s\'\} . lower rank is better\.\s*</p>\s*</div>',
    pos_tile,
    text,
    flags=re.DOTALL
)

with open('src/components/geo/GeoDashboardView.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
