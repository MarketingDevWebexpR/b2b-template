/**
 * Root State Shape for B2B Application
 *
 * This module defines the complete state tree structure for the B2B e-commerce application.
 * Designed to work with any state management library (Redux, Zustand, useReducer).
 *
 * @packageDocumentation
 */

import type {
  Company,
  CompanySummary,
  Employee,
  EmployeeSummary,
  Quote,
  QuoteSummary,
  QuoteStatus,
  QuoteFilters,
  ApprovalRequest,
  ApprovalSummary,
  ApprovalStatus,
  ApprovalFilters,
  SpendingLimit,
} from "@maison/types";

// ============================================
// Loading State
// ============================================

/**
 * Represents async operation states.
 */
export type LoadingStatus = "idle" | "loading" | "succeeded" | "failed";

/**
 * Generic async state wrapper for data fetching operations.
 */
export interface AsyncState<T> {
  /** The data being managed */
  readonly data: T;
  /** Current loading status */
  readonly status: LoadingStatus;
  /** Error message if status is 'failed' */
  readonly error: string | null;
  /** ISO timestamp of last successful fetch */
  readonly lastFetchedAt: string | null;
}

// ============================================
// Company State
// ============================================

/**
 * State for the current B2B company context.
 */
export interface CompanyState {
  /** The currently active company (full details) */
  readonly currentCompany: Company | null;
  /** The currently logged-in employee */
  readonly currentEmployee: Employee | null;
  /** List of employees in the current company (for selection/display) */
  readonly employees: readonly EmployeeSummary[];
  /** Loading state for company data */
  readonly status: LoadingStatus;
  /** Error message if company loading failed */
  readonly error: string | null;
  /** Whether B2B mode is active (company and employee are set) */
  readonly isB2BActive: boolean;
  /** ISO timestamp of last company data refresh */
  readonly lastRefreshedAt: string | null;
}

// ============================================
// Quotes State
// ============================================

/**
 * State for managing B2B quotes.
 */
export interface QuotesState {
  /** List of quotes (summary view for lists) */
  readonly quotes: readonly QuoteSummary[];
  /** Currently selected/viewed quote (full details) */
  readonly selectedQuote: Quote | null;
  /** Active filters for quote list */
  readonly filters: QuoteFilters;
  /** Active status filter (convenience for common filter) */
  readonly activeStatusFilter: QuoteStatus | "all";
  /** Search query */
  readonly searchQuery: string;
  /** Loading state for quotes list */
  readonly listStatus: LoadingStatus;
  /** Loading state for selected quote details */
  readonly detailStatus: LoadingStatus;
  /** Error message */
  readonly error: string | null;
  /** Pagination */
  readonly pagination: PaginationState;
}

// ============================================
// Approvals State
// ============================================

/**
 * State for managing B2B approval requests.
 */
export interface ApprovalsState {
  /** List of pending approval requests (summary view) */
  readonly pendingApprovals: readonly ApprovalSummary[];
  /** All approval requests (for history view) */
  readonly allApprovals: readonly ApprovalSummary[];
  /** Currently selected approval request (full details) */
  readonly selectedApproval: ApprovalRequest | null;
  /** Active filters */
  readonly filters: ApprovalFilters;
  /** Active status filter */
  readonly activeStatusFilter: ApprovalStatus | "all";
  /** Loading state for approvals list */
  readonly listStatus: LoadingStatus;
  /** Loading state for selected approval details */
  readonly detailStatus: LoadingStatus;
  /** Error message */
  readonly error: string | null;
  /** Count of pending approvals requiring action */
  readonly pendingCount: number;
  /** Pagination */
  readonly pagination: PaginationState;
}

// ============================================
// B2B Cart State
// ============================================

/**
 * A single item in the B2B cart with bulk ordering support.
 */
export interface B2BCartItem {
  /** Product ID */
  readonly productId: string;
  /** Product SKU/reference */
  readonly productSku: string;
  /** Product name */
  readonly productName: string;
  /** Product image URL */
  readonly productImage: string;
  /** Unit price */
  readonly unitPrice: number;
  /** Quantity ordered */
  readonly quantity: number;
  /** Minimum order quantity (if any) */
  readonly minOrderQuantity: number;
  /** Maximum order quantity (stock limit) */
  readonly maxOrderQuantity: number;
  /** Line total (quantity * unitPrice) */
  readonly lineTotal: number;
  /** Optional notes for this item */
  readonly notes?: string;
  /** Custom specifications */
  readonly specifications?: Readonly<Record<string, string>>;
}

/**
 * Spending validation result.
 */
export interface SpendingValidation {
  /** Whether the cart total is within spending limits */
  readonly isWithinLimits: boolean;
  /** Whether approval is required based on amount */
  readonly requiresApproval: boolean;
  /** Reason for requiring approval */
  readonly approvalReason: string | null;
  /** Applicable spending limits */
  readonly applicableLimits: readonly SpendingLimit[];
  /** Warnings (e.g., approaching limit) */
  readonly warnings: readonly string[];
}

/**
 * Cart totals breakdown.
 */
export interface B2BCartTotals {
  /** Sum of line totals */
  readonly subtotal: number;
  /** Company tier discount amount */
  readonly tierDiscount: number;
  /** Volume discount amount */
  readonly volumeDiscount: number;
  /** Total discount */
  readonly totalDiscount: number;
  /** Shipping estimate */
  readonly shippingEstimate: number;
  /** Tax amount */
  readonly tax: number;
  /** Grand total */
  readonly total: number;
  /** Currency code */
  readonly currency: string;
}

/**
 * State for B2B cart with bulk ordering and spending validation.
 */
export interface CartB2BState {
  /** Cart items */
  readonly items: readonly B2BCartItem[];
  /** Total item count */
  readonly itemCount: number;
  /** Cart totals breakdown */
  readonly totals: B2BCartTotals;
  /** Spending validation result */
  readonly spendingValidation: SpendingValidation;
  /** Whether checkout is allowed */
  readonly canCheckout: boolean;
  /** Reason checkout is blocked (if any) */
  readonly checkoutBlockedReason: string | null;
  /** Selected shipping address ID */
  readonly shippingAddressId: string | null;
  /** Purchase order number (optional) */
  readonly purchaseOrderNumber: string;
  /** Order notes */
  readonly notes: string;
  /** Loading state */
  readonly status: LoadingStatus;
  /** Error message */
  readonly error: string | null;
  /** ISO timestamp of last cart update */
  readonly lastUpdatedAt: string | null;
}

// ============================================
// Pagination State
// ============================================

/**
 * Standard pagination state.
 */
export interface PaginationState {
  /** Current page (1-indexed) */
  readonly currentPage: number;
  /** Items per page */
  readonly pageSize: number;
  /** Total items available */
  readonly totalItems: number;
  /** Total pages */
  readonly totalPages: number;
  /** Whether there's a next page */
  readonly hasNextPage: boolean;
  /** Whether there's a previous page */
  readonly hasPreviousPage: boolean;
}

// ============================================
// Root State
// ============================================

/**
 * Root state shape for the B2B application.
 * Combines all domain-specific states.
 */
export interface RootState {
  /** Company and employee context */
  readonly company: CompanyState;
  /** Quotes management */
  readonly quotes: QuotesState;
  /** Approvals management */
  readonly approvals: ApprovalsState;
  /** B2B cart with bulk ordering */
  readonly cartB2B: CartB2BState;
}

// ============================================
// Initial States
// ============================================

/**
 * Default pagination state.
 */
export const initialPaginationState: PaginationState = {
  currentPage: 1,
  pageSize: 20,
  totalItems: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
} as const;

/**
 * Default company state.
 */
export const initialCompanyState: CompanyState = {
  currentCompany: null,
  currentEmployee: null,
  employees: [],
  status: "idle",
  error: null,
  isB2BActive: false,
  lastRefreshedAt: null,
} as const;

/**
 * Default quotes state.
 */
export const initialQuotesState: QuotesState = {
  quotes: [],
  selectedQuote: null,
  filters: {},
  activeStatusFilter: "all",
  searchQuery: "",
  listStatus: "idle",
  detailStatus: "idle",
  error: null,
  pagination: initialPaginationState,
} as const;

/**
 * Default approvals state.
 */
export const initialApprovalsState: ApprovalsState = {
  pendingApprovals: [],
  allApprovals: [],
  selectedApproval: null,
  filters: {},
  activeStatusFilter: "all",
  listStatus: "idle",
  detailStatus: "idle",
  error: null,
  pendingCount: 0,
  pagination: initialPaginationState,
} as const;

/**
 * Default spending validation.
 */
export const initialSpendingValidation: SpendingValidation = {
  isWithinLimits: true,
  requiresApproval: false,
  approvalReason: null,
  applicableLimits: [],
  warnings: [],
} as const;

/**
 * Default cart totals.
 */
export const initialCartTotals: B2BCartTotals = {
  subtotal: 0,
  tierDiscount: 0,
  volumeDiscount: 0,
  totalDiscount: 0,
  shippingEstimate: 0,
  tax: 0,
  total: 0,
  currency: "EUR",
} as const;

/**
 * Default B2B cart state.
 */
export const initialCartB2BState: CartB2BState = {
  items: [],
  itemCount: 0,
  totals: initialCartTotals,
  spendingValidation: initialSpendingValidation,
  canCheckout: false,
  checkoutBlockedReason: "Cart is empty",
  shippingAddressId: null,
  purchaseOrderNumber: "",
  notes: "",
  status: "idle",
  error: null,
  lastUpdatedAt: null,
} as const;

/**
 * Default root state.
 */
export const initialRootState: RootState = {
  company: initialCompanyState,
  quotes: initialQuotesState,
  approvals: initialApprovalsState,
  cartB2B: initialCartB2BState,
} as const;
