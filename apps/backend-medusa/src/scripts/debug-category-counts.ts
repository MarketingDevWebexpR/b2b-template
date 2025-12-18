/**
 * Debug Category Counts Script
 *
 * Analyzes and displays category product counts to identify counting issues.
 * Shows both direct product associations and calculated inherited counts.
 *
 * Run with: medusa exec ./src/scripts/debug-category-counts.ts
 *
 * @packageDocumentation
 */

import type { ExecArgs, Logger } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function debugCategoryCounts({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("=== Category Product Count Debug ===");

  try {
    // Fetch all categories with parent relationships
    const { data: categories } = await (query as any).graph({
      entity: "product_category",
      fields: [
        "id",
        "name",
        "handle",
        "parent_category.id",
        "parent_category.name",
      ],
      filters: {},
    });

    logger.info(`Found ${categories.length} categories`);

    // Fetch all published products with their category associations
    const { data: products } = await (query as any).graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "categories.id",
      ],
      filters: {
        status: "published",
      },
    });

    logger.info(`Found ${products.length} published products`);

    // Calculate direct product counts per category
    const directCounts = new Map<string, { count: number; products: string[] }>();
    for (const product of products) {
      const productCategories = product.categories || [];
      for (const cat of productCategories) {
        const existing = directCounts.get(cat.id) || { count: 0, products: [] };
        existing.count++;
        existing.products.push(product.title);
        directCounts.set(cat.id, existing);
      }
    }

    // Build parent-child relationships
    const childrenMap = new Map<string, string[]>();
    const categoryById = new Map<string, any>();

    for (const cat of categories) {
      categoryById.set(cat.id, cat);
      const parentId = cat.parent_category?.id;
      if (parentId) {
        const children = childrenMap.get(parentId) || [];
        children.push(cat.id);
        childrenMap.set(parentId, children);
      }
    }

    // Calculate total counts (direct + descendants)
    const totalCounts = new Map<string, number>();

    function calculateTotalCount(categoryId: string): number {
      if (totalCounts.has(categoryId)) {
        return totalCounts.get(categoryId)!;
      }

      let count = directCounts.get(categoryId)?.count || 0;
      const children = childrenMap.get(categoryId) || [];

      for (const childId of children) {
        count += calculateTotalCount(childId);
      }

      totalCounts.set(categoryId, count);
      return count;
    }

    // Calculate for all categories
    for (const cat of categories) {
      calculateTotalCount(cat.id);
    }

    // Build category hierarchy for display
    const buildPath = (catId: string): string => {
      const cat = categoryById.get(catId);
      if (!cat) return "";
      if (!cat.parent_category?.id) return cat.name;
      return `${buildPath(cat.parent_category.id)} > ${cat.name}`;
    };

    // Group categories by depth
    const categoriesByDepth = new Map<number, any[]>();
    for (const cat of categories) {
      let depth = 0;
      let current = cat;
      while (current.parent_category?.id) {
        depth++;
        current = categoryById.get(current.parent_category.id);
      }
      const cats = categoriesByDepth.get(depth) || [];
      cats.push({ ...cat, depth });
      categoriesByDepth.set(depth, cats);
    }

    // Display results organized by depth
    logger.info("\n=== Categories by Depth ===\n");

    for (let depth = 0; depth <= 4; depth++) {
      const cats = categoriesByDepth.get(depth) || [];
      if (cats.length === 0) continue;

      logger.info(`\n--- Level ${depth} (${cats.length} categories) ---\n`);

      for (const cat of cats) {
        const path = buildPath(cat.id);
        const directCount = directCounts.get(cat.id)?.count || 0;
        const totalCount = totalCounts.get(cat.id) || 0;
        const children = childrenMap.get(cat.id) || [];
        const hasChildren = children.length > 0;

        const indicator = hasChildren ? "📁" : "📄";
        const countIndicator = directCount === 0 && totalCount > 0 ? "⚠️ " : "";

        logger.info(`${indicator} ${path}`);
        logger.info(`   Direct: ${directCount} | Total (inherited): ${totalCount} ${countIndicator}`);

        if (hasChildren) {
          logger.info(`   Children: ${children.length}`);
          const childNames = children.map(cid => categoryById.get(cid)?.name).join(", ");
          logger.info(`   └─ ${childNames}`);
        }

        // Show sample products for categories with direct associations
        if (directCount > 0 && directCount <= 5) {
          const sampleProducts = directCounts.get(cat.id)?.products.slice(0, 3);
          logger.info(`   Sample products: ${sampleProducts?.join(", ")}`);
        }

        logger.info("");
      }
    }

    // Identify problematic categories (L2 with L3 children but showing 0)
    logger.info("\n=== Problematic Categories (L2 with children but 0 direct products) ===\n");

    const level2Categories = categoriesByDepth.get(1) || [];
    for (const cat of level2Categories) {
      const directCount = directCounts.get(cat.id)?.count || 0;
      const totalCount = totalCounts.get(cat.id) || 0;
      const children = childrenMap.get(cat.id) || [];

      if (directCount === 0 && totalCount > 0 && children.length > 0) {
        const path = buildPath(cat.id);
        logger.info(`⚠️  ${cat.name}`);
        logger.info(`   Path: ${path}`);
        logger.info(`   Direct products: ${directCount}`);
        logger.info(`   Total products (should show): ${totalCount}`);
        logger.info(`   Children (${children.length}):`);

        for (const childId of children) {
          const child = categoryById.get(childId);
          const childDirect = directCounts.get(childId)?.count || 0;
          const childTotal = totalCounts.get(childId) || 0;
          logger.info(`     - ${child.name}: ${childDirect} direct, ${childTotal} total`);
        }
        logger.info("");
      }
    }

    // Summary
    logger.info("\n=== Summary ===");
    logger.info(`Total categories: ${categories.length}`);
    logger.info(`Total published products: ${products.length}`);
    logger.info(`Categories with direct products: ${directCounts.size}`);
    logger.info(`Categories with inherited counts: ${Array.from(totalCounts.values()).filter(c => c > 0).length}`);

    const problemCategories = level2Categories.filter(cat => {
      const directCount = directCounts.get(cat.id)?.count || 0;
      const totalCount = totalCounts.get(cat.id) || 0;
      const children = childrenMap.get(cat.id) || [];
      return directCount === 0 && totalCount > 0 && children.length > 0;
    });

    logger.info(`Problematic L2 categories: ${problemCategories.length}`);

    if (problemCategories.length > 0) {
      logger.warn("\n⚠️  These categories should display inherited counts but may show 0 in the UI.");
      logger.warn("Run: npx medusa exec ./src/scripts/sync-search-indexes.ts");
    }

  } catch (error) {
    logger.error("Debug failed:", error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}
