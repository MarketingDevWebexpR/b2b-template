/**
 * Store B2B Company Me API Route
 *
 * Provides endpoints for authenticated customers to access and update
 * their company information.
 *
 * GET /store/b2b/companies/me - Get the authenticated customer's company
 * PUT /store/b2b/companies/me - Update limited company fields
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";
import type CompanyModuleService from "../../../../../modules/b2b-company/service";
const B2B_QUOTE_MODULE = "b2bQuoteService";
const B2B_APPROVAL_MODULE = "b2bApprovalWorkflowService";
const B2B_SPENDING_MODULE = "b2bSpendingLimitService";
const B2B_COMPANY_MODULE = "b2bCompanyService";

/**
 * Extended request type with authenticated customer
 */
interface AuthenticatedRequest extends MedusaRequest {
  auth_context?: {
    actor_id: string;
    actor_type: "customer" | "user";
  };
}

/**
 * GET /store/b2b/companies/me
 *
 * Returns the company associated with the authenticated customer.
 * Uses the company-customer link to find the relationship.
 *
 * @requires Authentication
 */
export async function GET(
  req: AuthenticatedRequest,
  res: MedusaResponse
): Promise<void> {
  const customerId = req.auth_context?.actor_id;

  if (!customerId) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Customer authentication required"
    );
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  // Query company via the customer link
  const { data: customers } = await query.graph({
    entity: "customer",
    fields: [
      "id",
      "email",
      "company.*",
      "company.addresses.*",
    ],
    filters: {
      id: customerId,
    },
  });

  const customer = customers[0];

  if (!customer?.company) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No company associated with this customer"
    );
  }

  res.status(200).json({
    company: customer.company,
  });
}

/**
 * Update company request body
 */
interface UpdateCompanyBody {
  phone?: string;
  website?: string;
  description?: string;
  settings?: {
    defaultLanguage?: string;
    marketingOptIn?: boolean;
    orderNotificationEmails?: string[];
    invoiceNotificationEmails?: string[];
  };
}

/**
 * PUT /store/b2b/companies/me
 *
 * Updates limited company fields. Only certain fields can be modified
 * by regular customers. Admin fields like credit_limit, tier, status
 * cannot be changed through this endpoint.
 *
 * @requires Authentication
 */
export async function PUT(
  req: AuthenticatedRequest,
  res: MedusaResponse
): Promise<void> {
  const customerId = req.auth_context?.actor_id;

  if (!customerId) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Customer authentication required"
    );
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  // First find the company
  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "company.id", "company.settings"],
    filters: {
      id: customerId,
    },
  });

  const customer = customers[0];

  if (!customer?.company) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No company associated with this customer"
    );
  }

  const body = req.body as UpdateCompanyBody;
  const companyService: CompanyModuleService = req.scope.resolve(B2B_COMPANY_MODULE);

  // Only allow updating certain fields
  const allowedUpdates: Record<string, unknown> = {};

  if (body.phone !== undefined) {
    allowedUpdates.phone = body.phone;
  }

  if (body.website !== undefined) {
    allowedUpdates.website = body.website;
  }

  if (body.description !== undefined) {
    allowedUpdates.description = body.description;
  }

  // Merge settings carefully - only allow customer-facing settings
  if (body.settings) {
    const currentSettings = customer.company.settings as Record<string, unknown> || {};
    const updatedSettings: Record<string, unknown> = { ...currentSettings };

    if (body.settings.defaultLanguage !== undefined) {
      updatedSettings.defaultLanguage = body.settings.defaultLanguage;
    }

    if (body.settings.marketingOptIn !== undefined) {
      updatedSettings.marketingOptIn = body.settings.marketingOptIn;
    }

    if (body.settings.orderNotificationEmails !== undefined) {
      updatedSettings.orderNotificationEmails = body.settings.orderNotificationEmails;
    }

    if (body.settings.invoiceNotificationEmails !== undefined) {
      updatedSettings.invoiceNotificationEmails = body.settings.invoiceNotificationEmails;
    }

    allowedUpdates.settings = updatedSettings;
  }

  // Update company with allowed fields only
  const updatedCompany = await companyService.updateCompanies(
    customer.company.id,
    allowedUpdates
  );

  res.status(200).json({
    company: updatedCompany,
  });
}
