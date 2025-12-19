/**
 * Category Search Sync Subscriber
 *
 * Automatically syncs category changes to the search index.
 * Listens to category lifecycle events and updates App Search accordingly.
 */

import type { SubscriberConfig, SubscriberArgs } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { SEARCH_MODULE } from "../modules/search";
import type SearchModuleService from "../modules/search/service";

interface CategoryEventData {
  id: string;
  ids?: string[];
}

/**
 * Handler for category events
 * Syncs category data to search index when categories are created, updated, or deleted
 */
export default async function categorySearchSyncHandler({
  event,
  container,
}: SubscriberArgs<CategoryEventData>) {
  const logger = container.resolve("logger");
  const searchService: SearchModuleService = container.resolve(SEARCH_MODULE);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const eventName = event.name;
  const categoryId = event.data.id;
  const categoryIds = event.data.ids || (categoryId ? [categoryId] : []);

  if (categoryIds.length === 0) {
    logger.warn(`[Search Sync] No category IDs in event: ${eventName}`);
    return;
  }

  logger.info(`[Search Sync] Processing ${eventName} for ${categoryIds.length} category(s)`);

  try {
    if (eventName === "product_category.deleted") {
      // Remove from search index
      for (const id of categoryIds) {
        await searchService.deleteCategory(id);
      }
      logger.info(`[Search Sync] Deleted ${categoryIds.length} category(s) from search index`);
      return;
    }

    // For create/update events, fetch full category data and index
    // Include full parent hierarchy for path building (up to 5 levels deep)
    const { data: categories } = await query.graph({
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
      filters: {
        id: categoryIds,
      },
    });

    if (categories.length === 0) {
      logger.warn(`[Search Sync] No categories found for IDs: ${categoryIds.join(", ")}`);
      return;
    }

    // Index categories
    await searchService.indexCategories(categories);
    logger.info(`[Search Sync] Indexed ${categories.length} category(s) to search`);
  } catch (error) {
    logger.error(`[Search Sync] Error processing ${eventName}:`, error instanceof Error ? error : undefined);
    // Don't throw - we don't want to fail the original operation
  }
}

/**
 * Subscriber configuration
 * Listen to all category lifecycle events
 */
export const config: SubscriberConfig = {
  event: [
    "product_category.created",
    "product_category.updated",
    "product_category.deleted",
  ],
};
