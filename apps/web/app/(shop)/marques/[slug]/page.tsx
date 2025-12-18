import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Container, Skeleton } from '@/components/ui';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BrandHero, BrandCard } from '@/components/brands';
import { BrandProductsSection, BrandProductsSectionLoading } from '@/components/brands/BrandProductsSection';
import { getServerBrand, getServerBrands } from '@/lib/brands/server';

/**
 * Brand Detail Page (Tremplin)
 *
 * Server Component that displays a single brand with:
 * - Hero section with brand info
 * - Breadcrumb navigation
 * - Product grid with server-side pagination and filters
 * - Related/popular brands section
 * - SEO metadata and structured data
 */

// ============================================================================
// Types
// ============================================================================

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
  }>;
}

// ============================================================================
// Metadata
// ============================================================================

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getServerBrand(slug);

  if (!brand) {
    return {
      title: 'Marque introuvable | WebexpR Pro B2B',
      robots: { index: false },
    };
  }

  const description =
    brand.description ||
    `Decouvrez les produits de la marque ${brand.name}. Bijoux professionnels B2B de haute qualite.`;

  return {
    title: `${brand.name} | Nos Marques | WebexpR Pro B2B`,
    description,
    openGraph: {
      title: brand.name,
      description,
      type: 'website',
      images: brand.logo_url ? [{ url: brand.logo_url, alt: brand.name }] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `/marques/${slug}`,
    },
  };
}

// ============================================================================
// JSON-LD Structured Data
// ============================================================================

function BrandJsonLd({ brand }: { brand: NonNullable<Awaited<ReturnType<typeof getServerBrand>>> }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: brand.name,
    description: brand.description || undefined,
    logo: brand.logo_url || undefined,
    url: brand.website_url || undefined,
    // If we have country, add it as a location
    ...(brand.country && {
      address: {
        '@type': 'PostalAddress',
        addressCountry: brand.country,
      },
    }),
    // If we have founded year, add it
    ...(brand.founded_year && {
      foundingDate: String(brand.founded_year),
    }),
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

function BrandPageLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-b from-neutral-50 to-white py-12 lg:py-16 border-b border-neutral-200">
        <Container>
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
            <Skeleton className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl" />
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
                <Skeleton className="h-6 w-32 rounded-full" />
              </div>
              <Skeleton className="h-10 w-64 mx-auto lg:mx-0 mb-4" />
              <Skeleton className="h-5 w-full max-w-2xl mb-6" />
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 lg:gap-6 mb-6">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-28" />
              </div>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <Skeleton className="h-12 w-44" />
                <Skeleton className="h-12 w-36" />
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Products section skeleton */}
      <Container className="py-8 lg:py-12">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <BrandProductsSectionLoading />
      </Container>
    </div>
  );
}

// ============================================================================
// Data Fetching
// ============================================================================

async function getBrandData(slug: string) {
  const brand = await getServerBrand(slug);

  if (!brand) {
    return null;
  }

  // Fetch other brands for "related brands" section
  let relatedBrands: Awaited<ReturnType<typeof getServerBrands>>['brands'] = [];
  try {
    const allBrands = await getServerBrands();
    // Get random sample of other brands (excluding current)
    relatedBrands = allBrands.brands
      .filter((b) => b.id !== brand.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);
  } catch (error) {
    console.error('Failed to fetch related brands:', error);
  }

  return {
    brand,
    relatedBrands,
  };
}

// ============================================================================
// Page Component
// ============================================================================

export default async function BrandPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const data = await getBrandData(slug);

  if (!data) {
    notFound();
  }

  const { brand, relatedBrands } = data;

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Marques', href: '/marques' },
    { label: brand.name },
  ];

  return (
    <>
      {/* Structured Data */}
      <BrandJsonLd brand={brand} />

      <Suspense fallback={<BrandPageLoading />}>
        <div className="min-h-screen bg-white">
          {/* Breadcrumbs */}
          <div className="bg-neutral-50 border-b border-neutral-100">
            <Container>
              <Breadcrumbs items={breadcrumbItems} variant="minimal" />
            </Container>
          </div>

          {/* Brand Hero */}
          <BrandHero
            brand={brand}
            productCount={brand.product_count || brand.products?.length || 0}
          />

          {/* Products Section with Server-Side Pagination */}
          <section id="brand-products" className="py-8 lg:py-12">
            <Container>
              {/* Section Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                  Produits {brand.name}
                </h2>
                <p className="text-neutral-600">
                  Decouvrez notre selection de produits de la marque {brand.name}.
                </p>
              </div>

              {/* Products Grid with Pagination and Filters */}
              <BrandProductsSection
                brandSlug={slug}
                brandName={brand.name}
                searchParams={resolvedSearchParams}
              />
            </Container>
          </section>

          {/* Related Brands Section */}
          {relatedBrands.length > 0 && (
            <section className="py-12 lg:py-16 bg-neutral-50 border-t border-neutral-200">
              <Container>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                    Autres marques populaires
                  </h2>
                  <p className="text-neutral-600">
                    Decouvrez d'autres marques partenaires de notre catalogue.
                  </p>
                </div>

                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                  {relatedBrands.map((relatedBrand) => (
                    <BrandCard
                      key={relatedBrand.id}
                      brand={relatedBrand}
                      variant="compact"
                      showProductCount
                    />
                  ))}
                </div>

                {/* View All Link */}
                <div className="text-center mt-8">
                  <a
                    href="/marques"
                    className="inline-flex items-center gap-2 text-accent hover:text-orange-600 font-medium transition-colors"
                  >
                    Voir toutes les marques
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                </div>
              </Container>
            </section>
          )}
        </div>
      </Suspense>
    </>
  );
}
