import { GoogleGenAI } from '@google/genai';
import { EngineAdapter, EngineRunOptions } from './types';
import { EngineRunResult, CitationItem } from '@/lib/types';

export const DEFAULT_GEMINI_MODEL = 'gemini-3.6-flash';

let cachedCandidateModels: string[] | null = null;

export function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key || key.trim().length === 0) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your environment variables.');
  }
  return key.trim().replace(/^["']|["']$/g, '');
}

export interface GeminiErrorClassification {
  isRateLimit: boolean;    // 429 / RESOURCE_EXHAUSTED / quota exceeded
  isOverloaded: boolean;   // 503 / UNAVAILABLE / high demand / overloaded / 500
  isFatal: boolean;        // 400 / 401 / 403 / API_KEY_INVALID / bad request / invalid argument
  retryDelayMs?: number;   // parsed retryDelay in milliseconds
  rawMessage: string;
}

/**
 * Classifies an error from Gemini SDK or REST API:
 * - 429 / RESOURCE_EXHAUSTED / quota
 * - 503 / UNAVAILABLE / high demand / overloaded / 500
 * - 400 / 401 / 403 / auth / bad request (fatal -> no retry)
 */
export function classifyGeminiError(err: any): GeminiErrorClassification {
  const rawMessage = err?.message || (typeof err === 'string' ? err : String(err || 'Unknown Gemini error'));
  const lower = rawMessage.toLowerCase();
  const status = err?.status || err?.code || (err?.response ? err.response.status : undefined);

  // 1. Fatal errors (auth, bad request, invalid key) -> fail fast
  const isFatal =
    status === 400 ||
    status === 401 ||
    status === 403 ||
    lower.includes('api_key_invalid') ||
    lower.includes('api key not valid') ||
    lower.includes('permission_denied') ||
    lower.includes('invalid_argument') ||
    lower.includes('invalid argument') ||
    lower.includes('unauthorized') ||
    lower.includes('forbidden');

  // 2. Rate limit / quota (429 / RESOURCE_EXHAUSTED)
  const isRateLimit =
    status === 429 ||
    lower.includes('429') ||
    lower.includes('resource_exhausted') ||
    lower.includes('quota') ||
    lower.includes('rate limit') ||
    lower.includes('too many requests');

  // Extract retry delay if available in message or errorDetails
  let retryDelayMs: number | undefined;
  if (isRateLimit) {
    const details = err?.errorDetails || err?.details || [];
    if (Array.isArray(details)) {
      for (const d of details) {
        if (d?.retryDelay) {
          const match = String(d.retryDelay).match(/(\d+(?:\.\d+)?)/);
          if (match) {
            retryDelayMs = Math.round(parseFloat(match[1]) * 1000);
            break;
          }
        }
      }
    }

    if (!retryDelayMs) {
      const match = rawMessage.match(/(?:retry\s+(?:in|after)|retryDelay["':\s]+)\s*(\d+(?:\.\d+)?)\s*s/i);
      if (match) {
        retryDelayMs = Math.round(parseFloat(match[1]) * 1000);
      }
    }

    // Cap retryDelayMs between 1s and 40s (cap ~40s)
    if (retryDelayMs !== undefined) {
      retryDelayMs = Math.min(Math.max(retryDelayMs, 1000), 40000);
    }
  }

  // 3. Overloaded / unavailable (503 / 500 / UNAVAILABLE / high demand)
  const isOverloaded =
    !isRateLimit &&
    !isFatal &&
    (status === 503 ||
      status === 500 ||
      lower.includes('503') ||
      lower.includes('500') ||
      lower.includes('unavailable') ||
      lower.includes('high demand') ||
      lower.includes('overloaded') ||
      lower.includes('temporarily unavailable') ||
      lower.includes('internal error') ||
      lower.includes('internal server error'));

  return {
    isRateLimit,
    isOverloaded,
    isFatal,
    retryDelayMs,
    rawMessage,
  };
}

export function isGeminiRateLimitError(err: any): boolean {
  return classifyGeminiError(err).isRateLimit;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateJitteredBackoff(attempt: number, baseMs = 2000, maxMs = 20000): number {
  const exponential = baseMs * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 1000;
  return Math.min(exponential + jitter, maxMs);
}

function calculateExponentialBackoff(attempt: number, baseMs = 2000, maxMs = 40000): number {
  const exponential = baseMs * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 500;
  return Math.min(exponential + jitter, maxMs);
}

/**
 * Returns candidate Gemini models discovered at runtime, sorted newest first:
 * (a) If GEMINI_MODEL env var is set -> [envModel].
 * (b) Query Gemini ListModels at runtime -> filter to flash-tier models -> sort by version descending.
 * (c) Always appends DEFAULT_GEMINI_MODEL as a resilient fallback.
 */
export async function getDiscoveredGeminiModels(apiKey?: string): Promise<string[]> {
  const envModel = process.env.GEMINI_MODEL?.trim();
  if (envModel) {
    const clean = envModel.replace(/^models\//, '');
    return [clean];
  }

  if (cachedCandidateModels && cachedCandidateModels.length > 0) {
    return cachedCandidateModels;
  }

  const key = apiKey || (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim().replace(/^["']|["']$/g, '');
  if (!key) {
    return [DEFAULT_GEMINI_MODEL];
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const modelsList: Array<{
        name: string;
        supportedGenerationMethods?: string[];
      }> = data.models || [];

      const candidates = modelsList
        .filter((m) => {
          const name = m.name.toLowerCase();
          const methods = m.supportedGenerationMethods || [];
          const supportsGen = methods.length === 0 || methods.includes('generateContent');
          const isFlash = name.includes('flash');
          const isExcluded =
            name.includes('embedding') ||
            name.includes('tts') ||
            name.includes('image') ||
            name.includes('audio') ||
            name.includes('transcribe') ||
            name.includes('realtime') ||
            name.includes('2.0') || // deprecated
            name.includes('2.5') || // deprecated
            name.includes('1.5'); // deprecated
          return supportsGen && isFlash && !isExcluded;
        })
        .map((m) => m.name.replace(/^models\//, ''));

      if (candidates.length > 0) {
        // Sort descending by numeric version (e.g. 3.8 > 3.7 > 3.6)
        const sorted = candidates.sort((a, b) => {
          const matchA = a.match(/gemini-(\d+(?:\.\d+)?)/);
          const matchB = b.match(/gemini-(\d+(?:\.\d+)?)/);
          const verA = matchA ? parseFloat(matchA[1]) : 0;
          const verB = matchB ? parseFloat(matchB[1]) : 0;
          if (verB !== verA) return verB - verA;
          return b.localeCompare(a);
        });

        // Ensure DEFAULT_GEMINI_MODEL is in the candidate list
        if (!sorted.includes(DEFAULT_GEMINI_MODEL)) {
          sorted.push(DEFAULT_GEMINI_MODEL);
        }

        cachedCandidateModels = sorted;
        console.log(`[GEMINI_RESOLVER] Discovered candidate Gemini models:`, cachedCandidateModels);
        return cachedCandidateModels;
      }
    } else {
      console.warn(`[GEMINI_RESOLVER] ListModels HTTP ${res.status}: ${res.statusText}`);
    }
  } catch (err: any) {
    console.warn('[GEMINI_RESOLVER] Failed to query dynamic ListModels, using default list:', err?.message || err);
  }

  cachedCandidateModels = [DEFAULT_GEMINI_MODEL];
  return cachedCandidateModels;
}

export async function resolveGeminiModel(apiKey?: string): Promise<string> {
  const models = await getDiscoveredGeminiModels(apiKey);
  return models[0] || DEFAULT_GEMINI_MODEL;
}


export class GeminiAdapter implements EngineAdapter {
  id = 'gemini' as const;
  displayName = 'Google Gemini';

  async run(promptText: string, opts?: EngineRunOptions): Promise<EngineRunResult> {
    const apiKey = getGeminiApiKey();
    const candidateModels = await getDiscoveredGeminiModels(apiKey);
    const ai = new GoogleGenAI({ apiKey });

    let lastModelError: any = null;

    // 2. MODEL FALLBACK:
    // If primary model stays overloaded (503) after retries, try the NEXT available flash model
    for (let mIdx = 0; mIdx < candidateModels.length; mIdx++) {
      const currentModel = candidateModels[mIdx];
      const isLastModel = mIdx === candidateModels.length - 1;

      try {
        const runResult = await this.executeModelWithRetries(ai, apiKey, currentModel, promptText);
        return runResult;
      } catch (err: any) {
        lastModelError = err;
        const classification = classifyGeminiError(err);

        // Fallback to next model if overloaded (503 / high demand) and more models exist
        if (classification.isOverloaded && !isLastModel) {
          const nextModel = candidateModels[mIdx + 1];
          console.warn(
            `[GEMINI_ADAPTER] Model "${currentModel}" remained overloaded after 4 retries. Falling back to next candidate: "${nextModel}"...`
          );
          continue;
        }

        // On rate limit (429), fatal error, or if no further models, fail loud
        throw err;
      }
    }

    throw lastModelError || new Error('All Gemini model candidates failed.');
  }

  /**
   * 1. RETRY WITH BACKOFF (up to 4 attempts):
   * - On 429 / RESOURCE_EXHAUSTED: read retryDelay or exponential backoff (cap ~40s).
   * - On 503 / UNAVAILABLE / high demand / 500: exponential backoff with jitter (2s, 4s, 8s...).
   * - On other errors (auth, bad request): fail fast, no retry.
   */
  private async executeModelWithRetries(
    ai: GoogleGenAI,
    apiKey: string,
    model: string,
    promptText: string
  ): Promise<EngineRunResult> {
    const MAX_ATTEMPTS = 4;
    let lastError: any = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const isLastAttempt = attempt === MAX_ATTEMPTS;

      try {
        const generation = await this.singleGenerate(ai, apiKey, model, promptText);
        return {
          model,
          rawResponse: generation.rawResponse,
          citations: generation.citations,
          costUsd: 0.0001,
        };
      } catch (err: any) {
        lastError = err;
        const classification = classifyGeminiError(err);

        // Fatal errors (400, 401, 403, invalid key) fail fast without retry
        if (classification.isFatal || isLastAttempt) {
          throw new Error(`Gemini API error (model: ${model}): ${lastError?.message || String(lastError)}`);
        }

        if (classification.isRateLimit) {
          const delayMs = classification.retryDelayMs ?? calculateExponentialBackoff(attempt, 2000, 40000);
          console.warn(
            `[GEMINI_RETRY] Attempt ${attempt}/${MAX_ATTEMPTS} for "${model}" hit 429 (quota exceeded). Waiting ${(delayMs / 1000).toFixed(1)}s before retry...`
          );
          await sleep(delayMs);
          continue;
        }

        if (classification.isOverloaded) {
          const delayMs = calculateJitteredBackoff(attempt, 2000, 20000);
          console.warn(
            `[GEMINI_RETRY] Attempt ${attempt}/${MAX_ATTEMPTS} for "${model}" hit 503 (model high demand / unavailable). Waiting ${(delayMs / 1000).toFixed(1)}s before retry...`
          );
          await sleep(delayMs);
          continue;
        }

        // Other transient network/timeout errors
        const delayMs = calculateJitteredBackoff(attempt, 1500, 10000);
        console.warn(
          `[GEMINI_RETRY] Attempt ${attempt}/${MAX_ATTEMPTS} for "${model}" hit transient error. Waiting ${(delayMs / 1000).toFixed(1)}s before retry: ${err?.message}`
        );
        await sleep(delayMs);
      }
    }

    throw new Error(`Gemini API error (model: ${model}): ${lastError?.message || String(lastError)}`);
  }

  /**
   * Executes a single generation attempt:
   * First tries SDK with Google Search Grounding.
   * If grounding tool is rejected or network error occurs (and NOT 429/503), falls back to plain or REST.
   * If 429 or 503 is returned, throws directly so the backoff retry loop handles it.
   */
  private async singleGenerate(
    ai: GoogleGenAI,
    apiKey: string,
    model: string,
    promptText: string
  ): Promise<{ rawResponse: string; citations: CitationItem[] }> {
    let rawResponse = '';
    const citations: CitationItem[] = [];

    try {
      const response = await ai.models.generateContent({
        model,
        contents: promptText,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      rawResponse = response.text || '';
      const grounding = response.candidates?.[0]?.groundingMetadata;

      if (grounding?.groundingChunks) {
        for (const chunk of grounding.groundingChunks) {
          if (chunk.web?.uri) {
            citations.push({
              url: chunk.web.uri,
              title: chunk.web.title || undefined,
            });
          }
        }
      }
    } catch (sdkErr: any) {
      const classification = classifyGeminiError(sdkErr);
      // If error is 429, 503, or fatal, bubble immediately to retry loop / caller
      if (classification.isRateLimit || classification.isOverloaded || classification.isFatal) {
        throw sdkErr;
      }

      // Try SDK without grounding if grounding tool was unsupported
      try {
        const plainResponse = await ai.models.generateContent({
          model,
          contents: promptText,
        });
        rawResponse = plainResponse.text || '';
      } catch (plainErr: any) {
        const plainClass = classifyGeminiError(plainErr);
        if (plainClass.isRateLimit || plainClass.isOverloaded || plainClass.isFatal) {
          throw plainErr;
        }

        // Direct REST endpoint fallback
        const restResult = await this.callRestApi(apiKey, model, promptText, true);
        rawResponse = restResult.text;
        citations.push(...restResult.citations);
      }
    }

    if (!rawResponse || rawResponse.trim().length === 0) {
      throw new Error(`Gemini API returned empty response text (model: ${model}).`);
    }

    // Deduplicate citations by URL
    const seenUrls = new Set<string>();
    const uniqueCitations: CitationItem[] = [];
    for (const c of citations) {
      const cleanUrl = c.url.trim();
      if (cleanUrl && !seenUrls.has(cleanUrl)) {
        seenUrls.add(cleanUrl);
        uniqueCitations.push(c);
      }
    }

    return { rawResponse: rawResponse.trim(), citations: uniqueCitations };
  }

  private async callRestApi(
    apiKey: string,
    model: string,
    promptText: string,
    withGrounding: boolean
  ): Promise<{ text: string; citations: CitationItem[] }> {
    const cleanModel = model.replace(/^models\//, '');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

    const bodyPayload: any = {
      contents: [
        {
          role: 'user',
          parts: [{ text: promptText }],
        },
      ],
    };

    if (withGrounding) {
      bodyPayload.tools = [{ googleSearch: {} }];
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const rawMsg = errJson.error?.message || `HTTP ${res.status}: ${res.statusText}`;
      const err: any = new Error(rawMsg);
      err.status = res.status;
      err.errorDetails = errJson.error?.details;
      throw err;
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const citations: CitationItem[] = [];

    const grounding = data.candidates?.[0]?.groundingMetadata;
    if (grounding?.groundingChunks) {
      for (const chunk of grounding.groundingChunks) {
        if (chunk.web?.uri) {
          citations.push({
            url: chunk.web.uri,
            title: chunk.web.title || undefined,
          });
        }
      }
    }

    return { text, citations };
  }
}
