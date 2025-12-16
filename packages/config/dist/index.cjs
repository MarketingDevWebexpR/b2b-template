'use strict';

// src/constants.ts
var API_ENDPOINTS = {
  SAGE: {
    PRODUCTION: "https://api.sage.com",
    STAGING: "https://api-staging.sage.com"
  },
  MEDUSA: {
    PRODUCTION: "https://api.medusa.example.com",
    STAGING: "https://api-staging.medusa.example.com"
  },
  SHOPIFY: {
    PRODUCTION: "https://api.shopify.example.com"
  }
};
var PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};
var CACHE_TTL = {
  SHORT: 60,
  // 1 minute
  MEDIUM: 300,
  // 5 minutes
  LONG: 3600,
  // 1 hour
  DAY: 86400
  // 24 hours
};
var HTTP_TIMEOUTS = {
  DEFAULT: 3e4,
  // 30 seconds
  LONG: 6e4,
  // 60 seconds
  UPLOAD: 12e4
  // 2 minutes
};

// src/env.ts
function getEnvironment() {
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
function isProduction() {
  return getEnvironment() === "production";
}
function isDevelopment() {
  return getEnvironment() === "development";
}
function isTest() {
  return getEnvironment() === "test";
}
function requireEnv(key) {
  const value = process.env[key];
  if (value === void 0 || value === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
function getEnv(key, defaultValue) {
  return process.env[key] ?? defaultValue;
}
function getEnvNumber(key, defaultValue) {
  const value = process.env[key];
  if (value === void 0) {
    return defaultValue;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}
function getEnvBoolean(key, defaultValue) {
  const value = process.env[key];
  if (value === void 0) {
    return defaultValue;
  }
  return value === "true" || value === "1";
}

exports.API_ENDPOINTS = API_ENDPOINTS;
exports.CACHE_TTL = CACHE_TTL;
exports.HTTP_TIMEOUTS = HTTP_TIMEOUTS;
exports.PAGINATION = PAGINATION;
exports.getEnv = getEnv;
exports.getEnvBoolean = getEnvBoolean;
exports.getEnvNumber = getEnvNumber;
exports.getEnvironment = getEnvironment;
exports.isDevelopment = isDevelopment;
exports.isProduction = isProduction;
exports.isTest = isTest;
exports.requireEnv = requireEnv;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map