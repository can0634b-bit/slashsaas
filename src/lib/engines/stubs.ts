import { EngineAdapter, EngineRunOptions } from './types';
import { EngineRunResult } from '@/lib/types';

/**
 * TODO: Phase 4 Implementation — OpenAI Engine Adapter
 * Will query ChatGPT models (e.g. gpt-4o / gpt-4o-mini with web search capabilities)
 */
export class OpenAIAdapter implements EngineAdapter {
  id = 'openai' as const;
  displayName = 'OpenAI (ChatGPT)';

  async run(promptText: string, opts?: EngineRunOptions): Promise<EngineRunResult> {
    // TODO: Implement OpenAI web search run in Phase 4
    throw new Error('OpenAI adapter is scheduled for Phase 4. Currently active engine is Gemini.');
  }
}

/**
 * TODO: Phase 4 Implementation — Perplexity Engine Adapter
 * Will query Perplexity Sonar API with native online citation extraction
 */
export class PerplexityAdapter implements EngineAdapter {
  id = 'perplexity' as const;
  displayName = 'Perplexity AI';

  async run(promptText: string, opts?: EngineRunOptions): Promise<EngineRunResult> {
    // TODO: Implement Perplexity Sonar run in Phase 4
    throw new Error('Perplexity adapter is scheduled for Phase 4. Currently active engine is Gemini.');
  }
}
