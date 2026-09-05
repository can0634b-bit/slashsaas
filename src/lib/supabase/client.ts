import { createBrowserClient } from '@supabase/ssr';
import { REMEMBER_COOKIE, PERSISTENT_MAX_AGE, maxAgeFromRemember } from './session';

// Read the remember-me marker the login form wrote so browser-side cookie
// writes (e.g. token refreshes) use the same lifetime the server enforces.
function readRememberMaxAge(): number {
  if (typeof document === 'undefined') return PERSISTENT_MAX_AGE;
  const match = document.cookie.match(new RegExp(`(?:^|; )${REMEMBER_COOKIE}=([^;]+)`));
  return maxAgeFromRemember(match?.[1]);
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookieOptions: {
        name: 'sb-auth-token',
        maxAge: readRememberMaxAge(),
        domain: '',
        path: '/',
        sameSite: 'lax',
      },
    }
  );
}
