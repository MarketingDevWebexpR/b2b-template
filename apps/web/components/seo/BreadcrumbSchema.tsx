/**
 * Breadcrumb JSON-LD Schema Component
 *
 * Renders structured data for breadcrumb navigation.
 * Helps search engines understand page hierarchy.
 *
 * @see https://schema.org/BreadcrumbList
 * @see https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
 * @packageDocumentation
 */

import Script from 'next/script';

// ============================================================================
// Configuration
// ============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sage-portal.webexpr.dev';

// ============================================================================
// Types
// ============================================================================

export interface BreadcrumbItem {
  /** Display name */
  name: string;
  /** URL path (relative or absolute) */
  href: string;
}

export interface BreadcrumbSchemaProps {
  /** Breadcrumb items in order (first = root, last = current page) */
  items: BreadcrumbItem[];
  /** Current page URL (for the schema @id) */
  currentUrl?: string;
  /** Include home as first item automatically */
  includeHome?: boolean;
  /** Custom home label */
  homeLabel?: string;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Normalize URL to absolute format
 */
function normalizeUrl(href: string): string {
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return href;
  }
  // Ensure path starts with /
  const path = href.startsWith('/') ? href : `/${href}`;
  return `${SITE_URL}${path}`;
}

// ============================================================================
// Component
// ============================================================================

export function BreadcrumbSchema({
  items,
  currentUrl,
  includeHome = true,
  homeLabel = 'Accueil',
}: BreadcrumbSchemaProps) {
  // Build full breadcrumb list
  const breadcrumbItems: BreadcrumbItem[] = includeHome
    ? [{ name: homeLabel, href: '/' }, ...items]
    : items;

  // Generate unique ID based on current URL or last item
  const schemaId =
    currentUrl || (items.length > 0 ? normalizeUrl(items[items.length - 1].href) : SITE_URL);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${schemaId}/#breadcrumb`,
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: normalizeUrl(item.href),
    })),
  };

  return (
    <Script
      id={`breadcrumb-schema-${schemaId.replace(/[^a-zA-Z0-9]/g, '-')}`}
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Build breadcrumb items from category hierarchy
 *
 * @example
 * ```typescript
 * const breadcrumbs = buildCategoryBreadcrumbs({
 *   name: 'Colliers Or',
 *   handle: 'colliers-or',
 *   ancestor_names: ['Bijoux', 'Colliers'],
 *   ancestor_handles: ['bijoux', 'colliers'],
 * });
 * // Returns:
 * // [
 * //   { name: 'Bijoux', href: '/categorie/bijoux' },
 * //   { name: 'Colliers', href: '/categorie/bijoux/colliers' },
 * //   { name: 'Colliers Or', href: '/categorie/bijoux/colliers/colliers-or' },
 * // ]
 * ```
 */
export function buildCategoryBreadcrumbs(category: {
  name: string;
  handle: string;
  ancestor_names?: string[];
  ancestor_handles?: string[];
}): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];
  const ancestorNames = category.ancestor_names || [];
  const ancestorHandles = category.ancestor_handles || [];

  // Build ancestor breadcrumbs with cumulative paths
  let pathAccumulator = '';
  for (let i = 0; i < ancestorNames.length; i++) {
    pathAccumulator += (pathAccumulator ? '/' : '') + ancestorHandles[i];
    items.push({
      name: ancestorNames[i],
      href: `/categorie/${pathAccumulator}`,
    });
  }

  // Add current category
  pathAccumulator += (pathAccumulator ? '/' : '') + category.handle;
  items.push({
    name: category.name,
    href: `/categorie/${pathAccumulator}`,
  });

  return items;
}

/**
 * Build breadcrumb items from a product with its category
 */
export function buildProductBreadcrumbs(
  product: { name: string; handle: string },
  category?: {
    name: string;
    handle: string;
    ancestor_names?: string[];
    ancestor_handles?: string[];
  }
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];

  // Add category breadcrumbs if available
  if (category) {
    items.push(...buildCategoryBreadcrumbs(category));
  }

  // Add product as last item
  items.push({
    name: product.name,
    href: `/produit/${product.handle}`,
  });

  return items;
}

/**
 * Build simple breadcrumb items from path segments
 *
 * @example
 * ```typescript
 * const breadcrumbs = buildSimpleBreadcrumbs([
 *   { name: 'Marques', path: '/marques' },
 *   { name: 'Cartier', path: '/marques/cartier' },
 * ]);
 * ```
 */
export function buildSimpleBreadcrumbs(
  segments: Array<{ name: string; path: string }>
): BreadcrumbItem[] {
  return segments.map((segment) => ({
    name: segment.name,
    href: segment.path,
  }));
}

export default BreadcrumbSchema;
