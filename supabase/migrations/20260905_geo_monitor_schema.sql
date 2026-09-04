-- ==============================================================================
-- SlashSaaS v1 — AI Search Visibility (GEO) Monitor Core Schema & RLS
-- ==============================================================================

-- 1. Projects (Scoped to Organization)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  brand_name text not null,
  brand_domain text not null,
  created_at timestamptz not null default now()
);

alter table public.projects add column if not exists org_id uuid references public.organizations(id) on delete cascade;
alter table public.projects add column if not exists name text;
alter table public.projects add column if not exists brand_name text;
alter table public.projects add column if not exists brand_domain text;
alter table public.projects add column if not exists created_at timestamptz default now();

-- 2. Tracked Queries (Search prompts monitored for AI engine recommendations)
create table if not exists public.tracked_queries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  query_text text not null,
  created_at timestamptz not null default now()
);

alter table public.tracked_queries add column if not exists project_id uuid references public.projects(id) on delete cascade;
alter table public.tracked_queries add column if not exists query_text text;
alter table public.tracked_queries add column if not exists created_at timestamptz default now();

-- 3. Competitors (Competitor brands to benchmark against)
create table if not exists public.competitors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.competitors add column if not exists project_id uuid references public.projects(id) on delete cascade;
alter table public.competitors add column if not exists name text;
alter table public.competitors add column if not exists created_at timestamptz default now();

-- 4. Scans (Audits per project)
create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  engine text not null default 'gemini',
  status text not null default 'running' check (status in ('running', 'done', 'failed')),
  overall_score numeric null default 0,
  brand_mention_rate numeric null default 0,
  share_of_voice numeric null default 0,
  error_message text null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  summary_json jsonb not null default '{}'::jsonb
);

alter table public.scans add column if not exists project_id uuid references public.projects(id) on delete cascade;
alter table public.scans add column if not exists engine text default 'gemini';
alter table public.scans add column if not exists status text default 'running';
alter table public.scans add column if not exists overall_score numeric default 0;
alter table public.scans add column if not exists brand_mention_rate numeric default 0;
alter table public.scans add column if not exists share_of_voice numeric default 0;
alter table public.scans add column if not exists error_message text;
alter table public.scans add column if not exists started_at timestamptz default now();
alter table public.scans add column if not exists finished_at timestamptz;
alter table public.scans add column if not exists created_at timestamptz default now();
alter table public.scans add column if not exists summary_json jsonb default '{}'::jsonb;

-- 5. Scan Results (Detailed per-query audit data with raw answer evidence)
create table if not exists public.scan_results (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scans(id) on delete cascade,
  query_id uuid references public.tracked_queries(id) on delete set null,
  query_text text not null,
  engine text not null default 'gemini',
  brand_mentioned boolean not null default false,
  brand_rank integer null,
  competitors_found jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  visibility_score numeric not null default 0,
  raw_answer text not null,
  sample_count integer not null default 1,
  samples_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.scan_results add column if not exists scan_id uuid references public.scans(id) on delete cascade;
alter table public.scan_results add column if not exists query_id uuid references public.tracked_queries(id) on delete set null;
alter table public.scan_results add column if not exists query_text text;
alter table public.scan_results add column if not exists engine text default 'gemini';
alter table public.scan_results add column if not exists brand_mentioned boolean default false;
alter table public.scan_results add column if not exists brand_rank integer;
alter table public.scan_results add column if not exists competitors_found jsonb default '[]'::jsonb;
alter table public.scan_results add column if not exists sources jsonb default '[]'::jsonb;
alter table public.scan_results add column if not exists visibility_score numeric default 0;
alter table public.scan_results add column if not exists raw_answer text;
alter table public.scan_results add column if not exists sample_count integer default 1;
alter table public.scan_results add column if not exists samples_json jsonb default '[]'::jsonb;
alter table public.scan_results add column if not exists created_at timestamptz default now();

-- Enable RLS
alter table public.projects enable row level security;
alter table public.tracked_queries enable row level security;
alter table public.competitors enable row level security;
alter table public.scans enable row level security;
alter table public.scan_results enable row level security;

-- Drop existing policies if any
drop policy if exists "Members can view org projects" on public.projects;
drop policy if exists "Members can manage org projects" on public.projects;

drop policy if exists "Members can view project queries" on public.tracked_queries;
drop policy if exists "Members can manage project queries" on public.tracked_queries;

drop policy if exists "Members can view project competitors" on public.competitors;
drop policy if exists "Members can manage project competitors" on public.competitors;

drop policy if exists "Members can view project scans" on public.scans;
drop policy if exists "Members can manage project scans" on public.scans;

drop policy if exists "Members can view scan results" on public.scan_results;
drop policy if exists "Members can manage scan results" on public.scan_results;

-- Policies: Projects
create policy "Members can view org projects"
  on public.projects for select
  using (public.is_org_member(org_id));

create policy "Members can manage org projects"
  on public.projects for all
  using (public.is_org_member(org_id));

-- Policies: Tracked Queries
create policy "Members can view project queries"
  on public.tracked_queries for select
  using (exists (select 1 from public.projects p where p.id = project_id and public.is_org_member(p.org_id)));

create policy "Members can manage project queries"
  on public.tracked_queries for all
  using (exists (select 1 from public.projects p where p.id = project_id and public.is_org_member(p.org_id)));

-- Policies: Competitors
create policy "Members can view project competitors"
  on public.competitors for select
  using (exists (select 1 from public.projects p where p.id = project_id and public.is_org_member(p.org_id)));

create policy "Members can manage project competitors"
  on public.competitors for all
  using (exists (select 1 from public.projects p where p.id = project_id and public.is_org_member(p.org_id)));

-- Policies: Scans
create policy "Members can view project scans"
  on public.scans for select
  using (exists (select 1 from public.projects p where p.id = project_id and public.is_org_member(p.org_id)));

create policy "Members can manage project scans"
  on public.scans for all
  using (exists (select 1 from public.projects p where p.id = project_id and public.is_org_member(p.org_id)));

-- Policies: Scan Results
create policy "Members can view scan results"
  on public.scan_results for select
  using (exists (
    select 1 from public.scans s
    join public.projects p on p.id = s.project_id
    where s.id = scan_id and public.is_org_member(p.org_id)
  ));

create policy "Members can manage scan results"
  on public.scan_results for all
  using (exists (
    select 1 from public.scans s
    join public.projects p on p.id = s.project_id
    where s.id = scan_id and public.is_org_member(p.org_id)
  ));

-- Performance Indexes
create index if not exists idx_projects_org on public.projects(org_id);
create index if not exists idx_tracked_queries_project on public.tracked_queries(project_id);
create index if not exists idx_competitors_project on public.competitors(project_id);
create index if not exists idx_scans_project on public.scans(project_id);
create index if not exists idx_scans_created_at on public.scans(project_id, created_at desc);
create index if not exists idx_scan_results_scan on public.scan_results(scan_id);
