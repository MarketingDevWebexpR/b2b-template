/**
 * Environment configuration utilities
 */

/**
 * Environment type
 */
export type Environment = "development" | "staging" | "production" | "test";

/**
 * Get the current environment
 */
export function getEnvironment(): Environment {
  const env = process.env["NODE_ENV"];

  switch (env) {
    case "production":
      return "production";
    case "test":
      return "test";
    case "staging":
      return "staging";
    default:
      return "development";
  }
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnvironment() === "production";
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnvironment() === "development";
}

/**
 * Check if running in test
 */
export function isTest(): boolean {
  return getEnvironment() === "test";
}

/**
 * Get a required environment variable
 * @throws Error if variable is not set
 */
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get an optional environment variable with a default value
 */
export function getEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

/**
 * Get an optional environment variable as a number
 */
export function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get an optional environment variable as a boolean
 */
export function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  return value === "true" || value === "1";
}
