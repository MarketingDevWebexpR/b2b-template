/**
 * Store B2B Quotes API Routes
 *
 * Provides endpoints for customers to manage their quotes.
 *
 * GET /store/b2b/quotes - List customer's quotes
 * POST /store/b2b/quotes - Create a new quote
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";
import type QuoteModuleService from "../../../../modules/b2b-quote/service";
import type { CreateQuoteInput, CreateQuoteItemInput } from "../../../../modules/b2b-quote/service";
import type { QuoteStatus } from "../../../../modules/b2b-quote/models";
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
 * Query parameters for quote listing
 */
interface ListQuotesQuery {
  status?: QuoteStatus | QuoteStatus[];
  limit?: number;
  offset?: number;
}

/**
 * GET /store/b2b/quotes
 *
 * Returns quotes for the authenticated customer's company.
 *
 * @requires Authentication
 */
export async function GET(
  req: AuthenticatedRequest & { query: ListQuotesQuery },
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
    res.status(200).json({
      quotes: [],
      count: 0,
    });
    return;
  }

  const companyId = customer.company.id;
  const quoteService: QuoteModuleService = req.scope.resolve(B2B_QUOTE_MODULE);

  const { status, limit = 50, offset = 0 } = req.query;

  const quotes = await quoteService.getCompanyQuotes(companyId, {
    status: status as QuoteStatus | QuoteStatus[] | undefined,
    skip: Number(offset),
    take: Number(limit),
  });

  // Get total count
  const allQuotes = await quoteService.getCompanyQuotes(companyId, {
    status: status as QuoteStatus | QuoteStatus[] | undefined,
  });

  res.status(200).json({
    quotes,
    count: allQuotes.length,
    limit: Number(limit),
    offset: Number(offset),
  });
}

/**
 * Create quote request body
 */
interface CreateQuoteBody {
  title?: string;
  notes?: string;
  region_id?: string;
  sales_channel_id?: string;
  cart_id?: string;
  valid_days?: number;
  terms?: {
    payment_terms?: { type: string; days: number };
    delivery_terms?: string;
    shipping_method?: string;
  };
  items?: {
    variant_id: string;
    product_id?: string;
    title: string;
    variant_title?: string;
    sku?: string;
    quantity: number;
    original_unit_price: number;
    requested_unit_price?: number;
    currency_code?: string;
    notes?: string;
  }[];
}

/**
 * POST /store/b2b/quotes
 *
 * Creates a new quote for the authenticated customer's company.
 *
 * @requires Authentication
 */
export async function POST(
  req: AuthenticatedRequest & { body: CreateQuoteBody },
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
      "Customer must belong to a company to create quotes"
    );
  }

  const companyId = customer.company.id;
  const body = req.body;

  // Validate items if provided
  if (body.items && body.items.length > 0) {
    for (const item of body.items) {
      if (!item.variant_id || !item.title || !item.quantity || !item.original_unit_price) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Each item requires variant_id, title, quantity, and original_unit_price"
        );
      }
    }
  }

  const quoteService: QuoteModuleService = req.scope.resolve(B2B_QUOTE_MODULE);

  const input: CreateQuoteInput = {
    companyId,
    requesterId: customerId,
    title: body.title,
    notes: body.notes,
    regionId: body.region_id,
    salesChannelId: body.sales_channel_id,
    cartId: body.cart_id,
    validDays: body.valid_days,
    terms: body.terms,
    items: body.items?.map((item): CreateQuoteItemInput => ({
      variantId: item.variant_id,
      productId: item.product_id,
      title: item.title,
      variantTitle: item.variant_title,
      sku: item.sku,
      quantity: item.quantity,
      originalUnitPrice: item.original_unit_price,
      requestedUnitPrice: item.requested_unit_price,
      currencyCode: item.currency_code,
      notes: item.notes,
    })),
  };

  const quote = await quoteService.createQuote(input);

  res.status(201).json({
    quote,
  });
}
