/**
 * Facet Transformers for App Search v3
 *
 * Utility functions to transform API facet responses into frontend format.
 * Supports hierarchical category facets (category_lvl0-4) and boolean string facets.
 *
 * @packageDocumentation
 */

import type {
  HierarchicalCategoryFacets,
  HierarchicalFacetValue,
  Facet,
  FacetValue,
} from '@/contexts/SearchContext';

/**
 * Facet distribution from API response
 * Maps field names to value->count dictionaries
 */
export type FacetDistribution = Record<string, Record<string, number>>;

// ============================================================================
// Types
// ============================================================================

/**
 * Stock filter options derived from has_stock and is_available facets
 */
export interface StockFacetCounts {
  /** Count of products with has_stock="true" */
  inStock: number;
  /** Count of products with has_stock="false" */
  outOfStock: number;
  /** Count of products with is_available="true" */
  available: number;
  /** Count of products with is_available="false" */
  unavailable: number;
}

// ============================================================================
// Hierarchical Category Transformers
// ============================================================================

/**
 * Transform API facet distribution to HierarchicalCategoryFacets format
 *
 * Converts:
 * ```json
 * {
 *   "category_lvl0": { "Plomberie": 150, "Electricite": 200 },
 *   "category_lvl1": { "Plomberie > Robinetterie": 80, "Electricite > LED": 100 }
 * }
 * ```
 *
 * To:
 * ```json
 * {
 *   "category_lvl0": [
 *     { "label": "Plomberie", "value": "Plomberie", "count": 150, ... },
 *     { "label": "Electricite", "value": "Electricite", "count": 200, ... }
 *   ],
 *   "category_lvl1": [
 *     { "label": "Robinetterie", "value": "Plomberie > Robinetterie", "count": 80, ... }
 *   ]
 * }
 * ```
 */
export function transformHierarchicalCategoryFacets(
  facetDistribution: FacetDistribution | undefined,
  selectedPath?: string
): HierarchicalCategoryFacets {
  const emptyFacets: HierarchicalCategoryFacets = {
    category_lvl0: [],
    category_lvl1: [],
    category_lvl2: [],
    category_lvl3: [],
    category_lvl4: [],
  };

  if (!facetDistribution) {
    return emptyFacets;
  }

  const levels: (keyof HierarchicalCategoryFacets)[] = [
    'category_lvl0',
    'category_lvl1',
    'category_lvl2',
    'category_lvl3',
    'category_lvl4',
  ];

  const result: HierarchicalCategoryFacets = { ...emptyFacets };

  for (let level = 0; level < levels.length; level++) {
    const levelKey = levels[level];
    const levelData = facetDistribution[levelKey];

    if (!levelData) {
      result[levelKey] = [];
      continue;
    }

    result[levelKey] = Object.entries(levelData)
      .map(([value, count]): HierarchicalFacetValue => {
        // Parse path segments from "Parent > Child > Grandchild" format
        const pathSegments = value.split(' > ').map((s) => s.trim());
        // Label is the last segment (the current category name)
        const label = pathSegments[pathSegments.length - 1];

        return {
          label,
          value,
          count,
          isSelected: selectedPath === value,
          path: pathSegments,
          level,
        };
      })
      .sort((a, b) => {
        // Sort by count descending, then by label alphabetically
        if (b.count !== a.count) return b.count - a.count;
        return a.label.localeCompare(b.label, 'fr');
      });
  }

  return result;
}

/**
 * Get visible categories for a given hierarchy level and current path
 *
 * @param facets - The hierarchical category facets
 * @param currentPath - Current selected path (e.g., "Plomberie > Robinetterie")
 * @returns Array of category facet values to display
 */
export function getVisibleCategoriesForLevel(
  facets: HierarchicalCategoryFacets,
  currentPath: string | undefined
): HierarchicalFacetValue[] {
  if (!currentPath) {
    // No selection - show root categories (lvl0)
    return facets.category_lvl0;
  }

  // Determine current level from path
  const pathSegments = currentPath.split(' > ').map((s) => s.trim());
  const currentLevel = pathSegments.length - 1;
  const nextLevel = currentLevel + 1;

  if (nextLevel > 4) {
    // Max depth reached
    return [];
  }

  const levelKeys: (keyof HierarchicalCategoryFacets)[] = [
    'category_lvl0',
    'category_lvl1',
    'category_lvl2',
    'category_lvl3',
    'category_lvl4',
  ];

  const nextLevelKey = levelKeys[nextLevel];
  const nextLevelFacets = facets[nextLevelKey];

  // Filter to show only children of current selection
  return nextLevelFacets.filter((item) =>
    item.value.startsWith(currentPath + ' > ')
  );
}

// ============================================================================
// Brand Facet Transformers
// ============================================================================

/**
 * Transform brand facets from API to frontend Facet format
 */
export function transformBrandFacets(
  facetDistribution: FacetDistribution | undefined,
  selectedBrands: string[] = []
): Facet | null {
  if (!facetDistribution?.brand_name) {
    return null;
  }

  const values: FacetValue[] = Object.entries(facetDistribution.brand_name)
    .map(([value, count]): FacetValue => ({
      value,
      label: value, // brand_name is already the display name
      count,
      selected: selectedBrands.includes(value),
    }))
    .sort((a, b) => {
      // Sort by count descending, then alphabetically
      if (b.count !== a.count) return b.count - a.count;
      return a.label.localeCompare(b.label, 'fr');
    });

  return {
    id: 'brand',
    name: 'Marques',
    type: 'checkbox',
    values,
    isExpanded: true,
  };
}

/**
 * Transform brand_slug facets (for URL-safe filtering)
 */
export function transformBrandSlugFacets(
  facetDistribution: FacetDistribution | undefined
): Map<string, string> {
  const slugToName = new Map<string, string>();

  if (!facetDistribution?.brand_slug || !facetDistribution?.brand_name) {
    return slugToName;
  }

  // Build mapping from slug to name using the facet counts
  // This assumes both facets have the same products, so counts should match
  const slugEntries = Object.keys(facetDistribution.brand_slug);
  const nameEntries = Object.keys(facetDistribution.brand_name);

  // If counts match, we can try to pair them
  // Otherwise, we just use the slug as-is
  slugEntries.forEach((slug) => {
    // Try to find matching name by count (heuristic)
    // In practice, you might want a separate API call or embedded data
    slugToName.set(slug, slug);
  });

  return slugToName;
}

// ============================================================================
// Stock/Availability Facet Transformers
// ============================================================================

/**
 * Transform has_stock and is_available boolean string facets
 */
export function transformStockFacets(
  facetDistribution: FacetDistribution | undefined
): StockFacetCounts {
  const counts: StockFacetCounts = {
    inStock: 0,
    outOfStock: 0,
    available: 0,
    unavailable: 0,
  };

  if (facetDistribution?.has_stock) {
    counts.inStock = facetDistribution.has_stock['true'] ?? 0;
    counts.outOfStock = facetDistribution.has_stock['false'] ?? 0;
  }

  if (facetDistribution?.is_available) {
    counts.available = facetDistribution.is_available['true'] ?? 0;
    counts.unavailable = facetDistribution.is_available['false'] ?? 0;
  }

  return counts;
}

// ============================================================================
// Material/Attribute Facet Transformers
// ============================================================================

/**
 * Transform material facet from API to frontend Facet format
 */
export function transformMaterialFacet(
  facetDistribution: FacetDistribution | undefined,
  selectedMaterials: string[] = []
): Facet | null {
  if (!facetDistribution?.material) {
    return null;
  }

  const values: FacetValue[] = Object.entries(facetDistribution.material)
    .map(([value, count]): FacetValue => ({
      value,
      label: value,
      count,
      selected: selectedMaterials.includes(value),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    id: 'material',
    name: 'Materiau',
    type: 'checkbox',
    values,
    isExpanded: false,
  };
}

/**
 * Transform tags facet from API to frontend Facet format
 */
export function transformTagsFacet(
  facetDistribution: FacetDistribution | undefined,
  selectedTags: string[] = []
): Facet | null {
  if (!facetDistribution?.tags) {
    return null;
  }

  const values: FacetValue[] = Object.entries(facetDistribution.tags)
    .map(([value, count]): FacetValue => ({
      value,
      label: value,
      count,
      selected: selectedTags.includes(value),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    id: 'tags',
    name: 'Tags',
    type: 'checkbox',
    values,
    isExpanded: false,
  };
}

// ============================================================================
// Combined Transformer
// ============================================================================

/**
 * Transform all facets from API response to frontend format
 */
export function transformAllFacets(
  facetDistribution: FacetDistribution | undefined,
  options: {
    selectedPath?: string;
    selectedBrands?: string[];
    selectedMaterials?: string[];
    selectedTags?: string[];
  } = {}
): {
  hierarchicalCategories: HierarchicalCategoryFacets;
  brandFacet: Facet | null;
  materialFacet: Facet | null;
  tagsFacet: Facet | null;
  stockCounts: StockFacetCounts;
} {
  return {
    hierarchicalCategories: transformHierarchicalCategoryFacets(
      facetDistribution,
      options.selectedPath
    ),
    brandFacet: transformBrandFacets(facetDistribution, options.selectedBrands),
    materialFacet: transformMaterialFacet(facetDistribution, options.selectedMaterials),
    tagsFacet: transformTagsFacet(facetDistribution, options.selectedTags),
    stockCounts: transformStockFacets(facetDistribution),
  };
}

export default transformAllFacets;
