import { GoogleGenAI } from '@google/genai';
import { EngineAdapter, EngineRunOptions } from './types';
import { EngineRunResult, CitationItem } from '@/lib/types';

export const DEFAULT_GEMINI_MODEL = 'gemini-3.6-flash';

let cachedResolvedModel: string | null = null;

export function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key || key.trim().length === 0) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your environment variables.');
  }
  return key.trim().replace(/^["']|["']$/g, '');
}

/**
 * Resolves the optimal Gemini model dynamically:
 * (a) If GEMINI_MODEL env var is set -> use verbatim.
 * (b) Query Gemini ListModels at runtime -> filter to generation-capable, flash-tier models -> sort by highest version.
 * (c) Fallback to DEFAULT_GEMINI_MODEL ('gemini-3.6-flash').
 * Results are cached in-memory for the process lifetime.
 */
export async function resolveGeminiModel(apiKey?: string): Promise<string> {
  const envModel = process.env.GEMINI_MODEL?.trim();
  if (envModel) {
    const clean = envModel.replace(/^models\//, '');
    return clean;
  }

  if (cachedResolvedModel) {
    return cachedResolvedModel;
  }

  const key = apiKey || (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim().replace(/^["']|["']$/g, '');
  if (!key) {
    return DEFAULT_GEMINI_MODEL;
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

      // Filter:
      // 1. Must support generateContent
      // 2. Must be flash-tier
      // 3. Exclude non-text/specialized: embedding, tts, image, audio, transcribe, realtime
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
        // Sort by version descending (e.g. 3.7 > 3.6 > 3.5 > 3.1)
        const sorted = candidates.sort((a, b) => {
          const matchA = a.match(/gemini-(\d+(?:\.\d+)?)/);
          const matchB = b.match(/gemini-(\d+(?:\.\d+)?)/);
          const verA = matchA ? parseFloat(matchA[1]) : 0;
          const verB = matchB ? parseFloat(matchB[1]) : 0;
          if (verB !== verA) return verB - verA;
          return b.localeCompare(a);
        });

        cachedResolvedModel = sorted[0];
        console.log(`[GEMINI_RESOLVER] Dynamically resolved Gemini model: "${cachedResolvedModel}"`);
        return cachedResolvedModel;
      }
    } else {
      console.warn(`[GEMINI_RESOLVER] ListModels HTTP ${res.status}: ${res.statusText}`);
    }
  } catch (err: any) {
    console.warn('[GEMINI_RESOLVER] Failed to query dynamic ListModels, using default:', err?.message || err);
  }

  cachedResolvedModel = DEFAULT_GEMINI_MODEL;
  return cachedResolvedModel;
}

export class GeminiAdapter implements EngineAdapter {
  id = 'gemini' as const;
  displayName = 'Google Gemini';

  async run(promptText: string, opts?: EngineRunOptions): Promise<EngineRunResult> {
    const apiKey = getGeminiApiKey();
    const model = await resolveGeminiModel(apiKey);
    const ai = new GoogleGenAI({ apiKey });

    let rawResponse = '';
    const citations: CitationItem[] = [];
    let lastError: any = null;

    // Attempt 1: SDK generateContent with Google Search Grounding
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
    } catch (sdkGroundingErr: any) {
      lastError = sdkGroundingErr;
      console.warn(`[GEMINI_ADAPTER] Grounded call failed for model "${model}":`, sdkGroundingErr?.message || sdkGroundingErr);

      // Attempt 2: SDK without grounding tools (if tool was the cause)
      try {
        const response = await ai.models.generateContent({
          model,
          contents: promptText,
        });
        rawResponse = response.text || '';
      } catch (sdkPlainErr: any) {
        lastError = sdkPlainErr;
        console.warn(`[GEMINI_ADAPTER] Plain SDK call failed for model "${model}", attempting REST fallback:`, sdkPlainErr?.message || sdkPlainErr);

        // Attempt 3: Direct REST endpoint with grounding
        try {
          const restResult = await this.callRestApi(apiKey, model, promptText, true);
          rawResponse = restResult.text;
          citations.push(...restResult.citations);
        } catch (restGroundedErr: any) {
          lastError = restGroundedErr;
          console.warn(`[GEMINI_ADAPTER] Grounded REST failed, attempting plain REST:`, restGroundedErr?.message || restGroundedErr);

          // Attempt 4: Plain REST endpoint
          try {
            const restPlainResult = await this.callRestApi(apiKey, model, promptText, false);
            rawResponse = restPlainResult.text;
          } catch (restFinalErr: any) {
            lastError = restFinalErr;
            console.error(`[GEMINI_ADAPTER_ERROR] All generation attempts failed for model "${model}":`, restFinalErr?.message || restFinalErr);
            throw new Error(`Gemini API error (model: ${model}): ${lastError?.message || String(lastError)}`);
          }
        }
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

    return {
      model,
      rawResponse: rawResponse.trim(),
      citations: uniqueCitations,
      costUsd: 0.0001,
    };
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
      throw new Error(rawMsg);
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
