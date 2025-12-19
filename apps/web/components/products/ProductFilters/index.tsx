'use client';

import { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useSearchFilters, useSearch } from '@/contexts/SearchContext';
import { FilterCategory } from './FilterCategory';
import { FilterBrand } from './FilterBrand';
import { FilterPrice } from './FilterPrice';
import { FilterStock } from './FilterStock';
import { FilterAttributes, FilterMaterial, FilterStone } from './FilterAttributes';
import type { CategoryNode } from '@/contexts/SearchContext';

export interface ActiveFilterChip {
  type: 'category' | 'brand' | 'price' | 'stock' | 'attribute';
  id: string;
  label: string;
  value?: string;
}

export interface ProductFiltersProps {
  /** Whether to show the active filters section */
  showActiveFilters?: boolean;
  /** Whether to show the categories filter */
  showCategories?: boolean;
  /** Whether to show the brands filter */
  showBrands?: boolean;
  /** Whether to show the price filter */
  showPrice?: boolean;
  /** Whether to show the stock filter */
  showStock?: boolean;
  /** List of attribute IDs to show as filters */
  attributeIds?: string[];
  /** Additional class name */
  className?: string;
}

/**
 * ProductFilters
 *
 * Complete sidebar filter component for product listing pages.
 * Includes active filters display, categories, brands, price, stock, and dynamic attributes.
 */
export function ProductFilters({
  showActiveFilters = true,
  showCategories = true,
  showBrands = true,
  showPrice = true,
  showStock = true,
  attributeIds = ['material', 'stone'],
  className,
}: ProductFiltersProps) {
  const {
    filters,
    facets,
    categoryTree,
    clearFilters,
    removeFilter,
    clearHierarchicalCategory,
    activeFilterCount,
    hasActiveFilters,
  } = useSearchFilters();

  // Build list of active filter chips
  const activeFilterChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = [];

    // Helper to find category name by ID
    const findCategoryName = (categoryId: string, nodes: CategoryNode[]): string | null => {
      for (const node of nodes) {
        if (node.id === categoryId) return node.name;
        if (node.children) {
          const found = findCategoryName(categoryId, node.children);
          if (found) return found;
        }
      }
      return null;
    };

    // Hierarchical category filter (v3)
    if (filters.hierarchicalCategory) {
      chips.push({
        type: 'category',
        id: 'hierarchical-category',
        label: `Categorie: ${filters.hierarchicalCategory.pathString}`,
        value: filters.hierarchicalCategory.pathString,
      });
    }

    // Legacy category filters (only if no hierarchical category is set)
    if (!filters.hierarchicalCategory) {
      filters.categories.forEach((categoryId) => {
        const name = findCategoryName(categoryId, categoryTree) ?? categoryId;
        chips.push({
          type: 'category',
          id: categoryId,
          label: `Categorie: ${name}`,
          value: categoryId,
        });
      });
    }

    // Brand filters
    const brandFacet = facets.find((f) => f.id === 'brand');
    filters.brands.forEach((brandId) => {
      const brand = brandFacet?.values.find((v) => v.value === brandId);
      chips.push({
        type: 'brand',
        id: brandId,
        label: `Marque: ${brand?.label ?? brandId}`,
        value: brandId,
      });
    });

    // Price filter
    if (filters.priceRange) {
      chips.push({
        type: 'price',
        id: 'price',
        label: `Prix: ${filters.priceRange.min.toLocaleString('fr-FR')} EUR - ${filters.priceRange.max.toLocaleString('fr-FR')} EUR`,
      });
    }

    // Stock filter
    if (filters.stockFilter !== 'all') {
      const stockLabels: Record<string, string> = {
        in_stock: 'En stock',
        low_stock: 'Stock faible',
        available_24h: 'Dispo 24h',
        on_order: 'Sur commande',
      };
      chips.push({
        type: 'stock',
        id: 'stock',
        label: `Disponibilite: ${stockLabels[filters.stockFilter] ?? filters.stockFilter}`,
      });
    }

    // Attribute filters
    Object.entries(filters.attributes).forEach(([attrId, values]) => {
      const facet = facets.find((f) => f.id === attrId);
      values.forEach((value) => {
        const attrValue = facet?.values.find((v) => v.value === value);
        chips.push({
          type: 'attribute',
          id: `${attrId}-${value}`,
          label: `${facet?.name ?? attrId}: ${attrValue?.label ?? value}`,
          value: value,
        });
      });
    });

    return chips;
  }, [filters, facets, categoryTree]);

  // Handle removing a single filter
  const handleRemoveFilter = useCallback(
    (chip: ActiveFilterChip) => {
      switch (chip.type) {
        case 'category':
          // Handle hierarchical category vs legacy category
          if (chip.id === 'hierarchical-category') {
            clearHierarchicalCategory();
          } else {
            removeFilter('category', chip.value);
          }
          break;
        case 'brand':
          removeFilter('brand', chip.value);
          break;
        case 'price':
          removeFilter('price');
          break;
        case 'stock':
          removeFilter('stock');
          break;
        case 'attribute':
          // Extract attribute ID from chip.id (format: "attrId-value")
          const [attrId] = chip.id.split('-');
          removeFilter(attrId, chip.value);
          break;
      }
    },
    [removeFilter, clearHierarchicalCategory]
  );

  // Handle clearing all filters
  const handleClearAll = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  return (
    <aside
      className={cn(
        'w-full',
        className
      )}
      aria-label="Filtres produits"
    >
      {/* Active Filters */}
      {showActiveFilters && hasActiveFilters && (
        <div className="mb-6 pb-4 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-900">
              Filtres actifs
            </h3>
            <button
              type="button"
              onClick={handleClearAll}
              className={cn(
                'text-sm text-neutral-500',
                'hover:text-red-600',
                'focus:outline-none focus-visible:underline',
                'transition-colors duration-200'
              )}
            >
              Effacer tout
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeFilterChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleRemoveFilter(chip)}
                className={cn(
                  'inline-flex items-center gap-1.5',
                  'px-2.5 py-1.5 rounded-md',
                  'text-xs',
                  'bg-neutral-100 text-neutral-900',
                  'hover:bg-red-50 hover:text-red-600',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  'transition-colors duration-200',
                  'group'
                )}
                aria-label={`Supprimer le filtre: ${chip.label}`}
              >
                <span className="max-w-[180px] truncate">{chip.label}</span>
                <svg
                  className={cn(
                    'w-3.5 h-3.5 flex-shrink-0',
                    'text-neutral-500 group-hover:text-red-600',
                    'transition-colors duration-200'
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Sections */}
      <div className="space-y-0">
        {showCategories && <FilterCategory />}
        {showBrands && <FilterBrand />}
        {showPrice && <FilterPrice />}
        {showStock && <FilterStock />}

        {/* Dynamic Attributes */}
        {attributeIds.map((attrId) => (
          <FilterAttributes
            key={attrId}
            attributeId={attrId}
            defaultExpanded={attrId === 'material'}
          />
        ))}
      </div>
    </aside>
  );
}

// Re-export individual filter components
export { FilterCollapsible } from './FilterCollapsible';
export { FilterCategory } from './FilterCategory';
export { FilterBrand } from './FilterBrand';
export { FilterPrice } from './FilterPrice';
export { FilterStock } from './FilterStock';
export { FilterAttributes, FilterMaterial, FilterStone, FilterColor } from './FilterAttributes';
export { CategoryBreadcrumb, CategoryBreadcrumbChip } from './CategoryBreadcrumb';

export default ProductFilters;
