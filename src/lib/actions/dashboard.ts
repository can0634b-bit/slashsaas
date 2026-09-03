'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../supabase/server';
import { getOrCreateUserOrganization } from '../supabase/organizations';
import { AppCategory, BillingCycle } from '../types/dashboard';

export async function createDetectedApp(data: {
  app_name: string;
  category: AppCategory;
  monthly_seat_cost: number;
  billing_cycle: BillingCycle;
  renewal_date?: string | null;
  seats_total: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const org = await getOrCreateUserOrganization(user);
  if (!org) throw new Error('Organization not found');

  const { error } = await supabase.from('detected_apps').insert({
    org_id: org.id,
    app_name: data.app_name.trim(),
    category: data.category,
    monthly_seat_cost: data.monthly_seat_cost,
    billing_cycle: data.billing_cycle,
    renewal_date: data.renewal_date ? data.renewal_date : null,
    seats_total: data.seats_total,
  });

  if (error) {
    console.error('createDetectedApp error:', error);
    throw new Error(error.message);
  }

  revalidatePath('/app');
  return { success: true };
}

export async function updateDetectedApp(
  appId: string,
  data: {
    app_name: string;
    category: AppCategory;
    monthly_seat_cost: number;
    billing_cycle: BillingCycle;
    renewal_date?: string | null;
    seats_total: number;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('detected_apps')
    .update({
      app_name: data.app_name.trim(),
      category: data.category,
      monthly_seat_cost: data.monthly_seat_cost,
      billing_cycle: data.billing_cycle,
      renewal_date: data.renewal_date ? data.renewal_date : null,
      seats_total: data.seats_total,
    })
    .eq('id', appId);

  if (error) {
    console.error('updateDetectedApp error:', error);
    throw new Error(error.message);
  }

  revalidatePath('/app');
  return { success: true };
}

export async function deleteDetectedApp(appId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase.from('detected_apps').delete().eq('id', appId);

  if (error) {
    console.error('deleteDetectedApp error:', error);
    throw new Error(error.message);
  }

  revalidatePath('/app');
  return { success: true };
}

export async function createSeat(data: {
  email: string;
  name?: string | null;
  department?: string | null;
  app_id?: string | null;
  last_active_at?: string | null;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const org = await getOrCreateUserOrganization(user);
  if (!org) throw new Error('Organization not found');

  const { error } = await supabase.from('seats').insert({
    org_id: org.id,
    email: data.email.trim().toLowerCase(),
    name: data.name?.trim() || null,
    department: data.department?.trim() || null,
    app_id: data.app_id ? data.app_id : null,
    last_active_at: data.last_active_at ? new Date(data.last_active_at).toISOString() : null,
    source: 'manual',
  });

  if (error) {
    console.error('createSeat error:', error);
    throw new Error(error.message);
  }

  revalidatePath('/app');
  return { success: true };
}

export async function updateSeat(
  seatId: string,
  data: {
    email: string;
    name?: string | null;
    department?: string | null;
    app_id?: string | null;
    last_active_at?: string | null;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('seats')
    .update({
      email: data.email.trim().toLowerCase(),
      name: data.name?.trim() || null,
      department: data.department?.trim() || null,
      app_id: data.app_id ? data.app_id : null,
      last_active_at: data.last_active_at ? new Date(data.last_active_at).toISOString() : null,
    })
    .eq('id', seatId);

  if (error) {
    console.error('updateSeat error:', error);
    throw new Error(error.message);
  }

  revalidatePath('/app');
  return { success: true };
}

export async function deleteSeat(seatId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase.from('seats').delete().eq('id', seatId);

  if (error) {
    console.error('deleteSeat error:', error);
    throw new Error(error.message);
  }

  revalidatePath('/app');
  return { success: true };
}

export async function bulkImportSeats(
  seats: Array<{
    email: string;
    name?: string;
    department?: string;
    app_id?: string;
    last_active_at?: string;
  }>
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const org = await getOrCreateUserOrganization(user);
  if (!org) throw new Error('Organization not found');

  if (!seats || seats.length === 0) {
    throw new Error('No valid seat records to import.');
  }

  const rowsToInsert = seats.map((s) => ({
    org_id: org.id,
    email: s.email.trim().toLowerCase(),
    name: s.name?.trim() || null,
    department: s.department?.trim() || null,
    app_id: s.app_id ? s.app_id : null,
    last_active_at: s.last_active_at ? new Date(s.last_active_at).toISOString() : null,
    source: 'csv_import',
  }));

  const { error } = await supabase.from('seats').insert(rowsToInsert);

  if (error) {
    console.error('bulkImportSeats error:', error);
    throw new Error(error.message);
  }

  revalidatePath('/app');
  return { success: true, count: rowsToInsert.length };
}

export async function recordScanAudit(summary: Record<string, any>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const org = await getOrCreateUserOrganization(user);
  if (!org) return;

  await supabase.from('scans').insert({
    org_id: org.id,
    status: 'completed',
    finished_at: new Date().toISOString(),
    summary_json: summary,
  });
}

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

