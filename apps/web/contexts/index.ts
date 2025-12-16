/**
 * Contexts - Re-exports
 *
 * Central export point for all application contexts.
 * Import from '@/contexts' for convenience.
 *
 * @packageDocumentation
 */

// ============================================================================
// B2B Unified Provider (recommended)
// ============================================================================

export {
  B2BProvider,
  useB2B,
  // Operations hooks
  useOperations,
  useQuotes,
  useApprovals,
  useOrders,
  useReports,
  useBulkOrder,
} from './B2BProvider';

export type { B2BProviderProps, OperationsContextValue } from './B2BProvider';

// ============================================================================
// Company Context
// ============================================================================

export {
  CompanyProvider,
  useCompany,
  useCreditInfo,
  useCompanyAddresses,
} from './CompanyContext';

export type { CompanyProviderProps, CompanyContextValue, CreditInfo } from './CompanyContext';

// ============================================================================
// Employee Context
// ============================================================================

export {
  EmployeeProvider,
  useEmployee,
  usePermissions,
  useSpendingLimits,
  useB2BPermissions,
} from './EmployeeContext';

export type {
  EmployeeProviderProps,
  EmployeeContextValue,
  SpendingSummary,
  B2BAction,
} from './EmployeeContext';

// ============================================================================
// Warehouse Context
// ============================================================================

export {
  WarehouseProvider,
  useWarehouse,
  useSelectedWarehouse,
  usePickupPoints,
} from './WarehouseContext';

export type { WarehouseProviderProps, WarehouseContextValue } from './WarehouseContext';

// ============================================================================
// Pricing Context
// ============================================================================

export {
  PricingProvider,
  usePricing,
  useProductPrice,
  usePriceFormatter,
  useVolumeDiscounts,
} from './PricingContext';

export type {
  PricingProviderProps,
  PricingContextValue,
  PriceDisplayFormat,
  TaxConfig,
  PricingSettings,
} from './PricingContext';

// ============================================================================
// Search Context
// ============================================================================

export {
  SearchProvider,
  useSearch,
  useSearchState,
  useSearchFilters,
  useSearchPagination,
  useSearchSuggestions,
  useSearchOverlay,
} from './SearchContext';

export type {
  SearchProviderProps,
  SearchContextValue,
  SearchState,
  SearchResultType,
  SearchSortOption,
  ProductViewMode,
  PriceRange,
  StockFilter,
  Facet,
  FacetValue,
  CategoryNode,
  SearchSuggestion,
  SearchHistoryItem,
  ActiveFilters,
} from './SearchContext';

// ============================================================================
// Legacy B2B Context (deprecated - use B2BProvider instead)
// ============================================================================

// Keep the original B2BContext exports for backward compatibility
// These are deprecated - use the new B2BProvider and useB2B from './B2BProvider' instead
export {
  B2BProvider as LegacyB2BProvider,
  useB2B as useLegacyB2B,
  useB2BStatus,
  useB2BPermissions as useLegacyB2BPermissions,
} from './B2BContext';

export type { B2BAction as LegacyB2BAction } from './B2BContext';
