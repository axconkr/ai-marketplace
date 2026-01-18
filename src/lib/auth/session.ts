/**
 * Session Management
 * User session handling and utilities
 */

import { cookies } from 'next/headers';
import { authConfig } from './config';
import { verifyToken, generateTokenPair } from './jwt';
import { User, JWTPayload } from './types';

/**
 * Get current session from cookies
 * @returns Session payload or null
 */
export async function getSession(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(authConfig.cookies.accessToken.name)?.value;

    if (!token) {
      return null;
    }

    return verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Get current user from session
 * @param getUserById - Function to fetch user by ID
 * @returns User object or null
 */
export async function getCurrentUser(
  getUserById: (userId: string) => Promise<User | null>
): Promise<User | null> {
  const session = await getSession();
  if (!session) {
    return null;
  }

  return getUserById(session.userId);
}

/**
 * Set session cookies
 * @param user - User object
 * @returns Token pair
 */
export async function setSession(user: User): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const tokens = generateTokenPair(user);
  const cookieStore = await cookies();

  // Set access token cookie
  cookieStore.set(
    authConfig.cookies.accessToken.name,
    tokens.accessToken,
    authConfig.cookies.accessToken.options
  );

  // Set refresh token cookie
  cookieStore.set(
    authConfig.cookies.refreshToken.name,
    tokens.refreshToken,
    authConfig.cookies.refreshToken.options
  );

  return tokens;
}

/**
 * Clear session cookies
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(authConfig.cookies.accessToken.name);
  cookieStore.delete(authConfig.cookies.refreshToken.name);
}

/**
 * Refresh session using refresh token
 * @param getUserById - Function to fetch user by ID
 * @returns New access token or null
 */
export async function refreshSession(
  getUserById: (userId: string) => Promise<User | null>
): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(
      authConfig.cookies.refreshToken.name
    )?.value;

    if (!refreshToken) {
      return null;
    }

    const payload = verifyToken(refreshToken);
    if (payload.type !== 'refresh') {
      return null;
    }

    const user = await getUserById(payload.userId);
    if (!user) {
      return null;
    }

    const tokens = await setSession(user);
    return tokens.accessToken;
  } catch {
    return null;
  }
}

/**
 * Validate session and refresh if needed
 * @param getUserById - Function to fetch user by ID
 * @returns Current session or null
 */
export async function validateSession(
  getUserById: (userId: string) => Promise<User | null>
): Promise<JWTPayload | null> {
  let session = await getSession();

  // If no session, try to refresh
  if (!session) {
    await refreshSession(getUserById);
    session = await getSession();
  }

  return session;
}
