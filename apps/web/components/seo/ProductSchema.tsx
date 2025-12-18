/**
 * Product JSON-LD Schema Component
 *
 * Renders structured data for product pages.
 * Optimized for e-commerce with complete Product schema.
 *
 * @see https://schema.org/Product
 * @see https://developers.google.com/search/docs/appearance/structured-data/product
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

export interface ProductSchemaOffer {
  /** Price amount */
  price: number;
  /** Currency code (ISO 4217) */
  currency?: string;
  /** Price valid until date */
  priceValidUntil?: string;
  /** Availability status */
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'LimitedAvailability' | 'SoldOut';
  /** Minimum order quantity */
  minQuantity?: number;
  /** Eligible regions (country codes) */
  eligibleRegion?: string[];
  /** Item condition */
  itemCondition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
  /** Delivery time (e.g., "3-5 business days") */
  deliveryLeadTime?: string;
}

export interface ProductSchemaProps {
  /** Product identifier */
  id: string;
  /** Product name/title */
  name: string;
  /** URL-friendly handle/slug */
  handle: string;
  /** Full description */
  description?: string | null;
  /** Short description */
  shortDescription?: string | null;
  /** Primary image URL */
  imageUrl?: string | null;
  /** Additional image URLs */
  images?: string[];
  /** Brand/manufacturer name */
  brand?: string | null;
  /** Product SKU */
  sku?: string | null;
  /** GTIN (EAN, UPC, ISBN) */
  gtin?: string | null;
  /** MPN (Manufacturer Part Number) */
  mpn?: string | null;
  /** Product category path */
  category?: string | null;
  /** Category breadcrumbs */
  categoryBreadcrumbs?: Array<{ name: string; handle: string }>;
  /** Material (e.g., "Gold", "Silver", "Platinum") */
  material?: string | null;
  /** Color */
  color?: string | null;
  /** Weight in grams */
  weight?: number | null;
  /** Offer/pricing information */
  offers?: ProductSchemaOffer[];
  /** Average rating (1-5) */
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  /** Product reviews */
  reviews?: Array<{
    author: string;
    datePublished: string;
    reviewBody: string;
    ratingValue: number;
  }>;
}

// ============================================================================
// Helpers
// ============================================================================

function mapAvailability(availability?: string): string {
  const map: Record<string, string> = {
    InStock: 'https://schema.org/InStock',
    OutOfStock: 'https://schema.org/OutOfStock',
    PreOrder: 'https://schema.org/PreOrder',
    LimitedAvailability: 'https://schema.org/LimitedAvailability',
    SoldOut: 'https://schema.org/SoldOut',
  };
  return map[availability || 'InStock'] || 'https://schema.org/InStock';
}

function mapItemCondition(condition?: string): string {
  const map: Record<string, string> = {
    NewCondition: 'https://schema.org/NewCondition',
    UsedCondition: 'https://schema.org/UsedCondition',
    RefurbishedCondition: 'https://schema.org/RefurbishedCondition',
  };
  return map[condition || 'NewCondition'] || 'https://schema.org/NewCondition';
}

// ============================================================================
// Component
// ============================================================================

export function ProductSchema({
  id,
  name,
  handle,
  description,
  shortDescription,
  imageUrl,
  images = [],
  brand,
  sku,
  gtin,
  mpn,
  category,
  categoryBreadcrumbs,
  material,
  color,
  weight,
  offers = [],
  aggregateRating,
  reviews = [],
}: ProductSchemaProps) {
  const productUrl = `${SITE_URL}/produit/${handle}`;
  const allImages = [imageUrl, ...images].filter((img): img is string => Boolean(img));

  // Build offers array for schema
  const schemaOffers =
    offers.length > 0
      ? offers.map((offer, index) => ({
          '@type': 'Offer',
          '@id': `${productUrl}/#offer-${index}`,
          price: offer.price,
          priceCurrency: offer.currency || 'EUR',
          priceValidUntil:
            offer.priceValidUntil ||
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          availability: mapAvailability(offer.availability),
          itemCondition: mapItemCondition(offer.itemCondition),
          url: productUrl,
          seller: {
            '@id': `${SITE_URL}/#organization`,
          },
          ...(offer.minQuantity && { eligibleQuantity: { '@type': 'QuantitativeValue', minValue: offer.minQuantity } }),
          ...(offer.eligibleRegion &&
            offer.eligibleRegion.length > 0 && {
              eligibleRegion: offer.eligibleRegion.map((code) => ({
                '@type': 'Country',
                name: code,
              })),
            }),
          ...(offer.deliveryLeadTime && {
            shippingDetails: {
              '@type': 'OfferShippingDetails',
              deliveryTime: {
                '@type': 'ShippingDeliveryTime',
                handlingTime: {
                  '@type': 'QuantitativeValue',
                  minValue: 1,
                  maxValue: 3,
                  unitCode: 'DAY',
                },
                transitTime: {
                  '@type': 'QuantitativeValue',
                  minValue: 2,
                  maxValue: 5,
                  unitCode: 'DAY',
                },
              },
            },
          }),
        }))
      : undefined;

  // Build product schema
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}/#product`,
    name,
    url: productUrl,
    description: description || shortDescription || `${name} - Disponible chez WebexpR Pro`,
    ...(allImages.length > 0 && { image: allImages }),
    ...(brand && {
      brand: {
        '@type': 'Brand',
        name: brand,
      },
    }),
    ...(sku && { sku }),
    ...(gtin && { gtin13: gtin }),
    ...(mpn && { mpn }),
    ...(category && { category }),
    ...(material && { material }),
    ...(color && { color }),
    ...(weight && {
      weight: {
        '@type': 'QuantitativeValue',
        value: weight,
        unitCode: 'GRM',
      },
    }),
    ...(schemaOffers && {
      offers:
        schemaOffers.length === 1
          ? schemaOffers[0]
          : {
              '@type': 'AggregateOffer',
              offerCount: schemaOffers.length,
              lowPrice: Math.min(...offers.map((o) => o.price)),
              highPrice: Math.max(...offers.map((o) => o.price)),
              priceCurrency: offers[0]?.currency || 'EUR',
              offers: schemaOffers,
            },
    }),
    ...(aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: aggregateRating.ratingValue,
        reviewCount: aggregateRating.reviewCount,
        bestRating: aggregateRating.bestRating || 5,
        worstRating: aggregateRating.worstRating || 1,
      },
    }),
    ...(reviews.length > 0 && {
      review: reviews.map((review) => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.author,
        },
        datePublished: review.datePublished,
        reviewBody: review.reviewBody,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.ratingValue,
          bestRating: 5,
          worstRating: 1,
        },
      })),
    }),
    // Link to organization
    isRelatedTo: {
      '@id': `${SITE_URL}/#organization`,
    },
  };

  // Build breadcrumb schema if category breadcrumbs provided
  const breadcrumbSchema = categoryBreadcrumbs
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        '@id': `${productUrl}/#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Accueil',
            item: SITE_URL,
          },
          ...categoryBreadcrumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 2,
            name: crumb.name,
            item: `${SITE_URL}/categorie/${crumb.handle}`,
          })),
          {
            '@type': 'ListItem',
            position: categoryBreadcrumbs.length + 2,
            name,
            item: productUrl,
          },
        ],
      }
    : null;

  return (
    <>
      <Script
        id={`product-schema-${id}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {breadcrumbSchema && (
        <Script
          id={`product-breadcrumb-schema-${id}`}
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
    </>
  );
}

export default ProductSchema;
