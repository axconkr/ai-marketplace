/**
 * User Logout API Endpoint
 * POST /api/auth/logout
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth';

// Validation schema for logout (optional refresh token)
const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await requireAuth(request);

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const validatedData = logoutSchema.parse(body);

    // Delete sessions for this user
    if (validatedData.refreshToken) {
      // Delete specific session by refresh token
      await prisma.session.deleteMany({
        where: {
          userId: authUser.userId,
          refreshToken: validatedData.refreshToken,
        },
      });
    } else {
      // Delete all sessions for this user
      await prisma.session.deleteMany({
        where: { userId: authUser.userId },
      });
    }

    // Create response and clear cookies
    const response = NextResponse.json({ success: true });

    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');

    return response;
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
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
