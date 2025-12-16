/**
 * Store B2B Approvals API Route
 *
 * Provides endpoints for authenticated customers to view their pending approvals.
 *
 * GET /store/b2b/approvals - Get pending approvals for the current user
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";
import type ApprovalModuleService from "../../../../modules/b2b-approval/service";
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
 * Query parameters for approval listing
 */
interface ListApprovalsQuery {
  type?: "pending" | "submitted" | "all";
}

/**
 * GET /store/b2b/approvals
 *
 * Returns approval requests relevant to the authenticated customer.
 * - "pending": Requests waiting for this user's approval
 * - "submitted": Requests submitted by this user
 * - "all": Both pending and submitted
 *
 * @requires Authentication
 */
export async function GET(
  req: AuthenticatedRequest & { query: ListApprovalsQuery },
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
    res.status(200).json({
      pending: [],
      submitted: [],
    });
    return;
  }

  const companyId = customer.company.id;
  const approvalService: ApprovalModuleService = req.scope.resolve(B2B_APPROVAL_MODULE);
  const type = req.query.type ?? "all";

  const result: {
    pending?: unknown[];
    submitted?: unknown[];
  } = {};

  // Get pending approvals (requests waiting for this user)
  if (type === "pending" || type === "all") {
    const pending = await approvalService.getPendingForApprover(companyId, customerId);
    result.pending = pending;
  }

  // Get submitted requests (requests created by this user)
  if (type === "submitted" || type === "all") {
    const submitted = await approvalService.listApprovalRequests({
      company_id: companyId,
      requester_id: customerId,
    });
    result.submitted = submitted;
  }

  res.status(200).json(result);
}
