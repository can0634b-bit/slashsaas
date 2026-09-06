-- ==============================================================================
-- Organizations: billing plan column (per-plan usage limits / cost control)
-- ==============================================================================
-- Adds a `plan` to each organization so the audit engine can enforce a per-plan
-- daily audit cap (the primary Gemini/Groq cost lever). Everyone defaults to
-- 'free' (tight cap) because payments aren't wired yet; an org is promoted to a
-- paid plan manually until LemonSqueezy sets it automatically on checkout.

alter table public.organizations
  add column if not exists plan text not null default 'free';

do $$ begin
  alter table public.organizations
    add constraint organizations_plan_check
    check (plan in ('free', 'radar', 'command', 'unlimited'));
exception
  when duplicate_object then null;
end $$;

-- ------------------------------------------------------------------------------
-- Manual step (run once): give your own dogfood org the internal 'unlimited'
-- plan so testing is never blocked by the free-tier cap. Scoped by owner email:
--
--   update public.organizations
--   set plan = 'unlimited'
--   where owner_user_id = (select id from auth.users where email = 'can.0634b@gmail.com');
-- ------------------------------------------------------------------------------
