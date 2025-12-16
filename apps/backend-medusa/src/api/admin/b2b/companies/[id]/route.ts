/**
 * Admin B2B Company Detail API Routes
 *
 * Provides admin endpoints for individual company management.
 *
 * GET /admin/b2b/companies/:id - Get company details
 * PUT /admin/b2b/companies/:id - Update company
 * DELETE /admin/b2b/companies/:id - Soft delete company (set status to closed)
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";
import type CompanyModuleService from "../../../../../modules/b2b-company/service";
import type {
  CompanyStatus,
  CompanyTier,
  PaymentTerms,
  CompanySettings,
} from "../../../../../modules/b2b-company/service";

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
 * GET /admin/b2b/companies/:id
 *
 * Returns detailed information about a specific company,
 * including addresses and credit information.
 */
export async function GET(
  req: CompanyIdRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params;
  const companyService: CompanyModuleService = req.scope.resolve(B2B_COMPANY_MODULE);

  try {
    const company = await companyService.retrieveCompany(id);

    // Get addresses
    const addresses = await companyService.getCompanyAddresses(id);

    res.status(200).json({
      company: {
        ...company,
        addresses,
      },
    });
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Company with id "${id}" not found`
    );
  }
}

/**
 * Update company request body
 */
interface UpdateCompanyBody {
  name?: string;
  tradeName?: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  taxId?: string;
  registrationNumber?: string;
  status?: CompanyStatus;
  statusReason?: string;
  tier?: CompanyTier;
  creditLimit?: number;
  paymentTerms?: Partial<PaymentTerms>;
  settings?: Partial<CompanySettings>;
  accountManagerId?: string;
  salesRepId?: string;
  notes?: string;
}

/**
 * PUT /admin/b2b/companies/:id
 *
 * Updates a company's information. Admins can update all fields including
 * status, tier, credit limits, and payment terms.
 *
 * Status changes are validated against allowed transitions.
 */
export async function PUT(
  req: CompanyIdRequest & { body: UpdateCompanyBody },
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params;
  const body = req.body;
  const companyService: CompanyModuleService = req.scope.resolve(B2B_COMPANY_MODULE);

  // Verify company exists
  try {
    await companyService.retrieveCompany(id);
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Company with id "${id}" not found`
    );
  }

  // Handle status change separately (has validation)
  if (body.status) {
    await companyService.updateCompanyStatus(id, body.status, body.statusReason);
  }

  // Build update object
  const updateData: Record<string, unknown> = {};

  if (body.name !== undefined) updateData.name = body.name;
  if (body.tradeName !== undefined) updateData.trade_name = body.tradeName;
  if (body.email !== undefined) updateData.email = body.email;
  if (body.phone !== undefined) updateData.phone = body.phone;
  if (body.website !== undefined) updateData.website = body.website;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.taxId !== undefined) updateData.tax_id = body.taxId;
  if (body.registrationNumber !== undefined) updateData.registration_number = body.registrationNumber;
  if (body.tier !== undefined) updateData.tier = body.tier;
  if (body.creditLimit !== undefined) updateData.credit_limit = body.creditLimit;
  if (body.accountManagerId !== undefined) updateData.account_manager_id = body.accountManagerId;
  if (body.salesRepId !== undefined) updateData.sales_rep_id = body.salesRepId;
  if (body.notes !== undefined) updateData.notes = body.notes;

  // Handle payment terms merge
  if (body.paymentTerms) {
    const company = await companyService.retrieveCompany(id);
    const currentTerms = company.payment_terms as Record<string, unknown> || {};
    updateData.payment_terms = { ...currentTerms, ...body.paymentTerms };
  }

  // Handle settings merge
  if (body.settings) {
    const company = await companyService.retrieveCompany(id);
    const currentSettings = company.settings as Record<string, unknown> || {};
    updateData.settings = { ...currentSettings, ...body.settings };
  }

  // Update if there are fields to update
  let updatedCompany;
  if (Object.keys(updateData).length > 0) {
    await companyService.updateCompanies({ id }, updateData);
    updatedCompany = await companyService.retrieveCompany(id);
  } else {
    updatedCompany = await companyService.retrieveCompany(id);
  }

  res.status(200).json({
    company: updatedCompany,
  });
}

/**
 * DELETE /admin/b2b/companies/:id
 *
 * Soft deletes a company by setting its status to "closed".
 * The company data is preserved for historical records.
 */
export async function DELETE(
  req: CompanyIdRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params;
  const companyService: CompanyModuleService = req.scope.resolve(B2B_COMPANY_MODULE);

  try {
    await companyService.updateCompanyStatus(id, "closed", "Company closed by admin");

    res.status(200).json({
      id,
      object: "company",
      deleted: true,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Invalid status transition")) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Cannot close a company that is already closed"
      );
    }
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Company with id "${id}" not found`
    );
  }
}
