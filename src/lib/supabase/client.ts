import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookieOptions: {
        name: 'sb-auth-token',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        domain: '',
        path: '/',
        sameSite: 'lax',
      },
    }
  );
}
