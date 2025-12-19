/**
 * Clear Products Only Script
 *
 * Clears all products from the database while preserving:
 * - Categories
 * - Collections
 * - Marques (brands)
 * - Sales channels
 * - Stock locations
 * - Shipping profiles
 *
 * Run with: npx medusa exec ./src/scripts/clear-products-only.ts
 *
 * @packageDocumentation
 */

import type { ExecArgs, Logger } from "@medusajs/framework/types";
import type { IProductModuleService, IInventoryService } from "@medusajs/framework/types";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatElapsedTime(startTime: number): string {
  const elapsed = Date.now() - startTime;
  if (elapsed < 1000) {
    return `${elapsed}ms`;
  }
  return `${(elapsed / 1000).toFixed(2)}s`;
}

function separator(char: string = "=", length: number = 60): string {
  return char.repeat(length);
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

export default async function clearProductsOnly({ container }: ExecArgs) {
  const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const startTime = Date.now();

  logger.info(separator());
  logger.info("🗑️  CLEAR PRODUCTS ONLY SCRIPT");
  logger.info("   Preserves categories, collections, and marques");
  logger.info(separator());

  const productService: IProductModuleService = container.resolve(Modules.PRODUCT);

  let deletedCount = 0;
  let errorCount = 0;

  try {
    // Get all products
    logger.info("\n[1/3] Getting all products...");
    const products = await productService.listProducts({}, { take: 10000 });
    logger.info(`   Found ${products.length} products to delete`);

    if (products.length === 0) {
      logger.info("\n✅ No products to delete");
      return;
    }

    // Delete products in batches
    logger.info("\n[2/3] Deleting products in batches...");
    const BATCH_SIZE = 50;
    const productIds = products.map((p) => p.id);

    for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
      const batch = productIds.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(productIds.length / BATCH_SIZE);

      try {
        await productService.deleteProducts(batch);
        deletedCount += batch.length;
        logger.info(`   Batch ${batchNum}/${totalBatches}: Deleted ${batch.length} products`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`   Batch ${batchNum} failed: ${message}`);
        errorCount += batch.length;
      }

      // Small delay between batches
      if (i + BATCH_SIZE < productIds.length) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    // Verify deletion
    logger.info("\n[3/3] Verifying deletion...");
    const remaining = await productService.listProducts({}, { take: 1 });

    if (remaining.length === 0) {
      logger.info("   ✅ All products successfully deleted");
    } else {
      logger.warn(`   ⚠️ ${remaining.length} products still remain`);
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`\n❌ Error during deletion: ${message}`);
  }

  // Summary
  logger.info("\n" + separator());
  logger.info("📊 SUMMARY");
  logger.info(separator("-"));
  logger.info(`   Products deleted: ${deletedCount}`);
  logger.info(`   Errors: ${errorCount}`);
  logger.info(`   Time elapsed: ${formatElapsedTime(startTime)}`);
  logger.info(separator());

  if (errorCount === 0) {
    logger.info("\n✅ Products cleared successfully!");
    logger.info("   Run seed-b2b-products.ts to recreate products\n");
  } else {
    logger.warn("\n⚠️ Some errors occurred during deletion");
  }
}
