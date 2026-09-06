-- Distributed rate limiting for public endpoints (waitlist, scorecard), shared
-- across all serverless instances. The table is locked down (RLS on, no
-- policies) so only the SECURITY DEFINER function / service role can touch it.

create table if not exists public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  count int not null default 0,
  primary key (key, window_start)
);

alter table public.rate_limits enable row level security;
-- Intentionally NO policies: anon/authenticated clients get zero access.

-- Atomically increments the counter for (key, current window) and returns true
-- when the request is OVER the limit (i.e. should be blocked). Old windows for
-- the key are pruned on the way in to keep the table bounded.
create or replace function public.check_rate_limit(
  p_key text,
  p_max int,
  p_window_seconds int
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );
  v_count int;
begin
  delete from public.rate_limits
    where key = p_key and window_start < v_window;

  insert into public.rate_limits (key, window_start, count)
  values (p_key, v_window, 1)
  on conflict (key, window_start)
    do update set count = public.rate_limits.count + 1
  returning count into v_count;

  return v_count > p_max;
end;
$$;

revoke all on function public.check_rate_limit(text, int, int) from public, anon, authenticated;
