/**
 * Search Index Synchronization Script
 *
 * Rebuilds all App Search indexes with complete data including:
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
      // Direct parent FK field (critical for chain building)
      "parent_category_id",
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
  // Uses parent_category_id directly since Medusa's graph query returns it as a direct field
  function buildFullParentChain(categoryId: string): any | null {
    const cat = categoryById.get(categoryId);
    if (!cat) return null;

    // Use parent_category_id directly (not parent_category?.id)
    const parentId = cat.parent_category_id;
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
    // Build the full nested parent_category chain using parent_category_id
    const fullParentChain = cat.parent_category_id
      ? buildFullParentChain(cat.parent_category_id)
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

  // Log hierarchy stats using categoryById map for proper parent traversal
  const depths = categories.reduce((acc: Record<number, number>, cat: any) => {
    let depth = 0;
    let currentId = cat.parent_category_id;
    while (currentId) {
      depth++;
      const parent = categoryById.get(currentId);
      currentId = parent?.parent_category_id || null;
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
 * Processes products in batches to avoid memory issues.
 */
async function syncProducts(
  query: any,
  searchService: SearchModuleService,
  logger: Logger,
  categoryById: Map<string, any>
): Promise<void> {
  logger.info("Syncing products...");

  const BATCH_SIZE = 100; // Process 100 products at a time
  let offset = 0;
  let totalIndexed = 0;
  let totalWithCategories = 0;
  let totalWithMarque = 0;
  let hasMore = true;
  let sampleLogged = false;

  // Helper function to build full parent chain from categoryById map
  // Uses parent_category_id (direct field) as Medusa stores FK separately from joined object
  function buildFullParentChain(categoryId: string): any | null {
    const cat = categoryById.get(categoryId);
    if (!cat) return null;

    // Use parent_category_id directly (same as syncCategories)
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

  // Clear existing products index before starting batch processing
  await searchService.clearIndex("products");
  logger.info(`   Cleared products index`);

  while (hasMore) {
    // Fetch products in batches
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
    const productsWithFullCategoryChains = products.map((product: any) => {
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

    // Index this batch
    await searchService.indexProducts(productsWithFullCategoryChains);
    totalIndexed += products.length;

    // Count stats
    const batchWithCategories = productsWithFullCategoryChains.filter((p: any) => p.categories && p.categories.length > 0);
    totalWithCategories += batchWithCategories.length;

    const batchWithMarque = productsWithFullCategoryChains.filter((p: any) => p.marque && p.marque.id);
    totalWithMarque += batchWithMarque.length;

    // Log sample on first batch
    if (!sampleLogged && batchWithCategories.length > 0) {
      const sample = batchWithCategories[0];
      if (sample.categories && sample.categories.length > 0) {
        const sampleCategory = sample.categories[0];
        const path = buildCategoryPath(sampleCategory);
        logger.info(`   Sample category path (full chain): "${path}"`);

        const handles: string[] = [];
        let current = sampleCategory;
        while (current) {
          handles.push(current.handle);
          current = current.parent_category;
        }
        logger.info(`   Sample all_category_handles will be: [${handles.join(", ")}]`);
      }

      if (batchWithMarque.length > 0) {
        const sampleMarque = batchWithMarque[0];
        logger.info(`   Sample marque: "${sampleMarque.marque.name}" (${sampleMarque.marque.slug})`);
      }
      sampleLogged = true;
    }

    // Progress logging
    logger.info(`   Indexed batch ${Math.floor(offset / BATCH_SIZE) + 1}: ${products.length} products (total: ${totalIndexed})`);

    // Check if there are more products
    if (products.length < BATCH_SIZE) {
      hasMore = false;
    } else {
      offset += BATCH_SIZE;
    }

    // Allow garbage collection between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  logger.info(`   Indexing complete: ${totalIndexed} products`);
  logger.info(`   Products with categories: ${totalWithCategories}/${totalIndexed}`);
  logger.info(`   Products with marque (brand): ${totalWithMarque}/${totalIndexed}`);
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
