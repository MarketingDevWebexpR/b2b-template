/**
 * B2B Spending Service Interface
 * Defines the contract for spending limit operations in B2B context.
 */

import type {
  SpendingLimit,
  SpendingRule,
  SpendingTransaction,
  SpendingReport,
  SpendingPeriod,
  SpendingLimitEntityType,
  CreateSpendingLimitInput,
  UpdateSpendingLimitInput,
  CreateSpendingRuleInput,
  SpendingAdjustmentInput,
  SpendingFilters,
} from "@maison/types";
import type { PaginatedResponse } from "@maison/api-core";

/**
 * Options for listing spending limits
 */
export interface ListSpendingLimitsOptions {
  /** Filter by entity type */
  entityType?: SpendingLimitEntityType;
  /** Filter by entity ID */
  entityId?: string;
  /** Filter by period */
  period?: SpendingPeriod;
  /** Include only active limits */
  activeOnly?: boolean;
  /** Include exceeded limits only */
  exceededOnly?: boolean;
}

/**
 * Spending check result
 */
export interface SpendingCheckResult {
  /** Whether spending is allowed */
  allowed: boolean;
  /** Reason if not allowed */
  reason?: string;
  /** Affected limits */
  affectedLimits: Array<{
    limitId: string;
    limitName: string;
    currentSpending: number;
    limitAmount: number;
    remainingAfterPurchase: number;
    wouldExceed: boolean;
  }>;
  /** Triggered rules */
  triggeredRules: Array<{
    ruleId: string;
    ruleName: string;
    action: string;
    message?: string;
  }>;
  /** Whether approval is required */
  requiresApproval: boolean;
  /** Approval workflow ID if required */
  approvalWorkflowId?: string;
}

/**
 * Budget summary
 */
export interface BudgetSummary {
  /** Entity type */
  entityType: SpendingLimitEntityType;
  /** Entity ID */
  entityId: string;
  /** Entity name */
  entityName: string;
  /** Period */
  period: SpendingPeriod;
  /** Budget amount */
  budget: number;
  /** Current spending */
  spent: number;
  /** Remaining */
  remaining: number;
  /** Percentage used */
  percentUsed: number;
  /** Period start date */
  periodStart: string;
  /** Period end date */
  periodEnd: string;
  /** Days remaining in period */
  daysRemaining: number;
}

/**
 * Interface for B2B spending operations.
 * All adapters must implement this interface.
 */
export interface ISpendingService {
  // Spending Limits

  /**
   * List spending limits.
   *
   * @param companyId - Company ID
   * @param options - Listing options
   * @returns Array of spending limits
   *
   * @example
   * ```typescript
   * const limits = await api.b2b.spending.listLimits("comp_123", {
   *   entityType: "employee",
   *   activeOnly: true
   * });
   * ```
   */
  listLimits(
    companyId: string,
    options?: ListSpendingLimitsOptions
  ): Promise<SpendingLimit[]>;

  /**
   * Get a spending limit by ID.
   *
   * @param id - Limit ID
   * @returns Spending limit details
   */
  getLimit(id: string): Promise<SpendingLimit>;

  /**
   * Get limits for an employee.
   *
   * @param employeeId - Employee ID
   * @returns Array of applicable limits
   */
  getEmployeeLimits(employeeId: string): Promise<SpendingLimit[]>;

  /**
   * Get limits for a department.
   *
   * @param departmentId - Department ID
   * @returns Array of limits
   */
  getDepartmentLimits(departmentId: string): Promise<SpendingLimit[]>;

  /**
   * Create a spending limit.
   *
   * @param companyId - Company ID
   * @param input - Limit data
   * @returns Created limit
   *
   * @example
   * ```typescript
   * const limit = await api.b2b.spending.createLimit("comp_123", {
   *   name: "Monthly Employee Limit",
   *   entityType: "employee",
   *   entityId: "emp_456",
   *   period: "monthly",
   *   limitAmount: 5000,
   *   currency: "EUR",
   *   warningThreshold: 80
   * });
   * ```
   */
  createLimit(
    companyId: string,
    input: CreateSpendingLimitInput
  ): Promise<SpendingLimit>;

  /**
   * Update a spending limit.
   *
   * @param id - Limit ID
   * @param input - Update data
   * @returns Updated limit
   */
  updateLimit(id: string, input: UpdateSpendingLimitInput): Promise<SpendingLimit>;

  /**
   * Delete a spending limit.
   *
   * @param id - Limit ID
   */
  deleteLimit(id: string): Promise<void>;

  /**
   * Reset a spending limit counter.
   *
   * @param id - Limit ID
   * @param reason - Reason for reset
   * @returns Updated limit
   */
  resetLimit(id: string, reason?: string): Promise<SpendingLimit>;

  // Spending Rules

  /**
   * List spending rules.
   *
   * @param companyId - Company ID
   * @returns Array of rules
   */
  listRules(companyId: string): Promise<SpendingRule[]>;

  /**
   * Get a spending rule.
   *
   * @param id - Rule ID
   * @returns Rule details
   */
  getRule(id: string): Promise<SpendingRule>;

  /**
   * Create a spending rule.
   *
   * @param companyId - Company ID
   * @param input - Rule data
   * @returns Created rule
   */
  createRule(companyId: string, input: CreateSpendingRuleInput): Promise<SpendingRule>;

  /**
   * Update a spending rule.
   *
   * @param id - Rule ID
   * @param input - Update data
   * @returns Updated rule
   */
  updateRule(
    id: string,
    input: Partial<CreateSpendingRuleInput>
  ): Promise<SpendingRule>;

  /**
   * Delete a spending rule.
   *
   * @param id - Rule ID
   */
  deleteRule(id: string): Promise<void>;

  /**
   * Activate a rule.
   *
   * @param id - Rule ID
   * @returns Updated rule
   */
  activateRule(id: string): Promise<SpendingRule>;

  /**
   * Deactivate a rule.
   *
   * @param id - Rule ID
   * @returns Updated rule
   */
  deactivateRule(id: string): Promise<SpendingRule>;

  // Spending Checks

  /**
   * Check if a purchase is allowed.
   *
   * @param employeeId - Employee ID
   * @param amount - Purchase amount
   * @param categoryId - Product category (optional)
   * @returns Check result
   *
   * @example
   * ```typescript
   * const check = await api.b2b.spending.checkPurchase("emp_123", 500, "cat_456");
   * if (!check.allowed) {
   *   console.log("Cannot purchase:", check.reason);
   *   if (check.requiresApproval) {
   *     // Redirect to approval flow
   *   }
   * }
   * ```
   */
  checkPurchase(
    employeeId: string,
    amount: number,
    categoryId?: string
  ): Promise<SpendingCheckResult>;

  /**
   * Get remaining budget for an employee.
   *
   * @param employeeId - Employee ID
   * @param period - Budget period (optional)
   * @returns Remaining amount
   */
  getRemainingBudget(employeeId: string, period?: SpendingPeriod): Promise<number>;

  // Transactions

  /**
   * List spending transactions.
   *
   * @param companyId - Company ID
   * @param filters - Filter options
   * @returns Paginated transactions
   */
  listTransactions(
    companyId: string,
    filters?: SpendingFilters & { page?: number; pageSize?: number }
  ): Promise<PaginatedResponse<SpendingTransaction>>;

  /**
   * Get transactions for an employee.
   *
   * @param employeeId - Employee ID
   * @param filters - Filter options
   * @returns Paginated transactions
   */
  getEmployeeTransactions(
    employeeId: string,
    filters?: SpendingFilters & { page?: number; pageSize?: number }
  ): Promise<PaginatedResponse<SpendingTransaction>>;

  /**
   * Record a manual adjustment.
   *
   * @param companyId - Company ID
   * @param input - Adjustment data
   * @returns Created transaction
   */
  recordAdjustment(
    companyId: string,
    input: SpendingAdjustmentInput
  ): Promise<SpendingTransaction>;

  // Reports

  /**
   * Get spending report.
   *
   * @param companyId - Company ID
   * @param periodStart - Period start date
   * @param periodEnd - Period end date
   * @returns Spending report
   *
   * @example
   * ```typescript
   * const report = await api.b2b.spending.getReport(
   *   "comp_123",
   *   "2024-01-01",
   *   "2024-01-31"
   * );
   * console.log("Total spending:", report.totalSpending);
   * console.log("By category:", report.byCategory);
   * ```
   */
  getReport(
    companyId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<SpendingReport>;

  /**
   * Get budget summaries.
   *
   * @param companyId - Company ID
   * @returns Array of budget summaries
   */
  getBudgetSummaries(companyId: string): Promise<BudgetSummary[]>;

  /**
   * Get employee budget summary.
   *
   * @param employeeId - Employee ID
   * @returns Budget summary for employee
   */
  getEmployeeBudgetSummary(employeeId: string): Promise<BudgetSummary[]>;

  /**
   * Get department budget summary.
   *
   * @param departmentId - Department ID
   * @returns Budget summary for department
   */
  getDepartmentBudgetSummary(departmentId: string): Promise<BudgetSummary>;

  /**
   * Export spending report.
   *
   * @param companyId - Company ID
   * @param filters - Report filters
   * @param format - Export format
   * @returns Download URL
   */
  exportReport(
    companyId: string,
    filters: SpendingFilters,
    format: "csv" | "xlsx" | "pdf"
  ): Promise<string>;

  // Alerts

  /**
   * Get spending alerts.
   *
   * @param companyId - Company ID
   * @returns Array of current alerts
   */
  getAlerts(companyId: string): Promise<Array<{
    type: "exceeded" | "near_limit";
    entityType: SpendingLimitEntityType;
    entityId: string;
    entityName: string;
    limitName: string;
    limitAmount: number;
    currentSpending: number;
    percentUsed: number;
  }>>;

  /**
   * Dismiss an alert.
   *
   * @param alertId - Alert ID
   */
  dismissAlert(alertId: string): Promise<void>;
}
