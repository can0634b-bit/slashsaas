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

/**
 * Idempotently retrieves the user's primary canonical organization.
 * Always picks the oldest organization (ORDER BY created_at ASC LIMIT 1).
 * Creates a new organization ONLY if none exists.
 */
export async function getOrCreateUserOrganization(user: {
  id: string;
  email?: string;
  user_metadata?: any;
}): Promise<Organization | null> {
  if (!user || !user.id) return null;

  const admin = createAdminClient();

  try {
    // 1. Check if user is the direct owner of any organization (oldest first)
    const { data: ownedOrgs, error: ownedError } = await admin
      .from('organizations')
      .select('*')
      .eq('owner_user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1);

    if (ownedError) {
      console.error('[ORG_RESOLVER] Error querying owned organizations:', ownedError);
    }

    if (ownedOrgs && ownedOrgs.length > 0) {
      const canonicalOrg = ownedOrgs[0] as Organization;

      // Ensure membership record exists for this canonical org
      await admin
        .from('memberships')
        .upsert(
          {
            user_id: user.id,
            org_id: canonicalOrg.id,
            role: 'owner',
          },
          { onConflict: 'user_id,org_id' }
        );

      return canonicalOrg;
    }

    // 2. Check if user is a member of any organization (oldest membership first)
    const { data: memberships, error: memberError } = await admin
      .from('memberships')
      .select('org_id, organizations(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1);

    if (memberError) {
      console.error('[ORG_RESOLVER] Error querying memberships:', memberError);
    }

    if (memberships && memberships.length > 0 && memberships[0]?.organizations) {
      return memberships[0].organizations as unknown as Organization;
    }

    // 3. User truly has NO organization — create exactly one
    const orgName =
      user.user_metadata?.company_name ||
      (user.user_metadata?.full_name ? `${user.user_metadata.full_name}'s Workspace` : null) ||
      (user.email ? `${user.email.split('@')[0]}'s Workspace` : 'My Workspace');

    const { data: newOrg, error: insertError } = await admin
      .from('organizations')
      .insert({
        name: orgName,
        owner_user_id: user.id,
      })
      .select()
      .single();

    if (insertError) {
      // If concurrent insert occurred, fetch the existing one
      console.warn('[ORG_RESOLVER] Concurrent org insert detected or error, fetching existing:', insertError.message);
      const { data: fallbackOrgs } = await admin
        .from('organizations')
        .select('*')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1);

      if (fallbackOrgs && fallbackOrgs.length > 0) {
        return fallbackOrgs[0] as Organization;
      }
      return null;
    }

    // Insert owner membership
    await admin.from('memberships').insert({
      user_id: user.id,
      org_id: newOrg.id,
      role: 'owner',
    });

    return newOrg as Organization;
  } catch (err) {
    console.error('[ORG_RESOLVER] Unexpected error resolving organization:', err);
    return null;
  }
}
