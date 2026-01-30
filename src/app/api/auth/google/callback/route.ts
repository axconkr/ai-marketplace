/**
 * GET /api/auth/google/callback
 * Google OAuth callback handler
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  handleGoogleCallback,
  verifyCsrfToken,
  setSession,
  UserRole,
} from '@/src/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=oauth_${error}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=missing_parameters`
      );
    }

    // Verify CSRF token
    const cookieStore = await cookies();
    const storedHash = cookieStore.get('oauth_state')?.value;

    if (!storedHash) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=csrf_validation_failed`
      );
    }

    const { csrfToken } = JSON.parse(Buffer.from(state, 'base64').toString());
    if (!verifyCsrfToken(csrfToken, storedHash)) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=csrf_validation_failed`
      );
    }

    // Exchange code for user profile
    const profile = await handleGoogleCallback(code);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: profile.email },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          avatar: profile.avatar,
          role: UserRole.USER,
          emailVerified: true, // OAuth providers verify email
          oauthProvider: profile.provider,
          oauthId: profile.id,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } else if (!user.avatar && profile.avatar) {
      // Update avatar if not set
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatar: profile.avatar },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    // Create session
    await setSession(user);

    // Get redirect URL
    const redirectUrl = cookieStore.get('oauth_redirect')?.value || '/';

    // Clean up OAuth cookies
    cookieStore.delete('oauth_state');
    cookieStore.delete('oauth_redirect');

    // Redirect to app
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${redirectUrl}`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=oauth_failed`
    );
  }
}
