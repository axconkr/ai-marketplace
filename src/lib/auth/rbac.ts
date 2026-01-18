/**
 * Role-Based Access Control (RBAC)
 * Permission checking and authorization utilities
 */

import { UserRole, Permission, rolePermissions } from './types';

/**
 * Check if a role has a specific permission
 * @param role - User role
 * @param permission - Permission to check
 * @returns True if role has permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = rolePermissions[role];
  return permissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 * @param role - User role
 * @param permissions - Permissions to check
 * @returns True if role has at least one permission
 */
export function hasAnyPermission(
  role: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 * @param role - User role
 * @param permissions - Permissions to check
 * @returns True if role has all permissions
 */
export function hasAllPermissions(
  role: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 * @param role - User role
 * @returns Array of permissions
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role];
}

/**
 * Check if a user ID matches the resource owner
 * @param userId - Current user ID
 * @param resourceOwnerId - Resource owner ID
 * @returns True if user owns the resource
 */
export function isResourceOwner(
  userId: string,
  resourceOwnerId: string
): boolean {
  return userId === resourceOwnerId;
}

/**
 * Check if a role is admin
 * @param role - User role
 * @returns True if role is admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}

/**
 * Check if a role is service provider
 * @param role - User role
 * @returns True if role is service provider
 */
export function isServiceProvider(role: UserRole): boolean {
  return role === UserRole.SERVICE_PROVIDER;
}

/**
 * Check if a role is client
 * @param role - User role
 * @returns True if role is client
 */
export function isClient(role: UserRole): boolean {
  return role === UserRole.CLIENT;
}

/**
 * Check if user can access resource
 * @param userId - Current user ID
 * @param role - User role
 * @param permission - Required permission
 * @param resourceOwnerId - Resource owner ID (optional)
 * @returns True if user can access resource
 */
export function canAccessResource(
  userId: string,
  role: UserRole,
  permission: Permission,
  resourceOwnerId?: string
): boolean {
  // Admins can access everything
  if (isAdmin(role)) {
    return true;
  }

  // Check if user owns the resource
  if (resourceOwnerId && isResourceOwner(userId, resourceOwnerId)) {
    return true;
  }

  // Check permission
  return hasPermission(role, permission);
}

/**
 * Create authorization error response
 * @param message - Error message
 * @returns Response object
 */
export function createUnauthorizedResponse(
  message: string = 'Unauthorized'
): Response {
  return new Response(
    JSON.stringify({
      error: 'Unauthorized',
      message,
    }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Create forbidden error response
 * @param message - Error message
 * @returns Response object
 */
export function createForbiddenResponse(
  message: string = 'Forbidden'
): Response {
  return new Response(
    JSON.stringify({
      error: 'Forbidden',
      message,
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Authorization result type
 */
export interface AuthorizationResult {
  authorized: boolean;
  reason?: string;
}

/**
 * Authorize user action with detailed result
 * @param userId - Current user ID
 * @param role - User role
 * @param permission - Required permission
 * @param resourceOwnerId - Resource owner ID (optional)
 * @returns Authorization result
 */
export function authorize(
  userId: string,
  role: UserRole,
  permission: Permission,
  resourceOwnerId?: string
): AuthorizationResult {
  // Admins always authorized
  if (isAdmin(role)) {
    return { authorized: true };
  }

  // Check resource ownership
  if (resourceOwnerId && isResourceOwner(userId, resourceOwnerId)) {
    return { authorized: true };
  }

  // Check permission
  if (hasPermission(role, permission)) {
    return { authorized: true };
  }

  return {
    authorized: false,
    reason: `Role ${role} does not have permission ${permission}`,
  };
}
