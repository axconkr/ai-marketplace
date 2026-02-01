import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email/resend';

const TOKEN_EXPIRY_HOURS = 1;

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    if (user) {
      await prisma.passwordResetToken.deleteMany({
        where: { user_id: user.id, used: false },
      });

      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = await bcrypt.hash(rawToken, 10);

      await prisma.passwordResetToken.create({
        data: {
          token: hashedToken,
          user_id: user.id,
          expires_at: new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
        },
      });

      await sendPasswordResetEmail(user.email, user.name, rawToken);
    }

    return NextResponse.json(
      { message: 'If the email exists, a password reset link has been sent.' },
      { status: 200 }
    );
  } catch (error) {
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

    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
