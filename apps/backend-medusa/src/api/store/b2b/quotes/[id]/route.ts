/**
 * Store B2B Quote Detail API Routes
 *
 * Provides endpoints for individual quote operations.
 *
 * GET /store/b2b/quotes/:id - Get quote details
 * PUT /store/b2b/quotes/:id - Update quote (draft only)
 * DELETE /store/b2b/quotes/:id - Cancel quote
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";
import type QuoteModuleService from "../../../../../modules/b2b-quote/service";
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
 * GET /store/b2b/quotes/:id
 *
 * Returns detailed information about a specific quote.
 *
 * @requires Authentication
 */
export async function GET(
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
    fields: ["id", "company.id"],
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
    const quote = await quoteService.retrieveQuote(quoteId);

    // Verify quote belongs to customer's company
    if (quote.company_id !== customer.company.id) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Quote does not belong to your company"
      );
    }

    // Get quote items
    const items = await quoteService.listQuoteItems({
      filters: { quote_id: quoteId },
    });

    // Get messages (excluding internal)
    const messages = await quoteService.listMessages(quoteId, false);

    res.status(200).json({
      quote: {
        ...quote,
        items,
        messages,
      },
    });
  } catch (error) {
    if (error instanceof MedusaError) {
      throw error;
    }
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Quote with id "${quoteId}" not found`
    );
  }
}

/**
 * Update quote request body
 */
interface UpdateQuoteBody {
  title?: string;
  notes?: string;
  terms?: {
    payment_terms?: { type: string; days: number };
    delivery_terms?: string;
  };
}

/**
 * PUT /store/b2b/quotes/:id
 *
 * Updates a quote (only in draft status).
 *
 * @requires Authentication
 */
export async function PUT(
  req: AuthenticatedRequest & { body: UpdateQuoteBody },
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
    fields: ["id", "company.id"],
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
    const quote = await quoteService.retrieveQuote(quoteId);

    // Verify quote belongs to customer's company
    if (quote.company_id !== customer.company.id) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Quote does not belong to your company"
      );
    }

    // Only draft quotes can be edited
    if (quote.status !== "draft") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Only draft quotes can be edited"
      );
    }

    const body = req.body;
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.terms !== undefined) {
      updateData.terms = { ...(quote.terms as object), ...body.terms };
    }

    await quoteService.updateQuotes({ id: quoteId }, updateData);
    const updatedQuote = await quoteService.retrieveQuote(quoteId);

    // Record history
    await quoteService.recordHistory({
      quoteId,
      eventType: "updated",
      actorType: "customer",
      actorId: customerId,
      description: "Quote updated",
      changedFields: Object.keys(updateData),
    });

    res.status(200).json({
      quote: updatedQuote,
    });
  } catch (error) {
    if (error instanceof MedusaError) {
      throw error;
    }
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Quote with id "${quoteId}" not found`
    );
  }
}

/**
 * DELETE /store/b2b/quotes/:id
 *
 * Cancels a quote (before submission or acceptance).
 *
 * @requires Authentication
 */
export async function DELETE(
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
    const quote = await quoteService.retrieveQuote(quoteId);

    // Verify quote belongs to customer's company
    if (quote.company_id !== customer.company.id) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Quote does not belong to your company"
      );
    }

    // Can only cancel certain statuses
    const cancellableStatuses = ["draft", "submitted", "under_review", "responded", "negotiating"];
    if (!cancellableStatuses.includes(quote.status as string)) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Cannot cancel quote with status "${quote.status}"`
      );
    }

    await quoteService.updateQuotes({ id: quoteId }, { status: "cancelled" });

    await quoteService.recordHistory({
      quoteId,
      eventType: "cancelled",
      actorType: "customer",
      actorId: customerId,
      actorName: `${customer.first_name} ${customer.last_name}`,
      description: `Quote ${quote.quote_number} cancelled`,
      previousValues: { status: quote.status },
      newValues: { status: "cancelled" },
    });

    res.status(200).json({
      id: quoteId,
      object: "quote",
      cancelled: true,
    });
  } catch (error) {
    if (error instanceof MedusaError) {
      throw error;
    }
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Quote with id "${quoteId}" not found`
    );
  }
}
