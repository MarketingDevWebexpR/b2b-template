/**
 * Store B2B Approval Action API Route
 *
 * Provides endpoint for processing approval actions.
 *
 * POST /store/b2b/approvals/:id/action - Process an approval action
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";
import type ApprovalModuleService from "../../../../../../modules/b2b-approval/service";
import type { StepAction } from "../../../../../../modules/b2b-approval/service";
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
  params: {
    id: string;
  };
}

/**
 * Approval action request body
 */
interface ActionBody {
  /** Action to take */
  action: StepAction;
  /** Notes/comments */
  notes?: string;
  /** For delegate action: customer ID to delegate to */
  delegate_to_id?: string;
  /** For delegate action: reason for delegation */
  delegation_reason?: string;
}

/**
 * POST /store/b2b/approvals/:id/action
 *
 * Processes an approval action (approve, reject, escalate, delegate).
 *
 * @requires Authentication
 *
 * @example Approve
 * ```json
 * { "action": "approve", "notes": "Approved for project budget" }
 * ```
 *
 * @example Reject
 * ```json
 * { "action": "reject", "notes": "Over budget limit" }
 * ```
 *
 * @example Delegate
 * ```json
 * {
 *   "action": "delegate",
 *   "delegate_to_id": "cust_123",
 *   "delegation_reason": "On vacation"
 * }
 * ```
 */
export async function POST(
  req: AuthenticatedRequest & { body: ActionBody },
  res: MedusaResponse
): Promise<void> {
  const customerId = req.auth_context?.actor_id;
  const { id: requestId } = req.params;

  if (!customerId) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Customer authentication required"
    );
  }

  const body = req.body;

  // Validate action
  const validActions: StepAction[] = ["approve", "reject", "escalate", "delegate", "request_info"];
  if (!body.action || !validActions.includes(body.action)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Action must be one of: ${validActions.join(", ")}`
    );
  }

  // Validate delegate action
  if (body.action === "delegate" && !body.delegate_to_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "delegate_to_id is required for delegate action"
    );
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const approvalService: ApprovalModuleService = req.scope.resolve(B2B_APPROVAL_MODULE);

  // ========================================
  // SECURITY: IDOR Prevention
  // Verify that the approval request belongs to the same company
  // as the authenticated customer before processing any action.
  // ========================================

  // 1. Get the authenticated customer's company
  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "company.id"],
    filters: { id: customerId },
  });

  const customer = customers[0];
  if (!customer?.company?.id) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Customer is not associated with a company"
    );
  }

  const customerCompanyId = customer.company.id;

  // 2. Retrieve the approval request and verify company ownership
  let approvalRequest;
  try {
    approvalRequest = await approvalService.retrieveApprovalRequest(requestId);
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Approval request with id "${requestId}" not found`
    );
  }

  // 3. CRITICAL: Verify the request belongs to the customer's company
  if (approvalRequest.company_id !== customerCompanyId) {
    // Log potential IDOR attack attempt (in production, send to security monitoring)
    console.warn(
      `[SECURITY] IDOR attempt detected: Customer ${customerId} from company ${customerCompanyId} ` +
      `attempted to access approval request ${requestId} belonging to company ${approvalRequest.company_id}`
    );
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Approval request with id "${requestId}" not found`
    );
  }

  // 4. SECURITY: For delegate action, verify delegate_to_id belongs to the same company
  if (body.action === "delegate" && body.delegate_to_id) {
    const { data: delegateCustomers } = await query.graph({
      entity: "customer",
      fields: ["id", "company.id"],
      filters: { id: body.delegate_to_id },
    });

    const delegateCustomer = delegateCustomers[0];
    if (!delegateCustomer?.company?.id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Delegate customer is not associated with a company"
      );
    }

    if (delegateCustomer.company.id !== customerCompanyId) {
      // Log potential cross-company delegation attempt
      console.warn(
        `[SECURITY] Cross-company delegation attempt: Customer ${customerId} from company ${customerCompanyId} ` +
        `attempted to delegate to customer ${body.delegate_to_id} from company ${delegateCustomer.company.id}`
      );
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Cannot delegate to a customer from a different company"
      );
    }
  }

  try {
    const updatedRequest = await approvalService.processAction({
      requestId,
      actorId: customerId,
      action: body.action,
      notes: body.notes,
      delegateToId: body.delegate_to_id,
      delegationReason: body.delegation_reason,
    });

    res.status(200).json({
      request: updatedRequest,
      message: `Request ${body.action}${body.action === "approve" || body.action === "reject" ? "d" : "ed"} successfully`,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        error.message
      );
    }
    throw error;
  }
}
