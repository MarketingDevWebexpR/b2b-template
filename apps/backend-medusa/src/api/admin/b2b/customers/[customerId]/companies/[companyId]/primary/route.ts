/**
 * Admin B2B Customer Primary Company API Routes
 *
 * Provides admin endpoints for setting a customer's primary company.
 *
 * POST /admin/b2b/customers/:customerId/companies/:companyId/primary - Set as primary company
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type CompanyModuleService from "../../../../../../../../modules/b2b-company/service";

const B2B_COMPANY_MODULE = "b2bCompanyService";

/**
 * Request with customer and company ID parameters
 */
interface CustomerCompanyIdRequest extends MedusaRequest {
  params: {
    customerId: string;
    companyId: string;
  };
}

/**
 * POST /admin/b2b/customers/:customerId/companies/:companyId/primary
 *
 * Sets a company as the primary company for a customer.
 * The customer must already be an active member of the company.
 * Any existing primary company designation will be removed.
 */
export async function POST(
  req: CustomerCompanyIdRequest,
  res: MedusaResponse
): Promise<void> {
  const { customerId, companyId } = req.params;
  const companyService: CompanyModuleService = req.scope.resolve(B2B_COMPANY_MODULE);

  // Validate parameters
  if (!customerId?.trim()) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "customerId is required"
    );
  }

  if (!companyId?.trim()) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "companyId is required"
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

  // Verify customer has an active membership in this company
  const memberships = await companyService.listCompanyMemberships({
    customer_id: customerId,
    company_id: companyId,
  });

  if (memberships.length === 0) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Customer "${customerId}" is not a member of company "${companyId}"`
    );
  }

  const membership = memberships[0];

  if (membership.status !== "active") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Cannot set primary company: membership status is "${membership.status}". Only active memberships can be set as primary.`
    );
  }

  // Check if already primary
  if (membership.is_primary) {
    res.status(200).json({
      membership,
      message: "Company is already the primary company for this customer",
    });
    return;
  }

  try {
    // Set as primary (this also unsets any existing primary)
    const updatedMembership = await companyService.setPrimaryCompany(customerId, companyId);

    // Retrieve full membership data
    const finalMembership = await companyService.retrieveCompanyMembership(membership.id);

    res.status(200).json({
      membership: finalMembership,
      message: "Company set as primary successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        error.message
      );
    }
    throw error;
  }
}
