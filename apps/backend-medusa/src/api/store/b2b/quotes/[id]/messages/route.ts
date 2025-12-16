/**
 * Store B2B Quote Messages API Routes
 *
 * GET /store/b2b/quotes/:id/messages - Get quote messages
 * POST /store/b2b/quotes/:id/messages - Add a message
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
 * GET /store/b2b/quotes/:id/messages
 *
 * Returns messages for a quote (excluding internal notes).
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
    // Verify quote belongs to customer's company
    const quote = await quoteService.retrieveQuote(quoteId);

    if (quote.company_id !== customer.company.id) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Quote does not belong to your company"
      );
    }

    // Get messages (excluding internal)
    const messages = await quoteService.listMessages(quoteId, false);

    res.status(200).json({
      messages,
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
 * Add message request body
 */
interface AddMessageBody {
  content: string;
  quote_item_id?: string;
  attachments?: {
    url: string;
    filename: string;
    mimetype: string;
    size: number;
  }[];
}

/**
 * POST /store/b2b/quotes/:id/messages
 *
 * Adds a message to the quote thread.
 *
 * @requires Authentication
 */
export async function POST(
  req: AuthenticatedRequest & { body: AddMessageBody },
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

  const body = req.body;

  if (!body.content?.trim()) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Message content is required"
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

    // Can only message on active quotes
    const activeStatuses = ["draft", "submitted", "under_review", "responded", "negotiating"];
    if (!activeStatuses.includes(quote.status as string)) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Cannot add messages to quote with status "${quote.status}"`
      );
    }

    const message = await quoteService.addMessage({
      quoteId,
      senderType: "customer",
      senderId: customerId,
      senderName: `${customer.first_name} ${customer.last_name}`,
      content: body.content,
      attachments: body.attachments,
      quoteItemId: body.quote_item_id,
    });

    res.status(201).json({
      message,
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
