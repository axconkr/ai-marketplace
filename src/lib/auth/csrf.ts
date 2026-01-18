/**
 * CSRF Protection
 * Cross-Site Request Forgery protection utilities
 */

import crypto from 'crypto';
import { authConfig } from './config';

/**
 * Generate a CSRF token
 * @returns CSRF token string
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a CSRF token hash
 * @param token - CSRF token
 * @returns Token hash
 */
export function hashCsrfToken(token: string): string {
  return crypto
    .createHmac('sha256', authConfig.csrf.secret)
    .update(token)
    .digest('hex');
}

/**
 * Verify a CSRF token
 * @param token - CSRF token from request
 * @param hash - Stored token hash
 * @returns True if token is valid
 */
export function verifyCsrfToken(token: string, hash: string): boolean {
  const tokenHash = hashCsrfToken(token);
  return crypto.timingSafeEqual(Buffer.from(tokenHash), Buffer.from(hash));
}

/**
 * Generate a CSRF token pair (token + hash)
 * @returns Object with token and hash
 */
export function generateCsrfTokenPair(): {
  token: string;
  hash: string;
} {
  const token = generateCsrfToken();
  const hash = hashCsrfToken(token);
  return { token, hash };
}

/**
 * Extract CSRF token from request headers
 * @param headers - Request headers
 * @returns CSRF token or null
 */
export function extractCsrfToken(
  headers: Headers | Record<string, string | undefined>
): string | null {
  if (headers instanceof Headers) {
    return headers.get(authConfig.csrf.headerName);
  }
  return headers[authConfig.csrf.headerName] || null;
}
