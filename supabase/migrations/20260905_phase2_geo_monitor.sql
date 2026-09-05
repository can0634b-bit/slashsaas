-- ==============================================================================
-- SlashSaaS Phase 2: AI Search Visibility (GEO) Monitoring Schema
-- ==============================================================================

-- 1. Engine Type Enum (static reference for AI search engines)
do $$ begin
  create type public.engine_type as enum ('openai', 'perplexity', 'google_ai', 'gemini');
exception
  when duplicate_object then null;
end $$;

-- 2. Brands Table (Both self brand and competitors)
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  domain text null,
  is_self boolean not null default false,
  aliases text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure only one brand per organization can have is_self = true
create unique index if not exists idx_brands_one_self_per_org
  on public.brands (org_id)
  where (is_self = true);

-- Case-insensitive uniqueness for brand names within the same organization
create unique index if not exists idx_brands_unique_name_per_org
  on public.brands (org_id, lower(trim(name)));

-- 3. Prompts Table (Natural language queries monitored across engines)
create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  text text not null,
  topic text null,
  locale text not null default 'en',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Prevent duplicate identical query text per org
create unique index if not exists idx_prompts_unique_text_per_org
  on public.prompts (org_id, lower(trim(text)));

-- 4. Runs Table (Audit executions per prompt and engine — prepared for Phase 3)
create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  engine public.engine_type not null,
  run_at timestamptz not null default now(),
  model text null,
  raw_response text null,
  cost_usd numeric(10, 6) null,
  status text not null default 'ok',
  error text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Mentions Table (Brand mentions, ranking, citations within a run — prepared for Phase 3)
create table if not exists public.mentions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  run_id uuid not null references public.runs(id) on delete cascade,
  brand_id uuid references public.brands(id) on delete set null,
  mentioned boolean not null default false,
  position integer null,
  cited boolean not null default false,
  citation_url text null,
  sentiment text null,
  snippet text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. Performance Indexes
create index if not exists idx_brands_org on public.brands(org_id);
create index if not exists idx_brands_is_self on public.brands(org_id, is_self);
create index if not exists idx_prompts_org on public.prompts(org_id);
create index if not exists idx_prompts_active on public.prompts(org_id, is_active);
create index if not exists idx_runs_org on public.runs(org_id);
create index if not exists idx_runs_prompt on public.runs(prompt_id);
create index if not exists idx_runs_run_at on public.runs(org_id, run_at desc);
create index if not exists idx_mentions_org on public.mentions(org_id);
create index if not exists idx_mentions_run on public.mentions(run_id);
create index if not exists idx_mentions_brand on public.mentions(brand_id);

-- 7. Updated_at Trigger Function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trigger_brands_updated_at on public.brands;
create trigger trigger_brands_updated_at
  before update on public.brands
  for each row execute function public.set_updated_at();

drop trigger if exists trigger_prompts_updated_at on public.prompts;
create trigger trigger_prompts_updated_at
  before update on public.prompts
  for each row execute function public.set_updated_at();

drop trigger if exists trigger_runs_updated_at on public.runs;
create trigger trigger_runs_updated_at
  before update on public.runs
  for each row execute function public.set_updated_at();

drop trigger if exists trigger_mentions_updated_at on public.mentions;
create trigger trigger_mentions_updated_at
  before update on public.mentions
  for each row execute function public.set_updated_at();

-- 8. Row Level Security (RLS)
alter table public.brands enable row level security;
alter table public.prompts enable row level security;
alter table public.runs enable row level security;
alter table public.mentions enable row level security;

-- Drop existing policies if any
drop policy if exists "Members can view org brands" on public.brands;
drop policy if exists "Members can insert org brands" on public.brands;
drop policy if exists "Members can update org brands" on public.brands;
drop policy if exists "Members can delete org brands" on public.brands;

drop policy if exists "Members can view org prompts" on public.prompts;
drop policy if exists "Members can insert org prompts" on public.prompts;
drop policy if exists "Members can update org prompts" on public.prompts;
drop policy if exists "Members can delete org prompts" on public.prompts;

drop policy if exists "Members can view org runs" on public.runs;
drop policy if exists "Members can insert org runs" on public.runs;
drop policy if exists "Members can update org runs" on public.runs;
drop policy if exists "Members can delete org runs" on public.runs;

drop policy if exists "Members can view org mentions" on public.mentions;
drop policy if exists "Members can insert org mentions" on public.mentions;
drop policy if exists "Members can update org mentions" on public.mentions;
drop policy if exists "Members can delete org mentions" on public.mentions;

-- Policies: Brands
create policy "Members can view org brands"
  on public.brands for select
  using (public.is_org_member(org_id));

create policy "Members can insert org brands"
  on public.brands for insert
  with check (public.is_org_member(org_id));

create policy "Members can update org brands"
  on public.brands for update
  using (public.is_org_member(org_id));

create policy "Members can delete org brands"
  on public.brands for delete
  using (public.is_org_member(org_id));

-- Policies: Prompts
create policy "Members can view org prompts"
  on public.prompts for select
  using (public.is_org_member(org_id));

create policy "Members can insert org prompts"
  on public.prompts for insert
  with check (public.is_org_member(org_id));

create policy "Members can update org prompts"
  on public.prompts for update
  using (public.is_org_member(org_id));

create policy "Members can delete org prompts"
  on public.prompts for delete
  using (public.is_org_member(org_id));

-- Policies: Runs
create policy "Members can view org runs"
  on public.runs for select
  using (public.is_org_member(org_id));

create policy "Members can insert org runs"
  on public.runs for insert
  with check (public.is_org_member(org_id));

create policy "Members can update org runs"
  on public.runs for update
  using (public.is_org_member(org_id));

create policy "Members can delete org runs"
  on public.runs for delete
  using (public.is_org_member(org_id));

-- Policies: Mentions
create policy "Members can view org mentions"
  on public.mentions for select
  using (public.is_org_member(org_id));

create policy "Members can insert org mentions"
  on public.mentions for insert
  with check (public.is_org_member(org_id));

create policy "Members can update org mentions"
  on public.mentions for update
  using (public.is_org_member(org_id));

create policy "Members can delete org mentions"
  on public.mentions for delete
  using (public.is_org_member(org_id));
