-- Add 'nvidia' to the engine_type enum so audits answered by the NVIDIA NIM
-- free engine (fallback when the grounded Gemini engine is rate-limited) can be
-- recorded honestly. Idempotent; safe to run more than once.
alter type public.engine_type add value if not exists 'nvidia';
