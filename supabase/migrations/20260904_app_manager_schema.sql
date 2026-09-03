-- ==============================================================================
-- SlashSaaS Product Engine — Real License Manager Schema Extension
-- ==============================================================================

-- 1. Extend detected_apps with subscription financial metadata
alter table public.detected_apps
  add column if not exists monthly_seat_cost numeric not null default 0,
  add column if not exists billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'annual')),
  add column if not exists renewal_date date,
  add column if not exists seats_total integer not null default 1;

-- 2. Extend seats with foreign key to detected_apps
alter table public.seats
  add column if not exists app_id uuid references public.detected_apps(id) on delete set null;

-- Index for seat to app joins
create index if not exists idx_seats_app_id on public.seats(app_id);
