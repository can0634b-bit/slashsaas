import { EngineAdapter, EngineRunOptions } from './types';
import { EngineRunResult } from '@/lib/types';

/**
 * TODO: Phase 4 Implementation — Perplexity Engine Adapter
 * Will query Perplexity Sonar API with native online citation extraction
 */
export class PerplexityAdapter implements EngineAdapter {
  id = 'perplexity' as const;
  displayName = 'Perplexity AI';

  async run(promptText: string, opts?: EngineRunOptions): Promise<EngineRunResult> {
    // TODO: Implement Perplexity Sonar run in Phase 4
    throw new Error('Perplexity adapter is scheduled for Phase 4.');
  }
}
