/**
 * Next.js Middleware
 * Global middleware for authentication and route protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { authConfig } from '@/lib/auth/config';

// Define protected routes
const protectedRoutes = ['/dashboard', '/profile', '/settings'];
const adminRoutes = ['/admin'];
const publicRoutes = ['/login', '/register', '/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some((route) => pathname === route);

  // Get token from cookies
  const token = request.cookies.get(authConfig.cookies.accessToken.name)?.value;

  // Redirect authenticated users away from public auth pages
  if (token && (pathname === '/login' || pathname === '/register')) {
    try {
      verifyToken(token);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch {
      // Invalid token, allow access to login/register
    }
  }

  // Protect routes requiring authentication
  if (isProtectedRoute || isAdminRoute) {
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    try {
      const payload = verifyToken(token);

      // Check admin access
      if (isAdminRoute && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Continue with request
      return NextResponse.next();
    } catch (error) {
      // Invalid token, redirect to login
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by individual route handlers)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
