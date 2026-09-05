// Session lifetime policy shared by the browser, server, and middleware Supabase
// clients so all three agree on how long an auth cookie survives.
//
// "Remember me on this device" controls the lifetime:
//   checked   -> PERSISTENT_MAX_AGE (stay signed in)
//   unchecked -> SHORT_MAX_AGE (dropped after 3 days of inactivity)
//
// The choice is recorded in a small, non-sensitive companion cookie
// (REMEMBER_COOKIE) so the server + middleware apply the same maxAge every time
// they refresh the Supabase session — otherwise the middleware would silently
// re-extend every session back to the default on the next request.

export const REMEMBER_COOKIE = 'ss-remember';

export const PERSISTENT_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
export const SHORT_MAX_AGE = 60 * 60 * 24 * 3; // 3 days

/**
 * Resolve the auth-cookie maxAge (in seconds) from the remember-me marker.
 * Unknown/absent → persistent, so pre-existing sessions keep working unchanged.
 */
export function maxAgeFromRemember(value?: string | null): number {
  return value === '0' ? SHORT_MAX_AGE : PERSISTENT_MAX_AGE;
}
