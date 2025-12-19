// @ts-check
const { defineConfig, loadEnv, Modules } = require("@medusajs/framework/utils");

// Chargement des variables d'environnement
loadEnv(process.env["NODE_ENV"] ?? "development", process.cwd());

/**
 * Medusa V2 Configuration
 *
 * Ce fichier configure le backend Medusa pour le projet B2B e-commerce.
 * Il inclut la configuration de la base de donnees, des modules personnalises,
 * et du stockage de fichiers (MinIO/S3).
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

  // ==========================================================================
  // Modules Medusa
  // ==========================================================================
  modules: [
    // ------------------------------------------------------------------------
    // Modules B2B personnalises
    // ------------------------------------------------------------------------
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
    // CMS Module - Gestion du contenu (bandeaux d'annonce, etc.)
    {
      resolve: "./src/modules/cms",
    },
    // Marques Module - Gestion des marques (brands)
    {
      resolve: "./src/modules/marques",
    },

    // ------------------------------------------------------------------------
    // Search Module - App Search
    // ------------------------------------------------------------------------
    // Ce module fournit la recherche full-text avec Elastic App Search.
    //
    // Variables d'environnement App Search:
    //   - APPSEARCH_ENDPOINT: URL Elastic App Search
    //   - APPSEARCH_PRIVATE_KEY: Cle API privee
    //   - APPSEARCH_PUBLIC_KEY: Cle API publique (pour frontend)
    //   - APPSEARCH_ENGINE: Nom du moteur (default: dev-medusa-v2)
    // ------------------------------------------------------------------------
    {
      resolve: "./src/modules/search",
      options: {
        provider: "appsearch",

        // App Search configuration (Elastic)
        appSearchEndpoint: process.env["APPSEARCH_ENDPOINT"],
        appSearchPrivateKey: process.env["APPSEARCH_PRIVATE_KEY"],
        appSearchPublicKey: process.env["APPSEARCH_PUBLIC_KEY"],
        appSearchEngine: process.env["APPSEARCH_ENGINE"] ?? "dev-medusa-v2",
      },
    },

    // ------------------------------------------------------------------------
    // Module File Storage - MinIO (S3-compatible) ou AWS S3
    // ------------------------------------------------------------------------
    // Ce module gere le stockage des fichiers media (images produits, etc.)
    //
    // En developpement: utilise MinIO (lance via docker-compose)
    //   - Console: http://localhost:9001
    //   - API: http://localhost:9002
    //   - Credentials: minioadmin / minioadmin
    //
    // En production: utilise AWS S3 ou un service S3-compatible
    // ------------------------------------------------------------------------
    ...(process.env["S3_BUCKET"] ? [{
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "s3",
            options: {
              // URL publique pour acceder aux fichiers
              file_url: process.env["S3_FILE_URL"],

              // Identifiants d'acces S3/MinIO
              access_key_id: process.env["S3_ACCESS_KEY_ID"],
              secret_access_key: process.env["S3_SECRET_ACCESS_KEY"],

              // Configuration du bucket
              region: process.env["S3_REGION"] ?? "us-east-1",
              bucket: process.env["S3_BUCKET"],

              // Endpoint personnalise pour MinIO (ne pas definir pour AWS S3)
              // Important: MinIO necessite un endpoint explicite
              endpoint: process.env["S3_ENDPOINT"],

              // Force le path-style pour MinIO (bucket dans le path, pas le sous-domaine)
              // AWS S3: https://bucket-name.s3.region.amazonaws.com/key
              // MinIO:  http://localhost:9002/bucket-name/key
              // Par defaut true car MinIO le requiert; mettre S3_FORCE_PATH_STYLE=false pour AWS S3
              additional_client_config: {
                forcePathStyle: process.env["S3_FORCE_PATH_STYLE"] !== "false",
              },
            },
          },
        ],
      },
    }] : []),
  ],

  plugins: [],
  featureFlags: {},
});
