import { GoogleGenAI, Type } from '@google/genai';
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

// Global cached working model to avoid repeated 404 lookups
let cachedWorkingModel: string | null = null;

// Official active 2026 model hierarchy for @google/genai (prohibited: gemini-1.5-*)
const PRIMARY_CANDIDATE_MODELS = [
  'gemini-3-flash-preview',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-3-pro-preview',
];

async function getCandidateModels(ai: GoogleGenAI): Promise<string[]> {
  const envModel = process.env.GEMINI_MODEL;

  if (cachedWorkingModel) {
    return [cachedWorkingModel, ...PRIMARY_CANDIDATE_MODELS.filter((m) => m !== cachedWorkingModel)];
  }

  if (envModel) {
    return [envModel, ...PRIMARY_CANDIDATE_MODELS.filter((m) => m !== envModel)];
  }

  // Try dynamic model resolution from the user's API key
  try {
    const list = await ai.models.list({ config: { pageSize: 30 } });
    const discovered: string[] = [];
    for await (const m of list) {
      const name = m.name?.replace(/^models\//, '');
      if (
        name &&
        !name.includes('1.5') &&
        !name.includes('embedding') &&
        !name.includes('aqa') &&
        (name.includes('flash') || name.includes('gemini-3') || name.includes('gemini-2'))
      ) {
        discovered.push(name);
      }
    }
    if (discovered.length > 0) {
      console.log('[GEMINI_DISCOVERED_ACTIVE_MODELS]', discovered);
      return discovered;
    }
  } catch (listErr) {
    console.warn('[GEMINI_LIST_MODELS_FALLBACK_USING_DEFAULTS]', listErr);
  }

  return PRIMARY_CANDIDATE_MODELS;
}

export class GeminiSearchEngine implements AiSearchEngine {
  name = 'gemini';
  displayName = 'Google Gemini';

  /**
   * Samples a single user query against Gemini to simulate an AI search engine response.
   * Automatically resolves and cascades across active 2026 Gemini model versions.
   */
  async sampleQuery(queryText: string): Promise<{ rawAnswer: string; sources: string[] }> {
    const ai = getGeminiClient();
    const candidateModels = await getCandidateModels(ai);

    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: queryText,
          config: {
            systemInstruction:
              'You are an intelligent, helpful AI search assistant. Answer the user prompt directly, objectively, and comprehensively. Provide specific product, software, brand, or service recommendations with clear rationale where relevant. Format clearly with markdown headings or lists.',
            temperature: 0.7,
          },
        });

        const rawAnswer = response.text || '';
        if (!rawAnswer) {
          throw new Error(`Empty response from model ${modelName}`);
        }

        // Cache working model for fast subsequent calls
        cachedWorkingModel = modelName;

        const sources = extractUrlsAndDomains(rawAnswer);

        return {
          rawAnswer,
          sources,
        };
      } catch (err: any) {
        lastError = err;
        console.warn(`[GEMINI_MODEL_${modelName}_ATTEMPT_FAILED]`, err?.message || err);
        // Continue to next candidate model
      }
    }

    throw new Error(`Failed to query Gemini AI engine: ${lastError?.message || 'All candidate models failed'}`);
  }
}

/**
 * Strictly grounded AI extractor using Gemini Structured Output with anti-hallucination verification.
 */
export async function extractGroundedMentions(
  rawAnswer: string,
  brandName: string,
  brandDomain: string,
  competitorNames: string[]
): Promise<ExtractionOutput> {
  const ai = getGeminiClient();
  const candidateModels = await getCandidateModels(ai);

  const prompt = `You are a strict, objective brand audit extractor. Analyze the following AI-generated text and extract factual entity mentions strictly grounded in the text.

=== TEXT TO ANALYZE ===
${rawAnswer}
=== END OF TEXT ===

TARGET BRAND: "${brandName}" (domain: "${brandDomain}")
COMPETITORS TO CHECK: ${JSON.stringify(competitorNames)}

STRICT GROUNDING RULES:
1. brand_mentioned MUST be true ONLY if the brand name "${brandName}" or domain "${brandDomain}" is explicitly present in the text. If not in the text, it MUST be false.
2. brand_rank: If the text contains a numbered list, ordered ranking, or sequential recommendation of tools/services, provide the 1-based integer rank of "${brandName}". If mentioned but not in an explicit ranked order, set to null. If not mentioned, set to null.
3. competitors_found: For each competitor in the list, determine if they are mentioned (true/false) and their 1-based rank if in a ranked list.
4. sources: List any external websites, domain names (e.g. "g2.com", "techradar.com"), or URLs referenced in the text.
`;

  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              brand_mentioned: { type: Type.BOOLEAN },
              brand_rank: { type: Type.INTEGER, nullable: true },
              competitors_found: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    mentioned: { type: Type.BOOLEAN },
                    rank: { type: Type.INTEGER, nullable: true },
                  },
                  required: ['name', 'mentioned'],
                },
              },
              sources: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['brand_mentioned', 'competitors_found', 'sources'],
          },
          temperature: 0.1,
        },
      });

      const parsed = JSON.parse(response.text || '{}');

      // Post-verification check to ensure no hallucination
      const normalizedRaw = rawAnswer.toLowerCase();
      const brandNameLower = brandName.toLowerCase();
      const brandDomainLower = brandDomain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');

      let verifiedMention = Boolean(parsed.brand_mentioned);
      if (!normalizedRaw.includes(brandNameLower) && !normalizedRaw.includes(brandDomainLower)) {
        // Force false if the brand string is physically not in the text
        verifiedMention = false;
      }

      const verifiedCompetitors: CompetitorMention[] = competitorNames.map((compName) => {
        const foundItem = (parsed.competitors_found || []).find(
          (c: any) => c.name?.toLowerCase() === compName.toLowerCase()
        );
        const isMentioned = Boolean(foundItem?.mentioned) && normalizedRaw.includes(compName.toLowerCase());
        return {
          name: compName,
          mentioned: isMentioned,
          rank: isMentioned && typeof foundItem?.rank === 'number' ? foundItem.rank : null,
        };
      });

      const combinedSources = Array.from(
        new Set([
          ...(parsed.sources || []),
          ...extractUrlsAndDomains(rawAnswer),
        ])
      ).filter((s) => typeof s === 'string' && s.trim().length > 0);

      return {
        brandMentioned: verifiedMention,
        brandRank: verifiedMention && typeof parsed.brand_rank === 'number' ? parsed.brand_rank : null,
        competitorsFound: verifiedCompetitors,
        sources: combinedSources,
      };
    } catch (err) {
      console.warn(`[GROUNDED_EXTRACTION_MODEL_${modelName}_ATTEMPT_FAILED]`, err);
      // Try next model or fallback
    }
  }

  // Fallback heuristic extraction if structured output API fails across all models
  return fallbackExtraction(rawAnswer, brandName, brandDomain, competitorNames);
}

/**
 * Deterministic fallback regex extractor if structured output API fails.
 */
function fallbackExtraction(
  rawAnswer: string,
  brandName: string,
  brandDomain: string,
  competitorNames: string[]
): ExtractionOutput {
  const normalized = rawAnswer.toLowerCase();
  const brandNameLower = brandName.toLowerCase();
  const brandDomainLower = brandDomain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');

  const brandMentioned = normalized.includes(brandNameLower) || normalized.includes(brandDomainLower);

  const competitorsFound: CompetitorMention[] = competitorNames.map((c) => ({
    name: c,
    mentioned: normalized.includes(c.toLowerCase()),
    rank: null,
  }));

  const sources = extractUrlsAndDomains(rawAnswer);

  return {
    brandMentioned,
    brandRank: brandMentioned ? 1 : null,
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
