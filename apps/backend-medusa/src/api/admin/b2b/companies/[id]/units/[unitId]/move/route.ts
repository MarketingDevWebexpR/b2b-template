/**
 * Admin B2B Company Unit Move API Route
 *
 * Provides admin endpoint for moving units within the organizational hierarchy.
 *
 * POST /admin/b2b/companies/:id/units/:unitId/move - Move unit to new parent
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type CompanyModuleService from "../../../../../../../../modules/b2b-company/service";

const B2B_COMPANY_MODULE = "b2bCompanyService";

/**
 * Request with company ID and unit ID parameters
 */
interface MoveUnitRequest extends MedusaRequest {
  params: {
    id: string;
    unitId: string;
  };
}

/**
 * Request body for moving a unit
 */
interface MoveUnitBody {
  /** New parent unit ID, or null to make it a root unit */
  new_parent_id: string | null;
}

/**
 * POST /admin/b2b/companies/:id/units/:unitId/move
 *
 * Moves an organizational unit to a new parent in the hierarchy.
 * This operation updates the unit's path and level, as well as
 * all of its descendants.
 *
 * Rules:
 * - A unit cannot be moved under itself or any of its descendants
 * - The new parent must belong to the same company
 * - Pass null for new_parent_id to make the unit a root unit
 *
 * @example
 * ```json
 * // Move unit under a new parent
 * { "new_parent_id": "unit_parent_123" }
 *
 * // Make unit a root unit
 * { "new_parent_id": null }
 * ```
 */
export async function POST(
  req: MoveUnitRequest & { body: MoveUnitBody },
  res: MedusaResponse
): Promise<void> {
  const { id: companyId, unitId } = req.params;
  const { new_parent_id: newParentId } = req.body;
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

  // Validate new_parent_id field is present
  if (!("new_parent_id" in req.body)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "new_parent_id is required (use null for root)"
    );
  }

  // Prevent moving to itself
  if (newParentId === unitId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "A unit cannot be moved under itself"
    );
  }

  // If new parent is specified, validate it
  if (newParentId !== null) {
    let newParent;
    try {
      newParent = await companyService.retrieveCompanyUnit(newParentId);
    } catch {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Parent unit with id "${newParentId}" not found`
      );
    }

    // Verify new parent belongs to same company
    if (newParent.company_id !== companyId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "New parent unit must belong to the same company"
      );
    }

    // Verify new parent is not a descendant of the unit being moved
    // (this would create a circular reference)
    const newParentPath = newParent.path as string;
    const unitPath = unit.path as string;
    if (newParentPath.startsWith(unitPath + "/")) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Cannot move a unit under its own descendant"
      );
    }
  }

  // Check if already at the target position (no-op)
  const currentParentId = unit.parent_id as string | null;
  if (currentParentId === newParentId) {
    res.status(200).json({
      unit,
      message: "Unit is already at the specified position",
    });
    return;
  }

  try {
    const movedUnit = await companyService.moveUnit(unitId, newParentId);

    res.status(200).json({
      unit: movedUnit,
      previous_parent_id: currentParentId,
      new_parent_id: newParentId,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Cannot move unit under its own descendant")) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          error.message
        );
      }
      if (error.message.includes("Parent unit must belong")) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          error.message
        );
      }
    }
    throw error;
  }
}
