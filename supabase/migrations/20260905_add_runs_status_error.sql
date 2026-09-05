-- ==============================================================================
-- SlashSaaS: Add status and error columns to public.runs for audit observability
-- ==============================================================================

alter table public.runs add column if not exists status text not null default 'ok';
alter table public.runs add column if not exists error text null;

-- Index for filtering runs by status
create index if not exists idx_runs_status on public.runs(org_id, status);
