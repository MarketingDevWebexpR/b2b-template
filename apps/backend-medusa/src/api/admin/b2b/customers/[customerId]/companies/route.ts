/**
 * Admin B2B Customer Companies API Routes
 *
 * Provides admin endpoints for viewing a customer's company associations.
 *
 * GET /admin/b2b/customers/:customerId/companies - Get all companies for a customer
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type CompanyModuleService from "../../../../../../modules/b2b-company/service";

const B2B_COMPANY_MODULE = "b2bCompanyService";

/**
 * Request with customer ID parameter
 */
interface CustomerIdRequest extends MedusaRequest {
  params: {
    customerId: string;
  };
}

/**
 * Query parameters for listing customer companies
 */
interface ListCustomerCompaniesQuery {
  include_inactive?: string;
  limit?: number;
  offset?: number;
}

/**
 * GET /admin/b2b/customers/:customerId/companies
 *
 * Returns all companies a customer belongs to, with their membership details.
 *
 * @query include_inactive - Include inactive memberships ("true" or "false", default: "false")
 * @query limit - Number of results (default: 50)
 * @query offset - Pagination offset (default: 0)
 */
export async function GET(
  req: CustomerIdRequest & { query: ListCustomerCompaniesQuery },
  res: MedusaResponse
): Promise<void> {
  const { customerId } = req.params;
  const companyService: CompanyModuleService = req.scope.resolve(B2B_COMPANY_MODULE);

  const { include_inactive = "false", limit = 50, offset = 0 } = req.query;

  // Validate customerId
  if (!customerId?.trim()) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "customerId is required"
    );
  }

  // Get all company memberships for the customer
  let memberships = await companyService.listCompanyMemberships({
    customer_id: customerId,
  });

  // Filter by status if not including inactive
  if (include_inactive !== "true") {
    memberships = memberships.filter((m) => m.status === "active");
  }

  // Enrich memberships with company details
  const enrichedMemberships = await Promise.all(
    memberships.map(async (membership) => {
      try {
        const company = await companyService.retrieveCompany(membership.company_id as string);
        return {
          membership,
          company: {
            id: company.id,
            name: company.name,
            slug: company.slug,
            email: company.email,
            status: company.status,
            tier: company.tier,
          },
        };
      } catch {
        // Company might have been deleted
        return {
          membership,
          company: null,
        };
      }
    })
  );

  // Filter out memberships with deleted companies
  const validMemberships = enrichedMemberships.filter((e) => e.company !== null);

  // Apply pagination
  const paginatedResults = validMemberships.slice(
    Number(offset),
    Number(offset) + Number(limit)
  );

  res.status(200).json({
    companies: paginatedResults,
    count: validMemberships.length,
    limit: Number(limit),
    offset: Number(offset),
  });
}
