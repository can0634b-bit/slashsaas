import OpenAI from 'openai';
import { EngineAdapter, EngineRunOptions } from './types';
import { EngineRunResult } from '@/lib/types';

export const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

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
    const MAX_ATTEMPTS = 2;
    let lastError: any = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const isLastAttempt = attempt === MAX_ATTEMPTS;

      try {
        const response = await openai.chat.completions.create({
          model,
          messages: [{ role: 'user', content: promptText }],
          temperature: 0.2,
        });

        const rawResponse = response.choices[0]?.message?.content || '';

        // Estimate cost based on gpt-4o-mini pricing ($0.15/1M input, $0.60/1M output)
        const inTokens = response.usage?.prompt_tokens || 0;
        const outTokens = response.usage?.completion_tokens || 0;
        const costUsd = (inTokens / 1_000_000) * 0.15 + (outTokens / 1_000_000) * 0.60;

        return {
          model,
          rawResponse,
          citations: [], // Standard completion endpoint doesn't return web citations natively out of the box
          costUsd: costUsd > 0 ? costUsd : 0.0001,
        };
      } catch (err: any) {
        lastError = err;
        const classification = classifyOpenAIError(err);

        // Treat 403 / 401 as fatal, also 429 quota (insufficient_quota)
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
