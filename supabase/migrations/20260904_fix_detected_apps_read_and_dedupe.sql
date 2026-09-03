-- ==============================================================================
-- SlashSaaS Migration: Add created_at alias to detected_apps & Deduplicate Tools
-- ==============================================================================

-- 1. Ensure detected_apps has created_at column (defaulting to first_seen or now())
alter table public.detected_apps
  add column if not exists created_at timestamptz not null default now();

update public.detected_apps
set created_at = first_seen
where created_at is null and first_seen is not null;

-- 2. Deduplicate detected_apps by (org_id, lower(app_name))
do $$
declare
  dup_rec record;
  kept_app_id uuid;
  dup_app_ids uuid[];
begin
  for dup_rec in
    select org_id, lower(trim(app_name)) as norm_name
    from public.detected_apps
    group by org_id, lower(trim(app_name))
    having count(*) > 1
  loop
    -- Identify the oldest app record to keep
    select id into kept_app_id
    from public.detected_apps
    where org_id = dup_rec.org_id
      and lower(trim(app_name)) = dup_rec.norm_name
    order by first_seen asc, id asc
    limit 1;

    -- Collect duplicate IDs
    select array_agg(id) into dup_app_ids
    from public.detected_apps
    where org_id = dup_rec.org_id
      and lower(trim(app_name)) = dup_rec.norm_name
      and id != kept_app_id;

    if dup_app_ids is not null and array_length(dup_app_ids, 1) > 0 then
      -- Re-point any seats attached to duplicate apps
      update public.seats
      set app_id = kept_app_id
      where app_id = any(dup_app_ids);

      -- Delete the duplicate apps
      delete from public.detected_apps
      where id = any(dup_app_ids);

      raise notice 'Deduplicated % into % for org %', dup_rec.norm_name, kept_app_id, dup_rec.org_id;
    end if;
  end loop;
end $$;

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
