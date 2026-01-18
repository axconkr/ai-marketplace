/**
 * Auth helper for Request API routes
 */

import { NextRequest } from 'next/server';
import { verifyToken } from '@/src/lib/auth/jwt';
import { authConfig } from '@/src/lib/auth/config';

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

export function getUserFromToken(request: NextRequest): AuthUser {
  const token = request.cookies.get(authConfig.cookies.accessToken.name)?.value;

  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const payload = verifyToken(token);
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function getOptionalUserFromToken(
  request: NextRequest
): AuthUser | null {
  try {
    return getUserFromToken(request);
  } catch {
    return null;
  }
}
