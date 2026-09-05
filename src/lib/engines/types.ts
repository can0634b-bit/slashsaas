import { EngineType, EngineRunResult, CitationItem } from '@/lib/types';

export interface EngineRunOptions {
  locale?: string;
}

export interface EngineAdapter {
  id: EngineType;
  displayName: string;
  run(promptText: string, opts?: EngineRunOptions): Promise<EngineRunResult>;
}

export interface ExtractionBrandInput {
  id: string;
  name: string;
  domain?: string | null;
  aliases?: string[];
  is_self: boolean;
}

export interface MentionAnalysisInput {
  rawResponse: string;
  citations: CitationItem[];
  selfBrand: {
    id: string;
    name: string;
    domain?: string | null;
    aliases?: string[];
  };
  competitors: Array<{
    id: string;
    name: string;
    domain?: string | null;
  }>;
}
