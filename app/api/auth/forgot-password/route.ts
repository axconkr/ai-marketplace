/**
 * Forgot Password API Endpoint
 * POST /api/auth/forgot-password
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    // Don't reveal whether the email exists or not
    if (!user) {
      return NextResponse.json(
        {
          message: 'If the email exists, a password reset link has been sent.',
        },
        { status: 200 }
      );
    }

    // TODO: Generate password reset token
    // TODO: Store token in database with expiration
    // TODO: Send email with reset link

    // For now, just return success
    console.log(`Password reset requested for: ${email}`);

    return NextResponse.json(
      {
        message: 'If the email exists, a password reset link has been sent.',
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid email address',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
