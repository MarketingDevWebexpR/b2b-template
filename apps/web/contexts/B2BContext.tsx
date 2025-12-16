'use client';

/**
 * B2B Context Provider
 *
 * Provides B2B functionality to the entire application:
 * - API client initialization
 * - Company context and employee information
 * - Permission checking
 * - B2B operations (quotes, approvals, spending)
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type {
  Company,
  Employee,
  QuoteSummary,
  QuoteStatus,
  ApprovalSummary,
  ApprovalStatus,
  OrderSummary,
  B2BOrderStatus,
  ReportPeriod,
  ReportSummary,
  EmployeeSpending,
  CategorySpending,
  MonthlyTrend,
  TopProduct,
  ReportData,
  BulkOrderItem,
  ProductCatalogEntry,
  BulkOrderValidationResult,
} from '@maison/types';

/**
 * B2B actions that can be checked for permissions
 */
export type B2BAction =
  | 'create_quote'
  | 'approve_order'
  | 'manage_employees'
  | 'view_spending'
  | 'edit_company'
  | 'place_order';

/**
 * Mock API client for development
 * In production, this will be replaced by the real API client
 */
interface MockApiClient {
  b2b: {
    companies: {
      get: (id: string) => Promise<Company>;
      list: () => Promise<Company[]>;
    };
    employees: {
      get: (id: string) => Promise<Employee>;
      list: (companyId: string) => Promise<Employee[]>;
    };
    quotes: {
      list: (filters?: Record<string, unknown>) => Promise<unknown[]>;
      get: (id: string) => Promise<unknown>;
      create: (input: unknown) => Promise<unknown>;
      update: (id: string, input: unknown) => Promise<unknown>;
    };
    approvals: {
      list: (filters?: Record<string, unknown>) => Promise<unknown[]>;
      get: (id: string) => Promise<unknown>;
      approve: (id: string) => Promise<unknown>;
      reject: (id: string, reason: string) => Promise<unknown>;
    };
    orders: {
      list: (filters?: Record<string, unknown>) => Promise<unknown[]>;
      get: (id: string) => Promise<unknown>;
    };
    spending: {
      getSummary: () => Promise<unknown>;
      getHistory: () => Promise<unknown[]>;
    };
  };
  getB2BContext: () => { companyId?: string; employeeId?: string } | null;
  setB2BContext: (companyId: string, employeeId?: string) => void;
  clearB2BContext: () => void;
  isB2BEnabled: () => boolean;
}

/**
 * Mock data for development
 */
const mockCompany: Company = {
  id: 'comp_001',
  name: 'Bijouterie Parisienne',
  tradeName: 'Bijouterie Parisienne',
  slug: 'bijouterie-parisienne',
  email: 'contact@bijouterie-parisienne.fr',
  phone: '+33 1 23 45 67 89',
  website: 'https://bijouterie-parisienne.fr',
  taxId: 'FR12345678901',
  tier: 'premium',
  status: 'active',
  settings: {
    defaultCurrency: 'EUR',
    defaultLanguage: 'fr',
    taxExempt: false,
    marketingOptIn: true,
    orderNotificationEmails: ['orders@bijouterie-parisienne.fr'],
    invoiceNotificationEmails: ['comptabilite@bijouterie-parisienne.fr'],
    allowEmployeeOrders: true,
    requireOrderApproval: true,
    allowCreditPurchases: true,
    autoReorderEnabled: false,
  },
  paymentTerms: {
    type: 'net_30',
    allowPartialPayments: true,
  },
  creditLimit: 50000,
  creditUsed: 12500,
  creditAvailable: 37500,
  addresses: [
    {
      id: 'addr_001',
      type: 'billing',
      label: 'Siège social',
      isDefault: true,
      companyName: 'Bijouterie Parisienne',
      addressLine1: '123 Rue de la Paix',
      city: 'Paris',
      postalCode: '75001',
      countryCode: 'FR',
      phone: '+33 1 23 45 67 89',
      isVerified: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'addr_002',
      type: 'shipping',
      label: 'Boutique Champs-Élysées',
      isDefault: true,
      companyName: 'Bijouterie Parisienne - Boutique',
      addressLine1: '45 Avenue des Champs-Élysées',
      city: 'Paris',
      postalCode: '75008',
      countryCode: 'FR',
      phone: '+33 1 23 45 67 90',
      isVerified: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
  ],
  tags: ['premium', 'paris'],
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-12-01T14:30:00Z',
};

const mockEmployee: Employee = {
  id: 'emp_001',
  userId: 'user_001',
  companyId: 'comp_001',
  firstName: 'Marie',
  lastName: 'Dupont',
  fullName: 'Marie Dupont',
  email: 'marie.dupont@bijouterie-parisienne.fr',
  jobTitle: 'Responsable Achats',
  role: 'admin',
  permissions: [
    'orders.create',
    'orders.approve',
    'quotes.create',
    'quotes.view',
    'spending.view_reports',
    'company.manage_employees',
    'company.edit',
  ],
  spendingLimitPerOrder: 5000,
  spendingLimitDaily: 10000,
  spendingLimitMonthly: 50000,
  currentDailySpending: 450,
  currentWeeklySpending: 2800,
  currentMonthlySpending: 8500,
  status: 'active',
  isApprover: true,
  canApproveFor: ['emp_002', 'emp_003'],
  notificationPreference: 'email',
  createdAt: '2024-01-20T09:00:00Z',
  updatedAt: '2024-11-15T14:30:00Z',
};

const mockEmployeesList: Employee[] = [
  mockEmployee,
  {
    id: 'emp_002',
    userId: 'user_002',
    companyId: 'comp_001',
    firstName: 'Pierre',
    lastName: 'Martin',
    fullName: 'Pierre Martin',
    email: 'pierre.martin@bijouterie-parisienne.fr',
    jobTitle: 'Acheteur',
    role: 'purchaser',
    permissions: ['orders.create', 'quotes.create', 'quotes.view'],
    spendingLimitPerOrder: 2000,
    spendingLimitDaily: 5000,
    spendingLimitMonthly: 20000,
    currentDailySpending: 800,
    currentWeeklySpending: 3200,
    currentMonthlySpending: 12000,
    status: 'active',
    isApprover: false,
    canApproveFor: [],
    notificationPreference: 'email',
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-10-20T16:45:00Z',
  },
  {
    id: 'emp_003',
    userId: 'user_003',
    companyId: 'comp_001',
    firstName: 'Sophie',
    lastName: 'Bernard',
    fullName: 'Sophie Bernard',
    email: 'sophie.bernard@bijouterie-parisienne.fr',
    jobTitle: 'Comptable',
    role: 'viewer',
    permissions: ['spending.view_reports'],
    currentDailySpending: 0,
    currentWeeklySpending: 0,
    currentMonthlySpending: 0,
    status: 'active',
    isApprover: false,
    canApproveFor: [],
    notificationPreference: 'email',
    createdAt: '2024-03-05T11:00:00Z',
    updatedAt: '2024-09-15T09:20:00Z',
  },
];

/**
 * Mock quotes data for development
 */
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
  {
    id: 'quote_004',
    quoteNumber: 'Q-2024-004',
    companyId: 'comp_001',
    companyName: 'Bijouterie Parisienne',
    status: 'expired',
    priority: 'low',
    itemCount: 5,
    total: 1200,
    currency: 'EUR',
    validUntil: '2024-12-05T23:59:59Z',
    createdAt: '2024-12-01T08:00:00Z',
    updatedAt: '2024-12-05T23:59:59Z',
    hasUnreadMessages: false,
  },
  {
    id: 'quote_005',
    quoteNumber: 'Q-2024-005',
    companyId: 'comp_001',
    companyName: 'Bijouterie Parisienne',
    status: 'rejected',
    priority: 'normal',
    itemCount: 3,
    total: 950,
    currency: 'EUR',
    validUntil: '2024-12-01T23:59:59Z',
    createdAt: '2024-11-20T14:00:00Z',
    updatedAt: '2024-11-25T10:00:00Z',
    hasUnreadMessages: false,
  },
];

/**
 * Mock approvals data for development
 */
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
  {
    id: 'app_004',
    requestNumber: 'APP-2024-004',
    entityType: 'order',
    entityReference: 'CMD-2024-004',
    entitySummary: 'Commande speciale client VIP',
    entityAmount: 4500,
    entityCurrency: 'EUR',
    requesterName: 'Sophie Martin',
    status: 'approved',
    currentLevel: 1,
    totalLevels: 1,
    priority: 'high',
    createdAt: '2024-12-10T09:00:00Z',
    isOverdue: false,
  },
  {
    id: 'app_005',
    requestNumber: 'APP-2024-005',
    entityType: 'quote',
    entityReference: 'Q-2024-010',
    entitySummary: 'Devis personnalisation colliers',
    entityAmount: 2200,
    entityCurrency: 'EUR',
    requesterName: 'Pierre Dubois',
    status: 'rejected',
    currentLevel: 1,
    totalLevels: 1,
    priority: 'low',
    createdAt: '2024-12-08T15:20:00Z',
    isOverdue: false,
  },
];

/**
 * Mock orders data for development
 */
const mockOrders: OrderSummary[] = [
  {
    id: 'ord_001',
    orderNumber: 'CMD-2024-001',
    status: 'delivered',
    itemCount: 8,
    total: 2450.00,
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
    total: 3800.00,
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
    total: 1250.00,
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
    total: 6500.00,
    currency: 'EUR',
    orderedBy: 'Pierre Martin',
    shippingAddress: '45 Avenue des Champs-Elysees, 75008 Paris',
    createdAt: '2024-12-12T16:45:00Z',
  },
  {
    id: 'ord_005',
    orderNumber: 'CMD-2024-005',
    status: 'cancelled',
    itemCount: 3,
    total: 890.00,
    currency: 'EUR',
    orderedBy: 'Marie Dupont',
    shippingAddress: '15 rue de la Paix, 75002 Paris',
    createdAt: '2024-12-10T08:30:00Z',
    cancelledAt: '2024-12-11T10:00:00Z',
  },
  {
    id: 'ord_006',
    orderNumber: 'CMD-2024-006',
    status: 'delivered',
    itemCount: 15,
    total: 4200.00,
    currency: 'EUR',
    orderedBy: 'Sophie Bernard',
    shippingAddress: '123 Rue de la Paix, 75001 Paris',
    trackingNumber: 'FR456789123',
    createdAt: '2024-12-05T11:00:00Z',
    shippedAt: '2024-12-07T09:00:00Z',
    deliveredAt: '2024-12-09T15:30:00Z',
  },
];

/**
 * Mock reports data for development
 */
const mockReportsData: ReportData = {
  summary: {
    totalSpending: 13500,
    budgetLimit: 22000,
    ordersCount: 48,
    averageOrder: 281.25,
    pendingApprovals: 3,
  },
  byEmployee: [
    { employeeId: 'emp_001', employeeName: 'Marie Dupont', totalSpending: 8500, ordersCount: 30, averageOrder: 283.33, percentOfTotal: 57 },
    { employeeId: 'emp_002', employeeName: 'Pierre Martin', totalSpending: 3200, ordersCount: 12, averageOrder: 266.67, percentOfTotal: 24 },
    { employeeId: 'emp_003', employeeName: 'Sophie Bernard', totalSpending: 1800, ordersCount: 6, averageOrder: 300.00, percentOfTotal: 13 },
  ],
  byCategory: [
    { categoryId: 'cat_001', categoryName: 'Bracelets', totalSpending: 4500, itemsCount: 12, percentOfTotal: 33.3 },
    { categoryId: 'cat_002', categoryName: 'Colliers', totalSpending: 3200, itemsCount: 8, percentOfTotal: 23.7 },
    { categoryId: 'cat_003', categoryName: 'Bagues', totalSpending: 2800, itemsCount: 15, percentOfTotal: 20.7 },
    { categoryId: 'cat_004', categoryName: "Boucles d'oreilles", totalSpending: 2000, itemsCount: 10, percentOfTotal: 14.8 },
    { categoryId: 'cat_005', categoryName: 'Montres', totalSpending: 1000, itemsCount: 3, percentOfTotal: 7.4 },
  ],
  monthlyTrend: [
    { month: '2024-07', spending: 8500, ordersCount: 28, averageOrder: 303.57 },
    { month: '2024-08', spending: 7200, ordersCount: 24, averageOrder: 300.00 },
    { month: '2024-09', spending: 9100, ordersCount: 32, averageOrder: 284.38 },
    { month: '2024-10', spending: 11500, ordersCount: 40, averageOrder: 287.50 },
    { month: '2024-11', spending: 12800, ordersCount: 44, averageOrder: 290.91 },
    { month: '2024-12', spending: 13500, ordersCount: 48, averageOrder: 281.25 },
  ],
  topProducts: [
    { productId: 'prod_001', productName: 'Bracelet Or 18K - Maille Figaro', sku: 'BRA-001', quantity: 45, totalSpending: 20250, averagePrice: 450 },
    { productId: 'prod_002', productName: 'Collier Argent - Perles Eau Douce', sku: 'COL-002', quantity: 38, totalSpending: 8360, averagePrice: 220 },
    { productId: 'prod_003', productName: 'Bague Or Jaune - Alliance Classique', sku: 'BAG-002', quantity: 32, totalSpending: 11200, averagePrice: 350 },
    { productId: 'prod_004', productName: 'Boucles Or Rose - Creoles Petites', sku: 'BOU-001', quantity: 28, totalSpending: 7840, averagePrice: 280 },
    { productId: 'prod_005', productName: 'Bracelet Argent 925 - Maille Venitienne', sku: 'BRA-002', quantity: 25, totalSpending: 3000, averagePrice: 120 },
  ],
};

/**
 * Mock product catalog for bulk order operations
 */
const mockProductCatalog: Record<string, ProductCatalogEntry> = {
  'BRA-001': {
    productId: 'prod_001',
    sku: 'BRA-001',
    name: 'Bracelet Or 18K - Maille Figaro',
    description: 'Bracelet en or 18 carats avec maille figaro classique',
    unitPrice: 450,
    currency: 'EUR',
    minQuantity: 1,
    maxQuantity: 25,
    availableStock: 25,
    category: 'bracelets',
    brand: 'Maison',
    imageUrl: '/images/products/bracelet-or-figaro.jpg',
  },
  'BRA-002': {
    productId: 'prod_002',
    sku: 'BRA-002',
    name: 'Bracelet Argent 925 - Maille Venitienne',
    description: 'Bracelet en argent 925 avec maille venitienne',
    unitPrice: 120,
    currency: 'EUR',
    minQuantity: 1,
    maxQuantity: 50,
    availableStock: 50,
    category: 'bracelets',
    brand: 'Maison',
    imageUrl: '/images/products/bracelet-argent-venitienne.jpg',
  },
  'COL-001': {
    productId: 'prod_003',
    sku: 'COL-001',
    name: 'Collier Or 18K - Pendentif Coeur',
    description: 'Collier en or 18 carats avec pendentif coeur',
    unitPrice: 680,
    currency: 'EUR',
    minQuantity: 1,
    maxQuantity: 15,
    availableStock: 15,
    category: 'colliers',
    brand: 'Maison',
    imageUrl: '/images/products/collier-or-coeur.jpg',
  },
  'COL-002': {
    productId: 'prod_004',
    sku: 'COL-002',
    name: 'Collier Argent - Perles Eau Douce',
    description: 'Collier en argent avec perles eau douce',
    unitPrice: 220,
    currency: 'EUR',
    minQuantity: 1,
    maxQuantity: 30,
    availableStock: 30,
    category: 'colliers',
    brand: 'Maison',
    imageUrl: '/images/products/collier-argent-perles.jpg',
  },
  'BAG-001': {
    productId: 'prod_005',
    sku: 'BAG-001',
    name: 'Bague Or Blanc - Solitaire Diamant',
    description: 'Bague en or blanc avec solitaire diamant',
    unitPrice: 1200,
    currency: 'EUR',
    minQuantity: 1,
    maxQuantity: 8,
    availableStock: 8,
    category: 'bagues',
    brand: 'Maison',
    imageUrl: '/images/products/bague-or-blanc-solitaire.jpg',
  },
  'BAG-002': {
    productId: 'prod_006',
    sku: 'BAG-002',
    name: 'Bague Or Jaune - Alliance Classique',
    description: 'Alliance classique en or jaune',
    unitPrice: 350,
    currency: 'EUR',
    minQuantity: 1,
    maxQuantity: 20,
    availableStock: 20,
    category: 'bagues',
    brand: 'Maison',
    imageUrl: '/images/products/bague-or-jaune-alliance.jpg',
  },
  'BOU-001': {
    productId: 'prod_007',
    sku: 'BOU-001',
    name: 'Boucles Or Rose - Creoles Petites',
    description: 'Boucles oreilles creoles petites en or rose',
    unitPrice: 280,
    currency: 'EUR',
    minQuantity: 1,
    maxQuantity: 35,
    availableStock: 35,
    category: 'boucles',
    brand: 'Maison',
    imageUrl: '/images/products/boucles-or-rose-creoles.jpg',
  },
  'BOU-002': {
    productId: 'prod_008',
    sku: 'BOU-002',
    name: 'Boucles Argent - Puces Zirconium',
    description: 'Boucles oreilles puces en argent avec zirconium',
    unitPrice: 85,
    currency: 'EUR',
    minQuantity: 1,
    maxQuantity: 100,
    availableStock: 100,
    category: 'boucles',
    brand: 'Maison',
    imageUrl: '/images/products/boucles-argent-puces.jpg',
  },
};

/**
 * Create mock API client
 */
function createMockApiClient(): MockApiClient {
  let b2bContext: { companyId?: string; employeeId?: string } | null = {
    companyId: 'comp_001',
    employeeId: 'emp_001',
  };

  return {
    b2b: {
      companies: {
        get: async () => mockCompany,
        list: async () => [mockCompany],
      },
      employees: {
        get: async (id: string) => {
          const employee = mockEmployeesList.find((e) => e.id === id);
          if (!employee) throw new Error('Employee not found');
          return employee;
        },
        list: async () => mockEmployeesList,
      },
      quotes: {
        list: async (filters?: Record<string, unknown>) => {
          if (filters?.status && filters.status !== 'all') {
            return mockQuotes.filter(q => q.status === filters.status);
          }
          return mockQuotes;
        },
        get: async (id: string) => mockQuotes.find(q => q.id === id) ?? null,
        create: async () => ({}),
        update: async () => ({}),
      },
      approvals: {
        list: async (filters?: Record<string, unknown>) => {
          if (filters?.status && filters.status !== 'all') {
            return mockApprovals.filter(a => a.status === filters.status);
          }
          return mockApprovals;
        },
        get: async (id: string) => mockApprovals.find(a => a.id === id) ?? null,
        approve: async () => ({}),
        reject: async () => ({}),
      },
      orders: {
        list: async (filters?: Record<string, unknown>) => {
          if (filters?.status && filters.status !== 'all') {
            return mockOrders.filter(o => o.status === filters.status);
          }
          return mockOrders;
        },
        get: async (id: string) => mockOrders.find(o => o.id === id) ?? null,
      },
      spending: {
        getSummary: async () => ({
          totalSpent: 12500,
          monthlyLimit: 50000,
          dailyLimit: 10000,
          remainingMonthly: 37500,
          remainingDaily: 8500,
        }),
        getHistory: async () => [],
      },
    },
    getB2BContext: () => b2bContext,
    setB2BContext: (companyId: string, employeeId?: string) => {
      b2bContext = { companyId, employeeId };
    },
    clearB2BContext: () => {
      b2bContext = null;
    },
    isB2BEnabled: () => true,
  };
}

/**
 * Spending summary interface
 */
interface SpendingSummary {
  totalSpent: number;
  monthlyLimit: number;
  dailyLimit: number;
  remainingMonthly: number;
  remainingDaily: number;
}

/**
 * B2B Context value
 */
interface B2BContextValue {
  /** Whether the B2B context is ready */
  isReady: boolean;
  /** Whether B2B mode is active */
  isB2BActive: boolean;
  /** Current company */
  company: Company | null;
  /** Current employee */
  employee: Employee | null;
  /** List of company employees */
  employees: Employee[];
  /** List of quotes */
  quotes: QuoteSummary[];
  /** Quotes loading state */
  quotesLoading: boolean;
  /** List of approvals */
  approvals: ApprovalSummary[];
  /** Approvals loading state */
  approvalsLoading: boolean;
  /** List of orders */
  orders: OrderSummary[];
  /** Orders loading state */
  ordersLoading: boolean;
  /** Reports data */
  reports: ReportData;
  /** Reports loading state */
  reportsLoading: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
  /** Check if current user can perform an action */
  canPerform: (action: B2BAction) => boolean;
  /** Switch company */
  switchCompany: (companyId: string) => Promise<void>;
  /** Clear B2B context */
  clearContext: () => void;
  /** Refresh company data */
  refresh: () => Promise<void>;
  /** Refresh quotes data */
  refreshQuotes: (filters?: { status?: QuoteStatus | 'all' }) => Promise<void>;
  /** Refresh approvals data */
  refreshApprovals: (filters?: { status?: ApprovalStatus | 'all' }) => Promise<void>;
  /** Refresh orders data */
  refreshOrders: (filters?: { status?: B2BOrderStatus | 'all' }) => Promise<void>;
  /** Refresh reports data */
  refreshReports: (period: ReportPeriod) => Promise<void>;
  /** Spending summary */
  spendingSummary: SpendingSummary | null;
  /** Raw API client (for advanced usage) */
  api: MockApiClient | null;
  /** Product catalog for bulk orders */
  productCatalog: Record<string, ProductCatalogEntry>;
  /** Lookup products by SKUs for bulk order */
  lookupProducts: (skus: string[], quantities?: Record<string, number>) => Promise<BulkOrderItem[]>;
  /** Validate bulk order items */
  validateBulkOrder: (items: BulkOrderItem[]) => Promise<BulkOrderValidationResult>;
}

const B2BContext = createContext<B2BContextValue | null>(null);

/**
 * B2B Provider Props
 */
interface B2BProviderProps {
  children: React.ReactNode;
  /** Enable mock mode for development */
  mockMode?: boolean;
}

/**
 * B2B Provider Component
 *
 * Wraps the application to provide B2B context and functionality.
 *
 * @example
 * ```tsx
 * // In app layout
 * <B2BProvider mockMode={process.env.NODE_ENV === 'development'}>
 *   <App />
 * </B2BProvider>
 *
 * // In components
 * const { company, employee, canPerform } = useB2B();
 *
 * if (canPerform('create_quote')) {
 *   // Show quote button
 * }
 * ```
 */
export function B2BProvider({
  children,
  mockMode = true,
}: B2BProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [company, setCompanyState] = useState<Company | null>(null);
  const [employee, setEmployeeState] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [quotes, setQuotes] = useState<QuoteSummary[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [approvals, setApprovals] = useState<ApprovalSummary[]>([]);
  const [approvalsLoading, setApprovalsLoading] = useState(false);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [reports, setReports] = useState<ReportData>(mockReportsData);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [api, setApi] = useState<MockApiClient | null>(null);

  // Initialize API client and load initial data
  useEffect(() => {
    const initApi = async () => {
      try {
        setIsLoading(true);

        if (mockMode) {
          // Use mock client for development
          const mockClient = createMockApiClient();
          setApi(mockClient);

          // Load mock data directly
          setCompanyState(mockCompany);
          setEmployeeState(mockEmployee);
          setEmployees(mockEmployeesList);
          setQuotes(mockQuotes);
          setApprovals(mockApprovals);
          setOrders(mockOrders);
        } else {
          // In production, initialize real API client
          // TODO: Integrate with @maison/api-client when backend is ready
          const mockClient = createMockApiClient();
          setApi(mockClient);
          setCompanyState(mockCompany);
          setEmployeeState(mockEmployee);
          setEmployees(mockEmployeesList);
          setQuotes(mockQuotes);
          setApprovals(mockApprovals);
          setOrders(mockOrders);
        }

        setIsReady(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize B2B API client:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
        setIsReady(true);
      }
    };

    initApi();
  }, [mockMode]);

  // Permission checking function
  const canPerform = useCallback(
    (action: B2BAction): boolean => {
      if (!company || !employee) {
        return false;
      }

      const permissions = employee.permissions ?? [];
      const role = employee.role;

      // Owner and admin can do everything
      if (role === 'owner' || role === 'admin') {
        return true;
      }

      // Check specific permissions based on the action
      switch (action) {
        case 'create_quote':
          return permissions.includes('quotes.create') || role === 'purchaser';
        case 'approve_order':
          return permissions.includes('orders.approve') || role === 'manager';
        case 'manage_employees':
          return permissions.includes('company.manage_employees');
        case 'view_spending':
          return permissions.includes('spending.view_reports') || role !== 'viewer';
        case 'edit_company':
          return permissions.includes('company.edit');
        case 'place_order':
          return permissions.includes('orders.create') || role === 'purchaser' || role === 'manager';
        default:
          return false;
      }
    },
    [company, employee]
  );

  // Switch company
  const switchCompany = useCallback(
    async (companyId: string) => {
      if (!api) return;
      setIsLoading(true);
      try {
        const newCompany = await api.b2b.companies.get(companyId);
        setCompanyState(newCompany);
        api.setB2BContext(companyId, employee?.id);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    },
    [api, employee]
  );

  // Clear context
  const clearContext = useCallback(() => {
    setCompanyState(null);
    setEmployeeState(null);
    setEmployees([]);
    api?.clearB2BContext();
  }, [api]);

  // Refresh data
  const refresh = useCallback(async () => {
    if (!api || !company) return;
    setIsLoading(true);
    try {
      const refreshedCompany = await api.b2b.companies.get(company.id);
      setCompanyState(refreshedCompany);
      const refreshedEmployees = await api.b2b.employees.list(company.id);
      setEmployees(refreshedEmployees);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [api, company]);

  // Refresh quotes
  const refreshQuotes = useCallback(async (filters?: { status?: QuoteStatus | 'all' }) => {
    if (!api) return;
    setQuotesLoading(true);
    try {
      const refreshedQuotes = await api.b2b.quotes.list(filters) as QuoteSummary[];
      setQuotes(refreshedQuotes);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setQuotesLoading(false);
    }
  }, [api]);

  // Refresh approvals
  const refreshApprovals = useCallback(async (filters?: { status?: ApprovalStatus | 'all' }) => {
    if (!api) return;
    setApprovalsLoading(true);
    try {
      const refreshedApprovals = await api.b2b.approvals.list(filters) as ApprovalSummary[];
      setApprovals(refreshedApprovals);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setApprovalsLoading(false);
    }
  }, [api]);

  // Refresh orders
  const refreshOrders = useCallback(async (filters?: { status?: B2BOrderStatus | 'all' }) => {
    if (!api) return;
    setOrdersLoading(true);
    try {
      const refreshedOrders = await api.b2b.orders.list(filters) as OrderSummary[];
      setOrders(refreshedOrders);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setOrdersLoading(false);
    }
  }, [api]);

  // Refresh reports
  const refreshReports = useCallback(async (period: ReportPeriod) => {
    setReportsLoading(true);
    try {
      // In production, this would call an API endpoint with the period parameter
      // For now, we simulate a delay and return mock data adjusted by period
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Adjust mock data based on period (simplified)
      const periodMultiplier = {
        week: 0.25,
        month: 1,
        quarter: 3,
        year: 12,
      }[period];

      setReports({
        ...mockReportsData,
        summary: {
          ...mockReportsData.summary,
          totalSpending: Math.round(mockReportsData.summary.totalSpending * periodMultiplier),
          ordersCount: Math.round(mockReportsData.summary.ordersCount * periodMultiplier),
        },
        byEmployee: mockReportsData.byEmployee.map((e) => ({
          ...e,
          totalSpending: Math.round((e.totalSpending || 0) * periodMultiplier),
          percentOfTotal: Math.min(100, Math.round((e.percentOfTotal || 0) * periodMultiplier / (period === 'year' ? 12 : 1))),
        })),
        byCategory: mockReportsData.byCategory.map((c) => ({
          ...c,
          totalSpending: Math.round((c.totalSpending || 0) * periodMultiplier),
          itemsCount: Math.round((c.itemsCount || 0) * periodMultiplier),
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setReportsLoading(false);
    }
  }, []);

  // Calculate spending summary
  const spendingSummary = useMemo<SpendingSummary | null>(() => {
    if (!employee) return null;
    return {
      totalSpent: employee.currentMonthlySpending,
      monthlyLimit: employee.spendingLimitMonthly ?? 0,
      dailyLimit: employee.spendingLimitDaily ?? 0,
      remainingMonthly: (employee.spendingLimitMonthly ?? 0) - employee.currentMonthlySpending,
      remainingDaily: (employee.spendingLimitDaily ?? 0) - employee.currentDailySpending,
    };
  }, [employee]);

  // Lookup products for bulk orders
  const lookupProducts = useCallback(
    async (skus: string[], quantities?: Record<string, number>): Promise<BulkOrderItem[]> => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      return skus.map((sku) => {
        const normalizedSku = sku.toUpperCase().trim();
        const product = mockProductCatalog[normalizedSku];
        const quantity = quantities?.[sku] ?? quantities?.[normalizedSku] ?? 1;

        if (!product) {
          return {
            sku: normalizedSku,
            quantity,
            isValid: false,
            errors: ['SKU inconnu'],
          };
        }

        const productStock = product.availableStock ?? 0;
        const productUnitPrice = product.unitPrice ?? 0;
        const available = productStock >= quantity;
        return {
          sku: normalizedSku,
          quantity,
          product,
          isValid: available,
          unitPrice: productUnitPrice,
          lineTotal: productUnitPrice * quantity,
          errors: available ? undefined : [`Stock insuffisant (${productStock} disponibles)`],
        };
      });
    },
    []
  );

  // Validate bulk order
  const validateBulkOrder = useCallback(
    async (items: BulkOrderItem[]): Promise<BulkOrderValidationResult> => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      const errors: BulkOrderValidationResult['errors'] = [];
      const warnings: BulkOrderValidationResult['warnings'] = [];
      const validItems: BulkOrderItem[] = [];
      let totalAmount = 0;

      items.forEach((item, index) => {
        const product = mockProductCatalog[item.sku];

        if (!product) {
          errors.push({
            row: index + 1,
            field: 'sku',
            code: 'UNKNOWN_SKU',
            message: `SKU inconnu: ${item.sku}`,
          });
          return;
        }

        if (item.quantity <= 0) {
          errors.push({
            row: index + 1,
            field: 'quantity',
            code: 'INVALID_QUANTITY',
            message: 'La quantite doit etre superieure a 0',
          });
          return;
        }

        const productAvailableStock = product.availableStock ?? 0;
        if (item.quantity > productAvailableStock) {
          errors.push({
            row: index + 1,
            field: 'quantity',
            code: 'INSUFFICIENT_STOCK',
            message: `Stock insuffisant: ${productAvailableStock} disponibles, ${item.quantity} demandes`,
          });
          return;
        }

        if (item.quantity > productAvailableStock * 0.8) {
          warnings.push({
            sku: item.sku,
            code: 'LOW_STOCK',
            message: `Stock limite: ${productAvailableStock} disponibles`,
          });
        }

        if (product.minQuantity && item.quantity < product.minQuantity) {
          errors.push({
            row: index + 1,
            field: 'quantity',
            code: 'BELOW_MIN_QUANTITY',
            message: `Quantite minimum: ${product.minQuantity}`,
          });
          return;
        }

        if (product.maxQuantity && item.quantity > product.maxQuantity) {
          errors.push({
            row: index + 1,
            field: 'quantity',
            code: 'EXCEEDS_ORDER_LIMIT',
            message: `Quantite maximum: ${product.maxQuantity}`,
          });
          return;
        }

        validItems.push(item);
        totalAmount += item.lineTotal ?? 0;
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        validItems,
        invalidCount: errors.length,
        totalAmount,
        currency: 'EUR',
      };
    },
    []
  );

  // Memoize context value
  const contextValue = useMemo<B2BContextValue>(
    () => ({
      isReady,
      isB2BActive: !!company && !!employee,
      company,
      employee,
      employees,
      quotes,
      quotesLoading,
      approvals,
      approvalsLoading,
      orders,
      ordersLoading,
      reports,
      reportsLoading,
      isLoading,
      error,
      canPerform,
      switchCompany,
      clearContext,
      refresh,
      refreshQuotes,
      refreshApprovals,
      refreshOrders,
      refreshReports,
      spendingSummary,
      api,
      productCatalog: mockProductCatalog,
      lookupProducts,
      validateBulkOrder,
    }),
    [
      isReady,
      company,
      employee,
      employees,
      quotes,
      quotesLoading,
      approvals,
      approvalsLoading,
      orders,
      ordersLoading,
      reports,
      reportsLoading,
      isLoading,
      error,
      canPerform,
      switchCompany,
      clearContext,
      refresh,
      refreshQuotes,
      refreshApprovals,
      refreshOrders,
      refreshReports,
      spendingSummary,
      api,
      lookupProducts,
      validateBulkOrder,
    ]
  );

  return (
    <B2BContext.Provider value={contextValue}>
      {children}
    </B2BContext.Provider>
  );
}

/**
 * Hook to access B2B context
 *
 * @throws Error if used outside of B2BProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { company, employee, canPerform } = useB2B();
 *
 *   if (!company) {
 *     return <div>Loading company...</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <h1>{company.name}</h1>
 *       <p>Welcome, {employee?.firstName}</p>
 *       {canPerform('create_quote') && (
 *         <button>Create Quote</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useB2B(): B2BContextValue {
  const context = useContext(B2BContext);

  if (!context) {
    throw new Error('useB2B must be used within a B2BProvider');
  }

  return context;
}

/**
 * Hook to check if B2B is active and ready
 * Simpler hook for components that just need to check B2B status
 */
export function useB2BStatus(): {
  isReady: boolean;
  isB2BActive: boolean;
  company: Company | null;
} {
  const { isReady, isB2BActive, company } = useB2B();
  return { isReady, isB2BActive, company };
}

/**
 * Hook to check B2B permissions
 * Simpler hook for permission-gated UI elements
 *
 * @example
 * ```tsx
 * function QuoteButton() {
 *   const { canCreateQuote, canApproveOrders } = useB2BPermissions();
 *
 *   if (!canCreateQuote) return null;
 *
 *   return <button>Create Quote</button>;
 * }
 * ```
 */
export function useB2BPermissions(): {
  canCreateQuote: boolean;
  canApproveOrders: boolean;
  canManageEmployees: boolean;
  canViewSpending: boolean;
  canEditCompany: boolean;
  canPlaceOrder: boolean;
} {
  const { canPerform, isB2BActive } = useB2B();

  return useMemo(
    () => ({
      canCreateQuote: isB2BActive && canPerform('create_quote'),
      canApproveOrders: isB2BActive && canPerform('approve_order'),
      canManageEmployees: isB2BActive && canPerform('manage_employees'),
      canViewSpending: isB2BActive && canPerform('view_spending'),
      canEditCompany: isB2BActive && canPerform('edit_company'),
      canPlaceOrder: isB2BActive && canPerform('place_order'),
    }),
    [canPerform, isB2BActive]
  );
}

export default B2BProvider;
