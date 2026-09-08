import re

with open('src/components/geo/GeoDashboardView.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the "Engine: Live · Grounded" static span in the telemetry sub-bar
telemetry_replace = '''          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-tertiary">
            <span className="flex items-center gap-1.5"><span className="text-tertiary">#</span></span>
            <span>Engine: Live · {citationIntelligence.runsWithCitations > 0 ? 'Grounded' : 'Knowledge-only — grounding unavailable'}</span>
          </div>'''
text = re.sub(
    r'<div className="flex items-center gap-1\.5 px-2\.5 py-1 rounded-full bg-surface-container-high text-tertiary">\s*<span className="flex items-center gap-1\.5"><span className="text-tertiary">#</span></span>\s*<span>Engine: Live . Grounded</span>\s*</div>',
    telemetry_replace,
    text
)

# Replace the other static span near AI Search Visibility Score
score_badge_replace = '''                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-mono-sm text-label-mono-sm font-medium ${metrics.isKnowledgeOnlyEstimate ? 'bg-surface-container-high text-on-surface-variant' : 'bg-surface-container-high text-primary'}`}>
                  <Sparkles className={`h-3 w-3 ${metrics.isKnowledgeOnlyEstimate ? 'text-outline' : 'text-tertiary'}`} />
                  {metrics.isKnowledgeOnlyEstimate ? 'No grounded data yet — knowledge-only estimate' : 'Engine: Live · Grounded'}
                </span>'''
text = re.sub(
    r'<span className="inline-flex items-center gap-1 px-2\.5 py-0\.5 rounded-full bg-surface-container-high text-primary font-label-mono-sm text-label-mono-sm font-medium">\s*<Sparkles className="h-3 w-3 text-tertiary" />\s*Engine: Live . Grounded\s*</span>',
    score_badge_replace,
    text
)

with open('src/components/geo/GeoDashboardView.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated dashboard static badges")
