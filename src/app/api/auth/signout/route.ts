import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { REMEMBER_COOKIE } from '@/lib/supabase/session';

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(`${origin}/login`, { status: 303 });
  // Drop the remember-me marker so the next sign-in starts from a clean choice.
  response.cookies.set(REMEMBER_COOKIE, '', { maxAge: 0, path: '/' });
  return response;
}
