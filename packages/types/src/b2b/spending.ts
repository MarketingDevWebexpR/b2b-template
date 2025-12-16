/**
 * B2B Spending Types
 * Defines spending limits, rules, and tracking for B2B budget management.
 */

// ============================================
// Spending Period
// ============================================

/**
 * Time period for spending limits.
 */
export type SpendingPeriod =
  | 'per_order'   // Per individual order
  | 'daily'       // Per day
  | 'weekly'      // Per week
  | 'monthly'     // Per month
  | 'quarterly'   // Per quarter
  | 'yearly';     // Per year

// ============================================
// Spending Limit Type
// ============================================

/**
 * Type of entity the spending limit applies to.
 */
export type SpendingLimitEntityType =
  | 'employee'    // Individual employee
  | 'department'  // Department
  | 'company'     // Entire company
  | 'role';       // Employee role

// ============================================
// Spending Limit
// ============================================

/**
 * A spending limit configuration.
 */
export interface SpendingLimit {
  /** Unique identifier */
  id: string;
  /** Company ID */
  companyId: string;
  /** Limit name */
  name: string;
  /** Limit description */
  description?: string;

  // Scope
  /** Type of entity this limit applies to */
  entityType: SpendingLimitEntityType;
  /** Entity ID (employee, department, or role ID) */
  entityId?: string;
  /** Entity name (denormalized) */
  entityName?: string;

  // Limits
  /** Spending period */
  period: SpendingPeriod;
  /** Maximum amount allowed */
  limitAmount: number;
  /** Currency */
  currency: string;
  /** Warning threshold (percentage of limit) */
  warningThreshold: number;

  // Restrictions
  /** Product category restrictions */
  categoryRestrictions?: CategoryRestriction[];
  /** Product restrictions */
  productRestrictions?: ProductRestriction[];

  // Status
  /** Whether this limit is active */
  isActive: boolean;
  /** Current spending amount */
  currentSpending: number;
  /** Remaining amount */
  remainingAmount: number;
  /** Percentage used */
  percentageUsed: number;
  /** Whether warning threshold is exceeded */
  isWarning: boolean;
  /** Whether limit is exceeded */
  isExceeded: boolean;

  // Reset
  /** Last reset timestamp */
  lastResetAt: string;
  /** Next reset timestamp */
  nextResetAt: string;

  // Metadata
  /** Created by employee ID */
  createdById: string;
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;
}

/**
 * Category restriction on spending.
 */
export interface CategoryRestriction {
  categoryId: string;
  categoryName: string;
  /** 'allow' = only these categories, 'block' = all except these */
  type: 'allow' | 'block';
}

/**
 * Product restriction on spending.
 */
export interface ProductRestriction {
  productId: string;
  productName: string;
  productSku: string;
  /** 'allow' = only these products, 'block' = all except these */
  type: 'allow' | 'block';
}

// ============================================
// Spending Rule
// ============================================

/**
 * Type of spending rule action.
 */
export type SpendingRuleAction =
  | 'require_approval'   // Require approval when triggered
  | 'block'              // Block the transaction
  | 'warn'               // Warn but allow
  | 'notify'             // Notify specified users
  | 'escalate';          // Escalate to manager

/**
 * A spending rule that triggers actions.
 */
export interface SpendingRule {
  /** Unique identifier */
  id: string;
  /** Company ID */
  companyId: string;
  /** Rule name */
  name: string;
  /** Rule description */
  description?: string;

  // Conditions
  /** Minimum amount to trigger (optional) */
  minAmount?: number;
  /** Maximum amount to trigger (optional) */
  maxAmount?: number;
  /** Categories that trigger this rule */
  categoryIds?: string[];
  /** Products that trigger this rule */
  productIds?: string[];
  /** Employee roles this applies to */
  roleIds?: string[];
  /** Departments this applies to */
  departmentIds?: string[];

  // Actions
  /** Action to take when triggered */
  action: SpendingRuleAction;
  /** IDs to notify (for 'notify' action) */
  notifyEmployeeIds?: string[];
  /** Approval workflow ID (for 'require_approval' action) */
  approvalWorkflowId?: string;
  /** Custom message to display */
  message?: string;

  // Priority and status
  /** Rule priority (lower = higher priority) */
  priority: number;
  /** Whether this rule is active */
  isActive: boolean;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Spending Transaction
// ============================================

/**
 * A spending transaction record.
 */
export interface SpendingTransaction {
  /** Unique identifier */
  id: string;
  /** Company ID */
  companyId: string;
  /** Employee ID */
  employeeId: string;
  /** Employee name (denormalized) */
  employeeName: string;
  /** Department ID */
  departmentId?: string;
  /** Department name (denormalized) */
  departmentName?: string;

  // Transaction details
  /** Transaction type */
  type: 'order' | 'quote_conversion' | 'refund' | 'adjustment';
  /** Reference ID (order ID, etc.) */
  referenceId: string;
  /** Reference number */
  referenceNumber: string;
  /** Transaction amount (positive = spend, negative = refund) */
  amount: number;
  /** Currency */
  currency: string;

  // Limits affected
  /** Spending limit IDs affected */
  affectedLimitIds: string[];

  // Status
  /** Transaction status */
  status: 'completed' | 'pending' | 'reversed';

  // Metadata
  /** Notes */
  notes?: string;
  /** ISO timestamp */
  createdAt: string;
}

// ============================================
// Spending Report
// ============================================

/**
 * Spending report for a period.
 */
export interface SpendingReport {
  /** Report period start */
  periodStart: string;
  /** Report period end */
  periodEnd: string;
  /** Currency */
  currency: string;

  // Totals
  /** Total spending */
  totalSpending: number;
  /** Total orders */
  totalOrders: number;
  /** Average order value */
  averageOrderValue: number;

  // By category
  /** Spending by category */
  byCategory: SpendingByCategory[];

  // By employee
  /** Spending by employee */
  byEmployee: SpendingByEmployee[];

  // By department
  /** Spending by department */
  byDepartment: SpendingByDepartment[];

  // Trends
  /** Daily spending data */
  dailyTrend: DailySpending[];

  // Alerts
  /** Employees who exceeded limits */
  limitExceeded: LimitExceededAlert[];
  /** Employees near limits */
  nearLimit: NearLimitAlert[];
}

/**
 * Spending grouped by category.
 */
export interface SpendingByCategory {
  categoryId: string;
  categoryName: string;
  amount: number;
  orderCount: number;
  percentOfTotal: number;
}

/**
 * Spending grouped by employee.
 */
export interface SpendingByEmployee {
  employeeId: string;
  employeeName: string;
  departmentName?: string;
  amount: number;
  orderCount: number;
  percentOfTotal: number;
  monthlyLimit?: number;
  limitUsagePercent?: number;
}

/**
 * Spending grouped by department.
 */
export interface SpendingByDepartment {
  departmentId: string;
  departmentName: string;
  amount: number;
  orderCount: number;
  employeeCount: number;
  percentOfTotal: number;
  budget?: number;
  budgetUsagePercent?: number;
}

/**
 * Daily spending data point.
 */
export interface DailySpending {
  date: string;
  amount: number;
  orderCount: number;
}

/**
 * Alert for exceeded spending limit.
 */
export interface LimitExceededAlert {
  employeeId: string;
  employeeName: string;
  limitName: string;
  limitAmount: number;
  currentSpending: number;
  exceededBy: number;
  exceededAt: string;
}

/**
 * Alert for near spending limit.
 */
export interface NearLimitAlert {
  employeeId: string;
  employeeName: string;
  limitName: string;
  limitAmount: number;
  currentSpending: number;
  percentUsed: number;
  remaining: number;
}

// ============================================
// Spending Limit DTOs
// ============================================

/**
 * Input for creating a spending limit.
 */
export interface CreateSpendingLimitInput {
  name: string;
  description?: string;
  entityType: SpendingLimitEntityType;
  entityId?: string;
  period: SpendingPeriod;
  limitAmount: number;
  currency: string;
  warningThreshold?: number;
  categoryRestrictions?: Omit<CategoryRestriction, 'categoryName'>[];
  productRestrictions?: Omit<ProductRestriction, 'productName' | 'productSku'>[];
}

/**
 * Input for updating a spending limit.
 */
export interface UpdateSpendingLimitInput {
  name?: string;
  description?: string;
  limitAmount?: number;
  warningThreshold?: number;
  categoryRestrictions?: Omit<CategoryRestriction, 'categoryName'>[];
  productRestrictions?: Omit<ProductRestriction, 'productName' | 'productSku'>[];
  isActive?: boolean;
}

/**
 * Input for creating a spending rule.
 */
export interface CreateSpendingRuleInput {
  name: string;
  description?: string;
  minAmount?: number;
  maxAmount?: number;
  categoryIds?: string[];
  productIds?: string[];
  roleIds?: string[];
  departmentIds?: string[];
  action: SpendingRuleAction;
  notifyEmployeeIds?: string[];
  approvalWorkflowId?: string;
  message?: string;
  priority?: number;
}

/**
 * Input for manual spending adjustment.
 */
export interface SpendingAdjustmentInput {
  employeeId: string;
  amount: number;
  reason: string;
  affectedLimitIds?: string[];
}

// ============================================
// Spending Filters
// ============================================

/**
 * Filters for spending reports and queries.
 */
export interface SpendingFilters {
  employeeId?: string;
  departmentId?: string;
  categoryId?: string;
  periodStart: string;
  periodEnd: string;
  minAmount?: number;
  maxAmount?: number;
}
