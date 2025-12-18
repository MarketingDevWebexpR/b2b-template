/**
 * Dynamic Sitemap Generation
 *
 * Generates a comprehensive XML sitemap for SEO with:
 * - Static pages (home, contact, legal pages, etc.)
 * - Dynamic category pages with hierarchical URLs
 * - Brand pages
 * - Product pages
 *
 * Uses Next.js 15 Sitemap API with proper priorities and change frequencies.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 * @packageDocumentation
 */

import type { MetadataRoute } from 'next';

// ============================================================================
// Configuration
// ============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sage-portal.webexpr.dev';
const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';
const MEILISEARCH_URL = process.env.NEXT_PUBLIC_MEILISEARCH_URL || 'http://localhost:7700';
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || '';
const CATEGORIES_INDEX = process.env.MEILISEARCH_CATEGORIES_INDEX || 'bijoux_categories';

// ============================================================================
// Types
// ============================================================================

interface MeilisearchCategory {
  id: string;
  name: string;
  handle: string;
  ancestor_handles: string[];
  depth: number;
  is_active: boolean;
  updated_at?: string;
}

interface MeilisearchSearchResponse {
  hits: MeilisearchCategory[];
  estimatedTotalHits: number;
}

interface MedusaMarque {
  id: string;
  name: string;
  slug: string;
  updated_at?: string;
}

interface MedusaMarquesResponse {
  marques: MedusaMarque[];
}

interface MedusaProduct {
  id: string;
  handle: string;
  title: string;
  updated_at: string;
}

interface MedusaProductsResponse {
  products: MedusaProduct[];
  count: number;
}

// ============================================================================
// Data Fetching Functions
// ============================================================================

/**
 * Fetch all active categories from Meilisearch
 */
async function fetchCategories(): Promise<MeilisearchCategory[]> {
  try {
    const response = await fetch(`${MEILISEARCH_URL}/indexes/${CATEGORIES_INDEX}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(MEILISEARCH_API_KEY && { Authorization: `Bearer ${MEILISEARCH_API_KEY}` }),
      },
      body: JSON.stringify({
        q: '',
        limit: 1000,
        sort: ['depth:asc', 'rank:asc'],
        filter: 'is_active = true',
      }),
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error('[Sitemap] Failed to fetch categories:', response.status);
      return [];
    }

    const data: MeilisearchSearchResponse = await response.json();
    return data.hits;
  } catch (error) {
    console.error('[Sitemap] Error fetching categories:', error);
    return [];
  }
}

/**
 * Fetch all brands from Medusa CMS
 */
async function fetchBrands(): Promise<MedusaMarque[]> {
  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/cms/marques?take=500`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error('[Sitemap] Failed to fetch brands:', response.status);
      return [];
    }

    const data: MedusaMarquesResponse = await response.json();
    return data.marques || [];
  } catch (error) {
    console.error('[Sitemap] Error fetching brands:', error);
    return [];
  }
}

/**
 * Fetch all published products from Medusa
 * Uses pagination to handle large catalogs
 */
async function fetchProducts(): Promise<MedusaProduct[]> {
  const products: MedusaProduct[] = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  try {
    while (hasMore) {
      const response = await fetch(
        `${MEDUSA_BACKEND_URL}/store/products?limit=${limit}&offset=${offset}&fields=id,handle,title,updated_at`,
        {
          headers: { 'Content-Type': 'application/json' },
          next: { revalidate: 3600 },
        }
      );

      if (!response.ok) {
        console.error('[Sitemap] Failed to fetch products:', response.status);
        break;
      }

      const data: MedusaProductsResponse = await response.json();
      products.push(...data.products);

      hasMore = data.products.length === limit;
      offset += limit;

      // Safety limit to prevent infinite loops
      if (offset > 10000) {
        console.warn('[Sitemap] Product fetch limit reached (10000)');
        break;
      }
    }
  } catch (error) {
    console.error('[Sitemap] Error fetching products:', error);
  }

  return products;
}

// ============================================================================
// URL Builders
// ============================================================================

/**
 * Build category URL with full hierarchy path
 * e.g., /categorie/bijoux or /categorie/bijoux/colliers
 */
function buildCategoryUrl(category: MeilisearchCategory): string {
  const pathParts = [...category.ancestor_handles, category.handle];
  return `/categorie/${pathParts.join('/')}`;
}

/**
 * Build brand URL
 */
function buildBrandUrl(brand: MedusaMarque): string {
  return `/marques/${brand.slug}`;
}

/**
 * Build product URL
 */
function buildProductUrl(product: MedusaProduct): string {
  return `/produit/${product.handle}`;
}

// ============================================================================
// Static Pages Configuration
// ============================================================================

interface StaticPage {
  path: string;
  priority: number;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

const STATIC_PAGES: StaticPage[] = [
  // High priority pages
  { path: '/', priority: 1.0, changeFrequency: 'daily' },
  { path: '/recherche', priority: 0.9, changeFrequency: 'daily' },

  // Medium priority pages
  { path: '/contact', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/notre-histoire', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/categories', priority: 0.8, changeFrequency: 'weekly' },

  // Legal pages (lower priority but important for trust)
  { path: '/cgv', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/mentions-legales', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/politique-confidentialite', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/cookies', priority: 0.3, changeFrequency: 'yearly' },
];

// ============================================================================
// Sitemap Generator
// ============================================================================

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Fetch all dynamic content in parallel
  const [categories, brands, products] = await Promise.all([
    fetchCategories(),
    fetchBrands(),
    fetchProducts(),
  ]);

  // ==========================================
  // Static Pages
  // ==========================================
  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${SITE_URL}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // ==========================================
  // Category Pages
  // Priority: 0.8 for root, 0.7 for sub-categories
  // ==========================================
  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}${buildCategoryUrl(category)}`,
    lastModified: category.updated_at ? new Date(category.updated_at) : now,
    changeFrequency: 'weekly' as const,
    priority: category.depth === 0 ? 0.8 : 0.7,
  }));

  // ==========================================
  // Brand Pages
  // Priority: 0.7
  // ==========================================
  const brandEntries: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${SITE_URL}${buildBrandUrl(brand)}`,
    lastModified: brand.updated_at ? new Date(brand.updated_at) : now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // ==========================================
  // Product Pages
  // Priority: 0.6
  // ==========================================
  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}${buildProductUrl(product)}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : now,
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  // Log sitemap stats
  console.info(
    `[Sitemap] Generated: ${staticEntries.length} static, ${categoryEntries.length} categories, ${brandEntries.length} brands, ${productEntries.length} products`
  );

  // Combine all entries
  return [...staticEntries, ...categoryEntries, ...brandEntries, ...productEntries];
}
