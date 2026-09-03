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
    app_id: data.app_id || null,
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
    app_id: s.app_id || null,
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
