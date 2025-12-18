/**
 * SEO Metadata Helpers
 *
 * Utility functions for generating Next.js Metadata objects
 * for different page types (products, categories, brands, etc.)
 *
 * @packageDocumentation
 */

import type { Metadata } from 'next';
import {
  getCanonicalUrl,
  getProductCanonicalUrl,
  getCategoryCanonicalUrl,
  getBrandCanonicalUrl,
  getAlternateUrls,
  isIndexablePath,
} from './canonical';

// ============================================================================
// Configuration
// ============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sage-portal.webexpr.dev';
const SITE_NAME = 'WebexpR Pro';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

// ============================================================================
// Types
// ============================================================================

export interface CategoryMetadataInput {
  id: string;
  name: string;
  handle: string;
  description?: string | null;
  image_url?: string | null;
  product_count?: number;
  ancestor_handles?: string[];
  ancestor_names?: string[];
  path?: string;
}

export interface BrandMetadataInput {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
  country?: string | null;
  product_count?: number;
}

export interface ProductMetadataInput {
  id: string;
  name: string;
  handle: string;
  description?: string | null;
  shortDescription?: string | null;
  imageUrl?: string | null;
  images?: string[];
  brand?: string | null;
  sku?: string | null;
  price?: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  category?: {
    name: string;
    handle: string;
    ancestor_handles?: string[];
  };
}

export interface CollectionMetadataInput {
  title: string;
  description?: string;
  path: string;
  imageUrl?: string | null;
  totalItems?: number;
  type?: 'category' | 'brand' | 'search' | 'custom';
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Truncate text to a maximum length, preserving words
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
}

/**
 * Clean and normalize description text
 */
function cleanDescription(text: string | null | undefined): string | undefined {
  if (!text) return undefined;

  return text
    .replace(/\s+/g, ' ')
    .replace(/<[^>]*>/g, '')
    .trim();
}

/**
 * Generate dynamic OG image URL
 */
function getOgImageUrl(
  type: 'product' | 'category' | 'brand',
  slug: string,
  imageUrl?: string | null
): string {
  // If we have a real image, use OG API to generate with branding
  if (imageUrl) {
    return `${SITE_URL}/api/og?type=${type}&slug=${encodeURIComponent(slug)}&image=${encodeURIComponent(imageUrl)}`;
  }

  // Fallback to default OG image
  return DEFAULT_OG_IMAGE;
}

// ============================================================================
// Metadata Generators
// ============================================================================

/**
 * Generate metadata for category pages
 *
 * @example
 * ```typescript
 * export async function generateMetadata({ params }) {
 *   const category = await getCategory(params.handle);
 *   return generateCategoryMetadata(category);
 * }
 * ```
 */
export function generateCategoryMetadata(category: CategoryMetadataInput): Metadata {
  const {
    name,
    handle,
    description,
    image_url,
    product_count,
    ancestor_handles = [],
    ancestor_names = [],
    path,
  } = category;

  const canonicalUrl = getCategoryCanonicalUrl(handle, ancestor_handles);
  const alternates = getAlternateUrls(`/categorie/${[...ancestor_handles, handle].join('/')}`);

  // Build breadcrumb path for title
  const fullPath = ancestor_names.length > 0 ? `${ancestor_names.join(' > ')} > ${name}` : name;

  // Generate title and description
  const title = `${name} - Bijoux Professionnels`;
  const metaDescription =
    cleanDescription(description) ||
    `Decouvrez notre selection de ${name.toLowerCase()} pour professionnels. ${product_count ? `${product_count} produits disponibles.` : ''} Livraison rapide, prix grossiste.`;

  // Keywords based on category
  const keywords = [
    name.toLowerCase(),
    `${name.toLowerCase()} professionnel`,
    `${name.toLowerCase()} grossiste`,
    `${name.toLowerCase()} b2b`,
    'bijoux professionnels',
    'grossiste bijoux',
    ...ancestor_names.map((n) => n.toLowerCase()),
  ];

  return {
    title,
    description: truncateText(metaDescription, 160),
    keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(alternates.map((alt) => [alt.hreflang, alt.href])),
    },
    openGraph: {
      title: `${name} | ${SITE_NAME}`,
      description: truncateText(metaDescription, 200),
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'fr_FR',
      images: [
        {
          url: getOgImageUrl('category', handle, image_url),
          width: 1200,
          height: 630,
          alt: `${name} - Collection ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} | ${SITE_NAME}`,
      description: truncateText(metaDescription, 200),
      images: [getOgImageUrl('category', handle, image_url)],
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
    other: {
      'product:category': fullPath || name,
      ...(product_count && { 'product:availability': 'in stock' }),
    },
  };
}

/**
 * Generate metadata for brand pages
 *
 * @example
 * ```typescript
 * export async function generateMetadata({ params }) {
 *   const brand = await getBrand(params.slug);
 *   return generateBrandMetadata(brand);
 * }
 * ```
 */
export function generateBrandMetadata(brand: BrandMetadataInput): Metadata {
  const { name, slug, description, logo_url, country, product_count } = brand;

  const canonicalUrl = getBrandCanonicalUrl(slug);
  const alternates = getAlternateUrls(`/marques/${slug}`);

  // Generate title and description
  const title = `${name} - Bijoux de Marque`;
  const countryText = country ? ` Marque ${country}.` : '';
  const metaDescription =
    cleanDescription(description) ||
    `Tous les bijoux ${name} disponibles chez ${SITE_NAME}.${countryText} ${product_count ? `${product_count} pieces en stock.` : ''} Commande B2B, prix professionnels.`;

  // Keywords
  const keywords = [
    name.toLowerCase(),
    `bijoux ${name.toLowerCase()}`,
    `${name.toLowerCase()} professionnel`,
    `grossiste ${name.toLowerCase()}`,
    'marque bijoux',
    'bijoux de luxe',
    ...(country ? [country.toLowerCase()] : []),
  ];

  return {
    title,
    description: truncateText(metaDescription, 160),
    keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(alternates.map((alt) => [alt.hreflang, alt.href])),
    },
    openGraph: {
      title: `${name} | ${SITE_NAME}`,
      description: truncateText(metaDescription, 200),
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'fr_FR',
      images: [
        {
          url: getOgImageUrl('brand', slug, logo_url),
          width: 1200,
          height: 630,
          alt: `${name} - ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} | ${SITE_NAME}`,
      description: truncateText(metaDescription, 200),
      images: [getOgImageUrl('brand', slug, logo_url)],
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
    other: {
      'brand:name': name,
      ...(country && { 'brand:country': country }),
      ...(product_count && { 'product:availability': 'in stock' }),
    },
  };
}

/**
 * Generate metadata for product pages
 *
 * @example
 * ```typescript
 * export async function generateMetadata({ params }) {
 *   const product = await getProduct(params.handle);
 *   return generateProductMetadata(product);
 * }
 * ```
 */
export function generateProductMetadata(product: ProductMetadataInput): Metadata {
  const {
    name,
    handle,
    description,
    shortDescription,
    imageUrl,
    images = [],
    brand,
    sku,
    price,
    currency = 'EUR',
    availability = 'InStock',
    category,
  } = product;

  const canonicalUrl = getProductCanonicalUrl(handle);
  const alternates = getAlternateUrls(`/produit/${handle}`);

  // Generate title and description
  const brandPrefix = brand ? `${brand} - ` : '';
  const title = `${brandPrefix}${name}`;
  const metaDescription =
    cleanDescription(shortDescription) ||
    cleanDescription(description) ||
    `${name}${brand ? ` de ${brand}` : ''} disponible chez ${SITE_NAME}. Commandez en ligne, livraison rapide, prix professionnel B2B.`;

  // Keywords
  const keywords = [
    name.toLowerCase(),
    ...(brand ? [brand.toLowerCase(), `${brand.toLowerCase()} bijoux`] : []),
    ...(category ? [category.name.toLowerCase()] : []),
    'bijoux professionnel',
    'grossiste bijoux',
    'b2b bijoux',
  ];

  // All product images
  const allImages = [imageUrl, ...images].filter((img): img is string => Boolean(img));

  // Availability mapping for meta tags
  const availabilityMap: Record<string, string> = {
    InStock: 'in stock',
    OutOfStock: 'out of stock',
    PreOrder: 'preorder',
  };

  return {
    title,
    description: truncateText(metaDescription, 160),
    keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(alternates.map((alt) => [alt.hreflang, alt.href])),
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description: truncateText(metaDescription, 200),
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: 'website', // Note: 'product' type requires additional validation
      locale: 'fr_FR',
      images: allImages.length > 0
        ? allImages.map((img, i) => ({
            url: img,
            width: 1200,
            height: 1200,
            alt: i === 0 ? name : `${name} - Image ${i + 1}`,
          }))
        : [
            {
              url: getOgImageUrl('product', handle, imageUrl),
              width: 1200,
              height: 630,
              alt: name,
            },
          ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description: truncateText(metaDescription, 200),
      images: allImages.length > 0 ? [allImages[0]] : [getOgImageUrl('product', handle, imageUrl)],
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    other: {
      // Product meta tags (not OpenGraph namespace)
      'product:brand': brand || SITE_NAME,
      'product:availability': availabilityMap[availability] || 'in stock',
      'product:condition': 'new',
      ...(sku && { 'product:retailer_item_id': sku }),
      ...(price && { 'product:price:amount': String(price) }),
      ...(price && { 'product:price:currency': currency }),
      ...(category && { 'product:category': category.name }),
    },
  };
}

/**
 * Generate metadata for collection/listing pages
 *
 * @example
 * ```typescript
 * export async function generateMetadata() {
 *   return generateCollectionMetadata({
 *     title: 'Nouvelles Arrivees',
 *     description: 'Decouvrez nos derniers bijoux',
 *     path: '/nouveautes',
 *     totalItems: 150
 *   });
 * }
 * ```
 */
export function generateCollectionMetadata(input: CollectionMetadataInput): Metadata {
  const { title, description, path, imageUrl, totalItems, type = 'custom' } = input;

  const canonicalUrl = getCanonicalUrl(path);
  const alternates = getAlternateUrls(path);
  const isIndexable = isIndexablePath(path);

  const metaDescription =
    description ||
    `${title} - Decouvrez notre selection chez ${SITE_NAME}. ${totalItems ? `${totalItems} produits disponibles.` : ''} Prix professionnels B2B.`;

  return {
    title: `${title} | ${SITE_NAME}`,
    description: truncateText(metaDescription, 160),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(alternates.map((alt) => [alt.hreflang, alt.href])),
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description: truncateText(metaDescription, 200),
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'fr_FR',
      images: [
        {
          url: imageUrl || DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description: truncateText(metaDescription, 200),
      images: [imageUrl || DEFAULT_OG_IMAGE],
    },
    robots: {
      index: isIndexable,
      follow: isIndexable,
      ...(isIndexable && {
        'max-image-preview': 'large',
        'max-snippet': -1,
      }),
    },
  };
}

/**
 * Generate metadata for search results pages
 */
export function generateSearchMetadata(query: string, totalResults?: number): Metadata {
  const title = query ? `Recherche: ${query}` : 'Recherche';
  const description = query
    ? `Resultats de recherche pour "${query}"${totalResults ? ` - ${totalResults} produits trouves` : ''} sur ${SITE_NAME}.`
    : `Recherchez parmi notre catalogue de bijoux professionnels sur ${SITE_NAME}.`;

  return generateCollectionMetadata({
    title,
    description,
    path: query ? `/recherche?q=${encodeURIComponent(query)}` : '/recherche',
    totalItems: totalResults,
    type: 'search',
  });
}

// ============================================================================
// Default Metadata
// ============================================================================

/**
 * Base metadata for the entire site (to be used in root layout)
 */
export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Grossiste Bijoux B2B`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Plateforme B2B professionnelle pour grossistes en bijoux. Large selection de colliers, bagues, bracelets et montres de luxe. Prix professionnels, livraison rapide.',
  keywords: [
    'grossiste bijoux',
    'bijoux b2b',
    'bijoux professionnels',
    'fournisseur bijoux',
    'bijoux en gros',
    'bijoux de luxe',
    'colliers',
    'bagues',
    'bracelets',
    'montres',
    'joaillerie',
    'horlogerie',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'fr-FR': SITE_URL,
      'x-default': SITE_URL,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Grossiste Bijoux B2B`,
    description:
      'Plateforme B2B professionnelle pour grossistes en bijoux. Prix professionnels, livraison rapide.',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Grossiste Bijoux B2B`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | Grossiste Bijoux B2B`,
    description:
      'Plateforme B2B professionnelle pour grossistes en bijoux. Prix professionnels, livraison rapide.',
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  category: 'ecommerce',
};
