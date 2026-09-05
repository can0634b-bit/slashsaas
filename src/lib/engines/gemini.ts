import { GoogleGenAI } from '@google/genai';
import { EngineAdapter, EngineRunOptions } from './types';
import { EngineRunResult, CitationItem } from '@/lib/types';

function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key || key.trim().length === 0) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your environment variables.');
  }
  return key.trim().replace(/^["']|["']$/g, '');
}

const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.0-flash';

export class GeminiAdapter implements EngineAdapter {
  id = 'gemini' as const;
  displayName = 'Google Gemini';

  async run(promptText: string, opts?: EngineRunOptions): Promise<EngineRunResult> {
    const apiKey = getGeminiApiKey();
    const ai = new GoogleGenAI({ apiKey });

    let activeModel = PRIMARY_MODEL;
    let rawResponse = '';
    const citations: CitationItem[] = [];

    // Attempt 1: Primary model with Google Search Grounding
    try {
      const response = await ai.models.generateContent({
        model: activeModel,
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
    } catch (primaryErr: any) {
      console.warn(`[GEMINI_ADAPTER] Grounded call failed with ${activeModel}:`, primaryErr?.message || primaryErr);

      // Attempt 2: Fallback without tools or to fallback model
      try {
        activeModel = FALLBACK_MODEL;
        const response = await ai.models.generateContent({
          model: activeModel,
          contents: promptText,
        });
        rawResponse = response.text || '';
      } catch (fallbackErr: any) {
        // Attempt 3: Direct REST endpoint fallback
        console.warn(`[GEMINI_ADAPTER] Fallback SDK call failed, attempting direct REST:`, fallbackErr?.message || fallbackErr);
        const restResult = await this.callRestApi(apiKey, promptText);
        rawResponse = restResult.text;
        activeModel = restResult.model;
      }
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
      model: activeModel,
      rawResponse: rawResponse.trim(),
      citations: uniqueCitations,
      costUsd: 0.0001, // Approximate per-call cost for Gemini 2.5/2.0 Flash
    };
  }

  private async callRestApi(apiKey: string, promptText: string): Promise<{ text: string; model: string }> {
    const models = [PRIMARY_MODEL, FALLBACK_MODEL];
    let lastError: any = null;

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: promptText }],
              },
            ],
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error?.message || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) {
          return { text, model };
        }
      } catch (err) {
        lastError = err;
      }
    }

    throw new Error(`All Gemini API attempts failed: ${lastError?.message || lastError}`);
  }
}
