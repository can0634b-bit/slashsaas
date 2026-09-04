import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { runProjectScan } from '@/lib/engine/runner';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Allow up to 5 minutes for autonomous fleet scanning on Vercel Pro/Hobby

/**
 * Validates request authorization for Vercel Cron execution.
 */
function isAuthorizedCron(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is configured in environment, strictly enforce it
  if (cronSecret && cronSecret.trim().length > 0) {
    const authHeader = req.headers.get('authorization');
    const xCronHeader = req.headers.get('x-cron-secret');
    const urlSecret = req.nextUrl.searchParams.get('secret');

    const isBearerMatch = authHeader === `Bearer ${cronSecret}`;
    const isHeaderMatch = xCronHeader === cronSecret;
    const isParamMatch = urlSecret === cronSecret;

    if (!isBearerMatch && !isHeaderMatch && !isParamMatch) {
      return false;
    }
  }

  return true;
}

export async function GET(req: NextRequest) {
  return handleOrchestratorRun(req);
}

export async function POST(req: NextRequest) {
  return handleOrchestratorRun(req);
}

async function handleOrchestratorRun(req: NextRequest) {
  const startTime = Date.now();

  // 1. Verify Authorization
  if (!isAuthorizedCron(req)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized: Invalid or missing CRON_SECRET token.',
      },
      { status: 401 }
    );
  }

  try {
    const supabase = createAdminClient();
    const targetProjectId = req.nextUrl.searchParams.get('projectId');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50', 10);

    // 2. Discover Projects
    let query = supabase
      .from('projects')
      .select('id, name, brand_name, org_id, tracked_queries(id)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (targetProjectId) {
      query = query.eq('id', targetProjectId);
    }

    const { data: rawProjects, error: projectsError } = await query;

    if (projectsError) {
      console.error('[CRON_PROJECTS_FETCH_ERROR]', projectsError);
      return NextResponse.json(
        { success: false, error: projectsError.message },
        { status: 500 }
      );
    }

    // Filter projects that actually have tracked queries configured
    const eligibleProjects = (rawProjects || []).filter(
      (p: any) => Array.isArray(p.tracked_queries) && p.tracked_queries.length > 0
    );

    if (eligibleProjects.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No eligible projects with active tracked queries found to scan.',
        totalDiscovered: (rawProjects || []).length,
        scanned: 0,
        durationMs: Date.now() - startTime,
      });
    }

    const results: Array<{ projectId: string; projectName: string; scanId: string; overallScore: number }> = [];
    const errors: Array<{ projectId: string; projectName: string; error: string }> = [];

    // 3. Sequential Execution with Throttling
    for (let i = 0; i < eligibleProjects.length; i++) {
      const project = eligibleProjects[i];

      try {
        console.log(`[ORCHESTRATOR] Running autonomous scan for project "${project.name}" (${project.id})...`);
        const scanRes = await runProjectScan({
          projectId: project.id,
          engineName: 'gemini',
          sampleCount: 3,
          isAutonomous: true,
        });

        results.push({
          projectId: project.id,
          projectName: project.name,
          scanId: scanRes.scanId,
          overallScore: scanRes.summary.overallVisibilityScore,
        });
      } catch (err: any) {
        console.error(`[ORCHESTRATOR_PROJECT_FAILED] Project "${project.name}" (${project.id}):`, err);
        errors.push({
          projectId: project.id,
          projectName: project.name,
          error: err?.message || 'Unknown scan error',
        });
      }

      // Throttle delay between projects to respect Gemini free-tier rate limits (unless it's the last project)
      if (i < eligibleProjects.length - 1) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      agent: 'Orchestrator (Ajan 1)',
      timestamp: new Date().toISOString(),
      durationMs,
      totalDiscovered: (rawProjects || []).length,
      eligibleToScan: eligibleProjects.length,
      succeeded: results.length,
      failed: errors.length,
      results,
      errors,
    });
  } catch (fatalErr: any) {
    console.error('[ORCHESTRATOR_FATAL_ERROR]', fatalErr);
    return NextResponse.json(
      {
        success: false,
        error: fatalErr?.message || 'Orchestrator execution encountered a fatal error.',
      },
      { status: 500 }
    );
  }
}
