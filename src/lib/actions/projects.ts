'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../supabase/server';
import { getOrCreateUserOrganization } from '../supabase/organizations';
import { runProjectScan } from '../engine/runner';

export async function createProject(data: {
  name: string;
  brandName: string;
  brandDomain: string;
  initialQueries?: string[];
  initialCompetitors?: string[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const org = await getOrCreateUserOrganization(user);
  if (!org) throw new Error('Organization not found');

  const cleanDomain = data.brandDomain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];

  const { data: newProject, error: projectError } = await supabase
    .from('projects')
    .insert({
      org_id: org.id,
      name: data.name.trim(),
      brand_name: data.brandName.trim(),
      brand_domain: cleanDomain,
    })
    .select()
    .single();

  if (projectError || !newProject) {
    console.error('createProject error:', projectError);
    throw new Error(projectError?.message || 'Failed to create project');
  }

  // Insert initial queries if provided
  if (data.initialQueries && data.initialQueries.length > 0) {
    const queryRows = data.initialQueries
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .map((q) => ({
        project_id: newProject.id,
        query_text: q,
      }));

    if (queryRows.length > 0) {
      await supabase.from('tracked_queries').insert(queryRows);
    }
  }

  // Insert initial competitors if provided
  if (data.initialCompetitors && data.initialCompetitors.length > 0) {
    const compRows = data.initialCompetitors
      .map((c) => c.trim())
      .filter((c) => c.length > 0)
      .map((c) => ({
        project_id: newProject.id,
        name: c,
      }));

    if (compRows.length > 0) {
      await supabase.from('competitors').insert(compRows);
    }
  }

  revalidatePath('/app');
  return { success: true, projectId: newProject.id };
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase.from('projects').delete().eq('id', projectId);

  if (error) {
    console.error('deleteProject error:', error);
    throw new Error(error.message);
  }

  revalidatePath('/app');
  return { success: true };
}

export async function addTrackedQuery(data: { projectId: string; queryText: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const cleanText = data.queryText.trim();
  if (!cleanText) throw new Error('Query prompt cannot be empty.');

  const { data: newQuery, error } = await supabase
    .from('tracked_queries')
    .insert({
      project_id: data.projectId,
      query_text: cleanText,
    })
    .select()
    .single();

  if (error) {
    console.error('addTrackedQuery error:', error);
    throw new Error(error.message);
  }

  revalidatePath(`/app/projects/${data.projectId}`);
  return { success: true, query: newQuery };
}

export async function deleteTrackedQuery(queryId: string, projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase.from('tracked_queries').delete().eq('id', queryId);

  if (error) {
    console.error('deleteTrackedQuery error:', error);
    throw new Error(error.message);
  }

  revalidatePath(`/app/projects/${projectId}`);
  return { success: true };
}

export async function addCompetitor(data: { projectId: string; name: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const cleanName = data.name.trim();
  if (!cleanName) throw new Error('Competitor name cannot be empty.');

  const { data: newCompetitor, error } = await supabase
    .from('competitors')
    .insert({
      project_id: data.projectId,
      name: cleanName,
    })
    .select()
    .single();

  if (error) {
    console.error('addCompetitor error:', error);
    throw new Error(error.message);
  }

  revalidatePath(`/app/projects/${data.projectId}`);
  return { success: true, competitor: newCompetitor };
}

export async function deleteCompetitor(competitorId: string, projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase.from('competitors').delete().eq('id', competitorId);

  if (error) {
    console.error('deleteCompetitor error:', error);
    throw new Error(error.message);
  }

  revalidatePath(`/app/projects/${projectId}`);
  return { success: true };
}

export async function triggerProjectScan(projectId: string) {
  try {
    const result = await runProjectScan({
      projectId,
      engineName: 'gemini',
      sampleCount: 3,
    });

    revalidatePath(`/app/projects/${projectId}`);
    revalidatePath('/app');
    return result;
  } catch (err: any) {
    console.error('triggerProjectScan server action error:', err);
    throw new Error(err.message || 'Scan execution failed');
  }
}
