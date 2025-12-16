/**
 * Admin B2B Companies API Routes
 *
 * Provides admin endpoints for company management.
 *
 * GET /admin/b2b/companies - List all companies with filters
 * POST /admin/b2b/companies - Create a new company
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type CompanyModuleService from "../../../../modules/b2b-company/service";
import type { CreateCompanyInput, CompanyStatus, CompanyTier } from "../../../../modules/b2b-company/service";
const B2B_QUOTE_MODULE = "b2bQuoteService";
const B2B_APPROVAL_MODULE = "b2bApprovalWorkflowService";
const B2B_SPENDING_MODULE = "b2bSpendingLimitService";
const B2B_COMPANY_MODULE = "b2bCompanyService";

/**
 * Query parameters for company listing
 */
interface ListCompaniesQuery {
  status?: CompanyStatus;
  tier?: CompanyTier;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * GET /admin/b2b/companies
 *
 * Lists all companies with optional filtering by status, tier, or search term.
 *
 * @query status - Filter by company status
 * @query tier - Filter by company tier
 * @query search - Search by name, email, or slug
 * @query limit - Number of results (default: 20)
 * @query offset - Pagination offset (default: 0)
 */
export async function GET(
  req: MedusaRequest<object, ListCompaniesQuery>,
  res: MedusaResponse
): Promise<void> {
  const companyService: CompanyModuleService = req.scope.resolve(B2B_COMPANY_MODULE);

  const { status, tier, search, limit = 20, offset = 0 } = req.query;

  const filters: Record<string, unknown> = {};

  if (status) {
    filters.status = status;
  }

  if (tier) {
    filters.tier = tier;
  }

  // For search, we would need to use the searchable fields
  // Medusa V2 uses the searchable() modifier for full-text search
  if (search) {
    filters.$or = [
      { name: { $like: `%${search}%` } },
      { email: { $like: `%${search}%` } },
      { slug: { $like: `%${search}%` } },
    ];
  }

  const [companies, count] = await Promise.all([
    companyService.listCompanies(filters, {
      skip: Number(offset),
      take: Number(limit),
    }),
    companyService.listCompanies(filters, {
      select: ["id"],
    }).then((list) => list.length),
  ]);

  res.status(200).json({
    companies,
    count,
    limit: Number(limit),
    offset: Number(offset),
  });
}

/**
 * POST /admin/b2b/companies
 *
 * Creates a new company with the provided data.
 * Automatically generates a unique slug from the company name.
 */
export async function POST(
  req: MedusaRequest<CreateCompanyInput>,
  res: MedusaResponse
): Promise<void> {
  const companyService: CompanyModuleService = req.scope.resolve(B2B_COMPANY_MODULE);

  const body = req.body;

  // Validate required fields
  if (!body.name?.trim()) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Company name is required"
    );
  }

  if (!body.email?.trim()) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Company email is required"
    );
  }

  // Check for duplicate email
  const existingCompany = await companyService.findByEmail(body.email);
  if (existingCompany) {
    throw new MedusaError(
      MedusaError.Types.DUPLICATE_ERROR,
      `A company with email "${body.email}" already exists`
    );
  }

  // Create company with generated slug
  const company = await companyService.createCompanyWithSlug(body);

  res.status(201).json({
    company,
  });
}
