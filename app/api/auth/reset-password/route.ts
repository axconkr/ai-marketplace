import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const resetPasswordSchema = z.object({
  token: z.string().min(64, 'Invalid token format'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = resetPasswordSchema.parse(body);

    const validTokens = await prisma.passwordResetToken.findMany({
      where: {
        expires_at: { gt: new Date() },
        used: false,
      },
      include: { user: { select: { id: true, email: true } } },
    });

    let matchedToken = null;
    for (const t of validTokens) {
      if (await bcrypt.compare(token, t.token)) {
        matchedToken = t;
        break;
      }
    }

    if (!matchedToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: matchedToken.user_id },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: matchedToken.id },
        data: { used: true, used_at: new Date() },
      }),
      prisma.passwordResetToken.deleteMany({
        where: {
          user_id: matchedToken.user_id,
          id: { not: matchedToken.id },
        },
      }),
    ]);

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
