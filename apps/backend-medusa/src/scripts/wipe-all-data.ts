/**
 * Wipe All Data Script - Complete Database Reset
 *
 * Completely wipes all seeded data from Medusa:
 * - All products (with variants, options, images)
 * - All product categories
 * - All inventory items and levels
 * - All price lists and prices
 *
 * This script DOES NOT delete:
 * - Sales channels
 * - Regions
 * - Stock locations
 * - Shipping profiles
 * - Users/Auth data
 *
 * Run with: npx medusa exec ./src/scripts/wipe-all-data.ts
 *
 * @packageDocumentation
 */

import type { ExecArgs, Logger } from "@medusajs/framework/types";
import type {
  IProductModuleService,
  IInventoryService,
  IPricingModuleService,
} from "@medusajs/framework/types";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Statistics tracked during the wipe process
 */
interface WipeStats {
  products: number;
  categories: number;
  collections: number;
  inventoryLevels: number;
  inventoryItems: number;
  priceLists: number;
  priceSets: number;
  errors: string[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Formats elapsed time in human-readable format
 */
function formatElapsedTime(startTime: number): string {
  const elapsed = Date.now() - startTime;
  if (elapsed < 1000) {
    return `${elapsed}ms`;
  }
  if (elapsed < 60000) {
    return `${(elapsed / 1000).toFixed(2)}s`;
  }
  const minutes = Math.floor(elapsed / 60000);
  const seconds = ((elapsed % 60000) / 1000).toFixed(0);
  return `${minutes}m ${seconds}s`;
}

/**
 * Creates a visual separator line for logging
 */
function separator(char: string = "=", length: number = 60): string {
  return char.repeat(length);
}

/**
 * Safely executes an async function and returns result or error message
 */
async function safeExecute<T>(
  fn: () => Promise<T>,
  errorPrefix: string
): Promise<{ success: true; result: T } | { success: false; error: string }> {
  try {
    const result = await fn();
    return { success: true, result };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `${errorPrefix}: ${message}` };
  }
}

// ============================================================================
// WIPE FUNCTIONS
// ============================================================================

/**
 * Wipes all products from the database.
 * Products must be deleted first as they reference categories and have linked prices/inventory.
 */
async function wipeProducts(
  container: ExecArgs["container"],
  logger: Logger
): Promise<number> {
  logger.info("[1/6] Wiping products...");

  const productService = container.resolve<IProductModuleService>(Modules.PRODUCT);

  // Fetch all products with pagination to handle large datasets
  const allProducts: { id: string; title: string }[] = [];
  const PAGE_SIZE = 500;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const products = await productService.listProducts(
      {},
      { select: ["id", "title"], take: PAGE_SIZE, skip: offset }
    );
    allProducts.push(...products);
    offset += PAGE_SIZE;
    hasMore = products.length === PAGE_SIZE;
  }

  if (allProducts.length === 0) {
    logger.info("   No products to delete");
    return 0;
  }

  logger.info(`   Found ${allProducts.length} products to delete`);

  // Delete products in batches
  const BATCH_SIZE = 50;
  let deletedCount = 0;

  for (let i = 0; i < allProducts.length; i += BATCH_SIZE) {
    const batch = allProducts.slice(i, i + BATCH_SIZE);
    const productIds = batch.map((p) => p.id);

    await productService.deleteProducts(productIds);
    deletedCount += batch.length;

    const progress = Math.round((deletedCount / allProducts.length) * 100);
    logger.info(`   Progress: ${deletedCount}/${allProducts.length} (${progress}%)`);
  }

  logger.info(`   Successfully deleted ${deletedCount} products`);
  return deletedCount;
}

/**
 * Wipes all product categories from the database.
 * Categories are deleted in reverse depth order (deepest first) to respect hierarchy.
 */
async function wipeCategories(
  container: ExecArgs["container"],
  logger: Logger
): Promise<number> {
  logger.info("[2/6] Wiping product categories...");

  const productService = container.resolve<IProductModuleService>(Modules.PRODUCT);

  // Fetch all categories
  const categories = await productService.listProductCategories(
    {},
    { select: ["id", "name", "parent_category_id"], take: 10000 }
  );

  if (categories.length === 0) {
    logger.info("   No categories to delete");
    return 0;
  }

  logger.info(`   Found ${categories.length} categories to delete`);

  // Build depth map for proper deletion order
  const depthMap = new Map<string, number>();
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  function calculateDepth(categoryId: string, visited: Set<string> = new Set()): number {
    if (visited.has(categoryId)) return 0;
    if (depthMap.has(categoryId)) return depthMap.get(categoryId)!;

    visited.add(categoryId);
    const category = categoryMap.get(categoryId);
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
  const sortedCategories = [...categories].sort((a, b) => {
    const depthA = depthMap.get(a.id) ?? 0;
    const depthB = depthMap.get(b.id) ?? 0;
    return depthB - depthA;
  });

  // Delete categories one by one (deepest first)
  let deletedCount = 0;
  let errorCount = 0;

  for (const category of sortedCategories) {
    try {
      await productService.deleteProductCategories([category.id]);
      deletedCount++;

      if (deletedCount % 20 === 0 || deletedCount === categories.length) {
        const progress = Math.round((deletedCount / categories.length) * 100);
        logger.info(`   Progress: ${deletedCount}/${categories.length} (${progress}%)`);
      }
    } catch (error) {
      errorCount++;
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(`   Warning: Could not delete category "${category.name}": ${message}`);
    }
  }

  logger.info(`   Successfully deleted ${deletedCount} categories (${errorCount} errors)`);
  return deletedCount;
}

/**
 * Wipes all product collections from the database.
 */
async function wipeCollections(
  container: ExecArgs["container"],
  logger: Logger
): Promise<number> {
  logger.info("[3/6] Wiping product collections...");

  const productService = container.resolve<IProductModuleService>(Modules.PRODUCT);

  const collections = await productService.listProductCollections(
    {},
    { select: ["id", "title"], take: 10000 }
  );

  if (collections.length === 0) {
    logger.info("   No collections to delete");
    return 0;
  }

  logger.info(`   Found ${collections.length} collections to delete`);

  const collectionIds = collections.map((c) => c.id);
  await productService.deleteProductCollections(collectionIds);

  logger.info(`   Successfully deleted ${collections.length} collections`);
  return collections.length;
}

/**
 * Wipes all inventory levels from the database.
 * Inventory levels must be deleted before inventory items.
 */
async function wipeInventoryLevels(
  container: ExecArgs["container"],
  logger: Logger
): Promise<number> {
  logger.info("[4/6] Wiping inventory levels...");

  const inventoryService = container.resolve<IInventoryService>(Modules.INVENTORY);

  // Fetch all inventory levels with pagination
  const allLevels: { id: string }[] = [];
  const PAGE_SIZE = 500;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const levels = await inventoryService.listInventoryLevels(
      {},
      { select: ["id"], take: PAGE_SIZE, skip: offset }
    );
    allLevels.push(...levels);
    offset += PAGE_SIZE;
    hasMore = levels.length === PAGE_SIZE;
  }

  if (allLevels.length === 0) {
    logger.info("   No inventory levels to delete");
    return 0;
  }

  logger.info(`   Found ${allLevels.length} inventory levels to delete`);

  // Delete in batches
  const BATCH_SIZE = 100;
  let deletedCount = 0;

  for (let i = 0; i < allLevels.length; i += BATCH_SIZE) {
    const batch = allLevels.slice(i, i + BATCH_SIZE);
    const levelIds = batch.map((l) => l.id);

    await inventoryService.deleteInventoryLevels(levelIds);
    deletedCount += batch.length;

    if (deletedCount % 500 === 0 || deletedCount === allLevels.length) {
      const progress = Math.round((deletedCount / allLevels.length) * 100);
      logger.info(`   Progress: ${deletedCount}/${allLevels.length} (${progress}%)`);
    }
  }

  logger.info(`   Successfully deleted ${deletedCount} inventory levels`);
  return deletedCount;
}

/**
 * Wipes all inventory items from the database.
 * Must be called after inventory levels are deleted.
 */
async function wipeInventoryItems(
  container: ExecArgs["container"],
  logger: Logger
): Promise<number> {
  logger.info("[5/6] Wiping inventory items...");

  const inventoryService = container.resolve<IInventoryService>(Modules.INVENTORY);

  // Fetch all inventory items with pagination
  const allItems: { id: string }[] = [];
  const PAGE_SIZE = 500;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const items = await inventoryService.listInventoryItems(
      {},
      { select: ["id"], take: PAGE_SIZE, skip: offset }
    );
    allItems.push(...items);
    offset += PAGE_SIZE;
    hasMore = items.length === PAGE_SIZE;
  }

  if (allItems.length === 0) {
    logger.info("   No inventory items to delete");
    return 0;
  }

  logger.info(`   Found ${allItems.length} inventory items to delete`);

  // Delete in batches
  const BATCH_SIZE = 100;
  let deletedCount = 0;

  for (let i = 0; i < allItems.length; i += BATCH_SIZE) {
    const batch = allItems.slice(i, i + BATCH_SIZE);
    const itemIds = batch.map((item) => item.id);

    await inventoryService.deleteInventoryItems(itemIds);
    deletedCount += batch.length;

    if (deletedCount % 500 === 0 || deletedCount === allItems.length) {
      const progress = Math.round((deletedCount / allItems.length) * 100);
      logger.info(`   Progress: ${deletedCount}/${allItems.length} (${progress}%)`);
    }
  }

  logger.info(`   Successfully deleted ${deletedCount} inventory items`);
  return deletedCount;
}

/**
 * Wipes all price lists and price sets from the database.
 */
async function wipePricing(
  container: ExecArgs["container"],
  logger: Logger
): Promise<{ priceLists: number; priceSets: number }> {
  logger.info("[6/6] Wiping pricing data...");

  const pricingService = container.resolve<IPricingModuleService>(Modules.PRICING);
  let priceListsDeleted = 0;
  let priceSetsDeleted = 0;

  // Delete price lists first
  logger.info("   [6a] Deleting price lists...");
  const priceLists = await pricingService.listPriceLists(
    {},
    { select: ["id"], take: 10000 }
  );

  if (priceLists.length > 0) {
    const priceListIds = priceLists.map((pl) => pl.id);

    // Delete in batches
    const BATCH_SIZE = 50;
    for (let i = 0; i < priceListIds.length; i += BATCH_SIZE) {
      const batch = priceListIds.slice(i, i + BATCH_SIZE);
      await pricingService.deletePriceLists(batch);
      priceListsDeleted += batch.length;
    }
    logger.info(`   Deleted ${priceListsDeleted} price lists`);
  } else {
    logger.info("   No price lists to delete");
  }

  // Delete price sets
  logger.info("   [6b] Deleting price sets...");
  const allPriceSets: { id: string }[] = [];
  const PAGE_SIZE = 500;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const priceSets = await pricingService.listPriceSets(
      {},
      { select: ["id"], take: PAGE_SIZE, skip: offset }
    );
    allPriceSets.push(...priceSets);
    offset += PAGE_SIZE;
    hasMore = priceSets.length === PAGE_SIZE;
  }

  if (allPriceSets.length > 0) {
    logger.info(`   Found ${allPriceSets.length} price sets to delete`);

    const BATCH_SIZE = 100;
    for (let i = 0; i < allPriceSets.length; i += BATCH_SIZE) {
      const batch = allPriceSets.slice(i, i + BATCH_SIZE);
      const priceSetIds = batch.map((ps) => ps.id);
      await pricingService.deletePriceSets(priceSetIds);
      priceSetsDeleted += batch.length;

      if (priceSetsDeleted % 500 === 0 || priceSetsDeleted === allPriceSets.length) {
        const progress = Math.round((priceSetsDeleted / allPriceSets.length) * 100);
        logger.info(`   Progress: ${priceSetsDeleted}/${allPriceSets.length} (${progress}%)`);
      }
    }
    logger.info(`   Deleted ${priceSetsDeleted} price sets`);
  } else {
    logger.info("   No price sets to delete");
  }

  return { priceLists: priceListsDeleted, priceSets: priceSetsDeleted };
}

// ============================================================================
// SUMMARY
// ============================================================================

/**
 * Prints a summary of the wipe operation
 */
function printSummary(logger: Logger, stats: WipeStats, elapsedTime: string): void {
  logger.info("");
  logger.info(separator());
  logger.info("WIPE ALL DATA - SUMMARY");
  logger.info(separator());
  logger.info("");
  logger.info("Deleted entities:");
  logger.info(`   - Products:         ${stats.products.toLocaleString()}`);
  logger.info(`   - Categories:       ${stats.categories.toLocaleString()}`);
  logger.info(`   - Collections:      ${stats.collections.toLocaleString()}`);
  logger.info(`   - Inventory Levels: ${stats.inventoryLevels.toLocaleString()}`);
  logger.info(`   - Inventory Items:  ${stats.inventoryItems.toLocaleString()}`);
  logger.info(`   - Price Lists:      ${stats.priceLists.toLocaleString()}`);
  logger.info(`   - Price Sets:       ${stats.priceSets.toLocaleString()}`);
  logger.info("");

  const totalDeleted =
    stats.products +
    stats.categories +
    stats.collections +
    stats.inventoryLevels +
    stats.inventoryItems +
    stats.priceLists +
    stats.priceSets;

  logger.info(`Total entities deleted: ${totalDeleted.toLocaleString()}`);
  logger.info("");

  logger.info("Preserved entities:");
  logger.info("   - Sales channels");
  logger.info("   - Regions");
  logger.info("   - Stock locations");
  logger.info("   - Shipping profiles");
  logger.info("   - Users & Authentication");
  logger.info("");

  if (stats.errors.length > 0) {
    logger.warn("Errors encountered:");
    for (const error of stats.errors) {
      logger.warn(`   - ${error}`);
    }
    logger.info("");
  }

  logger.info(`Total time: ${elapsedTime}`);
  logger.info("");
  logger.info(separator());

  if (stats.errors.length === 0) {
    logger.info("Database wipe completed successfully!");
  } else {
    logger.warn(`Database wipe completed with ${stats.errors.length} error(s)`);
  }

  logger.info(separator());
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Main wipe function - completely removes all seeded data from Medusa.
 *
 * Deletion order is critical to respect foreign key constraints:
 * 1. Products (references categories, has linked inventory and prices)
 * 2. Categories (has hierarchy)
 * 3. Collections
 * 4. Inventory Levels (references inventory items)
 * 5. Inventory Items
 * 6. Pricing (price lists, then price sets)
 */
export default async function wipeAllData({ container }: ExecArgs): Promise<void> {
  const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const startTime = Date.now();

  logger.info(separator());
  logger.info("WIPE ALL DATA SCRIPT");
  logger.info("Complete database reset for Medusa");
  logger.info(separator());
  logger.info("");
  logger.info("WARNING: This will permanently delete:");
  logger.info("   - All products (with variants, options, images)");
  logger.info("   - All product categories");
  logger.info("   - All product collections");
  logger.info("   - All inventory items and levels");
  logger.info("   - All price lists and prices");
  logger.info("");
  logger.info("The following will be PRESERVED:");
  logger.info("   - Sales channels");
  logger.info("   - Regions");
  logger.info("   - Stock locations");
  logger.info("   - Shipping profiles");
  logger.info("");
  logger.info(separator("-"));
  logger.info("");

  const stats: WipeStats = {
    products: 0,
    categories: 0,
    collections: 0,
    inventoryLevels: 0,
    inventoryItems: 0,
    priceLists: 0,
    priceSets: 0,
    errors: [],
  };

  // Step 1: Wipe products first (they reference categories and have linked data)
  const productsResult = await safeExecute(
    () => wipeProducts(container, logger),
    "Products"
  );
  if (productsResult.success) {
    stats.products = productsResult.result;
  } else {
    stats.errors.push(productsResult.error);
    logger.error(`   ${productsResult.error}`);
  }
  logger.info("");

  // Step 2: Wipe categories (after products that reference them)
  const categoriesResult = await safeExecute(
    () => wipeCategories(container, logger),
    "Categories"
  );
  if (categoriesResult.success) {
    stats.categories = categoriesResult.result;
  } else {
    stats.errors.push(categoriesResult.error);
    logger.error(`   ${categoriesResult.error}`);
  }
  logger.info("");

  // Step 3: Wipe collections (after products that reference them)
  const collectionsResult = await safeExecute(
    () => wipeCollections(container, logger),
    "Collections"
  );
  if (collectionsResult.success) {
    stats.collections = collectionsResult.result;
  } else {
    stats.errors.push(collectionsResult.error);
    logger.error(`   ${collectionsResult.error}`);
  }
  logger.info("");

  // Step 4: Wipe inventory levels (before inventory items)
  const inventoryLevelsResult = await safeExecute(
    () => wipeInventoryLevels(container, logger),
    "Inventory Levels"
  );
  if (inventoryLevelsResult.success) {
    stats.inventoryLevels = inventoryLevelsResult.result;
  } else {
    stats.errors.push(inventoryLevelsResult.error);
    logger.error(`   ${inventoryLevelsResult.error}`);
  }
  logger.info("");

  // Step 5: Wipe inventory items
  const inventoryItemsResult = await safeExecute(
    () => wipeInventoryItems(container, logger),
    "Inventory Items"
  );
  if (inventoryItemsResult.success) {
    stats.inventoryItems = inventoryItemsResult.result;
  } else {
    stats.errors.push(inventoryItemsResult.error);
    logger.error(`   ${inventoryItemsResult.error}`);
  }
  logger.info("");

  // Step 6: Wipe pricing data
  const pricingResult = await safeExecute(
    () => wipePricing(container, logger),
    "Pricing"
  );
  if (pricingResult.success) {
    stats.priceLists = pricingResult.result.priceLists;
    stats.priceSets = pricingResult.result.priceSets;
  } else {
    stats.errors.push(pricingResult.error);
    logger.error(`   ${pricingResult.error}`);
  }

  // Print summary
  const elapsedTime = formatElapsedTime(startTime);
  printSummary(logger, stats, elapsedTime);

  // Throw if there were critical errors
  if (stats.errors.length > 0) {
    throw new Error(`Wipe completed with ${stats.errors.length} error(s)`);
  }
}
