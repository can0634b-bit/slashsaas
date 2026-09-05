import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolveGeminiModel } from '@/lib/engines/gemini';
import { resolveGroqModel } from '@/lib/engines/parser';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const geminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim().replace(/^["']|["']$/g, '');
    const groqKey = (process.env.GROQ_API_KEY || '').trim().replace(/^["']|["']$/g, '');

    // 1. Test Gemini
    let geminiStatus: { reachable: boolean; resolvedModel: string; error?: string };
    let resolvedModel = 'gemini-3.6-flash';

    if (!geminiKey) {
      geminiStatus = {
        reachable: false,
        resolvedModel: 'none',
        error: 'GEMINI_API_KEY is not set in environment variables.',
      };
    } else {
      try {
        resolvedModel = await resolveGeminiModel(geminiKey);
        const cleanModel = resolvedModel.replace(/^models\//, '');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${geminiKey}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: 'Respond with "OK".' }],
              },
            ],
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (res.ok) {
          geminiStatus = {
            reachable: true,
            resolvedModel,
          };
        } else {
          const errData = await res.json().catch(() => ({}));
          geminiStatus = {
            reachable: false,
            resolvedModel,
            error: errData.error?.message || `HTTP ${res.status}: ${res.statusText}`,
          };
        }
      } catch (err: any) {
        geminiStatus = {
          reachable: false,
          resolvedModel,
          error: err?.message || String(err),
        };
      }
    }

    // 2. Test Groq
    const groqModel = resolveGroqModel();
    let groqStatus: { reachable: boolean; model: string; error?: string };

    if (!groqKey) {
      groqStatus = {
        reachable: false,
        model: groqModel,
        error: 'GROQ_API_KEY is not set (Groq disabled, regex/substring fallback active).',
      };
    } else {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: groqModel,
            messages: [{ role: 'user', content: 'Say OK' }],
            max_tokens: 5,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (res.ok) {
          groqStatus = {
            reachable: true,
            model: groqModel,
          };
        } else {
          const errData = await res.json().catch(() => ({}));
          groqStatus = {
            reachable: false,
            model: groqModel,
            error: errData.error?.message || `HTTP ${res.status}: ${res.statusText}`,
          };
        }
      } catch (err: any) {
        groqStatus = {
          reachable: false,
          model: groqModel,
          error: err?.message || String(err),
        };
      }
    }

    const overallOk = geminiStatus.reachable;

    return NextResponse.json({
      ok: overallOk,
      gemini: geminiStatus,
      groq: groqStatus,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Internal health check error' },
      { status: 500 }
    );
  }
}
