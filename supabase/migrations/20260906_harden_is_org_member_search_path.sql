-- Security hardening: pin the search_path on the SECURITY DEFINER function so it
-- cannot be hijacked via a mutable search_path (Supabase linter advisory
-- "function_search_path_mutable"). All referenced objects are already schema-
-- qualified (public.memberships, auth.uid()), so an empty search_path is safe.

create or replace function public.is_org_member(lookup_org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships
    where user_id = auth.uid()
      and org_id = lookup_org_id
  );
$$;
