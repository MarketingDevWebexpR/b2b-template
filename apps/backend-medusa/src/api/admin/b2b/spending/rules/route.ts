/**
 * Admin B2B Spending Rules API Routes
 *
 * Provides admin endpoints for spending rule management.
 *
 * GET /admin/b2b/spending/rules - List spending rules
 * POST /admin/b2b/spending/rules - Create a spending rule
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type SpendingModuleService from "../../../../../modules/b2b-spending/service";
import type {
  CreateSpendingRuleInput,
  RuleAction,
  RuleCondition,
  EntityType,
} from "../../../../../modules/b2b-spending/service";

const B2B_SPENDING_MODULE = "b2bSpendingLimitService";

/**
 * Query parameters for rule listing
 */
interface ListRulesQuery {
  company_id?: string;
  condition?: RuleCondition;
  action?: RuleAction;
  is_active?: string;
  limit?: number;
  offset?: number;
}

/**
 * GET /admin/b2b/spending/rules
 *
 * Lists spending rules with optional filtering.
 */
export async function GET(
  req: MedusaRequest<object, ListRulesQuery>,
  res: MedusaResponse
): Promise<void> {
  const spendingService: SpendingModuleService = req.scope.resolve(B2B_SPENDING_MODULE);

  const { company_id, condition, action, is_active, limit = 50, offset = 0 } = req.query;

  const filters: Record<string, unknown> = {};

  if (company_id) {
    filters.company_id = company_id;
  }

  if (condition) {
    filters.condition = condition;
  }

  if (action) {
    filters.action = action;
  }

  if (is_active !== undefined) {
    filters.is_active = is_active === "true";
  }

  const [rules, count] = await Promise.all([
    spendingService.listSpendingRules(filters, {
      skip: Number(offset),
      take: Number(limit),
    }),
    spendingService.listSpendingRules(filters, {
      select: ["id"],
    }).then((list) => list.length),
  ]);

  // Sort by priority (descending)
  const sortedRules = rules.sort((a, b) => Number(b.priority) - Number(a.priority));

  res.status(200).json({
    rules: sortedRules,
    count,
    limit: Number(limit),
    offset: Number(offset),
  });
}

/**
 * Create spending rule request body
 */
interface CreateRuleBody {
  company_id: string;
  name: string;
  condition: RuleCondition;
  action: RuleAction;
  threshold_amount?: number;
  threshold_percentage?: number;
  applies_to_entity_types?: EntityType[];
  applies_to_entity_ids?: string[];
  restricted_category_ids?: string[];
  restricted_vendor_ids?: string[];
  notify_emails?: string[];
  notify_customer_ids?: string[];
  priority?: number;
  approval_workflow_id?: string;
  description?: string;
}

/**
 * POST /admin/b2b/spending/rules
 *
 * Creates a new spending rule.
 */
export async function POST(
  req: MedusaRequest<CreateRuleBody>,
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

  if (!body.name?.trim()) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "name is required"
    );
  }

  if (!body.condition) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "condition is required"
    );
  }

  if (!body.action) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "action is required"
    );
  }

  // Amount-based conditions require threshold
  if (body.condition === "amount_exceeds" && !body.threshold_amount) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "threshold_amount is required for amount_exceeds condition"
    );
  }

  const input: CreateSpendingRuleInput = {
    companyId: body.company_id,
    name: body.name,
    condition: body.condition,
    action: body.action,
    thresholdAmount: body.threshold_amount,
    thresholdPercentage: body.threshold_percentage,
    appliesToEntityTypes: body.applies_to_entity_types,
    appliesToEntityIds: body.applies_to_entity_ids,
    restrictedCategoryIds: body.restricted_category_ids,
    restrictedVendorIds: body.restricted_vendor_ids,
    notifyEmails: body.notify_emails,
    notifyCustomerIds: body.notify_customer_ids,
    priority: body.priority,
    approvalWorkflowId: body.approval_workflow_id,
    description: body.description,
  };

  const rule = await spendingService.createRule(input);

  res.status(201).json({
    rule,
  });
}
