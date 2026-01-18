/**
 * JWT Token Verification Utility
 * For API route authentication
 */

import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Extract and verify JWT token from request
 */
export function verifyToken(request: NextRequest): TokenPayload | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRole(
  user: TokenPayload | null,
  roles: string[]
): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}
