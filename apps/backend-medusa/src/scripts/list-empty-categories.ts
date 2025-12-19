/**
 * List Empty Categories Script
 *
 * Lists all category handles that have 0 products for template creation.
 *
 * Run with: npx medusa exec ./src/scripts/list-empty-categories.ts
 */

import type { ExecArgs, Logger } from "@medusajs/framework/types";
import type { IProductModuleService } from "@medusajs/framework/types";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function listEmptyCategories({ container }: ExecArgs) {
  const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productService: IProductModuleService = container.resolve(Modules.PRODUCT);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  // Get all categories with all fields
  const categories = await productService.listProductCategories(
    {},
    {
      take: 500,
      select: ["id", "handle", "name", "parent_category_id"]
    }
  );

  // Get all products with their categories
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "categories.id"],
    pagination: { take: 5000 }
  });

  // Count products per category
  const catCounts: Record<string, number> = {};
  for (const cat of categories) {
    catCounts[cat.id] = 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const product of products as any[]) {
    const cats = product.categories || [];
    for (const cat of cats) {
      if (cat && cat.id && catCounts[cat.id] !== undefined) {
        catCounts[cat.id]++;
      }
    }
  }

  // Get empty leaf categories (no children)
  const parentIds = new Set(categories.map(c => c.parent_category_id).filter(Boolean));

  const emptyLeafCategories = categories
    .filter(cat => {
      const isEmpty = catCounts[cat.id] === 0;
      const isLeaf = !parentIds.has(cat.id); // Not a parent of any category
      return isEmpty && isLeaf;
    })
    .sort((a, b) => (a.handle || "").localeCompare(b.handle || ""));

  logger.info(`\n${"=".repeat(60)}`);
  logger.info("EMPTY LEAF CATEGORIES (need templates)");
  logger.info(`${"=".repeat(60)}`);
  logger.info(`Total: ${emptyLeafCategories.length} empty leaf categories\n`);

  // Output as JSON array for easy copy-paste
  const handles = emptyLeafCategories.map(cat => cat.handle);
  logger.info("Handles for template creation:");
  logger.info(JSON.stringify(handles, null, 2));

  // Also output with names for context
  logger.info("\n\nDetailed list:");
  for (const cat of emptyLeafCategories) {
    logger.info(`  "${cat.handle}": "${cat.name}"`);
  }
}
