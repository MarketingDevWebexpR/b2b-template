/**
 * Brands Library
 *
 * Utilities and server-side functions for working with brands.
 *
 * @packageDocumentation
 */

// Server-side functions (for Server Components)
export {
  getServerBrands,
  getServerBrand,
  getFilteredBrands,
  getAllBrandSlugs,
  type BrandWithProducts,
  type BrandProduct,
} from './server';
