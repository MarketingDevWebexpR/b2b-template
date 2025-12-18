/**
 * Search Index Synchronization Script
 *
 * Rebuilds all Meilisearch indexes with complete data including:
 * - Marques (brands) with all metadata
 * - Products with full category hierarchy and brand info from product-marque link
 * - Categories with full hierarchy (path, ancestor_names, ancestor_handles)
 *
 * Run with: medusa exec ./src/scripts/sync-search-indexes.ts
 *
 * @packageDocumentation
 */

import type { ExecArgs, Logger } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { SEARCH_MODULE } from "../modules/search";
import type SearchModuleService from "../modules/search/service";
import { MARQUES_MODULE } from "../modules/marques";

export default async function syncSearchIndexes({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER);
  const searchService: SearchModuleService = container.resolve(SEARCH_MODULE);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("=== Starting Search Index Synchronization ===");

  try {
    // Initialize search service (creates indexes if needed)
    await searchService.initialize();
    logger.info("Search service initialized");

    // Sync marques first (products reference them via link)
    await syncMarques(query, searchService, logger);

    // Sync categories (products reference them) - returns categoryById map for product sync
    const categoryById = await syncCategories(query, searchService, logger);

    // Sync products with full category hierarchy and brand info
    await syncProducts(query, searchService, logger, categoryById);

    logger.info("=== Search Index Synchronization Complete ===");
  } catch (error) {
    logger.error("Search synchronization failed:", error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Synchronize all marques (brands) to the search index
 */
async function syncMarques(
  query: any,
  searchService: SearchModuleService,
  logger: Logger
): Promise<void> {
  logger.info("Syncing marques (brands)...");

  // Fetch all marques
  const { data: marques } = await (query as any).graph({
    entity: "marque",
    fields: [
      "id",
      "name",
      "slug",
      "description",
      "country",
      "logo_url",
      "website_url",
      "is_active",
      "rank",
      "created_at",
      "updated_at",
      "metadata",
    ],
    filters: {},
  });

  if (marques.length === 0) {
    logger.info("   No marques found to sync");
    return;
  }

  // Clear existing marques index
  await searchService.clearIndex("marques");
  logger.info(`   Cleared marques index`);

  // Index all marques
  await searchService.indexMarques(marques);
  logger.info(`   Indexed ${marques.length} marques`);

  // Log stats
  const activeMarques = marques.filter((m: any) => m.is_active === true);
  logger.info(`   Active marques: ${activeMarques.length}/${marques.length}`);
}

/**
 * Synchronize all categories to the search index
 * Includes product_count for each category (direct + inherited from descendants)
 * Returns categoryById map for use in product sync
 */
async function syncCategories(
  query: any,
  searchService: SearchModuleService,
  logger: Logger
): Promise<Map<string, any>> {
  logger.info("Syncing categories...");

  // Fetch all categories with full parent hierarchy (up to 5 levels deep)
  const { data: categories } = await (query as any).graph({
    entity: "product_category",
    fields: [
      "id",
      "name",
      "handle",
      "description",
      "is_active",
      "rank",
      "created_at",
      "metadata",
      // Full parent hierarchy with name and handle for path building
      "parent_category.id",
      "parent_category.name",
      "parent_category.handle",
      "parent_category.parent_category.id",
      "parent_category.parent_category.name",
      "parent_category.parent_category.handle",
      "parent_category.parent_category.parent_category.id",
      "parent_category.parent_category.parent_category.name",
      "parent_category.parent_category.parent_category.handle",
      "parent_category.parent_category.parent_category.parent_category.id",
      "parent_category.parent_category.parent_category.parent_category.name",
      "parent_category.parent_category.parent_category.parent_category.handle",
    ],
    filters: {},
  });

  if (categories.length === 0) {
    logger.info("   No categories found to sync");
    return new Map();
  }

  // Fetch all published products with their category associations
  logger.info("   Fetching products for category counts...");
  const { data: products } = await (query as any).graph({
    entity: "product",
    fields: [
      "id",
      "categories.id",
    ],
    filters: {
      status: "published",
    },
  });

  // Calculate product counts per category
  // First, count direct products per category
  const directCounts = new Map<string, number>();
  for (const product of products) {
    const productCategories = product.categories || [];
    for (const cat of productCategories) {
      directCounts.set(cat.id, (directCounts.get(cat.id) || 0) + 1);
    }
  }

  // Build parent-child relationships for inherited counts
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

  // Calculate total counts (direct + descendants) using DFS
  const totalCounts = new Map<string, number>();

  function calculateTotalCount(categoryId: string): number {
    if (totalCounts.has(categoryId)) {
      return totalCounts.get(categoryId)!;
    }

    let count = directCounts.get(categoryId) || 0;
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

  // Build full ancestor chain for each category
  // This is necessary because Medusa's graph query may not return deeply nested parent_category
  function buildFullParentChain(categoryId: string): any | null {
    const cat = categoryById.get(categoryId);
    if (!cat) return null;

    const parentId = cat.parent_category?.id;
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

  // Add product_count and full parent chain to each category
  const categoriesWithCounts = categories.map((cat: any) => {
    // Build the full nested parent_category chain
    const fullParentChain = cat.parent_category?.id
      ? buildFullParentChain(cat.parent_category.id)
      : null;

    return {
      ...cat,
      parent_category: fullParentChain,
      product_count: totalCounts.get(cat.id) || 0,
    };
  });

  // Log some stats
  const withProducts = categoriesWithCounts.filter((c: any) => c.product_count > 0);
  logger.info(`   Categories with products: ${withProducts.length}/${categories.length}`);
  logger.info(`   Total products: ${products.length}`);

  // Clear existing category index
  await searchService.clearIndex("categories");
  logger.info(`   Cleared categories index`);

  // Index all categories with counts
  await searchService.indexCategories(categoriesWithCounts);
  logger.info(`   Indexed ${categoriesWithCounts.length} categories`);

  // Log hierarchy stats
  const depths = categories.reduce((acc: Record<number, number>, cat: any) => {
    let depth = 0;
    let current = cat;
    while (current.parent_category) {
      depth++;
      current = current.parent_category;
    }
    acc[depth] = (acc[depth] || 0) + 1;
    return acc;
  }, {});

  logger.info(`   Category depths: ${JSON.stringify(depths)}`);

  // Return categoryById map for use in product sync
  return categoryById;
}

/**
 * Synchronize all products to the search index
 *
 * Includes brand/marque information from the product-marque link.
 * Uses categoryById map to rebuild full parent chains for hierarchical filtering.
 */
async function syncProducts(
  query: any,
  searchService: SearchModuleService,
  logger: Logger,
  categoryById: Map<string, any>
): Promise<void> {
  logger.info("Syncing products...");

  // Fetch all published products with full category hierarchy and marque link
  const { data: products } = await (query as any).graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "description",
      "status",
      "thumbnail",
      "created_at",
      "updated_at",
      "metadata",
      "images.url",
      // Marque (brand) from product-marque link
      "marque.id",
      "marque.name",
      "marque.slug",
      "marque.logo_url",
      "marque.country",
      // Category with full parent hierarchy for path building
      "categories.id",
      "categories.name",
      "categories.handle",
      "categories.parent_category.id",
      "categories.parent_category.name",
      "categories.parent_category.handle",
      "categories.parent_category.parent_category.id",
      "categories.parent_category.parent_category.name",
      "categories.parent_category.parent_category.handle",
      "categories.parent_category.parent_category.parent_category.id",
      "categories.parent_category.parent_category.parent_category.name",
      "categories.parent_category.parent_category.parent_category.handle",
      "tags.id",
      "tags.value",
      "collection.id",
      "collection.title",
      "variants.id",
      "variants.title",
      "variants.sku",
      "variants.barcode",
      "variants.inventory_quantity",
      "variants.prices.amount",
      "variants.prices.currency_code",
    ],
    filters: {
      status: "published",
    },
  });

  if (products.length === 0) {
    logger.info("   No published products found to sync");
    return;
  }

  // Helper function to build full parent chain from categoryById map
  function buildFullParentChain(categoryId: string): any | null {
    const cat = categoryById.get(categoryId);
    if (!cat) return null;

    const parentId = cat.parent_category?.id;
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

  // Rebuild full parent chains for all product categories
  // This ensures all_category_handles includes ALL ancestor handles (L1, L2, L3, etc.)
  const productsWithFullCategoryChains = products.map((product: any) => {
    if (!product.categories || product.categories.length === 0) {
      return product;
    }

    const categoriesWithFullChain = product.categories.map((cat: any) => {
      // Build complete parent chain from categoryById map
      return buildFullParentChain(cat.id) || cat;
    });

    return {
      ...product,
      categories: categoriesWithFullChain,
    };
  });

  // Clear existing products index
  await searchService.clearIndex("products");
  logger.info(`   Cleared products index`);

  // Index all products with full category chains
  await searchService.indexProducts(productsWithFullCategoryChains);
  logger.info(`   Indexed ${products.length} products`);

  // Log category coverage stats
  const productsWithCategories = productsWithFullCategoryChains.filter((p: any) => p.categories && p.categories.length > 0);
  logger.info(`   Products with categories: ${productsWithCategories.length}/${products.length}`);

  // Log brand/marque coverage stats
  const productsWithMarque = productsWithFullCategoryChains.filter((p: any) => p.marque && p.marque.id);
  logger.info(`   Products with marque (brand): ${productsWithMarque.length}/${products.length}`);

  // Log sample category paths for verification (showing full hierarchy)
  if (productsWithCategories.length > 0) {
    const sample = productsWithCategories[0];
    if (sample.categories && sample.categories.length > 0) {
      const sampleCategory = sample.categories[0];
      const path = buildCategoryPath(sampleCategory);
      logger.info(`   Sample category path (full chain): "${path}"`);

      // Also log all handles for verification
      const handles: string[] = [];
      let current = sampleCategory;
      while (current) {
        handles.push(current.handle);
        current = current.parent_category;
      }
      logger.info(`   Sample all_category_handles will be: [${handles.join(", ")}]`);
    }
  }

  // Log sample marque for verification
  if (productsWithMarque.length > 0) {
    const sample = productsWithMarque[0];
    logger.info(`   Sample marque: "${sample.marque.name}" (${sample.marque.slug})`);
  }
}

/**
 * Build category path helper for logging
 */
function buildCategoryPath(category: any): string {
  const names: string[] = [];
  let current = category;

  while (current) {
    names.unshift(current.name);
    current = current.parent_category;
  }

  return names.join(" > ");
}
