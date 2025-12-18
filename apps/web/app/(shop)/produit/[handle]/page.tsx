import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getMedusaClient, type MedusaProduct } from '@/lib/medusa/client';
import {
  adaptMedusaProduct,
  adaptProductImages,
  getVariantImagesMap,
} from '@/lib/medusa/adapters';
import { Container, Skeleton } from '@/components/ui';
import { ProductDetailClient } from './ProductDetailClient';
import type { Product } from '@/types';

/**
 * Product Detail Page (Fiche Produit)
 *
 * Server Component that fetches product data from Medusa
 * and renders the product detail view with:
 * - Product gallery with zoom and lightbox
 * - Product info (name, reference, brand, description)
 * - Pricing with B2B features
 * - Add to cart with quantity selector
 * - Related products carousel
 *
 * Uses handle-based routing for SEO-friendly URLs.
 */

// ============================================================================
// Types
// ============================================================================

interface PageProps {
  params: Promise<{
    handle: string;
  }>;
}

// ============================================================================
// Constants
// ============================================================================

const SITE_NAME = 'WebexpR Pro B2B';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://webexpr-pro.com';

// ============================================================================
// Metadata
// ============================================================================

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const client = getMedusaClient();
  const medusaProduct = await client.getProductByHandle(handle);

  if (!medusaProduct) {
    return {
      title: `Produit non trouve | ${SITE_NAME}`,
      robots: { index: false, follow: false },
    };
  }

  const product = adaptMedusaProduct(medusaProduct);
  const productUrl = `${BASE_URL}/produit/${product.slug}`;

  // Build optimized title with brand and category
  const titleParts = [product.name];
  if (product.brand) titleParts.push(product.brand);
  if (product.category?.name) titleParts.push(product.category.name);
  titleParts.push(SITE_NAME);
  const fullTitle = titleParts.slice(0, 3).join(' | ');

  // Build meta description (140-160 chars ideal)
  const description = buildMetaDescription(product, medusaProduct);

  // Extract keywords from product data
  const keywords = buildKeywords(product, medusaProduct);

  // Get price info for SEO
  const priceInfo = getPriceInfo(medusaProduct);

  // Primary product image
  const primaryImage = product.images?.[0] || `${BASE_URL}/images/placeholder-product.svg`;
  const allImages = product.images?.slice(0, 4) || [];

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),

    // Canonical URL
    alternates: {
      canonical: productUrl,
    },

    // Open Graph - Product type
    openGraph: {
      title: product.name,
      description,
      url: productUrl,
      siteName: SITE_NAME,
      locale: 'fr_FR',
      type: 'website', // Note: og:product requires custom tags, using website
      images: allImages.map((img, index) => ({
        url: img,
        width: 800,
        height: 800,
        alt: index === 0 ? product.name : `${product.name} - Image ${index + 1}`,
      })),
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: [primaryImage],
    },

    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Additional SEO
    other: {
      // Product-specific meta tags
      'product:price:amount': priceInfo.amount,
      'product:price:currency': 'EUR',
      'product:availability': priceInfo.inStock ? 'in stock' : 'out of stock',
      ...(product.brand && { 'product:brand': product.brand }),
      ...(product.reference && { 'product:retailer_item_id': product.reference }),
    },
  };
}

/**
 * Build optimized meta description
 */
function buildMetaDescription(product: Product, medusaProduct: MedusaProduct): string {
  const parts: string[] = [];

  // Start with short description if available
  if (product.shortDescription) {
    parts.push(product.shortDescription);
  }

  // Add brand
  if (product.brand) {
    parts.push(`Marque ${product.brand}`);
  }

  // Add category
  if (product.category?.name) {
    parts.push(product.category.name);
  }

  // Add material if available
  if (medusaProduct.material) {
    parts.push(medusaProduct.material);
  }

  // Build description
  let description = parts.join('. ');

  // Fallback to product description
  if (!description && product.description) {
    description = product.description;
  }

  // Add B2B call to action
  const suffix = ' - Grossiste bijoux B2B. Prix professionnels.';

  // Truncate to 155 chars (leaving room for suffix)
  const maxLength = 155 - suffix.length;
  if (description.length > maxLength) {
    description = description.substring(0, maxLength - 3) + '...';
  }

  return description + suffix;
}

/**
 * Build SEO keywords from product data
 */
function buildKeywords(product: Product, medusaProduct: MedusaProduct): string[] {
  const keywords = new Set<string>();

  // Product name words
  product.name.split(' ').forEach(word => {
    if (word.length > 3) keywords.add(word.toLowerCase());
  });

  // Brand
  if (product.brand) keywords.add(product.brand.toLowerCase());

  // Category
  if (product.category?.name) {
    keywords.add(product.category.name.toLowerCase());
  }

  // Material
  if (medusaProduct.material) {
    keywords.add(medusaProduct.material.toLowerCase());
  }

  // Tags
  medusaProduct.tags?.forEach(tag => {
    keywords.add(tag.value.toLowerCase());
  });

  // Add general B2B jewelry keywords
  keywords.add('bijoux');
  keywords.add('grossiste');
  keywords.add('b2b');
  keywords.add('professionnel');

  return Array.from(keywords).slice(0, 15);
}

/**
 * Get price info for meta tags
 */
function getPriceInfo(medusaProduct: MedusaProduct): { amount: string; inStock: boolean } {
  const lowestPrice = medusaProduct.variants?.reduce((min, variant) => {
    const eurPrice = variant.prices?.find(p =>
      p.currency_code === 'eur' || p.currency_code === 'EUR'
    );
    const amount = eurPrice ? eurPrice.amount / 100 : Infinity;
    return Math.min(min, amount);
  }, Infinity) || 0;

  const totalStock = medusaProduct.variants?.reduce(
    (sum, v) => sum + (v.inventory_quantity || 0),
    0
  ) || 0;

  return {
    amount: lowestPrice !== Infinity ? lowestPrice.toFixed(2) : '0.00',
    inStock: totalStock > 0,
  };
}

// ============================================================================
// JSON-LD Structured Data
// ============================================================================

interface ProductJsonLdProps {
  product: Product;
  medusaProduct: MedusaProduct;
}

function ProductJsonLd({ product, medusaProduct }: ProductJsonLdProps) {
  const priceInfo = getPriceInfo(medusaProduct);
  const productUrl = `${BASE_URL}/produit/${product.slug}`;

  // Determine availability
  const availability = priceInfo.inStock
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';

  // Get highest price for price range
  const highestPrice = medusaProduct.variants?.reduce((max, variant) => {
    const eurPrice = variant.prices?.find(p =>
      p.currency_code === 'eur' || p.currency_code === 'EUR'
    );
    const amount = eurPrice ? eurPrice.amount / 100 : 0;
    return Math.max(max, amount);
  }, 0) || 0;

  // Build offers based on variants
  const hasMultipleVariants = medusaProduct.variants && medusaProduct.variants.length > 1;
  const lowestPrice = parseFloat(priceInfo.amount);

  // Main JSON-LD
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description || undefined,
    image: product.images || undefined,
    sku: product.reference || medusaProduct.variants?.[0]?.sku || undefined,
    mpn: product.reference || undefined,
    gtin: medusaProduct.variants?.[0]?.barcode || medusaProduct.variants?.[0]?.ean || undefined,
    brand: product.brand ? {
      '@type': 'Brand',
      name: product.brand,
    } : undefined,
    category: product.category?.name,
    url: productUrl,
    // Material from Medusa
    ...(medusaProduct.material && { material: medusaProduct.material }),
    // Weight if available
    ...(medusaProduct.weight && {
      weight: {
        '@type': 'QuantitativeValue',
        value: medusaProduct.weight,
        unitCode: 'GRM', // Grams
      },
    }),
    // Offers
    offers: hasMultipleVariants && highestPrice > lowestPrice
      ? {
          '@type': 'AggregateOffer',
          url: productUrl,
          priceCurrency: 'EUR',
          lowPrice: lowestPrice.toFixed(2),
          highPrice: highestPrice.toFixed(2),
          offerCount: medusaProduct.variants?.length || 1,
          availability,
          seller: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: BASE_URL,
          },
        }
      : {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'EUR',
          price: lowestPrice > 0 ? lowestPrice.toFixed(2) : undefined,
          availability,
          priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
          seller: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: BASE_URL,
          },
          // B2B specific: business customer eligibility
          eligibleCustomerType: 'https://schema.org/Business',
        },
  };

  // Add variants as hasVariant if multiple
  if (hasMultipleVariants) {
    jsonLd.hasVariant = medusaProduct.variants?.map(variant => {
      const eurPrice = variant.prices?.find(p =>
        p.currency_code === 'eur' || p.currency_code === 'EUR'
      );
      return {
        '@type': 'Product',
        name: `${product.name} - ${variant.title}`,
        sku: variant.sku || undefined,
        ...(variant.barcode && { gtin: variant.barcode }),
        offers: {
          '@type': 'Offer',
          priceCurrency: 'EUR',
          price: eurPrice ? (eurPrice.amount / 100).toFixed(2) : undefined,
          availability: variant.inventory_quantity > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        },
      };
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ============================================================================
// Breadcrumb JSON-LD
// ============================================================================

function BreadcrumbJsonLd({ product }: { product: Product }) {

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: BASE_URL,
      },
      ...(product.category ? [{
        '@type': 'ListItem',
        position: 2,
        name: product.category.name,
        item: `${BASE_URL}/c/${product.category.slug}`,
      }] : []),
      {
        '@type': 'ListItem',
        position: product.category ? 3 : 2,
        name: product.name,
        item: `${BASE_URL}/produit/${product.slug}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ============================================================================
// Loading Component
// ============================================================================

function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-white py-8">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery Skeleton */}
          <div className="space-y-4">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-md" />
              ))}
            </div>
          </div>

          {/* Info Skeleton */}
          <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>

            {/* Brand */}
            <Skeleton className="h-4 w-24" />

            {/* Title */}
            <Skeleton className="h-10 w-3/4" />

            {/* Reference */}
            <Skeleton className="h-4 w-32" />

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Price */}
            <Skeleton className="h-12 w-40" />

            {/* Stock */}
            <Skeleton className="h-10 w-full rounded-lg" />

            {/* Quantity */}
            <div className="flex gap-4">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 flex-1" />
            </div>

            {/* Add to cart */}
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        </div>

        {/* Related products skeleton */}
        <div className="mt-16">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-60">
                <Skeleton className="aspect-square rounded-lg mb-3" />
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

// ============================================================================
// Data Fetching
// ============================================================================

async function getProductData(handle: string) {
  const client = getMedusaClient();

  // Fetch product by handle
  const medusaProduct = await client.getProductByHandle(handle);

  if (!medusaProduct) {
    return null;
  }

  // Fetch full category hierarchy with ancestors for breadcrumbs
  let categoryWithAncestors = null;
  if (medusaProduct.categories && medusaProduct.categories.length > 0) {
    categoryWithAncestors = await client.getCategoryWithAncestors(
      medusaProduct.categories[0].id
    );
  }

  // Fetch all related products (similar + complementary)
  const { similar, complementary } = await client.getAllRelatedProducts(medusaProduct, {
    similarLimit: 8,
    complementaryLimit: 4,
  });

  // Convert to app types
  const product = adaptMedusaProduct(medusaProduct);
  const galleryMedia = adaptProductImages(medusaProduct);
  const variantImagesMap = getVariantImagesMap(medusaProduct);
  const relatedProducts = similar.map(adaptMedusaProduct);
  const complementaryProducts = complementary.map(adaptMedusaProduct);

  return {
    product,
    medusaProduct,
    categoryWithAncestors,
    galleryMedia,
    variantImagesMap,
    relatedProducts,
    complementaryProducts,
  };
}

// ============================================================================
// Page Component
// ============================================================================

export default async function ProductDetailPage({ params }: PageProps) {
  const { handle } = await params;
  const data = await getProductData(handle);

  if (!data) {
    notFound();
  }

  const {
    product,
    medusaProduct,
    categoryWithAncestors,
    galleryMedia,
    variantImagesMap,
    relatedProducts,
    complementaryProducts,
  } = data;

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <ProductJsonLd product={product} medusaProduct={medusaProduct} />
      <BreadcrumbJsonLd product={product} />

      {/* Header spacer for fixed header */}
      <div className="h-20" />

      <Suspense fallback={<ProductDetailLoading />}>
        <ProductDetailClient
          product={product}
          medusaProduct={medusaProduct}
          categoryWithAncestors={categoryWithAncestors}
          galleryMedia={galleryMedia}
          variantImagesMap={variantImagesMap}
          relatedProducts={relatedProducts}
          complementaryProducts={complementaryProducts}
        />
      </Suspense>
    </>
  );
}
