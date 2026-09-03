import { createClient } from './server';
import { createAdminClient } from './admin';

export interface Organization {
  id: string;
  name: string;
  owner_user_id: string;
  created_at: string;
}

export interface Membership {
  user_id: string;
  org_id: string;
  role: string;
}

export async function getOrCreateUserOrganization(user: { id: string; email?: string; user_metadata?: any }): Promise<Organization | null> {
  const supabase = await createClient();

  // 1. Try to find existing membership for this user
  const { data: existingMembership, error: memberError } = await supabase
    .from('memberships')
    .select('org_id, organizations(*)')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingMembership?.organizations) {
    return existingMembership.organizations as unknown as Organization;
  }

  // 2. If no organization exists, create one using admin client (to bypass initial bootstrap RLS if needed)
  try {
    const admin = createAdminClient();
    const orgName = user.user_metadata?.company_name ||
      (user.user_metadata?.full_name ? `${user.user_metadata.full_name}'s Workspace` : null) ||
      (user.email ? `${user.email.split('@')[0]}'s Workspace` : 'My Workspace');

    const { data: newOrg, error: orgError } = await admin
      .from('organizations')
      .insert({
        name: orgName,
        owner_user_id: user.id,
      })
      .select()
      .single();

    if (orgError || !newOrg) {
      console.error('Error creating organization:', orgError);
      return null;
    }

    // Insert membership
    const { error: memberInsertError } = await admin
      .from('memberships')
      .insert({
        user_id: user.id,
        org_id: newOrg.id,
        role: 'owner',
      });

    if (memberInsertError) {
      console.error('Error creating membership:', memberInsertError);
    }

    return newOrg as Organization;
  } catch (err) {
    console.error('getOrCreateUserOrganization unexpected error:', err);
    return null;
  }
}
