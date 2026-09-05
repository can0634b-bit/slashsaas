import { createClient } from './server';
import { getOrCreateUserOrganization, Organization } from './organizations';
import { Brand, Prompt } from '@/lib/types';
import { User } from '@supabase/supabase-js';

/**
 * Resolves the authenticated user and their canonical organization.
 * Idempotently creates an organization if none exists.
 */
export async function getCurrentOrg(): Promise<{ user: User; org: Organization }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const org = await getOrCreateUserOrganization(user);
  if (!org) {
    throw new Error('Organization not found');
  }

  return { user, org };
}

/**
 * Returns the canonical org_id for the currently authenticated user.
 */
export async function getCurrentOrgId(): Promise<string> {
  const { org } = await getCurrentOrg();
  return org.id;
}

export interface GeoWorkspaceData {
  selfBrand: Brand | null;
  competitors: Brand[];
  prompts: Prompt[];
}

/**
 * Fetches all GEO workspace data (self brand, competitors, prompts)
 * for the given organization using authenticated RLS queries.
 */
export async function getGeoWorkspaceData(orgId: string): Promise<GeoWorkspaceData> {
  const supabase = await createClient();

  // Query all brands for this organization
  const { data: brands, error: brandsError } = await supabase
    .from('brands')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true });

  if (brandsError) {
    console.error('[GEO_DATA] Error fetching brands:', brandsError);
  }

  // Query prompts for this organization
  const { data: prompts, error: promptsError } = await supabase
    .from('prompts')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (promptsError) {
    console.error('[GEO_DATA] Error fetching prompts:', promptsError);
  }

  const brandList = (brands || []) as Brand[];
  const selfBrand = brandList.find((b) => b.is_self) || null;
  const competitors = brandList.filter((b) => !b.is_self);

  return {
    selfBrand,
    competitors,
    prompts: (prompts || []) as Prompt[],
  };
}
