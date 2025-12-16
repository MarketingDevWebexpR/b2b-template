'use client';

/**
 * SearchSortSelect Component
 *
 * Dropdown select for sorting search results.
 * Supports multiple sort options with labels in French.
 */

import { useId } from 'react';
import { cn } from '@/lib/utils';
import { useSearchPagination } from '@/contexts/SearchContext';
import type { SearchSortOption } from '@/contexts/SearchContext';
import { Select } from '@/components/ui';

/**
 * Sort option configuration with labels
 */
interface SortOptionConfig {
  value: SearchSortOption;
  label: string;
  shortLabel?: string;
}

const sortOptions: SortOptionConfig[] = [
  { value: 'relevance', label: 'Pertinence', shortLabel: 'Pertinence' },
  { value: 'price_asc', label: 'Prix croissant', shortLabel: 'Prix +' },
  { value: 'price_desc', label: 'Prix decroissant', shortLabel: 'Prix -' },
  { value: 'name_asc', label: 'Nom A-Z', shortLabel: 'A-Z' },
  { value: 'name_desc', label: 'Nom Z-A', shortLabel: 'Z-A' },
  { value: 'stock_desc', label: 'Stock disponible', shortLabel: 'Stock' },
  { value: 'newest', label: 'Nouveautes', shortLabel: 'Nouveautes' },
  { value: 'bestseller', label: 'Meilleures ventes', shortLabel: 'Ventes' },
];

export interface SearchSortSelectProps {
  /** Custom class name */
  className?: string;
  /** Show label before select */
  showLabel?: boolean;
  /** Use compact labels */
  compact?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * SearchSortSelect component for sorting search results
 */
export function SearchSortSelect({
  className,
  showLabel = true,
  compact = false,
  size = 'md',
}: SearchSortSelectProps) {
  const { sortBy, setSortBy } = useSearchPagination();
  const selectId = useId();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SearchSortOption);
  };

  // Convert to Select options format
  const selectOptions = sortOptions.map((option) => ({
    value: option.value,
    label: compact && option.shortLabel ? option.shortLabel : option.label,
  }));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showLabel && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-b2b-text-secondary whitespace-nowrap"
        >
          Trier par:
        </label>
      )}
      <Select
        id={selectId}
        value={sortBy}
        onChange={handleChange}
        options={selectOptions}
        size={size}
        className="min-w-[160px]"
        aria-label={!showLabel ? 'Trier par' : undefined}
      />
    </div>
  );
}

/**
 * Inline sort select variant for tight spaces
 */
export function SearchSortSelectInline({
  className,
}: {
  className?: string;
}) {
  const { sortBy, setSortBy } = useSearchPagination();

  return (
    <div className={cn('relative inline-flex items-center', className)}>
      <span className="text-sm text-b2b-text-secondary mr-2">Trier:</span>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as SearchSortOption)}
        className={cn(
          'appearance-none',
          'bg-transparent',
          'text-sm font-medium text-b2b-primary',
          'cursor-pointer',
          'pr-5',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-b2b-primary focus-visible:ring-offset-2',
          'rounded'
        )}
        aria-label="Trier les resultats"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-0 w-4 h-4 text-b2b-primary pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
}

export default SearchSortSelect;
