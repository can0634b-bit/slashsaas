'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../supabase/server';
import { getOrCreateUserOrganization } from '../supabase/organizations';

export async function updateUserProfile(data: {
  fullName?: string;
  companyName?: string;
  orgName?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const org = await getOrCreateUserOrganization(user);

  // 1. Update Supabase Auth user metadata
  const { error: userUpdateError } = await supabase.auth.updateUser({
    data: {
      full_name: data.fullName?.trim() || user.user_metadata?.full_name,
      company_name: data.companyName?.trim() || user.user_metadata?.company_name,
    },
  });

  if (userUpdateError) {
    console.error('updateUserProfile auth error:', userUpdateError);
    throw new Error(userUpdateError.message);
  }

  // 2. Update Organization Name if provided and user is owner
  if (org && data.orgName && data.orgName.trim().length > 0) {
    const { error: orgUpdateError } = await supabase
      .from('organizations')
      .update({ name: data.orgName.trim() })
      .eq('id', org.id);

    if (orgUpdateError) {
      console.error('updateUserProfile org error:', orgUpdateError);
    }
  }

  revalidatePath('/app');
  revalidatePath('/app/profile');
  return { success: true };
}
