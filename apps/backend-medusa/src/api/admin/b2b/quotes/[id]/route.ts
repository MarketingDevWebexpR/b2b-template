/**
 * Admin B2B Quote Detail API Routes
 *
 * Provides admin endpoints for individual quote management.
 *
 * GET /admin/b2b/quotes/:id - Get quote details
 * PUT /admin/b2b/quotes/:id - Update quote
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type QuoteModuleService from "../../../../../modules/b2b-quote/service";
import type { QuoteStatus } from "../../../../../modules/b2b-quote/models";
const B2B_QUOTE_MODULE = "b2bQuoteService";
const B2B_APPROVAL_MODULE = "b2bApprovalWorkflowService";
const B2B_SPENDING_MODULE = "b2bSpendingLimitService";
const B2B_COMPANY_MODULE = "b2bCompanyService";

/**
 * Request with quote ID parameter
 */
interface QuoteIdRequest extends MedusaRequest {
  params: {
    id: string;
  };
}

/**
 * GET /admin/b2b/quotes/:id
 *
 * Returns detailed information about a specific quote.
 */
export async function GET(
  req: QuoteIdRequest,
  res: MedusaResponse
): Promise<void> {
  const { id: quoteId } = req.params;
  const quoteService: QuoteModuleService = req.scope.resolve(B2B_QUOTE_MODULE);

  try {
    const quote = await quoteService.retrieveQuote(quoteId);

    // Get quote items
    const items = await quoteService.listQuoteItems({
      filters: { quote_id: quoteId },
    });

    // Get all messages (including internal)
    const messages = await quoteService.listMessages(quoteId, true);

    // Get history
    const history = await quoteService.getQuoteHistory(quoteId);

    res.status(200).json({
      quote: {
        ...quote,
        items,
        messages,
        history,
      },
    });
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Quote with id "${quoteId}" not found`
    );
  }
}

/**
 * Admin update quote body
 */
interface AdminUpdateQuoteBody {
  status?: QuoteStatus;
  title?: string;
  notes?: string;
  valid_until?: string;
  terms?: {
    payment_terms?: { type: string; days: number };
    delivery_terms?: string;
    shipping_method?: string;
    incoterms?: string;
  };
  assigned_to_id?: string;
  rejection_reason?: string;
}

/**
 * Extended request with auth context for admin
 */
interface AdminRequest extends QuoteIdRequest {
  auth_context?: {
    actor_id: string;
    actor_type: "user" | "customer";
  };
  body: AdminUpdateQuoteBody;
}

/**
 * PUT /admin/b2b/quotes/:id
 *
 * Updates a quote (admin override capabilities).
 */
export async function PUT(
  req: AdminRequest,
  res: MedusaResponse
): Promise<void> {
  const { id: quoteId } = req.params;
  const adminId = req.auth_context?.actor_id;
  const body = req.body;
  const quoteService: QuoteModuleService = req.scope.resolve(B2B_QUOTE_MODULE);

  let existingQuote;
  try {
    existingQuote = await quoteService.retrieveQuote(quoteId);
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Quote with id "${quoteId}" not found`
    );
  }

  const updateData: Record<string, unknown> = {};
  const changedFields: string[] = [];

  if (body.status !== undefined) {
    updateData.status = body.status;
    changedFields.push("status");

    // Set appropriate timestamps
    if (body.status === "rejected") {
      updateData.decided_at = new Date();
      updateData.rejection_reason = body.rejection_reason;
    } else if (body.status === "accepted") {
      updateData.decided_at = new Date();
    }
  }

  if (body.title !== undefined) {
    updateData.title = body.title;
    changedFields.push("title");
  }

  if (body.notes !== undefined) {
    updateData.notes = body.notes;
    changedFields.push("notes");
  }

  if (body.valid_until !== undefined) {
    updateData.valid_until = new Date(body.valid_until);
    changedFields.push("valid_until");
  }

  if (body.terms !== undefined) {
    updateData.terms = { ...(existingQuote.terms as object), ...body.terms };
    changedFields.push("terms");
  }

  if (body.assigned_to_id !== undefined) {
    updateData.assigned_to_id = body.assigned_to_id;
    changedFields.push("assigned_to_id");
  }

  await quoteService.updateQuotes({ id: quoteId }, updateData);
  const updatedQuote = await quoteService.retrieveQuote(quoteId);

  // Record history
  if (changedFields.length > 0) {
    await quoteService.recordHistory({
      quoteId,
      eventType: "updated",
      actorType: "admin",
      actorId: adminId,
      description: `Quote updated by admin`,
      previousValues: { status: existingQuote.status },
      newValues: updateData,
      changedFields,
    });
  }

  res.status(200).json({
    quote: updatedQuote,
  });
}
