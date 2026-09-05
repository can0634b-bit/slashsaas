import { EngineType } from '@/lib/types';
import { EngineAdapter } from './types';
import { GeminiAdapter } from './gemini';
import { GroqAdapter } from './groq';
import { OpenAIAdapter, PerplexityAdapter } from './stubs';

const adapters: Record<EngineType, EngineAdapter> = {
  gemini: new GeminiAdapter(),
  google_ai: new GeminiAdapter(),
  groq: new GroqAdapter(),
  openai: new OpenAIAdapter(),
  perplexity: new PerplexityAdapter(),
};

/**
 * Returns the engine adapter for the specified engine type.
 * Default is Gemini.
 */
export function getEngineAdapter(engine: EngineType = 'gemini'): EngineAdapter {
  const adapter = adapters[engine];
  if (!adapter) {
    return adapters.gemini;
  }
  return adapter;
}

export * from './types';
export * from './gemini';
export * from './groq';
export * from './stubs';
export * from './parser';
