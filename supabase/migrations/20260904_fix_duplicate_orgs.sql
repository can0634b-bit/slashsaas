-- ==============================================================================
-- SlashSaaS Data Cleanup Migration — Consolidate Duplicate Organizations
-- ==============================================================================

do $$
declare
  user_rec record;
  kept_org_id uuid;
  dup_org_ids uuid[];
begin
  -- Loop through every user who has more than 1 organization
  for user_rec in
    select owner_user_id
    from public.organizations
    where owner_user_id is not null
    group by owner_user_id
    having count(*) > 1
  loop
    -- 1. Identify the oldest canonical organization for this user
    select id into kept_org_id
    from public.organizations
    where owner_user_id = user_rec.owner_user_id
    order by created_at asc
    limit 1;

    -- 2. Collect all duplicate organization IDs
    select array_agg(id) into dup_org_ids
    from public.organizations
    where owner_user_id = user_rec.owner_user_id
      and id != kept_org_id;

    if dup_org_ids is not null and array_length(dup_org_ids, 1) > 0 then
      -- Re-point detected_apps (e.g. Figma and other entered tools)
      update public.detected_apps
      set org_id = kept_org_id
      where org_id = any(dup_org_ids);

      -- Re-point seats
      update public.seats
      set org_id = kept_org_id
      where org_id = any(dup_org_ids);

      -- Re-point connections
      update public.connections
      set org_id = kept_org_id
      where org_id = any(dup_org_ids);

      -- Re-point scans
      update public.scans
      set org_id = kept_org_id
      where org_id = any(dup_org_ids);

      -- Clean up duplicate memberships
      delete from public.memberships
      where org_id = any(dup_org_ids);

      -- Ensure owner membership exists for the kept organization
      insert into public.memberships (user_id, org_id, role)
      values (user_rec.owner_user_id, kept_org_id, 'owner')
      on conflict (user_id, org_id) do nothing;

      -- Delete the duplicate organizations
      delete from public.organizations
      where id = any(dup_org_ids);

      raise notice 'Consolidated user % orgs into kept org %', user_rec.owner_user_id, kept_org_id;
    end if;
  end loop;
end $$;

-- Safety: Add unique constraint on owner_user_id so duplicates are prevented at DB level
alter table public.organizations
  drop constraint if exists organizations_owner_user_id_key;

alter table public.organizations
  add constraint organizations_owner_user_id_key unique (owner_user_id);
