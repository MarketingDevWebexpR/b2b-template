/**
 * Store B2B Spending Check API Route
 *
 * Validates spending amounts against limits and rules.
 *
 * POST /store/b2b/spending/check - Check if spending is allowed
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";
import type SpendingModuleService from "../../../../../modules/b2b-spending/service";
const B2B_QUOTE_MODULE = "b2bQuoteService";
const B2B_APPROVAL_MODULE = "b2bApprovalWorkflowService";
const B2B_SPENDING_MODULE = "b2bSpendingLimitService";
const B2B_COMPANY_MODULE = "b2bCompanyService";

/**
 * Extended request type with authenticated customer
 */
interface AuthenticatedRequest extends MedusaRequest {
  auth_context?: {
    actor_id: string;
    actor_type: "customer" | "user";
  };
}

/**
 * Spending check request body
 */
interface SpendingCheckBody {
  /** Amount to validate (in cents) */
  amount: number;
}

/**
 * POST /store/b2b/spending/check
 *
 * Validates if the authenticated customer can spend the specified amount.
 * Returns whether the spending is allowed, requires approval, or is blocked.
 *
 * @requires Authentication
 *
 * @example Request
 * ```json
 * { "amount": 15000 }
 * ```
 *
 * @example Response (allowed)
 * ```json
 * {
 *   "allowed": true,
 *   "requires_approval": false,
 *   "violations": [],
 *   "warnings": [
 *     { "message": "Spending at 85% of monthly limit" }
 *   ],
 *   "remaining_credit": 1500
 * }
 * ```
 *
 * @example Response (requires approval)
 * ```json
 * {
 *   "allowed": true,
 *   "requires_approval": true,
 *   "violations": [
 *     { "rule_name": "High Value Order", "action": "require_approval" }
 *   ],
 *   "warnings": [],
 *   "remaining_credit": 35000
 * }
 * ```
 */
export async function POST(
  req: AuthenticatedRequest & { body: SpendingCheckBody },
  res: MedusaResponse
): Promise<void> {
  const customerId = req.auth_context?.actor_id;

  if (!customerId) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Customer authentication required"
    );
  }

  const { amount } = req.body;

  if (typeof amount !== "number" || amount <= 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Amount must be a positive number"
    );
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  // Get customer's company
  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "company.id"],
    filters: {
      id: customerId,
    },
  });

  const customer = customers[0];

  if (!customer?.company) {
    // No company = no restrictions
    res.status(200).json({
      allowed: true,
      requires_approval: false,
      violations: [],
      warnings: [],
      remaining_credit: null,
    });
    return;
  }

  const companyId = customer.company.id;
  const spendingService: SpendingModuleService = req.scope.resolve(B2B_SPENDING_MODULE);

  // Check spending
  const result = await spendingService.checkSpendingAllowed(
    companyId,
    customerId,
    amount
  );

  // Transform violations for API response
  const violations = result.violations.map((v) => ({
    rule_id: v.ruleId,
    rule_name: v.ruleName,
    condition: v.condition,
    action: v.action,
    message: v.message,
    limit_id: v.limitId,
    limit_amount: v.limitAmount,
    current_spending: v.currentSpending,
  }));

  // Transform warnings for API response
  const warnings = result.warnings.map((w) => ({
    limit_id: w.limitId,
    limit_name: w.limitName,
    type: w.type,
    current_percentage: w.currentPercentage,
    warning_threshold: w.warningThreshold,
    message: w.message,
  }));

  res.status(200).json({
    allowed: result.allowed,
    requires_approval: result.requiresApproval,
    violations,
    warnings,
    remaining_credit: result.remainingCredit ?? null,
  });
}
