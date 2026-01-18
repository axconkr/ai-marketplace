/**
 * JWT Token Management
 * Secure token generation, verification, and management
 */

import jwt from 'jsonwebtoken';
import { authConfig } from './config';
import { JWTPayload, User, UserRole } from './types';

/**
 * Map database role strings to UserRole enum
 * Database uses: 'admin', 'seller', 'user', 'verifier'
 * JWT/Middleware expects: UserRole enum values
 */
export function mapDatabaseRoleToUserRole(dbRole: string): UserRole {
  switch (dbRole.toLowerCase()) {
    case 'admin':
      return UserRole.ADMIN;
    case 'seller':
      return UserRole.SERVICE_PROVIDER;
    case 'verifier':
      return UserRole.ADMIN; // Verifiers have admin-level access
    case 'user':
    default:
      return UserRole.CLIENT;
  }
}

/**
 * Generate an access token
 * @param user - User object (with database role string)
 * @returns Access token string
 */
export function generateAccessToken(user: User | { id: string; email: string; role: string; name?: string | null }): string {
  const mappedRole = typeof user.role === 'string'
    ? mapDatabaseRoleToUserRole(user.role)
    : user.role;

  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user.id,
    email: user.email,
    role: mappedRole,
    type: 'access',
  };

  return jwt.sign(payload, authConfig.jwt.secret, {
    algorithm: authConfig.jwt.algorithm,
    expiresIn: authConfig.jwt.accessTokenExpiry,
  });
}

/**
 * Generate a refresh token
 * @param user - User object (with database role string)
 * @returns Refresh token string
 */
export function generateRefreshToken(user: User | { id: string; email: string; role: string; name?: string | null }): string {
  const mappedRole = typeof user.role === 'string'
    ? mapDatabaseRoleToUserRole(user.role)
    : user.role;

  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user.id,
    email: user.email,
    role: mappedRole,
    type: 'refresh',
  };

  return jwt.sign(payload, authConfig.jwt.secret, {
    algorithm: authConfig.jwt.algorithm,
    expiresIn: authConfig.jwt.refreshTokenExpiry,
  });
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, authConfig.jwt.secret, {
      algorithms: [authConfig.jwt.algorithm],
    });

    if (typeof decoded === 'string') {
      throw new Error('Invalid token format');
    }

    return decoded as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Decode a JWT token without verification (for debugging)
 * @param token - JWT token string
 * @returns Decoded token payload or null
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token);
    return decoded as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Check if a token is expired
 * @param token - JWT token string
 * @returns True if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  return Date.now() >= decoded.exp * 1000;
}

/**
 * Get token expiration time
 * @param token - JWT token string
 * @returns Expiration date or null
 */
export function getTokenExpiration(token: string): Date | null {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }

  return new Date(decoded.exp * 1000);
}

/**
 * Refresh an access token using a refresh token
 * @param refreshToken - Refresh token string
 * @param getUserById - Function to fetch user by ID
 * @returns New access token
 * @throws Error if refresh token is invalid
 */
export async function refreshAccessToken(
  refreshToken: string,
  getUserById: (userId: string) => Promise<User | null>
): Promise<string> {
  const payload = verifyToken(refreshToken);

  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type');
  }

  const user = await getUserById(payload.userId);
  if (!user) {
    throw new Error('User not found');
  }

  return generateAccessToken(user);
}

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
}

/**
 * Generate token pair (access + refresh)
 * @param user - User object
 * @returns Object with access and refresh tokens
 */
export function generateTokenPair(user: User): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
}
