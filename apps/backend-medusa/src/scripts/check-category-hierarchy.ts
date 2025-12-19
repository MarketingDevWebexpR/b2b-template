/**
 * Category Hierarchy Diagnostic Script
 *
 * Checks if categories have parent_category relationships set in Medusa
 *
 * Run with: medusa exec ./src/scripts/check-category-hierarchy.ts
 */

import type { ExecArgs, Logger } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function checkCategoryHierarchy({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("=== Checking Category Hierarchy ===");

  try {
    // Fetch all categories with parent info
    const { data: categories } = await (query as any).graph({
      entity: "product_category",
      fields: [
        "id",
        "name",
        "handle",
        "parent_category_id",
        "parent_category.id",
        "parent_category.name",
        "parent_category.handle",
      ],
      filters: {},
    });

    logger.info(`Total categories: ${categories.length}`);

    // Count categories with parents
    const withParent = categories.filter((c: any) => c.parent_category_id !== null);
    const withoutParent = categories.filter((c: any) => c.parent_category_id === null);

    logger.info(`Categories with parent: ${withParent.length}`);
    logger.info(`Categories without parent (roots): ${withoutParent.length}`);

    // Show sample of categories with parents
    logger.info("\n--- Sample categories WITH parent ---");
    withParent.slice(0, 5).forEach((cat: any) => {
      logger.info(`  ${cat.name} (${cat.handle})`);
      logger.info(`    -> parent_category_id: ${cat.parent_category_id}`);
      logger.info(`    -> parent: ${cat.parent_category?.name || 'N/A'}`);
    });

    // Show sample of root categories
    logger.info("\n--- Sample ROOT categories (no parent) ---");
    withoutParent.slice(0, 10).forEach((cat: any) => {
      logger.info(`  ${cat.name} (${cat.handle})`);
    });

    // Check for categories like "Charnières Invisibles"
    const charnieres = categories.filter((c: any) =>
      c.name.toLowerCase().includes('charn') ||
      c.name.toLowerCase().includes('invisi')
    );

    logger.info("\n--- Charnières-related categories ---");
    charnieres.forEach((cat: any) => {
      logger.info(`  ${cat.name} (${cat.handle})`);
      logger.info(`    -> parent_category_id: ${cat.parent_category_id || 'NULL'}`);
      logger.info(`    -> parent: ${cat.parent_category?.name || 'NONE'}`);
    });

    logger.info("\n=== Hierarchy Check Complete ===");
  } catch (error) {
    logger.error("Error checking hierarchy:", error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}
