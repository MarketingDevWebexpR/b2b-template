/**
 * Admin B2B Quotes API Routes
 *
 * Provides admin endpoints for quote management.
 *
 * GET /admin/b2b/quotes - List all quotes
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type QuoteModuleService from "../../../../modules/b2b-quote/service";
import type { QuoteStatus } from "../../../../modules/b2b-quote/models";
const B2B_QUOTE_MODULE = "b2bQuoteService";
const B2B_APPROVAL_MODULE = "b2bApprovalWorkflowService";
const B2B_SPENDING_MODULE = "b2bSpendingLimitService";
const B2B_COMPANY_MODULE = "b2bCompanyService";

/**
 * Query parameters for quote listing
 */
interface ListQuotesQuery {
  company_id?: string;
  status?: QuoteStatus | QuoteStatus[];
  assigned_to_id?: string;
  requester_id?: string;
  pending_only?: string;
  limit?: number;
  offset?: number;
}

/**
 * GET /admin/b2b/quotes
 *
 * Lists quotes with optional filtering.
 */
export async function GET(
  req: MedusaRequest<object, ListQuotesQuery>,
  res: MedusaResponse
): Promise<void> {
  const quoteService: QuoteModuleService = req.scope.resolve(B2B_QUOTE_MODULE);

  const {
    company_id,
    status,
    assigned_to_id,
    requester_id,
    pending_only,
    limit = 50,
    offset = 0,
  } = req.query;

  // If pending_only is requested, use the specialized method
  if (pending_only === "true") {
    const quotes = await quoteService.getPendingQuotes({
      assignedToId: assigned_to_id as string | undefined,
      skip: Number(offset),
      take: Number(limit),
    });

    const allPending = await quoteService.getPendingQuotes({
      assignedToId: assigned_to_id as string | undefined,
    });

    res.status(200).json({
      quotes,
      count: allPending.length,
      limit: Number(limit),
      offset: Number(offset),
    });
    return;
  }

  // Build filters
  const filters: Record<string, unknown> = {};

  if (company_id) {
    filters.company_id = company_id;
  }

  if (status) {
    filters.status = Array.isArray(status) ? { $in: status } : status;
  }

  if (assigned_to_id) {
    filters.assigned_to_id = assigned_to_id;
  }

  if (requester_id) {
    filters.requester_id = requester_id;
  }

  const [quotes, count] = await Promise.all([
    quoteService.listQuotes(filters, {
      skip: Number(offset),
      take: Number(limit),
    }),
    quoteService.listQuotes(filters, {
      select: ["id"],
    }).then((list) => list.length),
  ]);

  res.status(200).json({
    quotes,
    count,
    limit: Number(limit),
    offset: Number(offset),
  });
}
