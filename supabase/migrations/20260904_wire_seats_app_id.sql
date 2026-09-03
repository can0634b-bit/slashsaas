-- ==============================================================================
-- SlashSaaS Migration: Wire Seat to App Relationship with ON DELETE SET NULL
-- ==============================================================================

-- 1. Ensure detected_apps columns exist
alter table public.detected_apps
  add column if not exists monthly_seat_cost numeric not null default 0,
  add column if not exists billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'annual')),
  add column if not exists renewal_date date,
  add column if not exists seats_total integer not null default 1;

-- 2. Ensure seats.app_id foreign key with ON DELETE SET NULL
alter table public.seats
  drop constraint if exists seats_app_id_fkey;

alter table public.seats
  add column if not exists app_id uuid;

alter table public.seats
  add constraint seats_app_id_fkey
  foreign key (app_id) references public.detected_apps(id)
  on delete set null;

create index if not exists idx_seats_app_id on public.seats(app_id);

-- 3. Ensure RLS policies are active and permit org members
alter table public.detected_apps enable row level security;
alter table public.seats enable row level security;

drop policy if exists "Members can view detected apps" on public.detected_apps;
create policy "Members can view detected apps"
  on public.detected_apps for select
  using (public.is_org_member(org_id));

drop policy if exists "Members can manage detected apps" on public.detected_apps;
create policy "Members can manage detected apps"
  on public.detected_apps for all
  using (public.is_org_member(org_id));

drop policy if exists "Members can view org seats" on public.seats;
create policy "Members can view org seats"
  on public.seats for select
  using (public.is_org_member(org_id));

drop policy if exists "Members can manage org seats" on public.seats;
create policy "Members can manage org seats"
  on public.seats for all
  using (public.is_org_member(org_id));
