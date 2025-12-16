/**
 * Admin B2B Company Unit Tree API Route
 *
 * Provides admin endpoint for retrieving the full organizational hierarchy.
 *
 * GET /admin/b2b/companies/:id/units/tree - Get full hierarchical tree
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type CompanyModuleService from "../../../../../../../modules/b2b-company/service";

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
 * GET /admin/b2b/companies/:id/units/tree
 *
 * Returns the complete organizational tree structure for a company.
 * The tree is a hierarchical representation of all active units,
 * with each node containing its children nested within.
 *
 * @returns Tree structure with the following shape:
 * ```json
 * {
 *   "tree": [
 *     {
 *       "id": "unit_123",
 *       "name": "Sales",
 *       "slug": "sales",
 *       "type": "department",
 *       "level": 0,
 *       "path": "/sales",
 *       "parent_id": null,
 *       "manager_id": "cust_456",
 *       "is_active": true,
 *       "children": [
 *         {
 *           "id": "unit_789",
 *           "name": "Sales Team A",
 *           "slug": "sales-team-a",
 *           "type": "team",
 *           "level": 1,
 *           "path": "/sales/sales-team-a",
 *           "parent_id": "unit_123",
 *           "manager_id": null,
 *           "is_active": true,
 *           "children": []
 *         }
 *       ]
 *     }
 *   ],
 *   "total_units": 2
 * }
 * ```
 */
export async function GET(
  req: CompanyIdRequest,
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

  const tree = await companyService.getUnitTree(companyId);

  // Calculate total units count (recursively count all nodes)
  const countNodes = (nodes: typeof tree): number => {
    return nodes.reduce((count, node) => {
      return count + 1 + countNodes(node.children);
    }, 0);
  };

  res.status(200).json({
    tree,
    total_units: countNodes(tree),
  });
}
