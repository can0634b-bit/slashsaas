import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runAudit, runAuditAllActive } from '@/lib/actions/audit';
import { EngineType } from '@/lib/types';

export const dynamic = 'force-dynamic';
// Gemini + Google Search grounding calls can take several seconds each; a batch
// audit runs prompts sequentially with pacing + backoff retries. The default
// 10s serverless timeout kills these mid-run, so extend to the max (60s).
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const engine: EngineType = body.engine || 'gemini';

    if (body.all === true) {
      const batchResult = await runAuditAllActive(engine);
      const firstError = batchResult.results.find((r) => r.error)?.error;
      return NextResponse.json({
        ok: batchResult.completed > 0 || batchResult.total === 0,
        total: batchResult.total,
        completed: batchResult.completed,
        rateLimitedCount: batchResult.rateLimitedCount,
        message: batchResult.message,
        error: batchResult.completed === 0 && batchResult.total > 0 ? firstError : undefined,
        runs: batchResult.results.map((r) => ({
          promptId: r.promptId,
          model: r.model,
          status: r.success ? 'completed' : r.rateLimited ? 'rate_limited' : 'failed',
          selfMentioned: r.selfMentioned,
          selfPosition: r.selfPosition,
          selfCited: r.selfCited,
          competitorsMentioned: r.competitorsMentioned,
          error: r.error,
        })),
      });
    }

    if (body.promptId) {
      const singleResult = await runAudit(body.promptId, engine);
      if (singleResult.rateLimited) {
        return NextResponse.json(
          {
            ok: false,
            error: singleResult.error,
            rateLimited: true,
            runs: [
              {
                promptId: singleResult.promptId,
                status: 'rate_limited',
                error: singleResult.error,
              },
            ],
          },
          { status: 429 }
        );
      }

      return NextResponse.json({
        ok: singleResult.success,
        error: singleResult.error,
        runs: [
          {
            promptId: singleResult.promptId,
            model: singleResult.model,
            status: singleResult.success ? 'completed' : 'failed',
            selfMentioned: singleResult.selfMentioned,
            selfPosition: singleResult.selfPosition,
            selfCited: singleResult.selfCited,
            competitorsMentioned: singleResult.competitorsMentioned,
            error: singleResult.error,
          },
        ],
      });
    }

    return NextResponse.json(
      { ok: false, error: 'Invalid request. Specify "promptId" or "all: true" in request body.' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('[API_AUDIT_RUN] Error handling request:', err);
    return NextResponse.json(
      { ok: false, error: err?.message || 'Internal server error processing audit.' },
      { status: 500 }
    );
  }
}
