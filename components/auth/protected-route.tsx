'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { UserRole } from '@/src/lib/auth/types';

/**
 * Protected Route Component
 * Wraps pages that require authentication
 */

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login',
  fallback = <ProtectedRouteFallback />,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated - redirect to login
      if (!user) {
        const currentPath = window.location.pathname;
        const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
        router.push(loginUrl);
        return;
      }

      // Check role requirements
      if (requiredRole) {
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!allowedRoles.includes(user.role)) {
          // User doesn't have required role - redirect to home
          router.push('/');
          return;
        }
      }
    }
  }, [user, isLoading, requiredRole, redirectTo, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <>{fallback}</>;
  }

  // User not authenticated
  if (!user) {
    return <>{fallback}</>;
  }

  // Check role requirements
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(user.role)) {
      return <>{fallback}</>;
    }
  }

  // User is authenticated and has required role
  return <>{children}</>;
}

/**
 * Default loading fallback for protected routes
 */
export function ProtectedRouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Higher-order component version for wrapping page components
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requiredRole?: UserRole | UserRole[];
    redirectTo?: string;
  }
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute
        requiredRole={options?.requiredRole}
        redirectTo={options?.redirectTo}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
