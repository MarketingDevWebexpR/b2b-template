'use client';

import { useCallback, useMemo, useId } from 'react';
import { cn } from '@/lib/utils';
import { useSearchFilters, useSearch } from '@/contexts/SearchContext';
import { Radio } from '@/components/ui/Checkbox';
import { FilterCollapsible } from './FilterCollapsible';
import type { StockFilter as StockFilterType } from '@/contexts/SearchContext';

export interface StockOption {
  value: StockFilterType;
  label: string;
  count?: number;
  /**
   * v3 API filter value - for stock filters these are boolean strings
   * e.g., "true" or "false" for has_stock field
   */
  apiValue?: string;
}

export interface FilterStockProps {
  /** Custom title for the section */
  title?: string;
  /** Custom stock options */
  options?: StockOption[];
  /** Whether to show product counts */
  showCounts?: boolean;
  /** Additional class name */
  className?: string;
  /** Use v3 facet counts from API (has_stock boolean strings) */
  useV3Counts?: boolean;
}

/**
 * Default stock filter options
 * Note: v3 API uses has_stock="true"/"false" strings
 */
const DEFAULT_OPTIONS: StockOption[] = [
  { value: 'all', label: 'Tous les produits', apiValue: undefined },
  { value: 'in_stock', label: 'En stock', apiValue: 'true' },
  { value: 'on_order', label: 'Sur commande / Non disponible', apiValue: 'false' },
];

/**
 * FilterStock
 *
 * Stock availability filter with radio button options.
 * Allows single selection of stock status.
 *
 * v3 API Integration:
 * - Uses has_stock field with string values "true" or "false"
 * - Fetches counts from facetDistribution.has_stock
 */
export function FilterStock({
  title = 'Disponibilite',
  options = DEFAULT_OPTIONS,
  showCounts = true,
  className,
  useV3Counts = true,
}: FilterStockProps) {
  const { filters, setStockFilter, facets } = useSearchFilters();
  const { state } = useSearch();

  const groupName = useId();

  // Check if filter is active (not 'all')
  const isActive = filters.stockFilter !== 'all';

  /**
   * Get stock counts from v3 API facets
   * v3 uses has_stock with string values "true" | "false"
   */
  const stockCounts = useMemo(() => {
    // Look for has_stock facet in state or facets
    const stockFacet = facets.find(f => f.id === 'has_stock' || f.id === 'stock');

    if (stockFacet) {
      return {
        inStock: stockFacet.values.find(v => v.value === 'true')?.count ?? 0,
        outOfStock: stockFacet.values.find(v => v.value === 'false')?.count ?? 0,
      };
    }

    // Fallback: try to get from raw facetDistribution if available
    return {
      inStock: 0,
      outOfStock: 0,
    };
  }, [facets]);

  /**
   * Merge options with v3 API counts
   */
  const optionsWithCounts = useMemo<StockOption[]>(() => {
    if (!useV3Counts) return options;

    return options.map(opt => {
      if (opt.value === 'in_stock') {
        return { ...opt, count: stockCounts.inStock };
      }
      if (opt.value === 'on_order') {
        return { ...opt, count: stockCounts.outOfStock };
      }
      if (opt.value === 'all') {
        return { ...opt, count: stockCounts.inStock + stockCounts.outOfStock };
      }
      return opt;
    });
  }, [options, stockCounts, useV3Counts]);

  const handleOptionChange = useCallback(
    (value: StockFilterType) => {
      setStockFilter(value);
    },
    [setStockFilter]
  );

  return (
    <FilterCollapsible
      title={title}
      activeCount={isActive ? 1 : 0}
      defaultExpanded={true}
      className={className}
    >
      <fieldset>
        <legend className="sr-only">{title}</legend>
        <div
          role="radiogroup"
          aria-label="Options de disponibilite"
          className="space-y-1"
        >
          {optionsWithCounts.map((option) => {
            const isSelected = filters.stockFilter === option.value;

            return (
              <div
                key={option.value}
                className={cn(
                  'flex items-center justify-between py-1.5 px-2 -mx-2 rounded',
                  'transition-colors duration-150',
                  isSelected
                    ? 'bg-accent/5'
                    : 'hover:bg-neutral-100'
                )}
              >
                <Radio
                  name={groupName}
                  value={option.value}
                  checked={isSelected}
                  onChange={() => handleOptionChange(option.value)}
                  label={option.label}
                  size="sm"
                  containerClassName="flex-1"
                />
                {showCounts && option.count !== undefined && option.count > 0 && (
                  <span
                    className={cn(
                      'text-xs tabular-nums ml-2',
                      isSelected ? 'text-accent' : 'text-neutral-500'
                    )}
                  >
                    ({option.count.toLocaleString('fr-FR')})
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </fieldset>
    </FilterCollapsible>
  );
}

export default FilterStock;
