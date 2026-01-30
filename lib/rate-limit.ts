/**
 * Rate Limiting Utility
 * Redis-based rate limiter with in-memory fallback
 */

import { NextRequest } from 'next/server';
import { LRUCache } from 'lru-cache';
import { redis } from './redis';

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
 * Create a rate limiter using Redis or in-memory fallback
 * @param options - Rate limit configuration
 * @returns Rate limiter instance
 */
export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache<string, number[]>({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval,
  });

  const getIdentifier = (request: NextRequest, token?: string): string => {
    return (
      token ||
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'
    );
  };

  return {
    async check(
      request: NextRequest,
      limit: number,
      token?: string
    ): Promise<RateLimitResult> {
      const identifier = getIdentifier(request, token);
      const now = Date.now();
      const windowStart = now - options.interval;
      const redisKey = `rate-limit:${identifier}`;

      if (redis) {
        try {
          const stored = await redis.get(redisKey);
          const timestamps: number[] = stored ? JSON.parse(stored) : [];
          const validTokens = timestamps.filter((ts) => ts > windowStart);

          if (validTokens.length >= limit) {
            const oldestToken = Math.min(...validTokens);
            const resetTime = oldestToken + options.interval;
            throw new Error('Rate limit exceeded');
          }

          validTokens.push(now);
          await redis.setex(
            redisKey,
            Math.ceil(options.interval / 1000),
            JSON.stringify(validTokens)
          );

          const oldestToken = Math.min(...validTokens);
          const resetTime = oldestToken + options.interval;

          return {
            limit,
            remaining: limit - validTokens.length,
            reset: Math.ceil(resetTime / 1000),
          };
        } catch (error) {
          if (error instanceof Error && error.message === 'Rate limit exceeded') {
            throw error;
          }
          console.error('Redis rate limit error, falling back to in-memory:', error);
        }
      }

      const tokenCount = tokenCache.get(identifier) || [];
      const validTokens = tokenCount.filter((timestamp) => timestamp > windowStart);

      if (validTokens.length >= limit) {
        const oldestToken = Math.min(...validTokens);
        const resetTime = oldestToken + options.interval;
        throw new Error('Rate limit exceeded');
      }

      validTokens.push(now);
      tokenCache.set(identifier, validTokens);

      const oldestToken = Math.min(...validTokens);
      const resetTime = oldestToken + options.interval;

      return {
        limit,
        remaining: limit - validTokens.length,
        reset: Math.ceil(resetTime / 1000),
      };
    },

    getStatus(
      request: NextRequest,
      limit: number,
      token?: string
    ): RateLimitResult {
      const identifier = getIdentifier(request, token);
      const now = Date.now();
      const windowStart = now - options.interval;

      const tokenCount = tokenCache.get(identifier) || [];
      const validTokens = tokenCount.filter((timestamp) => timestamp > windowStart);

      const oldestToken = validTokens.length > 0 ? Math.min(...validTokens) : now;
      const resetTime = oldestToken + options.interval;

      return {
        limit,
        remaining: Math.max(0, limit - validTokens.length),
        reset: Math.ceil(resetTime / 1000),
      };
    },

    reset(token: string): void {
      tokenCache.delete(token);
      if (redis) {
        redis.del(`rate-limit:${token}`).catch((error) => {
          console.error('Redis reset error:', error);
        });
      }
    },

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
