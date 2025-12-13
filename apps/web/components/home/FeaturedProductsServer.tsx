import { getProducts } from '@/lib/api';
import { FeaturedProducts, type FeaturedProductsProps } from './FeaturedProducts';

// ============================================
// Types
// ============================================

export interface FeaturedProductsServerProps extends Omit<FeaturedProductsProps, 'products'> {
  /** Fallback products to use if API fails */
  fallbackProducts?: FeaturedProductsProps['products'];
}

// ============================================
// Server Component
// ============================================

/**
 * Server Component wrapper for FeaturedProducts that fetches products from the API.
 *
 * This component:
 * 1. Fetches products server-side using getProducts() from @/lib/api
 * 2. Filters to show only featured products (or limits to maxProducts)
 * 3. Passes the data to the client FeaturedProducts component
 *
 * @example
 * // In a Server Component (page.tsx)
 * import { FeaturedProductsServer } from '@/components/home/FeaturedProductsServer';
 *
 * export default async function HomePage() {
 *   return (
 *     <main>
 *       <FeaturedProductsServer maxProducts={8} filterFeatured />
 *     </main>
 *   );
 * }
 */
export async function FeaturedProductsServer({
  fallbackProducts = [],
  maxProducts = 8,
  filterFeatured = true,
  ...props
}: FeaturedProductsServerProps) {
  let products = fallbackProducts;

  try {
    const allProducts = await getProducts();

    // Filter featured products if requested
    products = filterFeatured
      ? allProducts.filter((p) => p.featured)
      : allProducts;

    // If no featured products found but filterFeatured is true,
    // fall back to newest products
    if (filterFeatured && products.length === 0) {
      products = [...allProducts]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, maxProducts);
    }
  } catch (error) {
    console.error('Failed to fetch products for FeaturedProductsServer:', error);
    // Use fallback products on error
  }

  // Don't render if no products available
  if (products.length === 0) {
    return null;
  }

  return (
    <FeaturedProducts
      products={products}
      maxProducts={maxProducts}
      filterFeatured={false} // Already filtered server-side
      {...props}
    />
  );
}

export default FeaturedProductsServer;
