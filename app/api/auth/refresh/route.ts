/**
 * Refresh Token API Endpoint
 * POST /api/auth/refresh
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { generateToken, AuthError } from '@/lib/auth';

// Validation schema for refresh
const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = refreshSchema.parse(body);

    // Verify refresh token signature
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AuthError(
        'JWT_SECRET is not configured',
        'CONFIG_ERROR',
        500
      );
    }

    let payload;
    try {
      const result = await jwtVerify(
        validatedData.refreshToken,
        new TextEncoder().encode(secret)
      );
      payload = result.payload;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Validate payload structure
    if (!payload.userId || payload.type !== 'refresh') {
      return NextResponse.json(
        { error: 'Invalid refresh token payload' },
        { status: 401 }
      );
    }

    // Check if refresh token exists in database and is not expired
    const session = await prisma.session.findUnique({
      where: { refreshToken: validatedData.refreshToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Refresh token not found or has been revoked' },
        { status: 401 }
      );
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      // Delete expired session
      await prisma.session.delete({
        where: { id: session.id },
      });

      return NextResponse.json(
        { error: 'Refresh token has expired' },
        { status: 401 }
      );
    }

    // Generate new access token
    const token = await generateToken({
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role as any,
      name: session.user.name || undefined,
    });

    // Return new access token and user info
    return NextResponse.json({
      token,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
    });
  } catch (error) {
    // Handle authentication errors
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
