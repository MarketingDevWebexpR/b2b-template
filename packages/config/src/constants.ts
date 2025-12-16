/**
 * Shared constants for Maison applications
 */

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
  SAGE: {
    PRODUCTION: "https://api.sage.com",
    STAGING: "https://api-staging.sage.com",
  },
  MEDUSA: {
    PRODUCTION: "https://api.medusa.example.com",
    STAGING: "https://api-staging.medusa.example.com",
  },
  SHOPIFY: {
    PRODUCTION: "https://api.shopify.example.com",
  },
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Cache TTL values in seconds
 */
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const;

/**
 * HTTP timeout values in milliseconds
 */
export const HTTP_TIMEOUTS = {
  DEFAULT: 30_000, // 30 seconds
  LONG: 60_000, // 60 seconds
  UPLOAD: 120_000, // 2 minutes
} as const;
