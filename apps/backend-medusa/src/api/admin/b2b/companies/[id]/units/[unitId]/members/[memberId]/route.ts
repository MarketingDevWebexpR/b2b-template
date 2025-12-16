/**
 * Admin B2B Unit Member Detail API Routes
 *
 * Provides admin endpoints for individual unit membership management.
 *
 * PUT /admin/b2b/companies/:id/units/:unitId/members/:memberId - Update unit membership
 * DELETE /admin/b2b/companies/:id/units/:unitId/members/:memberId - Remove from unit
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type CompanyModuleService from "../../../../../../../../../modules/b2b-company/service";
import type {
  UnitMembershipRole,
  UpdateUnitMembershipInput,
} from "../../../../../../../../../modules/b2b-company/service";

const B2B_COMPANY_MODULE = "b2bCompanyService";

/**
 * Request with company, unit, and member ID parameters
 */
interface UnitMemberIdRequest extends MedusaRequest {
  params: {
    id: string;
    unitId: string;
    memberId: string;
  };
}

/**
 * Request body for updating a unit membership
 */
interface UpdateUnitMemberBody {
  role?: UnitMembershipRole;
  is_default?: boolean;
  can_approve?: boolean;
  spending_limit?: number | null;
  permissions?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * PUT /admin/b2b/companies/:id/units/:unitId/members/:memberId
 *
 * Updates a unit membership's role, permissions, and spending limit.
 *
 * @body role - Unit role (head, manager, lead, member, viewer)
 * @body is_default - Set as customer's default unit in this company
 * @body can_approve - Grant/revoke approval capability for this unit
 * @body spending_limit - Unit-specific spending limit in cents (null to remove)
 * @body permissions - Unit-specific permissions
 * @body metadata - Custom metadata
 */
export async function PUT(
  req: UnitMemberIdRequest & { body: UpdateUnitMemberBody },
  res: MedusaResponse
): Promise<void> {
  const { id: companyId, unitId, memberId } = req.params;
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

  // Verify unit exists and belongs to company
  let unit;
  try {
    unit = await companyService.retrieveCompanyUnit(unitId);
    if (unit.company_id !== companyId) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Unit with id "${unitId}" not found in company "${companyId}"`
      );
    }
  } catch (error) {
    if (error instanceof MedusaError) {
      throw error;
    }
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Unit with id "${unitId}" not found`
    );
  }

  // Verify membership exists and belongs to this unit
  let existingMembership;
  try {
    existingMembership = await companyService.retrieveUnitMembership(memberId);
    if (existingMembership.unit_id !== unitId) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Membership with id "${memberId}" not found in unit "${unitId}"`
      );
    }
  } catch (error) {
    if (error instanceof MedusaError) {
      throw error;
    }
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Unit membership with id "${memberId}" not found`
    );
  }

  // Validate role if provided
  const validRoles: UnitMembershipRole[] = ["head", "manager", "lead", "member", "viewer"];
  if (body.role !== undefined && !validRoles.includes(body.role)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Invalid role: ${body.role}. Must be one of: ${validRoles.join(", ")}`
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
  const updateInput: UpdateUnitMembershipInput = {};

  if (body.role !== undefined) updateInput.role = body.role;
  if (body.is_default !== undefined) updateInput.is_default = body.is_default;
  if (body.can_approve !== undefined) updateInput.can_approve = body.can_approve;
  if (body.spending_limit !== undefined) updateInput.spending_limit = body.spending_limit;
  if (body.permissions !== undefined) updateInput.permissions = body.permissions;
  if (body.metadata !== undefined) updateInput.metadata = body.metadata;

  // Update membership
  await companyService.updateUnitMembership(memberId, updateInput);

  // Retrieve the updated membership to return full data
  const membership = await companyService.retrieveUnitMembership(memberId);

  res.status(200).json({
    membership,
  });
}

/**
 * DELETE /admin/b2b/companies/:id/units/:unitId/members/:memberId
 *
 * Removes a member from an organizational unit.
 * The customer's company membership remains intact.
 */
export async function DELETE(
  req: UnitMemberIdRequest,
  res: MedusaResponse
): Promise<void> {
  const { id: companyId, unitId, memberId } = req.params;
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

  // Verify unit exists and belongs to company
  let unit;
  try {
    unit = await companyService.retrieveCompanyUnit(unitId);
    if (unit.company_id !== companyId) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Unit with id "${unitId}" not found in company "${companyId}"`
      );
    }
  } catch (error) {
    if (error instanceof MedusaError) {
      throw error;
    }
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Unit with id "${unitId}" not found`
    );
  }

  // Verify membership exists and belongs to this unit
  let existingMembership;
  try {
    existingMembership = await companyService.retrieveUnitMembership(memberId);
    if (existingMembership.unit_id !== unitId) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Membership with id "${memberId}" not found in unit "${unitId}"`
      );
    }
  } catch (error) {
    if (error instanceof MedusaError) {
      throw error;
    }
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Unit membership with id "${memberId}" not found`
    );
  }

  // Check if this is the unit manager referenced in the unit itself
  if (unit.manager_id === existingMembership.customer_id) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Cannot remove the unit manager. Update the unit's manager_id first."
    );
  }

  // Remove customer from unit
  await companyService.removeCustomerFromUnit(memberId);

  res.status(200).json({
    id: memberId,
    object: "unit_membership",
    deleted: true,
  });
}
