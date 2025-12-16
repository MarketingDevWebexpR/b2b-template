'use client';

import { useCallback, useMemo, useId } from 'react';
import { cn } from '@/lib/utils';
import { useSearchFilters } from '@/contexts/SearchContext';
import { Radio } from '@/components/ui/Checkbox';
import { FilterCollapsible } from './FilterCollapsible';
import type { StockFilter as StockFilterType } from '@/contexts/SearchContext';

export interface StockOption {
  value: StockFilterType;
  label: string;
  count?: number;
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
}

const DEFAULT_OPTIONS: StockOption[] = [
  { value: 'all', label: 'Tous les produits' },
  { value: 'in_stock', label: 'En stock', count: 2345 },
  { value: 'available_24h', label: 'Disponible sous 24h', count: 456 },
  { value: 'on_order', label: 'Sur commande', count: 123 },
];

/**
 * FilterStock
 *
 * Stock availability filter with radio button options.
 * Allows single selection of stock status.
 */
export function FilterStock({
  title = 'Disponibilite',
  options = DEFAULT_OPTIONS,
  showCounts = true,
  className,
}: FilterStockProps) {
  const { filters, setStockFilter } = useSearchFilters();

  const groupName = useId();

  // Check if filter is active (not 'all')
  const isActive = filters.stockFilter !== 'all';

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
          {options.map((option) => {
            const isSelected = filters.stockFilter === option.value;

            return (
              <div
                key={option.value}
                className={cn(
                  'flex items-center justify-between py-1.5 px-2 -mx-2 rounded',
                  'transition-colors duration-150',
                  isSelected
                    ? 'bg-b2b-primary/5'
                    : 'hover:bg-b2b-bg-tertiary'
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
                {showCounts && option.count !== undefined && (
                  <span
                    className={cn(
                      'text-b2b-caption tabular-nums ml-2',
                      isSelected ? 'text-b2b-primary' : 'text-b2b-text-muted'
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
