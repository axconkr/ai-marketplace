import { NextRequest } from 'next/server';
import { AuthTokenPayload } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';

export function verifyToken(request: NextRequest): AuthTokenPayload | null {
  const token = 
    request.cookies.get('accessToken')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) return null;
  
  return null;
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
