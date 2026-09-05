import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { REMEMBER_COOKIE, maxAgeFromRemember } from './session';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // If Supabase env vars are not yet configured, allow public browsing
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  // Resolve the session lifetime from the remember-me marker BEFORE creating the
  // client (no logic must sit between createServerClient and getUser below).
  const rememberValue = request.cookies.get(REMEMBER_COOKIE)?.value;
  const rememberMaxAge = maxAgeFromRemember(rememberValue);

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      name: 'sb-auth-token',
      maxAge: rememberMaxAge,
      domain: '',
      path: '/',
      sameSite: 'lax',
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, {
            ...options,
            maxAge: rememberMaxAge,
            path: '/',
            sameSite: 'lax',
          })
        );
        // Slide the remember marker alongside the session it governs so a
        // 3-day session is measured from the user's last activity.
        if (rememberValue !== undefined) {
          supabaseResponse.cookies.set(REMEMBER_COOKIE, rememberValue, {
            maxAge: rememberMaxAge,
            path: '/',
            sameSite: 'lax',
          });
        }
      },
    },
  });

  // IMPORTANT: Avoid writing logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protect /app route — require authentication
  if (pathname.startsWith('/app') && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // If already logged in, redirect away from /login and /signup to /app
  if ((pathname === '/login' || pathname === '/signup') && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/app';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
