/**
 * In-memory sliding-window rate limiter.
 *
 * This is a lightweight, zero-dependency implementation suitable for a
 * single-instance Node.js deployment. It is NOT shared across multiple
 * server instances or processes. For a multi-instance deployment,
 * replace the store with Redis (e.g., via `@upstash/ratelimit`).
 *
 * Usage:
 *   const result = loginRateLimiter.check(identifier);
 *   if (!result.allowed) {
 *     return { success: false, message: result.message };
 *   }
 */

interface RateLimitEntry {
  /** Timestamps (ms) of each attempt within the current window */
  attempts: number[];
}

interface RateLimitResult {
  /** Whether the request is allowed to proceed */
  allowed: boolean;
  /** Number of remaining attempts before being blocked */
  remaining: number;
  /** Human-readable error message when not allowed */
  message: string;
}

class SlidingWindowRateLimiter {
  private readonly store = new Map<string, RateLimitEntry>();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly maxEntries: number;

  /**
   * @param maxAttempts  Maximum number of attempts per window
   * @param windowMs     Time window in milliseconds
   * @param maxEntries   Maximum distinct identifiers in memory before eviction (default 5,000)
   */
  constructor(maxAttempts: number, windowMs: number, maxEntries: number = 5000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.maxEntries = maxEntries;
  }

  private cleanup(now: number): void {
    const windowStart = now - this.windowMs;
    for (const [key, entry] of this.store.entries()) {
      entry.attempts = entry.attempts.filter((t) => t > windowStart);
      if (entry.attempts.length === 0) {
        this.store.delete(key);
      }
    }
  }

  check(identifier: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Guard against unbounded store growth: purge expired if near capacity
    if (this.store.size >= this.maxEntries) {
      this.cleanup(now);
      // If still at capacity after cleanup, evict oldest entry
      if (this.store.size >= this.maxEntries) {
        const oldestKey = this.store.keys().next().value;
        if (oldestKey) {
          this.store.delete(oldestKey);
        }
      }
    }

    const entry = this.store.get(identifier) ?? { attempts: [] };

    // Evict attempts outside the current window (sliding)
    entry.attempts = entry.attempts.filter((t) => t > windowStart);

    if (entry.attempts.length >= this.maxAttempts) {
      this.store.set(identifier, entry);
      const retryAfterSeconds = Math.ceil(
        (entry.attempts[0] + this.windowMs - now) / 1000
      );
      return {
        allowed: false,
        remaining: 0,
        message: `Too many login attempts. Please try again in ${retryAfterSeconds} second${retryAfterSeconds === 1 ? "" : "s"}.`,
      };
    }

    // Record this attempt
    entry.attempts.push(now);
    this.store.set(identifier, entry);

    return {
      allowed: true,
      remaining: this.maxAttempts - entry.attempts.length,
      message: "",
    };
  }

  /**
   * Clears all recorded attempts for an identifier.
   * Call this on successful login to reset the counter.
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }
}

/**
 * Rate limiter for the admin login endpoint.
 *
 * Policy: maximum 10 attempts per 15-minute window per identifier.
 * The identifier should be the client IP address or email, preferring IP.
 */
export const loginRateLimiter = new SlidingWindowRateLimiter(
  10,
  15 * 60 * 1000 // 15 minutes
);
