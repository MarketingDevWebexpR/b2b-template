/**
 * Admin B2B Quote Assign API Route
 *
 * POST /admin/b2b/quotes/:id/assign - Assign a sales rep to a quote
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type QuoteModuleService from "../../../../../../modules/b2b-quote/service";
const B2B_QUOTE_MODULE = "b2bQuoteService";
const B2B_APPROVAL_MODULE = "b2bApprovalWorkflowService";
const B2B_SPENDING_MODULE = "b2bSpendingLimitService";
const B2B_COMPANY_MODULE = "b2bCompanyService";

/**
 * Request with quote ID parameter and auth context
 */
interface AssignRequest extends MedusaRequest {
  auth_context?: {
    actor_id: string;
    actor_type: "user" | "customer";
  };
  params: {
    id: string;
  };
}

/**
 * Assign quote request body
 */
interface AssignBody {
  assigned_to_id: string;
}

/**
 * POST /admin/b2b/quotes/:id/assign
 *
 * Assigns a sales representative to handle a quote.
 */
export async function POST(
  req: AssignRequest & { body: AssignBody },
  res: MedusaResponse
): Promise<void> {
  const { id: quoteId } = req.params;
  const adminId = req.auth_context?.actor_id;
  const body = req.body;

  if (!adminId) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Admin authentication required"
    );
  }

  if (!body.assigned_to_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "assigned_to_id is required"
    );
  }

  const quoteService: QuoteModuleService = req.scope.resolve(B2B_QUOTE_MODULE);

  try {
    const updatedQuote = await quoteService.assignSalesRep(
      quoteId,
      body.assigned_to_id,
      "Admin"
    );

    res.status(200).json({
      quote: updatedQuote,
      message: "Sales rep assigned successfully",
    });
  } catch (error) {
    if (error instanceof MedusaError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        error.message
      );
    }
    throw error;
  }
}
