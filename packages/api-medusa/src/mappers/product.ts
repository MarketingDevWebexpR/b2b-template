/**
 * Product Mappers
 *
 * Transform Medusa product data to domain types.
 */

import type { Product, Category } from "@maison/types";

/**
 * Medusa product response type
 */
export interface MedusaProduct {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  subtitle: string | null;
  thumbnail: string | null;
  images?: Array<{ url: string; id: string }>;
  variants?: MedusaVariant[];
  collection?: MedusaCollection | null;
  collection_id: string | null;
  categories?: MedusaCategory[];
  status: "draft" | "proposed" | "published" | "rejected";
  weight: number | null;
  origin_country: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface MedusaVariant {
  id: string;
  title: string;
  sku: string | null;
  barcode: string | null;
  prices?: MedusaPrice[];
  inventory_quantity?: number;
  manage_inventory: boolean;
}

export interface MedusaPrice {
  id: string;
  amount: number;
  currency_code: string;
  region_id?: string;
}

export interface MedusaCollection {
  id: string;
  title: string;
  handle: string;
}

export interface MedusaCategory {
  id: string;
  name: string;
  handle: string;
  parent_category_id: string | null;
  category_children?: MedusaCategory[];
}

/**
 * Map Medusa product to domain Product type.
 *
 * @param medusaProduct - Medusa product response
 * @param regionId - Region ID for price selection
 * @param currencyCode - Currency code for price selection
 * @returns Mapped Product
 *
 * @example
 * ```typescript
 * const product = mapMedusaProduct(medusaProduct, "reg_123", "EUR");
 * ```
 */
export function mapMedusaProduct(
  medusaProduct: MedusaProduct,
  regionId?: string,
  currencyCode = "EUR"
): Product {
  const images = medusaProduct.images?.map((img) => img.url) ?? [];
  if (medusaProduct.thumbnail && !images.includes(medusaProduct.thumbnail)) {
    images.unshift(medusaProduct.thumbnail);
  }

  // Get default variant for pricing
  const defaultVariant = medusaProduct.variants?.[0];
  const price = getVariantPrice(defaultVariant, regionId, currencyCode);

  // Get primary category
  const primaryCategory = medusaProduct.categories?.[0];

  return {
    id: medusaProduct.id,
    reference: defaultVariant?.sku ?? medusaProduct.id,
    name: medusaProduct.title,
    nameEn: medusaProduct.title, // Medusa doesn't have separate i18n by default
    slug: medusaProduct.handle,
    ean: defaultVariant?.barcode ?? undefined,
    description: medusaProduct.description ?? "",
    shortDescription: medusaProduct.subtitle ?? "",
    price: price / 100, // Medusa stores in cents
    isPriceTTC: false, // Medusa prices are typically HT
    images,
    categoryId: primaryCategory?.id ?? medusaProduct.collection_id ?? "",
    category: primaryCategory ? mapMedusaCategory(primaryCategory) : undefined,
    collection: medusaProduct.collection?.title,
    materials: extractMaterials(medusaProduct.metadata),
    weight: medusaProduct.weight ?? undefined,
    weightUnit: "g",
    brand: extractBrand(medusaProduct.metadata),
    origin: medusaProduct.origin_country ?? undefined,
    stock: defaultVariant?.inventory_quantity ?? 0,
    isAvailable: medusaProduct.status === "published",
    featured: extractFeatured(medusaProduct.metadata),
    isNew: isProductNew(medusaProduct.created_at),
    createdAt: medusaProduct.created_at,
  };
}

/**
 * Get variant price for specific region/currency.
 */
function getVariantPrice(
  variant: MedusaVariant | undefined,
  regionId?: string,
  currencyCode = "EUR"
): number {
  if (!variant?.prices?.length) return 0;

  // Try to find price for specific region first
  if (regionId) {
    const regionPrice = variant.prices.find((p) => p.region_id === regionId);
    if (regionPrice) return regionPrice.amount;
  }

  // Fall back to currency code
  const currencyPrice = variant.prices.find(
    (p) => p.currency_code === currencyCode.toLowerCase()
  );
  if (currencyPrice) return currencyPrice.amount;

  // Return first available price
  return variant.prices[0]?.amount ?? 0;
}

/**
 * Map Medusa category to domain Category type.
 */
export function mapMedusaCategory(medusaCategory: MedusaCategory): Category {
  return {
    id: medusaCategory.id,
    code: medusaCategory.handle,
    name: medusaCategory.name,
    slug: medusaCategory.handle,
    description: "",
    image: "",
    productCount: 0,
  };
}

/**
 * Extract materials from product metadata.
 */
function extractMaterials(metadata?: Record<string, unknown> | null): string[] {
  if (!metadata) return [];
  const materials = metadata["materials"];
  if (!materials) return [];
  if (Array.isArray(materials)) {
    return materials.filter((m): m is string => typeof m === "string");
  }
  if (typeof materials === "string") {
    return [materials];
  }
  return [];
}

/**
 * Extract brand from product metadata.
 */
function extractBrand(metadata?: Record<string, unknown> | null): string | undefined {
  if (!metadata) return undefined;
  const brand = metadata["brand"];
  if (typeof brand === "string") {
    return brand;
  }
  return undefined;
}

/**
 * Extract featured flag from product metadata.
 */
function extractFeatured(metadata?: Record<string, unknown> | null): boolean {
  if (!metadata) return false;
  return metadata["featured"] === true;
}

/**
 * Check if product is considered "new" (less than 30 days old).
 */
function isProductNew(createdAt: string): boolean {
  const created = new Date(createdAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return created > thirtyDaysAgo;
}
