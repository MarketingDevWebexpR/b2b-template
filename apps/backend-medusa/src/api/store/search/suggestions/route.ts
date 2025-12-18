/**
 * Store Search Suggestions API
 *
 * Fast autocomplete suggestions for instant search.
 * Optimized for <100ms response times.
 *
 * GET /store/search/suggestions?q=query - Get search suggestions
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { SEARCH_MODULE } from "../../../../modules/search";
import type SearchModuleService from "../../../../modules/search/service";

interface SuggestionsQuery {
  q?: string;
  limit?: string;
}

/**
 * GET /store/search/suggestions
 *
 * Returns fast autocomplete suggestions.
 * Optimized for instant search UI components.
 *
 * @public
 */
export async function GET(
  req: MedusaRequest & { query: SuggestionsQuery },
  res: MedusaResponse
): Promise<void> {
  const searchService: SearchModuleService = req.scope.resolve(SEARCH_MODULE);
  const logger = req.scope.resolve("logger");

  const { q = "", limit = "8" } = req.query;

  // Return empty for very short queries
  if (q.length < 2) {
    res.status(200).json({
      query: q,
      suggestions: [],
    });
    return;
  }

  const parsedLimit = Math.min(parseInt(limit, 10) || 8, 20);

  try {
    const result = await searchService.getProductSuggestions(q, parsedLimit);

    res.status(200).json({
      query: result.query,
      suggestions: result.suggestions,
    });
  } catch (error) {
    logger.error("[Search Suggestions] Error:", error instanceof Error ? error : undefined);

    res.status(200).json({
      query: q,
      suggestions: [],
    });
  }
}
