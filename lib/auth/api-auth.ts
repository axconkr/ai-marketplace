/**
 * API Authentication Middleware Helper
 * Server-side authentication and authorization utilities
 */

import { NextRequest } from 'next/server';
import { verifyToken } from '@/src/lib/auth/jwt';
import { UserRole, JWTPayload } from '@/src/lib/auth/types';

/**
 * Extract and verify JWT token from request
 * Returns payload if valid, null otherwise
 */
export function getAuthToken(request: NextRequest): JWTPayload | null {
  try {
    // Try to get token from Authorization header
    const authHeader = request.headers.get('authorization');
    let token: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Fallback to cookie
    if (!token) {
      token = request.cookies.get('accessToken')?.value || null;
    }

    if (!token) {
      return null;
    }

    // Verify and decode token
    return verifyToken(token);
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRequiredRole(
  userRole: UserRole,
  requiredRoles: UserRole[]
): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * API Response for unauthorized access
 */
export function unauthorizedResponse(message = '인증이 필요합니다') {
  return Response.json(
    {
      success: false,
      error: message,
    },
    { status: 401 }
  );
}

/**
 * API Response for forbidden access (authenticated but no permission)
 */
export function forbiddenResponse(message = '권한이 없습니다') {
  return Response.json(
    {
      success: false,
      error: message,
    },
    { status: 403 }
  );
}

/**
 * Middleware wrapper for API routes with authentication
 * Usage:
 *
 * export async function GET(request: NextRequest) {
 *   return withAuth(request, async (payload) => {
 *     // Your API logic here
 *     return Response.json({ data: 'Protected data' });
 *   });
 * }
 */
export async function withAuth(
  request: NextRequest,
  handler: (payload: JWTPayload) => Promise<Response>
): Promise<Response> {
  const payload = getAuthToken(request);

  if (!payload) {
    return unauthorizedResponse();
  }

  return handler(payload);
}

/**
 * Middleware wrapper for API routes with role-based access control
 * Usage:
 *
 * export async function POST(request: NextRequest) {
 *   return withRole(request, [UserRole.SERVICE_PROVIDER, UserRole.ADMIN], async (payload) => {
 *     // Your API logic here
 *     return Response.json({ data: 'Seller-only data' });
 *   });
 * }
 */
export async function withRole(
  request: NextRequest,
  requiredRoles: UserRole[],
  handler: (payload: JWTPayload) => Promise<Response>
): Promise<Response> {
  const payload = getAuthToken(request);

  if (!payload) {
    return unauthorizedResponse();
  }

  if (!hasRequiredRole(payload.role as UserRole, requiredRoles)) {
    return forbiddenResponse('이 작업을 수행할 권한이 없습니다');
  }

  return handler(payload);
}

/**
 * Check if user is admin
 */
export function isAdmin(payload: JWTPayload | null): boolean {
  return payload?.role === UserRole.ADMIN;
}

/**
 * Check if user is service provider (seller)
 */
export function isServiceProvider(payload: JWTPayload | null): boolean {
  return (
    payload?.role === UserRole.SELLER ||
    payload?.role === UserRole.ADMIN
  );
}

/**
 * Check if user is client (buyer)
 */
export function isClient(payload: JWTPayload | null): boolean {
  return (
    payload?.role === UserRole.BUYER || payload?.role === UserRole.ADMIN
  );
}

/**
 * Check if user owns the resource
 * Useful for checking if user can edit/delete their own resources
 */
export function isResourceOwner(
  payload: JWTPayload | null,
  resourceOwnerId: string
): boolean {
  return payload?.userId === resourceOwnerId || isAdmin(payload);
}
