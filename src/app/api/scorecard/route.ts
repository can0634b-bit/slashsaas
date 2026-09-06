import { NextRequest, NextResponse } from 'next/server';
import { getEngineAdapter } from '@/lib/engines';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Best-effort per-IP throttle (per serverless instance). Combined with the
// public scorecard using Groq (not the product's grounded Gemini) this keeps
// the endpoint from burning quota. A Redis/DB limiter is a future hardening.
const hits = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) {
    hits.set(ip, arr);
    return true;
  }
  arr.push(now);
  hits.set(ip, arr);
  return false;
}

// Natural buyer-intent prompts for the entered category — the brand should
// appear here if the AI considers it a real option.
function buildPrompts(category: string): string[] {
  const c = category.trim();
  return [
    `What are the best ${c} tools in 2026?`,
    `Recommend a top ${c} platform for a growing company.`,
    `Which ${c} should I choose, and why?`,
  ];
}

function isMentioned(answer: string, brand: string, domain?: string): boolean {
  const a = answer.toLowerCase();
  const b = brand.trim().toLowerCase();
  if (b && a.includes(b)) return true;
  if (domain) {
    const root = domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .split('.')[0];
    if (root && root.length >= 3 && a.includes(root)) return true;
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (rateLimited(ip)) {
      return NextResponse.json(
        { error: 'You have run several checks recently. Please try again in a little while.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const brand = String(body.brand || '').trim();
    const category = String(body.category || '').trim();
    const domain = String(body.domain || '').trim();

    if (brand.length < 2) {
      return NextResponse.json({ error: 'Please enter your brand name.' }, { status: 400 });
    }
    if (category.length < 2) {
      return NextResponse.json({ error: 'Please describe your category (e.g. "CRM software").' }, { status: 400 });
    }

    const prompts = buildPrompts(category);
    const adapter = getEngineAdapter('groq');

    const results: Array<{ prompt: string; mentioned: boolean; excerpt: string; error?: string }> = [];
    let engineErrors = 0;

    for (const p of prompts) {
      try {
        const r = await adapter.run(p, { locale: 'en' });
        results.push({
          prompt: p,
          mentioned: isMentioned(r.rawResponse, brand, domain),
          excerpt: (r.rawResponse || '').slice(0, 260).trim(),
        });
      } catch (e: any) {
        engineErrors++;
        results.push({ prompt: p, mentioned: false, excerpt: '', error: e?.message || 'engine error' });
      }
    }

    // If every engine call failed, don't report a misleading 0% — surface it.
    if (engineErrors === prompts.length) {
      return NextResponse.json(
        { error: 'The analysis engine is temporarily unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }

    const mentionedCount = results.filter((r) => r.mentioned).length;
    const score = Math.round((mentionedCount / prompts.length) * 100);

    return NextResponse.json({
      success: true,
      brand,
      category,
      score,
      mentionedCount,
      total: prompts.length,
      results,
    });
  } catch (err: any) {
    console.error('[SCORECARD] failure:', err);
    return NextResponse.json({ error: err?.message || 'Failed to run the scorecard.' }, { status: 500 });
  }
}
