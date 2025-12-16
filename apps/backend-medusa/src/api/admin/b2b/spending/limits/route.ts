/**
 * Admin B2B Spending Limits API Routes
 *
 * Provides admin endpoints for spending limit management.
 *
 * GET /admin/b2b/spending/limits - List spending limits
 * POST /admin/b2b/spending/limits - Create a spending limit
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type SpendingModuleService from "../../../../../modules/b2b-spending/service";
import type { CreateSpendingLimitInput, EntityType, PeriodType } from "../../../../../modules/b2b-spending/service";
const B2B_QUOTE_MODULE = "b2bQuoteService";
const B2B_APPROVAL_MODULE = "b2bApprovalWorkflowService";
const B2B_SPENDING_MODULE = "b2bSpendingLimitService";
const B2B_COMPANY_MODULE = "b2bCompanyService";

/**
 * Query parameters for limit listing
 */
interface ListLimitsQuery {
  company_id?: string;
  entity_type?: EntityType;
  period?: PeriodType;
  is_active?: string;
  limit?: number;
  offset?: number;
}

/**
 * GET /admin/b2b/spending/limits
 *
 * Lists spending limits with optional filtering.
 *
 * @query company_id - Filter by company
 * @query entity_type - Filter by entity type (company, department, role, employee)
 * @query period - Filter by period type
 * @query is_active - Filter by active status ("true" or "false")
 */
export async function GET(
  req: MedusaRequest<object, ListLimitsQuery>,
  res: MedusaResponse
): Promise<void> {
  const spendingService: SpendingModuleService = req.scope.resolve(B2B_SPENDING_MODULE);

  const { company_id, entity_type, period, is_active, limit = 50, offset = 0 } = req.query;

  const filters: Record<string, unknown> = {};

  if (company_id) {
    filters.company_id = company_id;
  }

  if (entity_type) {
    filters.entity_type = entity_type;
  }

  if (period) {
    filters.period = period;
  }

  if (is_active !== undefined) {
    filters.is_active = is_active === "true";
  }

  const [limits, count] = await Promise.all([
    spendingService.listSpendingLimits(filters, {
      skip: Number(offset),
      take: Number(limit),
    }),
    spendingService.listSpendingLimits(filters, {
      select: ["id"],
    }).then((list) => list.length),
  ]);

  // Enhance limits with utilization info
  const enhancedLimits = limits.map((limitRecord) => {
    const currentSpending = Number(limitRecord.current_spending);
    const limitAmount = Number(limitRecord.limit_amount);
    const remaining = Math.max(0, limitAmount - currentSpending);
    const utilization = limitAmount > 0 ? (currentSpending / limitAmount) * 100 : 0;

    return {
      ...limitRecord,
      remaining_credit: remaining,
      utilization_percentage: Math.round(utilization * 100) / 100,
      is_over_threshold: utilization >= Number(limitRecord.warning_threshold),
    };
  });

  res.status(200).json({
    limits: enhancedLimits,
    count,
    limit: Number(limit),
    offset: Number(offset),
  });
}

/**
 * Create spending limit request body
 */
interface CreateLimitBody {
  company_id: string;
  entity_type: EntityType;
  entity_id?: string;
  period: PeriodType;
  limit_amount: number;
  warning_threshold?: number;
  name?: string;
  description?: string;
}

/**
 * POST /admin/b2b/spending/limits
 *
 * Creates a new spending limit.
 */
export async function POST(
  req: MedusaRequest<CreateLimitBody>,
  res: MedusaResponse
): Promise<void> {
  const spendingService: SpendingModuleService = req.scope.resolve(B2B_SPENDING_MODULE);

  const body = req.body;

  // Validate required fields
  if (!body.company_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "company_id is required"
    );
  }

  if (!body.entity_type) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "entity_type is required"
    );
  }

  if (!body.period) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "period is required"
    );
  }

  if (typeof body.limit_amount !== "number" || body.limit_amount <= 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "limit_amount must be a positive number"
    );
  }

  // Entity ID required for non-company entity types
  if (body.entity_type !== "company" && !body.entity_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `entity_id is required for entity_type "${body.entity_type}"`
    );
  }

  const input: CreateSpendingLimitInput = {
    companyId: body.company_id,
    entityType: body.entity_type,
    entityId: body.entity_id,
    period: body.period,
    limitAmount: body.limit_amount,
    warningThreshold: body.warning_threshold,
    name: body.name,
    description: body.description,
  };

  const limit = await spendingService.createLimit(input);

  res.status(201).json({
    limit,
  });
}
