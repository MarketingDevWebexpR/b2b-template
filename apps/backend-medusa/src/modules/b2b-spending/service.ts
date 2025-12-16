/**
 * B2B Spending Module Service
 *
 * Service class providing business logic for spending limit management,
 * rule evaluation, and transaction tracking.
 *
 * @packageDocumentation
 */

import { MedusaService } from "@medusajs/framework/utils";
import {
  SpendingLimit,
  SpendingRule,
  SpendingTransaction,
  ENTITY_TYPES,
  PERIOD_TYPES,
  RULE_ACTIONS,
  RULE_CONDITIONS,
  TRANSACTION_TYPES,
  TRANSACTION_STATUSES,
} from "./models/index";
import {
  validateRequired,
  validatePositive,
  validateRange,
  validateOptional,
} from "../validation-utils";

/**
 * Entity type values
 */
export type EntityType = typeof ENTITY_TYPES[number];

/**
 * Period type values
 */
export type PeriodType = typeof PERIOD_TYPES[number];

/**
 * Rule action values
 */
export type RuleAction = typeof RULE_ACTIONS[number];

/**
 * Rule condition values
 */
export type RuleCondition = typeof RULE_CONDITIONS[number];

/**
 * Transaction type values
 */
export type TransactionType = typeof TRANSACTION_TYPES[number];

/**
 * Transaction status values
 */
export type TransactionStatus = typeof TRANSACTION_STATUSES[number];

/**
 * Input for creating a spending limit
 */
export interface CreateSpendingLimitInput {
  companyId: string;
  entityType: EntityType;
  entityId?: string;
  period: PeriodType;
  limitAmount: number;
  warningThreshold?: number;
  name?: string;
  description?: string;
}

/**
 * Input for creating a spending rule
 */
export interface CreateSpendingRuleInput {
  companyId: string;
  name: string;
  condition: RuleCondition;
  action: RuleAction;
  thresholdAmount?: number;
  thresholdPercentage?: number;
  appliesToEntityTypes?: EntityType[];
  appliesToEntityIds?: string[];
  restrictedCategoryIds?: string[];
  restrictedVendorIds?: string[];
  notifyEmails?: string[];
  notifyCustomerIds?: string[];
  priority?: number;
  approvalWorkflowId?: string;
  description?: string;
}

/**
 * Input for recording a spending transaction
 */
export interface RecordTransactionInput {
  companyId: string;
  customerId: string;
  type: TransactionType;
  amount: number;
  currencyCode?: string;
  orderId?: string;
  quoteId?: string;
  relatedTransactionId?: string;
  description?: string;
  createdBy?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Result of checking spending allowance
 */
export interface SpendingCheckResult {
  /** Whether the spending is allowed */
  allowed: boolean;
  /** Whether approval is required */
  requiresApproval: boolean;
  /** Rules that were violated */
  violations: SpendingViolation[];
  /** Warning messages (spending approaching limit) */
  warnings: SpendingWarning[];
  /** Available credit after this spending */
  remainingCredit?: number;
}

/**
 * Spending rule violation
 */
export interface SpendingViolation {
  ruleId: string;
  ruleName: string;
  condition: RuleCondition;
  action: RuleAction;
  message: string;
  limitId?: string;
  limitAmount?: number;
  currentSpending?: number;
}

/**
 * Spending warning
 */
export interface SpendingWarning {
  limitId: string;
  limitName?: string;
  type: "approaching_limit" | "over_threshold";
  currentPercentage: number;
  warningThreshold: number;
  message: string;
}

/**
 * B2B Spending Module Service
 *
 * Provides all business logic for spending limits, rules, and transactions.
 *
 * @example
 * ```typescript
 * // Check if spending is allowed
 * const result = await spendingService.checkSpendingAllowed(
 *   "comp_123",
 *   "cust_456",
 *   15000
 * );
 *
 * if (result.allowed && !result.requiresApproval) {
 *   // Proceed with order
 *   await spendingService.recordTransaction({
 *     companyId: "comp_123",
 *     customerId: "cust_456",
 *     type: "charge",
 *     amount: 15000,
 *     orderId: "order_789",
 *   });
 * }
 * ```
 */
class SpendingModuleService extends MedusaService({
  SpendingLimit,
  SpendingRule,
  SpendingTransaction,
}) {
  // ==========================================
  // SPENDING LIMIT MANAGEMENT
  // ==========================================

  /**
   * Creates a spending limit with proper period calculation.
   *
   * @param data - Limit creation data
   * @returns The created limit
   * @throws ValidationError if input validation fails
   */
  async createLimit(data: CreateSpendingLimitInput) {
    // Validate required fields
    validateRequired(data.companyId, "companyId");
    validateRequired(data.limitAmount, "limitAmount");
    validatePositive(data.limitAmount, "limitAmount");

    // Validate optional warningThreshold (must be 0-100 if provided)
    validateOptional(data.warningThreshold, (value) =>
      validateRange(value, "warningThreshold", 0, 100)
    );

    const nextResetAt = this.calculateNextReset(data.period);

    return await this.createSpendingLimits({
      company_id: data.companyId,
      entity_type: data.entityType,
      entity_id: data.entityId ?? null,
      period: data.period,
      limit_amount: data.limitAmount,
      warning_threshold: data.warningThreshold ?? 80,
      current_spending: 0,
      next_reset_at: nextResetAt,
      is_active: true,
      name: data.name ?? null,
      description: data.description ?? null,
    });
  }

  /**
   * Gets all applicable limits for a customer.
   *
   * @param companyId - Company ID
   * @param customerId - Customer ID
   * @param role - Customer's role in the company
   * @param department - Customer's department
   * @returns List of applicable limits
   */
  async getApplicableLimits(
    companyId: string,
    customerId: string,
    role?: string,
    department?: string
  ) {
    const limits = await this.listSpendingLimits({
      filters: {
        company_id: companyId,
        is_active: true,
      },
    });

    // Filter to only applicable limits
    return limits.filter((limit) => {
      switch (limit.entity_type) {
        case "company":
          return true; // Company-wide limits always apply

        case "employee":
          return limit.entity_id === customerId;

        case "role":
          return role && limit.entity_id === role;

        case "department":
          return department && limit.entity_id === department;

        default:
          return false;
      }
    });
  }

  /**
   * Resets expired limits. Call this from a scheduled job.
   *
   * @returns Number of limits reset
   */
  async resetExpiredLimits(): Promise<number> {
    const now = new Date();

    const expiredLimits = await this.listSpendingLimits({
      filters: {
        is_active: true,
        next_reset_at: { $lte: now },
      },
    });

    let resetCount = 0;

    for (const limit of expiredLimits) {
      const nextResetAt = this.calculateNextReset(limit.period as PeriodType);

      // Record reset transaction
      const limitIds = [limit.id] as unknown as Record<string, unknown>;
      await this.createSpendingTransactions({
        company_id: limit.company_id,
        customer_id: "system",
        type: "reset",
        status: "applied",
        amount: -Number(limit.current_spending),
        description: `Periodic reset for limit ${limit.name || limit.id}`,
        affected_limit_ids: limitIds,
        limits_snapshot_before: { [limit.id]: Number(limit.current_spending) },
        limits_snapshot_after: { [limit.id]: 0 },
        created_by: "system",
        applied_at: now,
      });

      // Reset the limit
      await this.updateSpendingLimits({
        id: limit.id,
        current_spending: 0,
        next_reset_at: nextResetAt,
      });

      resetCount++;
    }

    return resetCount;
  }

  // ==========================================
  // SPENDING RULES
  // ==========================================

  /**
   * Creates a spending rule.
   *
   * @param data - Rule creation data
   * @returns The created rule
   */
  async createRule(data: CreateSpendingRuleInput) {
    return await this.createSpendingRules({
      company_id: data.companyId,
      name: data.name,
      description: data.description ?? null,
      condition: data.condition,
      threshold_amount: data.thresholdAmount ?? null,
      threshold_percentage: data.thresholdPercentage ?? null,
      action: data.action,
      applies_to_entity_types: (data.appliesToEntityTypes ?? null) as unknown as Record<string, unknown>,
      applies_to_entity_ids: (data.appliesToEntityIds ?? null) as unknown as Record<string, unknown>,
      restricted_category_ids: (data.restrictedCategoryIds ?? null) as unknown as Record<string, unknown>,
      restricted_vendor_ids: (data.restrictedVendorIds ?? null) as unknown as Record<string, unknown>,
      notify_emails: (data.notifyEmails ?? null) as unknown as Record<string, unknown>,
      notify_customer_ids: (data.notifyCustomerIds ?? null) as unknown as Record<string, unknown>,
      priority: data.priority ?? 0,
      is_active: true,
      approval_workflow_id: data.approvalWorkflowId ?? null,
    });
  }

  /**
   * Gets active rules for a company, sorted by priority.
   *
   * @param companyId - Company ID
   * @returns List of active rules
   */
  async getActiveRules(companyId: string) {
    const rules = await this.listSpendingRules({
      filters: {
        company_id: companyId,
        is_active: true,
      },
    });

    // Sort by priority descending (higher priority first)
    return rules.sort((a, b) => Number(b.priority) - Number(a.priority));
  }

  // ==========================================
  // SPENDING VALIDATION
  // ==========================================

  /**
   * Checks if a spending amount is allowed.
   *
   * @param companyId - Company ID
   * @param customerId - Customer ID
   * @param amount - Amount to spend (in cents)
   * @param role - Customer's role (optional)
   * @param department - Customer's department (optional)
   * @returns Check result with violations and warnings
   */
  async checkSpendingAllowed(
    companyId: string,
    customerId: string,
    amount: number,
    role?: string,
    department?: string
  ): Promise<SpendingCheckResult> {
    const result: SpendingCheckResult = {
      allowed: true,
      requiresApproval: false,
      violations: [],
      warnings: [],
    };

    // Get applicable limits
    const limits = await this.getApplicableLimits(companyId, customerId, role, department);

    // Check each limit
    for (const limit of limits) {
      const currentSpending = Number(limit.current_spending);
      const limitAmount = Number(limit.limit_amount);
      const warningThreshold = Number(limit.warning_threshold);

      // For per_order limits, check if amount exceeds limit
      if (limit.period === "per_order") {
        if (amount > limitAmount) {
          result.violations.push({
            ruleId: "limit_exceeded",
            ruleName: `Per-order limit: ${limit.name || limit.id}`,
            condition: "limit_exceeded",
            action: "block",
            message: `Order amount (${amount}) exceeds per-order limit (${limitAmount})`,
            limitId: limit.id,
            limitAmount,
            currentSpending: amount,
          });
        }
        continue;
      }

      // For periodic limits, check if spending + amount would exceed
      const projectedSpending = currentSpending + amount;
      const utilizationPercent = (projectedSpending / limitAmount) * 100;

      if (projectedSpending > limitAmount) {
        result.violations.push({
          ruleId: "limit_exceeded",
          ruleName: `${limit.period} limit: ${limit.name || limit.id}`,
          condition: "limit_exceeded",
          action: "block",
          message: `Spending (${projectedSpending}) would exceed ${limit.period} limit (${limitAmount})`,
          limitId: limit.id,
          limitAmount,
          currentSpending,
        });
      } else if (utilizationPercent >= warningThreshold) {
        result.warnings.push({
          limitId: limit.id,
          limitName: limit.name as string | undefined,
          type: "approaching_limit",
          currentPercentage: utilizationPercent,
          warningThreshold,
          message: `Spending at ${utilizationPercent.toFixed(1)}% of ${limit.period} limit`,
        });
      }

      // Calculate remaining credit
      if (result.remainingCredit === undefined) {
        result.remainingCredit = limitAmount - projectedSpending;
      } else {
        result.remainingCredit = Math.min(
          result.remainingCredit,
          limitAmount - projectedSpending
        );
      }
    }

    // Get and evaluate rules
    const rules = await this.getActiveRules(companyId);

    for (const rule of rules) {
      const violation = this.evaluateRule(rule, amount, result.violations);

      if (violation) {
        result.violations.push(violation);

        if (violation.action === "require_approval") {
          result.requiresApproval = true;
        }
      }
    }

    // Determine final allowed status
    const hasBlockingViolation = result.violations.some(
      (v) => v.action === "block"
    );
    result.allowed = !hasBlockingViolation;

    return result;
  }

  /**
   * Evaluates a single rule against the spending context.
   */
  private evaluateRule(
    rule: Record<string, unknown>,
    amount: number,
    existingViolations: SpendingViolation[]
  ): SpendingViolation | null {
    const condition = rule.condition as RuleCondition;
    const action = rule.action as RuleAction;
    const thresholdAmount = Number(rule.threshold_amount ?? 0);

    switch (condition) {
      case "amount_exceeds":
        if (amount > thresholdAmount) {
          return {
            ruleId: rule.id as string,
            ruleName: rule.name as string,
            condition,
            action,
            message: `Order amount (${amount}) exceeds threshold (${thresholdAmount})`,
          };
        }
        break;

      case "limit_exceeded":
        // Already handled by limit checks
        if (existingViolations.some((v) => v.condition === "limit_exceeded")) {
          return {
            ruleId: rule.id as string,
            ruleName: rule.name as string,
            condition,
            action,
            message: "Spending limit exceeded - rule triggered",
          };
        }
        break;

      case "limit_warning":
        // Would need warning context
        break;

      // Category and vendor restrictions would need order context
      case "category_restricted":
      case "vendor_restricted":
      case "quantity_exceeds":
        // These require additional order context
        break;
    }

    return null;
  }

  // ==========================================
  // TRANSACTION RECORDING
  // ==========================================

  /**
   * Records a spending transaction and updates limits with atomic rollback capability.
   *
   * This method implements a transaction pattern with the following guarantees:
   * 1. Transaction is created with "pending" status before any limit changes
   * 2. A snapshot of current spending values is stored before modifications
   * 3. If any limit update fails, all changes are rolled back using the snapshot
   * 4. Transaction status is updated to "applied" on success or "failed" on error
   *
   * @param data - Transaction data
   * @returns The created transaction
   * @throws Re-throws the original error after rollback on failure
   *
   * @example
   * ```typescript
   * try {
   *   const transaction = await spendingService.recordTransaction({
   *     companyId: "comp_123",
   *     customerId: "cust_456",
   *     type: "charge",
   *     amount: 15000,
   *     orderId: "order_789",
   *   });
   *   // Transaction applied successfully
   * } catch (error) {
   *   // Transaction failed and limits were rolled back
   *   console.error("Transaction failed:", error);
   * }
   * ```
   */
  async recordTransaction(data: RecordTransactionInput) {
    const limits = await this.getApplicableLimits(
      data.companyId,
      data.customerId
    );

    // Skip per_order limits for recording (they are checked but not accumulated)
    const periodicLimits = limits.filter((l) => l.period !== "per_order");

    // Step 1: Capture snapshot BEFORE any changes
    const snapshotBefore: Record<string, number> = {};
    for (const limit of periodicLimits) {
      snapshotBefore[limit.id] = Number(limit.current_spending);
    }

    // Step 2: Create transaction with "pending" status
    const limitIds = periodicLimits.map((l) => l.id) as unknown as Record<string, unknown>;
    const transaction = await this.createSpendingTransactions({
      company_id: data.companyId,
      customer_id: data.customerId,
      type: data.type,
      status: "pending",
      amount: data.amount,
      currency_code: data.currencyCode ?? "EUR",
      order_id: data.orderId ?? null,
      quote_id: data.quoteId ?? null,
      related_transaction_id: data.relatedTransactionId ?? null,
      affected_limit_ids: limitIds,
      limits_snapshot_before: snapshotBefore,
      description: data.description ?? null,
      metadata: data.metadata ?? null,
      created_by: data.createdBy ?? null,
    });

    // Step 3: Attempt to update limits within try-catch for atomicity
    try {
      const snapshotAfter: Record<string, number> = {};

      for (const limit of periodicLimits) {
        // Use the snapshot value (guaranteed to exist since we just populated it)
        const currentSpending = snapshotBefore[limit.id] ?? 0;
        let newSpending: number;

        if (data.type === "charge") {
          newSpending = currentSpending + data.amount;
        } else if (data.type === "refund" || data.type === "adjustment") {
          // amount is negative for refunds
          newSpending = Math.max(0, currentSpending + data.amount);
        } else {
          newSpending = currentSpending;
        }

        snapshotAfter[limit.id] = newSpending;

        await this.updateSpendingLimits({
          id: limit.id,
          current_spending: newSpending,
          last_transaction_at: new Date(),
        });
      }

      // Step 4: On success - mark transaction as "applied"
      await this.updateSpendingTransactions({
        id: transaction.id,
        status: "applied",
        limits_snapshot_after: snapshotAfter,
        applied_at: new Date(),
      });

      return await this.retrieveSpendingTransaction(transaction.id);
    } catch (error) {
      // Step 5: On failure - mark transaction as "failed" and rollback
      const failureReason =
        error instanceof Error ? error.message : "Unknown error during limit update";

      // Mark transaction as failed with reason
      await this.updateSpendingTransactions({
        id: transaction.id,
        status: "failed",
        failure_reason: failureReason,
      });

      // Rollback all limits to their original values using the snapshot
      await this.rollbackLimits(periodicLimits, snapshotBefore, transaction.id);

      // Re-throw the original error so callers know the transaction failed
      throw error;
    }
  }

  /**
   * Rolls back spending limits to their snapshot values.
   *
   * This is called when a transaction fails mid-way through limit updates.
   * Each limit rollback is wrapped in its own try-catch to ensure we attempt
   * to restore as many limits as possible even if some rollbacks fail.
   *
   * @param limits - The limits to rollback
   * @param snapshot - The snapshot containing original values
   * @param transactionId - The transaction ID (for logging purposes)
   * @private
   */
  private async rollbackLimits(
    limits: Array<{ id: string; period: string }>,
    snapshot: Record<string, number>,
    transactionId: string
  ): Promise<void> {
    const rollbackErrors: Array<{ limitId: string; error: unknown }> = [];

    for (const limit of limits) {
      const originalValue = snapshot[limit.id];

      // Skip if we don't have a snapshot value for this limit
      if (originalValue === undefined) {
        continue;
      }

      try {
        await this.updateSpendingLimits({
          id: limit.id,
          current_spending: originalValue,
        });
      } catch (rollbackError) {
        // Log the rollback failure but continue with other limits
        // This ensures we attempt to restore as many limits as possible
        rollbackErrors.push({
          limitId: limit.id,
          error: rollbackError,
        });

        // In production, you would want to log this to a monitoring system
        console.error(
          `[SpendingModule] Failed to rollback limit ${limit.id} for transaction ${transactionId}:`,
          rollbackError
        );
      }
    }

    // If any rollbacks failed, log a summary warning
    if (rollbackErrors.length > 0) {
      console.warn(
        `[SpendingModule] Transaction ${transactionId} rollback incomplete: ` +
          `${rollbackErrors.length}/${limits.length} limits failed to restore. ` +
          `Manual intervention may be required for limits: ${rollbackErrors.map((e) => e.limitId).join(", ")}`
      );
    }
  }

  /**
   * Reverses a transaction (e.g., for cancelled orders).
   *
   * @param transactionId - ID of transaction to reverse
   * @param reason - Reason for reversal
   * @returns The reversal transaction
   */
  async reverseTransaction(transactionId: string, reason?: string) {
    const original = await this.retrieveSpendingTransaction(transactionId);

    if (original.status !== "applied") {
      throw new Error(`Cannot reverse transaction with status "${original.status}"`);
    }

    // Create reversal transaction
    const reversal = await this.recordTransaction({
      companyId: original.company_id,
      customerId: original.customer_id,
      type: "adjustment",
      amount: -Number(original.amount),
      relatedTransactionId: transactionId,
      description: reason ?? `Reversal of transaction ${transactionId}`,
      createdBy: "system",
    });

    // Mark original as reversed
    await this.updateSpendingTransactions({
      id: transactionId,
      status: "reversed",
      failure_reason: reason ?? "Reversed",
    });

    return reversal;
  }

  // ==========================================
  // REPORTING
  // ==========================================

  /**
   * Gets spending summary for a company.
   *
   * @param companyId - Company ID
   * @param startDate - Start date for summary
   * @param endDate - End date for summary
   * @returns Spending summary
   */
  async getSpendingSummary(
    companyId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const filters: Record<string, unknown> = {
      company_id: companyId,
      status: "applied",
      type: "charge",
    };

    if (startDate || endDate) {
      filters.created_at = {};
      if (startDate) {
        (filters.created_at as Record<string, Date>).$gte = startDate;
      }
      if (endDate) {
        (filters.created_at as Record<string, Date>).$lte = endDate;
      }
    }

    const transactions = await this.listSpendingTransactions({ filters });

    const totalSpending = transactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );

    const transactionCount = transactions.length;

    // Group by customer
    const byCustomer = transactions.reduce((acc, t) => {
      const customerId = t.customer_id;
      if (!acc[customerId]) {
        acc[customerId] = { total: 0, count: 0 };
      }
      acc[customerId].total += Number(t.amount);
      acc[customerId].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return {
      totalSpending,
      transactionCount,
      averageTransaction: transactionCount > 0 ? totalSpending / transactionCount : 0,
      byCustomer,
    };
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Calculates the next reset date based on period type.
   */
  private calculateNextReset(period: PeriodType): Date | null {
    const now = new Date();

    switch (period) {
      case "per_order":
        return null; // No reset for per-order limits

      case "daily":
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;

      case "weekly":
        const nextMonday = new Date(now);
        nextMonday.setDate(nextMonday.getDate() + ((8 - nextMonday.getDay()) % 7 || 7));
        nextMonday.setHours(0, 0, 0, 0);
        return nextMonday;

      case "monthly":
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return nextMonth;

      case "quarterly":
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const nextQuarter = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 1);
        return nextQuarter;

      case "yearly":
        const nextYear = new Date(now.getFullYear() + 1, 0, 1);
        return nextYear;

      default:
        return null;
    }
  }
}

export default SpendingModuleService;
