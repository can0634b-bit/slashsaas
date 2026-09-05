export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  companyName?: string;
  organizationId: string;
  organizationName: string;
  role: 'owner' | 'admin' | 'member';
  createdAt: string;
}

export type EngineType = 'openai' | 'perplexity' | 'google_ai' | 'gemini';

export interface Brand {
  id: string;
  org_id: string;
  name: string;
  domain: string | null;
  is_self: boolean;
  aliases: string[];
  created_at: string;
  updated_at: string;
}

export interface Prompt {
  id: string;
  org_id: string;
  text: string;
  topic: string | null;
  locale: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Run {
  id: string;
  org_id: string;
  prompt_id: string;
  engine: EngineType;
  run_at: string;
  model: string | null;
  raw_response: string | null;
  cost_usd: number | null;
  created_at: string;
  updated_at: string;
}

export interface Mention {
  id: string;
  org_id: string;
  run_id: string;
  brand_id: string | null;
  mentioned: boolean;
  position: number | null;
  cited: boolean;
  citation_url: string | null;
  sentiment: string | null;
  snippet: string | null;
  created_at: string;
  updated_at: string;
}

export interface OnboardingPayload {
  selfBrand: {
    name: string;
    domain: string;
    aliases?: string[];
  };
  competitors: Array<{
    name: string;
    domain?: string;
  }>;
  prompts: Array<{
    text: string;
    topic?: string;
    locale?: string;
  }>;
}
