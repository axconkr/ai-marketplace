import { NextRequest } from 'next/server';
import { JWTPayload, jwtVerify, SignJWT } from 'jose';
import { UserRole } from '@/src/lib/auth/types';
import bcrypt from 'bcryptjs';

/**
 * JWT Payload Interface
 */
export interface AuthTokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  name?: string;
  id?: string; // Alias for userId for backwards compatibility
}

/**
 * Authentication Error Types
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Extract JWT token from Authorization header
 */
function extractToken(request: NextRequest): string | null {
  // Try to get token from cookie first
  const cookieToken = request.cookies.get('accessToken')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // Fallback to Authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return null;
  }

  // Support both "Bearer <token>" and "<token>" formats
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }

  return null;
}

/**
 * Verify JWT token and return payload
 */
export async function verifyToken(token: string): Promise<AuthTokenPayload> {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AuthError(
      'JWT_SECRET is not configured',
      'CONFIG_ERROR',
      500
    );
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    return payload as unknown as AuthTokenPayload;
  } catch (error) {
    throw new AuthError(
      'Invalid or expired token',
      'INVALID_TOKEN',
      401
    );
  }
}

/**
 * Require authentication - extracts and verifies JWT token
 *
 * @param request - NextRequest object
 * @returns Authenticated user payload
 * @throws AuthError if authentication fails
 *
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   const user = await requireAuth(request);
 *   // user.userId, user.email, user.role are available
 * }
 * ```
 */
export async function requireAuth(
  request: NextRequest
): Promise<AuthTokenPayload> {
  const token = extractToken(request);

  if (!token) {
    throw new AuthError(
      'Authentication required',
      'MISSING_TOKEN',
      401
    );
  }

  const payload = await verifyToken(token);

  if (!payload.userId || !payload.email || !payload.role) {
    throw new AuthError(
      'Invalid token payload',
      'INVALID_PAYLOAD',
      401
    );
  }

  return payload;
}

/**
 * Require specific role(s) - checks if user has required role
 *
 * @param request - NextRequest object
 * @param allowedRoles - Array of allowed UserRole values
 * @returns Authenticated user payload
 * @throws AuthError if authentication or authorization fails
 *
 * @example
 * ```ts
 * // Allow only sellers
 * export async function POST(request: NextRequest) {
 *   const user = await requireRole(request, ['seller']);
 * }
 *
 * // Allow sellers and admins
 * export async function PUT(request: NextRequest) {
 *   const user = await requireRole(request, ['seller', 'admin']);
 * }
 * ```
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthTokenPayload> {
  const user = await requireAuth(request);

  if (!allowedRoles.includes(user.role)) {
    throw new AuthError(
      `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      'FORBIDDEN',
      403
    );
  }

  return user;
}

/**
 * Optional authentication - returns user if authenticated, null otherwise
 * Useful for endpoints that support both authenticated and anonymous access
 *
 * @param request - NextRequest object
 * @returns Authenticated user payload or null
 *
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   const user = await optionalAuth(request);
 *   if (user) {
 *     // Show personalized content
 *   } else {
 *     // Show public content
 *   }
 * }
 * ```
 */
export async function optionalAuth(
  request: NextRequest
): Promise<AuthTokenPayload | null> {
  try {
    return await requireAuth(request);
  } catch (error) {
    return null;
  }
}

/**
 * Check if user is admin
 */
export function isAdmin(user: AuthTokenPayload): boolean {
  return user.role === UserRole.ADMIN;
}

/**
 * Check if user is seller (service_provider or seller)
 */
export function isSeller(user: AuthTokenPayload): boolean {
  return user.role === UserRole.SELLER || user.role === UserRole.ADMIN;
}

/**
 * Check if user is service provider (seller)
 * Alias for isSeller
 */
export function isServiceProvider(user: AuthTokenPayload): boolean {
  return isSeller(user);
}

/**
 * Check if user is client (buyer or user)
 */
export function isClient(user: AuthTokenPayload): boolean {
  return user.role === UserRole.BUYER || user.role === UserRole.ADMIN;
}

/**
 * Check if user is verifier
 */
export function isVerifier(user: AuthTokenPayload): boolean {
  return user.role === UserRole.VERIFIER;
}

/**
 * Check if user owns resource (by userId)
 */
export function isOwner(user: AuthTokenPayload, ownerId: string): boolean {
  return user.userId === ownerId;
}

/**
 * Check if user can access resource (owner or admin)
 */
export function canAccess(user: AuthTokenPayload, ownerId: string): boolean {
  return isOwner(user, ownerId) || isAdmin(user);
}

/**
 * Verify authentication (alias for optionalAuth for backward compatibility)
 * @deprecated Use optionalAuth instead
 */
export const verifyAuth = optionalAuth;

/**
 * Hash password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns True if passwords match
 */
export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate JWT token for user
 * @param payload - Token payload with user information
 * @returns JWT token string
 */
export async function generateToken(
  payload: Omit<AuthTokenPayload, 'iat' | 'exp'>
): Promise<string> {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AuthError(
      'JWT_SECRET is not configured',
      'CONFIG_ERROR',
      500
    );
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Token expires in 7 days
    .sign(new TextEncoder().encode(secret));

  return token;
}

/**
 * Generate refresh token for user
 * @param userId - User ID
 * @returns Refresh token string
 */
export async function generateRefreshToken(userId: string): Promise<string> {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AuthError(
      'JWT_SECRET is not configured',
      'CONFIG_ERROR',
      500
    );
  }

  const token = await new SignJWT({ userId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d') // Refresh token expires in 30 days
    .sign(new TextEncoder().encode(secret));

  return token;
}
