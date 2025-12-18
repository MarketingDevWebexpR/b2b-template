/**
 * Catalog Module - Library Exports
 *
 * @packageDocumentation
 */

// API Client
export {
  CatalogApiClient,
  CatalogApiError,
  getCatalogApiClient,
  createCatalogApiClient,
  fetchCatalogData,
  buildUrl,
  type CatalogApiClientConfig,
  type ApiErrorResponse,
  type RequestOptions,
} from './api-client';

// Cache Keys
export {
  catalogKeys,
  catalogStaleTimes,
  catalogGcTimes,
  getBrandInvalidationKeys,
  getCategoryInvalidationKeys,
  getProductInvalidationKeys,
  type BrandCacheFilters,
  type CategoryCacheFilters,
  type ProductCacheFilters,
  type CacheKey,
} from './cache-keys';

// Transformers
export {
  // Brand transformers
  getBrandInitials,
  getBrandColor,
  transformBrandToCardData,
  transformBrandsToCardData,
  groupBrandsByLetter,
  sortBrandsAlphabetically,
  filterPremiumBrands,

  // Category transformers
  buildCategoryPath,
  buildCategoryFullPath,
  transformCategoryToBreadcrumbs,
  transformTreeToNavItems,
  flattenCategoryTree,
  findCategoryByPath,

  // Product transformers
  formatPrice,
  getLowestPrice,
  getTotalInventory,
  transformProduct,
  transformProducts,

  // Facet transformers
  transformFacet,
  formatPriceRangeLabel,

  // URL utilities
  slugify,
  unslugify,

  // Types
  type RawProduct,
  type TransformedProduct,
  type RawFacet,
  type FacetOption,
  type Facets,
} from './transformers';
