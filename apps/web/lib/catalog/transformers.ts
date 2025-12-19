/**
 * Data Transformers for Catalog Module
 *
 * Transforms raw API data into UI-ready formats with proper type safety.
 * These functions handle data normalization, computed properties, and formatting.
 *
 * @packageDocumentation
 */

import type { Brand, BrandCardData, BrandColor } from '@/types/brand';

// Re-export BrandCardData for consumers
export type { BrandCardData } from '@/types/brand';
import type {
  IndexedCategory,
  CategoryTreeNode,
  CategoryNavItem,
  CategoryBreadcrumb,
} from '@/types/category';

// ============================================================================
// Brand Transformers
// ============================================================================

/**
 * Color palette for brand initials (imported from brand types or defined here)
 */
const DEFAULT_BRAND_COLORS: BrandColor[] = [
  { bg: '#fef3c7', text: '#92400e' }, // Amber
  { bg: '#dbeafe', text: '#1e40af' }, // Blue
  { bg: '#dcfce7', text: '#166534' }, // Green
  { bg: '#fce7f3', text: '#9d174d' }, // Pink
  { bg: '#e0e7ff', text: '#3730a3' }, // Indigo
  { bg: '#ffedd5', text: '#c2410c' }, // Orange
  { bg: '#f3e8ff', text: '#7c3aed' }, // Purple
  { bg: '#ccfbf1', text: '#0f766e' }, // Teal
  { bg: '#fef9c3', text: '#854d0e' }, // Yellow
  { bg: '#fee2e2', text: '#b91c1c' }, // Red
];

/**
 * Get initials from brand name
 * Takes up to 2 characters from the first 2 words
 *
 * @example
 * ```typescript
 * getBrandInitials('Cartier') // 'CA'
 * getBrandInitials('Van Cleef & Arpels') // 'VA'
 * getBrandInitials('David Yurman') // 'DY'
 * ```
 */
export function getBrandInitials(name: string): string {
  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  // Get first letter of first two significant words (skip "&", "and", etc.)
  const significantWords = words.filter(
    (w) => !['&', 'and', 'et', 'the', 'le', 'la', 'les'].includes(w.toLowerCase())
  );

  return significantWords
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/**
 * Get a consistent color for a brand based on its ID
 * Uses hash function for deterministic color assignment
 */
export function getBrandColor(brandId: string, colors: BrandColor[] = DEFAULT_BRAND_COLORS): BrandColor {
  // Simple hash function for consistent color assignment
  let hash = 0;
  for (let i = 0; i < brandId.length; i++) {
    const char = brandId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Transform Brand to BrandCardData with computed display properties
 */
export function transformBrandToCardData(
  brand: Brand,
  colors: BrandColor[] = DEFAULT_BRAND_COLORS
): BrandCardData {
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logo_url: brand.logo_url,
    product_count: brand.product_count,
    is_premium: brand.is_premium,
    is_favorite: brand.is_favorite,
    initials: getBrandInitials(brand.name),
    color: getBrandColor(brand.id, colors),
  };
}

/**
 * Transform array of brands to card data
 */
export function transformBrandsToCardData(
  brands: Brand[],
  colors: BrandColor[] = DEFAULT_BRAND_COLORS
): BrandCardData[] {
  return brands.map((brand) => transformBrandToCardData(brand, colors));
}

/**
 * Group brands alphabetically by first letter
 * Returns object with A-Z and # for numbers/special chars
 */
export function groupBrandsByLetter(brands: Brand[]): Record<string, Brand[]> {
  const groups: Record<string, Brand[]> = {};

  // Initialize empty arrays for all letters
  for (let i = 65; i <= 90; i++) {
    groups[String.fromCharCode(i)] = [];
  }
  groups['#'] = [];

  // Group brands
  for (const brand of brands) {
    const firstChar = brand.name.trim().charAt(0).toUpperCase();
    const key = /^[A-Z]$/.test(firstChar) ? firstChar : '#';
    groups[key].push(brand);
  }

  // Remove empty groups
  return Object.fromEntries(
    Object.entries(groups).filter(([, brands]) => brands.length > 0)
  );
}

/**
 * Sort brands alphabetically by name (locale-aware)
 */
export function sortBrandsAlphabetically(brands: Brand[]): Brand[] {
  return [...brands].sort((a, b) =>
    a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
  );
}

/**
 * Filter premium brands (top N by product count)
 */
export function filterPremiumBrands(brands: Brand[], count: number = 8): Brand[] {
  return [...brands]
    .filter((brand) => brand.product_count > 0)
    .sort((a, b) => b.product_count - a.product_count)
    .slice(0, count)
    .map((brand) => ({ ...brand, is_premium: true }));
}

// ============================================================================
// Category Transformers
// ============================================================================

/**
 * Build a URL path from category ancestor handles
 *
 * @example
 * ```typescript
 * buildCategoryPath(['bijoux', 'colliers', 'pendentifs'])
 * // '/categorie/bijoux/colliers/pendentifs'
 * ```
 */
export function buildCategoryPath(
  handles: string[],
  basePath: string = '/categorie'
): string {
  if (handles.length === 0) return basePath;
  return `${basePath}/${handles.join('/')}`;
}

/**
 * Build full path for a category including its ancestors
 */
export function buildCategoryFullPath(
  category: IndexedCategory,
  basePath: string = '/categorie'
): string {
  const handles = [...category.ancestor_handles, category.handle];
  return buildCategoryPath(handles, basePath);
}

/**
 * Transform category to breadcrumb items
 */
export function transformCategoryToBreadcrumbs(
  category: IndexedCategory,
  byId: Record<string, IndexedCategory>,
  basePath: string = '/categorie'
): CategoryBreadcrumb[] {
  const breadcrumbs: CategoryBreadcrumb[] = [];

  // Add ancestor categories
  for (let i = 0; i < category.parent_category_ids.length; i++) {
    const ancestorId = category.parent_category_ids[i];
    const ancestor = byId[ancestorId];

    if (ancestor) {
      const handles = category.ancestor_handles.slice(0, i + 1);
      breadcrumbs.push({
        id: ancestor.id,
        name: ancestor.name,
        handle: ancestor.handle,
        href: buildCategoryPath(handles, basePath),
      });
    }
  }

  // Add current category
  breadcrumbs.push({
    id: category.id,
    name: category.name,
    handle: category.handle,
    href: buildCategoryFullPath(category, basePath),
  });

  return breadcrumbs;
}

/**
 * Transform category tree to navigation items
 * Limits depth and adds computed properties
 */
export function transformTreeToNavItems(
  tree: CategoryTreeNode[],
  maxDepth: number = 2,
  currentDepth: number = 0
): CategoryNavItem[] {
  return tree.map((node) => ({
    id: node.id,
    name: node.name,
    handle: node.handle,
    icon: node.icon,
    image_url: node.image_url,
    depth: node.depth,
    productCount: node.product_count,
    hasChildren: node.children.length > 0,
    children:
      currentDepth < maxDepth && node.children.length > 0
        ? transformTreeToNavItems(node.children, maxDepth, currentDepth + 1)
        : undefined,
  }));
}

/**
 * Flatten category tree to array
 */
export function flattenCategoryTree(tree: CategoryTreeNode[]): IndexedCategory[] {
  const result: IndexedCategory[] = [];

  function collect(nodes: CategoryTreeNode[]) {
    for (const node of nodes) {
      const { children, ...category } = node;
      result.push(category);
      if (children.length > 0) {
        collect(children);
      }
    }
  }

  collect(tree);
  return result;
}

/**
 * Find category in tree by handle path
 *
 * @example
 * ```typescript
 * findCategoryByPath(tree, ['bijoux', 'colliers'])
 * ```
 */
export function findCategoryByPath(
  tree: CategoryTreeNode[],
  path: string[]
): CategoryTreeNode | null {
  if (path.length === 0) return null;

  let currentNodes = tree;
  let result: CategoryTreeNode | null = null;

  for (const handle of path) {
    const found = currentNodes.find((n) => n.handle === handle);
    if (!found) return null;
    result = found;
    currentNodes = found.children;
  }

  return result;
}

// ============================================================================
// Product Transformers
// ============================================================================

/**
 * Product as returned from Medusa/API
 */
export interface RawProduct {
  id: string;
  title: string;
  handle: string;
  subtitle: string | null;
  description: string | null;
  thumbnail: string | null;
  images?: Array<{ id: string; url: string; rank: number }>;
  variants: Array<{
    id: string;
    title: string;
    sku: string | null;
    prices: Array<{
      id: string;
      currency_code: string;
      amount: number;
    }>;
    inventory_quantity: number;
  }>;
  categories?: Array<{ id: string; name: string; handle: string }>;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/**
 * UI-ready product format
 */
export interface TransformedProduct {
  id: string;
  title: string;
  handle: string;
  slug: string; // Alias for handle
  subtitle: string | null;
  description: string | null;
  thumbnail: string | null;
  images: string[];
  price: {
    amount: number;
    currency: string;
    formatted: string;
  } | null;
  compareAtPrice: {
    amount: number;
    currency: string;
    formatted: string;
  } | null;
  inStock: boolean;
  totalInventory: number;
  categoryIds: string[];
  categoryNames: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Format price amount to locale string
 */
export function formatPrice(
  amount: number,
  currency: string = 'EUR',
  locale: string = 'fr-FR'
): string {
  // Medusa stores prices in smallest unit (cents)
  const value = amount / 100;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(value);
}

/**
 * Get lowest price from variant prices
 */
export function getLowestPrice(
  variants: RawProduct['variants'],
  currencyCode: string = 'eur'
): { amount: number; currency: string } | null {
  const allPrices: Array<{ amount: number; currency: string }> = [];

  for (const variant of variants) {
    for (const price of variant.prices) {
      if (price.currency_code.toLowerCase() === currencyCode.toLowerCase()) {
        allPrices.push({
          amount: price.amount,
          currency: price.currency_code,
        });
      }
    }
  }

  if (allPrices.length === 0) return null;

  return allPrices.reduce((lowest, current) =>
    current.amount < lowest.amount ? current : lowest
  );
}

/**
 * Calculate total inventory across all variants
 */
export function getTotalInventory(variants: RawProduct['variants']): number {
  return variants.reduce((total, variant) => total + variant.inventory_quantity, 0);
}

/**
 * Transform raw product to UI-ready format
 */
export function transformProduct(
  product: RawProduct,
  currencyCode: string = 'eur',
  locale: string = 'fr-FR'
): TransformedProduct {
  const lowestPrice = getLowestPrice(product.variants, currencyCode);
  const totalInventory = getTotalInventory(product.variants);

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    slug: product.handle,
    subtitle: product.subtitle,
    description: product.description,
    thumbnail: product.thumbnail,
    images: product.images?.sort((a, b) => a.rank - b.rank).map((img) => img.url) ?? [],
    price: lowestPrice
      ? {
          amount: lowestPrice.amount,
          currency: lowestPrice.currency,
          formatted: formatPrice(lowestPrice.amount, lowestPrice.currency, locale),
        }
      : null,
    compareAtPrice: null, // Could be computed from metadata or variant compare_at_price
    inStock: totalInventory > 0,
    totalInventory,
    categoryIds: product.categories?.map((c) => c.id) ?? [],
    categoryNames: product.categories?.map((c) => c.name) ?? [],
    createdAt: new Date(product.created_at),
    updatedAt: new Date(product.updated_at),
  };
}

/**
 * Transform array of products
 */
export function transformProducts(
  products: RawProduct[],
  currencyCode: string = 'eur',
  locale: string = 'fr-FR'
): TransformedProduct[] {
  return products.map((product) => transformProduct(product, currencyCode, locale));
}

// ============================================================================
// Facet Transformers
// ============================================================================

/**
 * Raw facet from search/aggregation
 */
export interface RawFacet {
  [key: string]: number;
}

/**
 * Transformed facet option for UI
 */
export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

/**
 * Facets response structure
 */
export interface Facets {
  categories: FacetOption[];
  brands: FacetOption[];
  priceRanges: FacetOption[];
  total: number;
}

/**
 * Transform raw facet object to sorted array of options
 */
export function transformFacet(
  facet: RawFacet,
  labelFormatter?: (value: string) => string
): FacetOption[] {
  return Object.entries(facet)
    .map(([value, count]) => ({
      value,
      label: labelFormatter ? labelFormatter(value) : value,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Transform price range bucket to label
 */
export function formatPriceRangeLabel(
  min: number,
  max: number | null,
  currency: string = 'EUR'
): string {
  const minFormatted = formatPrice(min, currency);

  if (max === null) {
    return `${minFormatted}+`;
  }

  const maxFormatted = formatPrice(max, currency);
  return `${minFormatted} - ${maxFormatted}`;
}

// ============================================================================
// URL/Slug Utilities
// ============================================================================

/**
 * Slugify a string for use in URLs
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse a slug back to human-readable format
 */
export function unslugify(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default {
  // Brand transformers
  getBrandInitials,
  getBrandColor,
  transformBrandToCardData,
  transformBrandsToCardData,
  groupBrandsByLetter,
  sortBrandsAlphabetically,
  filterPremiumBrands,

  // Category transformers
  buildCategoryPath,
  buildCategoryFullPath,
  transformCategoryToBreadcrumbs,
  transformTreeToNavItems,
  flattenCategoryTree,
  findCategoryByPath,

  // Product transformers
  formatPrice,
  getLowestPrice,
  getTotalInventory,
  transformProduct,
  transformProducts,

  // Facet transformers
  transformFacet,
  formatPriceRangeLabel,

  // URL utilities
  slugify,
  unslugify,
};
