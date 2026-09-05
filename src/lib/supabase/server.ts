import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { REMEMBER_COOKIE, maxAgeFromRemember } from './session';

export async function createClient() {
  const cookieStore = await cookies();
  // Honor the remember-me choice so refreshed session cookies keep the same
  // lifetime (persistent vs. 3-day) the user picked at sign-in.
  const rememberMaxAge = maxAgeFromRemember(cookieStore.get(REMEMBER_COOKIE)?.value);

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookieOptions: {
        name: 'sb-auth-token',
        maxAge: rememberMaxAge,
        domain: '',
        path: '/',
        sameSite: 'lax',
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                maxAge: rememberMaxAge,
                path: '/',
                sameSite: 'lax',
              })
            );
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );
}
