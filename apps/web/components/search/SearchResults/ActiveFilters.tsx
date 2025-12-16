'use client';

/**
 * ActiveFilters Component
 *
 * Displays the currently active filters as removable tags.
 * Allows users to quickly see and remove applied filters.
 */

import { useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchFilters } from '@/contexts/SearchContext';
import type { ActiveFilters as ActiveFiltersType, PriceRange } from '@/contexts/SearchContext';

interface FilterTagProps {
  label: string;
  value: string;
  onRemove: () => void;
}

/**
 * Individual filter tag with remove button
 */
function FilterTag({ label, value, onRemove }: FilterTagProps) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className={cn(
        'inline-flex items-center gap-1.5',
        'px-3 py-1.5',
        'bg-accent/10 text-accent',
        'text-sm font-medium',
        'rounded-full',
        'border border-accent/20',
        'transition-all duration-200',
        'hover:bg-accent/20 hover:border-accent/30',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
      )}
      aria-label={`Retirer le filtre ${label}: ${value}`}
    >
      <span className="text-neutral-600 text-xs">{label}:</span>
      <span>{value}</span>
      <X className="w-3.5 h-3.5 ml-0.5" aria-hidden="true" />
    </button>
  );
}

export interface ActiveFiltersProps {
  /** Custom class name */
  className?: string;
  /** Whether to show the "Clear all" button */
  showClearAll?: boolean;
  /** Category labels mapping (id -> display name) */
  categoryLabels?: Record<string, string>;
  /** Brand labels mapping (id -> display name) */
  brandLabels?: Record<string, string>;
}

/**
 * Format price range for display
 */
function formatPriceRange(range: PriceRange): string {
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${formatter.format(range.min)} - ${formatter.format(range.max)}`;
}

/**
 * Stock filter label mapping
 */
const stockFilterLabels: Record<string, string> = {
  in_stock: 'En stock',
  low_stock: 'Stock faible',
  available_24h: 'Sous 24h',
  on_order: 'Sur commande',
};

/**
 * ActiveFilters component displays currently applied filters as tags
 */
export function ActiveFilters({
  className,
  showClearAll = true,
  categoryLabels = {},
  brandLabels = {},
}: ActiveFiltersProps) {
  const {
    filters,
    facets,
    categoryTree,
    removeFilter,
    clearFilters,
    hasActiveFilters,
  } = useSearchFilters();

  // Get display name for category
  const getCategoryLabel = useCallback(
    (categoryId: string): string => {
      if (categoryLabels[categoryId]) {
        return categoryLabels[categoryId];
      }
      // Search in category tree
      const findCategory = (
        nodes: typeof categoryTree,
        id: string
      ): string | null => {
        for (const node of nodes) {
          if (node.id === id) return node.name;
          if (node.children) {
            const found = findCategory(node.children, id);
            if (found) return found;
          }
        }
        return null;
      };
      return findCategory(categoryTree, categoryId) || categoryId;
    },
    [categoryLabels, categoryTree]
  );

  // Get display name for brand
  const getBrandLabel = useCallback(
    (brandId: string): string => {
      if (brandLabels[brandId]) {
        return brandLabels[brandId];
      }
      // Search in facets
      const brandFacet = facets.find((f) => f.id === 'brand');
      const brand = brandFacet?.values.find((v) => v.value === brandId);
      return brand?.label || brandId;
    },
    [brandLabels, facets]
  );

  // Get display name for attribute
  const getAttributeLabel = useCallback(
    (attributeId: string, value: string): { attr: string; val: string } => {
      const facet = facets.find((f) => f.id === attributeId);
      const facetValue = facet?.values.find((v) => v.value === value);
      return {
        attr: facet?.name || attributeId,
        val: facetValue?.label || value,
      };
    },
    [facets]
  );

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2',
        className
      )}
      role="region"
      aria-label="Filtres actifs"
    >
      <span className="text-sm text-neutral-600 font-medium mr-1">
        Filtres actifs:
      </span>

      {/* Category filters */}
      {filters.categories.map((categoryId) => (
        <FilterTag
          key={`cat-${categoryId}`}
          label="Categorie"
          value={getCategoryLabel(categoryId)}
          onRemove={() => removeFilter('category', categoryId)}
        />
      ))}

      {/* Brand filters */}
      {filters.brands.map((brandId) => (
        <FilterTag
          key={`brand-${brandId}`}
          label="Marque"
          value={getBrandLabel(brandId)}
          onRemove={() => removeFilter('brand', brandId)}
        />
      ))}

      {/* Price range filter */}
      {filters.priceRange && (
        <FilterTag
          key="price"
          label="Prix"
          value={formatPriceRange(filters.priceRange)}
          onRemove={() => removeFilter('price')}
        />
      )}

      {/* Stock filter */}
      {filters.stockFilter !== 'all' && (
        <FilterTag
          key="stock"
          label="Stock"
          value={stockFilterLabels[filters.stockFilter] || filters.stockFilter}
          onRemove={() => removeFilter('stock')}
        />
      )}

      {/* Attribute filters */}
      {Object.entries(filters.attributes).map(([attributeId, values]) =>
        values.map((value) => {
          const { attr, val } = getAttributeLabel(attributeId, value);
          return (
            <FilterTag
              key={`attr-${attributeId}-${value}`}
              label={attr}
              value={val}
              onRemove={() => removeFilter(attributeId, value)}
            />
          );
        })
      )}

      {/* Clear all button */}
      {showClearAll && (
        <button
          type="button"
          onClick={clearFilters}
          className={cn(
            'ml-2 px-3 py-1.5',
            'text-sm font-medium',
            'text-neutral-500 hover:text-red-600',
            'transition-colors duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
            'rounded'
          )}
        >
          Effacer tout
        </button>
      )}
    </div>
  );
}

export default ActiveFilters;
