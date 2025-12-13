/**
 * Search Utilities for Jewelry E-commerce App
 *
 * This module provides comprehensive search functionality including:
 * - Fuzzy matching algorithms
 * - Search result ranking and scoring
 * - Filter application logic
 * - Sort functions
 * - Query normalization (accents, case)
 */

import type { Product, Category } from '@bijoux/types';
import type { SearchFilters, SearchSortOption, AvailableFilters, FilterOption } from './api';

// ============================================
// Types
// ============================================

/**
 * Product with relevance score for ranking
 */
export interface ScoredProduct {
  readonly product: Product;
  readonly score: number;
}

/**
 * Weight configuration for different searchable fields
 */
interface SearchFieldWeights {
  readonly name: number;
  readonly nameExact: number;
  readonly reference: number;
  readonly referenceExact: number;
  readonly description: number;
  readonly collection: number;
  readonly materials: number;
  readonly brand: number;
  readonly ean: number;
}

// Search field weights for relevance scoring
const SEARCH_WEIGHTS: SearchFieldWeights = {
  nameExact: 100,      // Exact name match
  name: 50,            // Partial name match
  referenceExact: 90,  // Exact reference match
  reference: 40,       // Partial reference match
  ean: 85,             // EAN/barcode match
  collection: 30,      // Collection match
  brand: 25,           // Brand match
  materials: 20,       // Materials match
  description: 10,     // Description match
};

// ============================================
// Query Normalization
// ============================================

/**
 * Map of accented characters to their normalized equivalents.
 * Handles French, Spanish, Portuguese, and other Latin-based diacritics.
 */
const ACCENT_MAP: Readonly<Record<string, string>> = {
  'a': 'aeaaaaaa',
  'c': 'c',
  'e': 'eeee',
  'i': 'iiii',
  'n': 'n',
  'o': 'ooooooo',
  'u': 'uuuu',
  'y': 'yy',
} as const;

/**
 * Removes diacritical marks (accents) from a string.
 * Handles common French jewelry terms like "bague", "chaîne", "collier".
 *
 * @param text - Text to normalize
 * @returns Text with accents removed
 *
 * @example
 * removeAccents('chaîne') // 'chaine'
 * removeAccents('bijoux precieux') // 'bijoux precieux'
 */
export function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normalizes a search query for consistent matching.
 * - Converts to lowercase
 * - Removes accents/diacritics
 * - Trims whitespace
 * - Collapses multiple spaces
 *
 * @param query - Raw search query
 * @returns Normalized query string
 *
 * @example
 * normalizeSearchQuery('  Bague OR  ') // 'bague or'
 * normalizeSearchQuery('Chaîne Argent') // 'chaine argent'
 */
export function normalizeSearchQuery(query: string): string {
  if (!query) return '';

  return removeAccents(query)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Tokenizes a query into individual search terms.
 * Filters out common stop words in French.
 *
 * @param query - Normalized query string
 * @returns Array of search tokens
 */
export function tokenizeQuery(query: string): readonly string[] {
  const stopWords = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou',
    'en', 'pour', 'avec', 'sans', 'dans', 'sur', 'a', 'au', 'aux',
    'the', 'a', 'an', 'and', 'or', 'in', 'on', 'for', 'with', 'to',
  ]);

  return query
    .split(' ')
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

// ============================================
// Fuzzy Matching
// ============================================

/**
 * Calculates the Levenshtein distance between two strings.
 * Used for fuzzy matching to handle typos and misspellings.
 *
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Edit distance between the strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;

  // Create distance matrix
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0)
  );

  // Initialize base cases
  for (let i = 0; i <= m; i++) {
    dp[i]![0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0]![j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,      // Deletion
        dp[i]![j - 1]! + 1,      // Insertion
        dp[i - 1]![j - 1]! + cost // Substitution
      );
    }
  }

  return dp[m]![n]!;
}

/**
 * Calculates a fuzzy match score between two strings.
 * Returns a value between 0 (no match) and 1 (exact match).
 *
 * @param text - Text to search in
 * @param query - Query to search for
 * @returns Match score between 0 and 1
 *
 * @example
 * fuzzyMatch('bague or', 'bague') // ~0.9
 * fuzzyMatch('collier', 'colier') // ~0.85 (typo tolerance)
 */
export function fuzzyMatch(text: string, query: string): number {
  if (!text || !query) return 0;

  const normalizedText = normalizeSearchQuery(text);
  const normalizedQuery = normalizeSearchQuery(query);

  // Exact match
  if (normalizedText === normalizedQuery) return 1;

  // Contains match (higher score for start matches)
  if (normalizedText.includes(normalizedQuery)) {
    const startsWithBonus = normalizedText.startsWith(normalizedQuery) ? 0.1 : 0;
    return 0.8 + startsWithBonus;
  }

  // Fuzzy match using Levenshtein distance
  const distance = levenshteinDistance(normalizedText, normalizedQuery);
  const maxLength = Math.max(normalizedText.length, normalizedQuery.length);

  if (maxLength === 0) return 1;

  const similarity = 1 - distance / maxLength;

  // Apply threshold - don't return very low scores
  return similarity > 0.5 ? similarity : 0;
}

/**
 * Checks if any token in the query matches the text.
 * Returns the best match score.
 *
 * @param text - Text to search in
 * @param queryTokens - Array of query tokens
 * @returns Best match score
 */
export function matchTokens(text: string, queryTokens: readonly string[]): number {
  if (!text || queryTokens.length === 0) return 0;

  const normalizedText = normalizeSearchQuery(text);
  let bestScore = 0;
  let matchCount = 0;

  for (const token of queryTokens) {
    const score = fuzzyMatch(normalizedText, token);
    if (score > 0.5) {
      matchCount++;
      bestScore = Math.max(bestScore, score);
    }
  }

  // Bonus for matching multiple tokens
  const multiMatchBonus = matchCount > 1 ? 0.1 * (matchCount - 1) : 0;

  return Math.min(1, bestScore + multiMatchBonus);
}

// ============================================
// Relevance Scoring
// ============================================

/**
 * Calculates the relevance score for a product based on the search query.
 * Higher scores indicate better matches.
 *
 * Scoring factors:
 * - Exact name match (highest weight)
 * - Partial name match
 * - Reference/SKU match
 * - Collection match
 * - Materials match
 * - Description match
 *
 * @param product - Product to score
 * @param query - Normalized search query
 * @returns Relevance score (0 = no match)
 */
export function calculateRelevanceScore(product: Product, query: string): number {
  if (!query || query.length === 0) return 0;

  const tokens = tokenizeQuery(query);
  let totalScore = 0;

  // Name matching (highest priority)
  const normalizedName = normalizeSearchQuery(product.name);
  const nameEnNormalized = product.nameEn ? normalizeSearchQuery(product.nameEn) : '';

  // Exact name match
  if (normalizedName === query || nameEnNormalized === query) {
    totalScore += SEARCH_WEIGHTS.nameExact;
  } else {
    // Partial name match
    const nameScore = Math.max(
      fuzzyMatch(normalizedName, query),
      matchTokens(normalizedName, tokens),
      nameEnNormalized ? fuzzyMatch(nameEnNormalized, query) : 0
    );
    totalScore += nameScore * SEARCH_WEIGHTS.name;
  }

  // Reference matching
  const normalizedRef = normalizeSearchQuery(product.reference);
  if (normalizedRef === query) {
    totalScore += SEARCH_WEIGHTS.referenceExact;
  } else if (normalizedRef.includes(query) || query.includes(normalizedRef)) {
    totalScore += fuzzyMatch(normalizedRef, query) * SEARCH_WEIGHTS.reference;
  }

  // EAN/Barcode matching
  if (product.ean) {
    const normalizedEan = normalizeSearchQuery(product.ean);
    if (normalizedEan === query || normalizedEan.includes(query)) {
      totalScore += SEARCH_WEIGHTS.ean;
    }
  }

  // Collection matching
  if (product.collection) {
    const collectionScore = matchTokens(product.collection, tokens);
    totalScore += collectionScore * SEARCH_WEIGHTS.collection;
  }

  // Brand matching
  if (product.brand) {
    const brandScore = matchTokens(product.brand, tokens);
    totalScore += brandScore * SEARCH_WEIGHTS.brand;
  }

  // Materials matching
  if (product.materials && product.materials.length > 0) {
    let materialsScore = 0;
    for (const material of product.materials) {
      materialsScore = Math.max(materialsScore, matchTokens(material, tokens));
    }
    totalScore += materialsScore * SEARCH_WEIGHTS.materials;
  }

  // Description matching (lowest priority)
  const descriptionScore = matchTokens(product.description, tokens);
  totalScore += descriptionScore * SEARCH_WEIGHTS.description;

  // Boost for available products
  if (product.isAvailable) {
    totalScore *= 1.1;
  }

  // Boost for featured products (slight)
  if (product.featured) {
    totalScore *= 1.05;
  }

  return totalScore;
}

// ============================================
// Filter Application
// ============================================

/**
 * Applies search filters to a list of products.
 *
 * @param products - Products to filter
 * @param filters - Filter criteria
 * @returns Filtered products
 */
export function applyFilters(
  products: readonly Product[],
  filters: SearchFilters
): Product[] {
  let filtered = [...products];

  // Category filter
  if (filters.categories && filters.categories.length > 0) {
    const categorySet = new Set(filters.categories);
    filtered = filtered.filter((p) => categorySet.has(p.categoryId));
  }

  // Collection filter
  if (filters.collections && filters.collections.length > 0) {
    const collectionSet = new Set(
      filters.collections.map((c) => normalizeSearchQuery(c))
    );
    filtered = filtered.filter(
      (p) => p.collection && collectionSet.has(normalizeSearchQuery(p.collection))
    );
  }

  // Materials filter
  if (filters.materials && filters.materials.length > 0) {
    const materialSet = new Set(
      filters.materials.map((m) => normalizeSearchQuery(m))
    );
    filtered = filtered.filter((p) =>
      p.materials.some((m) => materialSet.has(normalizeSearchQuery(m)))
    );
  }

  // Brand filter
  if (filters.brands && filters.brands.length > 0) {
    const brandSet = new Set(
      filters.brands.map((b) => normalizeSearchQuery(b))
    );
    filtered = filtered.filter(
      (p) => p.brand && brandSet.has(normalizeSearchQuery(p.brand))
    );
  }

  // Price range filter
  if (filters.priceRange) {
    const { min, max } = filters.priceRange;
    if (min !== undefined) {
      filtered = filtered.filter((p) => p.price >= min);
    }
    if (max !== undefined) {
      filtered = filtered.filter((p) => p.price <= max);
    }
  }

  // In stock filter
  if (filters.inStock === true) {
    filtered = filtered.filter((p) => p.isAvailable && p.stock > 0);
  }

  // New products filter
  if (filters.isNew === true) {
    filtered = filtered.filter((p) => p.isNew);
  }

  // Featured products filter
  if (filters.isFeatured === true) {
    filtered = filtered.filter((p) => p.featured);
  }

  return filtered;
}

// ============================================
// Sorting
// ============================================

/**
 * Sorts scored products by the specified sort option.
 *
 * @param scoredProducts - Products with relevance scores
 * @param sortOption - Sort criteria
 * @returns Sorted products (scores removed)
 */
export function sortProducts(
  scoredProducts: readonly ScoredProduct[],
  sortOption: SearchSortOption
): Product[] {
  const sorted = [...scoredProducts];

  switch (sortOption) {
    case 'relevance':
      // Sort by score descending, then by name ascending for ties
      sorted.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.product.name.localeCompare(b.product.name);
      });
      break;

    case 'price-asc':
      sorted.sort((a, b) => a.product.price - b.product.price);
      break;

    case 'price-desc':
      sorted.sort((a, b) => b.product.price - a.product.price);
      break;

    case 'newest':
      sorted.sort((a, b) => {
        const dateA = new Date(a.product.createdAt).getTime();
        const dateB = new Date(b.product.createdAt).getTime();
        return dateB - dateA;
      });
      break;

    case 'name-asc':
      sorted.sort((a, b) => a.product.name.localeCompare(b.product.name, 'fr'));
      break;

    case 'name-desc':
      sorted.sort((a, b) => b.product.name.localeCompare(a.product.name, 'fr'));
      break;

    default:
      // Default to relevance
      sorted.sort((a, b) => b.score - a.score);
  }

  return sorted.map((item) => item.product);
}

/**
 * Simple product sort without scores (for non-search listings).
 *
 * @param products - Products to sort
 * @param sortOption - Sort criteria
 * @returns Sorted products
 */
export function sortProductsSimple(
  products: readonly Product[],
  sortOption: SearchSortOption
): Product[] {
  const scoredProducts = products.map((product) => ({ product, score: 0 }));
  return sortProducts(scoredProducts, sortOption);
}

// ============================================
// Filter Extraction
// ============================================

/**
 * Extracts available filter options from a set of products.
 * Useful for building dynamic filter UIs.
 *
 * @param products - Products to extract filters from
 * @param categories - All available categories (for name lookup)
 * @returns Available filter options with counts
 */
export function extractAvailableFilters(
  products: readonly Product[],
  categories: readonly Category[]
): AvailableFilters {
  // Create category lookup map
  const categoryMap = new Map<string, Category>();
  for (const category of categories) {
    categoryMap.set(category.id, category);
  }

  // Count occurrences of each filter value
  const categoryCounts = new Map<string, number>();
  const collectionCounts = new Map<string, number>();
  const materialCounts = new Map<string, number>();
  const brandCounts = new Map<string, number>();

  let minPrice = Infinity;
  let maxPrice = -Infinity;

  for (const product of products) {
    // Category
    const existingCatCount = categoryCounts.get(product.categoryId) ?? 0;
    categoryCounts.set(product.categoryId, existingCatCount + 1);

    // Collection
    if (product.collection) {
      const existingColCount = collectionCounts.get(product.collection) ?? 0;
      collectionCounts.set(product.collection, existingColCount + 1);
    }

    // Materials
    for (const material of product.materials) {
      const existingMatCount = materialCounts.get(material) ?? 0;
      materialCounts.set(material, existingMatCount + 1);
    }

    // Brand
    if (product.brand) {
      const existingBrandCount = brandCounts.get(product.brand) ?? 0;
      brandCounts.set(product.brand, existingBrandCount + 1);
    }

    // Price range
    if (product.price < minPrice) minPrice = product.price;
    if (product.price > maxPrice) maxPrice = product.price;
  }

  // Convert to filter options
  const categoryOptions: FilterOption[] = Array.from(categoryCounts.entries())
    .map(([id, count]) => {
      const category = categoryMap.get(id);
      return {
        value: id,
        label: category?.name ?? id,
        count,
      };
    })
    .sort((a, b) => b.count - a.count);

  const collectionOptions: FilterOption[] = Array.from(collectionCounts.entries())
    .map(([value, count]) => ({
      value,
      label: value,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const materialOptions: FilterOption[] = Array.from(materialCounts.entries())
    .map(([value, count]) => ({
      value,
      label: value,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const brandOptions: FilterOption[] = Array.from(brandCounts.entries())
    .map(([value, count]) => ({
      value,
      label: value,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    categories: categoryOptions,
    collections: collectionOptions,
    materials: materialOptions,
    brands: brandOptions,
    priceRange: {
      min: minPrice === Infinity ? undefined : minPrice,
      max: maxPrice === -Infinity ? undefined : maxPrice,
    },
  };
}

// ============================================
// Utility Functions
// ============================================

/**
 * Highlights matching text in a string for display.
 *
 * @param text - Original text
 * @param query - Search query to highlight
 * @returns Object with parts array for rendering
 */
export function highlightMatch(
  text: string,
  query: string
): { parts: Array<{ text: string; highlight: boolean }> } {
  if (!query || !text) {
    return { parts: [{ text, highlight: false }] };
  }

  const normalizedText = text.toLowerCase();
  const normalizedQuery = normalizeSearchQuery(query);
  const parts: Array<{ text: string; highlight: boolean }> = [];

  let lastIndex = 0;
  let index = normalizedText.indexOf(normalizedQuery);

  while (index !== -1) {
    // Add non-matching part before
    if (index > lastIndex) {
      parts.push({
        text: text.slice(lastIndex, index),
        highlight: false,
      });
    }

    // Add matching part
    parts.push({
      text: text.slice(index, index + normalizedQuery.length),
      highlight: true,
    });

    lastIndex = index + normalizedQuery.length;
    index = normalizedText.indexOf(normalizedQuery, lastIndex);
  }

  // Add remaining non-matching part
  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
      highlight: false,
    });
  }

  return { parts: parts.length > 0 ? parts : [{ text, highlight: false }] };
}

/**
 * Generates search suggestions based on product data.
 *
 * @param products - Products to generate suggestions from
 * @param limit - Maximum number of suggestions
 * @returns Array of suggested search terms
 */
export function generateSearchSuggestions(
  products: readonly Product[],
  limit: number = 10
): string[] {
  const suggestions = new Set<string>();

  // Extract unique collections
  for (const product of products) {
    if (product.collection && suggestions.size < limit) {
      suggestions.add(product.collection);
    }
  }

  // Extract unique brands
  for (const product of products) {
    if (product.brand && suggestions.size < limit) {
      suggestions.add(product.brand);
    }
  }

  // Extract unique materials
  for (const product of products) {
    for (const material of product.materials) {
      if (suggestions.size < limit) {
        suggestions.add(material);
      }
    }
  }

  return Array.from(suggestions).slice(0, limit);
}
