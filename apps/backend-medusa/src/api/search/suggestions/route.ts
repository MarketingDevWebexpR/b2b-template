/**
 * Public Search Suggestions API
 *
 * Fast autocomplete suggestions for search-as-you-type functionality.
 * No authentication required.
 *
 * GET /search/suggestions?q=query&limit=8
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { SEARCH_MODULE } from "../../../modules/search";
import type SearchModuleService from "../../../modules/search/service";

interface SuggestionsQuery {
  q?: string;
  limit?: string;
}

/**
 * GET /search/suggestions
 *
 * Get quick search suggestions for autocomplete.
 * Returns product titles matching the query prefix.
 */
export async function GET(
  req: MedusaRequest & { query: SuggestionsQuery },
  res: MedusaResponse
): Promise<void> {
  const searchService: SearchModuleService = req.scope.resolve(SEARCH_MODULE);
  const logger = req.scope.resolve("logger");

  const { q = "", limit = "8" } = req.query;

  if (!q || q.length < 2) {
    res.status(200).json({
      query: q,
      suggestions: [],
    });
    return;
  }

  const parsedLimit = Math.min(parseInt(limit, 10) || 8, 20);

  try {
    // Use the dedicated getProductSuggestions method
    const result = await searchService.getProductSuggestions(q, parsedLimit);

    res.status(200).json(result);
  } catch (error) {
    logger.error("[Search Suggestions] Error:", error instanceof Error ? error : undefined);

    res.status(200).json({
      query: q,
      suggestions: [],
    });
  }
}
