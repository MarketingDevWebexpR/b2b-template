/**
 * Admin B2B Company Member Detail API Routes
 *
 * Provides admin endpoints for individual company membership management.
 *
 * GET /admin/b2b/companies/:id/members/:memberId - Get membership details
 * PUT /admin/b2b/companies/:id/members/:memberId - Update membership
 * DELETE /admin/b2b/companies/:id/members/:memberId - Remove member from company
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type CompanyModuleService from "../../../../../../../modules/b2b-company/service";
import type {
  MembershipRole,
  MembershipStatus,
  UpdateMembershipInput,
} from "../../../../../../../modules/b2b-company/service";

const B2B_COMPANY_MODULE = "b2bCompanyService";

/**
 * Request with company and member ID parameters
 */
interface MemberIdRequest extends MedusaRequest {
  params: {
    id: string;
    memberId: string;
  };
}

/**
 * GET /admin/b2b/companies/:id/members/:memberId
 *
 * Returns detailed information about a specific company membership.
 */
export async function GET(
  req: MemberIdRequest,
  res: MedusaResponse
): Promise<void> {
  const { id: companyId, memberId } = req.params;
  const companyService: CompanyModuleService = req.scope.resolve(B2B_COMPANY_MODULE);

  // Verify company exists
  try {
    await companyService.retrieveCompany(companyId);
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Company with id "${companyId}" not found`
    );
  }

  // Retrieve membership
  try {
    const membership = await companyService.retrieveCompanyMembership(memberId);

    // Verify membership belongs to this company
    if (membership.company_id !== companyId) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Membership with id "${memberId}" not found in company "${companyId}"`
      );
    }

    res.status(200).json({
      membership,
    });
  } catch (error) {
    if (error instanceof MedusaError) {
      throw error;
    }
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Membership with id "${memberId}" not found`
    );
  }
}

/**
 * Request body for updating a membership
 */
interface UpdateMemberBody {
  role?: MembershipRole;
  is_primary?: boolean;
  job_title?: string;
  employee_number?: string;
  spending_limit?: number | null;
  permissions?: Record<string, unknown>;
  status?: MembershipStatus;
  metadata?: Record<string, unknown>;
}

/**
 * PUT /admin/b2b/companies/:id/members/:memberId
 *
 * Updates a company membership's role, status, spending limit, and other settings.
 *
 * @body role - Member role (owner, admin, manager, buyer, approver, viewer)
 * @body is_primary - Set as customer's primary company
 * @body job_title - Job title within company
 * @body employee_number - Employee identification number
 * @body spending_limit - Individual spending limit in cents (null to remove)
 * @body permissions - Granular permission overrides
 * @body status - Membership status
 * @body metadata - Custom metadata
 */
export async function PUT(
  req: MemberIdRequest & { body: UpdateMemberBody },
  res: MedusaResponse
): Promise<void> {
  const { id: companyId, memberId } = req.params;
  const body = req.body;
  const companyService: CompanyModuleService = req.scope.resolve(B2B_COMPANY_MODULE);

  // Verify company exists
  try {
    await companyService.retrieveCompany(companyId);
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Company with id "${companyId}" not found`
    );
  }

  // Verify membership exists and belongs to this company
  let existingMembership;
  try {
    existingMembership = await companyService.retrieveCompanyMembership(memberId);
    if (existingMembership.company_id !== companyId) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Membership with id "${memberId}" not found in company "${companyId}"`
      );
    }
  } catch (error) {
    if (error instanceof MedusaError) {
      throw error;
    }
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Membership with id "${memberId}" not found`
    );
  }

  // Validate role if provided
  const validRoles: MembershipRole[] = ["owner", "admin", "manager", "buyer", "approver", "viewer"];
  if (body.role !== undefined && !validRoles.includes(body.role)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Invalid role: ${body.role}. Must be one of: ${validRoles.join(", ")}`
    );
  }

  // Validate status if provided
  const validStatuses: MembershipStatus[] = ["pending", "active", "suspended", "inactive"];
  if (body.status !== undefined && !validStatuses.includes(body.status)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Invalid status: ${body.status}. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  // Validate spending_limit if provided (allow null to clear)
  if (body.spending_limit !== undefined && body.spending_limit !== null && body.spending_limit < 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "spending_limit must be a non-negative number or null"
    );
  }

  // Build update input
  const updateInput: UpdateMembershipInput = {};

  if (body.role !== undefined) updateInput.role = body.role;
  if (body.is_primary !== undefined) updateInput.is_primary = body.is_primary;
  if (body.job_title !== undefined) updateInput.job_title = body.job_title;
  if (body.employee_number !== undefined) updateInput.employee_number = body.employee_number;
  if (body.spending_limit !== undefined) updateInput.spending_limit = body.spending_limit;
  if (body.permissions !== undefined) updateInput.permissions = body.permissions;
  if (body.status !== undefined) updateInput.status = body.status;
  if (body.metadata !== undefined) updateInput.metadata = body.metadata;

  // Update membership
  const updatedMembership = await companyService.updateMembership(memberId, updateInput);

  // Retrieve the updated membership to return full data
  const membership = await companyService.retrieveCompanyMembership(memberId);

  res.status(200).json({
    membership,
  });
}

/**
 * DELETE /admin/b2b/companies/:id/members/:memberId
 *
 * Removes a member from the company. This also removes any unit memberships
 * the customer has within this company.
 */
export async function DELETE(
  req: MemberIdRequest,
  res: MedusaResponse
): Promise<void> {
  const { id: companyId, memberId } = req.params;
  const companyService: CompanyModuleService = req.scope.resolve(B2B_COMPANY_MODULE);

  // Verify company exists
  try {
    await companyService.retrieveCompany(companyId);
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Company with id "${companyId}" not found`
    );
  }

  // Verify membership exists and belongs to this company
  let existingMembership;
  try {
    existingMembership = await companyService.retrieveCompanyMembership(memberId);
    if (existingMembership.company_id !== companyId) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Membership with id "${memberId}" not found in company "${companyId}"`
      );
    }
  } catch (error) {
    if (error instanceof MedusaError) {
      throw error;
    }
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Membership with id "${memberId}" not found`
    );
  }

  // Check if this is the last owner
  if (existingMembership.role === "owner") {
    const allMembers = await companyService.listCompanyMembers(companyId, { role: "owner" });
    const activeOwners = allMembers.filter(
      (m) => m.status === "active" && m.id !== memberId
    );

    if (activeOwners.length === 0) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Cannot remove the last owner from a company. Transfer ownership first."
      );
    }
  }

  // Remove customer from company (this also removes unit memberships)
  await companyService.removeCustomerFromCompany(memberId);

  res.status(200).json({
    id: memberId,
    object: "company_membership",
    deleted: true,
  });
}
