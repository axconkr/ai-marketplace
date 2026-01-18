/**
 * Rate Limiting Utility
 * Simple in-memory rate limiter for API endpoints
 */

import { NextRequest } from 'next/server';
import { LRUCache } from 'lru-cache';

/**
 * Rate limit options
 */
export interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval?: number; // Max unique tokens to track
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Create a rate limiter
 * @param options - Rate limit configuration
 * @returns Rate limiter instance
 */
export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache<string, number[]>({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval,
  });

  return {
    /**
     * Check if request is within rate limit
     * @param request - NextRequest object
     * @param limit - Maximum number of requests allowed
     * @param token - Optional custom token (defaults to IP address)
     * @throws Error if rate limit exceeded
     */
    async check(
      request: NextRequest,
      limit: number,
      token?: string
    ): Promise<RateLimitResult> {
      // Get token (use custom token or IP address)
      const identifier =
        token ||
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        'unknown';

      // Get current timestamps for this token
      const tokenCount = tokenCache.get(identifier) || [];
      const now = Date.now();
      const windowStart = now - options.interval;

      // Filter out old timestamps outside the window
      const validTokens = tokenCount.filter((timestamp) => timestamp > windowStart);

      // Check if limit exceeded
      if (validTokens.length >= limit) {
        const oldestToken = Math.min(...validTokens);
        const resetTime = oldestToken + options.interval;

        throw new Error('Rate limit exceeded');
      }

      // Add current request timestamp
      validTokens.push(now);
      tokenCache.set(identifier, validTokens);

      // Calculate reset time
      const oldestToken = Math.min(...validTokens);
      const resetTime = oldestToken + options.interval;

      return {
        limit,
        remaining: limit - validTokens.length,
        reset: Math.ceil(resetTime / 1000), // Convert to seconds
      };
    },

    /**
     * Get current rate limit status without incrementing
     * @param request - NextRequest object
     * @param limit - Maximum number of requests allowed
     * @param token - Optional custom token
     * @returns Rate limit status
     */
    getStatus(
      request: NextRequest,
      limit: number,
      token?: string
    ): RateLimitResult {
      const identifier =
        token ||
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        'unknown';

      const tokenCount = tokenCache.get(identifier) || [];
      const now = Date.now();
      const windowStart = now - options.interval;

      const validTokens = tokenCount.filter((timestamp) => timestamp > windowStart);

      const oldestToken = validTokens.length > 0 ? Math.min(...validTokens) : now;
      const resetTime = oldestToken + options.interval;

      return {
        limit,
        remaining: Math.max(0, limit - validTokens.length),
        reset: Math.ceil(resetTime / 1000),
      };
    },

    /**
     * Reset rate limit for a specific token
     * @param token - Token to reset
     */
    reset(token: string): void {
      tokenCache.delete(token);
    },

    /**
     * Clear all rate limit data
     */
    clear(): void {
      tokenCache.clear();
    },
  };
}

/**
 * Apply rate limit headers to response
 * @param headers - Response headers
 * @param result - Rate limit result
 */
export function applyRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult
): void {
  headers.set('X-RateLimit-Limit', String(result.limit));
  headers.set('X-RateLimit-Remaining', String(result.remaining));
  headers.set('X-RateLimit-Reset', String(result.reset));
}
