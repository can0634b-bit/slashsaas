-- ==============================================================================
-- SlashSaaS Migration: Drop Legacy License Auditor Tables
-- Preserves organizations & memberships tables, helper functions, and RLS policies
-- ==============================================================================

-- 1. Drop legacy product-specific tables with cascade
drop table if exists public.seats cascade;
drop table if exists public.detected_apps cascade;
drop table if exists public.scans cascade;
drop table if exists public.connections cascade;

-- 2. Ensure core multi-tenant organizations & memberships tables are intact
-- public.organizations (id, name, owner_user_id, created_at)
-- public.memberships (user_id, org_id, role, created_at)
-- public.is_org_member(lookup_org_id uuid) function