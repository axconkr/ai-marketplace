import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmailVerification } from '@/lib/email/resend';

const verifySchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

const requestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    if (verificationToken.used) {
      return NextResponse.json(
        { error: 'This verification link has already been used' },
        { status: 400 }
      );
    }

    if (verificationToken.expires_at < new Date()) {
      return NextResponse.json(
        { error: 'Verification link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.user_id },
        data: { emailVerified: true },
      }),
      prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true, used_at: new Date() },
      }),
    ]);

    return NextResponse.redirect(new URL('/login?verified=true', request.url));
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = requestSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'If the email exists, a verification link has been sent.' },
        { status: 200 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    await prisma.emailVerificationToken.deleteMany({
      where: { user_id: user.id, used: false },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.emailVerificationToken.create({
      data: {
        token,
        user_id: user.id,
        expires_at: expiresAt,
      },
    });

    await sendEmailVerification(user.email, user.name, token);

    return NextResponse.json(
      { message: 'If the email exists, a verification link has been sent.' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
