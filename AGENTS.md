<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SlashSaaS — Agent Operating Rules (read before EVERY task)

## 0. Your training data is STALE — never trust it for version-sensitive facts
Your built-in knowledge of model names, API methods, SDK signatures, library
versions, pricing, and deprecations is OUT OF DATE and has already caused a
production failure (you shipped a retired Gemini model name). For ANYTHING
version-sensitive, do NOT answer from memory — VERIFY against ground truth:
- Read the ACTUAL installed version in package.json / node_modules and use that
  SDK's real exported methods/types (open the .d.ts files if unsure).
- For external model/API providers, DISCOVER capabilities at RUNTIME (e.g. call
  the provider's ListModels/models endpoint) instead of assuming a model exists.
- Fetch the CURRENT official docs when needed; prefer the newest stable API the
  installed SDK supports.
- If unsure whether a name/method/model still exists, assume it may have changed
  and add a runtime check + a clear fallback.

## 1. Never hardcode volatile identifiers
Model names, API versions, endpoints, pricing → must be:
env-configurable override → runtime-discovered (pick newest valid) → fail-loud
fallback constant. Never a single bare hardcoded string that breaks silently.

## 2. Fail loud, never blind
Propagate REAL error messages to logs + API responses + UI. Never collapse a
failure into a generic "0 of N". Persist the actual error where it's debuggable.

## 3. Verify before declaring done
Run the build; then exercise the REAL path (a live call or a health endpoint)
with real keys; report the EXACT versions, model names, and endpoints you used.
"It compiles" is NOT "it works".

## Project facts
- Product: AI Search Visibility (GEO) monitor — tracks how AI assistants
  (ChatGPT/Perplexity/Google AI/Gemini) answer about a brand vs competitors over time.
- Stack: Next.js (App Router)+Tailwind, Supabase (Postgres/Auth/RLS), Vercel,
  LemonSqueezy (Merchant of Record). Engines: Gemini (Step A) + Groq (Step B parser).
- Design: dark, premium, green accent — match existing components; must NOT look
  generic/AI-generated.

## HARD CONSTRAINTS (never violate)
- DATA MINIMIZATION: ingest only PUBLIC data (brand name, domain, competitor
  names, public prompts) + the user's email. NEVER collect customer/employee data,
  credentials, or connect to users' third-party accounts.
- NO integrations that hold tokens or act on the user's behalf (no Slack/Teams
  OAuth posting). Notifications = email or a user-provided webhook URL only.
- Secrets are server-only (never NEXT_PUBLIC_). Enforce RLS; scope every query by
  the org derived from the authenticated session, never from client input.
- Don't break existing working features; each audit stays a NEW time-series row.
