/**
 * Medusa Data Adapters
 *
 * Adapts Medusa data structures to the existing app types.
 * Includes B2B-specific metadata extraction for jewelry wholesale.
 *
 * @packageDocumentation
 */

import type { MedusaProduct, MedusaCategory, MedusaVariant } from './client';
import type { Product, Category } from '@/types';
import type { GalleryMedia } from '@/components/products/ProductDetail/ProductGallery';
import type {
  B2BProduct,
  B2BProductVariant,
  ProductOption,
  ProductCharacteristics,
  ProductCertification,
  B2BProductData,
} from '@/types/product-b2b';
import {
  hasCaracteristiques,
  hasCertifications,
  hasGarantie,
} from '@/types/product-b2b';

// ============================================
// Product Adapter
// ============================================

/**
 * Convert a Medusa product to the app's Product type
 */
export function adaptMedusaProduct(medusaProduct: MedusaProduct): Product {
  // Get the first variant for pricing info
  const firstVariant = medusaProduct.variants?.[0];

  // Calculate price (use EUR prices, convert from cents if needed)
  const eurPrice = firstVariant?.prices?.find(
    (p) => p.currency_code === 'eur' || p.currency_code === 'EUR'
  );
  const price = eurPrice?.amount ?? 0;

  // Get stock from variants
  const totalStock = medusaProduct.variants?.reduce(
    (sum, v) => sum + (v.inventory_quantity ?? 0),
    0
  ) ?? 0;

  // Extract materials from material field or metadata
  const materials: string[] = [];
  if (medusaProduct.material) {
    materials.push(medusaProduct.material);
  }

  // Get first category
  const firstCategory = medusaProduct.categories?.[0];

  // Extract warranty from metadata (garantie field from seeder)
  const warrantyMonths = extractWarrantyMonths(medusaProduct.metadata);

  // Build the Product object
  return {
    id: medusaProduct.id,
    reference: firstVariant?.sku ?? medusaProduct.id,
    name: medusaProduct.title,
    nameEn: undefined, // Medusa doesn't have multi-language by default
    slug: medusaProduct.handle,
    ean: firstVariant?.barcode ?? firstVariant?.ean ?? undefined,

    description: medusaProduct.description ?? '',
    shortDescription: medusaProduct.subtitle ?? medusaProduct.description?.slice(0, 150) ?? '',

    price: price / 100, // Convert from cents to euros
    compareAtPrice: undefined,
    isPriceTTC: false, // Typically Medusa prices are HT for B2B

    images: medusaProduct.images?.map((img) => img.url) ??
            (medusaProduct.thumbnail ? [medusaProduct.thumbnail] : []),

    categoryId: firstCategory?.id ?? '',
    category: firstCategory ? adaptMedusaCategory(firstCategory) : undefined,
    collection: medusaProduct.collection?.title ?? undefined,
    style: undefined, // Not in Medusa by default

    materials,
    weight: medusaProduct.weight ?? undefined,
    weightUnit: 'g',

    brand: (medusaProduct.metadata?.brand as string) ?? undefined,
    origin: medusaProduct.origin_country ?? undefined,
    warranty: warrantyMonths,

    stock: totalStock,
    isAvailable: medusaProduct.is_available ?? totalStock > 0,

    featured: (medusaProduct.metadata?.featured as boolean) ?? false,
    isNew: isNewProduct(medusaProduct.created_at),

    createdAt: medusaProduct.created_at,
  };
}

// ============================================
// B2B Product Adapter
// ============================================

/**
 * Convert a Medusa product to the B2B-extended Product type
 * Extracts all rich metadata from the Medusa seeder
 */
export function adaptMedusaProductB2B(medusaProduct: MedusaProduct): B2BProduct {
  // Get base product
  const baseProduct = adaptMedusaProduct(medusaProduct);
  const metadata = medusaProduct.metadata;

  // Extract caracteristiques
  let caracteristiques: ProductCharacteristics | undefined;
  if (hasCaracteristiques(metadata)) {
    caracteristiques = metadata.caracteristiques as ProductCharacteristics;
  }

  // Extract certifications
  let certifications: ProductCertification[] | undefined;
  if (hasCertifications(metadata)) {
    certifications = (metadata.certification as string[]).map((cert) => ({
      authority: cert,
    }));
  }

  // Extract garantie text
  let garantieText: string | undefined;
  if (hasGarantie(metadata)) {
    garantieText = metadata.garantie;
  }

  // Build B2B product
  return {
    ...baseProduct,
    subtitle: medusaProduct.subtitle ?? undefined,
    caracteristiques,
    certifications,
    garantieText,
    hsCode: medusaProduct.hs_code ?? undefined,
    minOrderQuantity: (metadata?.minimum_order_quantity as number) ?? undefined,
    hasVolumeDiscount: (metadata?.bulk_discount_available as boolean) ?? undefined,
    isHandmade: (metadata?.handmade as boolean) ?? undefined,
    productionTimeDays: (metadata?.production_time_days as number) ?? undefined,
    isMadeToOrder: (metadata?.made_to_order as boolean) ?? undefined,
    isFeaturedOnHomepage: (metadata?.featured_on_homepage as boolean) ?? undefined,
    marketingTags: (metadata?.marketing_tags as string[]) ?? undefined,
    isEthicallySourced: (metadata?.ethical_sourcing as boolean) ?? undefined,
    isConflictFree: (metadata?.conflict_free as boolean) ?? undefined,
    hasRecycledMetal: (metadata?.recycled_metal as boolean) ?? undefined,
  };
}

// ============================================
// Variant Adapters
// ============================================

/**
 * Extract product options from Medusa product
 */
export function extractProductOptions(medusaProduct: MedusaProduct): ProductOption[] {
  if (!medusaProduct.options || medusaProduct.options.length === 0) {
    return [];
  }

  return medusaProduct.options.map((opt) => ({
    id: opt.id,
    title: opt.title,
    values: opt.values.map((v) => ({
      id: v.id,
      value: v.value,
    })),
  }));
}

/**
 * Convert Medusa variant to B2B variant with parsed options
 */
export function adaptMedusaVariant(
  variant: MedusaVariant,
  options: ProductOption[]
): B2BProductVariant {
  // Get EUR price
  const eurPrice = variant.prices?.find(
    (p) => p.currency_code === 'eur' || p.currency_code === 'EUR'
  );

  // Parse option values from variant.options
  const optionValues: Record<string, string> = {};
  if (variant.options && options.length > 0) {
    variant.options.forEach((variantOpt, index) => {
      // Match by index (Medusa stores options in order)
      const productOption = options[index];
      if (productOption) {
        optionValues[productOption.title] = variantOpt.value;
      }
    });
  }

  // Extract variant-specific images from metadata
  const variantImages = (variant.metadata?.images as string[]) ?? undefined;

  return {
    id: variant.id,
    title: variant.title,
    sku: variant.sku,
    ean: variant.ean ?? variant.barcode,
    priceAmount: eurPrice?.amount ?? 0,
    currencyCode: eurPrice?.currency_code ?? 'EUR',
    inventoryQuantity: variant.inventory_quantity,
    allowBackorder: variant.allow_backorder,
    weight: variant.weight,
    optionValues,
    images: variantImages,
    inStock: variant.inventory_quantity > 0 || variant.allow_backorder,
  };
}

/**
 * Convert all variants from Medusa product
 */
export function adaptMedusaVariants(medusaProduct: MedusaProduct): B2BProductVariant[] {
  const options = extractProductOptions(medusaProduct);
  return (medusaProduct.variants ?? []).map((v) => adaptMedusaVariant(v, options));
}

// ============================================
// Complete B2B Product Data Bundle
// ============================================

/**
 * Create complete B2B product data bundle for the detail page
 */
export function createB2BProductData(medusaProduct: MedusaProduct): B2BProductData {
  const product = adaptMedusaProductB2B(medusaProduct);
  const options = extractProductOptions(medusaProduct);
  const variants = adaptMedusaVariants(medusaProduct);
  const defaultVariant = variants.length > 0 ? variants[0] : null;

  // Build breadcrumb categories
  const breadcrumbs: Category[] = [];
  if (medusaProduct.categories && medusaProduct.categories.length > 0) {
    // Start from the first category and traverse up to build breadcrumbs
    const buildBreadcrumbs = (category: MedusaCategory): Category[] => {
      const crumbs: Category[] = [];
      if (category.parent_category) {
        crumbs.push(...buildBreadcrumbs(category.parent_category));
      }
      crumbs.push(adaptMedusaCategory(category));
      return crumbs;
    };
    breadcrumbs.push(...buildBreadcrumbs(medusaProduct.categories[0]));
  }

  return {
    product,
    medusaProduct,
    options,
    variants,
    defaultVariant,
    breadcrumbs,
  };
}

// ============================================
// Variant Selection Helpers
// ============================================

/**
 * Find variant by selected option values
 */
export function findVariantByOptions(
  variants: B2BProductVariant[],
  selectedOptions: Record<string, string>
): B2BProductVariant | null {
  const selectedKeys = Object.keys(selectedOptions);
  if (selectedKeys.length === 0) return null;

  return variants.find((variant) =>
    selectedKeys.every((key) => variant.optionValues[key] === selectedOptions[key])
  ) ?? null;
}

/**
 * Get available option values based on current selection
 * Filters to only show values that have available variants
 */
export function getAvailableOptionValues(
  variants: B2BProductVariant[],
  options: ProductOption[],
  selectedOptions: Record<string, string>,
  optionTitle: string
): string[] {
  const option = options.find((o) => o.title === optionTitle);
  if (!option) return [];

  // Get all values for this option
  const allValues = option.values.map((v) => v.value);

  // If no other options selected, return all values
  const otherSelectedKeys = Object.keys(selectedOptions).filter((k) => k !== optionTitle);
  if (otherSelectedKeys.length === 0) {
    return allValues;
  }

  // Filter to values that have available variants with current selection
  const availableValues = new Set<string>();
  variants.forEach((variant) => {
    // Check if variant matches all other selected options
    const matchesOthers = otherSelectedKeys.every(
      (key) => variant.optionValues[key] === selectedOptions[key]
    );
    if (matchesOthers && variant.optionValues[optionTitle]) {
      availableValues.add(variant.optionValues[optionTitle]);
    }
  });

  return allValues.filter((v) => availableValues.has(v));
}

/**
 * Convert Medusa product images to GalleryMedia format
 */
export function adaptProductImages(medusaProduct: MedusaProduct): GalleryMedia[] {
  const media: GalleryMedia[] = [];

  // Add images
  if (medusaProduct.images && medusaProduct.images.length > 0) {
    medusaProduct.images
      .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
      .forEach((img, index) => {
        media.push({
          id: img.id,
          type: 'image',
          src: img.url,
          alt: `${medusaProduct.title} - Vue ${index + 1}`,
        });
      });
  } else if (medusaProduct.thumbnail) {
    // Fallback to thumbnail
    media.push({
      id: 'thumbnail',
      type: 'image',
      src: medusaProduct.thumbnail,
      alt: medusaProduct.title,
    });
  }

  return media;
}

// ============================================
// Category Adapter
// ============================================

/**
 * Convert a Medusa category to the app's Category type
 */
export function adaptMedusaCategory(
  medusaCategory: MedusaCategory | { id: string; name: string; handle: string }
): Category {
  return {
    id: medusaCategory.id,
    code: medusaCategory.handle,
    name: medusaCategory.name,
    slug: medusaCategory.handle,
    description: (medusaCategory as MedusaCategory).description ?? '',
    image: '', // Medusa categories don't have images by default
    productCount: 0, // Would need separate query
    type: 0,
  };
}

/**
 * Convert full Medusa category with children
 */
export function adaptMedusaCategoryFull(medusaCategory: MedusaCategory): Category & {
  children?: Category[];
  parentId?: string;
} {
  const base = adaptMedusaCategory(medusaCategory);

  return {
    ...base,
    parentId: medusaCategory.parent_category_id ?? undefined,
    children: medusaCategory.category_children?.map(adaptMedusaCategoryFull),
  };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Check if a product is "new" (created in the last 30 days)
 */
function isNewProduct(createdAt: string, daysThreshold: number = 30): boolean {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff <= daysThreshold;
}

/**
 * Get variant-specific images mapping
 */
export function getVariantImagesMap(
  medusaProduct: MedusaProduct
): Record<string, string[]> | undefined {
  // Check if variants have specific images in metadata
  const map: Record<string, string[]> = {};
  let hasVariantImages = false;

  medusaProduct.variants?.forEach((variant) => {
    const variantImages = variant.metadata?.images as string[] | undefined;
    if (variantImages && variantImages.length > 0) {
      map[variant.id] = variantImages;
      hasVariantImages = true;
    }
  });

  return hasVariantImages ? map : undefined;
}

/**
 * Format price for display
 */
export function formatMedusaPrice(
  amount: number,
  currencyCode: string = 'EUR'
): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount / 100);
}

/**
 * Build hierarchical category path from MedusaCategory
 * Traverses parent_category to build the full URL path
 *
 * @param category - MedusaCategory with parent_category chain
 * @returns Full URL path (e.g., "/categorie/electricite/cables-fils/cables-rigides")
 */
export function buildCategoryHierarchicalPath(category: MedusaCategory): string {
  const handles: string[] = [];

  // Recursively collect handles from root to leaf
  function collectHandles(cat: MedusaCategory | null | undefined): void {
    if (!cat) return;
    if (cat.parent_category) {
      collectHandles(cat.parent_category);
    }
    handles.push(cat.handle);
  }

  collectHandles(category);
  return handles.length > 0 ? `/categorie/${handles.join('/')}` : '/categorie';
}

/**
 * Build breadcrumb items from MedusaCategory hierarchy
 * Returns array of breadcrumb items with proper hierarchical hrefs
 */
export interface CategoryBreadcrumbItem {
  label: string;
  href?: string;
}

export function buildCategoryBreadcrumbsFromMedusa(
  category: MedusaCategory
): CategoryBreadcrumbItem[] {
  const breadcrumbs: CategoryBreadcrumbItem[] = [
    { label: 'Catalogue', href: '/produits' },
  ];

  // Collect all categories from root to leaf
  const categoryChain: MedusaCategory[] = [];

  function collectCategories(cat: MedusaCategory | null | undefined): void {
    if (!cat) return;
    if (cat.parent_category) {
      collectCategories(cat.parent_category);
    }
    categoryChain.push(cat);
  }

  collectCategories(category);

  // Build breadcrumbs with hierarchical paths
  let currentPath = '';
  for (const cat of categoryChain) {
    currentPath = currentPath ? `${currentPath}/${cat.handle}` : cat.handle;
    breadcrumbs.push({
      label: cat.name,
      href: `/categorie/${currentPath}`,
    });
  }

  return breadcrumbs;
}

/**
 * Extract warranty months from metadata
 * Handles various formats: "2 ans", "24 mois", "A vie", number, etc.
 */
function extractWarrantyMonths(
  metadata: Record<string, unknown> | null
): number | undefined {
  if (!metadata) return undefined;

  // Check for direct warranty_months field
  if (typeof metadata.warranty_months === 'number') {
    return metadata.warranty_months;
  }

  // Check for garantie text field and parse it
  const garantie = metadata.garantie;
  if (typeof garantie === 'string') {
    const lower = garantie.toLowerCase();

    // "A vie" or "lifetime" = 999 months (special marker)
    if (lower.includes('vie') || lower.includes('lifetime')) {
      return 999;
    }

    // Parse "X ans" or "X year(s)"
    const yearsMatch = lower.match(/(\d+)\s*(ans?|year)/);
    if (yearsMatch) {
      return parseInt(yearsMatch[1], 10) * 12;
    }

    // Parse "X mois" or "X month(s)"
    const monthsMatch = lower.match(/(\d+)\s*(mois|month)/);
    if (monthsMatch) {
      return parseInt(monthsMatch[1], 10);
    }
  }

  return undefined;
}
