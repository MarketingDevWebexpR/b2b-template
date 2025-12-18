/**
 * Catalog Hooks Module
 *
 * React Query hooks for the B2B e-commerce catalog including brands,
 * categories, and products with optimized caching and type safety.
 *
 * @packageDocumentation
 */

// ============================================================================
// Brand Hooks
// ============================================================================

export {
  // Main hooks
  useBrands,
  useBrand,
  useBrandProducts,
  usePremiumBrands,
  useBrandsByLetter,
  useBrandCards,

  // Utilities
  useBrandPrefetch,
  useBrandInvalidation,

  // Server-side helpers
  getServerBrands,
  getServerBrand,

  // Types
  type UseBrandsOptions,
  type UseBrandOptions,
  type UseBrandProductsOptions,
  type BrandDetailResponse,
  type BrandProduct,
  type BrandCardData,
} from './use-brands';

// ============================================================================
// Category Hooks
// ============================================================================

export {
  // Main hooks
  useCategoryTree,
  useCategoryNavItems,
  useCategory,
  useCategoryProducts,
  useCategoryBreadcrumbs,

  // Utility hooks
  useCategoryByHandle,
  useRootCategories,
  useCategoryChildren,

  // Utilities
  useCategoryPrefetch,
  useCategoryInvalidation,

  // Server-side helpers
  getServerCategoryTree,
  getServerCategory,

  // Types
  type CategoryTreeResponse,
  type CategoryPathResponse,
  type CategoryProduct,
  type UseCategoryTreeOptions,
  type UseCategoryOptions,
  type UseCategoryProductsOptions,
} from './use-categories';

// ============================================================================
// Product Hooks
// ============================================================================

export {
  // Main hooks
  useCatalogProducts,
  useProductFacets,
  useInfiniteProducts,

  // Convenience hooks
  useProducts,
  useProductCount,
  useProductSearch,
  useProductsByCategory,
  useProductsByBrand,

  // Utilities
  useProductPrefetch,
  useProductInvalidation,

  // Server-side helpers
  getServerProducts,
  getServerFacets,

  // Types
  type CatalogProduct,
  type CatalogFacets,
  type CatalogProductsResponse,
  type CatalogFilters,
  type UseCatalogProductsOptions,
  type UseInfiniteProductsOptions,
  type FacetOption,
  type ProductFilterState,
} from './use-catalog-products';
