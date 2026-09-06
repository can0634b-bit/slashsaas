import { createAdminClient } from '@/lib/supabase/admin';
import { isRateLimited } from './rate-limit';

/**
 * Distributed rate limit (shared across serverless instances) backed by the
 * Postgres `check_rate_limit` function. Falls back to the per-instance in-memory
 * limiter if the DB call fails or the migration hasn't run yet, so an outage can
 * never take a public endpoint down. Returns true when the request is OVER the
 * limit (should be blocked).
 */
export async function enforceRateLimit(
  key: string,
  max: number,
  windowMs: number
): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc('check_rate_limit', {
      p_key: key,
      p_max: max,
      p_window_seconds: Math.max(1, Math.ceil(windowMs / 1000)),
    });
    if (error) throw error;
    return data === true;
  } catch {
    // Graceful fallback: never fail the request because the limiter is down.
    return isRateLimited(key, max, windowMs);
  }
}
