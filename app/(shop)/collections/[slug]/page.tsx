import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getCategories,
  getCategoryBySlug,
  getProductsByCategorySlug,
  filterProductsFromAPI,
  getFeaturedProductsFromAPI,
} from '@/lib/api';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CategoryFiltersLight } from '@/components/categories/CategoryFiltersLight';
import { CategoryProductsGrid } from '@/components/categories/CategoryProductsGrid';
import { CollectionHero } from './CollectionHero';
import { OtherCollections } from './OtherCollections';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    materials?: string;
  }>;
}

// Force dynamic rendering to always fetch fresh data from API
export const dynamic = 'force-dynamic';

/**
 * Generate dynamic metadata for SEO
 */
export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Collection non trouvee | Maison Joaillerie',
    };
  }

  return {
    title: `${category.name} | Maison Joaillerie`,
    description: category.description,
    openGraph: {
      title: `${category.name} | Maison Joaillerie`,
      description: category.description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} | Maison Joaillerie`,
      description: category.description,
    },
  };
}

/**
 * CollectionPage - Server Component for collection product listings
 *
 * Features:
 * - Static Site Generation with generateStaticParams
 * - Dynamic metadata for SEO
 * - Server-side filtering from URL search params
 * - Elegant Hermes-inspired design
 * - Breadcrumb navigation
 * - Product grid with filters
 * - Other collections navigation
 */
export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const { slug } = await params;
  const filters = await searchParams;

  let category;
  let products;

  try {
    category = await getCategoryBySlug(slug);
    if (!category) {
      notFound();
    }
    products = await getProductsByCategorySlug(slug);
  } catch (error) {
    console.error('Failed to fetch collection data:', error);
    notFound();
  }

  // Get products for this category (products already fetched above)
  let filteredProducts = products;
  const totalProductCount = products.length;

  // Apply filters from URL params
  if (filters.minPrice || filters.maxPrice || filters.materials || filters.sort) {
    // Use category slug for filtering
    if (slug !== 'haute-joaillerie') {
      filteredProducts = await filterProductsFromAPI({
        categorySlug: slug,
        minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
        materials: filters.materials ? filters.materials.split(',') : undefined,
        sortBy: filters.sort as
          | 'price-asc'
          | 'price-desc'
          | 'name'
          | 'newest'
          | undefined,
      });
    }
  }

  // For haute-joaillerie, get featured products across all categories
  if (slug === 'haute-joaillerie') {
    filteredProducts = await getFeaturedProductsFromAPI(12);
  }

  // Get other categories for navigation
  const allCategories = await getCategories();
  const otherCategories = allCategories.filter((c) => c.slug !== slug);

  return (
    <main className="min-h-screen bg-background-cream">
      {/* Collection Hero */}
      <CollectionHero
        category={{
          ...category,
          productCount: filteredProducts.length,
        }}
      />

      {/* Main Content */}
      <section className="py-12 lg:py-20">
        <Container>
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: 'Collections', href: '/collections' },
              { label: category.name },
            ]}
            className="mb-8"
          />

          {/* Filters + Grid Layout */}
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-12 xl:gap-16">
            {/* Filters Sidebar */}
            <div className="mb-8 lg:mb-0">
              <CategoryFiltersLight totalProducts={filteredProducts.length} categorySlug={slug} />
            </div>

            {/* Products Area */}
            <div>
              {/* Results Header (Desktop) */}
              <div className="mb-8 hidden items-center justify-between border-b border-border-light pb-4 lg:flex">
                <p className="font-sans text-sm text-text-muted">
                  <span className="font-medium text-text-primary">
                    {filteredProducts.length}
                  </span>{' '}
                  {filteredProducts.length > 1 ? 'pieces' : 'piece'}
                  {filteredProducts.length !== totalProductCount && (
                    <span className="text-text-light">
                      {' '}
                      sur {totalProductCount}
                    </span>
                  )}
                </p>

                {/* Active filters summary could go here */}
              </div>

              {/* Products Grid */}
              <CategoryProductsGrid
                products={filteredProducts}
                initialCount={15}
                loadIncrement={10}
              />

              {/* Empty State with Reset Link */}
              {filteredProducts.length === 0 && (
                <div className="py-16 text-center">
                  <p className="mb-4 font-sans text-body text-text-muted">
                    Aucun produit ne correspond a vos criteres.
                  </p>
                  <Link
                    href={`/collections/${slug}`}
                    className="inline-flex items-center gap-2 font-sans text-xs font-medium uppercase tracking-luxe text-hermes-500 transition-colors hover:text-hermes-600"
                  >
                    <span>Reinitialiser les filtres</span>
                    <span className="h-px w-8 bg-hermes-500 transition-all duration-350 hover:w-12" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Other Collections Section */}
      <OtherCollections categories={otherCategories} currentSlug={slug} />
    </main>
  );
}
