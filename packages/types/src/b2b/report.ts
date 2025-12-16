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
  /** Employee unique identifier */
  employeeId: string;
  /** Employee full name */
  employeeName: string;
  /** Total spending in the period */
  totalSpending: number;
  /** Number of orders in the period */
  ordersCount: number;
  /** Average order value */
  averageOrder: number;
  /** Percentage of total company spending */
  percentOfTotal: number;
}

// ============================================
// Category Spending
// ============================================

/**
 * Spending data grouped by product category.
 */
export interface CategorySpending {
  /** Category unique identifier */
  categoryId: string;
  /** Category name */
  categoryName: string;
  /** Total spending in the category */
  totalSpending: number;
  /** Number of items purchased in the category */
  itemsCount: number;
  /** Percentage of total spending */
  percentOfTotal: number;
}

// ============================================
// Monthly Trend
// ============================================

/**
 * Monthly spending trend data point.
 */
export interface MonthlyTrend {
  /** Month identifier (e.g., "2024-07", "2024-08") */
  month: string;
  /** Total spending in the month */
  spending: number;
  /** Number of orders in the month */
  ordersCount: number;
  /** Average order value */
  averageOrder: number;
}

// ============================================
// Top Product
// ============================================

/**
 * Top-selling product data for reports.
 */
export interface TopProduct {
  /** Product unique identifier */
  productId: string;
  /** Product name */
  productName: string;
  /** Product SKU */
  sku: string;
  /** Quantity sold */
  quantity: number;
  /** Total spending on this product */
  totalSpending: number;
  /** Average price per unit */
  averagePrice: number;
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
  monthlyTrend: MonthlyTrend[];
  /** Top-selling products */
  topProducts: TopProduct[];
}
