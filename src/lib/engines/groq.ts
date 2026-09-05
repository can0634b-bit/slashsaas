import { EngineAdapter, EngineRunOptions } from './types';
import { EngineRunResult } from '@/lib/types';
import { resolveGroqModel } from './parser';

/**
 * Groq (Llama) answer engine.
 *
 * Used as an automatic fallback when the grounded engine (Gemini) is
 * rate-limited or quota-exhausted. Groq's free tier is far more generous, so
 * audits still complete without paid billing.
 *
 * Note: Llama answers from its training knowledge, without live web search, so
 * this engine produces no source citations. The run is recorded as engine
 * 'groq' so the data honestly reflects which model produced the answer.
 */
export class GroqAdapter implements EngineAdapter {
  id = 'groq' as const;
  displayName = 'Groq (Llama)';

  async run(promptText: string, _opts?: EngineRunOptions): Promise<EngineRunResult> {
    const apiKey = (process.env.GROQ_API_KEY || '').trim();
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured on the server.');
    }
    const model = resolveGroqModel();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are a knowledgeable assistant answering a user asking for recommendations. Answer naturally and concisely. When relevant, name specific, real products, tools, companies, or brands you would recommend, the way a helpful assistant would. Do not add disclaimers about being an AI or about your training data.',
          },
          { role: 'user', content: promptText },
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({} as Record<string, unknown>));
      const msg =
        (errData as { error?: { message?: string } })?.error?.message ||
        `Groq HTTP ${res.status}: ${res.statusText}`;
      const err = new Error(msg) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }

    const data = await res.json();
    const rawResponse: string = data.choices?.[0]?.message?.content?.trim() || '';
    if (!rawResponse) {
      throw new Error('Groq returned an empty answer.');
    }

    return {
      model,
      rawResponse,
      citations: [], // Llama has no live web grounding, so no source citations.
      costUsd: 0,
    };
  }
}
