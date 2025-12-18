/**
 * Data Transformers
 *
 * Transform Medusa entities into searchable documents.
 * Denormalization happens here to optimize search performance.
 */

import type { SearchableDocument } from '../providers/search-provider.interface';

/**
 * Category with optional parent hierarchy for path building
 */
interface CategoryWithParent {
  id: string;
  name: string;
  handle: string;
  parent_category?: CategoryWithParent | null;
}

/**
 * Build the full category path from a category with parent chain
 * Returns path like "Bijoux > Bagues > Or"
 */
function buildCategoryPath(category: CategoryWithParent): string {
  const names: string[] = [];
  let current: CategoryWithParent | null | undefined = category;

  while (current) {
    names.unshift(current.name);
    current = current.parent_category;
  }

  return names.join(' > ');
}

/**
 * Extract all ancestor IDs from a category chain
 */
function extractAncestorIds(category: CategoryWithParent): string[] {
  const ids: string[] = [];
  let current: CategoryWithParent | null | undefined = category.parent_category;

  while (current) {
    ids.unshift(current.id);
    current = current.parent_category;
  }

  return ids;
}

/**
 * Extract all ancestor names from a category chain (excluding current)
 */
function extractAncestorNames(category: CategoryWithParent): string[] {
  const names: string[] = [];
  let current: CategoryWithParent | null | undefined = category.parent_category;

  while (current) {
    names.unshift(current.name);
    current = current.parent_category;
  }

  return names;
}

/**
 * Extract all ancestor handles from a category chain (excluding current)
 */
function extractAncestorHandles(category: CategoryWithParent): string[] {
  const handles: string[] = [];
  let current: CategoryWithParent | null | undefined = category.parent_category;

  while (current) {
    handles.unshift(current.handle);
    current = current.parent_category;
  }

  return handles;
}

/**
 * Extract all handles in a category's hierarchy (including current and all ancestors)
 * Used for hierarchical filtering - allows finding products in child categories
 * when filtering by parent category handle.
 */
function extractAllHandlesInHierarchy(category: CategoryWithParent): string[] {
  const handles: string[] = [category.handle];
  let current: CategoryWithParent | null | undefined = category.parent_category;

  while (current) {
    handles.push(current.handle);
    current = current.parent_category;
  }

  return handles;
}

/**
 * Transform a Medusa product into a searchable document
 *
 * Includes brand/marque information from the product-marque link.
 * The marque data should be provided via the product.marque field
 * which is populated by the remote query with the link.
 */
export function transformProductForIndex(product: Record<string, unknown>): SearchableDocument {
  const variants = (product.variants as Array<Record<string, unknown>>) || [];
  const images = (product.images as Array<Record<string, unknown>>) || [];
  const categories = (product.categories as Array<Record<string, unknown>>) || [];
  const tags = (product.tags as Array<Record<string, unknown>>) || [];
  const collection = product.collection as Record<string, unknown> | null;
  const metadata = (product.metadata as Record<string, unknown>) || {};

  // Extract marque (brand) data from the link
  // The marque field is populated via the product-marque link when querying
  const marque = product.marque as Record<string, unknown> | null;

  // Calculate price range from variants
  const prices: number[] = [];
  variants.forEach((variant) => {
    const variantPrices = (variant.prices as Array<Record<string, unknown>>) || [];
    variantPrices.forEach((price) => {
      const amount = price.amount as number;
      if (typeof amount === 'number') {
        prices.push(amount);
      }
    });
  });

  const priceMin = prices.length > 0 ? Math.min(...prices) : null;
  const priceMax = prices.length > 0 ? Math.max(...prices) : null;

  // Check stock availability
  const hasStock = variants.some((variant) => {
    const quantity = variant.inventory_quantity as number;
    return typeof quantity === 'number' && quantity > 0;
  });

  return {
    id: product.id as string,
    title: product.title as string,
    handle: product.handle as string,
    description: (product.description as string) || null,
    sku: variants[0]?.sku as string || null,
    barcode: variants[0]?.barcode as string || null,
    thumbnail: (product.thumbnail as string) || null,
    images: images.map((img) => img.url as string).filter(Boolean),

    // Collection
    collection_id: collection?.id as string || null,
    collection: collection?.title as string || null,

    // Brand/Marque (from product-marque link)
    brand_id: marque?.id as string || null,
    brand_name: marque?.name as string || null,
    brand_slug: marque?.slug as string || null,

    // Legacy brand field (from metadata for backwards compatibility)
    brand: marque?.name as string || (metadata.brand as string) || (metadata.marque as string) || null,

    // Material (from metadata)
    material: (metadata.material as string) || (metadata.matiere as string) || null,

    // Categories (denormalized for faceting)
    categories: categories.map((cat) => ({
      id: cat.id as string,
      name: cat.name as string,
      handle: cat.handle as string,
    })),

    // Flat category arrays for filtering and faceting
    category_ids: categories.map((cat) => cat.id as string),
    category_names: categories.map((cat) => cat.name as string),
    // Build full category paths (e.g., "Bijoux > Bagues > Or")
    category_paths: categories.map((cat) => {
      const categoryWithParent = cat as unknown as CategoryWithParent;
      return buildCategoryPath(categoryWithParent);
    }),
    // All category handles in hierarchy (for hierarchical filtering)
    // This allows finding products when filtering by parent category
    all_category_handles: [...new Set(categories.flatMap((cat) => {
      const categoryWithParent = cat as unknown as CategoryWithParent;
      return extractAllHandlesInHierarchy(categoryWithParent);
    }))],

    // Tags
    tags: tags.map((tag) => tag.value as string).filter(Boolean),

    // Variants (simplified for search)
    variants: variants.map((variant) => ({
      id: variant.id as string,
      title: variant.title as string,
      sku: (variant.sku as string) || null,
      barcode: (variant.barcode as string) || null,
      prices: ((variant.prices as Array<Record<string, unknown>>) || []).map((p) => ({
        amount: p.amount as number,
        currency_code: p.currency_code as string,
      })),
      inventory_quantity: (variant.inventory_quantity as number) || 0,
    })),

    // Computed fields for filtering
    price_min: priceMin,
    price_max: priceMax,
    is_available: (product.status as string) === 'published',
    has_stock: hasStock,

    // Timestamps
    created_at: product.created_at as string,
    updated_at: product.updated_at as string,

    // Full metadata for advanced filtering
    metadata: {
      ...metadata,
      // Add any computed fields
      popularity: metadata.popularity || 0,
      sales_count: metadata.sales_count || 0,
    },
  };
}

/**
 * Transform a Medusa category into a searchable document
 */
export function transformCategoryForIndex(category: Record<string, unknown>): SearchableDocument {
  const metadata = (category.metadata as Record<string, unknown>) || {};
  const parentCategory = category.parent_category as Record<string, unknown> | null;
  const categoryWithParent = category as unknown as CategoryWithParent;

  // Calculate depth based on parent chain
  let depth = 0;
  let current = category;
  while (current.parent_category) {
    depth++;
    current = current.parent_category as Record<string, unknown>;
  }

  // Build hierarchy data
  const parentCategoryIds = extractAncestorIds(categoryWithParent);
  const ancestorNames = extractAncestorNames(categoryWithParent);
  const ancestorHandles = extractAncestorHandles(categoryWithParent);
  const path = buildCategoryPath(categoryWithParent);

  return {
    id: category.id as string,
    name: category.name as string,
    handle: category.handle as string,
    description: (category.description as string) || null,
    parent_category_id: parentCategory?.id as string || null,
    // Hierarchy fields
    parent_category_ids: parentCategoryIds,
    path,
    ancestor_names: ancestorNames,
    ancestor_handles: ancestorHandles,
    is_active: category.is_active !== false,
    rank: (category.rank as number) || 0,
    depth,
    product_count: (category.product_count as number) || 0,
    created_at: category.created_at as string,
    // Root-level icon and image for easy frontend access
    icon: (metadata.icon as string) || null,
    image_url: (metadata.image_url as string) || null,
    metadata: {
      name_en: metadata.name_en || null,
      icon: metadata.icon || null,
      image_url: metadata.image_url || null,
      ...metadata,
    },
  };
}

/**
 * Transform a marque (brand) into a searchable document
 *
 * Maps the Marque module entity to a Meilisearch-compatible document.
 */
export function transformMarqueForIndex(marque: Record<string, unknown>): SearchableDocument {
  const metadata = (marque.metadata as Record<string, unknown>) || {};

  return {
    id: marque.id as string,
    name: marque.name as string,
    slug: marque.slug as string,
    description: (marque.description as string) || null,
    country: (marque.country as string) || null,
    logo_url: (marque.logo_url as string) || null,
    website_url: (marque.website_url as string) || null,
    is_active: marque.is_active !== false,
    rank: (marque.rank as number) || 0,
    created_at: marque.created_at as string,
    updated_at: marque.updated_at as string,
    metadata: {
      ...metadata,
    },
  };
}

/**
 * Transform a collection into a searchable document
 */
export function transformCollectionForIndex(collection: Record<string, unknown>): SearchableDocument {
  const metadata = (collection.metadata as Record<string, unknown>) || {};

  return {
    id: collection.id as string,
    title: collection.title as string,
    handle: collection.handle as string,
    product_count: (collection.product_count as number) || 0,
    created_at: collection.created_at as string,
    metadata: {
      description: metadata.description || null,
      ...metadata,
    },
  };
}

export default {
  transformProductForIndex,
  transformCategoryForIndex,
  transformMarqueForIndex,
  transformCollectionForIndex,
};
