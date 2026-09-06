import {
  Brand,
  Prompt,
  GeoWorkspaceMetrics,
  PromptAuditSummary,
  VisibilityTrendPoint,
} from '@/lib/types';

export type RecommendationKind = 'opportunity' | 'warning' | 'win' | 'setup';

export interface Recommendation {
  id: string;
  kind: RecommendationKind;
  title: string;
  detail: string;
  priority: number; // higher = surfaced first
}

export interface RecommendationInput {
  brandName: string;
  metrics: GeoWorkspaceMetrics;
  prompts: Prompt[];
  promptSummaries: Record<string, PromptAuditSummary>;
  competitors: Brand[];
  visibilityTrend: VisibilityTrendPoint[];
}

/**
 * Turns the workspace's audit data into a prioritized, actionable plan.
 * Pure + deterministic (no I/O), computed from public data only. This is the
 * "so what do I do?" layer on top of the raw visibility metrics.
 */
export function computeRecommendations(input: RecommendationInput): Recommendation[] {
  const { brandName, metrics, prompts, promptSummaries, competitors, visibilityTrend } = input;
  const recs: Recommendation[] = [];
  const hasRuns = metrics.totalRuns > 0;

  // ---- Setup nudges ----
  if (!hasRuns) {
    recs.push({
      id: 'first-audit',
      kind: 'setup',
      priority: 100,
      title: 'Run your first audit',
      detail: `Establish a baseline for ${brandName} — click “Run Audit Now” to query the AI engines across your tracked prompts.`,
    });
  }
  if (prompts.length > 0 && prompts.length < 5) {
    recs.push({
      id: 'more-prompts',
      kind: 'setup',
      priority: 42,
      title: 'Track more buyer questions',
      detail: `You're tracking ${prompts.length} prompt${prompts.length === 1 ? '' : 's'}. Add more of the real questions buyers ask AI to get a fuller picture of where you win and lose.`,
    });
  }
  if (competitors.length === 0) {
    recs.push({
      id: 'add-competitors',
      kind: 'setup',
      priority: 46,
      title: 'Add competitors to benchmark',
      detail: `Add the rival brands you compete with so you can measure your share of voice against them in AI answers.`,
    });
  }

  if (hasRuns) {
    // ---- Mention rate ----
    if (metrics.brandMentionRate === 0) {
      recs.push({
        id: 'zero-mention',
        kind: 'opportunity',
        priority: 95,
        title: `AI never recommends ${brandName} yet`,
        detail: `Across every tracked prompt, the AI didn't mention ${brandName}. This is your biggest opportunity: publish authoritative content for these topics and get referenced on the sources the AI trusts in your category.`,
      });
    } else if (metrics.brandMentionRate < 50) {
      recs.push({
        id: 'low-mention',
        kind: 'opportunity',
        priority: 68,
        title: `Lift your ${metrics.brandMentionRate}% mention rate`,
        detail: `${brandName} shows up in some AI answers but not most. Focus on the specific prompts below where rivals are recommended and you aren't.`,
      });
    } else {
      recs.push({
        id: 'strong-mention',
        kind: 'win',
        priority: 20,
        title: `Strong ${metrics.brandMentionRate}% mention rate`,
        detail: `${brandName} is recommended in most AI answers. Keep the winning content fresh and expand into adjacent buyer questions.`,
      });
    }

    // ---- Citations ----
    if (metrics.topCitationsCount === 0) {
      recs.push({
        id: 'no-citations',
        kind: 'opportunity',
        priority: 80,
        title: 'No sources cite you',
        detail: `The AI cited 0 web pages linking to ${brandName}. Get listed in the directories, comparison articles and reviews the AI pulls from, so it can cite you as a source.`,
      });
    }

    // ---- Per-prompt competitive gaps ----
    const gaps: Array<{ text: string; comp: string }> = [];
    for (const p of prompts) {
      const s = promptSummaries[p.id];
      if (!s || (s.statusSummary && s.statusSummary.startsWith('Error:'))) continue;
      if (s.selfMentioned === false && s.competitorMentionsCount > 0 && s.topCompetitorName) {
        gaps.push({ text: p.text, comp: s.topCompetitorName });
      }
    }
    for (const g of gaps.slice(0, 2)) {
      recs.push({
        id: `gap-${g.text.slice(0, 40)}`,
        kind: 'opportunity',
        priority: 74,
        title: `“${g.text}”`,
        detail: `For this buyer question the AI recommends ${g.comp} but not ${brandName}. Create a focused page or comparison that directly answers this exact query.`,
      });
    }

    // ---- Trend direction ----
    if (visibilityTrend.length >= 2) {
      const delta =
        visibilityTrend[visibilityTrend.length - 1].mentionRate - visibilityTrend[0].mentionRate;
      if (delta < 0) {
        recs.push({
          id: 'declining',
          kind: 'warning',
          priority: 85,
          title: `Visibility is trending down (${delta} pts)`,
          detail: `${brandName}'s mention rate has fallen since you started tracking. Check which prompts you lost and refresh the content behind them before rivals cement their lead.`,
        });
      } else if (delta > 0) {
        recs.push({
          id: 'rising',
          kind: 'win',
          priority: 16,
          title: `Visibility is trending up (+${delta} pts)`,
          detail: `Whatever you're doing is working — ${brandName} is mentioned more over time. Keep the momentum and document what changed.`,
        });
      }
    }
  }

  return recs.sort((a, b) => b.priority - a.priority).slice(0, 6);
}
