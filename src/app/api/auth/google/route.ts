/**
 * GET /api/auth/google
 * Initiate Google OAuth flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAuthUrl, generateCsrfTokenPair } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Generate CSRF token
    const { token, hash } = generateCsrfTokenPair();

    // Store CSRF hash in cookie
    const cookieStore = await cookies();
    cookieStore.set('oauth_state', hash, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/api/auth',
    });

    // Get redirect URL from query params
    const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/';

    // Store redirect URL in cookie
    cookieStore.set('oauth_redirect', redirectUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/api/auth',
    });

    // Generate OAuth state with CSRF token
    const state = Buffer.from(JSON.stringify({ csrfToken: token })).toString('base64');

    // Get Google auth URL
    const authUrl = getGoogleAuthUrl(state);

    // Redirect to Google
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initiate Google OAuth',
      },
      { status: 500 }
    );
  }
}
