/**
 * Admin B2B Unit Members API Routes
 *
 * Provides admin endpoints for managing unit memberships.
 *
 * GET /admin/b2b/companies/:id/units/:unitId/members - List all members of a unit
 * POST /admin/b2b/companies/:id/units/:unitId/members - Add a member to unit
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type CompanyModuleService from "../../../../../../../../modules/b2b-company/service";
import type {
  UnitMembershipRole,
  CreateUnitMembershipInput,
} from "../../../../../../../../modules/b2b-company/service";

const B2B_COMPANY_MODULE = "b2bCompanyService";

/**
 * Request with company and unit ID parameters
 */
interface UnitIdRequest extends MedusaRequest {
  params: {
    id: string;
    unitId: string;
  };
}

/**
 * Query parameters for unit member listing
 */
interface ListUnitMembersQuery {
  role?: UnitMembershipRole;
  limit?: number;
  offset?: number;
}

/**
 * GET /admin/b2b/companies/:id/units/:unitId/members
 *
 * Lists all members of an organizational unit.
 *
 * @query role - Filter by unit membership role (head, manager, lead, member, viewer)
 * @query limit - Number of results (default: 50)
 * @query offset - Pagination offset (default: 0)
 */
export async function GET(
  req: UnitIdRequest & { query: ListUnitMembersQuery },
  res: MedusaResponse
): Promise<void> {
  const { id: companyId, unitId } = req.params;
  const companyService: CompanyModuleService = req.scope.resolve(B2B_COMPANY_MODULE);

  const { role, limit = 50, offset = 0 } = req.query;

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

  // Get unit members
  let members = await companyService.listUnitMembers(unitId);

  // Apply role filter if provided
  if (role) {
    members = members.filter((m) => m.role === role);
  }

  // Apply pagination
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
 * Request body for adding a member to unit
 */
interface AddUnitMemberBody {
  customer_id: string;
  role?: UnitMembershipRole;
  is_default?: boolean;
  can_approve?: boolean;
  spending_limit?: number;
  permissions?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * POST /admin/b2b/companies/:id/units/:unitId/members
 *
 * Adds a customer to an organizational unit.
 * The customer must already be an active member of the company.
 *
 * @body customer_id - Required. The customer ID to add
 * @body role - Optional. Unit role (default: "member")
 * @body is_default - Optional. Set as customer's default unit in this company (default: false)
 * @body can_approve - Optional. Grant approval capability for this unit (default: false)
 * @body spending_limit - Optional. Unit-specific spending limit in cents (overrides company limit)
 * @body permissions - Optional. Unit-specific permissions
 * @body metadata - Optional. Custom metadata
 */
export async function POST(
  req: UnitIdRequest & { body: AddUnitMemberBody },
  res: MedusaResponse
): Promise<void> {
  const { id: companyId, unitId } = req.params;
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

  // Validate role if provided
  const validRoles: UnitMembershipRole[] = ["head", "manager", "lead", "member", "viewer"];
  if (body.role && !validRoles.includes(body.role)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Invalid role: ${body.role}. Must be one of: ${validRoles.join(", ")}`
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
  const membershipInput: CreateUnitMembershipInput = {
    role: body.role,
    is_default: body.is_default,
    can_approve: body.can_approve,
    spending_limit: body.spending_limit,
    permissions: body.permissions,
    metadata: body.metadata,
  };

  try {
    const membership = await companyService.addCustomerToUnit(
      unitId,
      body.customer_id,
      membershipInput
    );

    res.status(201).json({
      membership,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("already a member of this unit")) {
        throw new MedusaError(
          MedusaError.Types.DUPLICATE_ERROR,
          error.message
        );
      }
      if (error.message.includes("must be an active member of the company")) {
        throw new MedusaError(
          MedusaError.Types.NOT_ALLOWED,
          error.message
        );
      }
    }
    throw error;
  }
}
