/**
 * Admin B2B Company Members API Routes
 *
 * Provides admin endpoints for managing company memberships.
 *
 * GET /admin/b2b/companies/:id/members - List all members of a company
 * POST /admin/b2b/companies/:id/members - Add a customer to company
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type CompanyModuleService from "../../../../../../modules/b2b-company/service";
import type {
  MembershipRole,
  MembershipStatus,
  CreateMembershipInput,
} from "../../../../../../modules/b2b-company/service";

const B2B_COMPANY_MODULE = "b2bCompanyService";

/**
 * Request with company ID parameter
 */
interface CompanyIdRequest extends MedusaRequest {
  params: {
    id: string;
  };
}

/**
 * Query parameters for member listing
 */
interface ListMembersQuery {
  role?: MembershipRole;
  status?: MembershipStatus;
  limit?: number;
  offset?: number;
}

/**
 * GET /admin/b2b/companies/:id/members
 *
 * Lists all members of a company with optional filtering by role and status.
 *
 * @query role - Filter by membership role (owner, admin, manager, buyer, approver, viewer)
 * @query status - Filter by membership status (pending, active, suspended, inactive)
 * @query limit - Number of results (default: 50)
 * @query offset - Pagination offset (default: 0)
 */
export async function GET(
  req: CompanyIdRequest & { query: ListMembersQuery },
  res: MedusaResponse
): Promise<void> {
  const { id: companyId } = req.params;
  const companyService: CompanyModuleService = req.scope.resolve(B2B_COMPANY_MODULE);

  const { role, status, limit = 50, offset = 0 } = req.query;

  // Verify company exists
  try {
    await companyService.retrieveCompany(companyId);
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Company with id "${companyId}" not found`
    );
  }

  // Build filters for listing
  const filters: {
    role?: MembershipRole;
    status?: MembershipStatus;
  } = {};

  if (role) {
    filters.role = role;
  }

  if (status) {
    filters.status = status;
  }

  // Get members using the service method
  const members = await companyService.listCompanyMembers(companyId, filters);

  // Apply pagination manually since listCompanyMembers doesn't support it directly
  const paginatedMembers = members.slice(
    Number(offset),
    Number(offset) + Number(limit)
  );

  res.status(200).json({
    members: paginatedMembers,
    count: members.length,
    limit: Number(limit),
    offset: Number(offset),
  });
}

/**
 * Request body for adding a member to company
 */
interface AddMemberBody {
  customer_id: string;
  role?: MembershipRole;
  is_primary?: boolean;
  job_title?: string;
  employee_number?: string;
  spending_limit?: number;
  permissions?: Record<string, unknown>;
  status?: MembershipStatus;
  invited_by?: string;
  metadata?: Record<string, unknown>;
}

/**
 * POST /admin/b2b/companies/:id/members
 *
 * Adds a customer to a company with the specified membership settings.
 *
 * @body customer_id - Required. The customer ID to add
 * @body role - Optional. Member role (default: "buyer")
 * @body is_primary - Optional. Set as customer's primary company (default: false)
 * @body job_title - Optional. Job title within company
 * @body employee_number - Optional. Employee identification number
 * @body spending_limit - Optional. Individual spending limit in cents
 * @body permissions - Optional. Granular permission overrides
 * @body status - Optional. Initial status (default: "active")
 * @body invited_by - Optional. ID of user who invited this member
 * @body metadata - Optional. Custom metadata
 */
export async function POST(
  req: CompanyIdRequest & { body: AddMemberBody },
  res: MedusaResponse
): Promise<void> {
  const { id: companyId } = req.params;
  const body = req.body;
  const companyService: CompanyModuleService = req.scope.resolve(B2B_COMPANY_MODULE);

  // Validate required fields
  if (!body.customer_id?.trim()) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "customer_id is required"
    );
  }

  // Verify company exists
  try {
    await companyService.retrieveCompany(companyId);
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Company with id "${companyId}" not found`
    );
  }

  // Validate role if provided
  const validRoles: MembershipRole[] = ["owner", "admin", "manager", "buyer", "approver", "viewer"];
  if (body.role && !validRoles.includes(body.role)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Invalid role: ${body.role}. Must be one of: ${validRoles.join(", ")}`
    );
  }

  // Validate status if provided
  const validStatuses: MembershipStatus[] = ["pending", "active", "suspended", "inactive"];
  if (body.status && !validStatuses.includes(body.status)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Invalid status: ${body.status}. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  // Validate spending_limit if provided
  if (body.spending_limit !== undefined && body.spending_limit < 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "spending_limit must be a non-negative number"
    );
  }

  // Build membership input
  const membershipInput: CreateMembershipInput = {
    role: body.role,
    is_primary: body.is_primary,
    job_title: body.job_title,
    employee_number: body.employee_number,
    spending_limit: body.spending_limit,
    permissions: body.permissions,
    status: body.status ?? "active",
    invited_by: body.invited_by,
    metadata: body.metadata,
  };

  try {
    const membership = await companyService.addCustomerToCompany(
      companyId,
      body.customer_id,
      membershipInput
    );

    res.status(201).json({
      membership,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("already a member")) {
        throw new MedusaError(
          MedusaError.Types.DUPLICATE_ERROR,
          error.message
        );
      }
    }
    throw error;
  }
}
