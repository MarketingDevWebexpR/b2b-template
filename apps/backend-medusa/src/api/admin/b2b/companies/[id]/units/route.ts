/**
 * Admin B2B Company Units API Routes
 *
 * Provides admin endpoints for organizational unit management within a company.
 *
 * GET /admin/b2b/companies/:id/units - List all units for a company
 * POST /admin/b2b/companies/:id/units - Create a new unit
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type CompanyModuleService from "../../../../../../modules/b2b-company/service";
import type {
  CompanyUnitType,
  CreateUnitInput,
  ListUnitsFilters,
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
 * Query parameters for unit listing
 */
interface ListUnitsQuery {
  parent_id?: string | "null";
  type?: CompanyUnitType;
  is_active?: string;
  limit?: number;
  offset?: number;
}

/**
 * GET /admin/b2b/companies/:id/units
 *
 * Lists all organizational units for a company with optional filters.
 *
 * @query parent_id - Filter by parent unit ID (use "null" for root units)
 * @query type - Filter by unit type (department, team, division, etc.)
 * @query is_active - Filter by active status ("true" or "false")
 * @query limit - Number of results (default: 100)
 * @query offset - Pagination offset (default: 0)
 */
export async function GET(
  req: CompanyIdRequest & { query: ListUnitsQuery },
  res: MedusaResponse
): Promise<void> {
  const { id: companyId } = req.params;
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

  const { parent_id, type, is_active, limit = 100, offset = 0 } = req.query;

  // Build filters
  const filters: ListUnitsFilters = {};

  if (parent_id !== undefined) {
    // Handle "null" string for root units
    filters.parent_id = parent_id === "null" ? null : parent_id;
  }

  if (type !== undefined) {
    filters.type = type;
  }

  if (is_active !== undefined) {
    filters.is_active = is_active === "true";
  }

  const units = await companyService.listUnits(companyId, filters);

  // Apply pagination (service doesn't support it directly for listUnits)
  const paginatedUnits = units.slice(Number(offset), Number(offset) + Number(limit));

  res.status(200).json({
    units: paginatedUnits,
    count: units.length,
    limit: Number(limit),
    offset: Number(offset),
  });
}

/**
 * Request body for creating a unit
 */
interface CreateUnitBody {
  /** Name of the unit (required) */
  name: string;
  /** URL-friendly slug (auto-generated if not provided) */
  slug?: string;
  /** Type of unit (required) */
  type: CompanyUnitType;
  /** Description of the unit */
  description?: string;
  /** Parent unit ID (null for root unit) */
  parent_id?: string | null;
  /** Sort order within siblings */
  sort_order?: number;
  /** Manager customer ID */
  manager_id?: string;
  /** Custom settings */
  settings?: Record<string, unknown>;
  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * POST /admin/b2b/companies/:id/units
 *
 * Creates a new organizational unit within a company.
 * Automatically generates the materialized path based on parent hierarchy.
 *
 * @example
 * ```json
 * {
 *   "name": "Sales Department",
 *   "type": "department",
 *   "description": "Handles all sales operations",
 *   "parent_id": null
 * }
 * ```
 */
export async function POST(
  req: CompanyIdRequest & { body: CreateUnitBody },
  res: MedusaResponse
): Promise<void> {
  const { id: companyId } = req.params;
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

  // Validate required fields
  if (!body.name?.trim()) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Unit name is required"
    );
  }

  if (!body.type?.trim()) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Unit type is required"
    );
  }

  // Validate parent exists if provided
  if (body.parent_id) {
    try {
      const parentUnit = await companyService.retrieveCompanyUnit(body.parent_id);
      if (parentUnit.company_id !== companyId) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Parent unit must belong to the same company"
        );
      }
    } catch (error) {
      if (error instanceof MedusaError) {
        throw error;
      }
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Parent unit with id "${body.parent_id}" not found`
      );
    }
  }

  try {
    const unitInput: CreateUnitInput = {
      name: body.name,
      slug: body.slug,
      type: body.type,
      description: body.description,
      parent_id: body.parent_id ?? null,
      sort_order: body.sort_order,
      manager_id: body.manager_id,
      settings: body.settings,
      metadata: body.metadata,
    };

    const unit = await companyService.createUnit(companyId, unitInput);

    res.status(201).json({
      unit,
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
