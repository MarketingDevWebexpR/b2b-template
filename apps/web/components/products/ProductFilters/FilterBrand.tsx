'use client';

import { useState, useCallback, useMemo, useId } from 'react';
import { cn } from '@/lib/utils';
import { useSearchFilters } from '@/contexts/SearchContext';
import { Checkbox } from '@/components/ui/Checkbox';
import { FilterCollapsible } from './FilterCollapsible';

export interface FilterBrandProps {
  /** Custom title for the section */
  title?: string;
  /** Initial number of brands to show */
  initialVisibleCount?: number;
  /** Whether to show product counts */
  showCounts?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * FilterBrand
 *
 * Multi-select brand filter with local search and "show more" functionality.
 * Integrates with SearchContext for state management.
 */
export function FilterBrand({
  title = 'Marques',
  initialVisibleCount = 5,
  showCounts = true,
  className,
}: FilterBrandProps) {
  const { facets, filters, toggleBrandFilter } = useSearchFilters();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const searchInputId = useId();

  // Find brand facet from facets array
  const brandFacet = useMemo(() => {
    return facets.find((f) => f.id === 'brand');
  }, [facets]);

  // Filter brands based on search query
  const filteredBrands = useMemo(() => {
    if (!brandFacet) return [];

    const query = searchQuery.toLowerCase().trim();
    if (!query) return brandFacet.values;

    return brandFacet.values.filter((brand) =>
      brand.label.toLowerCase().includes(query)
    );
  }, [brandFacet, searchQuery]);

  // Determine visible brands based on showAll state
  const visibleBrands = useMemo(() => {
    if (showAll || searchQuery) return filteredBrands;
    return filteredBrands.slice(0, initialVisibleCount);
  }, [filteredBrands, showAll, searchQuery, initialVisibleCount]);

  // Count of hidden brands
  const hiddenCount = filteredBrands.length - visibleBrands.length;

  // Count of active brand filters
  const activeCount = filters.brands.length;

  const handleBrandToggle = useCallback(
    (brandId: string) => {
      toggleBrandFilter(brandId);
    },
    [toggleBrandFilter]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      // Reset showAll when searching
      if (e.target.value) {
        setShowAll(false);
      }
    },
    []
  );

  const handleShowMore = useCallback(() => {
    setShowAll((prev) => !prev);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  if (!brandFacet || brandFacet.values.length === 0) {
    return null;
  }

  return (
    <FilterCollapsible
      title={title}
      activeCount={activeCount}
      defaultExpanded={true}
      className={className}
    >
      <div className="space-y-3">
        {/* Search input */}
        <div className="relative">
          <label htmlFor={searchInputId} className="sr-only">
            Rechercher une marque
          </label>
          <div className="relative">
            {/* Search icon */}
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <input
              id={searchInputId}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Rechercher..."
              className={cn(
                'w-full pl-9 pr-8 py-2',
                'text-sm',
                'bg-neutral-50',
                'border border-neutral-200 rounded-md',
                'placeholder:text-neutral-400',
                'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30',
                'transition-colors duration-200'
              )}
            />

            {/* Clear button */}
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className={cn(
                  'absolute right-2 top-1/2 -translate-y-1/2',
                  'p-1 rounded',
                  'text-neutral-500 hover:text-neutral-900',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                )}
                aria-label="Effacer la recherche"
              >
                <svg
                  className="w-4 h-4"
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
            )}
          </div>
        </div>

        {/* Brand checkboxes */}
        <div
          role="group"
          aria-label="Liste des marques"
          className="space-y-1"
        >
          {visibleBrands.length === 0 ? (
            <p className="text-sm text-neutral-500 py-2">
              Aucune marque trouvee
            </p>
          ) : (
            visibleBrands.map((brand) => {
              const isSelected = filters.brands.includes(brand.value);
              return (
                <div
                  key={brand.value}
                  className={cn(
                    'flex items-center justify-between py-1 px-1 -mx-1 rounded',
                    'hover:bg-neutral-100',
                    'transition-colors duration-150'
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleBrandToggle(brand.value)}
                    label={brand.label}
                    size="sm"
                    containerClassName="flex-1"
                  />
                  {showCounts && (
                    <span className="text-xs text-neutral-500 tabular-nums ml-2">
                      ({brand.count.toLocaleString('fr-FR')})
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Show more/less button */}
        {!searchQuery && filteredBrands.length > initialVisibleCount && (
          <button
            type="button"
            onClick={handleShowMore}
            className={cn(
              'flex items-center gap-1.5 w-full',
              'text-sm text-accent',
              'hover:text-accent/80',
              'focus:outline-none focus-visible:underline',
              'transition-colors duration-200'
            )}
          >
            <svg
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                showAll && 'rotate-180'
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
            {showAll ? (
              <span>Voir moins</span>
            ) : (
              <span>+ Voir {hiddenCount} de plus</span>
            )}
          </button>
        )}
      </div>
    </FilterCollapsible>
  );
}

export default FilterBrand;
