/**
 * Admin B2B Company Unit Detail API Routes
 *
 * Provides admin endpoints for individual unit management.
 *
 * GET /admin/b2b/companies/:id/units/:unitId - Get unit details
 * PUT /admin/b2b/companies/:id/units/:unitId - Update unit
 * DELETE /admin/b2b/companies/:id/units/:unitId - Delete unit
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type CompanyModuleService from "../../../../../../../modules/b2b-company/service";
import type {
  CompanyUnitType,
  UpdateUnitInput,
} from "../../../../../../../modules/b2b-company/service";

const B2B_COMPANY_MODULE = "b2bCompanyService";

/**
 * Request with company ID and unit ID parameters
 */
interface UnitIdRequest extends MedusaRequest {
  params: {
    id: string;
    unitId: string;
  };
}

/**
 * Validates that the unit belongs to the specified company.
 * Returns the unit if valid, throws MedusaError otherwise.
 */
async function validateUnitOwnership(
  companyService: CompanyModuleService,
  companyId: string,
  unitId: string
) {
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
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Unit with id "${unitId}" not found`
    );
  }

  if (unit.company_id !== companyId) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Unit with id "${unitId}" not found in company "${companyId}"`
    );
  }

  return unit;
}

/**
 * GET /admin/b2b/companies/:id/units/:unitId
 *
 * Returns detailed information about a specific organizational unit,
 * including its path in the hierarchy and member count.
 */
export async function GET(
  req: UnitIdRequest,
  res: MedusaResponse
): Promise<void> {
  const { id: companyId, unitId } = req.params;
  const companyService: CompanyModuleService = req.scope.resolve(B2B_COMPANY_MODULE);

  const unit = await validateUnitOwnership(companyService, companyId, unitId);

  // Get unit members count
  const members = await companyService.listUnitMembers(unitId);

  // Get child units count
  const children = await companyService.listUnits(companyId, {
    parent_id: unitId,
    is_active: true,
  });

  res.status(200).json({
    unit: {
      ...unit,
      members_count: members.length,
      children_count: children.length,
    },
  });
}

/**
 * Request body for updating a unit
 */
interface UpdateUnitBody {
  /** Name of the unit */
  name?: string;
  /** URL-friendly slug */
  slug?: string;
  /** Type of unit */
  type?: CompanyUnitType;
  /** Description of the unit */
  description?: string;
  /** Sort order within siblings */
  sort_order?: number;
  /** Manager customer ID (null to remove manager) */
  manager_id?: string | null;
  /** Custom settings */
  settings?: Record<string, unknown>;
  /** Custom metadata */
  metadata?: Record<string, unknown>;
  /** Active status */
  is_active?: boolean;
}

/**
 * PUT /admin/b2b/companies/:id/units/:unitId
 *
 * Updates an organizational unit's information.
 * Note: To move a unit to a different parent, use the dedicated move endpoint.
 *
 * @example
 * ```json
 * {
 *   "name": "Sales & Marketing Department",
 *   "description": "Updated description",
 *   "is_active": true
 * }
 * ```
 */
export async function PUT(
  req: UnitIdRequest & { body: UpdateUnitBody },
  res: MedusaResponse
): Promise<void> {
  const { id: companyId, unitId } = req.params;
  const body = req.body;
  const companyService: CompanyModuleService = req.scope.resolve(B2B_COMPANY_MODULE);

  await validateUnitOwnership(companyService, companyId, unitId);

  // Validate name if provided
  if (body.name !== undefined && !body.name.trim()) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Unit name cannot be empty"
    );
  }

  try {
    // Build update input (excluding parent_id - use move endpoint for that)
    const updateInput: UpdateUnitInput = {};

    if (body.name !== undefined) updateInput.name = body.name;
    if (body.slug !== undefined) updateInput.slug = body.slug;
    if (body.type !== undefined) updateInput.type = body.type;
    if (body.description !== undefined) updateInput.description = body.description;
    if (body.sort_order !== undefined) updateInput.sort_order = body.sort_order;
    if (body.manager_id !== undefined) updateInput.manager_id = body.manager_id;
    if (body.settings !== undefined) updateInput.settings = body.settings;
    if (body.metadata !== undefined) updateInput.metadata = body.metadata;
    if (body.is_active !== undefined) updateInput.is_active = body.is_active;

    const updatedUnit = await companyService.updateUnit(unitId, updateInput);

    res.status(200).json({
      unit: updatedUnit,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) {
      throw new MedusaError(
        MedusaError.Types.DUPLICATE_ERROR,
        error.message
      );
    }
    throw error;
  }
}

/**
 * DELETE /admin/b2b/companies/:id/units/:unitId
 *
 * Soft deletes an organizational unit by setting is_active to false.
 * The unit must not have active child units.
 */
export async function DELETE(
  req: UnitIdRequest,
  res: MedusaResponse
): Promise<void> {
  const { id: companyId, unitId } = req.params;
  const companyService: CompanyModuleService = req.scope.resolve(B2B_COMPANY_MODULE);

  await validateUnitOwnership(companyService, companyId, unitId);

  try {
    await companyService.deleteUnit(unitId);

    res.status(200).json({
      id: unitId,
      object: "company_unit",
      deleted: true,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("active child unit")) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        error.message
      );
    }
    throw error;
  }
}
