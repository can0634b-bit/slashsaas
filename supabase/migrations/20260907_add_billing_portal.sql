-- Add billing portal URL for LemonSqueezy subscription management
alter table public.organizations
  add column if not exists billing_portal_url text;
