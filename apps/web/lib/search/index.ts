/**
 * Search Library
 *
 * Exports for the Medusa search integration.
 *
 * @packageDocumentation
 */

// Client
export {
  MedusaSearchClient,
  createMedusaSearchClient,
  getMedusaSearchClient,
  type MedusaSearchConfig,
  type ProductSearchResult,
  type CategorySearchResult,
  type SearchOptions,
  type ProductSearchResponse,
  type CategorySearchResponse,
  type MultiSearchResponse,
  type SuggestionsResponse,
  type CategorySuggestion,
  type CategorySuggestionsResponse,
  type SearchResponse,
} from './medusa-search-client';

// Adapter
export {
  MedusaSearchAdapter,
  getMedusaSearchAdapter,
  productToSuggestion,
  categoryToSuggestion,
  adaptFacetDistribution,
  buildCategoryTree,
  type AdaptedSearchResult,
  type SearchFilters,
} from './medusa-search-adapter';
