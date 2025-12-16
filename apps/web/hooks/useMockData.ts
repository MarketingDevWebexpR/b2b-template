/**
 * useMockData Hook
 *
 * Hook pour acceder aux donnees mockees de maniere type-safe
 * et integree avec le systeme de feature flags.
 *
 * @packageDocumentation
 */

'use client';

import { useMemo } from 'react';
import { isMockDataEnabled } from '@/config/features/loader';

// Import des donnees mockees
import {
  // Products
  mockProducts,
  newProducts,
  bestSellers,
  onSaleProducts,
  searchProducts,
  createMockProduct,
  type MockProduct,
  type MockProductVariant,
  // Categories
  mockCategories,
  mockCategoryTree,
  mockParentCategories,
  mockChildCategories,
  type MockCategory,
  // Company
  mockCompanies,
  currentCompany,
  currentUser,
  type MockCompany,
  type MockUser,
  // Cart
  mockCurrentCart,
  mockEmptyCart,
  createMockCart,
  type MockCart,
  type MockCartItem,
  type MockSavedCart,
  // Orders
  createMockOrders,
  filterOrdersByStatus,
  getOrderStats,
  type MockOrder,
  type OrderStatus,
  // Quotes
  createMockQuotes,
  getQuoteStats,
  type MockQuote,
  type QuoteStatus,
  // Warehouses
  mockWarehouses,
  mockWarehouseStocks,
  mockPickupPoints,
  getProductAvailability,
  findNearestWarehouse,
  type MockWarehouse,
  type MockWarehouseStock,
  // Addresses
  mockAddresses,
  type MockAddress,
} from '@/lib/mock';

/**
 * Interface pour les donnees mockees du catalogue
 */
interface MockCatalogData {
  products: MockProduct[];
  newProducts: MockProduct[];
  bestSellers: MockProduct[];
  onSaleProducts: MockProduct[];
  categories: MockCategory[];
  categoryTree: MockCategory[];
  parentCategories: MockCategory[];
  childCategories: MockCategory[];
  searchProducts: typeof searchProducts;
  createProduct: typeof createMockProduct;
}

/**
 * Interface pour les donnees mockees du panier
 */
interface MockCartData {
  currentCart: MockCart;
  emptyCart: MockCart;
  createCart: typeof createMockCart;
}

/**
 * Interface pour les donnees mockees des commandes
 */
interface MockOrdersData {
  orders: MockOrder[];
  filterByStatus: typeof filterOrdersByStatus;
  stats: ReturnType<typeof getOrderStats>;
}

/**
 * Interface pour les donnees mockees des devis
 */
interface MockQuotesData {
  quotes: MockQuote[];
  stats: ReturnType<typeof getQuoteStats>;
}

/**
 * Interface pour les donnees mockees de l'entreprise
 */
interface MockCompanyData {
  companies: MockCompany[];
  currentCompany: MockCompany;
  currentUser: MockUser;
  addresses: MockAddress[];
}

/**
 * Interface pour les donnees mockees des entrepots
 */
interface MockWarehouseData {
  warehouses: MockWarehouse[];
  stocks: MockWarehouseStock[];
  pickupPoints: typeof mockPickupPoints;
  getAvailability: typeof getProductAvailability;
  findNearest: typeof findNearestWarehouse;
}

/**
 * Interface complete pour toutes les donnees mockees
 */
export interface MockDataStore {
  isEnabled: boolean;
  catalog: MockCatalogData;
  cart: MockCartData;
  orders: MockOrdersData;
  quotes: MockQuotesData;
  company: MockCompanyData;
  warehouse: MockWarehouseData;
}

// Pre-generate orders and quotes for consistency using current company/user
const preGeneratedOrders = createMockOrders(currentCompany.id, currentUser.id, 50);
const preGeneratedQuotes = createMockQuotes(currentCompany.id, currentUser.id, 25);

/**
 * Hook principal pour acceder aux donnees mockees
 *
 * @example
 * ```tsx
 * const { isEnabled, catalog, cart, orders } = useMockData();
 *
 * if (isEnabled) {
 *   // Utiliser les donnees mockees
 *   const products = catalog.products;
 * } else {
 *   // Utiliser les donnees reelles depuis Medusa
 * }
 * ```
 */
export function useMockData(): MockDataStore {
  const isEnabled = useMemo(() => isMockDataEnabled(), []);

  const catalog: MockCatalogData = useMemo(
    () => ({
      products: mockProducts,
      newProducts,
      bestSellers,
      onSaleProducts,
      categories: mockCategories,
      categoryTree: mockCategoryTree,
      parentCategories: mockParentCategories,
      childCategories: mockChildCategories,
      searchProducts,
      createProduct: createMockProduct,
    }),
    []
  );

  const cart: MockCartData = useMemo(
    () => ({
      currentCart: mockCurrentCart,
      emptyCart: mockEmptyCart,
      createCart: createMockCart,
    }),
    []
  );

  const orders: MockOrdersData = useMemo(
    () => ({
      orders: preGeneratedOrders,
      filterByStatus: filterOrdersByStatus,
      stats: getOrderStats(preGeneratedOrders),
    }),
    []
  );

  const quotes: MockQuotesData = useMemo(
    () => ({
      quotes: preGeneratedQuotes,
      stats: getQuoteStats(preGeneratedQuotes),
    }),
    []
  );

  const company: MockCompanyData = useMemo(
    () => ({
      companies: mockCompanies,
      currentCompany,
      currentUser,
      addresses: mockAddresses,
    }),
    []
  );

  const warehouse: MockWarehouseData = useMemo(
    () => ({
      warehouses: mockWarehouses,
      stocks: mockWarehouseStocks,
      pickupPoints: mockPickupPoints,
      getAvailability: getProductAvailability,
      findNearest: findNearestWarehouse,
    }),
    []
  );

  return {
    isEnabled,
    catalog,
    cart,
    orders,
    quotes,
    company,
    warehouse,
  };
}

/**
 * Hook pour les donnees du catalogue uniquement
 */
export function useMockCatalog() {
  const { isEnabled, catalog } = useMockData();
  return { isEnabled, ...catalog };
}

/**
 * Hook pour les donnees du panier uniquement
 */
export function useMockCart() {
  const { isEnabled, cart } = useMockData();
  return { isEnabled, ...cart };
}

/**
 * Hook pour les donnees des commandes uniquement
 */
export function useMockOrders() {
  const { isEnabled, orders } = useMockData();
  return { isEnabled, ...orders };
}

/**
 * Hook pour les donnees des devis uniquement
 */
export function useMockQuotes() {
  const { isEnabled, quotes } = useMockData();
  return { isEnabled, ...quotes };
}

/**
 * Hook pour les donnees de l'entreprise uniquement
 */
export function useMockCompany() {
  const { isEnabled, company } = useMockData();
  return { isEnabled, ...company };
}

/**
 * Hook pour les donnees des entrepots uniquement
 */
export function useMockWarehouse() {
  const { isEnabled, warehouse } = useMockData();
  return { isEnabled, ...warehouse };
}

// Re-export types for convenience
export type {
  MockProduct,
  MockProductVariant,
  MockCategory,
  MockCompany,
  MockUser,
  MockCart,
  MockCartItem,
  MockSavedCart,
  MockOrder,
  OrderStatus,
  MockQuote,
  QuoteStatus,
  MockWarehouse,
  MockWarehouseStock,
  MockAddress,
};
