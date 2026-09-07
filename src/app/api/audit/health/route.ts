import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolveGeminiModel, getGeminiApiKeys } from '@/lib/engines/gemini';
import { resolveGroqModel } from '@/lib/engines/parser';
import { resolveNvidiaModel } from '@/lib/engines/nvidia';

export const dynamic = 'force-dynamic';
// Tests every configured Gemini key + NVIDIA + Groq with live calls; extend to
// the max so a few slow calls don't kill the check.
export const maxDuration = 60;

function abortMsg(err: unknown, secs: number): string {
  const e = err as { name?: string; message?: string };
  return e?.name === 'AbortError'
    ? `Timed out after ${secs}s (slow response or free-tier throttling)`
    : e?.message || String(err);
}

async function testGeminiKey(key: string, model: string): Promise<{ reachable: boolean; error?: string }> {
  const cleanModel = model.replace(/^models\//, '');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${key}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Respond with "OK".' }] }] }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) return { reachable: true };
    const errData = await res.json().catch(() => ({}));
    return { reachable: false, error: (errData as { error?: { message?: string } })?.error?.message || `HTTP ${res.status}: ${res.statusText}` };
  } catch (err) {
    clearTimeout(timeout);
    return { reachable: false, error: abortMsg(err, 9) };
  }
}

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    // 1. OpenAI — test EVERY configured key (the rotation pool)
    const { getOpenAIApiKeys, DEFAULT_OPENAI_MODEL } = await import('@/lib/engines/openai');
    const openaiKeys = getOpenAIApiKeys();
    let openai: {
      reachable: boolean;
      keys: number;
      resolvedModel: string;
      perKey?: Array<{ key: number; reachable: boolean; error?: string }>;
      error?: string;
    };

    if (openaiKeys.length === 0) {
      openai = { reachable: false, keys: 0, resolvedModel: 'none', error: 'No OPENAI_API_KEY configured.' };
    } else {
      const resolvedModel = process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL;
      const perKey: Array<{ key: number; reachable: boolean; error?: string }> = [];
      for (let i = 0; i < openaiKeys.length; i++) {
        const key = openaiKeys[i];
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 9000);
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
            body: JSON.stringify({ model: resolvedModel, messages: [{ role: 'user', content: 'Say OK' }], max_tokens: 5 }),
            signal: controller.signal,
          });
          clearTimeout(timeout);
          if (res.ok) {
            perKey.push({ key: i + 1, reachable: true });
          } else {
            const errData = await res.json().catch(() => ({}));
            perKey.push({ key: i + 1, reachable: false, error: errData?.error?.message || `HTTP ${res.status}` });
          }
        } catch (err) {
          perKey.push({ key: i + 1, reachable: false, error: abortMsg(err, 9) });
        }
      }
      openai = {
        reachable: perKey.some((k) => k.reachable),
        keys: openaiKeys.length,
        resolvedModel,
        perKey,
      };
    }

    // 1.5 Gemini (Legacy) - Keeping it to not break interfaces fully if they rely on it, but we can just comment it out.
    // We'll leave it as is, but change groundedAvailable and canAnswer down below.
    const geminiKeys = getGeminiApiKeys();
    let gemini: {
      reachable: boolean;
      keys: number;
      resolvedModel: string;
      perKey?: Array<{ key: number; reachable: boolean; error?: string }>;
      error?: string;
    };

    if (geminiKeys.length === 0) {
      gemini = { reachable: false, keys: 0, resolvedModel: 'none', error: 'No GEMINI_API_KEY configured.' };
    } else {
      let resolvedModel = 'gemini-3.6-flash';
      try {
        resolvedModel = await resolveGeminiModel(geminiKeys[0]);
      } catch { /* keep default */ }
      const perKey: Array<{ key: number; reachable: boolean; error?: string }> = [];
      for (let i = 0; i < geminiKeys.length; i++) {
        const r = await testGeminiKey(geminiKeys[i], resolvedModel);
        perKey.push({ key: i + 1, reachable: r.reachable, ...(r.error ? { error: r.error } : {}) });
      }
      gemini = {
        reachable: perKey.some((k) => k.reachable),
        keys: geminiKeys.length,
        resolvedModel,
        perKey,
      };
    }

    // 2. NVIDIA (optional free fallback answer engine)
    const nvidiaKey = (process.env.NVIDIA_API_KEY || '').trim().replace(/^["']|["']$/g, '');
    let nvidia: { configured: boolean; reachable: boolean; model?: string; error?: string };
    if (!nvidiaKey) {
      nvidia = { configured: false, reachable: false, error: 'NVIDIA_API_KEY not set (optional).' };
    } else {
      let model = 'unknown';
      try {
        model = await resolveNvidiaModel(nvidiaKey);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${nvidiaKey}` },
          body: JSON.stringify({ model, messages: [{ role: 'user', content: 'Say OK' }], max_tokens: 5 }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          nvidia = { configured: true, reachable: true, model };
        } else {
          const e = await res.json().catch(() => ({}));
          nvidia = { configured: true, reachable: false, model, error: (e as { error?: { message?: string }; detail?: string })?.error?.message || (e as { detail?: string })?.detail || `HTTP ${res.status}` };
        }
      } catch (err) {
        nvidia = { configured: true, reachable: false, model, error: abortMsg(err, 15) };
      }
    }

    // 3. Groq (parser + fallback answer engine)
    const groqKey = (process.env.GROQ_API_KEY || '').trim().replace(/^["']|["']$/g, '');
    const groqModel = await resolveGroqModel(groqKey);
    let groq: { configured: boolean; reachable: boolean; model: string; error?: string };
    if (!groqKey) {
      groq = { configured: false, reachable: false, model: groqModel, error: 'GROQ_API_KEY not set (regex fallback active).' };
    } else {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 9000);
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
          body: JSON.stringify({ model: groqModel, messages: [{ role: 'user', content: 'Say OK' }], max_tokens: 5 }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          groq = { configured: true, reachable: true, model: groqModel };
        } else {
          const e = await res.json().catch(() => ({}));
          groq = { configured: true, reachable: false, model: groqModel, error: (e as { error?: { message?: string } })?.error?.message || `HTTP ${res.status}` };
        }
      } catch (err) {
        groq = { configured: true, reachable: false, model: groqModel, error: abortMsg(err, 9) };
      }
    }

    // Product can answer if ANY answer engine is reachable
    const canAnswer = openai.reachable || gemini.reachable || nvidia.reachable || groq.reachable;

    return NextResponse.json({
      ok: canAnswer,
      groundedAvailable: openai.reachable || gemini.reachable,
      openai,
      gemini,
      nvidia,
      groq,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as { message?: string })?.message || 'Internal health check error' },
      { status: 500 }
    );
  }
}
