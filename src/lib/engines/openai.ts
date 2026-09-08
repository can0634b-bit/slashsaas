import OpenAI from 'openai';
import { EngineAdapter, EngineRunOptions } from './types';
import { EngineRunResult } from '@/lib/types';

export const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

// Web search tool cost is a per-call fee on top of standard tokens. 
// Ref: OpenAI pricing docs indicate ~$10-$25 per 1000 searches. Using $0.015 default.
const OPENAI_WEBSEARCH_COST_PER_CALL = parseFloat(process.env.OPENAI_WEBSEARCH_COST_PER_CALL || '0.015');

export function getOpenAIApiKeys(): string[] {
  const raw = [
    process.env.OPENAI_API_KEY,
    process.env.OPENAI_API_KEY_2,
    process.env.OPENAI_API_KEY_3,
    ...((process.env.OPENAI_API_KEYS || '').split(',')),
  ];
  const keys = raw
    .map((k) => (k || '').trim().replace(/^["']|["']$/g, ''))
    .filter((k) => k.length > 0);
  return Array.from(new Set(keys));
}

function classifyOpenAIError(err: any) {
  const status = err?.status || err?.response?.status;
  const message = err?.message?.toLowerCase() || '';
  
  const isFatal = status === 401 || status === 403 || message.includes('invalid api key') || message.includes('incorrect api key') || message.includes('project has been denied access') || message.includes('insufficient_quota');
  const isRateLimit = status === 429 || message.includes('rate limit') || message.includes('quota');
  const isOverloaded = status === 500 || status === 502 || status === 503 || message.includes('overloaded');

  return { isFatal, isRateLimit, isOverloaded };
}

export class OpenAIAdapter implements EngineAdapter {
  id = 'openai' as const;
  displayName = 'OpenAI';

  async run(promptText: string, opts?: EngineRunOptions): Promise<EngineRunResult> {
    const keys = getOpenAIApiKeys();
    if (keys.length === 0) {
      throw new Error('OPENAI_API_KEY is not configured on the server.');
    }

    let lastKeyError: any = null;

    for (let kIdx = 0; kIdx < keys.length; kIdx++) {
      const apiKey = keys[kIdx];
      const isLastKey = kIdx === keys.length - 1;

      try {
        return await this.generateWithRetries(apiKey, promptText);
      } catch (err: any) {
        lastKeyError = err;
        
        if (!isLastKey) {
          const c = classifyOpenAIError(err);
          const reason = c.isRateLimit ? 'rate-limited/quota' : c.isFatal ? 'access/auth denied' : 'error';
          console.warn(`[OPENAI_ADAPTER] API key #${kIdx + 1} ${reason} — rotating to key #${kIdx + 2}...`);
          continue;
        }
        throw err;
      }
    }
    throw lastKeyError || new Error('All OpenAI API keys failed.');
  }

  private async generateWithRetries(apiKey: string, promptText: string): Promise<EngineRunResult> {
    const openai = new OpenAI({ apiKey });
    const model = DEFAULT_OPENAI_MODEL;
    const MAX_ATTEMPTS = 4;
    let lastError: any = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const isLastAttempt = attempt === MAX_ATTEMPTS;

      try {
                const response = await openai.responses.create({
          model,
          input: [
            { role: 'developer', content: 'Use web search to find current information and cite your sources with URLs. Do not answer from prior knowledge alone.' },
            { role: 'user', content: promptText }
          ],
          tools: [{ type: 'web_search' }],
          tool_choice: 'required'
        });
        
        let rawResponse = '';
        const citationsSet = new Map<string, string>(); // url -> title
        let searchUsed = false;
        
        // --- 1A: Diagnostics FIRST ---
        const itemTypes = (response.output || []).map(item => item.type).join(', ');
        const hasWebSearchCall = (response.output || []).some(item => item.type === 'web_search_call' || (item as any).type === 'tool_call');
        const debugString = `[DEBUG] model: ${model} | output_items: [${itemTypes}] | web_search_call: ${hasWebSearchCall} | usage: ${JSON.stringify(response.usage)}`;
        console.log(debugString);


        if (response.output) {
          for (const item of response.output) {
            if (item.type === 'message' && item.content) {
              for (const content of item.content) {
                if (content.type === 'output_text') {
                  rawResponse += content.text;
                  if (content.annotations) {
                    for (const ann of content.annotations) {
                      if (ann.type === 'url_citation' && ann.url) {
                        citationsSet.set(ann.url, ann.title || ann.url);
                        searchUsed = true; // Web search actually provided citations
                      }
                    }
                  }
                }
              }
            } else if (item.type === 'web_search_call') {
               searchUsed = true;
            } else if ((item as any).type === 'tool_call' && (item as any).tool?.type === 'web_search') {
               searchUsed = true;
            }
          }
        }
        
                if (!rawResponse && (response as any).output_text) {
           rawResponse = (response as any).output_text;
        }
        
        // Persist debug string invisibly in the raw_response
        rawResponse += `

<!-- ${debugString} -->`;


        const citations = Array.from(citationsSet.entries()).map(([url, title]) => ({ url, title }));
        
        if (citations.length === 0 && rawResponse) {
           console.warn(`[OPENAI_ADAPTER] Web search returned no citations. Grounding may be missing.`);
        }

        // Estimate cost based on gpt-4o pricing
        const inTokens = response.usage?.input_tokens || 0;
        const outTokens = response.usage?.output_tokens || 0;
        let costUsd = (inTokens / 1_000_000) * 2.50 + (outTokens / 1_000_000) * 10.00;
        
        // Add the per-call web search cost if the tool was utilized
        if (searchUsed || citations.length > 0) {
           costUsd += OPENAI_WEBSEARCH_COST_PER_CALL;
        }

        return {
          model,
          rawResponse,
          citations,
          costUsd: costUsd > 0 ? costUsd : 0.0001,
        };
      } catch (err: any) {
        lastError = err;
        const classification = classifyOpenAIError(err);
        
        // --- 1C: Surface EXACT error for web_search requirements ---
        // NOTE: The built-in web_search tool via the Responses API requires:
        // 1. A compatible model (e.g., gpt-4o, gpt-5 series).
        // 2. A Paid account tier.
        // 3. For some accounts/models, Organization Verification (KYC check via Stripe Identity).
        // We throw the raw error message to ensure these requirements are visible to the developer/user.

        if (classification.isFatal || isLastAttempt) {
          throw new Error(`Live Engine API error (model: ${model}): ${err?.message || String(err)}`);
        }

        if (classification.isRateLimit || classification.isOverloaded) {
          const backoff = 2000 * Math.pow(2, attempt - 1) + Math.random() * 500;
          console.warn(`[OPENAI_ADAPTER] Overloaded/RateLimit. Attempt ${attempt}/${MAX_ATTEMPTS}. Retrying in ${Math.round(backoff)}ms...`);
          await new Promise((r) => setTimeout(r, backoff));
          continue;
        }

        throw new Error(`Live Engine API error (model: ${model}): ${err?.message || String(err)}`);
      }
    }

    throw lastError || new Error(`Live Engine API error (model: ${model})`);
  }
}
