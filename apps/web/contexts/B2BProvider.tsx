'use client';

/**
 * B2B Provider - Unified Provider
 *
 * Composes all B2B sub-contexts into a single provider for easy integration.
 * This is the main entry point for B2B functionality in the application.
 *
 * @packageDocumentation
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type {
  QuoteSummary,
  QuoteStatus,
  ApprovalSummary,
  ApprovalStatus,
  OrderSummary,
  B2BOrderStatus,
  ReportPeriod,
  ReportData,
  BulkOrderItem,
  ProductCatalogEntry,
  BulkOrderValidationResult,
  BulkOrderValidationError,
  EmployeeSpending,
  CategorySpending,
  MonthlyTrend,
  TopProduct,
} from '@maison/types';

// Import sub-context providers
import { CompanyProvider, useCompany } from './CompanyContext';
import { EmployeeProvider, useEmployee } from './EmployeeContext';
import { WarehouseProvider, useWarehouse } from './WarehouseContext';
import { PricingProvider, usePricing } from './PricingContext';
import { SearchProvider, useSearch } from './SearchContext';

// ============================================================================
// Mock Data for Quotes, Approvals, Orders, Reports
// ============================================================================

const mockQuotes: QuoteSummary[] = [
  {
    id: 'quote_001',
    quoteNumber: 'Q-2024-001',
    companyId: 'comp_001',
    companyName: 'Bijouterie Parisienne',
    status: 'submitted',
    priority: 'normal',
    itemCount: 12,
    total: 4500,
    currency: 'EUR',
    validUntil: '2025-01-15T23:59:59Z',
    createdAt: '2024-12-15T14:30:00Z',
    updatedAt: '2024-12-15T16:00:00Z',
    hasUnreadMessages: false,
  },
  {
    id: 'quote_002',
    quoteNumber: 'Q-2024-002',
    companyId: 'comp_001',
    companyName: 'Bijouterie Parisienne',
    status: 'responded',
    priority: 'normal',
    itemCount: 8,
    total: 2800,
    currency: 'EUR',
    validUntil: '2025-01-14T23:59:59Z',
    createdAt: '2024-12-14T10:00:00Z',
    updatedAt: '2024-12-14T16:45:00Z',
    hasUnreadMessages: true,
  },
  {
    id: 'quote_003',
    quoteNumber: 'Q-2024-003',
    companyId: 'comp_001',
    companyName: 'Bijouterie Parisienne',
    status: 'accepted',
    priority: 'high',
    itemCount: 15,
    total: 6200,
    currency: 'EUR',
    validUntil: '2025-01-10T23:59:59Z',
    createdAt: '2024-12-10T09:00:00Z',
    updatedAt: '2024-12-12T11:30:00Z',
    hasUnreadMessages: false,
  },
];

const mockApprovals: ApprovalSummary[] = [
  {
    id: 'app_001',
    requestNumber: 'APP-2024-001',
    entityType: 'order',
    entityReference: 'CMD-2024-005',
    entitySummary: 'Commande de 20 bracelets collection Printemps',
    entityAmount: 3200,
    entityCurrency: 'EUR',
    requesterName: 'Sophie Martin',
    status: 'pending',
    currentLevel: 1,
    totalLevels: 1,
    priority: 'high',
    createdAt: '2024-12-14T16:45:00Z',
    dueAt: '2024-12-17T23:59:59Z',
    isOverdue: false,
  },
  {
    id: 'app_002',
    requestNumber: 'APP-2024-002',
    entityType: 'quote',
    entityReference: 'Q-2024-012',
    entitySummary: 'Devis collection Ete - 50 pieces',
    entityAmount: 8500,
    entityCurrency: 'EUR',
    requesterName: 'Pierre Dubois',
    status: 'pending',
    currentLevel: 1,
    totalLevels: 2,
    priority: 'normal',
    createdAt: '2024-12-13T10:30:00Z',
    dueAt: '2024-12-20T23:59:59Z',
    isOverdue: false,
  },
  {
    id: 'app_003',
    requestNumber: 'APP-2024-003',
    entityType: 'order',
    entityReference: 'CMD-2024-006',
    entitySummary: 'Commande reapprovisionnement bagues',
    entityAmount: 1800,
    entityCurrency: 'EUR',
    requesterName: 'Julie Leroy',
    status: 'pending',
    currentLevel: 1,
    totalLevels: 1,
    priority: 'low',
    createdAt: '2024-12-12T14:15:00Z',
    dueAt: '2024-12-19T23:59:59Z',
    isOverdue: false,
  },
];

const mockOrders: OrderSummary[] = [
  {
    id: 'ord_001',
    orderNumber: 'CMD-2024-001',
    status: 'delivered',
    itemCount: 8,
    total: 2450.0,
    currency: 'EUR',
    orderedBy: 'Marie Dupont',
    shippingAddress: '15 rue de la Paix, 75002 Paris',
    trackingNumber: 'FR123456789',
    createdAt: '2024-12-15T10:30:00Z',
    deliveredAt: '2024-12-18T14:00:00Z',
  },
  {
    id: 'ord_002',
    orderNumber: 'CMD-2024-002',
    status: 'shipped',
    itemCount: 12,
    total: 3800.0,
    currency: 'EUR',
    orderedBy: 'Pierre Martin',
    shippingAddress: '45 Avenue des Champs-Elysees, 75008 Paris',
    trackingNumber: 'FR987654321',
    createdAt: '2024-12-14T09:00:00Z',
    shippedAt: '2024-12-16T11:30:00Z',
  },
  {
    id: 'ord_003',
    orderNumber: 'CMD-2024-003',
    status: 'processing',
    itemCount: 5,
    total: 1250.0,
    currency: 'EUR',
    orderedBy: 'Sophie Bernard',
    shippingAddress: '123 Rue de la Paix, 75001 Paris',
    createdAt: '2024-12-13T14:15:00Z',
  },
  {
    id: 'ord_004',
    orderNumber: 'CMD-2024-004',
    status: 'pending_approval',
    itemCount: 20,
    total: 6500.0,
    currency: 'EUR',
    orderedBy: 'Pierre Martin',
    shippingAddress: '45 Avenue des Champs-Elysees, 75008 Paris',
    createdAt: '2024-12-12T16:45:00Z',
  },
];

const mockReportsData: ReportData = {
  summary: {
    totalSpending: 13500,
    budgetLimit: 22000,
    ordersCount: 48,
    averageOrder: 281.25,
    pendingApprovals: 3,
  },
  byEmployee: [
    { employeeId: 'emp_001', employeeName: 'Marie Dupont', totalSpending: 5200, ordersCount: 18, averageOrder: 288.89, percentOfTotal: 38.5 },
    { employeeId: 'emp_002', employeeName: 'Pierre Martin', totalSpending: 4800, ordersCount: 16, averageOrder: 300.0, percentOfTotal: 35.6 },
    { employeeId: 'emp_003', employeeName: 'Sophie Bernard', totalSpending: 3500, ordersCount: 14, averageOrder: 250.0, percentOfTotal: 25.9 },
  ] as EmployeeSpending[],
  byCategory: [
    { categoryId: 'cat_001', categoryName: 'Bagues', totalSpending: 4500, itemsCount: 45, percentOfTotal: 33.3 },
    { categoryId: 'cat_002', categoryName: 'Colliers', totalSpending: 3800, itemsCount: 22, percentOfTotal: 28.1 },
    { categoryId: 'cat_003', categoryName: 'Bracelets', totalSpending: 3200, itemsCount: 38, percentOfTotal: 23.7 },
    { categoryId: 'cat_004', categoryName: "Boucles d'oreilles", totalSpending: 2000, itemsCount: 28, percentOfTotal: 14.8 },
  ] as CategorySpending[],
  monthlyTrend: [
    { month: '2024-07', spending: 9500, ordersCount: 32, averageOrder: 296.88 },
    { month: '2024-08', spending: 11200, ordersCount: 38, averageOrder: 294.74 },
    { month: '2024-09', spending: 10800, ordersCount: 35, averageOrder: 308.57 },
    { month: '2024-10', spending: 12400, ordersCount: 42, averageOrder: 295.24 },
    { month: '2024-11', spending: 13100, ordersCount: 45, averageOrder: 291.11 },
    { month: '2024-12', spending: 13500, ordersCount: 48, averageOrder: 281.25 },
  ] as MonthlyTrend[],
  topProducts: [
    { productId: 'prod_001', productName: 'Bague Solitaire Or Blanc', sku: 'BAG-SOL-001', quantity: 15, totalSpending: 2250, averagePrice: 150 },
    { productId: 'prod_002', productName: 'Collier Perles Akoya', sku: 'COL-PER-002', quantity: 8, totalSpending: 1600, averagePrice: 200 },
    { productId: 'prod_003', productName: 'Bracelet Tennis Diamants', sku: 'BRA-TEN-003', quantity: 12, totalSpending: 1440, averagePrice: 120 },
  ] as TopProduct[],
};

const mockProductCatalog: Record<string, ProductCatalogEntry> = {
  'BAG-SOL-001': {
    productId: 'prod_001',
    sku: 'BAG-SOL-001',
    name: 'Bague Solitaire Or Blanc',
    description: 'Bague solitaire en or blanc 18K avec diamant 0.5ct',
    unitPrice: 150,
    currency: 'EUR',
    minQuantity: 1,
    maxQuantity: 100,
    availableStock: 45,
    category: 'Bagues',
    brand: 'Maison',
    imageUrl: '/images/products/solitaire-or-blanc.jpg',
  },
  'COL-PER-002': {
    productId: 'prod_002',
    sku: 'COL-PER-002',
    name: 'Collier Perles Akoya',
    description: 'Collier de perles Akoya 7-7.5mm avec fermoir or',
    unitPrice: 200,
    currency: 'EUR',
    minQuantity: 1,
    maxQuantity: 50,
    availableStock: 23,
    category: 'Colliers',
    brand: 'Maison',
    imageUrl: '/images/products/collier-perles-akoya.jpg',
  },
  'BRA-TEN-003': {
    productId: 'prod_003',
    sku: 'BRA-TEN-003',
    name: 'Bracelet Tennis Diamants',
    description: 'Bracelet tennis en or blanc avec diamants 2ct total',
    unitPrice: 120,
    currency: 'EUR',
    minQuantity: 1,
    maxQuantity: 30,
    availableStock: 18,
    category: 'Bracelets',
    brand: 'Maison',
    imageUrl: '/images/products/bracelet-tennis.jpg',
  },
};

// ============================================================================
// Types
// ============================================================================

/**
 * Operations context value (quotes, approvals, orders, reports)
 */
export interface OperationsContextValue {
  /** List of quotes */
  quotes: QuoteSummary[];
  /** Quotes loading state */
  quotesLoading: boolean;
  /** List of approvals */
  approvals: ApprovalSummary[];
  /** Approvals loading state */
  approvalsLoading: boolean;
  /** Pending approvals count */
  pendingApprovalsCount: number;
  /** List of orders */
  orders: OrderSummary[];
  /** Orders loading state */
  ordersLoading: boolean;
  /** Reports data */
  reports: ReportData;
  /** Reports loading state */
  reportsLoading: boolean;
  /** Refresh quotes data */
  refreshQuotes: (filters?: { status?: QuoteStatus | 'all' }) => Promise<void>;
  /** Refresh approvals data */
  refreshApprovals: (filters?: { status?: ApprovalStatus | 'all' }) => Promise<void>;
  /** Refresh orders data */
  refreshOrders: (filters?: { status?: B2BOrderStatus | 'all' }) => Promise<void>;
  /** Refresh reports data */
  refreshReports: (period: ReportPeriod) => Promise<void>;
  /** Product catalog for bulk orders */
  productCatalog: Record<string, ProductCatalogEntry>;
  /** Lookup products by SKUs for bulk order */
  lookupProducts: (skus: string[], quantities?: Record<string, number>) => Promise<BulkOrderItem[]>;
  /** Validate bulk order items */
  validateBulkOrder: (items: BulkOrderItem[]) => Promise<BulkOrderValidationResult>;
}

// ============================================================================
// Context
// ============================================================================

const OperationsContext = createContext<OperationsContextValue | null>(null);

// ============================================================================
// Operations Provider
// ============================================================================

interface OperationsProviderProps {
  children: React.ReactNode;
  mockMode?: boolean;
}

function OperationsProvider({ children, mockMode = true }: OperationsProviderProps) {
  const [quotes, setQuotes] = useState<QuoteSummary[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [approvals, setApprovals] = useState<ApprovalSummary[]>([]);
  const [approvalsLoading, setApprovalsLoading] = useState(false);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [reports, setReports] = useState<ReportData>(mockReportsData);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Initialize data
  useEffect(() => {
    if (mockMode) {
      setQuotes(mockQuotes);
      setApprovals(mockApprovals);
      setOrders(mockOrders);
      setReports(mockReportsData);
    }
  }, [mockMode]);

  // Pending approvals count
  const pendingApprovalsCount = useMemo(
    () => approvals.filter((a) => a.status === 'pending').length,
    [approvals]
  );

  // Refresh quotes
  const refreshQuotes = useCallback(
    async (filters?: { status?: QuoteStatus | 'all' }) => {
      setQuotesLoading(true);
      try {
        if (mockMode) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          if (filters?.status && filters.status !== 'all') {
            setQuotes(mockQuotes.filter((q) => q.status === filters.status));
          } else {
            setQuotes(mockQuotes);
          }
        }
      } catch (err) {
        console.error('Failed to refresh quotes:', err);
      } finally {
        setQuotesLoading(false);
      }
    },
    [mockMode]
  );

  // Refresh approvals
  const refreshApprovals = useCallback(
    async (filters?: { status?: ApprovalStatus | 'all' }) => {
      setApprovalsLoading(true);
      try {
        if (mockMode) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          if (filters?.status && filters.status !== 'all') {
            setApprovals(mockApprovals.filter((a) => a.status === filters.status));
          } else {
            setApprovals(mockApprovals);
          }
        }
      } catch (err) {
        console.error('Failed to refresh approvals:', err);
      } finally {
        setApprovalsLoading(false);
      }
    },
    [mockMode]
  );

  // Refresh orders
  const refreshOrders = useCallback(
    async (filters?: { status?: B2BOrderStatus | 'all' }) => {
      setOrdersLoading(true);
      try {
        if (mockMode) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          if (filters?.status && filters.status !== 'all') {
            setOrders(mockOrders.filter((o) => o.status === filters.status));
          } else {
            setOrders(mockOrders);
          }
        }
      } catch (err) {
        console.error('Failed to refresh orders:', err);
      } finally {
        setOrdersLoading(false);
      }
    },
    [mockMode]
  );

  // Refresh reports
  const refreshReports = useCallback(
    async (period: ReportPeriod) => {
      setReportsLoading(true);
      try {
        if (mockMode) {
          await new Promise((resolve) => setTimeout(resolve, 300));

          const periodMultiplier: Record<ReportPeriod, number> = {
            week: 0.25,
            month: 1,
            quarter: 3,
            year: 12,
          };

          const multiplier = periodMultiplier[period];
          setReports({
            ...mockReportsData,
            summary: {
              ...mockReportsData.summary,
              totalSpending: Math.round(mockReportsData.summary.totalSpending * multiplier),
              ordersCount: Math.round(mockReportsData.summary.ordersCount * multiplier),
            },
          });
        }
      } catch (err) {
        console.error('Failed to refresh reports:', err);
      } finally {
        setReportsLoading(false);
      }
    },
    [mockMode]
  );

  // Lookup products by SKUs
  const lookupProducts = useCallback(
    async (skus: string[], quantities?: Record<string, number>): Promise<BulkOrderItem[]> => {
      if (mockMode) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      return skus.map((sku) => {
        const product = mockProductCatalog[sku.toUpperCase()];
        const quantity = quantities?.[sku] ?? 1;

        if (product) {
          const productUnitPrice = product.unitPrice ?? 0;
          return {
            sku,
            quantity,
            product,
            isValid: true,
            unitPrice: productUnitPrice,
            lineTotal: productUnitPrice * quantity,
          };
        }

        return {
          sku,
          quantity,
          isValid: false,
          errors: ['Produit non trouve'],
        };
      });
    },
    [mockMode]
  );

  // Validate bulk order
  const validateBulkOrder = useCallback(
    async (items: BulkOrderItem[]): Promise<BulkOrderValidationResult> => {
      if (mockMode) {
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      const errors: BulkOrderValidationError[] = [];
      const validItems: BulkOrderItem[] = [];
      let totalAmount = 0;

      items.forEach((item, index) => {
        if (!item.isValid) {
          errors.push({
            row: index + 1,
            field: 'sku',
            code: 'PRODUCT_NOT_FOUND',
            message: `SKU "${item.sku}" non trouve`,
          });
          return;
        }

        const itemProductStock = item.product?.availableStock ?? 0;
        if (item.product && item.quantity > itemProductStock) {
          errors.push({
            row: index + 1,
            field: 'quantity',
            code: 'INSUFFICIENT_STOCK',
            message: `Stock insuffisant pour ${item.sku} (disponible: ${itemProductStock})`,
          });
          return;
        }

        if (item.product && item.product.minQuantity && item.quantity < item.product.minQuantity) {
          errors.push({
            row: index + 1,
            field: 'quantity',
            code: 'BELOW_MINIMUM',
            message: `Quantite minimum pour ${item.sku}: ${item.product.minQuantity}`,
          });
          return;
        }

        validItems.push(item);
        totalAmount += item.lineTotal ?? 0;
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings: [],
        validItems,
        invalidCount: errors.length,
        totalAmount,
        currency: 'EUR',
      };
    },
    [mockMode]
  );

  const value = useMemo<OperationsContextValue>(
    () => ({
      quotes,
      quotesLoading,
      approvals,
      approvalsLoading,
      pendingApprovalsCount,
      orders,
      ordersLoading,
      reports,
      reportsLoading,
      refreshQuotes,
      refreshApprovals,
      refreshOrders,
      refreshReports,
      productCatalog: mockProductCatalog,
      lookupProducts,
      validateBulkOrder,
    }),
    [
      quotes,
      quotesLoading,
      approvals,
      approvalsLoading,
      pendingApprovalsCount,
      orders,
      ordersLoading,
      reports,
      reportsLoading,
      refreshQuotes,
      refreshApprovals,
      refreshOrders,
      refreshReports,
      lookupProducts,
      validateBulkOrder,
    ]
  );

  return <OperationsContext.Provider value={value}>{children}</OperationsContext.Provider>;
}

// ============================================================================
// Main B2B Provider
// ============================================================================

export interface B2BProviderProps {
  children: React.ReactNode;
  /** Enable mock mode for development */
  mockMode?: boolean;
  /** Initial company ID */
  initialCompanyId?: string;
  /** Initial employee ID */
  initialEmployeeId?: string;
}

/**
 * B2B Provider
 *
 * Unified provider that composes all B2B sub-contexts:
 * - CompanyProvider: Company data and settings
 * - EmployeeProvider: Employee data and permissions
 * - WarehouseProvider: Warehouse/point-of-sale selection
 * - PricingProvider: B2B pricing and volume discounts
 * - SearchProvider: Search functionality
 * - OperationsProvider: Quotes, approvals, orders, reports
 *
 * @example
 * ```tsx
 * <B2BProvider mockMode={process.env.NODE_ENV === 'development'}>
 *   <App />
 * </B2BProvider>
 * ```
 */
export function B2BProvider({
  children,
  mockMode = true,
  initialCompanyId,
  initialEmployeeId,
}: B2BProviderProps) {
  return (
    <CompanyProvider initialCompanyId={initialCompanyId} mockMode={mockMode}>
      <EmployeeProvider
        companyId={initialCompanyId}
        initialEmployeeId={initialEmployeeId}
        mockMode={mockMode}
      >
        <WarehouseProvider mockMode={mockMode}>
          <PricingProvider mockMode={mockMode}>
            <SearchProvider mockMode={mockMode}>
              <OperationsProvider mockMode={mockMode}>{children}</OperationsProvider>
            </SearchProvider>
          </PricingProvider>
        </WarehouseProvider>
      </EmployeeProvider>
    </CompanyProvider>
  );
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to access operations context (quotes, approvals, orders, reports)
 */
export function useOperations(): OperationsContextValue {
  const context = useContext(OperationsContext);
  if (!context) {
    throw new Error('useOperations must be used within a B2BProvider');
  }
  return context;
}

/**
 * Hook to access quotes
 */
export function useQuotes() {
  const { quotes, quotesLoading, refreshQuotes } = useOperations();
  return { quotes, isLoading: quotesLoading, refresh: refreshQuotes };
}

/**
 * Hook to access approvals
 */
export function useApprovals() {
  const { approvals, approvalsLoading, pendingApprovalsCount, refreshApprovals } = useOperations();
  return {
    approvals,
    isLoading: approvalsLoading,
    pendingCount: pendingApprovalsCount,
    refresh: refreshApprovals,
  };
}

/**
 * Hook to access orders
 */
export function useOrders() {
  const { orders, ordersLoading, refreshOrders } = useOperations();
  return { orders, isLoading: ordersLoading, refresh: refreshOrders };
}

/**
 * Hook to access reports
 */
export function useReports() {
  const { reports, reportsLoading, refreshReports } = useOperations();
  return { reports, isLoading: reportsLoading, refresh: refreshReports };
}

/**
 * Hook to access bulk order functionality
 */
export function useBulkOrder() {
  const { productCatalog, lookupProducts, validateBulkOrder } = useOperations();
  return { productCatalog, lookupProducts, validateBulkOrder };
}

/**
 * Unified B2B hook - provides access to all B2B functionality
 * For backward compatibility with existing code
 */
export function useB2B() {
  const company = useCompany();
  const employee = useEmployee();
  const warehouse = useWarehouse();
  const pricing = usePricing();
  const search = useSearch();
  const operations = useOperations();

  return useMemo(
    () => ({
      // Company
      company: company.company,
      addresses: company.addresses,
      creditInfo: company.creditInfo,
      tier: company.tier,
      switchCompany: company.switchCompany,
      clearCompany: company.clearCompany,

      // Employee
      employee: employee.employee,
      employees: employee.employees,
      role: employee.role,
      permissions: employee.permissions,
      isApprover: employee.isApprover,
      spendingSummary: employee.spendingSummary,
      canPerform: employee.canPerform,
      hasPermission: employee.hasPermission,
      checkSpendingLimit: employee.checkSpendingLimit,

      // Warehouse
      warehouses: warehouse.warehouses,
      selectedWarehouse: warehouse.selectedWarehouse,
      selectWarehouse: warehouse.selectWarehouse,
      findNearestWarehouse: warehouse.findNearestWarehouse,

      // Pricing
      activePriceList: pricing.activePriceList,
      calculatePrice: pricing.calculatePrice,
      formatPrice: pricing.formatPrice,
      getVolumeDiscounts: pricing.getVolumeDiscounts,

      // Search
      searchState: search.state,
      isSearchOpen: search.isSearchOpen,
      openSearch: search.openSearch,
      closeSearch: search.closeSearch,
      search: search.search,

      // Operations
      quotes: operations.quotes,
      quotesLoading: operations.quotesLoading,
      approvals: operations.approvals,
      approvalsLoading: operations.approvalsLoading,
      pendingApprovalsCount: operations.pendingApprovalsCount,
      orders: operations.orders,
      ordersLoading: operations.ordersLoading,
      reports: operations.reports,
      reportsLoading: operations.reportsLoading,
      refreshQuotes: operations.refreshQuotes,
      refreshApprovals: operations.refreshApprovals,
      refreshOrders: operations.refreshOrders,
      refreshReports: operations.refreshReports,
      lookupProducts: operations.lookupProducts,
      validateBulkOrder: operations.validateBulkOrder,

      // Loading states
      isLoading: company.isLoading || employee.isLoading || warehouse.isLoading || pricing.isLoading,
      isB2BActive: !!company.company && !!employee.employee,
      isReady: !company.isLoading && !employee.isLoading,
    }),
    [company, employee, warehouse, pricing, search, operations]
  );
}

// Re-export sub-context hooks for direct access
export { useCompany, useCreditInfo, useCompanyAddresses } from './CompanyContext';
export { useEmployee, usePermissions, useSpendingLimits, useB2BPermissions } from './EmployeeContext';
export { useWarehouse, useSelectedWarehouse, usePickupPoints } from './WarehouseContext';
export { usePricing, useProductPrice, usePriceFormatter, useVolumeDiscounts } from './PricingContext';
export {
  useSearch,
  useSearchState,
  useSearchFilters,
  useSearchPagination,
  useSearchSuggestions,
  useSearchOverlay,
} from './SearchContext';

export default B2BProvider;
