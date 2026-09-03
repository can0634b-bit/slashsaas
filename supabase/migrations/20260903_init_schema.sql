-- ==============================================================================
-- SlashSaaS Product Engine — Core Schema & Row Level Security (RLS) Migration
-- ==============================================================================

-- 1. Organizations
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 2. Memberships
create table if not exists public.memberships (
  user_id uuid references auth.users(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (user_id, org_id)
);

-- 3. Connections (OAuth & Directory Integrations)
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null check (provider in ('google', 'slack', 'okta', 'azure')),
  status text not null default 'active' check (status in ('active', 'disconnected', 'error')),
  scopes text[] not null default '{}',
  encrypted_token text, -- Server-side only encrypted credential
  created_at timestamptz not null default now()
);

-- 4. Seats (Dormant & Tracked User Licenses)
create table if not exists public.seats (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  name text,
  department text,
  last_active_at timestamptz,
  dormancy_days integer not null default 0,
  source text not null default 'google',
  created_at timestamptz not null default now()
);

-- 5. Detected Apps (Discovered SaaS & AI Tools)
create table if not exists public.detected_apps (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  app_name text not null,
  category text not null default 'saas' check (category in ('saas', 'ai', 'shadow')),
  first_seen timestamptz not null default now(),
  users_count integer not null default 1
);

-- 6. Scans (Audit Runs & Financial Reports)
create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running', 'completed', 'failed')),
  summary_json jsonb not null default '{}'::jsonb
);

-- ==============================================================================
-- Row Level Security (RLS) Setup
-- ==============================================================================

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.connections enable row level security;
alter table public.seats enable row level security;
alter table public.detected_apps enable row level security;
alter table public.scans enable row level security;

-- Helper function: Is user a member of target organization?
create or replace function public.is_org_member(lookup_org_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.memberships
    where user_id = auth.uid()
      and org_id = lookup_org_id
  );
$$;

-- RLS: Organizations
create policy "Users can view organizations they belong to"
  on public.organizations for select
  using (public.is_org_member(id) or owner_user_id = auth.uid());

create policy "Users can update organizations they own or admin"
  on public.organizations for update
  using (owner_user_id = auth.uid());

-- RLS: Memberships
create policy "Members can view org memberships"
  on public.memberships for select
  using (public.is_org_member(org_id) or user_id = auth.uid());

-- RLS: Connections
create policy "Members can view org connections"
  on public.connections for select
  using (public.is_org_member(org_id));

create policy "Members can manage org connections"
  on public.connections for all
  using (public.is_org_member(org_id));

-- RLS: Seats
create policy "Members can view org seats"
  on public.seats for select
  using (public.is_org_member(org_id));

create policy "Members can manage org seats"
  on public.seats for all
  using (public.is_org_member(org_id));

-- RLS: Detected Apps
create policy "Members can view detected apps"
  on public.detected_apps for select
  using (public.is_org_member(org_id));

create policy "Members can manage detected apps"
  on public.detected_apps for all
  using (public.is_org_member(org_id));

-- RLS: Scans
create policy "Members can view scans"
  on public.scans for select
  using (public.is_org_member(org_id));

create policy "Members can manage scans"
  on public.scans for all
  using (public.is_org_member(org_id));

-- Performance Indexes
create index if not exists idx_memberships_user_org on public.memberships(user_id, org_id);
create index if not exists idx_seats_org on public.seats(org_id);
create index if not exists idx_detected_apps_org on public.detected_apps(org_id);
create index if not exists idx_connections_org on public.connections(org_id);
create index if not exists idx_scans_org on public.scans(org_id);
