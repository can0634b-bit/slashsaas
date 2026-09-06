// Lightweight shared security helpers for public endpoints.
//
// The rate limiter is best-effort and per serverless instance: it blunts casual
// abuse (scripts hammering a public route) without new infrastructure. For
// cross-instance guarantees at scale, back it with a shared store (e.g. Upstash
// Redis). It is intentionally fail-open (never throws) so it can't take an
// endpoint down.

const buckets = new Map<string, number[]>();
const MAX_KEYS = 5000; // bound memory across many client IPs

/**
 * Returns true when `key` is OVER the limit (i.e. the request should be blocked).
 * Records the hit only when allowed.
 */
export function isRateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) || []).filter((t) => now - t < windowMs);

  if (recent.length >= max) {
    buckets.set(key, recent);
    return true;
  }

  recent.push(now);
  buckets.set(key, recent);

  // Opportunistic cleanup to keep the map bounded.
  if (buckets.size > MAX_KEYS) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
      if (buckets.size <= MAX_KEYS) break;
    }
  }

  return false;
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  const first = xff ? xff.split(',')[0].trim() : '';
  return first || req.headers.get('x-real-ip') || 'unknown';
}

const HTML_ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escape a string for safe interpolation into HTML (e.g. notification emails). */
export function escapeHtml(input: string): string {
  return String(input).replace(/[&<>"']/g, (c) => HTML_ESCAPE[c]);
}

/** Trim + hard-cap a user-supplied string to bound payload size. */
export function capString(input: unknown, max: number): string {
  return typeof input === 'string' ? input.trim().slice(0, max) : '';
}
