/**
 * Product mappers for Laravel Bridge API responses
 *
 * Maps Laravel Bridge API product format to domain Product type.
 */

import type { Product, Category } from "@maison/types";

/**
 * Laravel Bridge raw product structure
 */
export interface BridgeRawProduct {
  id: string | number;
  sku: string;
  name: string;
  name_en?: string;
  slug?: string;
  description?: string;
  short_description?: string;
  price: number | string;
  sale_price?: number | string | null;
  currency?: string;
  is_price_ttc?: boolean;
  quantity?: number;
  stock_status?: "in_stock" | "out_of_stock" | "backorder";
  images?: BridgeRawImage[];
  categories?: BridgeRawCategory[];
  attributes?: Record<string, string | number | boolean>;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  weight?: number;
  weight_unit?: "g" | "kg";
  brand?: string;
  origin?: string;
  warranty?: number;
  barcode?: string;
  is_active?: boolean;
  is_featured?: boolean;
  is_new?: boolean;
  collection?: string;
  style?: string;
  materials?: string[];
}

export interface BridgeRawImage {
  id?: string | number;
  url: string;
  alt?: string;
  position?: number;
  is_primary?: boolean;
}

export interface BridgeRawCategory {
  id: string | number;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  product_count?: number;
}

/**
 * Parse price from Bridge API (can be string or number)
 */
function parsePrice(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const parsed = parseFloat(value.replace(/[^0-9.-]/g, ""));
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Generate slug from name if not provided
 */
function generateSlug(name: string, sku: string): string {
  if (!name) return sku.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Map Bridge category to domain Category
 */
export function mapBridgeCategory(raw: BridgeRawCategory): Category {
  return {
    id: raw.id.toString(),
    name: raw.name,
    slug: raw.slug ?? generateSlug(raw.name, raw.id.toString()),
    description: raw.description ?? "",
    image: raw.image ?? "",
    productCount: raw.product_count ?? 0,
  };
}

/**
 * Map Bridge product to domain Product
 *
 * @param raw - Raw product from Bridge API
 * @param currency - Currency code (default: EUR) - used for formatting, not stored
 * @returns Domain Product object
 *
 * @example
 * ```typescript
 * const bridgeProduct = await bridgeApi.get('/products/123');
 * const product = mapBridgeProduct(bridgeProduct.data, 'EUR');
 * ```
 */
export function mapBridgeProduct(raw: BridgeRawProduct, _currency = "EUR"): Product {
  const price = parsePrice(raw.price);
  const salePrice = raw.sale_price ? parsePrice(raw.sale_price) : null;
  const hasDiscount = salePrice !== null && salePrice < price;

  // Map images - extract URLs
  const images = raw.images?.map((img) => img.url) ?? [];

  // Determine availability
  let isAvailable = true;
  if (raw.is_active === false) {
    isAvailable = false;
  } else if (raw.stock_status === "out_of_stock") {
    isAvailable = false;
  } else if (raw.quantity !== undefined && raw.quantity <= 0) {
    isAvailable = false;
  }

  // Get primary category
  const primaryCategory = raw.categories?.[0];

  return {
    id: raw.id.toString(),
    reference: raw.sku,
    name: raw.name,
    slug: raw.slug ?? generateSlug(raw.name, raw.sku),
    description: raw.description ?? "",
    shortDescription: raw.short_description ?? "",
    price: hasDiscount && salePrice !== null ? salePrice : price,
    isPriceTTC: raw.is_price_ttc ?? false,
    images,
    categoryId: primaryCategory?.id.toString() ?? "",
    materials: raw.materials ?? [],
    weightUnit: raw.weight_unit ?? "g",
    stock: raw.quantity ?? 0,
    isAvailable,
    featured: raw.is_featured ?? false,
    isNew: raw.is_new ?? false,
    createdAt: raw.created_at ?? new Date().toISOString(),
    // Optional properties - only include when they have values
    ...(raw.name_en && { nameEn: raw.name_en }),
    ...(raw.barcode && { ean: raw.barcode }),
    ...(hasDiscount && { compareAtPrice: price }),
    ...(primaryCategory && { category: mapBridgeCategory(primaryCategory) }),
    ...(raw.collection && { collection: raw.collection }),
    ...(raw.style && { style: raw.style }),
    ...(raw.weight !== undefined && { weight: raw.weight }),
    ...(raw.brand && { brand: raw.brand }),
    ...(raw.origin && { origin: raw.origin }),
    ...(raw.warranty !== undefined && { warranty: raw.warranty }),
  };
}

/**
 * Map array of Bridge products to domain Products
 */
export function mapBridgeProducts(
  rawProducts: BridgeRawProduct[],
  currency = "EUR"
): Product[] {
  return rawProducts.map((p) => mapBridgeProduct(p, currency));
}
