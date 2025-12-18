/**
 * Database Clear Script - B2B Bijouterie
 *
 * Clears all product-related data from the database while preserving
 * infrastructure entities (sales channels, regions, stock locations, shipping profiles).
 *
 * This script deletes:
 * - All products (and their variants, options, images)
 * - All product categories
 * - All product collections
 * - All marques (brands) from the custom marques module
 *
 * This script preserves:
 * - Sales channels
 * - Regions
 * - Stock locations
 * - Shipping profiles
 *
 * Run with: npx medusa exec ./src/scripts/clear-data.ts
 *
 * @packageDocumentation
 */

import type { ExecArgs, Logger } from "@medusajs/framework/types";
import type { IProductModuleService } from "@medusajs/framework/types";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { MARQUES_MODULE } from "../modules/marques";
import type { MarquesModuleService } from "../modules/marques";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Statistics tracked during the clearing process
 */
interface ClearStats {
  products: number;
  categories: number;
  collections: number;
  marques: number;
  errors: string[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Formats elapsed time in human-readable format
 *
 * @param startTime - Start timestamp in milliseconds
 * @returns Formatted time string
 */
function formatElapsedTime(startTime: number): string {
  const elapsed = Date.now() - startTime;
  if (elapsed < 1000) {
    return `${elapsed}ms`;
  }
  return `${(elapsed / 1000).toFixed(2)}s`;
}

/**
 * Creates a visual separator line for logging
 *
 * @param char - Character to use for the separator
 * @param length - Length of the separator
 * @returns Separator string
 */
function separator(char: string = "=", length: number = 60): string {
  return char.repeat(length);
}

// ============================================================================
// CLEAR FUNCTIONS
// ============================================================================

/**
 * Clears all products from the database.
 * This also removes associated variants, options, and images.
 *
 * @param container - Medusa dependency container
 * @param logger - Logger instance
 * @returns Number of products deleted
 */
async function clearProducts(
  container: ExecArgs["container"],
  logger: Logger
): Promise<number> {
  logger.info("[1/4] Clearing products...");

  const productService = container.resolve<IProductModuleService>(Modules.PRODUCT);

  try {
    // Fetch all products
    const products = await productService.listProducts(
      {},
      { select: ["id", "title"] }
    );

    if (products.length === 0) {
      logger.info("   No products to delete");
      return 0;
    }

    logger.info(`   Found ${products.length} products to delete`);

    // Delete products in batches to avoid overwhelming the database
    const batchSize = 50;
    let deletedCount = 0;

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const productIds = batch.map((p) => p.id);

      await productService.deleteProducts(productIds);
      deletedCount += batch.length;

      logger.info(`   Progress: ${deletedCount}/${products.length} products deleted`);
    }

    logger.info(`   Successfully deleted ${deletedCount} products`);
    return deletedCount;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`   Failed to clear products: ${message}`);
    throw error;
  }
}

/**
 * Clears all product categories from the database.
 * Categories are deleted in reverse order (children first) to handle hierarchy.
 *
 * @param container - Medusa dependency container
 * @param logger - Logger instance
 * @returns Number of categories deleted
 */
async function clearCategories(
  container: ExecArgs["container"],
  logger: Logger
): Promise<number> {
  logger.info("[2/4] Clearing product categories...");

  const productService = container.resolve<IProductModuleService>(Modules.PRODUCT);

  try {
    // Fetch all categories with their hierarchy info
    const categories = await productService.listProductCategories(
      {},
      {
        select: ["id", "name", "parent_category_id"],
        relations: ["parent_category"],
      }
    );

    if (categories.length === 0) {
      logger.info("   No categories to delete");
      return 0;
    }

    logger.info(`   Found ${categories.length} categories to delete`);

    // Sort categories by depth (deepest first) to delete children before parents
    // Categories without parent come last
    const sortedCategories = [...categories].sort((a, b) => {
      const aHasParent = a.parent_category_id !== null;
      const bHasParent = b.parent_category_id !== null;

      if (aHasParent && !bHasParent) return -1;
      if (!aHasParent && bHasParent) return 1;
      return 0;
    });

    // Build a depth map by traversing the tree
    const depthMap = new Map<string, number>();

    function calculateDepth(categoryId: string, visited: Set<string> = new Set()): number {
      if (visited.has(categoryId)) return 0; // Prevent infinite loops
      if (depthMap.has(categoryId)) return depthMap.get(categoryId)!;

      visited.add(categoryId);
      const category = categories.find((c) => c.id === categoryId);
      if (!category || !category.parent_category_id) {
        depthMap.set(categoryId, 0);
        return 0;
      }

      const parentDepth = calculateDepth(category.parent_category_id, visited);
      const depth = parentDepth + 1;
      depthMap.set(categoryId, depth);
      return depth;
    }

    // Calculate depth for all categories
    for (const category of categories) {
      calculateDepth(category.id);
    }

    // Sort by depth (deepest first)
    const categoriesByDepth = [...categories].sort((a, b) => {
      const depthA = depthMap.get(a.id) || 0;
      const depthB = depthMap.get(b.id) || 0;
      return depthB - depthA;
    });

    // Delete categories one by one (deepest first)
    let deletedCount = 0;
    for (const category of categoriesByDepth) {
      try {
        await productService.deleteProductCategories([category.id]);
        deletedCount++;

        if (deletedCount % 10 === 0 || deletedCount === categories.length) {
          logger.info(`   Progress: ${deletedCount}/${categories.length} categories deleted`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.warn(`   Warning: Could not delete category "${category.name}": ${message}`);
      }
    }

    logger.info(`   Successfully deleted ${deletedCount} categories`);
    return deletedCount;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`   Failed to clear categories: ${message}`);
    throw error;
  }
}

/**
 * Clears all product collections from the database.
 *
 * @param container - Medusa dependency container
 * @param logger - Logger instance
 * @returns Number of collections deleted
 */
async function clearCollections(
  container: ExecArgs["container"],
  logger: Logger
): Promise<number> {
  logger.info("[3/4] Clearing product collections...");

  const productService = container.resolve<IProductModuleService>(Modules.PRODUCT);

  try {
    // Fetch all collections
    const collections = await productService.listProductCollections(
      {},
      { select: ["id", "title"] }
    );

    if (collections.length === 0) {
      logger.info("   No collections to delete");
      return 0;
    }

    logger.info(`   Found ${collections.length} collections to delete`);

    // Delete all collections
    const collectionIds = collections.map((c) => c.id);
    await productService.deleteProductCollections(collectionIds);

    logger.info(`   Successfully deleted ${collections.length} collections`);
    return collections.length;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`   Failed to clear collections: ${message}`);
    throw error;
  }
}

/**
 * Clears all marques (brands) from the custom marques module.
 *
 * @param container - Medusa dependency container
 * @param logger - Logger instance
 * @returns Number of marques deleted
 */
async function clearMarques(
  container: ExecArgs["container"],
  logger: Logger
): Promise<number> {
  logger.info("[4/4] Clearing marques (brands)...");

  let marquesService: MarquesModuleService;

  try {
    marquesService = container.resolve<MarquesModuleService>(MARQUES_MODULE);
  } catch (error) {
    logger.warn("   Marques module not found or not registered");
    logger.warn("   Skipping marques clearing...");
    return 0;
  }

  try {
    // Fetch all marques
    const marques = await marquesService.listMarques({});

    if (marques.length === 0) {
      logger.info("   No marques to delete");
      return 0;
    }

    logger.info(`   Found ${marques.length} marques to delete`);

    // Delete all marques
    const marqueIds = marques.map((m) => m.id);
    await marquesService.deleteMarques(marqueIds);

    logger.info(`   Successfully deleted ${marques.length} marques`);
    return marques.length;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`   Failed to clear marques: ${message}`);
    throw error;
  }
}

// ============================================================================
// SUMMARY PRINTING
// ============================================================================

/**
 * Prints a summary of the clearing operation
 *
 * @param logger - Logger instance
 * @param stats - Statistics from the clearing operation
 * @param elapsedTime - Total time elapsed
 */
function printSummary(
  logger: Logger,
  stats: ClearStats,
  elapsedTime: string
): void {
  logger.info("");
  logger.info(separator());
  logger.info("Clear Data Summary");
  logger.info(separator());
  logger.info("");
  logger.info("Deleted entities:");
  logger.info(`   - Products: ${stats.products}`);
  logger.info(`   - Categories: ${stats.categories}`);
  logger.info(`   - Collections: ${stats.collections}`);
  logger.info(`   - Marques: ${stats.marques}`);
  logger.info("");
  logger.info("Preserved entities:");
  logger.info("   - Sales channels");
  logger.info("   - Regions");
  logger.info("   - Stock locations");
  logger.info("   - Shipping profiles");
  logger.info("");

  if (stats.errors.length > 0) {
    logger.info("Errors encountered:");
    for (const error of stats.errors) {
      logger.info(`   - ${error}`);
    }
    logger.info("");
  }

  logger.info(`Total time: ${elapsedTime}`);
  logger.info("");
  logger.info(separator());
  logger.info("Database clear completed!");
  logger.info(separator());
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Main clear function
 *
 * Clears all product-related data from the database while preserving
 * infrastructure entities.
 *
 * @param args - Medusa exec arguments containing the container
 */
export default async function clearData({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER);
  const startTime = Date.now();

  logger.info(separator());
  logger.info("Clear Data Script - B2B Bijouterie");
  logger.info(separator());
  logger.info("");
  logger.info("This script will delete:");
  logger.info("   - All products (and their variants, options, images)");
  logger.info("   - All product categories");
  logger.info("   - All product collections");
  logger.info("   - All marques (brands)");
  logger.info("");
  logger.info("The following will be preserved:");
  logger.info("   - Sales channels");
  logger.info("   - Regions");
  logger.info("   - Stock locations");
  logger.info("   - Shipping profiles");
  logger.info("");
  logger.info(separator("-"));
  logger.info("");

  const stats: ClearStats = {
    products: 0,
    categories: 0,
    collections: 0,
    marques: 0,
    errors: [],
  };

  try {
    // Step 1: Clear products first (they reference categories and collections)
    try {
      stats.products = await clearProducts(container, logger);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      stats.errors.push(`Products: ${message}`);
    }

    logger.info("");

    // Step 2: Clear categories (after products that reference them)
    try {
      stats.categories = await clearCategories(container, logger);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      stats.errors.push(`Categories: ${message}`);
    }

    logger.info("");

    // Step 3: Clear collections (after products that reference them)
    try {
      stats.collections = await clearCollections(container, logger);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      stats.errors.push(`Collections: ${message}`);
    }

    logger.info("");

    // Step 4: Clear marques
    try {
      stats.marques = await clearMarques(container, logger);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      stats.errors.push(`Marques: ${message}`);
    }

    // Print summary
    const elapsedTime = formatElapsedTime(startTime);
    printSummary(logger, stats, elapsedTime);

    // Throw error if any clearing failed
    if (stats.errors.length > 0) {
      throw new Error(`Clear data completed with ${stats.errors.length} error(s)`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("");
    logger.error(separator());
    logger.error(`Clear data failed: ${message}`);
    logger.error(separator());
    throw error;
  }
}
