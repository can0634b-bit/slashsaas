import { EngineAdapter, EngineRunOptions } from './types';
import { EngineRunResult } from '@/lib/types';

/**
 * NVIDIA NIM answer engine (build.nvidia.com — free API keys, OpenAI-compatible).
 *
 * Serves large open models (Llama 3.3 70B, Nemotron, Qwen, …) on NVIDIA's free
 * tier, so it's a stronger free answer engine than Groq's small default while we
 * can't afford a paid grounded key. Like Groq it answers from model knowledge
 * with NO live web search, so it produces no source citations. The run is
 * recorded as engine 'nvidia' to stay honest about which model answered.
 *
 * Model resolution follows the project rule (never a bare hardcoded id):
 * NVIDIA_MODEL env override → runtime discovery via /v1/models → fallback const.
 */
const NVIDIA_BASE = 'https://integrate.api.nvidia.com/v1';
export const DEFAULT_NVIDIA_MODEL = 'meta/llama-3.3-70b-instruct';

let cachedNvidiaModel: string | null = null;

export async function resolveNvidiaModel(apiKey?: string): Promise<string> {
  const envModel = process.env.NVIDIA_MODEL?.trim();
  if (envModel) return envModel;
  if (cachedNvidiaModel) return cachedNvidiaModel;

  const key = (apiKey || process.env.NVIDIA_API_KEY || '').trim();
  if (!key) return DEFAULT_NVIDIA_MODEL;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${NVIDIA_BASE}/models`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const ids: string[] = (data?.data || [])
        .map((m: { id?: string }) => String(m?.id || ''))
        .filter((id: string) => id.length > 0)
        // Exclude non-chat / specialized models
        .filter((id: string) => !/embed|rerank|retriev|vision|vila|ocr|guard|whisper|tts|clip|diffusion|reward|safety|paddle|florence|deplot|parakeet|nemoretriever|-vl|maxine/i.test(id));

      if (ids.length > 0) {
        const score = (id: string): number => {
          const l = id.toLowerCase();
          let s = 0;
          if (/instruct|chat/.test(l)) s += 20;
          if (/llama|nemotron|qwen|mixtral|mistral|gemma|deepseek/.test(l)) s += 40;
          if (/llama-?3\.3|nemotron-70|nemotron-super|qwen2\.5-72|llama-?3\.1-70/.test(l)) s += 30;
          const b = l.match(/(\d+)\s*b/);
          if (b) s += Math.min(parseInt(b[1], 10), 405);
          if (/r1|reason|thinking|qwq/.test(l)) s -= 25; // prefer a direct answerer over a reasoning model
          return s;
        };
        ids.sort((a, b) => score(b) - score(a));
        cachedNvidiaModel = ids[0];
        console.log('[NVIDIA_RESOLVER] Using NVIDIA model:', cachedNvidiaModel);
        return cachedNvidiaModel;
      }
    } else {
      console.warn(`[NVIDIA_RESOLVER] ListModels HTTP ${res.status}`);
    }
  } catch (err: unknown) {
    console.warn('[NVIDIA_RESOLVER] Failed to discover NVIDIA models:', (err as Error)?.message || err);
  }

  cachedNvidiaModel = DEFAULT_NVIDIA_MODEL;
  return cachedNvidiaModel;
}

export class NvidiaAdapter implements EngineAdapter {
  id = 'nvidia' as const;
  displayName = 'NVIDIA NIM';

  async run(promptText: string, _opts?: EngineRunOptions): Promise<EngineRunResult> {
    const apiKey = (process.env.NVIDIA_API_KEY || '').trim();
    if (!apiKey) {
      throw new Error('NVIDIA_API_KEY is not configured on the server.');
    }
    const model = await resolveNvidiaModel(apiKey);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(`${NVIDIA_BASE}/chat/completions`, {
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
        (errData as { error?: { message?: string }; detail?: string })?.error?.message ||
        (errData as { detail?: string })?.detail ||
        `NVIDIA HTTP ${res.status}: ${res.statusText}`;
      const err = new Error(msg) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }

    const data = await res.json();
    const rawResponse: string = data.choices?.[0]?.message?.content?.trim() || '';
    if (!rawResponse) {
      throw new Error('NVIDIA returned an empty answer.');
    }

    return {
      model,
      rawResponse,
      citations: [], // No live web grounding, so no source citations.
      costUsd: 0,
    };
  }
}
