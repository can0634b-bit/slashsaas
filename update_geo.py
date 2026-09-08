import re

with open('src/lib/supabase/geo.ts', 'r', encoding='utf-8') as f:
    text = f.read()

new_block = '''
  // 5. Compute Metrics (Compute from GROUNDED runs if any exist, fallback to knowledge-only)
  const okRuns = runList.filter((r) => r.status !== 'error');
  const groundedRuns = okRuns.filter((r) => r.citations && r.citations.length > 0);
  
  // Decide which runs constitute the "basis" for headline metrics
  const isKnowledgeOnlyEstimate = groundedRuns.length === 0;
  const basisRuns = isKnowledgeOnlyEstimate ? okRuns : groundedRuns;
  
  const basisRunIds = new Set(basisRuns.map(r => r.id));
  const basisMentions = mentionList.filter(m => basisRunIds.has(m.run_id));
  
  const basisRunsCount = basisRuns.length;
  let selfMentionsCount = 0;
  let competitorMentionsCount = 0;
  let topCitationsCount = 0;
  const domainCitationCounts = new Map<string, number>();

  const selfBrandId = selfBrand?.id;

  for (const m of basisMentions) {
    if (selfBrandId && m.brand_id === selfBrandId) {
      if (m.mentioned) selfMentionsCount++;
      if (m.cited) {
        topCitationsCount++;
        const domain = extractDomainFromUrl(m.citation_url);
        if (domain) {
          domainCitationCounts.set(domain, (domainCitationCounts.get(domain) || 0) + 1);
        }
      }
    } else if (m.mentioned) {
      competitorMentionsCount++;
    }

    if (m.cited && m.citation_url) {
      const domain = extractDomainFromUrl(m.citation_url);
      if (domain && (!selfBrand?.domain || !domain.includes(selfBrand.domain))) {
        domainCitationCounts.set(domain, (domainCitationCounts.get(domain) || 0) + 1);
      }
    }
  }

  const brandMentionRate = basisRunsCount > 0 ? Math.round((selfMentionsCount / basisRunsCount) * 100) : 0;
  const totalMentions = selfMentionsCount + competitorMentionsCount;
  const shareOfVoice = totalMentions > 0 ? Math.round((selfMentionsCount / totalMentions) * 100) : 0;

  const sortedDomains = Array.from(domainCitationCounts.entries())
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const metrics: GeoWorkspaceMetrics = {
    totalRuns: okRuns.length,
    groundedRunsCount: groundedRuns.length,
    isKnowledgeOnlyEstimate,
    brandMentionRate,
    shareOfVoice,
    topCitationsCount,
    topCitedDomains: sortedDomains,
    lastAuditedAt: runList.length > 0 ? runList[0].run_at : null,
  };
'''

text = re.sub(
    r'// 5\. Compute Metrics \(only ok runs contribute to percentage metrics\).*?lastAuditedAt: runList\.length > 0 \? runList\[0\]\.run_at : null,\n  \};',
    new_block.strip(),
    text,
    flags=re.DOTALL
)

with open('src/lib/supabase/geo.ts', 'w', encoding='utf-8') as f:
    f.write(text)
