-- ==============================================================================
-- SlashSaaS: allow 'groq' as an engine_type value.
--
-- When the grounded engine (Gemini) is rate-limited / quota-exhausted, audits
-- automatically fall back to Groq (Llama) so they still complete on the free
-- tier. Recording engine = 'groq' keeps the data honest about which model
-- produced each answer. Run this in the Supabase SQL Editor.
-- ==============================================================================
ALTER TYPE engine_type ADD VALUE IF NOT EXISTS 'groq';
