/**
 * Brand JSON-LD Schema Component
 *
 * Renders structured data for brand/manufacturer pages.
 * Uses Brand or Organization schema depending on the brand type.
 *
 * @see https://schema.org/Brand
 * @see https://schema.org/Organization
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

export interface BrandSchemaProps {
  /** Brand identifier */
  id: string;
  /** Brand name */
  name: string;
  /** URL-friendly slug */
  slug: string;
  /** Brand description */
  description?: string | null;
  /** Logo URL */
  logoUrl?: string | null;
  /** Website URL (brand's official site) */
  websiteUrl?: string | null;
  /** Country of origin */
  country?: string | null;
  /** Year the brand was founded */
  foundedYear?: number | null;
  /** Number of products available */
  productCount?: number;
  /** Social media URLs */
  socialUrls?: string[];
  /** Same as URLs (Wikipedia, etc.) */
  sameAs?: string[];
}

// ============================================================================
// Component
// ============================================================================

export function BrandSchema({
  id,
  name,
  slug,
  description,
  logoUrl,
  websiteUrl,
  country,
  foundedYear,
  productCount,
  socialUrls = [],
  sameAs = [],
}: BrandSchemaProps) {
  const brandPageUrl = `${SITE_URL}/marques/${slug}`;

  // Combine social URLs and sameAs for schema
  const allSameAs = [
    ...(websiteUrl ? [websiteUrl] : []),
    ...socialUrls,
    ...sameAs,
  ].filter(Boolean);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    '@id': `${brandPageUrl}/#brand`,
    name,
    url: brandPageUrl,
    ...(description && { description }),
    ...(logoUrl && {
      logo: {
        '@type': 'ImageObject',
        url: logoUrl,
        contentUrl: logoUrl,
      },
      image: logoUrl,
    }),
    ...(allSameAs.length > 0 && { sameAs: allSameAs }),
    // Aggregate offer for product count
    ...(productCount !== undefined &&
      productCount > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          itemReviewed: {
            '@type': 'Brand',
            name,
          },
        },
        makesOffer: {
          '@type': 'AggregateOffer',
          offerCount: productCount,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          seller: {
            '@id': `${SITE_URL}/#organization`,
          },
        },
      }),
    // Additional organization-like properties
    ...(foundedYear && { foundingDate: String(foundedYear) }),
    ...(country && {
      foundingLocation: {
        '@type': 'Country',
        name: country,
      },
    }),
  };

  // Also add a CollectionPage schema for the brand page itself
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': brandPageUrl,
    name: `${name} - Tous les produits`,
    description: description || `Decouvrez tous les produits ${name} disponibles chez WebexpR Pro.`,
    url: brandPageUrl,
    isPartOf: {
      '@id': `${SITE_URL}/#website`,
    },
    about: {
      '@id': `${brandPageUrl}/#brand`,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Accueil',
          item: SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Marques',
          item: `${SITE_URL}/marques`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name,
          item: brandPageUrl,
        },
      ],
    },
    ...(productCount !== undefined && {
      numberOfItems: productCount,
    }),
  };

  return (
    <>
      <Script
        id={`brand-schema-${id}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Script
        id={`brand-collection-schema-${id}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
    </>
  );
}

export default BrandSchema;
