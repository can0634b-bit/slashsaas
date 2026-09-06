-- ==============================================================================
-- Runs: store the full citation list per audit (Citation Source Intelligence)
-- ==============================================================================
-- Gemini's Google Search grounding returns the sources it pulled from. Until now
-- only per-brand citation_url (mentions) was kept; the FULL source list per run
-- was discarded. Store it as jsonb so we can aggregate "which sources the AI
-- cites when answering your buyer prompts" — the flagship Command feature.
-- Shape: [{ "url": string, "title": string }] (CitationItem[]). Null for older
-- runs and for ungrounded (Groq-fallback) runs.

alter table public.runs
  add column if not exists citations jsonb;
