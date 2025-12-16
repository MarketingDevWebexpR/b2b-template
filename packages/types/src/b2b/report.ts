/**
 * B2B Report Types
 * Defines types for B2B reporting and analytics functionality.
 */

// ============================================
// Report Period
// ============================================

/**
 * Time period for report data.
 */
export type ReportPeriod = 'week' | 'month' | 'quarter' | 'year';

// ============================================
// Report Type
// ============================================

/**
 * Type of report to display.
 */
export type ReportType = 'spending' | 'category' | 'trend' | 'products';

// ============================================
// Employee Spending
// ============================================

/**
 * Employee spending data for reports.
 */
export interface EmployeeSpending {
  /** Employee name */
  name: string;
  /** Amount spent in the period */
  amount: number;
  /** Spending limit for the period */
  limit: number;
  /** Percentage of limit used */
  percentage: number;
}

// ============================================
// Category Spending
// ============================================

/**
 * Spending data grouped by product category.
 */
export interface CategorySpending {
  /** Category name */
  category: string;
  /** Amount spent in the category */
  amount: number;
  /** Number of orders in the category */
  orders: number;
}

// ============================================
// Monthly Trend
// ============================================

/**
 * Monthly spending trend data point.
 */
export interface MonthlyTrend {
  /** Month name (e.g., "Janvier", "Fevrier") */
  month: string;
  /** Amount spent in the month */
  amount: number;
}

// ============================================
// Top Product
// ============================================

/**
 * Top-selling product data for reports.
 */
export interface TopProduct {
  /** Product SKU */
  sku: string;
  /** Product name */
  name: string;
  /** Quantity sold */
  quantity: number;
  /** Revenue generated */
  revenue: number;
}

// ============================================
// Report Summary
// ============================================

/**
 * Summary statistics for the report dashboard.
 */
export interface ReportSummary {
  /** Total spending in the period */
  totalSpending: number;
  /** Budget limit for the period */
  budgetLimit: number;
  /** Number of orders in the period */
  ordersCount: number;
  /** Average order value */
  averageOrder: number;
  /** Number of pending approvals */
  pendingApprovals: number;
}

// ============================================
// Report Data
// ============================================

/**
 * Complete report data structure.
 */
export interface ReportData {
  /** Summary statistics */
  summary: ReportSummary;
  /** Spending by employee */
  byEmployee: EmployeeSpending[];
  /** Spending by category */
  byCategory: CategorySpending[];
  /** Monthly spending trend */
  trend: MonthlyTrend[];
  /** Top-selling products */
  topProducts: TopProduct[];
}
