import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getCategories,
  getCategoryBySlug,
  getProductsByCategorySlug,
  filterProductsFromAPI,
} from '@/lib/api';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CategoryFiltersLight } from '@/components/categories/CategoryFiltersLight';
import { CategoryProductsGrid } from '@/components/categories/CategoryProductsGrid';
import { CategoryHero } from './CategoryHero';
import { OtherCategories } from './OtherCategories';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    materials?: string;
  }>;
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Generate dynamic metadata
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);

    if (!category) {
      return {
        title: 'Categorie non trouvee | WebexpR Pro B2B',
      };
    }

    return {
      title: `${category.name} | WebexpR Pro B2B`,
      description: category.description,
      openGraph: {
        title: `${category.name} | WebexpR Pro B2B`,
        description: category.description,
        images: [
          {
            url: category.image,
            width: 1200,
            height: 630,
            alt: category.name,
          },
        ],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Categorie non trouvee | WebexpR Pro B2B',
    };
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const filters = await searchParams;

  let category: Awaited<ReturnType<typeof getCategoryBySlug>>;
  let products: Awaited<ReturnType<typeof getProductsByCategorySlug>>;
  let totalProductCount = 0;
  let otherCategories: Awaited<ReturnType<typeof getCategories>>;

  try {
    // Fetch category data
    category = await getCategoryBySlug(slug);

    if (!category) {
      notFound();
    }

    // Get products and apply filters from API
    products = await getProductsByCategorySlug(slug);
    totalProductCount = products.length;

    // Apply filters from URL params
    if (filters.minPrice || filters.maxPrice || filters.materials || filters.sort) {
      products = await filterProductsFromAPI({
        categorySlug: slug,
        minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
        materials: filters.materials ? filters.materials.split(',') : undefined,
        sortBy: filters.sort as 'price-asc' | 'price-desc' | 'name' | 'newest' | undefined,
      });
    }

    // Get other categories for navigation from API
    const allCategories = await getCategories();
    otherCategories = allCategories.filter((cat) => cat.slug !== slug);
  } catch (error) {
    console.error('Error loading category page:', error);
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Category Hero */}
      <CategoryHero
        name={category.name}
        description={category.description}
        image={category.image}
        productCount={products.length}
      />

      {/* Main Content */}
      <section className="py-10 lg:py-16">
        <Container>
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: 'Categories', href: '/categories' },
              { label: category.name },
            ]}
            className="mb-6"
          />

          {/* Filters + Grid Layout */}
          <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10 xl:gap-12">
            {/* Filters Sidebar */}
            <div className="mb-6 lg:mb-0">
              <CategoryFiltersLight totalProducts={products.length} categorySlug={slug} />
            </div>

            {/* Products Area */}
            <div>
              {/* Results Header (Desktop) */}
              <div className="mb-6 hidden items-center justify-between border-b border-stroke-light pb-3 lg:flex">
                <p className="font-sans text-body-sm text-neutral-500">
                  <span className="font-medium text-neutral-900">{products.length}</span>
                  {' '}
                  {products.length > 1 ? 'produits' : 'produit'}
                  {products.length !== totalProductCount && (
                    <span className="text-neutral-400"> sur {totalProductCount}</span>
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
                <div className="py-8 text-center">
                  <Link
                    href={`/categories/${slug}`}
                    className="inline-flex items-center gap-2 font-sans text-body-sm font-medium text-accent transition-colors hover:text-accent/80"
                  >
                    <span>Reinitialiser les filtres</span>
                    <span className="h-px w-8 bg-accent transition-all duration-200 hover:w-12" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Other Categories Section */}
      <OtherCategories categories={otherCategories} currentSlug={slug} />
    </main>
  );
}
