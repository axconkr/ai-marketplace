/**
 * User Registration API Endpoint
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { generateTokenPair } from '@/src/lib/auth/jwt';

// Validation schema for registration
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').optional(),
  phone: z.string().regex(/^[0-9]{3}-[0-9]{4}-[0-9]{4}$/, 'Phone number must be in format 010-1234-5678').optional().or(z.literal('')),
  kakao_id: z.string().optional().or(z.literal('')),
  role: z.enum(['user', 'seller', 'verifier', 'admin']).default('user'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        phone: validatedData.phone,
        kakao_id: validatedData.kakao_id,
        role: validatedData.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        kakao_id: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate JWT tokens (role mapping handled in generateTokenPair)
    const { accessToken, refreshToken } = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name || undefined,
    });

    // Store refresh token in database
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Create response with cookies
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token: accessToken, // Keep 'token' for backward compatibility
        refreshToken,
      },
      { status: 201 }
    );

    // Set access token cookie (7 days)
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Set refresh token cookie (30 days)
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
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

    // Handle other errors
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
