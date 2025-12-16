/**
 * Store B2B Spending API Route
 *
 * Provides endpoints for authenticated customers to view their spending limits.
 *
 * GET /store/b2b/spending - Get current customer's spending limits
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";
import type SpendingModuleService from "../../../../modules/b2b-spending/service";
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
 * GET /store/b2b/spending
 *
 * Returns the spending limits applicable to the authenticated customer.
 * Includes current spending, remaining credit, and utilization percentage.
 *
 * @requires Authentication
 */
export async function GET(
  req: AuthenticatedRequest,
  res: MedusaResponse
): Promise<void> {
  const customerId = req.auth_context?.actor_id;

  if (!customerId) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Customer authentication required"
    );
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  // Get customer's company and role from link
  const { data: customers } = await query.graph({
    entity: "customer",
    fields: [
      "id",
      "company.id",
      "company.name",
    ],
    filters: {
      id: customerId,
    },
  });

  const customer = customers[0];

  if (!customer?.company) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No company associated with this customer"
    );
  }

  const companyId = customer.company.id;
  const spendingService: SpendingModuleService = req.scope.resolve(B2B_SPENDING_MODULE);

  // Get applicable limits
  const limits = await spendingService.getApplicableLimits(
    companyId,
    customerId
    // role and department would come from the link's extra fields
  );

  // Enhance limits with utilization info
  const enhancedLimits = limits.map((limit) => {
    const currentSpending = Number(limit.current_spending);
    const limitAmount = Number(limit.limit_amount);
    const remaining = Math.max(0, limitAmount - currentSpending);
    const utilization = limitAmount > 0 ? (currentSpending / limitAmount) * 100 : 0;

    return {
      id: limit.id,
      name: limit.name,
      entity_type: limit.entity_type,
      period: limit.period,
      limit_amount: limitAmount,
      current_spending: currentSpending,
      remaining_credit: remaining,
      utilization_percentage: Math.round(utilization * 100) / 100,
      warning_threshold: limit.warning_threshold,
      is_over_threshold: utilization >= Number(limit.warning_threshold),
      next_reset_at: limit.next_reset_at,
    };
  });

  res.status(200).json({
    limits: enhancedLimits,
    company: {
      id: companyId,
      name: customer.company.name,
    },
  });
}
