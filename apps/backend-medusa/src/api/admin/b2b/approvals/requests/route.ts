/**
 * Admin B2B Approval Requests API Routes
 *
 * Provides admin endpoints for approval request management.
 *
 * GET /admin/b2b/approvals/requests - List all requests
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type ApprovalModuleService from "../../../../../modules/b2b-approval/service";
import type { RequestStatus } from "../../../../../modules/b2b-approval/service";
const B2B_QUOTE_MODULE = "b2bQuoteService";
const B2B_APPROVAL_MODULE = "b2bApprovalWorkflowService";
const B2B_SPENDING_MODULE = "b2bSpendingLimitService";
const B2B_COMPANY_MODULE = "b2bCompanyService";

/**
 * Query parameters for request listing
 */
interface ListRequestsQuery {
  company_id?: string;
  status?: RequestStatus;
  entity_type?: string;
  requester_id?: string;
  workflow_id?: string;
  limit?: number;
  offset?: number;
}

/**
 * GET /admin/b2b/approvals/requests
 *
 * Lists approval requests with optional filtering.
 */
export async function GET(
  req: MedusaRequest<object, ListRequestsQuery>,
  res: MedusaResponse
): Promise<void> {
  const approvalService: ApprovalModuleService = req.scope.resolve(B2B_APPROVAL_MODULE);

  const {
    company_id,
    status,
    entity_type,
    requester_id,
    workflow_id,
    limit = 50,
    offset = 0,
  } = req.query;

  const filters: Record<string, unknown> = {};

  if (company_id) {
    filters.company_id = company_id;
  }

  if (status) {
    filters.status = status;
  }

  if (entity_type) {
    filters.entity_type = entity_type;
  }

  if (requester_id) {
    filters.requester_id = requester_id;
  }

  if (workflow_id) {
    filters.workflow_id = workflow_id;
  }

  const [requests, count] = await Promise.all([
    approvalService.listApprovalRequests(filters, {
      skip: Number(offset),
      take: Number(limit),
    }),
    approvalService.listApprovalRequests(filters, {
      select: ["id"],
    }).then((list) => list.length),
  ]);

  res.status(200).json({
    requests,
    count,
    limit: Number(limit),
    offset: Number(offset),
  });
}
