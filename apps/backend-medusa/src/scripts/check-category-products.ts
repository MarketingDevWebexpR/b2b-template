/**
 * Check Category Products Script
 *
 * Checks how many products are in each category.
 *
 * Run with: npx medusa exec ./src/scripts/check-category-products.ts
 */

import type { ExecArgs, Logger } from "@medusajs/framework/types";
import type { IProductModuleService } from "@medusajs/framework/types";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function checkCategoryProducts({ container }: ExecArgs) {
  const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productService: IProductModuleService = container.resolve(Modules.PRODUCT);

  logger.info("=".repeat(60));
  logger.info("📊 CATEGORY PRODUCT DISTRIBUTION CHECK");
  logger.info("=".repeat(60));

  // Get all products with their categories
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let products: any[] = [];
  try {
    products = await productService.listProducts(
      {},
      {
        take: 5000,
        relations: ["categories"],
      }
    );
  } catch (e) {
    logger.error(`Failed to fetch products: ${e}`);
  }

  logger.info(`\nTotal products: ${products.length}`);

  // Get all categories
  const categories = await productService.listProductCategories(
    {},
    { take: 500 }
  );

  logger.info(`Total categories: ${categories.length}`);

  // Count products per category
  const categoryProductCount: Record<string, { name: string; count: number; handle: string }> = {};

  for (const category of categories) {
    categoryProductCount[category.id] = {
      name: category.name,
      handle: category.handle,
      count: 0,
    };
  }

  for (const product of products) {
    const cats = (product as { categories?: { id: string }[] }).categories || [];
    for (const cat of cats) {
      if (categoryProductCount[cat.id]) {
        categoryProductCount[cat.id].count++;
      }
    }
  }

  // Find categories without products
  const emptyCategories = Object.entries(categoryProductCount)
    .filter(([_, data]) => data.count === 0)
    .sort((a, b) => (a[1].name || '').localeCompare(b[1].name || ''));

  const nonEmptyCategories = Object.entries(categoryProductCount)
    .filter(([_, data]) => data.count > 0)
    .sort((a, b) => b[1].count - a[1].count);

  logger.info("\n" + "=".repeat(60));
  logger.info("📦 CATEGORIES WITH PRODUCTS");
  logger.info("=".repeat(60));
  logger.info(`Total: ${nonEmptyCategories.length} categories have products\n`);

  // Show top 30 categories by product count
  for (const [_, data] of nonEmptyCategories.slice(0, 30)) {
    const name = data.name || data.handle || 'Unknown';
    logger.info(`  ✅ ${name.padEnd(40)} : ${data.count} products`);
  }

  if (nonEmptyCategories.length > 30) {
    logger.info(`  ... and ${nonEmptyCategories.length - 30} more categories with products`);
  }

  logger.info("\n" + "=".repeat(60));
  logger.info("❌ CATEGORIES WITHOUT PRODUCTS");
  logger.info("=".repeat(60));
  logger.info(`Total: ${emptyCategories.length} categories are empty\n`);

  for (const [_, data] of emptyCategories) {
    const name = data.name || data.handle || 'Unknown';
    logger.info(`  ❌ ${name} (${data.handle})`);
  }

  // Summary
  const coveragePercent = ((nonEmptyCategories.length / categories.length) * 100).toFixed(1);

  logger.info("\n" + "=".repeat(60));
  logger.info("📊 SUMMARY");
  logger.info("=".repeat(60));
  logger.info(`  Total products:    ${products.length}`);
  logger.info(`  Total categories:  ${categories.length}`);
  logger.info(`  With products:     ${nonEmptyCategories.length}`);
  logger.info(`  Empty:             ${emptyCategories.length}`);
  logger.info(`  Coverage:          ${coveragePercent}%`);
  logger.info("=".repeat(60));
}
