/**
 * Next.js Middleware for Role-Based Access Control (RBAC)
 * Protects routes based on user authentication and role
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth'; // Use jose-based verification for Edge Runtime
import { UserRole } from '@/src/lib/auth/types';

// ============================================================================
// Route Configuration
// ============================================================================

interface RouteConfig {
  pattern: RegExp;
  allowedRoles?: UserRole[];
  requireAuth: boolean;
}

const routeConfigs: RouteConfig[] = [
  // ===== Public Routes (No Auth Required) =====
  { pattern: /^\/$/, requireAuth: false },
  { pattern: /^\/login$/, requireAuth: false },
  { pattern: /^\/register$/, requireAuth: false },
  { pattern: /^\/about$/, requireAuth: false },
  { pattern: /^\/features$/, requireAuth: false },
  { pattern: /^\/pricing$/, requireAuth: false },
  { pattern: /^\/help$/, requireAuth: false },
  { pattern: /^\/terms$/, requireAuth: false },
  { pattern: /^\/privacy$/, requireAuth: false },
  { pattern: /^\/products$/, requireAuth: false },
  { pattern: /^\/products\/[^/]+$/, requireAuth: false },

  // ===== Authenticated Routes (Any Role) =====
  { pattern: /^\/profile$/, requireAuth: true },
  { pattern: /^\/notifications$/, requireAuth: true },
  { pattern: /^\/settings\/notifications$/, requireAuth: true },
  { pattern: /^\/cart$/, requireAuth: true },
  { pattern: /^\/orders$/, requireAuth: true },

  // ===== Buyer Routes (CLIENT role) =====
  {
    pattern: /^\/checkout\/.+$/,
    requireAuth: true,
    allowedRoles: [UserRole.CLIENT, UserRole.ADMIN],
  },

  // ===== Seller Routes (SERVICE_PROVIDER role) =====
  {
    pattern: /^\/dashboard\/products$/,
    requireAuth: true,
    allowedRoles: [UserRole.SERVICE_PROVIDER, UserRole.ADMIN],
  },
  {
    pattern: /^\/dashboard\/products\/new$/,
    requireAuth: true,
    allowedRoles: [UserRole.SERVICE_PROVIDER, UserRole.ADMIN],
  },
  {
    pattern: /^\/dashboard\/products\/[^/]+\/edit$/,
    requireAuth: true,
    allowedRoles: [UserRole.SERVICE_PROVIDER, UserRole.ADMIN],
  },
  {
    pattern: /^\/dashboard\/analytics$/,
    requireAuth: true,
    allowedRoles: [UserRole.SERVICE_PROVIDER, UserRole.ADMIN],
  },
  {
    pattern: /^\/dashboard\/settlements$/,
    requireAuth: true,
    allowedRoles: [UserRole.SERVICE_PROVIDER, UserRole.ADMIN],
  },
  {
    pattern: /^\/dashboard\/orders$/,
    requireAuth: true,
    allowedRoles: [UserRole.SERVICE_PROVIDER, UserRole.ADMIN],
  },
  {
    pattern: /^\/dashboard\/verifications$/,
    requireAuth: true,
    allowedRoles: [UserRole.SERVICE_PROVIDER, UserRole.ADMIN],
  },
  {
    pattern: /^\/dashboard\/settings\/bank-account$/,
    requireAuth: true,
    allowedRoles: [UserRole.SERVICE_PROVIDER, UserRole.ADMIN],
  },
  {
    pattern: /^\/products\/create$/,
    requireAuth: true,
    allowedRoles: [UserRole.SERVICE_PROVIDER, UserRole.ADMIN],
  },
  {
    pattern: /^\/products\/new$/,
    requireAuth: true,
    allowedRoles: [UserRole.SERVICE_PROVIDER, UserRole.ADMIN],
  },

  // ===== Verifier Routes =====
  {
    pattern: /^\/verifier\/.+$/,
    requireAuth: true,
    allowedRoles: [UserRole.ADMIN], // Only admin can access verifier routes for now
  },

  // ===== Admin Routes =====
  {
    pattern: /^\/admin\/.+$/,
    requireAuth: true,
    allowedRoles: [UserRole.ADMIN],
  },
  {
    pattern: /^\/settlements$/,
    requireAuth: true,
    allowedRoles: [UserRole.ADMIN],
  },

  // ===== Dashboard (Auto-redirect based on role) =====
  { pattern: /^\/dashboard$/, requireAuth: true },
];

// ============================================================================
// Middleware Function
// ============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes (API routes have their own auth)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  // Find matching route config
  const routeConfig = routeConfigs.find((config) =>
    config.pattern.test(pathname)
  );

  // If no matching route, allow access (default behavior)
  if (!routeConfig) {
    return NextResponse.next();
  }

  // Extract token from cookies or Authorization header
  const token =
    request.cookies.get('accessToken')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  // Check if authentication is required
  if (routeConfig.requireAuth) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify token
      const payload = await verifyToken(token);
      console.log(`[Middleware] Token verified for path: ${pathname}, user: ${payload.userId}, role: ${payload.role}`);

      // Check role-based access
      if (
        routeConfig.allowedRoles &&
        !routeConfig.allowedRoles.includes(payload.role as UserRole)
      ) {
        // Redirect to appropriate page based on role
        if (payload.role === UserRole.CLIENT) {
          return NextResponse.redirect(new URL('/orders', request.url));
        } else if (payload.role === UserRole.SERVICE_PROVIDER) {
          return NextResponse.redirect(
            new URL('/dashboard/products', request.url)
          );
        } else {
          return NextResponse.redirect(new URL('/', request.url));
        }
      }

      // Token is valid and user has access
      return NextResponse.next();
    } catch (error) {
      // Token is invalid or expired
      console.error(`[Middleware] Token verification failed for path: ${pathname}`, error);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'session_expired');

      // Clear invalid token
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('accessToken');
      return response;
    }
  }

  // Public route or authenticated user with valid token
  return NextResponse.next();
}

// ============================================================================
// Middleware Configuration
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - API routes (they have their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
  runtime: 'nodejs', // Use Node.js runtime instead of Edge runtime for crypto support
};
