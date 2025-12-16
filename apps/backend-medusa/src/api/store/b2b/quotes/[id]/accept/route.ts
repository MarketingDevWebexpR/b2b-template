/**
 * Store B2B Quote Accept API Route
 *
 * POST /store/b2b/quotes/:id/accept - Accept a quote
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";
import type QuoteModuleService from "../../../../../../modules/b2b-quote/service";
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
  params: {
    id: string;
  };
}

/**
 * POST /store/b2b/quotes/:id/accept
 *
 * Accepts a quote with seller pricing.
 * After acceptance, the quote can be converted to an order.
 *
 * @requires Authentication
 */
export async function POST(
  req: AuthenticatedRequest,
  res: MedusaResponse
): Promise<void> {
  const customerId = req.auth_context?.actor_id;
  const { id: quoteId } = req.params;

  if (!customerId) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Customer authentication required"
    );
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  // Get customer's company
  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "first_name", "last_name", "company.id"],
    filters: {
      id: customerId,
    },
  });

  const customer = customers[0];

  if (!customer?.company) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Customer must belong to a company"
    );
  }

  const quoteService: QuoteModuleService = req.scope.resolve(B2B_QUOTE_MODULE);

  try {
    // Verify quote belongs to customer's company
    const quote = await quoteService.retrieveQuote(quoteId);

    if (quote.company_id !== customer.company.id) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Quote does not belong to your company"
      );
    }

    const updatedQuote = await quoteService.acceptQuote(
      quoteId,
      customerId,
      `${customer.first_name} ${customer.last_name}`
    );

    res.status(200).json({
      quote: updatedQuote,
      message: "Quote accepted successfully. You can now proceed to place an order.",
    });
  } catch (error) {
    if (error instanceof MedusaError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        error.message
      );
    }
    throw error;
  }
}
