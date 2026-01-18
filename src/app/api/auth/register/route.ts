/**
 * POST /api/auth/register
 * User registration endpoint with email/password
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  registerSchema,
  hashPassword,
  setSession,
  registerRateLimiter,
  getClientIdentifier,
  createRateLimitResponse,
  addRateLimitHeaders,
  UserRole,
} from '@/lib/auth';
import { authConfig } from '@/lib/auth/config';
import { prisma } from '@/lib/db'; // Assuming Prisma setup

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = registerRateLimiter.check(
      clientId,
      authConfig.rateLimit.register.maxAttempts,
      authConfig.rateLimit.register.windowMs
    );

    if (rateLimit.limited) {
      return createRateLimitResponse(rateLimit.resetAt);
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Email already registered',
        },
        { status: 400 }
      );
      return addRateLimitHeaders(response, rateLimit.remaining, rateLimit.resetAt);
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: validatedData.role || UserRole.USER,
        emailVerified: false,
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

    // Create session
    const tokens = await setSession(user);

    // TODO: Send verification email
    // await sendVerificationEmail(user.email);

    const response = NextResponse.json(
      {
        success: true,
        user,
        accessToken: tokens.accessToken,
        message: 'Registration successful. Please verify your email.',
      },
      { status: 201 }
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

    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
