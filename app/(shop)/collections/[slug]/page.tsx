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

/**
 * Generate static params for all collections
 * This enables Static Site Generation (SSG) for collection pages
 */
export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

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
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  // Get products for this category
  let products = await getProductsByCategorySlug(slug);
  const totalProductCount = products.length;

  // Apply filters from URL params
  if (filters.minPrice || filters.maxPrice || filters.materials || filters.sort) {
    // Use category slug for filtering
    if (slug !== 'haute-joaillerie') {
      products = await filterProductsFromAPI({
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
    products = await getFeaturedProductsFromAPI(12);
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
          productCount: products.length,
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
              <CategoryFiltersLight totalProducts={products.length} categorySlug={slug} />
            </div>

            {/* Products Area */}
            <div>
              {/* Results Header (Desktop) */}
              <div className="mb-8 hidden items-center justify-between border-b border-border-light pb-4 lg:flex">
                <p className="font-sans text-sm text-text-muted">
                  <span className="font-medium text-text-primary">
                    {products.length}
                  </span>{' '}
                  {products.length > 1 ? 'pieces' : 'piece'}
                  {products.length !== totalProductCount && (
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
                products={products}
                initialCount={15}
                loadIncrement={10}
              />

              {/* Empty State with Reset Link */}
              {products.length === 0 && (
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
