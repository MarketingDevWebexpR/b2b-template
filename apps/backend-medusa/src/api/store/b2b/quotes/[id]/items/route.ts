/**
 * Store B2B Quote Items API Routes
 *
 * GET /store/b2b/quotes/:id/items - Get quote items
 * POST /store/b2b/quotes/:id/items - Add an item
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
 * GET /store/b2b/quotes/:id/items
 *
 * Returns items for a quote.
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

    const items = await quoteService.listQuoteItems({
      filters: { quote_id: quoteId },
    });

    res.status(200).json({
      items,
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
 * Add item request body
 *
 * Note: original_unit_price is intentionally NOT accepted from client.
 * The server fetches the actual price from the catalog to prevent price manipulation.
 */
interface AddItemBody {
  variant_id: string;
  product_id?: string;
  title?: string;
  variant_title?: string;
  sku?: string;
  quantity: number;
  /** Client's requested/negotiated price - this is the price they want to pay */
  requested_unit_price?: number;
  currency_code?: string;
  notes?: string;
}

/**
 * POST /store/b2b/quotes/:id/items
 *
 * Adds an item to a draft quote.
 *
 * @requires Authentication
 */
export async function POST(
  req: AuthenticatedRequest & { body: AddItemBody },
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

  // Validate required fields
  if (!body.variant_id || !body.quantity) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "variant_id and quantity are required"
    );
  }

  if (body.quantity <= 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "quantity must be a positive number"
    );
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  // SECURITY: Fetch variant from catalog to verify it exists and get the actual price
  // This prevents price manipulation attacks where clients submit fake original_unit_price
  const { data: variants } = await query.graph({
    entity: "variant",
    fields: [
      "id",
      "title",
      "sku",
      "calculated_price.calculated_amount",
      "calculated_price.currency_code",
      "product.id",
      "product.title",
    ],
    filters: {
      id: body.variant_id,
    },
  });

  const variant = variants[0];

  if (!variant) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Variant with id "${body.variant_id}" not found`
    );
  }

  // Extract the server-verified price from the catalog
  const serverVerifiedPrice = variant.calculated_price?.calculated_amount;

  if (serverVerifiedPrice === undefined || serverVerifiedPrice === null) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Variant "${body.variant_id}" does not have a valid price configured`
    );
  }

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

    // Can only add items to draft quotes
    if (quote.status !== "draft") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Can only add items to draft quotes"
      );
    }

    // Get current item count for sort order
    const existingItems = await quoteService.listQuoteItems({
      filters: { quote_id: quoteId },
      select: ["id"],
    });

    // Use server-fetched data for product info and price
    // Client can override title/sku if needed, but price comes from server
    const productTitle = variant.product?.title || body.title || "Unknown Product";
    const variantTitle = body.variant_title || variant.title;
    const sku = body.sku || variant.sku;
    const productId = variant.product?.id || body.product_id;
    const currencyCode = body.currency_code || variant.calculated_price?.currency_code;

    const item = await quoteService.addQuoteItem(quoteId, {
      variantId: body.variant_id,
      productId,
      title: productTitle,
      variantTitle,
      sku,
      quantity: body.quantity,
      // SECURITY: Use server-verified price, NOT client-supplied value
      originalUnitPrice: serverVerifiedPrice,
      // Client can request a different price for negotiation purposes
      requestedUnitPrice: body.requested_unit_price,
      currencyCode,
      notes: body.notes,
      sortOrder: existingItems.length,
    });

    // Recalculate totals
    await quoteService.recalculateQuoteTotals(quoteId);

    // Record history with server-verified price for audit trail
    await quoteService.recordHistory({
      quoteId,
      eventType: "item_added",
      actorType: "customer",
      actorId: customerId,
      description: `Item "${productTitle}" added`,
      newValues: {
        variant_id: body.variant_id,
        quantity: body.quantity,
        original_unit_price: serverVerifiedPrice,
        requested_unit_price: body.requested_unit_price,
      },
      relatedEntityType: "quote_item",
      relatedEntityId: item.id,
    });

    res.status(201).json({
      item,
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
