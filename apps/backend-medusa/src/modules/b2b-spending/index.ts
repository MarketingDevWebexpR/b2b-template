/**
 * B2B Spending Module Definition
 *
 * This module provides spending limit management, rule enforcement,
 * and transaction tracking for B2B e-commerce.
 *
 * Features:
 * - Multi-level spending limits (company, department, role, employee)
 * - Configurable limit periods (per-order, daily, weekly, monthly, etc.)
 * - Business rules with actions (block, require approval, notify, warn)
 * - Transaction recording for audit trail
 * - Automatic periodic limit resets
 *
 * @packageDocumentation
 */

import { Module } from "@medusajs/framework/utils";
import SpendingModuleService from "./service";

/**
 * Module identifier - must match service name derived from first model's table name
 * (b2b_spending_limit → b2bSpendingLimitService)
 */
export const B2B_SPENDING_MODULE = "b2bSpendingLimitService";

/**
 * B2B Spending Module
 *
 * Register this module in medusa-config.ts:
 * ```typescript
 * modules: [
 *   { resolve: "./src/modules/b2b-spending" },
 * ]
 * ```
 */
export default Module(B2B_SPENDING_MODULE, {
  service: SpendingModuleService,
});

// Re-export service and types
export { default as SpendingModuleService } from "./service";
export type {
  EntityType,
  PeriodType,
  RuleAction,
  RuleCondition,
  TransactionType,
  TransactionStatus,
  CreateSpendingLimitInput,
  CreateSpendingRuleInput,
  RecordTransactionInput,
  SpendingCheckResult,
  SpendingViolation,
  SpendingWarning,
} from "./service";

// Re-export models and constants
export {
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
