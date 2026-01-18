/**
 * POST /api/auth/login
 * User login endpoint with email/password
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  loginSchema,
  verifyPassword,
  setSession,
  loginRateLimiter,
  getClientIdentifier,
  createRateLimitResponse,
  addRateLimitHeaders,
  needsRehash,
  hashPassword,
} from '@/lib/auth';
import { authConfig } from '@/lib/auth/config';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = loginRateLimiter.check(
      clientId,
      authConfig.rateLimit.login.maxAttempts,
      authConfig.rateLimit.login.windowMs
    );

    if (rateLimit.limited) {
      return createRateLimitResponse(rateLimit.resetAt);
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = loginSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user || !user.password) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
      return addRateLimitHeaders(response, rateLimit.remaining, rateLimit.resetAt);
    }

    // Verify password
    const isPasswordValid = await verifyPassword(
      validatedData.password,
      user.password
    );

    if (!isPasswordValid) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
      return addRateLimitHeaders(response, rateLimit.remaining, rateLimit.resetAt);
    }

    // Check if password needs rehashing (bcrypt rounds changed)
    if (needsRehash(user.password)) {
      const newHash = await hashPassword(validatedData.password);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash },
      });
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    // Create session
    const tokens = await setSession(userWithoutPassword);

    // Reset rate limit on successful login
    loginRateLimiter.reset(clientId);

    const response = NextResponse.json(
      {
        success: true,
        user: userWithoutPassword,
        accessToken: tokens.accessToken,
        message: 'Login successful',
      },
      { status: 200 }
    );

    return addRateLimitHeaders(response, rateLimit.remaining, rateLimit.resetAt);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
