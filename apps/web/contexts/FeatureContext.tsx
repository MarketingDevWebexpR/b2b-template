'use client';

/**
 * FeatureContext - Systeme de Feature Flags Modulaire
 *
 * Ce context gere l'activation/desactivation des fonctionnalites
 * par module et sous-fonctionnalite pour une plateforme white-label.
 *
 * @packageDocumentation
 */

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  FeaturesConfig,
  ModuleName,
  SubFeatureName,
  SubFeatureConfig,
  PartialFeaturesConfig,
} from '@maison/types';
import { deepMerge } from '@/lib/utils';
import { defaultFeaturesConfig } from '@/config/features/default';
import { loadFeaturesConfigSync } from '@/config/features/loader';

// ============================================================================
// Types
// ============================================================================

/**
 * Valeur du context des features
 */
export interface FeatureContextValue {
  /** Configuration complete des features */
  config: FeaturesConfig;
  /** Verifier si un module est active */
  isModuleEnabled: (module: ModuleName) => boolean;
  /** Verifier si une sous-fonctionnalite est activee */
  isSubFeatureEnabled: <M extends ModuleName>(
    module: M,
    subFeature: SubFeatureName<M>
  ) => boolean;
  /** Obtenir la configuration d'une sous-fonctionnalite */
  getSubFeatureConfig: <M extends ModuleName>(
    module: M,
    subFeature: SubFeatureName<M>
  ) => Record<string, unknown> | undefined;
  /** Obtenir la configuration complete d'un module */
  getModuleConfig: <M extends ModuleName>(module: M) => FeaturesConfig[M];
}

/**
 * Props du FeatureProvider
 */
export interface FeatureProviderProps {
  children: ReactNode;
  /** Overrides partiels de la configuration */
  overrides?: PartialFeaturesConfig;
}

// ============================================================================
// Context
// ============================================================================

const FeatureContext = createContext<FeatureContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

/**
 * Provider pour le systeme de feature flags.
 *
 * @example
 * ```tsx
 * <FeatureProvider overrides={{ quotes: { enabled: false } }}>
 *   <App />
 * </FeatureProvider>
 * ```
 */
export function FeatureProvider({ children, overrides }: FeatureProviderProps) {
  // Charger la config de base (avec overrides env si NEXT_PUBLIC_FEATURES_SOURCE=env)
  // Note: Les variables NEXT_PUBLIC_* sont inlinees au build. Pour un changement runtime,
  // il faudra utiliser l'API Medusa (implementation future).
  const source = (process.env.NEXT_PUBLIC_FEATURES_SOURCE as 'local' | 'env') || 'local';
  const baseConfig = useMemo(() => loadFeaturesConfigSync({ source }), [source]);

  // Merge la config de base avec les overrides props additionnels
  const config = useMemo(() => {
    if (!overrides) return baseConfig;
    return deepMerge(
      baseConfig as unknown as Record<string, unknown>,
      overrides as unknown as Record<string, unknown>
    ) as unknown as FeaturesConfig;
  }, [baseConfig, overrides]);

  // Verifier si un module est active
  const isModuleEnabled = useCallback(
    (module: ModuleName): boolean => {
      return config[module]?.enabled ?? false;
    },
    [config]
  );

  // Verifier si une sous-fonctionnalite est activee
  const isSubFeatureEnabled = useCallback(
    <M extends ModuleName>(module: M, subFeature: SubFeatureName<M>): boolean => {
      const moduleConfig = config[module];
      if (!moduleConfig?.enabled) return false;
      const subFeatureConfig = (moduleConfig.subFeatures as unknown as Record<string, SubFeatureConfig>)[subFeature as string];
      return subFeatureConfig?.enabled ?? false;
    },
    [config]
  );

  // Obtenir la configuration d'une sous-fonctionnalite
  const getSubFeatureConfig = useCallback(
    <M extends ModuleName>(
      module: M,
      subFeature: SubFeatureName<M>
    ): Record<string, unknown> | undefined => {
      const moduleConfig = config[module];
      if (!moduleConfig) return undefined;
      const subFeatureConfig = (moduleConfig.subFeatures as unknown as Record<string, SubFeatureConfig>)[subFeature as string];
      return subFeatureConfig?.config as Record<string, unknown> | undefined;
    },
    [config]
  );

  // Obtenir la configuration complete d'un module
  const getModuleConfig = useCallback(
    <M extends ModuleName>(module: M): FeaturesConfig[M] => {
      return config[module];
    },
    [config]
  );

  // Memoize la valeur du context
  const value = useMemo<FeatureContextValue>(
    () => ({
      config,
      isModuleEnabled,
      isSubFeatureEnabled,
      getSubFeatureConfig,
      getModuleConfig,
    }),
    [config, isModuleEnabled, isSubFeatureEnabled, getSubFeatureConfig, getModuleConfig]
  );

  return (
    <FeatureContext.Provider value={value}>{children}</FeatureContext.Provider>
  );
}

// ============================================================================
// Hook Principal
// ============================================================================

/**
 * Hook pour acceder au systeme de feature flags.
 *
 * @throws Error si utilise en dehors du FeatureProvider
 *
 * @example
 * ```tsx
 * const { isModuleEnabled, isSubFeatureEnabled } = useFeatures();
 *
 * if (isModuleEnabled('quotes')) {
 *   // Afficher le module devis
 * }
 *
 * if (isSubFeatureEnabled('catalog', 'quickView')) {
 *   // Afficher le bouton Quick View
 * }
 * ```
 */
export function useFeatures(): FeatureContextValue {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeatures must be used within a FeatureProvider');
  }
  return context;
}

// ============================================================================
// Hooks Specialises par Module
// ============================================================================

/**
 * Hook pour les features du module Catalog
 */
export function useCatalogFeatures() {
  const { isModuleEnabled, isSubFeatureEnabled, getSubFeatureConfig } = useFeatures();

  return useMemo(
    () => ({
      isEnabled: isModuleEnabled('catalog'),
      hasSearch: isSubFeatureEnabled('catalog', 'search'),
      hasFilters: isSubFeatureEnabled('catalog', 'filters'),
      hasSorting: isSubFeatureEnabled('catalog', 'sorting'),
      hasQuickView: isSubFeatureEnabled('catalog', 'quickView'),
      hasComparison: isSubFeatureEnabled('catalog', 'comparison'),
      hasBulkActions: isSubFeatureEnabled('catalog', 'bulkActions'),
      getSearchConfig: () => getSubFeatureConfig('catalog', 'search'),
      getFiltersConfig: () => getSubFeatureConfig('catalog', 'filters'),
      getSortingConfig: () => getSubFeatureConfig('catalog', 'sorting'),
      getComparisonConfig: () => getSubFeatureConfig('catalog', 'comparison'),
    }),
    [isModuleEnabled, isSubFeatureEnabled, getSubFeatureConfig]
  );
}

/**
 * Hook pour les features du module Cart
 */
export function useCartFeatures() {
  const { isModuleEnabled, isSubFeatureEnabled, getSubFeatureConfig } = useFeatures();

  return useMemo(
    () => ({
      isEnabled: isModuleEnabled('cart'),
      hasQuickAdd: isSubFeatureEnabled('cart', 'quickAdd'),
      hasBulkAdd: isSubFeatureEnabled('cart', 'bulkAdd'),
      hasSavedCarts: isSubFeatureEnabled('cart', 'savedCarts'),
      hasNotes: isSubFeatureEnabled('cart', 'notes'),
      hasQuantityRules: isSubFeatureEnabled('cart', 'quantityRules'),
      getSavedCartsConfig: () => getSubFeatureConfig('cart', 'savedCarts'),
      getQuantityRulesConfig: () => getSubFeatureConfig('cart', 'quantityRules'),
    }),
    [isModuleEnabled, isSubFeatureEnabled, getSubFeatureConfig]
  );
}

/**
 * Hook pour les features du module Checkout
 */
export function useCheckoutFeatures() {
  const { isModuleEnabled, isSubFeatureEnabled } = useFeatures();

  return useMemo(
    () => ({
      isEnabled: isModuleEnabled('checkout'),
      hasGuestCheckout: isSubFeatureEnabled('checkout', 'guestCheckout'),
      hasMultipleAddresses: isSubFeatureEnabled('checkout', 'multipleAddresses'),
      hasSplitShipment: isSubFeatureEnabled('checkout', 'splitShipment'),
      hasOrderNotes: isSubFeatureEnabled('checkout', 'orderNotes'),
    }),
    [isModuleEnabled, isSubFeatureEnabled]
  );
}

/**
 * Hook pour les features du module Orders
 */
export function useOrdersFeatures() {
  const { isModuleEnabled, isSubFeatureEnabled, getSubFeatureConfig } = useFeatures();

  return useMemo(
    () => ({
      isEnabled: isModuleEnabled('orders'),
      hasReorder: isSubFeatureEnabled('orders', 'reorder'),
      hasTracking: isSubFeatureEnabled('orders', 'tracking'),
      hasExportPdf: isSubFeatureEnabled('orders', 'exportPdf'),
      hasOrderHistory: isSubFeatureEnabled('orders', 'orderHistory'),
      getOrderHistoryConfig: () => getSubFeatureConfig('orders', 'orderHistory'),
    }),
    [isModuleEnabled, isSubFeatureEnabled, getSubFeatureConfig]
  );
}

/**
 * Hook pour les features du module Quotes
 */
export function useQuotesFeatures() {
  const { isModuleEnabled, isSubFeatureEnabled, getSubFeatureConfig } = useFeatures();

  return useMemo(
    () => ({
      isEnabled: isModuleEnabled('quotes'),
      hasRequestQuote: isSubFeatureEnabled('quotes', 'requestQuote'),
      hasNegotiation: isSubFeatureEnabled('quotes', 'negotiation'),
      hasQuoteToOrder: isSubFeatureEnabled('quotes', 'quoteToOrder'),
      hasExpirationAlerts: isSubFeatureEnabled('quotes', 'expirationAlerts'),
      getExpirationAlertsConfig: () => getSubFeatureConfig('quotes', 'expirationAlerts'),
    }),
    [isModuleEnabled, isSubFeatureEnabled, getSubFeatureConfig]
  );
}

/**
 * Hook pour les features du module Approvals
 */
export function useApprovalsFeatures() {
  const { isModuleEnabled, isSubFeatureEnabled, getSubFeatureConfig } = useFeatures();

  return useMemo(
    () => ({
      isEnabled: isModuleEnabled('approvals'),
      hasMultiLevel: isSubFeatureEnabled('approvals', 'multiLevel'),
      hasBudgetLimits: isSubFeatureEnabled('approvals', 'budgetLimits'),
      hasNotifications: isSubFeatureEnabled('approvals', 'notifications'),
      hasDelegation: isSubFeatureEnabled('approvals', 'delegation'),
      getMultiLevelConfig: () => getSubFeatureConfig('approvals', 'multiLevel'),
    }),
    [isModuleEnabled, isSubFeatureEnabled, getSubFeatureConfig]
  );
}

/**
 * Hook pour les features du module Company
 */
export function useCompanyFeatures() {
  const { isModuleEnabled, isSubFeatureEnabled, getSubFeatureConfig } = useFeatures();

  return useMemo(
    () => ({
      isEnabled: isModuleEnabled('company'),
      hasEmployees: isSubFeatureEnabled('company', 'employees'),
      hasRoles: isSubFeatureEnabled('company', 'roles'),
      hasAddresses: isSubFeatureEnabled('company', 'addresses'),
      hasBudgets: isSubFeatureEnabled('company', 'budgets'),
      hasDepartments: isSubFeatureEnabled('company', 'departments'),
      getEmployeesConfig: () => getSubFeatureConfig('company', 'employees'),
      getAddressesConfig: () => getSubFeatureConfig('company', 'addresses'),
    }),
    [isModuleEnabled, isSubFeatureEnabled, getSubFeatureConfig]
  );
}

/**
 * Hook pour les features du module Lists
 */
export function useListsFeatures() {
  const { isModuleEnabled, isSubFeatureEnabled, getSubFeatureConfig } = useFeatures();

  return useMemo(
    () => ({
      isEnabled: isModuleEnabled('lists'),
      hasWishlist: isSubFeatureEnabled('lists', 'wishlist'),
      hasFavorites: isSubFeatureEnabled('lists', 'favorites'),
      hasSharedLists: isSubFeatureEnabled('lists', 'sharedLists'),
      hasPurchaseLists: isSubFeatureEnabled('lists', 'purchaseLists'),
      getPurchaseListsConfig: () => getSubFeatureConfig('lists', 'purchaseLists'),
    }),
    [isModuleEnabled, isSubFeatureEnabled, getSubFeatureConfig]
  );
}

/**
 * Hook pour les features du module Comparison
 */
export function useComparisonFeatures() {
  const { isModuleEnabled, isSubFeatureEnabled, getSubFeatureConfig } = useFeatures();

  return useMemo(
    () => ({
      isEnabled: isModuleEnabled('comparison'),
      hasCompareTable: isSubFeatureEnabled('comparison', 'compareTable'),
      hasExport: isSubFeatureEnabled('comparison', 'export'),
      hasMaxItems: isSubFeatureEnabled('comparison', 'maxItems'),
      getMaxItemsConfig: () => getSubFeatureConfig('comparison', 'maxItems'),
    }),
    [isModuleEnabled, isSubFeatureEnabled, getSubFeatureConfig]
  );
}

/**
 * Hook pour les features du module Dashboard
 */
export function useDashboardFeatures() {
  const { isModuleEnabled, isSubFeatureEnabled, getSubFeatureConfig } = useFeatures();

  return useMemo(
    () => ({
      isEnabled: isModuleEnabled('dashboard'),
      hasAnalytics: isSubFeatureEnabled('dashboard', 'analytics'),
      hasQuickActions: isSubFeatureEnabled('dashboard', 'quickActions'),
      hasRecentOrders: isSubFeatureEnabled('dashboard', 'recentOrders'),
      hasPendingQuotes: isSubFeatureEnabled('dashboard', 'pendingQuotes'),
      getRecentOrdersConfig: () => getSubFeatureConfig('dashboard', 'recentOrders'),
    }),
    [isModuleEnabled, isSubFeatureEnabled, getSubFeatureConfig]
  );
}

/**
 * Hook pour les features du module QuickOrder
 */
export function useQuickOrderFeatures() {
  const { isModuleEnabled, isSubFeatureEnabled, getSubFeatureConfig } = useFeatures();

  return useMemo(
    () => ({
      isEnabled: isModuleEnabled('quickOrder'),
      hasSkuEntry: isSubFeatureEnabled('quickOrder', 'skuEntry'),
      hasCsvImport: isSubFeatureEnabled('quickOrder', 'csvImport'),
      hasPastOrders: isSubFeatureEnabled('quickOrder', 'pastOrders'),
      hasTemplates: isSubFeatureEnabled('quickOrder', 'templates'),
      getTemplatesConfig: () => getSubFeatureConfig('quickOrder', 'templates'),
    }),
    [isModuleEnabled, isSubFeatureEnabled, getSubFeatureConfig]
  );
}

/**
 * Hook pour les features du module Warehouse
 */
export function useWarehouseFeatures() {
  const { isModuleEnabled, isSubFeatureEnabled } = useFeatures();

  return useMemo(
    () => ({
      isEnabled: isModuleEnabled('warehouse'),
      hasStockVisibility: isSubFeatureEnabled('warehouse', 'stockVisibility'),
      hasWarehouseSelection: isSubFeatureEnabled('warehouse', 'warehouseSelection'),
      hasDeliveryEstimates: isSubFeatureEnabled('warehouse', 'deliveryEstimates'),
    }),
    [isModuleEnabled, isSubFeatureEnabled]
  );
}
