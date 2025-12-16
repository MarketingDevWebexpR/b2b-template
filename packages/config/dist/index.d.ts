/**
 * Shared constants for Maison applications
 */
/**
 * API endpoints configuration
 */
declare const API_ENDPOINTS: {
    readonly SAGE: {
        readonly PRODUCTION: "https://api.sage.com";
        readonly STAGING: "https://api-staging.sage.com";
    };
    readonly MEDUSA: {
        readonly PRODUCTION: "https://api.medusa.example.com";
        readonly STAGING: "https://api-staging.medusa.example.com";
    };
    readonly SHOPIFY: {
        readonly PRODUCTION: "https://api.shopify.example.com";
    };
};
/**
 * Pagination defaults
 */
declare const PAGINATION: {
    readonly DEFAULT_PAGE_SIZE: 20;
    readonly MAX_PAGE_SIZE: 100;
};
/**
 * Cache TTL values in seconds
 */
declare const CACHE_TTL: {
    readonly SHORT: 60;
    readonly MEDIUM: 300;
    readonly LONG: 3600;
    readonly DAY: 86400;
};
/**
 * HTTP timeout values in milliseconds
 */
declare const HTTP_TIMEOUTS: {
    readonly DEFAULT: 30000;
    readonly LONG: 60000;
    readonly UPLOAD: 120000;
};

/**
 * Environment configuration utilities
 */
/**
 * Environment type
 */
type Environment = "development" | "staging" | "production" | "test";
/**
 * Get the current environment
 */
declare function getEnvironment(): Environment;
/**
 * Check if running in production
 */
declare function isProduction(): boolean;
/**
 * Check if running in development
 */
declare function isDevelopment(): boolean;
/**
 * Check if running in test
 */
declare function isTest(): boolean;
/**
 * Get a required environment variable
 * @throws Error if variable is not set
 */
declare function requireEnv(key: string): string;
/**
 * Get an optional environment variable with a default value
 */
declare function getEnv(key: string, defaultValue: string): string;
/**
 * Get an optional environment variable as a number
 */
declare function getEnvNumber(key: string, defaultValue: number): number;
/**
 * Get an optional environment variable as a boolean
 */
declare function getEnvBoolean(key: string, defaultValue: boolean): boolean;

export { API_ENDPOINTS, CACHE_TTL, type Environment, HTTP_TIMEOUTS, PAGINATION, getEnv, getEnvBoolean, getEnvNumber, getEnvironment, isDevelopment, isProduction, isTest, requireEnv };
