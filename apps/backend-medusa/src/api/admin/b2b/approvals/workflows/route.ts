/**
 * Admin B2B Approval Workflows API Routes
 *
 * Provides admin endpoints for approval workflow management.
 *
 * GET /admin/b2b/approvals/workflows - List workflows
 * POST /admin/b2b/approvals/workflows - Create a workflow
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type ApprovalModuleService from "../../../../../modules/b2b-approval/service";
import type {
  CreateWorkflowInput,
  WorkflowEntityType,
  WorkflowTrigger,
  WorkflowLevel,
} from "../../../../../modules/b2b-approval/service";

const B2B_APPROVAL_MODULE = "b2bApprovalWorkflowService";

/**
 * Query parameters for workflow listing
 */
interface ListWorkflowsQuery {
  company_id?: string;
  entity_type?: WorkflowEntityType;
  is_active?: string;
  limit?: number;
  offset?: number;
}

/**
 * GET /admin/b2b/approvals/workflows
 *
 * Lists approval workflows with optional filtering.
 */
export async function GET(
  req: MedusaRequest<object, ListWorkflowsQuery>,
  res: MedusaResponse
): Promise<void> {
  const approvalService: ApprovalModuleService = req.scope.resolve(B2B_APPROVAL_MODULE);

  const { company_id, entity_type, is_active, limit = 50, offset = 0 } = req.query;

  const filters: Record<string, unknown> = {};

  if (company_id) {
    filters.company_id = company_id;
  }

  if (entity_type) {
    filters.entity_type = entity_type;
  }

  if (is_active !== undefined) {
    filters.is_active = is_active === "true";
  }

  const [workflows, count] = await Promise.all([
    approvalService.listApprovalWorkflows(filters, {
      skip: Number(offset),
      take: Number(limit),
    }),
    approvalService.listApprovalWorkflows(filters, {
      select: ["id"],
    }).then((list) => list.length),
  ]);

  // Sort by priority
  const sortedWorkflows = workflows.sort(
    (a, b) => Number(b.priority) - Number(a.priority)
  );

  res.status(200).json({
    workflows: sortedWorkflows,
    count,
    limit: Number(limit),
    offset: Number(offset),
  });
}

/**
 * Create workflow request body
 */
interface CreateWorkflowBody {
  company_id: string;
  name: string;
  entity_type: WorkflowEntityType;
  trigger: WorkflowTrigger;
  trigger_threshold?: number;
  trigger_category_ids?: string[];
  levels: WorkflowLevel[];
  escalation_hours?: number;
  expiration_hours?: number;
  priority?: number;
  description?: string;
}

/**
 * POST /admin/b2b/approvals/workflows
 *
 * Creates a new approval workflow.
 */
export async function POST(
  req: MedusaRequest<CreateWorkflowBody>,
  res: MedusaResponse
): Promise<void> {
  const approvalService: ApprovalModuleService = req.scope.resolve(B2B_APPROVAL_MODULE);

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

  if (!body.entity_type) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "entity_type is required"
    );
  }

  if (!body.trigger) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "trigger is required"
    );
  }

  if (!body.levels || body.levels.length === 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "At least one approval level is required"
    );
  }

  // Validate trigger threshold for amount-based triggers
  if (body.trigger === "amount_exceeds" && !body.trigger_threshold) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "trigger_threshold is required for amount_exceeds trigger"
    );
  }

  // Validate levels
  for (const level of body.levels) {
    if (!level.level || level.level < 1) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Each level must have a positive level number"
      );
    }

    if (!level.approverType) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Each level must have an approverType"
      );
    }
  }

  const input: CreateWorkflowInput = {
    companyId: body.company_id,
    name: body.name,
    entityType: body.entity_type,
    trigger: body.trigger,
    triggerThreshold: body.trigger_threshold,
    triggerCategoryIds: body.trigger_category_ids,
    levels: body.levels,
    escalationHours: body.escalation_hours,
    expirationHours: body.expiration_hours,
    priority: body.priority,
    description: body.description,
  };

  const workflow = await approvalService.createWorkflow(input);

  res.status(201).json({
    workflow,
  });
}
