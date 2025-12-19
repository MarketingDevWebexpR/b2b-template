/**
 * Check Empty Categories Script
 *
 * Lists all category handles that have 0 products.
 * Uses Query to properly fetch product-category links.
 *
 * Run with: npx medusa exec ./src/scripts/check-empty-categories.ts
 */

import type { ExecArgs, Logger } from "@medusajs/framework/types";
import type { IProductModuleService } from "@medusajs/framework/types";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function checkEmptyCategories({ container }: ExecArgs) {
  const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productService: IProductModuleService = container.resolve(Modules.PRODUCT);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("=" .repeat(60));
  logger.info("📊 CATEGORY COVERAGE CHECK");
  logger.info("=" .repeat(60));

  // Get all categories with all fields
  const categories = await productService.listProductCategories(
    {},
    {
      take: 500,
      select: ["id", "handle", "name", "parent_category_id", "is_active", "rank"]
    }
  );
  logger.info(`\nFound ${categories.length} categories`);

  // Get all products with their categories using Query graph
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "categories.id", "categories.handle", "categories.name"],
    pagination: { take: 5000 }
  });
  logger.info(`Found ${products.length} products`);

  // Debug: show first 3 products
  logger.info("\n📦 Sample products with categories:");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const product of (products as any[]).slice(0, 5)) {
    const cats = product.categories || [];
    const catHandles = cats.map((c: { handle: string }) => c.handle).join(", ");
    logger.info(`  - ${product.title}: [${catHandles || "NO CATEGORIES"}]`);
  }

  // Count products per category ID (more reliable than handle)
  const catCounts: Record<string, { handle: string; name: string; count: number }> = {};
  for (const cat of categories) {
    catCounts[cat.id] = { handle: cat.handle, name: cat.name, count: 0 };
  }

  // Count products with and without categories
  let productsWithCategories = 0;
  let productsWithoutCategories = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const product of products as any[]) {
    const cats = product.categories || [];
    if (cats.length > 0) {
      productsWithCategories++;
      for (const cat of cats) {
        if (cat && cat.id && catCounts[cat.id]) {
          catCounts[cat.id].count++;
        }
      }
    } else {
      productsWithoutCategories++;
    }
  }

  // Get empty and non-empty categories
  const emptyCategories = Object.entries(catCounts)
    .filter(([_, data]) => data.count === 0)
    .sort((a, b) => (a[1].handle || "").localeCompare(b[1].handle || ""));

  const nonEmptyCategories = Object.entries(catCounts)
    .filter(([_, data]) => data.count > 0)
    .sort((a, b) => b[1].count - a[1].count);

  logger.info("\n" + "=" .repeat(60));
  logger.info("✅ CATEGORIES WITH PRODUCTS (Top 20)");
  logger.info("=" .repeat(60));
  for (const [_, data] of nonEmptyCategories.slice(0, 20)) {
    logger.info(`  ${(data.handle || "unknown").padEnd(40)} : ${data.count} products`);
  }
  if (nonEmptyCategories.length > 20) {
    logger.info(`  ... and ${nonEmptyCategories.length - 20} more categories with products`);
  }

  logger.info("\n" + "=" .repeat(60));
  logger.info("❌ EMPTY CATEGORIES");
  logger.info("=" .repeat(60));
  for (const [_, data] of emptyCategories.slice(0, 30)) {
    logger.info(`  ${data.handle || "unknown"} (${data.name || "no name"})`);
  }
  if (emptyCategories.length > 30) {
    logger.info(`  ... and ${emptyCategories.length - 30} more empty categories`);
  }

  // Summary
  logger.info("\n" + "=" .repeat(60));
  logger.info("📊 SUMMARY");
  logger.info("=" .repeat(60));
  logger.info(`  Total products:              ${products.length}`);
  logger.info(`  Products with categories:    ${productsWithCategories}`);
  logger.info(`  Products without categories: ${productsWithoutCategories}`);
  logger.info(`  Total categories:            ${categories.length}`);
  logger.info(`  Categories with products:    ${nonEmptyCategories.length}`);
  logger.info(`  Empty categories:            ${emptyCategories.length}`);
  logger.info(`  Category coverage:           ${((nonEmptyCategories.length / categories.length) * 100).toFixed(1)}%`);
  logger.info("=" .repeat(60));
}
