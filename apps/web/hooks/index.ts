// Hooks exports
export { useSearch } from './useSearch';
export {
  useMockData,
  useMockCatalog,
  useMockCart,
  useMockOrders,
  useMockQuotes,
  useMockCompany,
  useMockWarehouse,
  type MockDataStore,
} from './useMockData';

// Category hooks
export {
  useCategories,
  useCategoryByHandle,
  useCategoryById,
  useCategoryNavigation,
  useRootCategories,
  prefetchCategories,
  getServerCategories,
  type UseCategoriesOptions,
  type UseCategoriesResult,
} from './use-categories';

// Brand hooks
export {
  useBrands,
  useBrand,
  getServerBrands,
  getServerBrand,
  prefetchBrands,
  brandToCardData,
  type UseBrandsOptions,
  type UseBrandsResult,
  type UseBrandOptions,
  type UseBrandResult,
  type BrandWithProducts,
} from './use-brands';

// Product view mode hook
export {
  useProductViewMode,
  useProductViewModeContext,
  useOptionalProductViewModeContext,
  ProductViewModeProvider,
  type ProductViewMode,
  type UseProductViewModeOptions,
  type UseProductViewModeReturn,
  type ProductViewModeProviderProps,
} from './useProductViewMode';
