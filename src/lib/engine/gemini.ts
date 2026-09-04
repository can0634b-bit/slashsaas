import { GoogleGenAI } from '@google/genai';
import { AiSearchEngine, CompetitorMention } from './types';

export interface ExtractionOutput {
  brandMentioned: boolean;
  brandRank: number | null;
  competitorsFound: CompetitorMention[];
  sources: string[];
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({ apiKey });
}

export class GeminiSearchEngine implements AiSearchEngine {
  name = 'gemini';
  displayName = 'Google Gemini';

  /**
   * Samples a single user query against Gemini with fast response & timeout guard.
   */
  async sampleQuery(queryText: string): Promise<{ rawAnswer: string; sources: string[] }> {
    const ai = getGeminiClient();
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

    // 10-second timeout guard to guarantee Next.js / Vercel responsiveness
    const generatePromise = ai.models.generateContent({
      model: modelName,
      contents: queryText,
      config: {
        systemInstruction:
          'You are an intelligent, helpful AI search assistant. Answer the user prompt directly, objectively, and comprehensively. Provide specific product, software, brand, or service recommendations with clear rationale where relevant. Format clearly with markdown headings or numbered lists.',
        temperature: 0.7,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini request timed out on ${modelName} after 10s`)), 10000)
    );

    const response = (await Promise.race([generatePromise, timeoutPromise])) as any;
    const rawAnswer = response.text || '';

    if (!rawAnswer) {
      throw new Error(`Empty response received from ${modelName}`);
    }

    const sources = extractUrlsAndDomains(rawAnswer);

    return {
      rawAnswer,
      sources,
    };
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

function extractUrlsAndDomains(text: string): string[] {
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
