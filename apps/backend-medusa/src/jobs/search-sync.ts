/**
 * Search Sync Scheduled Job
 *
 * Periodically synchronizes data to search engines (Meilisearch/App Search).
 * Runs every 5 minutes by default (configurable via SEARCH_SYNC_INTERVAL_MINUTES).
 *
 * Features:
 * - Incremental sync: Only syncs documents changed since last sync
 * - Full sync: Can be triggered manually or on first run
 * - Locking: Prevents concurrent sync operations
 * - Reporting: Creates sync reports for admin monitoring
 *
 * @scheduled
 */

import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { SEARCH_MODULE } from "../modules/search";
import type SearchModuleService from "../modules/search/service";
import type { ProductDocument, CategoryDocument, MarqueDocument } from "../modules/search/service";

// Sync interval in minutes (default: 5 minutes)
const SYNC_INTERVAL_MINUTES = parseInt(process.env.SEARCH_SYNC_INTERVAL_MINUTES || "5", 10);

// Batch size for indexing (App Search limit is 100 per request)
const BATCH_SIZE = parseInt(process.env.SEARCH_SYNC_BATCH_SIZE || "100", 10);

// Maximum sync duration before timeout (30 minutes)
const MAX_SYNC_DURATION_MS = 30 * 60 * 1000;

/**
 * Sync state management
 * In production, this should be persisted to database
 */
interface SyncState {
  isRunning: boolean;
  startedAt: Date | null;
  lastCompletedAt: Date | null;
  lastSyncTimestamps: {
    products: Date | null;
    categories: Date | null;
    marques: Date | null;
  };
}

// In-memory sync state (should be in database for production)
const syncState: SyncState = {
  isRunning: false,
  startedAt: null,
  lastCompletedAt: null,
  lastSyncTimestamps: {
    products: null,
    categories: null,
    marques: null,
  },
};

/**
 * Acquire sync lock
 * Returns true if lock was acquired, false if another sync is running
 */
function acquireLock(): boolean {
  if (syncState.isRunning) {
    // Check if the running sync has timed out
    if (syncState.startedAt) {
      const elapsed = Date.now() - syncState.startedAt.getTime();
      if (elapsed > MAX_SYNC_DURATION_MS) {
        // Force release the lock if sync has been running too long
        syncState.isRunning = false;
      }
    }
  }

  if (syncState.isRunning) {
    return false;
  }

  syncState.isRunning = true;
  syncState.startedAt = new Date();
  return true;
}

/**
 * Release sync lock
 */
function releaseLock(success: boolean): void {
  syncState.isRunning = false;
  if (success) {
    syncState.lastCompletedAt = new Date();
  }
}

/**
 * Build category path from parent hierarchy
 */
function buildCategoryPath(category: Record<string, unknown>): string {
  const parts: string[] = [];
  let current: Record<string, unknown> | null = category;

  while (current) {
    if (typeof current.name === "string") {
      parts.unshift(current.name);
    }
    current = current.parent_category as Record<string, unknown> | null;
  }

  return parts.join(" > ");
}

/**
 * Collect all ancestor category IDs and handles
 */
function collectAncestorData(category: Record<string, unknown>): {
  ids: string[];
  handles: string[];
  names: string[];
} {
  const ids: string[] = [];
  const handles: string[] = [];
  const names: string[] = [];
  let current = category.parent_category as Record<string, unknown> | null;

  while (current) {
    if (typeof current.id === "string") ids.push(current.id);
    if (typeof current.handle === "string") handles.push(current.handle);
    if (typeof current.name === "string") names.push(current.name);
    current = current.parent_category as Record<string, unknown> | null;
  }

  return { ids, handles, names };
}

/**
 * Transform raw product data to ProductDocument
 */
function transformProductData(product: Record<string, unknown>): ProductDocument {
  const variants = (product.variants as Array<Record<string, unknown>>) || [];
  const categories = (product.categories as Array<Record<string, unknown>>) || [];
  const tags = (product.tags as Array<Record<string, unknown>>) || [];
  const images = (product.images as Array<Record<string, unknown>>) || [];
  const collection = product.collection as Record<string, unknown> | null;

  // Calculate prices from variants
  let priceMin: number | null = null;
  let priceMax: number | null = null;
  let hasStock = false;

  for (const variant of variants) {
    const prices = (variant.prices as Array<Record<string, unknown>>) || [];
    for (const price of prices) {
      const amount = price.amount as number;
      if (typeof amount === "number") {
        if (priceMin === null || amount < priceMin) priceMin = amount;
        if (priceMax === null || amount > priceMax) priceMax = amount;
      }
    }
    if ((variant.inventory_quantity as number) > 0) {
      hasStock = true;
    }
  }

  // Build category paths and collect IDs
  const categoryPaths: string[] = [];
  const categoryIds: string[] = [];
  const categoryNames: string[] = [];
  const allCategoryHandles: string[] = [];

  for (const cat of categories) {
    categoryPaths.push(buildCategoryPath(cat));
    if (typeof cat.id === "string") categoryIds.push(cat.id);
    if (typeof cat.name === "string") categoryNames.push(cat.name);
    if (typeof cat.handle === "string") allCategoryHandles.push(cat.handle);

    // Add ancestor data
    const ancestors = collectAncestorData(cat);
    categoryIds.push(...ancestors.ids);
    categoryNames.push(...ancestors.names);
    allCategoryHandles.push(...ancestors.handles);
  }

  return {
    id: product.id as string,
    title: product.title as string,
    handle: product.handle as string,
    description: (product.description as string) || null,
    sku: variants[0]?.sku as string | null || null,
    barcode: variants[0]?.barcode as string | null || null,
    thumbnail: (product.thumbnail as string) || null,
    images: images.map((img) => img.url as string).filter(Boolean),
    collection_id: collection?.id as string | null,
    collection: collection?.title as string | null,
    brand_id: null, // Will be populated from product-marque link if exists
    brand_name: null,
    brand_slug: null,
    brand: null,
    material: (product.metadata as Record<string, unknown>)?.material as string | null || null,
    categories: categories.map((cat) => ({
      id: cat.id as string,
      name: cat.name as string,
      handle: cat.handle as string,
    })),
    category_ids: [...new Set(categoryIds)],
    category_names: [...new Set(categoryNames)],
    category_paths: categoryPaths,
    all_category_handles: [...new Set(allCategoryHandles)],
    tags: tags.map((tag) => tag.value as string).filter(Boolean),
    variants: variants.map((v) => ({
      id: v.id as string,
      title: v.title as string,
      sku: v.sku as string | null,
      barcode: v.barcode as string | null,
      prices: ((v.prices as Array<Record<string, unknown>>) || []).map((p) => ({
        amount: p.amount as number,
        currency_code: p.currency_code as string,
      })),
      inventory_quantity: v.inventory_quantity as number,
    })),
    price_min: priceMin,
    price_max: priceMax,
    is_available: product.status === "published",
    has_stock: hasStock,
    created_at: product.created_at as string,
    updated_at: product.updated_at as string,
    metadata: (product.metadata as Record<string, unknown>) || {},
  };
}

/**
 * Transform raw category data to CategoryDocument
 */
function transformCategoryData(category: Record<string, unknown>): CategoryDocument {
  const ancestors = collectAncestorData(category);

  // Calculate depth
  let depth = 0;
  let current = category.parent_category as Record<string, unknown> | null;
  while (current) {
    depth++;
    current = current.parent_category as Record<string, unknown> | null;
  }

  return {
    id: category.id as string,
    name: category.name as string,
    handle: category.handle as string,
    description: (category.description as string) || null,
    parent_category_id: (category.parent_category as Record<string, unknown>)?.id as string || null,
    parent_category_ids: ancestors.ids,
    path: buildCategoryPath(category),
    ancestor_names: ancestors.names,
    ancestor_handles: ancestors.handles,
    is_active: category.is_active as boolean ?? true,
    rank: category.rank as number || 0,
    depth,
    product_count: category.product_count as number || 0,
    created_at: category.created_at as string,
    icon: (category.metadata as Record<string, unknown>)?.icon as string || null,
    image_url: (category.metadata as Record<string, unknown>)?.image_url as string || null,
    metadata: (category.metadata as Record<string, unknown>) || {},
  };
}

/**
 * Transform raw marque data to MarqueDocument
 */
function transformMarqueData(marque: Record<string, unknown>): MarqueDocument {
  return {
    id: marque.id as string,
    name: marque.name as string,
    slug: marque.slug as string,
    description: (marque.description as string) || null,
    country: (marque.country as string) || null,
    logo_url: (marque.logo_url as string) || null,
    website_url: (marque.website_url as string) || null,
    is_active: marque.is_active as boolean ?? true,
    rank: marque.rank as number || 0,
    created_at: marque.created_at as string,
    updated_at: marque.updated_at as string,
    metadata: (marque.metadata as Record<string, unknown>) || {},
  };
}

/**
 * Sync products to search index
 */
async function syncProducts(
  container: MedusaContainer,
  searchService: SearchModuleService,
  logger: { info: (msg: string) => void; error: (msg: string, err?: Error) => void; warn: (msg: string) => void },
  sinceDate: Date | null
): Promise<{ indexed: number; errors: number }> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  let indexed = 0;
  let errors = 0;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      // Build filters
      const filters: Record<string, unknown> = {
        status: "published",
      };

      // For incremental sync, only get products updated since last sync
      if (sinceDate) {
        filters.updated_at = { $gte: sinceDate.toISOString() };
      }

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
        filters,
        pagination: {
          take: BATCH_SIZE,
          skip: offset,
        },
      });

      if (products.length === 0) {
        hasMore = false;
        break;
      }

      // Transform and index
      const documents = products.map(transformProductData);
      await searchService.indexProducts(documents);

      indexed += documents.length;
      offset += BATCH_SIZE;

      if (products.length < BATCH_SIZE) {
        hasMore = false;
      }

      logger.info(`[Search Sync] Indexed ${indexed} products so far...`);
    } catch (error) {
      errors++;
      logger.error(`[Search Sync] Error syncing products batch at offset ${offset}:`, error instanceof Error ? error : undefined);
      
      // Continue with next batch
      offset += BATCH_SIZE;
      
      // Stop if too many errors
      if (errors > 10) {
        logger.error("[Search Sync] Too many errors, stopping product sync");
        break;
      }
    }
  }

  return { indexed, errors };
}

/**
 * Sync categories to search index
 */
async function syncCategories(
  container: MedusaContainer,
  searchService: SearchModuleService,
  logger: { info: (msg: string) => void; error: (msg: string, err?: Error) => void; warn: (msg: string) => void },
  sinceDate: Date | null
): Promise<{ indexed: number; errors: number }> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  let indexed = 0;
  let errors = 0;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      const filters: Record<string, unknown> = {};

      if (sinceDate) {
        filters.updated_at = { $gte: sinceDate.toISOString() };
      }

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
          "parent_category.id",
          "parent_category.name",
          "parent_category.handle",
          "parent_category.parent_category.id",
          "parent_category.parent_category.name",
          "parent_category.parent_category.handle",
          "parent_category.parent_category.parent_category.id",
          "parent_category.parent_category.parent_category.name",
          "parent_category.parent_category.parent_category.handle",
        ],
        filters,
        pagination: {
          take: BATCH_SIZE,
          skip: offset,
        },
      });

      if (categories.length === 0) {
        hasMore = false;
        break;
      }

      const documents = categories.map(transformCategoryData);
      await searchService.indexCategories(documents);

      indexed += documents.length;
      offset += BATCH_SIZE;

      if (categories.length < BATCH_SIZE) {
        hasMore = false;
      }
    } catch (error) {
      errors++;
      logger.error(`[Search Sync] Error syncing categories batch at offset ${offset}:`, error instanceof Error ? error : undefined);
      offset += BATCH_SIZE;
      
      if (errors > 5) {
        break;
      }
    }
  }

  return { indexed, errors };
}

/**
 * Sync marques to search index
 */
async function syncMarques(
  container: MedusaContainer,
  searchService: SearchModuleService,
  logger: { info: (msg: string) => void; error: (msg: string, err?: Error) => void; warn: (msg: string) => void },
  sinceDate: Date | null
): Promise<{ indexed: number; errors: number }> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  let indexed = 0;
  let errors = 0;
  let offset = 0;
  let hasMore = true;

  // Check if marque module exists
  try {
    container.resolve("marque");
  } catch {
    logger.warn("[Search Sync] Marque module not found, skipping marques sync");
    return { indexed: 0, errors: 0 };
  }

  while (hasMore) {
    try {
      const filters: Record<string, unknown> = {
        is_active: true,
      };

      if (sinceDate) {
        filters.updated_at = { $gte: sinceDate.toISOString() };
      }

      const { data: marques } = await query.graph({
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
        filters,
        pagination: {
          take: BATCH_SIZE,
          skip: offset,
        },
      });

      if (marques.length === 0) {
        hasMore = false;
        break;
      }

      const documents = marques.map(transformMarqueData);
      await searchService.indexMarques(documents);

      indexed += documents.length;
      offset += BATCH_SIZE;

      if (marques.length < BATCH_SIZE) {
        hasMore = false;
      }
    } catch (error) {
      errors++;
      logger.error(`[Search Sync] Error syncing marques batch at offset ${offset}:`, error instanceof Error ? error : undefined);
      offset += BATCH_SIZE;
      
      if (errors > 5) {
        break;
      }
    }
  }

  return { indexed, errors };
}

/**
 * Main sync job handler
 */
export default async function searchSyncJob(container: MedusaContainer): Promise<void> {
  const logger = container.resolve("logger") as {
    info: (msg: string) => void;
    error: (msg: string, err?: Error) => void;
    warn: (msg: string) => void;
    debug: (msg: string) => void;
  };
  const searchService: SearchModuleService = container.resolve(SEARCH_MODULE);

  // Try to acquire lock
  if (!acquireLock()) {
    logger.info("[Search Sync] Another sync is already running, skipping");
    return;
  }

  const startTime = Date.now();
  logger.info("[Search Sync] Starting scheduled sync job");

  try {
    // Ensure search service is initialized
    await searchService.initialize();

    // Determine if this is a full or incremental sync
    const isFirstSync = !syncState.lastCompletedAt;
    const sinceDate = isFirstSync ? null : syncState.lastSyncTimestamps.products;

    if (isFirstSync) {
      logger.info("[Search Sync] Performing full sync (first run)");
    } else {
      logger.info(`[Search Sync] Performing incremental sync since ${sinceDate?.toISOString()}`);
    }

    // Sync products
    logger.info("[Search Sync] Syncing products...");
    const productResults = await syncProducts(container, searchService, logger, sinceDate);
    syncState.lastSyncTimestamps.products = new Date();

    // Sync categories
    logger.info("[Search Sync] Syncing categories...");
    const categoryResults = await syncCategories(container, searchService, logger, isFirstSync ? null : syncState.lastSyncTimestamps.categories);
    syncState.lastSyncTimestamps.categories = new Date();

    // Sync marques
    logger.info("[Search Sync] Syncing marques...");
    const marqueResults = await syncMarques(container, searchService, logger, isFirstSync ? null : syncState.lastSyncTimestamps.marques);
    syncState.lastSyncTimestamps.marques = new Date();

    const duration = Date.now() - startTime;
    const totalIndexed = productResults.indexed + categoryResults.indexed + marqueResults.indexed;
    const totalErrors = productResults.errors + categoryResults.errors + marqueResults.errors;

    logger.info(
      `[Search Sync] Completed in ${duration}ms. ` +
      `Indexed: ${totalIndexed} (products: ${productResults.indexed}, categories: ${categoryResults.indexed}, marques: ${marqueResults.indexed}). ` +
      `Errors: ${totalErrors}`
    );

    releaseLock(totalErrors === 0);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`[Search Sync] Failed after ${duration}ms:`, error instanceof Error ? error : undefined);
    releaseLock(false);
  }
}

/**
 * Job configuration
 * Runs every 5 minutes by default
 */
export const config = {
  name: "search-sync",
  schedule: `*/${SYNC_INTERVAL_MINUTES} * * * *`, // Cron: every N minutes
};

/**
 * Export sync state for admin API access
 */
export function getSyncState(): SyncState {
  return { ...syncState };
}

/**
 * Force release lock (admin override)
 */
export function forceReleaseLock(): void {
  syncState.isRunning = false;
}

/**
 * Reset last sync timestamps (trigger full sync on next run)
 */
export function resetSyncTimestamps(): void {
  syncState.lastSyncTimestamps = {
    products: null,
    categories: null,
    marques: null,
  };
}
