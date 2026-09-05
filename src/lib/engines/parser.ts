import { BrandMentionExtraction, CitationItem } from '@/lib/types';
import { MentionAnalysisInput } from './types';

interface GroqMentionItem {
  brand_id: string;
  mentioned: boolean;
  position: number | null;
  cited: boolean;
  citation_url: string | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  snippet: string | null;
}

function cleanDomain(domain?: string | null): string | null {
  if (!domain) return null;
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split('?')[0];
}

/**
 * Fallback extraction logic using case-insensitive substring search and URL domain matching.
 * Guarantees zero data loss if Groq API is unavailable or returns malformed JSON.
 */
function fallbackAnalyzeMentions(input: MentionAnalysisInput): BrandMentionExtraction[] {
  const { rawResponse, citations, selfBrand, competitors } = input;
  const lowerText = rawResponse.toLowerCase();

  const allBrands = [
    {
      id: selfBrand.id,
      name: selfBrand.name,
      domain: cleanDomain(selfBrand.domain),
      aliases: selfBrand.aliases || [],
      is_self: true,
    },
    ...competitors.map((c) => ({
      id: c.id,
      name: c.name,
      domain: cleanDomain(c.domain),
      aliases: [] as string[],
      is_self: false,
    })),
  ];

  interface MatchInfo {
    brand: (typeof allBrands)[0];
    mentioned: boolean;
    firstIndex: number;
    snippet: string | null;
    cited: boolean;
    citationUrl: string | null;
  }

  const matches: MatchInfo[] = [];

  for (const brand of allBrands) {
    const searchTerms = [brand.name, ...(brand.aliases || [])]
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    let earliestIndex = -1;
    let matchingTerm = '';

    for (const term of searchTerms) {
      const idx = lowerText.indexOf(term);
      if (idx !== -1 && (earliestIndex === -1 || idx < earliestIndex)) {
        earliestIndex = idx;
        matchingTerm = term;
      }
    }

    const mentioned = earliestIndex !== -1;
    let snippet: string | null = null;

    if (mentioned) {
      const start = Math.max(0, earliestIndex - 50);
      const end = Math.min(rawResponse.length, earliestIndex + matchingTerm.length + 80);
      snippet = (start > 0 ? '...' : '') + rawResponse.slice(start, end).trim() + (end < rawResponse.length ? '...' : '');
    }

    // Check citations
    let cited = false;
    let citationUrl: string | null = null;

    if (brand.domain && citations.length > 0) {
      const brandDomainLower = brand.domain.toLowerCase();
      const matchedCitation = citations.find((c) => c.url.toLowerCase().includes(brandDomainLower));
      if (matchedCitation) {
        cited = true;
        citationUrl = matchedCitation.url;
      }
    }

    matches.push({
      brand,
      mentioned,
      firstIndex: earliestIndex,
      snippet,
      cited,
      citationUrl,
    });
  }

  // Calculate positions: 1-based order of first appearance among mentioned brands
  const mentionedBrands = matches.filter((m) => m.mentioned).sort((a, b) => a.firstIndex - b.firstIndex);

  const positionMap = new Map<string, number>();
  mentionedBrands.forEach((item, index) => {
    positionMap.set(item.brand.id, index + 1);
  });

  return matches.map((m) => ({
    brand_id: m.brand.id,
    brand_name: m.brand.name,
    is_self: m.brand.is_self,
    mentioned: m.mentioned,
    position: positionMap.get(m.brand.id) || null,
    cited: m.cited,
    citation_url: m.citationUrl,
    sentiment: m.mentioned ? 'neutral' : null,
    snippet: m.snippet,
  }));
}

export const DEFAULT_GROQ_MODEL = 'llama-3.1-8b-instant';

let cachedGroqModel: string | null = null;

/**
 * Resolves a currently-valid Groq chat model. Model ids on Groq change over
 * time, so we never rely on a single hardcoded name:
 * (a) GROQ_MODEL env override, else
 * (b) runtime discovery via Groq's /models endpoint (cached), picking a general
 *     chat LLM (prefers a large llama/instruct; excludes audio/guard/embedding), else
 * (c) the DEFAULT_GROQ_MODEL fallback constant.
 */
export async function resolveGroqModel(apiKey?: string): Promise<string> {
  const envModel = process.env.GROQ_MODEL?.trim();
  if (envModel) return envModel;

  if (cachedGroqModel) return cachedGroqModel;

  const key = (apiKey || process.env.GROQ_API_KEY || '').trim();
  if (!key) return DEFAULT_GROQ_MODEL;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const ids: string[] = (data?.data || [])
        .map((m: { id?: string }) => String(m?.id || ''))
        .filter((id: string) => id.length > 0)
        .filter((id: string) => !/whisper|tts|guard|embed|vision|prompt-guard|allam/i.test(id));

      if (ids.length > 0) {
        const score = (id: string): number => {
          let s = 0;
          if (/llama/i.test(id)) s += 100;
          if (/versatile|instruct|instant/i.test(id)) s += 10;
          const b = id.match(/(\d+)\s*b/i);
          if (b) s += Math.min(parseInt(b[1], 10), 405);
          return s;
        };
        ids.sort((a, b) => score(b) - score(a));
        cachedGroqModel = ids[0];
        console.log('[GROQ_RESOLVER] Using Groq model:', cachedGroqModel);
        return cachedGroqModel;
      }
    } else {
      console.warn(`[GROQ_RESOLVER] ListModels HTTP ${res.status}`);
    }
  } catch (err: unknown) {
    console.warn('[GROQ_RESOLVER] Failed to discover Groq models:', (err as Error)?.message || err);
  }

  cachedGroqModel = DEFAULT_GROQ_MODEL;
  return cachedGroqModel;
}

/**
 * Parses raw AI engine response using Groq in strict JSON mode.
 * Robustly falls back to pattern matching on any error or missing keys.
 */
export async function analyzeMentions(input: MentionAnalysisInput): Promise<BrandMentionExtraction[]> {
  const apiKey = process.env.GROQ_API_KEY;
  const groqModel = await resolveGroqModel(apiKey);

  if (!apiKey || apiKey.trim().length === 0) {
    console.warn('[PARSER] GROQ_API_KEY is not set. Executing fallback regex analyzer.');
    return fallbackAnalyzeMentions(input);
  }

  const allBrands = [
    {
      id: input.selfBrand.id,
      name: input.selfBrand.name,
      domain: cleanDomain(input.selfBrand.domain),
      aliases: input.selfBrand.aliases || [],
      is_self: true,
    },
    ...input.competitors.map((c) => ({
      id: c.id,
      name: c.name,
      domain: cleanDomain(c.domain),
      aliases: [] as string[],
      is_self: false,
    })),
  ];

  const brandCatalog = allBrands.map((b) => ({
    brand_id: b.id,
    name: b.name,
    aliases: b.aliases,
    domain: b.domain,
    is_self: b.is_self,
  }));

  const citationUrls = input.citations.map((c) => c.url);

  const prompt = `Analyze the following AI assistant answer and citation sources to determine mentions, relative positions, citations, and sentiment for target brands.

TARGET BRANDS TO EVALUATE:
${JSON.stringify(brandCatalog, null, 2)}

CITATION URLS:
${JSON.stringify(citationUrls, null, 2)}

RAW AI ANSWER TEXT:
"""
${input.rawResponse.slice(0, 8000)}
"""

REQUIREMENTS:
1. For EACH brand in target brands, output an object with:
   - "brand_id": (string) matching the target brand's id
   - "mentioned": (boolean) true if the brand name or any alias appears as a product/tool recommendation
   - "position": (integer or null) 1-based order of first appearance among ALL mentioned brands. If not mentioned, null. (e.g. 1 for first mentioned, 2 for second, etc.)
   - "cited": (boolean) true if any URL in CITATION URLS matches the brand's domain
   - "citation_url": (string or null) the exact matching citation URL, or null
   - "sentiment": "positive" | "neutral" | "negative" | null
   - "snippet": (string or null) short 10-15 word quote where the brand is discussed, or null

Return ONLY a JSON object: { "mentions": [ ... ] }`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: groqModel,
        messages: [
          {
            role: 'system',
            content:
              'You are a rigorous GEO (Generative Engine Optimization) analytics model. You extract structured brand presence data from AI search answers. Output strictly JSON with no preamble.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0,
        max_tokens: 1500,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Groq HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Groq returned empty response body.');
    }

    const parsed = JSON.parse(content);
    const mentionsArray: GroqMentionItem[] = Array.isArray(parsed.mentions) ? parsed.mentions : [];

    if (mentionsArray.length === 0) {
      throw new Error('Groq returned empty mentions array.');
    }

    // Map extracted items back to each brand
    const resultMap = new Map<string, GroqMentionItem>();
    for (const m of mentionsArray) {
      if (m.brand_id) {
        resultMap.set(m.brand_id, m);
      }
    }

    // Combine with brand catalog to ensure no brand is missed
    return allBrands.map((b) => {
      const m = resultMap.get(b.id);
      if (m) {
        return {
          brand_id: b.id,
          brand_name: b.name,
          is_self: b.is_self,
          mentioned: Boolean(m.mentioned),
          position: typeof m.position === 'number' ? m.position : null,
          cited: Boolean(m.cited),
          citation_url: m.citation_url || null,
          sentiment: m.sentiment || (m.mentioned ? 'neutral' : null),
          snippet: m.snippet || null,
        };
      }

      // If a brand was omitted in Groq JSON, fall back for that individual brand
      const fallbackList = fallbackAnalyzeMentions(input);
      const fallbackItem = fallbackList.find((f) => f.brand_id === b.id);
      return (
        fallbackItem || {
          brand_id: b.id,
          brand_name: b.name,
          is_self: b.is_self,
          mentioned: false,
          position: null,
          cited: false,
          citation_url: null,
          sentiment: null,
          snippet: null,
        }
      );
    });
  } catch (err: any) {
    console.warn('[PARSER] Groq analysis error, using fallback analyzer:', err?.message || err);
    return fallbackAnalyzeMentions(input);
  }
}
