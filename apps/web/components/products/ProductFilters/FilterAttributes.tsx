'use client';

import { useCallback, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useSearchFilters } from '@/contexts/SearchContext';
import { Checkbox } from '@/components/ui/Checkbox';
import { FilterCollapsible } from './FilterCollapsible';
import type { Facet, FacetValue } from '@/contexts/SearchContext';

export interface FilterAttributesProps {
  /** Attribute ID to filter (e.g., 'material', 'stone') */
  attributeId: string;
  /** Custom title (defaults to facet name) */
  title?: string;
  /** Initial number of values to show */
  initialVisibleCount?: number;
  /** Whether to show product counts */
  showCounts?: boolean;
  /** Whether the section is initially expanded */
  defaultExpanded?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * FilterAttributes
 *
 * Generic attribute filter component that works with any facet from SearchContext.
 * Supports dynamic attributes like material, stone, color, etc.
 */
export function FilterAttributes({
  attributeId,
  title,
  initialVisibleCount = 6,
  showCounts = true,
  defaultExpanded = false,
  className,
}: FilterAttributesProps) {
  const { facets, filters, toggleAttributeFilter } = useSearchFilters();
  const [showAll, setShowAll] = useState(false);

  // Find the facet for this attribute
  const facet = useMemo(() => {
    return facets.find((f) => f.id === attributeId);
  }, [facets, attributeId]);

  // Get selected values for this attribute
  const selectedValues = useMemo(() => {
    return filters.attributes[attributeId] ?? [];
  }, [filters.attributes, attributeId]);

  // Determine visible values
  const visibleValues = useMemo(() => {
    if (!facet) return [];
    if (showAll) return facet.values;
    return facet.values.slice(0, initialVisibleCount);
  }, [facet, showAll, initialVisibleCount]);

  // Count of hidden values
  const hiddenCount = facet ? facet.values.length - visibleValues.length : 0;

  // Handle value toggle
  const handleValueToggle = useCallback(
    (value: string) => {
      toggleAttributeFilter(attributeId, value);
    },
    [attributeId, toggleAttributeFilter]
  );

  // Handle show more/less
  const handleShowMore = useCallback(() => {
    setShowAll((prev) => !prev);
  }, []);

  if (!facet || facet.values.length === 0) {
    return null;
  }

  const displayTitle = title ?? facet.name;
  const activeCount = selectedValues.length;

  return (
    <FilterCollapsible
      title={displayTitle}
      activeCount={activeCount}
      defaultExpanded={defaultExpanded ?? facet.isExpanded}
      className={className}
    >
      <div className="space-y-3">
        {/* Attribute values */}
        <div
          role="group"
          aria-label={`Options de ${displayTitle.toLowerCase()}`}
          className="space-y-1"
        >
          {visibleValues.map((value) => {
            const isSelected = selectedValues.includes(value.value);

            return (
              <div
                key={value.value}
                className={cn(
                  'flex items-center justify-between py-1.5 px-2 -mx-2 rounded',
                  'transition-colors duration-150',
                  isSelected
                    ? 'bg-accent/5'
                    : 'hover:bg-neutral-100'
                )}
              >
                <Checkbox
                  checked={isSelected}
                  onChange={() => handleValueToggle(value.value)}
                  label={value.label}
                  size="sm"
                  containerClassName="flex-1"
                />
                {showCounts && (
                  <span
                    className={cn(
                      'text-xs tabular-nums ml-2',
                      isSelected ? 'text-accent' : 'text-neutral-500'
                    )}
                  >
                    ({value.count.toLocaleString('fr-FR')})
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Show more/less button */}
        {facet.values.length > initialVisibleCount && (
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

/**
 * FilterMaterial - Preset for material attribute
 */
export function FilterMaterial(props: Omit<FilterAttributesProps, 'attributeId'>) {
  return <FilterAttributes attributeId="material" title="Materiau" defaultExpanded {...props} />;
}

/**
 * FilterStone - Preset for stone attribute
 */
export function FilterStone(props: Omit<FilterAttributesProps, 'attributeId'>) {
  return <FilterAttributes attributeId="stone" title="Pierre" {...props} />;
}

/**
 * FilterColor - Preset for color attribute
 */
export function FilterColor(props: Omit<FilterAttributesProps, 'attributeId'>) {
  return <FilterAttributes attributeId="color" title="Couleur" {...props} />;
}

export default FilterAttributes;
