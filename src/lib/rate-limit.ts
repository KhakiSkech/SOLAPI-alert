/**
 * Simple in-memory rate limiting middleware
 * For production, consider using Redis-based solution like @upstash/ratelimit
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxRequests: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Optional key prefix for different endpoints
   */
  keyPrefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if request is within rate limit
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = config.keyPrefix
    ? `${config.keyPrefix}:${identifier}`
    : identifier;

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // No existing entry or expired
  if (!entry || entry.resetTime < now) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetTime,
    });

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: resetTime,
    };
  }

  // Within time window
  if (entry.count < config.maxRequests) {
    entry.count++;
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - entry.count,
      reset: entry.resetTime,
    };
  }

  // Rate limit exceeded
  return {
    success: false,
    limit: config.maxRequests,
    remaining: 0,
    reset: entry.resetTime,
  };
}

/**
 * Get client identifier from request
 * Uses X-Forwarded-For header or remote address
 */
export function getClientIdentifier(req: any): string {
  // Check for forwarded IP (behind proxy)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : forwarded[0];
  }

  // Check for real IP
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return typeof realIp === 'string' ? realIp : realIp[0];
  }

  // Fallback to socket address
  return req.socket?.remoteAddress || 'unknown';
}

/**
 * Predefined rate limit configurations
 */
export const RateLimitPresets = {
  /**
   * Strict limit for authentication endpoints (10 requests per minute)
   */
  AUTH: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  },

  /**
   * Standard limit for API endpoints (30 requests per minute)
   */
  API: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
  },

  /**
   * Generous limit for webhooks (100 requests per minute)
   */
  WEBHOOK: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },

  /**
   * Very strict limit for sensitive operations (5 requests per minute)
   */
  SENSITIVE: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  },
} as const;
