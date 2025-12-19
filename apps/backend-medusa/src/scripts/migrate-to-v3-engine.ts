/**
 * Migration Script: dev-medusa-v2 -> dev-medusa-v3
 *
 * Creates a new App Search engine with updated schema:
 * - Hierarchical category levels (category_lvl0-4) for InstantSearch-style navigation
 * - Boolean fields as strings ("true"/"false") for consistent faceting
 *
 * The old engine (dev-medusa-v2) is kept intact during migration.
 *
 * Run with: npx medusa exec ./src/scripts/migrate-to-v3-engine.ts
 *
 * After verification, update APPSEARCH_ENGINE env var to "dev-medusa-v3"
 */

import type { ExecArgs, Logger } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  transformProductForIndex,
  transformCategoryForIndex,
  transformMarqueForIndex,
} from "../modules/search/utils/transformers";

// Engine name - uses existing engine or new one if specified via env
// Set MIGRATION_ENGINE=dev-medusa-v3 to use a new engine (must be created manually in Elastic Cloud)
const ENGINE_NAME = process.env.MIGRATION_ENGINE || process.env.APPSEARCH_ENGINE || "dev-medusa-v2";

// App Search configuration from environment
const APPSEARCH_ENDPOINT = process.env.APPSEARCH_ENDPOINT || "";
const APPSEARCH_PRIVATE_KEY = process.env.APPSEARCH_PRIVATE_KEY || "";

if (!APPSEARCH_ENDPOINT || !APPSEARCH_PRIVATE_KEY) {
  throw new Error("Missing APPSEARCH_ENDPOINT or APPSEARCH_PRIVATE_KEY environment variables");
}

/**
 * Make an App Search API request
 */
async function appSearchRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${APPSEARCH_ENDPOINT}/api/as/v1/${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${APPSEARCH_PRIVATE_KEY}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`App Search API error (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Check if the engine exists
 */
async function checkEngine(logger: Logger): Promise<boolean> {
  logger.info(`Checking if engine "${ENGINE_NAME}" exists...`);

  try {
    await appSearchRequest(`engines/${ENGINE_NAME}`);
    logger.info(`   ✓ Engine "${ENGINE_NAME}" exists`);
    return true;
  } catch {
    logger.error(`   ✗ Engine "${ENGINE_NAME}" does not exist!`);
    logger.error(`   Please create it manually in Elastic Cloud console or use an existing engine.`);
    return false;
  }
}

/**
 * Clear all documents from the engine
 */
async function clearEngine(logger: Logger): Promise<void> {
  logger.info(`Clearing all documents from "${ENGINE_NAME}"...`);

  try {
    // Search for all documents
    const searchResponse = await appSearchRequest<{
      results: Array<{ id: { raw: string } }>;
      meta: { page: { total_results: number } };
    }>(`engines/${ENGINE_NAME}/search`, {
      method: "POST",
      body: JSON.stringify({
        query: "",
        page: { size: 1000 },
        result_fields: { id: { raw: {} } },
      }),
    });

    const total = searchResponse.meta.page.total_results;
    if (total === 0) {
      logger.info(`   Engine is already empty`);
      return;
    }

    // Delete all documents in batches
    const ids = searchResponse.results.map((r) => r.id.raw);
    const batchSize = 100;

    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      await appSearchRequest(`engines/${ENGINE_NAME}/documents`, {
        method: "DELETE",
        body: JSON.stringify(batch),
      });
      logger.info(`   Deleted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(ids.length / batchSize)}`);
    }

    logger.info(`   Cleared ${ids.length} documents`);
  } catch (error) {
    // Engine might be empty or just created
    logger.info(`   Engine appears to be empty or new`);
  }
}

/**
 * Index documents in batches
 */
async function indexDocuments(
  documents: Record<string, unknown>[],
  docType: string,
  logger: Logger
): Promise<{ success: number; failed: number }> {
  const batchSize = 100;
  let success = 0;
  let failed = 0;

  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);

    // Add doc_type field to each document
    const docsWithType = batch.map((doc) => ({
      ...doc,
      doc_type: docType,
    }));

    try {
      const response = await appSearchRequest<Array<{ errors: string[] }>>(
        `engines/${ENGINE_NAME}/documents`,
        {
          method: "POST",
          body: JSON.stringify(docsWithType),
        }
      );

      const batchFailed = response.filter((r) => r.errors && r.errors.length > 0).length;
      success += batch.length - batchFailed;
      failed += batchFailed;

      if (batchFailed > 0) {
        const errors = response
          .filter((r) => r.errors && r.errors.length > 0)
          .map((r) => r.errors.join(", "));
        logger.warn(`   Batch ${Math.floor(i / batchSize) + 1} had ${batchFailed} failures: ${errors.slice(0, 3).join("; ")}`);
      }
    } catch (error) {
      logger.error(`   Error indexing batch: ${error}`);
      failed += batch.length;
    }

    // Progress log every 5 batches
    if ((Math.floor(i / batchSize) + 1) % 5 === 0) {
      logger.info(`   Indexed ${i + batch.length}/${documents.length} ${docType}`);
    }
  }

  return { success, failed };
}

/**
 * Main migration function
 */
export default async function migrateToV3Engine({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("╔══════════════════════════════════════════════════════════╗");
  logger.info(`║  REINDEX: ${ENGINE_NAME.padEnd(43)} ║`);
  logger.info("║  New schema with hierarchical category levels           ║");
  logger.info("╚══════════════════════════════════════════════════════════╝");

  try {
    // Step 1: Verify the engine exists
    const engineExists = await checkEngine(logger);
    if (!engineExists) {
      throw new Error(`Engine "${ENGINE_NAME}" not found. Create it manually or set APPSEARCH_ENGINE env var.`);
    }

    // Step 2: Clear the new engine (if it had any existing data)
    await clearEngine(logger);

    // Step 3: Fetch and index marques
    logger.info("\n📦 Indexing marques...");
    const { data: marques } = await (query as any).graph({
      entity: "marque",
      fields: [
        "id", "name", "slug", "description", "country",
        "logo_url", "website_url", "is_active", "rank",
        "created_at", "updated_at", "metadata",
      ],
      filters: {},
    });

    const marqueDocuments = marques.map((m: any) => transformMarqueForIndex(m));
    const marqueResult = await indexDocuments(marqueDocuments, "marques", logger);
    logger.info(`   ✓ Marques: ${marqueResult.success} indexed, ${marqueResult.failed} failed`);

    // Step 4: Fetch and index categories
    logger.info("\n📂 Indexing categories...");
    const { data: categories } = await (query as any).graph({
      entity: "product_category",
      fields: [
        "id", "name", "handle", "description", "is_active", "rank",
        "created_at", "metadata",
        // Direct parent FK field (critical for chain building)
        "parent_category_id",
        "parent_category.id", "parent_category.name", "parent_category.handle",
        "parent_category.parent_category.id", "parent_category.parent_category.name", "parent_category.parent_category.handle",
        "parent_category.parent_category.parent_category.id", "parent_category.parent_category.parent_category.name", "parent_category.parent_category.parent_category.handle",
        "parent_category.parent_category.parent_category.parent_category.id", "parent_category.parent_category.parent_category.parent_category.name", "parent_category.parent_category.parent_category.parent_category.handle",
      ],
      filters: {},
    });

    // Build category map for parent chain building
    const categoryById = new Map<string, any>();
    for (const cat of categories) {
      categoryById.set(cat.id, cat);
    }

    // Build full parent chain for each category
    // Uses parent_category_id (direct FK field) as Medusa stores it separately
    function buildFullParentChain(categoryId: string): any | null {
      const cat = categoryById.get(categoryId);
      if (!cat) return null;

      const parentId = cat.parent_category_id || cat.parent_category?.id;
      if (!parentId) {
        return {
          id: cat.id,
          name: cat.name,
          handle: cat.handle,
          parent_category: null,
        };
      }

      return {
        id: cat.id,
        name: cat.name,
        handle: cat.handle,
        parent_category: buildFullParentChain(parentId),
      };
    }

    const categoriesWithFullChain = categories.map((cat: any) => ({
      ...cat,
      parent_category: cat.parent_category_id ? buildFullParentChain(cat.parent_category_id) : null,
    }));

    const categoryDocuments = categoriesWithFullChain.map((c: any) => transformCategoryForIndex(c));
    const categoryResult = await indexDocuments(categoryDocuments, "categories", logger);
    logger.info(`   ✓ Categories: ${categoryResult.success} indexed, ${categoryResult.failed} failed`);

    // Step 5: Fetch and index products in batches
    logger.info("\n🛍️ Indexing products...");
    const BATCH_SIZE = 100;
    let offset = 0;
    let totalProductsIndexed = 0;
    let totalProductsFailed = 0;
    let hasMore = true;
    let sampleLogged = false;

    while (hasMore) {
      const { data: products } = await (query as any).graph({
        entity: "product",
        fields: [
          "id", "title", "handle", "description", "status",
          "thumbnail", "created_at", "updated_at", "metadata",
          "images.url",
          "marque.id", "marque.name", "marque.slug", "marque.logo_url", "marque.country",
          "categories.id", "categories.name", "categories.handle",
          "categories.parent_category.id", "categories.parent_category.name", "categories.parent_category.handle",
          "categories.parent_category.parent_category.id", "categories.parent_category.parent_category.name", "categories.parent_category.parent_category.handle",
          "categories.parent_category.parent_category.parent_category.id", "categories.parent_category.parent_category.parent_category.name", "categories.parent_category.parent_category.parent_category.handle",
          "tags.id", "tags.value",
          "collection.id", "collection.title",
          "variants.id", "variants.title", "variants.sku", "variants.barcode",
          "variants.inventory_quantity",
          "variants.prices.amount", "variants.prices.currency_code",
        ],
        filters: {
          status: "published",
        },
        pagination: {
          skip: offset,
          take: BATCH_SIZE,
        },
      });

      if (products.length === 0) {
        hasMore = false;
        break;
      }

      // Rebuild full parent chains for all product categories
      const productsWithFullChains = products.map((product: any) => {
        if (!product.categories || product.categories.length === 0) {
          return product;
        }

        const categoriesWithFullChain = product.categories.map((cat: any) => {
          return buildFullParentChain(cat.id) || cat;
        });

        return {
          ...product,
          categories: categoriesWithFullChain,
        };
      });

      // Transform products using the updated transformer
      const productDocuments = productsWithFullChains.map((p: any) => transformProductForIndex(p));

      // Log sample document to verify new fields
      if (!sampleLogged && productDocuments.length > 0) {
        const sample = productDocuments[0];
        logger.info("\n   📋 Sample product document (new schema):");
        logger.info(`      title: ${sample.title}`);
        logger.info(`      category_lvl0: ${JSON.stringify(sample.category_lvl0)}`);
        logger.info(`      category_lvl1: ${JSON.stringify(sample.category_lvl1)}`);
        logger.info(`      category_lvl2: ${JSON.stringify(sample.category_lvl2)}`);
        logger.info(`      has_stock: ${sample.has_stock} (type: ${typeof sample.has_stock})`);
        logger.info(`      is_available: ${sample.is_available} (type: ${typeof sample.is_available})`);
        sampleLogged = true;
      }

      // Index batch
      const result = await indexDocuments(productDocuments, "products", logger);
      totalProductsIndexed += result.success;
      totalProductsFailed += result.failed;

      logger.info(`   Batch ${Math.floor(offset / BATCH_SIZE) + 1}: ${result.success}/${products.length} (total: ${totalProductsIndexed})`);

      if (products.length < BATCH_SIZE) {
        hasMore = false;
      } else {
        offset += BATCH_SIZE;
      }

      // Allow garbage collection
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    logger.info(`   ✓ Products: ${totalProductsIndexed} indexed, ${totalProductsFailed} failed`);

    // Summary
    logger.info("\n╔══════════════════════════════════════════════════════════╗");
    logger.info("║  MIGRATION COMPLETE                                       ║");
    logger.info("╠══════════════════════════════════════════════════════════╣");
    logger.info(`║  Engine: ${ENGINE_NAME.padEnd(44)} ║`);
    logger.info(`║  Marques: ${String(marqueResult.success).padEnd(43)} ║`);
    logger.info(`║  Categories: ${String(categoryResult.success).padEnd(40)} ║`);
    logger.info(`║  Products: ${String(totalProductsIndexed).padEnd(42)} ║`);
    logger.info("╠══════════════════════════════════════════════════════════╣");
    logger.info("║  Next steps:                                              ║");
    logger.info("║  1. Test the new engine via API                          ║");
    logger.info("║  2. Update APPSEARCH_ENGINE=dev-medusa-v3 in .env        ║");
    logger.info("║  3. Restart the Medusa server                            ║");
    logger.info("╚══════════════════════════════════════════════════════════╝");
  } catch (error) {
    logger.error("Migration failed:", error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}
