/**
 * Medusa v2 Type Definitions
 *
 * Complete type definitions for Medusa product data structures.
 * These types are derived from @medusajs/types but simplified and
 * extended for our B2B jewelry e-commerce use case.
 *
 * @see /docs/MEDUSA_PRODUCT_API_GUIDE.md for detailed documentation
 */

// ============================================================================
// Core Enums
// ============================================================================

export type ProductStatus = "draft" | "proposed" | "published" | "rejected";

export type MetadataType = Record<string, any>;

// ============================================================================
// Product Types
// ============================================================================

/**
 * Complete Medusa Product DTO
 *
 * Represents a product with all its relationships and metadata.
 * Use the Store API with `expand` parameter to populate relationships.
 */
export interface MedusaProduct {
  // Core Identification
  id: string;
  title: string;
  handle: string;
  subtitle: string | null;
  description: string | null;

  // Status & Type
  status: ProductStatus;
  is_giftcard: boolean;

  // Media
  thumbnail: string | null;
  images: MedusaProductImage[];

  // Physical Characteristics
  width: number | null;
  weight: number | null;
  length: number | null;
  height: number | null;
  material: string | null;

  // Origin & Compliance
  origin_country: string | null;
  hs_code: string | null;
  mid_code: string | null;

  // Relationships (expandable)
  collection: MedusaProductCollection | null;
  collection_id: string | null;
  categories?: MedusaProductCategory[] | null;
  type: MedusaProductType | null;
  type_id: string | null;
  tags: MedusaProductTag[];

  // Variants & Options (expandable)
  variants: MedusaProductVariant[];
  options: MedusaProductOption[];

  // Pricing
  discountable?: boolean;

  // Integration
  external_id: string | null;

  // Timestamps
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at: string | Date;

  // Custom Data
  metadata?: MedusaProductMetadata;
}

/**
 * Product Variant DTO
 *
 * Represents a unique SKU with specific option values.
 * Each variant can have independent pricing and inventory.
 */
export interface MedusaProductVariant {
  // Core Identification
  id: string;
  title: string;
  sku: string | null;

  // Identifiers
  barcode: string | null;
  ean: string | null;
  upc: string | null;

  // Inventory Management
  allow_backorder: boolean;
  manage_inventory: boolean;
  requires_shipping: boolean;

  // Media
  thumbnail: string | null;
  images: MedusaProductImage[];

  // Physical Characteristics
  material: string | null;
  weight: number | null;
  length: number | null;
  height: number | null;
  width: number | null;

  // Compliance
  hs_code: string | null;
  origin_country: string | null;
  mid_code: string | null;

  // Relationships
  options: MedusaProductOptionValue[];
  product?: MedusaProduct | null;
  product_id: string | null;
  variant_rank?: number | null;

  // Timestamps
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at: string | Date;

  // Custom Data
  metadata: MedusaVariantMetadata | null;

  // Pricing (calculated fields - populated when pricing context is provided)
  calculated_price?: MedusaCalculatedPrice;
  original_price?: MedusaCalculatedPrice;
}

/**
 * Product Image DTO
 */
export interface MedusaProductImage {
  id: string;
  url: string;
  rank: number;
  metadata?: MedusaImageMetadata;
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at?: string | Date;
}

/**
 * Product Option DTO (e.g., "Taille", "Couleur")
 */
export interface MedusaProductOption {
  id: string;
  title: string;
  product?: MedusaProduct | null;
  product_id?: string | null;
  values: MedusaProductOptionValue[];
  metadata?: MetadataType;
  created_at: string | Date;
  updated_at: string | Date;
}

/**
 * Product Option Value DTO (e.g., "54", "Or Blanc")
 */
export interface MedusaProductOptionValue {
  id: string;
  value: string;
  option: MedusaProductOption;
  option_id: string;
  metadata?: MetadataType;
  created_at: string | Date;
  updated_at: string | Date;
}

/**
 * Product Category DTO
 */
export interface MedusaProductCategory {
  id: string;
  name: string;
  description: string;
  handle: string;
  is_active: boolean;
  is_internal: boolean;
  rank: number;
  metadata?: MedusaCategoryMetadata;
  parent_category: MedusaProductCategory | null;
  parent_category_id: string | null;
  category_children: MedusaProductCategory[];
  products: MedusaProduct[];
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at?: string | Date;
}

/**
 * Product Collection DTO
 */
export interface MedusaProductCollection {
  id: string;
  title: string;
  handle: string;
  metadata?: MedusaCollectionMetadata;
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at?: string | Date;
}

/**
 * Product Tag DTO
 */
export interface MedusaProductTag {
  id: string;
  value: string;
  metadata?: MetadataType;
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at?: string | Date;
}

/**
 * Product Type DTO
 */
export interface MedusaProductType {
  id: string;
  value: string;
  metadata?: MetadataType;
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at?: string | Date;
}

// ============================================================================
// Pricing Types
// ============================================================================

/**
 * Calculated Price (returned when pricing context is provided)
 */
export interface MedusaCalculatedPrice {
  calculated_amount: number;
  calculated_amount_with_tax: number;
  is_calculated_price_tax_inclusive: boolean;
  is_calculated_price_price_list: boolean;
  currency_code: string;
}

/**
 * Pricing Context for Store API requests
 */
export interface MedusaPricingContext {
  region_id?: string;
  country_code?: string;
  province?: string;
  cart_id?: string;
}

// ============================================================================
// Metadata Type Extensions (B2B-specific)
// ============================================================================

/**
 * Extended metadata for Products
 */
export interface MedusaProductMetadata extends MetadataType {
  // B2B-specific
  warranty_months?: number;
  certification?: string;
  certificate_number?: string;
  hallmark?: string;

  // Manufacturing
  handmade?: boolean;
  production_time_days?: number;
  made_to_order?: boolean;
  customization_options?: string[];

  // Gemstone details
  gemstone_type?: string;
  gemstone_carat?: number;
  gemstone_color?: string;
  gemstone_clarity?: string;
  gemstone_cut?: string;
  gemstone_origin?: string;

  // Metal details
  metal_purity?: string;
  metal_weight_grams?: number;
  rhodium_plated?: boolean;

  // B2B pricing
  wholesale_tier?: string;
  minimum_order_quantity?: number;
  bulk_discount_available?: boolean;

  // Marketing
  featured_on_homepage?: boolean;
  featured_category?: string;
  marketing_tags?: string[];

  // SEO
  seo_keywords?: string[];
  schema_org_type?: string;

  // Sustainability
  ethical_sourcing?: boolean;
  conflict_free?: boolean;
  recycled_metal?: boolean;

  // Customer service
  resizing_available?: boolean;
  resizing_free?: boolean;
  return_policy_days?: number;

  // Internal (never expose to frontend)
  supplier_code?: string;
  cost_price_eur?: number;
  margin_percentage?: number;
}

/**
 * Extended metadata for Variants
 */
export interface MedusaVariantMetadata extends MetadataType {
  stone_weight_carat?: number;
  metal_weight_grams?: number;
  production_complexity?: "low" | "medium" | "high";
  requires_custom_sizing?: boolean;
  reorder_point?: number;
  supplier_lead_time_days?: number;
  primary_variant?: boolean;
  display_priority?: number;
}

/**
 * Extended metadata for Images
 */
export interface MedusaImageMetadata extends MetadataType {
  alt?: string;
  width?: number;
  height?: number;
  format?: string;
  view_type?: "main" | "side" | "detail" | "lifestyle" | "size" | "certificate";
  color_variant?: string;
  zoom_available?: boolean;
}

/**
 * Extended metadata for Categories
 */
export interface MedusaCategoryMetadata extends MetadataType {
  icon?: string;
  color_scheme?: string;
  banner_image_url?: string;
  meta_title?: string;
  meta_description?: string;
  min_order_value_eur?: number;
  volume_discount_tiers?: Record<string, number>;
  available_filters?: string[];
  price_ranges?: Array<{ min: number; max: number | null }>;
}

/**
 * Extended metadata for Collections
 */
export interface MedusaCollectionMetadata extends MetadataType {
  season?: "SS" | "AW";
  year?: number;
  launch_date?: string;
  banner_image?: string;
  theme?: string;
  featured?: boolean;
  style?: string;
  description?: string;
  target_audience?: string;
  designer?: string;
  year_established?: number;
  price_tier?: "entry" | "mid" | "premium" | "luxury";
  limited_edition?: boolean;
}

// ============================================================================
// Store API Request/Response Types
// ============================================================================

/**
 * Store API - List Products Request Params
 */
export interface MedusaStoreProductListParams extends MedusaPricingContext {
  // Pagination
  limit?: number;
  offset?: number;

  // Filtering
  id?: string | string[];
  q?: string;
  handle?: string | string[];
  category_id?: string | string[];
  collection_id?: string | string[];
  tag_id?: string | string[];
  type_id?: string | string[];

  // Variant filtering
  variants?: {
    options?: Record<string, string>;
  };

  // Relationships
  fields?: string;
  expand?: string;
}

/**
 * Store API - Get Product Request Params
 */
export interface MedusaStoreProductParams extends MedusaPricingContext {
  fields?: string;
  expand?: string;
}

/**
 * Store API - List Products Response
 */
export interface MedusaStoreProductListResponse {
  products: MedusaProduct[];
  count: number;
  limit: number;
  offset: number;
}

/**
 * Store API - Get Product Response
 */
export interface MedusaStoreProductResponse {
  product: MedusaProduct;
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Expanded product with all relationships loaded
 */
export type MedusaProductExpanded = MedusaProduct & {
  variants: Array<MedusaProductVariant & {
    options: MedusaProductOptionValue[];
    images: MedusaProductImage[];
  }>;
  options: Array<MedusaProductOption & {
    values: MedusaProductOptionValue[];
  }>;
  images: MedusaProductImage[];
  categories: MedusaProductCategory[];
  collection: MedusaProductCollection;
  tags: MedusaProductTag[];
  type: MedusaProductType;
};

/**
 * Common expand string for product detail pages
 */
export const PRODUCT_DETAIL_EXPAND =
  "variants,variants.options,variants.images,images,categories,collection,tags,type";

/**
 * Common expand string for product listing
 */
export const PRODUCT_LIST_EXPAND =
  "variants,images";

/**
 * Selected variant helper type
 */
export interface SelectedVariantInfo {
  variant: MedusaProductVariant | null;
  selectedOptions: Record<string, string>;
  isComplete: boolean;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if product has variants
 */
export function hasVariants(product: MedusaProduct): boolean {
  return product.variants && product.variants.length > 0;
}

/**
 * Check if product is available
 */
export function isProductAvailable(product: MedusaProduct): boolean {
  return product.status === "published" && hasVariants(product);
}

/**
 * Check if variant has calculated price
 */
export function hasCalculatedPrice(
  variant: MedusaProductVariant
): variant is MedusaProductVariant & { calculated_price: MedusaCalculatedPrice } {
  return variant.calculated_price !== undefined;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get primary image for product
 */
export function getPrimaryImage(product: MedusaProduct): string | null {
  if (product.thumbnail) return product.thumbnail;
  if (product.images?.[0]?.url) return product.images[0].url;
  return null;
}

/**
 * Get all unique option titles from variants
 */
export function getOptionTitles(product: MedusaProduct): string[] {
  return product.options?.map(opt => opt.title) || [];
}

/**
 * Find variant by selected options
 */
export function findVariantByOptions(
  product: MedusaProduct,
  selectedOptions: Record<string, string>
): MedusaProductVariant | undefined {
  return product.variants.find(variant =>
    variant.options.every(opt =>
      selectedOptions[opt.option.title] === opt.value
    )
  );
}

/**
 * Get available option values for a given option
 */
export function getAvailableOptionValues(
  product: MedusaProduct,
  optionTitle: string,
  selectedOptions: Record<string, string> = {}
): string[] {
  const option = product.options.find(opt => opt.title === optionTitle);
  if (!option) return [];

  // If no other options selected, return all values
  if (Object.keys(selectedOptions).length === 0) {
    return option.values.map(v => v.value);
  }

  // Filter to only values that have available variants
  const availableValues = new Set<string>();

  product.variants.forEach(variant => {
    const matches = Object.entries(selectedOptions).every(([key, value]) => {
      if (key === optionTitle) return true; // Skip current option
      const variantOption = variant.options.find(o => o.option.title === key);
      return variantOption?.value === value;
    });

    if (matches) {
      const currentOption = variant.options.find(o => o.option.title === optionTitle);
      if (currentOption) {
        availableValues.add(currentOption.value);
      }
    }
  });

  return Array.from(availableValues);
}

/**
 * Format price with currency
 */
export function formatPrice(amount: number, currencyCode: string = "EUR"): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount / 100); // Medusa stores prices in cents
}

/**
 * Get category breadcrumbs
 */
export function getCategoryBreadcrumbs(category: MedusaProductCategory): MedusaProductCategory[] {
  const breadcrumbs: MedusaProductCategory[] = [category];
  let current = category.parent_category;

  while (current) {
    breadcrumbs.unshift(current);
    current = current.parent_category;
  }

  return breadcrumbs;
}

/**
 * Build product URL
 */
export function getProductUrl(product: MedusaProduct, basePath: string = "/produit"): string {
  return `${basePath}/${product.handle}`;
}

/**
 * Get formatted weight
 */
export function getFormattedWeight(product: MedusaProduct | MedusaProductVariant): string | null {
  if (!product.weight) return null;
  return `${product.weight}g`;
}

/**
 * Check if product has metadata field
 */
export function hasMetadata<K extends keyof MedusaProductMetadata>(
  product: MedusaProduct,
  key: K
): product is MedusaProduct & { metadata: Required<Pick<MedusaProductMetadata, K>> } {
  return product.metadata?.[key] !== undefined;
}
