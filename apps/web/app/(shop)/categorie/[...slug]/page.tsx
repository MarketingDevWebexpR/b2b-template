import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Skeleton } from '@/components/ui';
import {
  CategoryNavBar,
  CategoryProductsSection,
  ProductGridSkeleton,
} from '@/components/categories';
import {
  resolveCategoryFromSlug,
  buildCategoryBreadcrumbs,
  getDirectChildren,
  getSiblings,
  getParent,
  getTotalProductCount,
  getCategoryPath,
} from '@/lib/categories/hierarchy';
import type { CategoryResponse, MeilisearchCategory } from '@/types/category';
import type { HierarchicalBreadcrumb } from '@/lib/categories/hierarchy';

/**
 * Hierarchical Category Page - Horizontal Compact Layout
 *
 * Features a compact horizontal navigation bar at the top with:
 * - Enriched breadcrumbs with dropdown navigation
 * - Inline subcategory tags
 * - Full-width product grid
 *
 * URL Structure:
 * - /categorie/bijoux                    -> Level 1
 * - /categorie/bijoux/colliers           -> Level 2
 * - /categorie/bijoux/colliers/or        -> Level 3
 * - /categorie/bijoux/colliers/or/pendentifs -> Level 4
 * - /categorie/bijoux/colliers/or/pendentifs/coeurs -> Level 5
 */

// ============================================================================
// Types
// ============================================================================

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
  searchParams: Promise<{
    q?: string;
    sort?: string;
    page?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    priceRange?: string;
    inStock?: string;
  }>;
}

// ============================================================================
// Revalidation
// ============================================================================

export const revalidate = 3600; // Revalidate every hour

// ============================================================================
// Data Fetching
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function getCategoriesData(): Promise<CategoryResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error(`[Category Page] API error: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('[Category Page] Error fetching categories:', error);
    return null;
  }
}

// ============================================================================
// Metadata Generation
// ============================================================================

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoriesData = await getCategoriesData();

  if (!categoriesData) {
    return {
      title: 'Categorie introuvable | WebexpR Pro B2B',
      robots: { index: false },
    };
  }

  const resolution = resolveCategoryFromSlug(slug, categoriesData);

  if (!resolution || !resolution.isValid) {
    return {
      title: 'Categorie introuvable | WebexpR Pro B2B',
      robots: { index: false },
    };
  }

  const { category, breadcrumbs } = resolution;
  const pathString = breadcrumbs.map((b) => b.name).join(' > ');

  return {
    title: `${category.name} | ${pathString} | WebexpR Pro B2B`,
    description:
      category.description ||
      `Decouvrez notre selection de ${category.name.toLowerCase()}. ${category.product_count} produits professionnels B2B de haute qualite.`,
    openGraph: {
      title: `${category.name} - Bijoux professionnels B2B`,
      description: category.description || `Collection ${category.name}`,
      type: 'website',
      images: category.image_url
        ? [{ url: category.image_url, alt: category.name }]
        : undefined,
    },
    alternates: {
      canonical: getCategoryPath(category),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// ============================================================================
// Static Params Generation (for SSG)
// ============================================================================

export async function generateStaticParams() {
  const categoriesData = await getCategoriesData();

  if (!categoriesData) {
    return [];
  }

  // Generate params for all categories
  return categoriesData.flat.map((category) => ({
    slug: [...(category.ancestor_handles || []), category.handle],
  }));
}

// ============================================================================
// Loading Component
// ============================================================================

function CategoryPageLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Nav bar skeleton */}
      <div className="bg-white border-b border-neutral-200 sticky top-16 z-30">
        <div className="container mx-auto px-4">
          <div className="py-3 border-b border-neutral-100">
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="py-3 flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <Container className="py-6">
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
          <ProductGridSkeleton count={12} />
        </div>
      </Container>
    </div>
  );
}

// ============================================================================
// Structured Data Component
// ============================================================================

interface StructuredDataProps {
  category: MeilisearchCategory;
  breadcrumbs: HierarchicalBreadcrumb[];
  subcategories: MeilisearchCategory[];
}

function StructuredData({ category, breadcrumbs, subcategories }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  // BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Categories',
        item: `${baseUrl}/categorie`,
      },
      ...breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 3,
        name: crumb.name,
        item: `${baseUrl}${crumb.hierarchicalHref}`,
      })),
    ],
  };

  // CollectionPage schema
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description || `Collection ${category.name}`,
    url: `${baseUrl}${getCategoryPath(category)}`,
    image: category.image_url || undefined,
    numberOfItems: category.product_count,
    isPartOf: {
      '@type': 'WebSite',
      name: 'WebexpR Pro B2B',
      url: baseUrl,
    },
    hasPart: subcategories.map((sub) => ({
      '@type': 'CollectionPage',
      name: sub.name,
      url: `${baseUrl}${getCategoryPath(sub)}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
    </>
  );
}

// ============================================================================
// Main Content Component
// ============================================================================

interface CategoryContentProps {
  slug: string[];
  searchParams: {
    q?: string;
    sort?: string;
    page?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    priceRange?: string;
    inStock?: string;
  };
}

async function CategoryContent({ slug, searchParams }: CategoryContentProps) {
  const categoriesData = await getCategoriesData();

  if (!categoriesData) {
    notFound();
  }

  const resolution = resolveCategoryFromSlug(slug, categoriesData);

  if (!resolution || !resolution.isValid) {
    notFound();
  }

  const { category, ancestors } = resolution;
  const { flat, byId } = categoriesData;

  // Build complete breadcrumbs
  const breadcrumbs = buildCategoryBreadcrumbs(category, byId, false);

  // Get related categories
  const subcategories = getDirectChildren(category, flat);
  const siblings = getSiblings(category, flat);
  const parent = getParent(category, byId);

  // Calculate total products
  const totalProductCount = getTotalProductCount(category, flat);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Structured Data */}
      <StructuredData
        category={category}
        breadcrumbs={breadcrumbs}
        subcategories={subcategories}
      />

      {/* Compact Horizontal Navigation Bar */}
      <CategoryNavBar
        category={category}
        breadcrumbs={breadcrumbs}
        subcategories={subcategories}
        siblings={siblings}
        categoriesData={categoriesData}
        totalProductCount={totalProductCount}
      />

      {/* Main Content - Full Width */}
      <Container className="py-6">
        {/* Category Description (if exists) */}
        {category.description && (
          <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-6">
            <p className="text-sm text-neutral-600 leading-relaxed">
              {category.description}
            </p>
          </div>
        )}

        {/* Products Section - Full Width */}
        <Suspense
          fallback={
            <section className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-40" />
              </div>
              <ProductGridSkeleton count={12} />
            </section>
          }
        >
          <CategoryProductsSection
            categoryHandle={category.handle}
            categoryName={category.name}
            searchParams={searchParams}
            pageSize={24}
            showFilters={true}
          />
        </Suspense>

        {/* Category Info Footer */}
        {category.depth > 0 && parent && (
          <section className="mt-6 p-4 bg-neutral-100 rounded-xl">
            <p className="text-sm text-neutral-600">
              <span className="font-medium">{category.name}</span> fait partie de la categorie{' '}
              <Link
                href={getCategoryPath(parent)}
                className="text-accent hover:underline"
              >
                {parent.name}
              </Link>
              {ancestors.length > 1 && (
                <>
                  {' '}dans la hierarchie{' '}
                  {ancestors.map((anc, i) => (
                    <span key={anc.id}>
                      {i > 0 && ' > '}
                      <Link
                        href={getCategoryPath(anc)}
                        className="text-accent hover:underline"
                      >
                        {anc.name}
                      </Link>
                    </span>
                  ))}
                </>
              )}
              .
            </p>
          </section>
        )}
      </Container>
    </div>
  );
}

// ============================================================================
// Page Component
// ============================================================================

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  // Validate slug length (max 5 levels)
  if (slug.length > 5) {
    notFound();
  }

  return (
    <>
      {/* Header spacer for fixed header */}
      <div className="h-16" />

      <Suspense fallback={<CategoryPageLoading />}>
        <CategoryContent slug={slug} searchParams={resolvedSearchParams} />
      </Suspense>
    </>
  );
}
