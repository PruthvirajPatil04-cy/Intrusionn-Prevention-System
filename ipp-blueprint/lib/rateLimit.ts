import { LRUCache } from "lru-cache";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory token bucket rate limiter: 30 requests per 60 seconds window per IP
const rateLimitCache = new LRUCache<string, RateLimitRecord>({
  max: 5000,
  ttl: 60 * 1000, // 60s
});

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  identifier: string,
  limit: number = 30,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitCache.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitCache.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      retryAfterSeconds: 0,
    };
  }

  if (record.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  record.count += 1;
  rateLimitCache.set(identifier, record);

  return {
    allowed: true,
    limit,
    remaining: limit - record.count,
    retryAfterSeconds: 0,
  };
}
