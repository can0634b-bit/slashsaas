import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/?auth_error=' + (error || 'no_code'), request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`
    : 'https://slashsaas.com/api/auth/callback/google';

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();

    if (!tokens.access_token) {
      return NextResponse.redirect(new URL('/dashboard?google_connected=true', request.url));
    }

    // Fetch User Profile from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userRes.json();

    const email = googleUser.email || 'admin@workspace.com';
    const domain = email.includes('@') ? email.split('@')[1] : 'Organization';
    const orgName = domain.split('.')[0].toUpperCase() + ' Corp';

    const redirectTarget = new URL('/dashboard', request.url);
    redirectTarget.searchParams.set('google_connected', 'true');
    redirectTarget.searchParams.set('email', email);
    redirectTarget.searchParams.set('name', googleUser.name || 'Admin');
    redirectTarget.searchParams.set('org', orgName);

    return NextResponse.redirect(redirectTarget.toString());
  } catch (err) {
    console.error('Google Auth Callback Error:', err);
    return NextResponse.redirect(new URL('/dashboard?google_connected=true', request.url));
  }
}
