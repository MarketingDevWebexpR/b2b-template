import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CategoryFiltersLight } from '@/components/categories/CategoryFiltersLight';
import { CategoryProductsGrid } from '@/components/categories/CategoryProductsGrid';
import { CategoryHero } from './CategoryHero';
import { OtherCategories } from './OtherCategories';
import type { IndexedCategory, CategoryResponse } from '@/types/category';
import type { Product } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    materials?: string;
    inStock?: string;
    subcategory?: string;
    brand?: string; // V3: brand_slug filter
  }>;
}

interface TransformedProduct {
  id: string;
  title: string;
  handle: string;
  subtitle: string | null;
  description: string | null;
  thumbnail: string | null;
  images: string[];
  price: {
    amount: number;
    currency: string;
    formatted: string;
  } | null;
  inStock: boolean;
  totalInventory: number;
  categories: Array<{ id: string; name: string; handle: string }>;
  tags: string[];
  createdAt: string;
  brand_name?: string;
  brand_slug?: string;
}

interface ProductsResponse {
  products: TransformedProduct[];
  total: number;
  facets: {
    categories: Array<{ value: string; label: string; count: number }>;
    brands: Array<{ value: string; label: string; count: number }>;
    priceRanges: Array<{ value: string; label: string; count: number }>;
  };
  limit: number;
  offset: number;
}

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// ============================================================================
// Data Fetching - V3 API
// ============================================================================

/**
 * Fetch category data from the categories API
 * Uses the v3 indexed categories with hierarchy support
 */
async function fetchCategory(slug: string): Promise<IndexedCategory | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error('[CategoryPage] Failed to fetch categories:', response.status);
      return null;
    }

    const data: CategoryResponse = await response.json();
    return data.byHandle[slug] || null;
  } catch (error) {
    console.error('[CategoryPage] Error fetching category:', error);
    return null;
  }
}

/**
 * Fetch products filtered by category using v3 all_category_handles
 * This enables hierarchical filtering - a parent category shows all products in its subtree
 */
async function fetchCategoryProducts(
  categoryHandle: string,
  params: {
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    subcategory?: string;
    brand?: string; // V3: brand_slug filter
  }
): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams();

  // Use category handle for hierarchical filtering via all_category_handles
  searchParams.set('category', params.subcategory || categoryHandle);
  searchParams.set('limit', '100'); // Get all for client-side pagination
  searchParams.set('facets', 'true'); // Request facets for brand filtering

  if (params.sort) {
    searchParams.set('sort', params.sort);
  }
  if (params.minPrice) {
    searchParams.set('minPrice', params.minPrice);
  }
  if (params.maxPrice) {
    searchParams.set('maxPrice', params.maxPrice);
  }
  // V3: has_stock is string "true"/"false"
  if (params.inStock === 'true') {
    searchParams.set('inStock', 'true');
  }
  // V3: brand_slug filter
  if (params.brand) {
    searchParams.set('brand', params.brand);
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/catalog/products?${searchParams.toString()}`,
      { next: { revalidate: 120 } }
    );

    if (!response.ok) {
      console.error('[CategoryPage] Failed to fetch products:', response.status);
      return {
        products: [],
        total: 0,
        facets: { categories: [], brands: [], priceRanges: [] },
        limit: 100,
        offset: 0,
      };
    }

    return response.json();
  } catch (error) {
    console.error('[CategoryPage] Error fetching products:', error);
    return {
      products: [],
      total: 0,
      facets: { categories: [], brands: [], priceRanges: [] },
      limit: 100,
      offset: 0,
    };
  }
}

/**
 * Fetch sibling categories for "Other Categories" section
 */
async function fetchOtherCategories(
  currentSlug: string
): Promise<IndexedCategory[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return [];
    }

    const data: CategoryResponse = await response.json();

    // Get root categories excluding the current one
    return data.flat
      .filter(cat => cat.depth === 0 && cat.handle !== currentSlug && cat.is_active)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 6);
  } catch (error) {
    console.error('[CategoryPage] Error fetching other categories:', error);
    return [];
  }
}

/**
 * Transform API product to frontend Product type
 */
function transformToProduct(product: TransformedProduct): Product {
  return {
    id: product.id,
    name: product.title,
    slug: product.handle,
    price: product.price?.amount || 0,
    compareAtPrice: undefined,
    images: product.images.length > 0
      ? product.images
      : (product.thumbnail ? [product.thumbnail] : []),
    category: product.categories[0]
      ? {
          id: product.categories[0].id,
          name: product.categories[0].name,
          slug: product.categories[0].handle,
          description: '',
          image: '',
          productCount: 0,
        }
      : undefined,
    categoryId: product.categories[0]?.id || '',
    stock: product.totalInventory,
    reference: product.id.slice(0, 8).toUpperCase(),
    description: product.description || '',
    shortDescription: product.subtitle || '',
    isNew: false,
    featured: false,
    isPriceTTC: false,
    isAvailable: product.inStock,
    materials: [],
    weightUnit: 'g',
    brand: product.brand_name,
    collection: product.categories[0]?.name,
    createdAt: product.createdAt,
  };
}

/**
 * Build breadcrumb items from category path
 * Uses v3 category_paths field format: "Parent > Child > GrandChild"
 */
function buildBreadcrumbs(
  category: IndexedCategory
): Array<{ label: string; href?: string }> {
  const items: Array<{ label: string; href?: string }> = [
    { label: 'Categories', href: '/categories' },
  ];

  // Use ancestor_names and ancestor_handles for breadcrumb trail
  if (category.ancestor_names?.length > 0 && category.ancestor_handles?.length > 0) {
    category.ancestor_names.forEach((name, index) => {
      const handle = category.ancestor_handles[index];
      if (handle) {
        items.push({ label: name, href: `/categories/${handle}` });
      }
    });
  }

  // Add current category (no href for current page)
  items.push({ label: category.name });

  return items;
}

// ============================================================================
// Metadata
// ============================================================================

// Generate dynamic metadata
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const category = await fetchCategory(slug);

    if (!category) {
      return {
        title: 'Categorie non trouvee | WebexpR Pro B2B',
      };
    }

    const description = category.description ||
      `Decouvrez notre selection de produits ${category.name}. Catalogue professionnel B2B.`;

    return {
      title: `${category.name} | WebexpR Pro B2B`,
      description,
      openGraph: {
        title: `${category.name} | WebexpR Pro B2B`,
        description,
        images: category.image_url
          ? [
              {
                url: category.image_url,
                width: 1200,
                height: 630,
                alt: category.name,
              },
            ]
          : undefined,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Categorie non trouvee | WebexpR Pro B2B',
    };
  }
}

// ============================================================================
// Page Component
// ============================================================================

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const filters = await searchParams;

  // Fetch data in parallel using v3 APIs
  const [category, productsData, otherCategories] = await Promise.all([
    fetchCategory(slug),
    fetchCategoryProducts(slug, filters),
    fetchOtherCategories(slug),
  ]);

  if (!category) {
    notFound();
  }

  // Transform products to frontend format
  const products = productsData.products.map(transformToProduct);
  const totalProductCount = productsData.total;

  // Build breadcrumbs from category hierarchy
  const breadcrumbItems = buildBreadcrumbs(category);

  // Get subcategory facets from the response (uses category_lvl* fields)
  const subcategoryFacets = productsData.facets.categories;

  // Get brand facets from the response (uses brand_name/brand_slug fields)
  const brandFacets = productsData.facets.brands;

  // Transform other categories for OtherCategories component
  const otherCategoriesFormatted = otherCategories.map(cat => ({
    id: cat.id,
    code: cat.id,
    name: cat.name,
    slug: cat.handle,
    description: cat.description || '',
    image: cat.image_url || '/images/placeholder-category.svg',
    productCount: cat.product_count,
  }));

  return (
    <main className="min-h-screen bg-white">
      {/* Category Hero */}
      <CategoryHero
        name={category.name}
        description={category.description || ''}
        image={category.image_url || '/images/placeholder-category.svg'}
        productCount={totalProductCount}
      />

      {/* Main Content */}
      <section className="py-10 lg:py-16">
        <Container>
          {/* Breadcrumbs - using v3 hierarchy */}
          <Breadcrumbs
            items={breadcrumbItems}
            className="mb-6"
          />

          {/* Filters + Grid Layout */}
          <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10 xl:gap-12">
            {/* Filters Sidebar */}
            <div className="mb-6 lg:mb-0">
              <CategoryFiltersLight
                totalProducts={products.length}
                categorySlug={slug}
                subcategoryFacets={subcategoryFacets}
                brandFacets={brandFacets}
              />
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

                {/* Show category path if available */}
                {category.path && (
                  <p className="font-sans text-body-xs text-neutral-400">
                    {category.path}
                  </p>
                )}
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
      <OtherCategories categories={otherCategoriesFormatted} currentSlug={slug} />
    </main>
  );
}
