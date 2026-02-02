/**
 * Password Change API Endpoint
 * PATCH /api/user/password
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth, comparePasswords, hashPassword } from '@/lib/auth';
import { passwordChangeSchema } from '@/lib/validators/password';
import { rateLimit } from '@/lib/rate-limit';
import { sendPasswordChangedEmail } from '@/lib/email/resend';

/**
 * Rate limiter for password change attempts
 * 5 attempts per 15 minutes per user
 */
const passwordChangeLimiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 500,
});

/**
 * PATCH - Change user password
 * Requires authentication
 */
export async function PATCH(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(request);

    // Rate limiting - prevent brute force attempts
    try {
      await passwordChangeLimiter.check(request, 5, user.userId);
    } catch (rateLimitError) {
      return NextResponse.json(
        {
          error: 'Too many password change attempts. Please try again later.',
          retryAfter: 15 * 60, // 15 minutes in seconds
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(15 * 60),
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = passwordChangeSchema.parse(body);

    // Get user from database with password
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        oauthProvider: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is OAuth-only (no password set)
    if (!dbUser.password) {
      return NextResponse.json(
        {
          error: 'Cannot change password for OAuth-only accounts',
          details: `This account is linked with ${dbUser.oauthProvider || 'OAuth'}. Password changes are not available for OAuth accounts.`,
        },
        { status: 400 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePasswords(
      validatedData.currentPassword,
      dbUser.password
    );

    if (!isCurrentPasswordValid) {
      // Log failed attempt for security monitoring
      console.warn(`Failed password change attempt for user ${user.userId} - incorrect current password`);

      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(validatedData.newPassword);

    // Update password in database
    await prisma.user.update({
      where: { id: user.userId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date(),
      },
    });

    // Log successful password change
    console.info(`Password changed successfully for user ${user.userId}`);

    // Optionally: Invalidate all sessions except current one
    // This forces re-login on all other devices
    // Commented out for now - can be enabled based on security requirements
    /*
    await prisma.session.deleteMany({
      where: {
        userId: user.userId,
        // Keep current session if needed
      },
    });
    */

    sendPasswordChangedEmail(dbUser.email, dbUser.name).catch((err) =>
      console.error('Failed to send password changed notification:', err)
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Password changed successfully',
      },
      { status: 200 }
    );
  } catch (error) {
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

    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Handle other errors
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET - Not allowed
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

/**
 * POST - Not allowed (use PATCH instead)
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use PATCH to change password.' },
    { status: 405 }
  );
}
