/**
 * Product Search Sync Subscriber
 *
 * Automatically syncs product changes to the search index.
 * Listens to product lifecycle events and updates App Search accordingly.
 */

import type { SubscriberConfig, SubscriberArgs } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { SEARCH_MODULE } from "../modules/search";
import type SearchModuleService from "../modules/search/service";

interface ProductEventData {
  id: string;
  ids?: string[];
}

/**
 * Handler for product events
 * Syncs product data to search index when products are created, updated, or deleted
 */
export default async function productSearchSyncHandler({
  event,
  container,
}: SubscriberArgs<ProductEventData>) {
  const logger = container.resolve("logger");
  const searchService: SearchModuleService = container.resolve(SEARCH_MODULE);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const eventName = event.name;
  const productId = event.data.id;
  const productIds = event.data.ids || (productId ? [productId] : []);

  if (productIds.length === 0) {
    logger.warn(`[Search Sync] No product IDs in event: ${eventName}`);
    return;
  }

  logger.info(`[Search Sync] Processing ${eventName} for ${productIds.length} product(s)`);

  try {
    if (eventName === "product.deleted") {
      // Remove from search index
      await searchService.deleteProducts(productIds);
      logger.info(`[Search Sync] Deleted ${productIds.length} product(s) from search index`);
      return;
    }

    // For create/update events, fetch full product data and index
    // Include full category hierarchy for building category paths
    const { data: products } = await query.graph({
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
        // Categories with full 5-level parent hierarchy (depth 0-4)
        "categories.id",
        "categories.name",
        "categories.handle",
        // Level 1 parent
        "categories.parent_category.id",
        "categories.parent_category.name",
        "categories.parent_category.handle",
        // Level 2 parent
        "categories.parent_category.parent_category.id",
        "categories.parent_category.parent_category.name",
        "categories.parent_category.parent_category.handle",
        // Level 3 parent
        "categories.parent_category.parent_category.parent_category.id",
        "categories.parent_category.parent_category.parent_category.name",
        "categories.parent_category.parent_category.parent_category.handle",
        // Level 4 parent (for depth-4 categories)
        "categories.parent_category.parent_category.parent_category.parent_category.id",
        "categories.parent_category.parent_category.parent_category.parent_category.name",
        "categories.parent_category.parent_category.parent_category.parent_category.handle",
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
        id: productIds,
      },
    });

    if (products.length === 0) {
      logger.warn(`[Search Sync] No products found for IDs: ${productIds.join(", ")}`);
      return;
    }

    // Index products
    await searchService.indexProducts(products);
    logger.info(`[Search Sync] Indexed ${products.length} product(s) to search`);
  } catch (error) {
    logger.error(`[Search Sync] Error processing ${eventName}:`, error instanceof Error ? error : undefined);
    // Don't throw - we don't want to fail the original operation
  }
}

/**
 * Subscriber configuration
 * Listen to all product lifecycle events
 */
export const config: SubscriberConfig = {
  event: [
    "product.created",
    "product.updated",
    "product.deleted",
  ],
};
