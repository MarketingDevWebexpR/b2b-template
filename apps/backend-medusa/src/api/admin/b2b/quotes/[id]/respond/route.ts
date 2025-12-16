/**
 * Admin B2B Quote Respond API Route
 *
 * POST /admin/b2b/quotes/:id/respond - Respond to a quote with pricing
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type QuoteModuleService from "../../../../../../modules/b2b-quote/service";
import type { RespondToQuoteInput } from "../../../../../../modules/b2b-quote/service";
const B2B_QUOTE_MODULE = "b2bQuoteService";
const B2B_APPROVAL_MODULE = "b2bApprovalWorkflowService";
const B2B_SPENDING_MODULE = "b2bSpendingLimitService";
const B2B_COMPANY_MODULE = "b2bCompanyService";

/**
 * Request with quote ID parameter and auth context
 */
interface RespondRequest extends MedusaRequest {
  auth_context?: {
    actor_id: string;
    actor_type: "user" | "customer";
  };
  params: {
    id: string;
  };
}

/**
 * Respond to quote request body
 */
interface RespondBody {
  items: {
    item_id: string;
    offered_unit_price: number;
    notes?: string;
  }[];
  terms?: {
    payment_terms?: { type: string; days: number };
    delivery_terms?: string;
    shipping_method?: string;
    incoterms?: string;
  };
  valid_days?: number;
  notes?: string;
}

/**
 * POST /admin/b2b/quotes/:id/respond
 *
 * Seller responds to a quote with pricing for each item.
 */
export async function POST(
  req: RespondRequest & { body: RespondBody },
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

  // Validate items
  if (!body.items || body.items.length === 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "At least one item with pricing is required"
    );
  }

  for (const item of body.items) {
    if (!item.item_id || item.offered_unit_price === undefined) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Each item requires item_id and offered_unit_price"
      );
    }
  }

  const quoteService: QuoteModuleService = req.scope.resolve(B2B_QUOTE_MODULE);

  try {
    const input: RespondToQuoteInput = {
      quoteId,
      actorId: adminId,
      actorName: "Sales Representative",
      items: body.items.map((item) => ({
        itemId: item.item_id,
        offeredUnitPrice: item.offered_unit_price,
        notes: item.notes,
      })),
      terms: body.terms,
      validDays: body.valid_days,
      notes: body.notes,
    };

    const updatedQuote = await quoteService.respondToQuote(input);

    // Get updated items
    const items = await quoteService.listQuoteItems({
      filters: { quote_id: quoteId },
    });

    res.status(200).json({
      quote: {
        ...updatedQuote,
        items,
      },
      message: "Quote response sent successfully",
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
