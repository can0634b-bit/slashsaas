'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../supabase/server';
import { getCurrentOrgId } from '../supabase/geo';
import { OnboardingPayload } from '../types';

function cleanDomain(input?: string | null): string | null {
  if (!input) return null;
  let clean = input.trim().toLowerCase();
  clean = clean.replace(/^https?:\/\//, '');
  clean = clean.replace(/^www\./, '');
  clean = clean.split('/')[0].split('?')[0];
  return clean || null;
}

/**
 * Onboarding: Atomically provisions the self brand, initial competitors,
 * and tracked prompts for the organization.
 */
export async function completeOnboardingAction(payload: OnboardingPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const orgId = await getCurrentOrgId();
    const supabase = await createClient();

    // 1. Validate Self Brand
    const selfName = payload.selfBrand.name?.trim();
    const selfDomain = cleanDomain(payload.selfBrand.domain);

    if (!selfName) {
      return { success: false, error: 'Your brand name is required.' };
    }
    if (!selfDomain) {
      return { success: false, error: 'A valid brand domain is required (e.g. acme.com).' };
    }

    // 2. Check if a self brand already exists
    const { data: existingSelf } = await supabase
      .from('brands')
      .select('id')
      .eq('org_id', orgId)
      .eq('is_self', true)
      .maybeSingle();

    if (existingSelf) {
      return { success: false, error: 'Your organization already has an active brand registered.' };
    }

    // 3. Insert Self Brand
    const cleanAliases = (payload.selfBrand.aliases || [])
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const { error: selfError } = await supabase.from('brands').insert({
      org_id: orgId,
      name: selfName,
      domain: selfDomain,
      is_self: true,
      aliases: cleanAliases,
    });

    if (selfError) {
      console.error('[ONBOARDING] Error inserting self brand:', selfError);
      return { success: false, error: selfError.message || 'Failed to save brand.' };
    }

    // 4. Insert Competitors (up to 10)
    const validCompetitors = (payload.competitors || [])
      .slice(0, 10)
      .filter((c) => c.name && c.name.trim().length > 0)
      .map((c) => ({
        org_id: orgId,
        name: c.name.trim(),
        domain: cleanDomain(c.domain),
        is_self: false,
        aliases: [] as string[],
      }));

    if (validCompetitors.length > 0) {
      const { error: compError } = await supabase.from('brands').insert(validCompetitors);
      if (compError) {
        console.warn('[ONBOARDING] Warning inserting competitors:', compError);
      }
    }

    // 5. Insert Prompts (up to 25)
    const validPrompts = (payload.prompts || [])
      .slice(0, 25)
      .filter((p) => p.text && p.text.trim().length > 0)
      .map((p) => ({
        org_id: orgId,
        text: p.text.trim(),
        topic: p.topic?.trim() || null,
        locale: p.locale?.trim() || 'en',
        is_active: true,
      }));

    if (validPrompts.length > 0) {
      const { error: promptsError } = await supabase.from('prompts').insert(validPrompts);
      if (promptsError) {
        console.warn('[ONBOARDING] Warning inserting prompts:', promptsError);
      }
    }

    revalidatePath('/app');
    return { success: true };
  } catch (err: any) {
    console.error('[ONBOARDING] Unexpected error:', err);
    return { success: false, error: err.message || 'An unexpected error occurred during onboarding.' };
  }
}

/**
 * Add a competitor brand to the organization.
 */
export async function addCompetitorAction(data: {
  name: string;
  domain?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const orgId = await getCurrentOrgId();
    const supabase = await createClient();

    const name = data.name?.trim();
    if (!name) {
      return { success: false, error: 'Competitor name is required.' };
    }

    // Check soft limit: max 15 competitors
    const { count, error: countError } = await supabase
      .from('brands')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('is_self', false);

    if (!countError && (count ?? 0) >= 15) {
      return { success: false, error: 'Competitor limit reached (maximum 15 competitors for this workspace).' };
    }

    const { error } = await supabase.from('brands').insert({
      org_id: orgId,
      name,
      domain: cleanDomain(data.domain),
      is_self: false,
      aliases: [],
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/app');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to add competitor.' };
  }
}

/**
 * Remove a competitor brand. Cannot remove the self brand.
 */
export async function removeBrandAction(brandId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const orgId = await getCurrentOrgId();
    const supabase = await createClient();

    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', brandId)
      .eq('org_id', orgId)
      .eq('is_self', false);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/app');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to remove brand.' };
  }
}

/**
 * Update the organization's primary self brand.
 */
export async function updateSelfBrandAction(data: {
  name: string;
  domain: string;
  aliases?: string[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const orgId = await getCurrentOrgId();
    const supabase = await createClient();

    const name = data.name?.trim();
    const domain = cleanDomain(data.domain);

    if (!name || !domain) {
      return { success: false, error: 'Brand name and domain are required.' };
    }

    const cleanAliases = (data.aliases || [])
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const { error } = await supabase
      .from('brands')
      .update({
        name,
        domain,
        aliases: cleanAliases,
      })
      .eq('org_id', orgId)
      .eq('is_self', true);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/app');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update brand.' };
  }
}

/**
 * Add a tracked prompt.
 */
export async function addPromptAction(data: {
  text: string;
  topic?: string;
  locale?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const orgId = await getCurrentOrgId();
    const supabase = await createClient();

    const text = data.text?.trim();
    if (!text || text.length < 5) {
      return { success: false, error: 'Prompt text must be at least 5 characters long.' };
    }

    // Check soft limit: max 25 prompts
    const { count, error: countError } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId);

    if (!countError && (count ?? 0) >= 25) {
      return { success: false, error: 'Prompt limit reached (maximum 25 prompts for this workspace).' };
    }

    const { error } = await supabase.from('prompts').insert({
      org_id: orgId,
      text,
      topic: data.topic?.trim() || null,
      locale: data.locale?.trim() || 'en',
      is_active: true,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/app');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to add prompt.' };
  }
}

/**
 * Toggle active state of a tracked prompt.
 */
export async function togglePromptActiveAction(promptId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const orgId = await getCurrentOrgId();
    const supabase = await createClient();

    const { error } = await supabase
      .from('prompts')
      .update({ is_active: isActive })
      .eq('id', promptId)
      .eq('org_id', orgId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/app');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update prompt status.' };
  }
}

/**
 * Update prompt query text and topic tag.
 */
export async function updatePromptAction(
  promptId: string,
  data: { text: string; topic?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const orgId = await getCurrentOrgId();
    const supabase = await createClient();

    const text = data.text?.trim();
    if (!text || text.length < 5) {
      return { success: false, error: 'Prompt text must be at least 5 characters long.' };
    }

    const { error } = await supabase
      .from('prompts')
      .update({
        text,
        topic: data.topic?.trim() || null,
      })
      .eq('id', promptId)
      .eq('org_id', orgId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/app');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to edit prompt.' };
  }
}

/**
 * Delete a tracked prompt.
 */
export async function deletePromptAction(promptId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const orgId = await getCurrentOrgId();
    const supabase = await createClient();

    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', promptId)
      .eq('org_id', orgId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/app');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete prompt.' };
  }
}
