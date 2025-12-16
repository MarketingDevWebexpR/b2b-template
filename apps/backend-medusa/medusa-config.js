// @ts-check
const { defineConfig, loadEnv } = require("@medusajs/framework/utils");

// Load environment variables
loadEnv(process.env["NODE_ENV"] ?? "development", process.cwd());

/**
 * Medusa V2 Configuration
 */
module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env["DATABASE_URL"] ?? "postgres://localhost:5432/medusa",
    databaseDriverOptions: {
      ssl:
        process.env["NODE_ENV"] === "production"
          ? { rejectUnauthorized: false }
          : false,
    },
    databaseLogging: process.env["NODE_ENV"] === "development",

    http: {
      storeCors: process.env["STORE_CORS"] ?? "http://localhost:3000",
      adminCors: process.env["ADMIN_CORS"] ?? "http://localhost:7001",
      authCors: process.env["AUTH_CORS"] ?? "http://localhost:3000,http://localhost:7001",
      jwtSecret: process.env["JWT_SECRET"] ?? "supersecret-jwt-token-change-in-production",
      cookieSecret: process.env["COOKIE_SECRET"] ?? "supersecret-cookie-token-change-in-production",
    },

    workerMode: process.env["MEDUSA_WORKER_MODE"] ?? "shared",
  },

  admin: {
    disable: process.env["DISABLE_ADMIN"] === "true",
    path: "/app",
    backendUrl: process.env["MEDUSA_BACKEND_URL"] ?? "http://localhost:9000",
  },

  // B2B Custom Modules
  modules: [
    {
      resolve: "./src/modules/b2b-company",
    },
    {
      resolve: "./src/modules/b2b-spending",
    },
    {
      resolve: "./src/modules/b2b-approval",
    },
    {
      resolve: "./src/modules/b2b-quote",
    },
  ],

  plugins: [],
  featureFlags: {},
});
