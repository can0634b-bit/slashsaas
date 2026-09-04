import { AiSearchEngine } from './types';
import { extractUrlsAndDomains } from './gemini';

const GROQ_CANDIDATE_MODELS = [
  process.env.GROQ_MODEL,
  'llama-3.3-70b-versatile',
  'deepseek-r1-distill-llama-70b',
  'llama-3.1-8b-instant',
].filter(Boolean) as string[];

export class GroqSearchEngine implements AiSearchEngine {
  name = 'groq';
  displayName = 'Groq (Llama 3.3)';

  async sampleQuery(queryText: string): Promise<{ rawAnswer: string; sources: string[] }> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('GROQ_API_KEY environment variable is missing.');
    }

    let lastError: any = null;

    for (const model of GROQ_CANDIDATE_MODELS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content:
                  'You are an intelligent, helpful AI search assistant. Answer the user prompt directly, objectively, and comprehensively. Provide specific product, software, brand, or service recommendations with clear rationale where relevant. Format clearly with markdown headings or numbered lists.',
              },
              {
                role: 'user',
                content: queryText,
              },
            ],
            temperature: 0.7,
            max_tokens: 1500,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.error?.message || `Groq HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();
        const rawAnswer = data.choices?.[0]?.message?.content || '';

        if (!rawAnswer || rawAnswer.trim().length === 0) {
          throw new Error(`Empty response from Groq model ${model}`);
        }

        const sources = extractUrlsAndDomains(rawAnswer);

        return {
          rawAnswer,
          sources,
        };
      } catch (err: any) {
        lastError = err;
        console.warn(`[GroqSearchEngine] Model "${model}" failed, trying next candidate:`, err?.message || err);
      }
    }

    throw new Error(
      `Groq AI motoru tüm modellerde (${GROQ_CANDIDATE_MODELS.join(', ')}) hata verdi. Son hata: ${lastError?.message || 'Bilinmeyen hata'}`
    );
  }
}
