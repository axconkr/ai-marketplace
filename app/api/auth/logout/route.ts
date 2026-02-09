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
    const body = await request.json().catch(() => ({}));
    const validatedData = logoutSchema.parse(body);

    let authUser: { userId: string } | null = null;
    try {
      authUser = await requireAuth(request);
    } catch {
    }

    if (authUser?.userId) {
      if (validatedData.refreshToken) {
        await prisma.session.deleteMany({
          where: {
            userId: authUser.userId,
            refreshToken: validatedData.refreshToken,
          },
        });
      } else {
        await prisma.session.deleteMany({
          where: { userId: authUser.userId },
        });
      }
    } else if (validatedData.refreshToken) {
      await prisma.session.deleteMany({
        where: { refreshToken: validatedData.refreshToken },
      });
    }

    const response = NextResponse.json({ success: true });

    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');

    return response;
  } catch (error) {
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

    console.error('Logout error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    return response;
  }
}
