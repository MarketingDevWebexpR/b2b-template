/**
 * Admin B2B Approval Request Detail API Routes
 *
 * Provides admin endpoints for individual request management.
 *
 * GET /admin/b2b/approvals/requests/:id - Get request details
 * PUT /admin/b2b/approvals/requests/:id - Update request (admin override)
 * DELETE /admin/b2b/approvals/requests/:id - Cancel request
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type ApprovalModuleService from "../../../../../../modules/b2b-approval/service";
import type { RequestStatus } from "../../../../../../modules/b2b-approval/service";
const B2B_QUOTE_MODULE = "b2bQuoteService";
const B2B_APPROVAL_MODULE = "b2bApprovalWorkflowService";
const B2B_SPENDING_MODULE = "b2bSpendingLimitService";
const B2B_COMPANY_MODULE = "b2bCompanyService";

/**
 * Request with ID parameter
 */
interface RequestIdRequest extends MedusaRequest {
  params: {
    id: string;
  };
}

/**
 * GET /admin/b2b/approvals/requests/:id
 *
 * Returns detailed information about a specific request including steps.
 */
export async function GET(
  req: RequestIdRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params;
  const approvalService: ApprovalModuleService = req.scope.resolve(B2B_APPROVAL_MODULE);

  try {
    const request = await approvalService.retrieveApprovalRequest(id, {
      relations: ["steps"],
    });

    // Get workflow info
    const workflow = await approvalService.retrieveApprovalWorkflow(request.workflow_id);

    res.status(200).json({
      request: {
        ...request,
        workflow,
      },
    });
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Approval request with id "${id}" not found`
    );
  }
}

/**
 * Admin update request body
 */
interface AdminUpdateRequestBody {
  /** Admin override status */
  status?: RequestStatus;
  /** Admin notes */
  admin_notes?: string;
  /** Reassign to different workflow */
  workflow_id?: string;
  /** Extend due date */
  due_at?: string;
}

/**
 * PUT /admin/b2b/approvals/requests/:id
 *
 * Admin override for request management.
 * Allows admins to force status changes or reassign workflows.
 */
export async function PUT(
  req: RequestIdRequest & { body: AdminUpdateRequestBody },
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params;
  const body = req.body;
  const approvalService: ApprovalModuleService = req.scope.resolve(B2B_APPROVAL_MODULE);

  // Verify request exists
  let existingRequest;
  try {
    existingRequest = await approvalService.retrieveApprovalRequest(id);
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Approval request with id "${id}" not found`
    );
  }

  // Don't allow changes to completed requests
  const completedStatuses: RequestStatus[] = ["approved", "rejected", "cancelled"];
  if (completedStatuses.includes(existingRequest.status as RequestStatus)) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Cannot modify request with status "${existingRequest.status}"`
    );
  }

  const updateData: Record<string, unknown> = {};

  if (body.status !== undefined) {
    // Validate status transition
    const validStatuses: RequestStatus[] = [
      "pending",
      "in_review",
      "approved",
      "rejected",
      "escalated",
      "expired",
      "cancelled",
    ];
    if (!validStatuses.includes(body.status)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Invalid status: ${body.status}`
      );
    }
    updateData.status = body.status;

    // Set completed_at for terminal statuses
    if (["approved", "rejected", "cancelled"].includes(body.status)) {
      updateData.completed_at = new Date();
    }
  }

  if (body.admin_notes !== undefined) {
    updateData.metadata = {
      ...((existingRequest.metadata as Record<string, unknown>) || {}),
      admin_notes: body.admin_notes,
      admin_override: true,
      admin_override_at: new Date().toISOString(),
    };
  }

  if (body.workflow_id !== undefined) {
    // Verify new workflow exists
    try {
      await approvalService.retrieveApprovalWorkflow(body.workflow_id);
      updateData.workflow_id = body.workflow_id;
    } catch {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Workflow with id "${body.workflow_id}" not found`
      );
    }
  }

  if (body.due_at !== undefined) {
    updateData.due_at = new Date(body.due_at);
  }

  // Use the existing request id for update
  await approvalService.updateApprovalRequests(
    { id },
    updateData as Parameters<typeof approvalService.updateApprovalRequests>[1]
  );

  // Fetch the updated request
  const updatedRequest = await approvalService.retrieveApprovalRequest(id);

  res.status(200).json({
    request: updatedRequest,
  });
}

/**
 * DELETE /admin/b2b/approvals/requests/:id
 *
 * Cancels an approval request.
 */
export async function DELETE(
  req: RequestIdRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params;
  const approvalService: ApprovalModuleService = req.scope.resolve(B2B_APPROVAL_MODULE);

  try {
    const request = await approvalService.retrieveApprovalRequest(id);

    // Only allow cancellation of non-completed requests
    const completedStatuses: RequestStatus[] = ["approved", "rejected", "cancelled"];
    if (completedStatuses.includes(request.status as RequestStatus)) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Cannot cancel request with status "${request.status}"`
      );
    }

    await approvalService.updateApprovalRequests(
      { id },
      {
        status: "cancelled",
        completed_at: new Date(),
      }
    );

    res.status(200).json({
      id,
      object: "approval_request",
      cancelled: true,
    });
  } catch (error) {
    if (error instanceof MedusaError) {
      throw error;
    }
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Approval request with id "${id}" not found`
    );
  }
}
