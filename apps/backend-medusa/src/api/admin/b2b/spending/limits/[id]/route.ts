/**
 * Admin B2B Spending Limit Detail API Routes
 *
 * Provides admin endpoints for individual limit management.
 *
 * GET /admin/b2b/spending/limits/:id - Get limit details
 * PUT /admin/b2b/spending/limits/:id - Update limit
 * DELETE /admin/b2b/spending/limits/:id - Deactivate limit
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type SpendingModuleService from "../../../../../../modules/b2b-spending/service";
const B2B_QUOTE_MODULE = "b2bQuoteService";
const B2B_APPROVAL_MODULE = "b2bApprovalWorkflowService";
const B2B_SPENDING_MODULE = "b2bSpendingLimitService";
const B2B_COMPANY_MODULE = "b2bCompanyService";

/**
 * Request with limit ID parameter
 */
interface LimitIdRequest extends MedusaRequest {
  params: {
    id: string;
  };
}

/**
 * GET /admin/b2b/spending/limits/:id
 *
 * Returns detailed information about a specific spending limit.
 */
export async function GET(
  req: LimitIdRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params;
  const spendingService: SpendingModuleService = req.scope.resolve(B2B_SPENDING_MODULE);

  try {
    const limit = await spendingService.retrieveSpendingLimit(id);

    const currentSpending = Number(limit.current_spending);
    const limitAmount = Number(limit.limit_amount);
    const remaining = Math.max(0, limitAmount - currentSpending);
    const utilization = limitAmount > 0 ? (currentSpending / limitAmount) * 100 : 0;

    res.status(200).json({
      limit: {
        ...limit,
        remaining_credit: remaining,
        utilization_percentage: Math.round(utilization * 100) / 100,
        is_over_threshold: utilization >= Number(limit.warning_threshold),
      },
    });
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Spending limit with id "${id}" not found`
    );
  }
}

/**
 * Update limit request body
 */
interface UpdateLimitBody {
  limit_amount?: number;
  warning_threshold?: number;
  current_spending?: number;
  is_active?: boolean;
  name?: string;
  description?: string;
}

/**
 * PUT /admin/b2b/spending/limits/:id
 *
 * Updates a spending limit's configuration.
 */
export async function PUT(
  req: LimitIdRequest & { body: UpdateLimitBody },
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params;
  const body = req.body;
  const spendingService: SpendingModuleService = req.scope.resolve(B2B_SPENDING_MODULE);

  // Verify limit exists
  try {
    await spendingService.retrieveSpendingLimit(id);
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Spending limit with id "${id}" not found`
    );
  }

  const updateData: Record<string, unknown> = {};

  if (body.limit_amount !== undefined) {
    if (body.limit_amount <= 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "limit_amount must be a positive number"
      );
    }
    updateData.limit_amount = body.limit_amount;
  }

  if (body.warning_threshold !== undefined) {
    if (body.warning_threshold < 0 || body.warning_threshold > 100) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "warning_threshold must be between 0 and 100"
      );
    }
    updateData.warning_threshold = body.warning_threshold;
  }

  if (body.current_spending !== undefined) {
    if (body.current_spending < 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "current_spending cannot be negative"
      );
    }
    updateData.current_spending = body.current_spending;
  }

  if (body.is_active !== undefined) {
    updateData.is_active = body.is_active;
  }

  if (body.name !== undefined) {
    updateData.name = body.name;
  }

  if (body.description !== undefined) {
    updateData.description = body.description;
  }

  await spendingService.updateSpendingLimits({ id }, updateData);
  const updatedLimit = await spendingService.retrieveSpendingLimit(id);

  res.status(200).json({
    limit: updatedLimit,
  });
}

/**
 * DELETE /admin/b2b/spending/limits/:id
 *
 * Deactivates a spending limit (soft delete).
 */
export async function DELETE(
  req: LimitIdRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params;
  const spendingService: SpendingModuleService = req.scope.resolve(B2B_SPENDING_MODULE);

  try {
    await spendingService.updateSpendingLimits({ id }, { is_active: false });

    res.status(200).json({
      id,
      object: "spending_limit",
      deleted: true,
    });
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Spending limit with id "${id}" not found`
    );
  }
}
