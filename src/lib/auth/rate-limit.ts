/**
 * Rate Limiting
 * In-memory rate limiting for authentication endpoints
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if a request should be rate limited
   * @param key - Unique identifier (e.g., IP address or email)
   * @param maxAttempts - Maximum attempts allowed
   * @param windowMs - Time window in milliseconds
   * @returns Object with limited status and retry info
   */
  check(
    key: string,
    maxAttempts: number,
    windowMs: number
  ): {
    limited: boolean;
    remaining: number;
    resetAt: number;
  } {
    const now = Date.now();
    const entry = this.store.get(key);

    // No entry or expired entry
    if (!entry || now > entry.resetAt) {
      const resetAt = now + windowMs;
      this.store.set(key, { count: 1, resetAt });
      return {
        limited: false,
        remaining: maxAttempts - 1,
        resetAt,
      };
    }

    // Increment count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > maxAttempts) {
      return {
        limited: true,
        remaining: 0,
        resetAt: entry.resetAt,
      };
    }

    return {
      limited: false,
      remaining: maxAttempts - entry.count,
      resetAt: entry.resetAt,
    };
  }

  /**
   * Reset rate limit for a key
   * @param key - Unique identifier
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Get remaining attempts
   * @param key - Unique identifier
   * @param maxAttempts - Maximum attempts allowed
   * @returns Number of remaining attempts
   */
  getRemaining(key: string, maxAttempts: number): number {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.resetAt) {
      return maxAttempts;
    }
    return Math.max(0, maxAttempts - entry.count);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Destroy the rate limiter
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Create singleton instances for different endpoints
export const loginRateLimiter = new RateLimiter();
export const registerRateLimiter = new RateLimiter();
export const passwordResetRateLimiter = new RateLimiter();

/**
 * Get client identifier from request
 * @param request - Request object
 * @returns Client identifier (IP or email)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers (for proxied requests)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier
  return 'unknown';
}

/**
 * Create a rate limit response
 * @param resetAt - Reset timestamp
 * @returns Response object
 */
export function createRateLimitResponse(resetAt: number): Response {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Reset': new Date(resetAt).toISOString(),
      },
    }
  );
}

/**
 * Add rate limit headers to response
 * @param response - Response object
 * @param remaining - Remaining attempts
 * @param resetAt - Reset timestamp
 * @returns Response with rate limit headers
 */
export function addRateLimitHeaders(
  response: Response,
  remaining: number,
  resetAt: number
): Response {
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Remaining', remaining.toString());
  headers.set('X-RateLimit-Reset', new Date(resetAt).toISOString());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
