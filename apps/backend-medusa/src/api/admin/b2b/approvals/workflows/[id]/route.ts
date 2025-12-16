/**
 * Admin B2B Approval Workflow Detail API Routes
 *
 * Provides admin endpoints for individual workflow management.
 *
 * GET /admin/b2b/approvals/workflows/:id - Get workflow details
 * PUT /admin/b2b/approvals/workflows/:id - Update workflow
 * DELETE /admin/b2b/approvals/workflows/:id - Deactivate workflow
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type ApprovalModuleService from "../../../../../../modules/b2b-approval/service";
import type { WorkflowLevel } from "../../../../../../modules/b2b-approval/service";
const B2B_QUOTE_MODULE = "b2bQuoteService";
const B2B_APPROVAL_MODULE = "b2bApprovalWorkflowService";
const B2B_SPENDING_MODULE = "b2bSpendingLimitService";
const B2B_COMPANY_MODULE = "b2bCompanyService";

/**
 * Request with workflow ID parameter
 */
interface WorkflowIdRequest extends MedusaRequest {
  params: {
    id: string;
  };
}

/**
 * GET /admin/b2b/approvals/workflows/:id
 *
 * Returns detailed information about a specific workflow.
 */
export async function GET(
  req: WorkflowIdRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params;
  const approvalService: ApprovalModuleService = req.scope.resolve(B2B_APPROVAL_MODULE);

  try {
    const workflow = await approvalService.retrieveApprovalWorkflow(id);

    // Get count of requests using this workflow
    const requests = await approvalService.listApprovalRequests(
      { workflow_id: id },
      { select: ["id"] }
    );

    res.status(200).json({
      workflow: {
        ...workflow,
        request_count: requests.length,
      },
    });
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Workflow with id "${id}" not found`
    );
  }
}

/**
 * Update workflow request body
 */
interface UpdateWorkflowBody {
  name?: string;
  description?: string;
  trigger_threshold?: number;
  trigger_category_ids?: string[];
  levels?: WorkflowLevel[];
  escalation_hours?: number;
  expiration_hours?: number;
  priority?: number;
  is_active?: boolean;
  notify_on_creation?: boolean;
  notify_on_reminder?: boolean;
  allow_delegation?: boolean;
}

/**
 * PUT /admin/b2b/approvals/workflows/:id
 *
 * Updates a workflow's configuration.
 */
export async function PUT(
  req: WorkflowIdRequest & { body: UpdateWorkflowBody },
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params;
  const body = req.body;
  const approvalService: ApprovalModuleService = req.scope.resolve(B2B_APPROVAL_MODULE);

  // Verify workflow exists
  try {
    await approvalService.retrieveApprovalWorkflow(id);
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Workflow with id "${id}" not found`
    );
  }

  const updateData: Record<string, unknown> = {};

  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.trigger_threshold !== undefined) updateData.trigger_threshold = body.trigger_threshold;
  if (body.trigger_category_ids !== undefined) updateData.trigger_category_ids = body.trigger_category_ids;
  if (body.levels !== undefined) updateData.levels = body.levels;
  if (body.escalation_hours !== undefined) updateData.escalation_hours = body.escalation_hours;
  if (body.expiration_hours !== undefined) updateData.expiration_hours = body.expiration_hours;
  if (body.priority !== undefined) updateData.priority = body.priority;
  if (body.is_active !== undefined) updateData.is_active = body.is_active;
  if (body.notify_on_creation !== undefined) updateData.notify_on_creation = body.notify_on_creation;
  if (body.notify_on_reminder !== undefined) updateData.notify_on_reminder = body.notify_on_reminder;
  if (body.allow_delegation !== undefined) updateData.allow_delegation = body.allow_delegation;

  await approvalService.updateApprovalWorkflows(
    { id },
    updateData as Parameters<typeof approvalService.updateApprovalWorkflows>[1]
  );
  const updatedWorkflow = await approvalService.retrieveApprovalWorkflow(id);

  res.status(200).json({
    workflow: updatedWorkflow,
  });
}

/**
 * DELETE /admin/b2b/approvals/workflows/:id
 *
 * Deactivates a workflow (soft delete).
 */
export async function DELETE(
  req: WorkflowIdRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params;
  const approvalService: ApprovalModuleService = req.scope.resolve(B2B_APPROVAL_MODULE);

  try {
    await approvalService.updateApprovalWorkflows(
      { id },
      { is_active: false }
    );

    res.status(200).json({
      id,
      object: "approval_workflow",
      deleted: true,
    });
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Workflow with id "${id}" not found`
    );
  }
}
