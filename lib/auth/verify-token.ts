import { NextRequest } from 'next/server';
import { AuthTokenPayload, verifyToken as actualVerifyToken } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';

/**
 * Verify token and return payload
 * Consolidates with the main auth logic in lib/auth.ts
 */
export async function verifyToken(request: NextRequest): Promise<AuthTokenPayload | null> {
  const token =
    request.cookies.get('accessToken')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) return null;

  try {
    return await actualVerifyToken(token);
  } catch (error) {
    console.error('Token verification in helper failed:', error);
    return null;
  }
}

export function hasRole(user: AuthTokenPayload | null, roles: string[]): boolean {
  if (!user) return false;

  const roleMap: Record<string, UserRole> = {
    'admin': UserRole.ADMIN,
    'seller': UserRole.SELLER,
    'service_provider': UserRole.SELLER,
    'buyer': UserRole.BUYER,
    'user': UserRole.BUYER,
  };

  return roles.some(role => {
    const mappedRole = roleMap[role] || role;
    return user.role === mappedRole;
  });
}
