/**
 * Client-side auth helper for pages
 * Use this to protect pages and check user roles in components
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/src/lib/auth/types';

/**
 * Get user role from JWT token
 */
export function getUserRoleFromToken(): UserRole | null {
  if (typeof window === 'undefined') return null;

  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role as UserRole;
  } catch {
    return null;
  }
}

/**
 * Get user ID from JWT token
 */
export function getUserIdFromToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
  } catch {
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRole(requiredRole: UserRole | UserRole[]): boolean {
  const userRole = getUserRoleFromToken();
  if (!userRole) return false;

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }

  return userRole === requiredRole;
}

/**
 * Hook to protect client-side routes
 * Redirects to login if not authenticated or doesn't have required role
 */
export function useRequireRole(
  requiredRole?: UserRole | UserRole[],
  redirectUrl = '/login'
) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    // Check authentication
    if (!token) {
      router.push(`${redirectUrl}?redirect=${window.location.pathname}`);
      return;
    }

    // Check role if required
    if (requiredRole) {
      const userRole = getUserRoleFromToken();

      if (!userRole) {
        router.push(`${redirectUrl}?redirect=${window.location.pathname}`);
        return;
      }

      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

      if (!roles.includes(userRole)) {
        // Redirect to appropriate page based on user's role
        if (userRole === UserRole.CLIENT) {
          router.push('/orders');
        } else if (userRole === UserRole.SERVICE_PROVIDER) {
          router.push('/dashboard/products');
        } else {
          router.push('/');
        }
      }
    }
  }, [requiredRole, redirectUrl, router]);

  return { userRole: getUserRoleFromToken(), userId: getUserIdFromToken() };
}

/**
 * Check if current user is admin
 */
export function isAdmin(): boolean {
  return hasRole(UserRole.ADMIN);
}

/**
 * Check if current user is service provider (seller)
 */
export function isServiceProvider(): boolean {
  return hasRole([UserRole.SERVICE_PROVIDER, UserRole.ADMIN]);
}

/**
 * Check if current user is client (buyer)
 */
export function isClient(): boolean {
  return hasRole([UserRole.CLIENT, UserRole.ADMIN]);
}
