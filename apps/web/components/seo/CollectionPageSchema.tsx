/**
 * CollectionPage JSON-LD Schema Component
 *
 * Renders structured data for collection/category pages.
 * Includes ItemList for product listings.
 *
 * @see https://schema.org/CollectionPage
 * @see https://schema.org/ItemList
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

export interface CollectionProduct {
  /** Product identifier */
  id: string;
  /** Product name */
  name: string;
  /** URL-friendly handle */
  handle: string;
  /** Product image URL */
  imageUrl?: string | null;
  /** Product price */
  price?: number;
  /** Currency code */
  currency?: string;
  /** Product availability */
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
}

export interface CollectionPageSchemaProps {
  /** Page identifier */
  id: string;
  /** Collection/category name */
  name: string;
  /** Collection description */
  description?: string | null;
  /** Page URL path */
  url: string;
  /** Collection image URL */
  imageUrl?: string | null;
  /** Total number of items in the collection */
  totalItems?: number;
  /** Products to include in ItemList (first page) */
  products?: CollectionProduct[];
  /** Breadcrumb items for navigation */
  breadcrumbs?: Array<{ name: string; href: string }>;
  /** Parent collection (for subcategories) */
  parentCollection?: {
    name: string;
    url: string;
  };
  /** Collection type (for different schema variations) */
  collectionType?: 'category' | 'brand' | 'search' | 'custom';
}

// ============================================================================
// Helpers
// ============================================================================

function normalizeUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`;
}

function mapAvailability(availability?: string): string {
  const map: Record<string, string> = {
    InStock: 'https://schema.org/InStock',
    OutOfStock: 'https://schema.org/OutOfStock',
    PreOrder: 'https://schema.org/PreOrder',
  };
  return map[availability || 'InStock'] || 'https://schema.org/InStock';
}

// ============================================================================
// Component
// ============================================================================

export function CollectionPageSchema({
  id,
  name,
  description,
  url,
  imageUrl,
  totalItems,
  products = [],
  breadcrumbs = [],
  parentCollection,
  collectionType = 'category',
}: CollectionPageSchemaProps) {
  const fullUrl = normalizeUrl(url);

  // CollectionPage schema
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${fullUrl}/#collection`,
    name,
    url: fullUrl,
    ...(description && { description }),
    ...(imageUrl && { image: imageUrl }),
    ...(totalItems !== undefined && { numberOfItems: totalItems }),
    isPartOf: {
      '@id': `${SITE_URL}/#website`,
    },
    ...(parentCollection && {
      isPartOf: {
        '@type': 'CollectionPage',
        name: parentCollection.name,
        url: normalizeUrl(parentCollection.url),
      },
    }),
    // Publisher reference
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    // Main entity is the ItemList
    ...(products.length > 0 && {
      mainEntity: {
        '@id': `${fullUrl}/#itemlist`,
      },
    }),
  };

  // ItemList schema for products
  const itemListSchema =
    products.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          '@id': `${fullUrl}/#itemlist`,
          name: `Produits - ${name}`,
          description: `Liste des produits dans la collection ${name}`,
          numberOfItems: totalItems || products.length,
          itemListElement: products.map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Product',
              '@id': `${SITE_URL}/produit/${product.handle}/#product`,
              name: product.name,
              url: `${SITE_URL}/produit/${product.handle}`,
              ...(product.imageUrl && { image: product.imageUrl }),
              ...(product.price !== undefined && {
                offers: {
                  '@type': 'Offer',
                  price: product.price,
                  priceCurrency: product.currency || 'EUR',
                  availability: mapAvailability(product.availability),
                  seller: {
                    '@id': `${SITE_URL}/#organization`,
                  },
                },
              }),
            },
          })),
        }
      : null;

  // Breadcrumb schema
  const breadcrumbSchema =
    breadcrumbs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          '@id': `${fullUrl}/#breadcrumb`,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Accueil',
              item: SITE_URL,
            },
            ...breadcrumbs.map((crumb, index) => ({
              '@type': 'ListItem',
              position: index + 2,
              name: crumb.name,
              item: normalizeUrl(crumb.href),
            })),
          ],
        }
      : null;

  return (
    <>
      <Script
        id={`collection-schema-${id}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      {itemListSchema && (
        <Script
          id={`itemlist-schema-${id}`}
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <Script
          id={`collection-breadcrumb-schema-${id}`}
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
    </>
  );
}

// ============================================================================
// Specialized Components
// ============================================================================

/**
 * CategoryPageSchema - Convenience wrapper for category pages
 */
export function CategoryPageSchema({
  category,
  products,
}: {
  category: {
    id: string;
    name: string;
    handle: string;
    description?: string | null;
    image_url?: string | null;
    product_count?: number;
    ancestor_names?: string[];
    ancestor_handles?: string[];
  };
  products?: CollectionProduct[];
}) {
  // Build URL from handle and ancestors
  const pathParts = [...(category.ancestor_handles || []), category.handle];
  const url = `/categorie/${pathParts.join('/')}`;

  // Build breadcrumbs
  const breadcrumbs: Array<{ name: string; href: string }> = [];
  let pathAccumulator = '';
  const ancestorNames = category.ancestor_names || [];
  const ancestorHandles = category.ancestor_handles || [];

  for (let i = 0; i < ancestorNames.length; i++) {
    pathAccumulator += (pathAccumulator ? '/' : '') + ancestorHandles[i];
    breadcrumbs.push({
      name: ancestorNames[i],
      href: `/categorie/${pathAccumulator}`,
    });
  }

  breadcrumbs.push({
    name: category.name,
    href: url,
  });

  return (
    <CollectionPageSchema
      id={category.id}
      name={category.name}
      description={category.description}
      url={url}
      imageUrl={category.image_url}
      totalItems={category.product_count}
      products={products}
      breadcrumbs={breadcrumbs}
      collectionType="category"
    />
  );
}

/**
 * SearchResultsSchema - For search results pages
 */
export function SearchResultsSchema({
  query,
  totalResults,
  products,
}: {
  query: string;
  totalResults: number;
  products?: CollectionProduct[];
}) {
  return (
    <CollectionPageSchema
      id={`search-${query}`}
      name={`Recherche: ${query}`}
      description={`Resultats de recherche pour "${query}" - ${totalResults} produits trouves`}
      url={`/recherche?q=${encodeURIComponent(query)}`}
      totalItems={totalResults}
      products={products}
      breadcrumbs={[{ name: 'Recherche', href: '/recherche' }]}
      collectionType="search"
    />
  );
}

export default CollectionPageSchema;
