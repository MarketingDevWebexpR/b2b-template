'use client';

/**
 * CategoryBreadcrumb Component
 *
 * Displays the current hierarchical category path with navigation.
 * Part of the App Search v3 hierarchical faceting system.
 */

import { cn } from '@/lib/utils';
import { useSearchFilters } from '@/contexts/SearchContext';
import type { HierarchicalCategoryPath } from '@/contexts/SearchContext';
import { ChevronRight, Home, X } from 'lucide-react';

export interface CategoryBreadcrumbProps {
  /** Additional class name */
  className?: string;
  /** Show the clear button */
  showClear?: boolean;
  /** Compact mode (smaller text, less padding) */
  compact?: boolean;
}

/**
 * CategoryBreadcrumb
 *
 * Shows the current category path and allows navigation to parent levels.
 * Used in search results and product listing pages.
 */
export function CategoryBreadcrumb({
  className,
  showClear = true,
  compact = false,
}: CategoryBreadcrumbProps) {
  const {
    filters,
    navigateToHierarchicalLevel,
    clearHierarchicalCategory,
  } = useSearchFilters();

  const path = filters.hierarchicalCategory;

  if (!path || path.path.length === 0) {
    return null;
  }

  return (
    <nav
      className={cn(
        'flex items-center flex-wrap gap-1',
        compact ? 'text-xs' : 'text-sm',
        className
      )}
      aria-label="Chemin de categorie"
    >
      {/* Home/Root button */}
      <button
        type="button"
        onClick={clearHierarchicalCategory}
        className={cn(
          'flex items-center gap-1 rounded',
          compact ? 'px-1.5 py-0.5' : 'px-2 py-1',
          'text-neutral-600 hover:text-accent hover:bg-orange-50',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
        )}
        aria-label="Retour a toutes les categories"
      >
        <Home className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span className="sr-only">Toutes les categories</span>
      </button>

      {/* Breadcrumb segments */}
      {path.path.map((segment, index) => (
        <span key={index} className="flex items-center">
          <ChevronRight
            className={cn(
              'text-neutral-400 mx-0.5',
              compact ? 'w-3 h-3' : 'w-4 h-4'
            )}
            aria-hidden="true"
          />
          {index < path.path.length - 1 ? (
            <button
              type="button"
              onClick={() => navigateToHierarchicalLevel(index)}
              className={cn(
                'rounded',
                compact ? 'px-1.5 py-0.5' : 'px-2 py-1',
                'text-neutral-600 hover:text-accent hover:bg-orange-50',
                'transition-colors duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
              )}
            >
              {segment}
            </button>
          ) : (
            <span
              className={cn(
                'font-medium text-accent',
                compact ? 'px-1.5 py-0.5' : 'px-2 py-1'
              )}
            >
              {segment}
            </span>
          )}
        </span>
      ))}

      {/* Clear button */}
      {showClear && (
        <button
          type="button"
          onClick={clearHierarchicalCategory}
          className={cn(
            'ml-2 flex items-center gap-1 rounded',
            compact ? 'px-1.5 py-0.5' : 'px-2 py-1',
            'text-neutral-500 hover:text-red-600 hover:bg-red-50',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500'
          )}
          aria-label="Effacer la selection de categorie"
        >
          <X className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        </button>
      )}
    </nav>
  );
}

/**
 * CategoryBreadcrumbChip
 *
 * A compact chip-style display of the current category path.
 * Suitable for inline display in active filters.
 */
export function CategoryBreadcrumbChip({
  className,
}: {
  className?: string;
}) {
  const { filters, clearHierarchicalCategory } = useSearchFilters();

  const path = filters.hierarchicalCategory;

  if (!path || path.path.length === 0) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={clearHierarchicalCategory}
      className={cn(
        'inline-flex items-center gap-1.5',
        'px-2.5 py-1.5 rounded-md',
        'text-xs',
        'bg-orange-50 text-accent',
        'hover:bg-red-50 hover:text-red-600',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        'transition-colors duration-200',
        'group',
        className
      )}
      aria-label={`Supprimer le filtre: ${path.pathString}`}
    >
      <span className="max-w-[200px] truncate">
        {path.pathString}
      </span>
      <X
        className={cn(
          'w-3.5 h-3.5 flex-shrink-0',
          'text-accent/70 group-hover:text-red-600',
          'transition-colors duration-200'
        )}
      />
    </button>
  );
}

export default CategoryBreadcrumb;
