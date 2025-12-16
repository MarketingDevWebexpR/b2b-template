/**
 * Custom Middleware Configuration
 *
 * This file defines middleware for custom API routes.
 * Middlewares can handle authentication, validation, logging, etc.
 *
 * @see https://docs.medusajs.com/learn/customization/custom-features/api-route#middleware
 */

import { defineMiddlewares, authenticate } from "@medusajs/framework/http";
import type { Request, Response, NextFunction } from "express";

// =========================================================================
// RATE LIMITING IMPLEMENTATION
// =========================================================================

/**
 * Rate limit entry tracking requests per IP
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Rate limit store - uses Map for O(1) lookups
 * Key format: `${ip}:${routeKey}`
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Cleanup interval to prevent memory leaks
 * Removes expired entries every 5 minutes
 */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime <= now) {
      rateLimitStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);

/**
 * Get client IP address, handling proxies
 * Prioritizes X-Forwarded-For for reverse proxy setups
 */
function getClientIp(req: Request): string {
  // X-Forwarded-For can contain multiple IPs; take the first (client IP)
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor.split(",")[0];
    return ips.trim();
  }

  // X-Real-IP is set by some proxies (nginx)
  const realIp = req.headers["x-real-ip"];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  // Fallback to socket remote address
  return req.socket?.remoteAddress || req.ip || "unknown";
}

/**
 * Rate limiting configuration options
 */
interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Unique key to identify this rate limit bucket */
  routeKey: string;
  /** Custom error message */
  message?: string;
  /** HTTP methods to apply rate limiting to (empty = all methods) */
  methods?: string[];
}

/**
 * Creates a rate limiting middleware
 *
 * @param options - Rate limiting configuration
 * @returns Express middleware function
 *
 * Security considerations:
 * - IP-based tracking (can be spoofed, but provides basic protection)
 * - In-memory storage (resets on server restart - acceptable for most use cases)
 * - For production with multiple instances, consider Redis-based solution
 */
function createRateLimiter(options: RateLimitOptions) {
  const {
    maxRequests,
    windowMs,
    routeKey,
    message = "Too many requests, please try again later.",
    methods = [],
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip if method filter is specified and doesn't match
    if (methods.length > 0 && !methods.includes(req.method.toUpperCase())) {
      return next();
    }

    const clientIp = getClientIp(req);
    const key = `${clientIp}:${routeKey}`;
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    // Create new entry or reset if window expired
    if (!entry || entry.resetTime <= now) {
      entry = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, entry);
    } else {
      entry.count++;
    }

    // Calculate remaining requests and time until reset
    const remaining = Math.max(0, maxRequests - entry.count);
    const resetTimeSeconds = Math.ceil((entry.resetTime - now) / 1000);

    // Set rate limit headers (standard draft RFC)
    res.setHeader("X-RateLimit-Limit", maxRequests.toString());
    res.setHeader("X-RateLimit-Remaining", remaining.toString());
    res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetTime / 1000).toString());
    res.setHeader("RateLimit-Policy", `${maxRequests};w=${Math.ceil(windowMs / 1000)}`);

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      res.setHeader("Retry-After", resetTimeSeconds.toString());

      return res.status(429).json({
        type: "rate_limit_exceeded",
        message,
        retry_after: resetTimeSeconds,
        limit: maxRequests,
        window_seconds: Math.ceil(windowMs / 1000),
      });
    }

    return next();
  };
}

// =========================================================================
// PRE-CONFIGURED RATE LIMITERS
// =========================================================================

/**
 * General rate limiter for B2B store routes
 * 60 requests per minute per IP
 */
const storeB2BRateLimiter = createRateLimiter({
  maxRequests: 60,
  windowMs: 60 * 1000, // 1 minute
  routeKey: "store-b2b-general",
  message: "Too many requests to B2B store API. Please try again later.",
});

/**
 * Strict rate limiter for spending check endpoint
 * 10 requests per minute per IP
 * This endpoint may involve expensive calculations
 */
const spendingCheckRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
  routeKey: "store-b2b-spending-check",
  message: "Too many spending check requests. Please wait before trying again.",
});

/**
 * Rate limiter for approval actions
 * 20 requests per minute per IP
 * Prevents rapid approval/rejection spam
 */
const approvalActionRateLimiter = createRateLimiter({
  maxRequests: 20,
  windowMs: 60 * 1000, // 1 minute
  routeKey: "store-b2b-approval-action",
  message: "Too many approval action requests. Please wait before trying again.",
});

/**
 * Rate limiter for quote creation
 * 10 requests per minute per IP (POST only)
 * Prevents quote spam
 */
const quoteCreateRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
  routeKey: "store-b2b-quote-create",
  message: "Too many quote creation requests. Please wait before trying again.",
  methods: ["POST"],
});

/**
 * Rate limiter for admin B2B routes
 * 100 requests per minute per IP
 * More generous for admin operations
 */
const adminB2BRateLimiter = createRateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
  routeKey: "admin-b2b-general",
  message: "Too many admin API requests. Please try again later.",
});

export default defineMiddlewares({
  routes: [
    // =========================================================================
    // RATE LIMITING MIDDLEWARE (applied first, before authentication)
    // =========================================================================

    // General rate limiting for all B2B store routes (60 req/min)
    {
      matcher: "/store/b2b/*",
      middlewares: [storeB2BRateLimiter],
    },

    // Strict rate limiting for spending check (10 req/min)
    // Applied before general limiter due to route specificity
    {
      matcher: "/store/b2b/spending/check",
      middlewares: [spendingCheckRateLimiter],
    },

    // Strict rate limiting for approval actions (20 req/min)
    {
      matcher: "/store/b2b/approvals/*/action",
      middlewares: [approvalActionRateLimiter],
    },

    // Strict rate limiting for quote creation (10 req/min, POST only)
    {
      matcher: "/store/b2b/quotes",
      middlewares: [quoteCreateRateLimiter],
    },

    // Rate limiting for admin B2B routes (100 req/min)
    {
      matcher: "/admin/b2b/*",
      middlewares: [adminB2BRateLimiter],
    },

    // =========================================================================
    // B2B STORE AUTHENTICATION MIDDLEWARE
    // =========================================================================

    {
      // Protect all B2B store routes
      matcher: "/store/b2b/**",
      middlewares: [
        authenticate("customer", ["bearer", "session"]),
      ],
    },

    // =========================================================================
    // B2B ADMIN AUTHENTICATION MIDDLEWARE
    // =========================================================================

    {
      // Admin B2B routes - authenticate all routes under /admin/b2b
      matcher: "/admin/b2b/**",
      middlewares: [
        authenticate("user", ["bearer", "session"]),
      ],
    },
  ],
});
