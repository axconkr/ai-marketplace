/**
 * Authentication Middleware
 * Next.js middleware for route protection and authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import { authConfig } from './config';
import { UserRole, Permission } from './types';
import { hasPermission } from './rbac';

/**
 * Require authentication middleware
 * Protects routes by requiring valid authentication
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  const token = request.cookies.get(authConfig.cookies.accessToken.name)?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const payload = verifyToken(token);

    // Attach user info to request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-email', payload.email);
    requestHeaders.set('x-user-role', payload.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: error instanceof Error ? error.message : 'Invalid token'
      },
      { status: 401 }
    );
  }
}

/**
 * Require specific role middleware
 * Protects routes by requiring specific user role
 */
export function requireRole(...roles: UserRole[]) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const authResult = await requireAuth(request);
    if (authResult && authResult.status === 401) {
      return authResult;
    }

    const token = request.cookies.get(authConfig.cookies.accessToken.name)?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!roles.includes(payload.role)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: `Access denied. Required roles: ${roles.join(', ')}`
        },
        { status: 403 }
      );
    }

    return null; // Allow request to proceed
  };
}

/**
 * Require permission middleware
 * Protects routes by requiring specific permission
 */
export function requirePermission(...permissions: Permission[]) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const authResult = await requireAuth(request);
    if (authResult && authResult.status === 401) {
      return authResult;
    }

    const token = request.cookies.get(authConfig.cookies.accessToken.name)?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    const hasRequiredPermissions = permissions.every(permission =>
      hasPermission(payload.role, permission)
    );

    if (!hasRequiredPermissions) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: `Access denied. Required permissions: ${permissions.join(', ')}`
        },
        { status: 403 }
      );
    }

    return null; // Allow request to proceed
  };
}

/**
 * Optional authentication middleware
 * Allows both authenticated and unauthenticated requests
 */
export async function optionalAuth(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(authConfig.cookies.accessToken.name)?.value;

  if (token) {
    try {
      const payload = verifyToken(token);

      // Attach user info to request headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-email', payload.email);
      requestHeaders.set('x-user-role', payload.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch {
      // Invalid token, continue without authentication
    }
  }

  return NextResponse.next();
}

/**
 * Extract user from request headers
 * Use after authentication middleware
 */
export function getUserFromRequest(request: NextRequest | Request): {
  userId: string;
  email: string;
  role: UserRole;
} | null {
  const headers = request.headers;
  const userId = headers.get('x-user-id');
  const email = headers.get('x-user-email');
  const role = headers.get('x-user-role') as UserRole;

  if (!userId || !email || !role) {
    return null;
  }

  return { userId, email, role };
}

/**
 * Check if request is from authenticated user
 */
export function isAuthenticated(request: NextRequest | Request): boolean {
  return getUserFromRequest(request) !== null;
}

/**
 * CORS middleware for API routes
 */
export function withCors(handler: (request: NextRequest) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const response = await handler(request);

    // Add CORS headers to response
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*');
    headers.set('Access-Control-Allow-Credentials', 'true');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}
