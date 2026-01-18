/**
 * Authentication Type Definitions
 * TypeScript types and interfaces for the authentication system
 */

import { z } from 'zod';

// ============================================================================
// User Roles and Permissions
// ============================================================================

export enum UserRole {
  ADMIN = 'admin',
  SERVICE_PROVIDER = 'service_provider',
  CLIENT = 'client',
  USER = 'user',
}

export enum Permission {
  // Service Management
  CREATE_SERVICE = 'create_service',
  EDIT_SERVICE = 'edit_service',
  DELETE_SERVICE = 'delete_service',
  VIEW_SERVICE = 'view_service',

  // Order Management
  CREATE_ORDER = 'create_order',
  MANAGE_ORDER = 'manage_order',
  VIEW_ORDER = 'view_order',

  // User Management
  MANAGE_USERS = 'manage_users',
  VIEW_USERS = 'view_users',

  // Payment Management
  PROCESS_PAYMENT = 'process_payment',
  VIEW_PAYMENT = 'view_payment',

  // Admin Functions
  MANAGE_PLATFORM = 'manage_platform',
  VIEW_ANALYTICS = 'view_analytics',
}

// Role-Permission Mapping
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.MANAGE_PLATFORM,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    Permission.CREATE_SERVICE,
    Permission.EDIT_SERVICE,
    Permission.DELETE_SERVICE,
    Permission.VIEW_SERVICE,
    Permission.MANAGE_ORDER,
    Permission.VIEW_ORDER,
    Permission.PROCESS_PAYMENT,
    Permission.VIEW_PAYMENT,
  ],
  [UserRole.SERVICE_PROVIDER]: [
    Permission.CREATE_SERVICE,
    Permission.EDIT_SERVICE,
    Permission.DELETE_SERVICE,
    Permission.VIEW_SERVICE,
    Permission.MANAGE_ORDER,
    Permission.VIEW_ORDER,
    Permission.VIEW_PAYMENT,
  ],
  [UserRole.CLIENT]: [
    Permission.VIEW_SERVICE,
    Permission.CREATE_ORDER,
    Permission.VIEW_ORDER,
    Permission.VIEW_PAYMENT,
  ],
  [UserRole.USER]: [Permission.VIEW_SERVICE],
};

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithPassword extends User {
  password: string;
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

export interface OAuthProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'github';
}

// ============================================================================
// Request/Response Types
// ============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  accessToken?: string;
  message?: string;
  error?: string;
}

export interface OAuthState {
  provider: 'google' | 'github';
  redirectUrl?: string;
  csrfToken: string;
}

// ============================================================================
// Validation Schemas
// ============================================================================

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[^A-Za-z0-9]/,
    'Password must contain at least one special character'
  );

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  role: z.nativeEnum(UserRole).optional(),
});

export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ============================================================================
// Type Guards
// ============================================================================

export function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj &&
    'role' in obj
  );
}

export function isJWTPayload(obj: unknown): obj is JWTPayload {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'userId' in obj &&
    'email' in obj &&
    'role' in obj &&
    'type' in obj
  );
}

// ============================================================================
// Helper Types
// ============================================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
