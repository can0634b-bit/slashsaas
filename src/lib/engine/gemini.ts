import { GoogleGenAI } from '@google/genai';
import { AiSearchEngine, CompetitorMention } from './types';

export interface ExtractionOutput {
  brandMentioned: boolean;
  brandRank: number | null;
  competitorsFound: CompetitorMention[];
  sources: string[];
}

function getGeminiApiKey(): string {
  const rawKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!rawKey || rawKey.trim().length === 0) {
    throw new Error('GEMINI_API_KEY ortam değişkeni bulunamadı. Lütfen Vercel ayarlarından GEMINI_API_KEY ekleyin.');
  }

  return rawKey.trim().replace(/^["']|["']$/g, '');
}

function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({ apiKey: getGeminiApiKey() });
}

// Resilient candidate models ordered by priority
const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL &&
  !process.env.GEMINI_MODEL.includes('2.0') &&
  !process.env.GEMINI_MODEL.includes('1.5')
    ? process.env.GEMINI_MODEL
    : null,
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3.7-flash',
].filter(Boolean) as string[];

async function callGoogleRestApi(model: string, apiKey: string, promptText: string): Promise<string> {
  const cleanModel = model.replace(/^models\//, '');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are an intelligent AI search assistant. Answer the user prompt directly, objectively, and comprehensively. Provide specific product, software, brand, or service recommendations with clear rationale where relevant. Format clearly with markdown headings or numbered lists.\n\nSearch prompt: ${promptText}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1200,
      },
    }),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Google API HTTP ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text || text.trim().length === 0) {
    throw new Error(`Empty answer received from Google API for model ${model}`);
  }

  return text;
}

export class GeminiSearchEngine implements AiSearchEngine {
  name = 'gemini';
  displayName = 'Google Gemini';

  /**
   * Samples a single user query against Gemini with fast response & timeout guard.
   * Automatically falls back across active Gemini models and Groq if configured.
   */
  async sampleQuery(queryText: string): Promise<{ rawAnswer: string; sources: string[] }> {
    const apiKey = getGeminiApiKey();
    const ai = getGeminiClient();
    let lastError: any = null;

    for (const model of CANDIDATE_MODELS) {
      // 1. Try official SDK
      try {
        const generatePromise = ai.models.generateContent({
          model,
          contents: queryText,
          config: {
            systemInstruction:
              'You are an intelligent, helpful AI search assistant. Answer the user prompt directly, objectively, and comprehensively. Provide specific product, software, brand, or service recommendations with clear rationale where relevant. Format clearly with markdown headings or numbered lists.',
            temperature: 0.7,
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Gemini SDK request timed out on ${model} after 10s`)), 10000)
        );

        const response = (await Promise.race([generatePromise, timeoutPromise])) as any;
        const rawAnswer = response.text || '';

        if (rawAnswer && rawAnswer.trim().length > 0) {
          const sources = extractUrlsAndDomains(rawAnswer);
          return { rawAnswer, sources };
        }
      } catch (sdkErr: any) {
        lastError = sdkErr;
        console.warn(`[GeminiSearchEngine] SDK call failed for ${model}, attempting REST fallback:`, sdkErr?.message || sdkErr);
      }

      // 2. Direct REST fallback
      try {
        const rawAnswer = await callGoogleRestApi(model, apiKey, queryText);
        if (rawAnswer && rawAnswer.trim().length > 0) {
          const sources = extractUrlsAndDomains(rawAnswer);
          return { rawAnswer, sources };
        }
      } catch (restErr: any) {
        lastError = restErr;
        console.warn(`[GeminiSearchEngine] REST call failed for ${model}:`, restErr?.message || restErr);
      }
    }

    // 3. Failover to Groq if configured in environment
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 0) {
      try {
        console.info('[GeminiSearchEngine] Gemini candidate models exhausted, failing over to Groq Llama 3.3...');
        const { GroqSearchEngine } = await import('./groq');
        const groqEngine = new GroqSearchEngine();
        return await groqEngine.sampleQuery(queryText);
      } catch (groqErr) {
        console.warn('[GeminiSearchEngine] Groq failover also failed:', groqErr);
      }
    }

    throw new Error(
      `Gemini AI motoru tüm modellerde (${CANDIDATE_MODELS.join(', ')}) hata verdi. Son hata: ${lastError?.message || 'Bilinmeyen hata'}`
    );
  }
}

/**
 * Ultra-fast deterministic, 100% grounded extractor (0ms latency, zero hallucination).
 * Checks physical presence in verbatim text, parses numbered ranking lists, and extracts citations.
 */
export function extractGroundedMentions(
  rawAnswer: string,
  brandName: string,
  brandDomain: string,
  competitorNames: string[]
): ExtractionOutput {
  const normalizedRaw = rawAnswer.toLowerCase();
  const brandLower = brandName.toLowerCase();
  const domainClean = brandDomain
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];

  const brandMentioned =
    normalizedRaw.includes(brandLower) || (domainClean.length > 3 && normalizedRaw.includes(domainClean));

  // Determine brand rank if mentioned in an ordered list
  let brandRank: number | null = null;
  if (brandMentioned) {
    const lines = rawAnswer.split(/\r?\n/);
    for (const line of lines) {
      const lineLower = line.toLowerCase();
      if (lineLower.includes(brandLower) || (domainClean.length > 3 && lineLower.includes(domainClean))) {
        // Matches "1. Brand", "1) Brand", "#1 Brand", "**1. Brand**"
        const m = line.match(/^[\s*#-]*(\d+)[\.\)\s]/);
        if (m) {
          const r = parseInt(m[1], 10);
          if (r >= 1 && r <= 20) {
            brandRank = brandRank === null ? r : Math.min(brandRank, r);
          }
        }
      }
    }
  }

  // Determine competitor mentions & ranks
  const competitorsFound: CompetitorMention[] = competitorNames.map((compName) => {
    const compLower = compName.toLowerCase();
    const isMentioned = normalizedRaw.includes(compLower);
    let compRank: number | null = null;

    if (isMentioned) {
      const lines = rawAnswer.split(/\r?\n/);
      for (const line of lines) {
        if (line.toLowerCase().includes(compLower)) {
          const m = line.match(/^[\s*#-]*(\d+)[\.\)\s]/);
          if (m) {
            const r = parseInt(m[1], 10);
            if (r >= 1 && r <= 20) {
              compRank = compRank === null ? r : Math.min(compRank, r);
            }
          }
        }
      }
    }

    return {
      name: compName,
      mentioned: isMentioned,
      rank: compRank,
    };
  });

  const sources = extractUrlsAndDomains(rawAnswer);

  return {
    brandMentioned,
    brandRank,
    competitorsFound,
    sources,
  };
}

export function extractUrlsAndDomains(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s\)\],]+)/gi;
  const domainRegex = /([a-z0-9-]+\.(?:com|org|io|ai|net|co|app|dev|tech|me))/gi;

  const found = new Set<string>();

  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    try {
      const parsed = new URL(match[1]);
      found.add(parsed.hostname.replace(/^www\./, ''));
    } catch {
      found.add(match[1]);
    }
  }

  while ((match = domainRegex.exec(text)) !== null) {
    found.add(match[1].toLowerCase());
  }

  return Array.from(found);
}
