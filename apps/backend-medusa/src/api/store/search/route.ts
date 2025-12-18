/**
 * Store Search API Routes
 *
 * Public search endpoints for the storefront.
 * Provides fast, typo-tolerant search with faceting for B2B e-commerce.
 *
 * GET /store/search - Search products and categories
 * GET /store/search?type=products - Search products only
 * GET /store/search?type=categories - Search categories only
 * GET /store/search?q=query&facets=true - Search with facet distribution
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { SEARCH_MODULE } from "../../../modules/search";
import type SearchModuleService from "../../../modules/search/service";

/**
 * Query parameters for search
 */
interface SearchQuery {
  /** Search query string */
  q?: string;
  /** Search type: 'all', 'products', 'categories' */
  type?: "all" | "products" | "categories";
  /** Maximum results per type */
  limit?: string;
  /** Pagination offset */
  offset?: string;
  /** Include facet distribution */
  facets?: string;
  /** Filter by category handle or ID */
  category?: string;
  /** Filter by brand */
  brand?: string;
  /** Filter by material */
  material?: string;
  /** Filter by tags (comma-separated) */
  tags?: string;
  /** Filter by availability */
  in_stock?: string;
  /** Min price filter */
  price_min?: string;
  /** Max price filter */
  price_max?: string;
  /** Sort field */
  sort?: string;
  /** Sort order */
  order?: "asc" | "desc";
}

/**
 * GET /store/search
 *
 * Search across products and categories.
 * Returns results optimized for instant search and product listing.
 *
 * @public
 */
export async function GET(
  req: MedusaRequest & { query: SearchQuery },
  res: MedusaResponse
): Promise<void> {
  const searchService: SearchModuleService = req.scope.resolve(SEARCH_MODULE);
  const logger = req.scope.resolve("logger");

  const {
    q = "",
    type = "all",
    limit = "20",
    offset = "0",
    facets = "false",
    category,
    brand,
    material,
    tags,
    in_stock,
    price_min,
    price_max,
    sort,
    order = "asc",
  } = req.query;

  const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);
  const parsedOffset = parseInt(offset, 10) || 0;
  const includeFacets = facets === "true" || facets === "1";

  try {
    // Build filters array for Meilisearch
    const filters: string[] = [];

    if (category) {
      // Support both handle and ID
      if (category.startsWith("cat_")) {
        filters.push(`categories.id = "${category}"`);
      } else {
        filters.push(`categories.handle = "${category}"`);
      }
    }

    if (brand) {
      filters.push(`brand = "${brand}"`);
    }

    if (material) {
      filters.push(`material = "${material}"`);
    }

    if (tags) {
      const tagList = tags.split(",").map((t) => t.trim());
      const tagFilters = tagList.map((t) => `tags = "${t}"`).join(" OR ");
      if (tagFilters) {
        filters.push(`(${tagFilters})`);
      }
    }

    if (in_stock === "true" || in_stock === "1") {
      filters.push("has_stock = true");
    }

    // Always filter to available products
    filters.push("is_available = true");

    if (price_min) {
      const minPrice = parseInt(price_min, 10);
      if (!isNaN(minPrice)) {
        filters.push(`price_min >= ${minPrice}`);
      }
    }

    if (price_max) {
      const maxPrice = parseInt(price_max, 10);
      if (!isNaN(maxPrice)) {
        filters.push(`price_max <= ${maxPrice}`);
      }
    }

    // Build sort array
    const sortOptions: string[] = [];
    if (sort) {
      const sortField = sort;
      const sortOrder = order === "desc" ? "desc" : "asc";
      sortOptions.push(`${sortField}:${sortOrder}`);
    }

    // Define facets for product search
    const productFacets = includeFacets
      ? ["categories.name", "brand", "material", "tags", "has_stock"]
      : undefined;

    if (type === "products") {
      // Search products only
      const result = await searchService.searchProducts(q, {
        limit: parsedLimit,
        offset: parsedOffset,
        filters: filters.length > 0 ? filters : undefined,
        facets: productFacets,
        sort: sortOptions.length > 0 ? sortOptions : undefined,
      });

      res.status(200).json({
        query: q,
        type: "products",
        hits: result.hits.map((hit) => hit.document),
        total: result.totalHits,
        limit: parsedLimit,
        offset: parsedOffset,
        processingTimeMs: result.processingTimeMs,
        facetDistribution: result.facetDistribution,
      });
      return;
    }

    if (type === "categories") {
      // Search categories only
      const result = await searchService.searchCategories(q, {
        limit: parsedLimit,
        offset: parsedOffset,
        filters: ["is_active = true"],
      });

      res.status(200).json({
        query: q,
        type: "categories",
        hits: result.hits.map((hit) => hit.document),
        total: result.totalHits,
        limit: parsedLimit,
        offset: parsedOffset,
        processingTimeMs: result.processingTimeMs,
      });
      return;
    }

    // Multi-search: products + categories
    const results = await searchService.searchAll(q, {
      products: parsedLimit,
      categories: 5,
    });

    res.status(200).json({
      query: q,
      type: "all",
      products: {
        hits: results.products.hits.map((hit) => hit.document),
        total: results.products.totalHits,
        processingTimeMs: results.products.processingTimeMs,
      },
      categories: {
        hits: results.categories.hits.map((hit) => hit.document),
        total: results.categories.totalHits,
        processingTimeMs: results.categories.processingTimeMs,
      },
    });
  } catch (error) {
    logger.error("[Search API] Search error:", error instanceof Error ? error : undefined);

    // Return empty results on error to not break the UI
    res.status(200).json({
      query: q,
      type,
      hits: [],
      total: 0,
      limit: parsedLimit,
      offset: parsedOffset,
      error: "Search temporarily unavailable",
    });
  }
}
