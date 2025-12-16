'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useSearchFilters } from '@/contexts/SearchContext';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { ProductFilters } from './index';

export interface FilterMobileProps {
  /** Custom trigger button label */
  triggerLabel?: string;
  /** Whether to show result count in trigger */
  showResultCount?: boolean;
  /** Total number of results */
  totalResults?: number;
  /** Additional class name for the trigger button */
  triggerClassName?: string;
  /** Additional class name for the drawer content */
  drawerClassName?: string;
}

/**
 * FilterMobile
 *
 * Mobile-optimized filter drawer that slides in from the left.
 * Includes a sticky bottom bar with filter count and apply button.
 */
export function FilterMobile({
  triggerLabel = 'Filtres',
  showResultCount = true,
  totalResults = 0,
  triggerClassName,
  drawerClassName,
}: FilterMobileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { activeFilterCount, hasActiveFilters, clearFilters } = useSearchFilters();

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleApply = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleClearAll = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  // Footer content for the drawer
  const drawerFooter = (
    <div className="flex flex-col gap-3">
      {/* Result count */}
      {showResultCount && (
        <p className="text-b2b-body-sm text-b2b-text-secondary text-center">
          {totalResults.toLocaleString('fr-FR')} produit{totalResults !== 1 ? 's' : ''} trouve{totalResults !== 1 ? 's' : ''}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="md"
            onClick={handleClearAll}
            className="flex-1"
          >
            Effacer ({activeFilterCount})
          </Button>
        )}
        <Button
          variant="primary"
          size="md"
          onClick={handleApply}
          className={hasActiveFilters ? 'flex-1' : 'w-full'}
        >
          Appliquer
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Trigger - Fixed at bottom on mobile */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40',
          'p-4 bg-b2b-bg-primary',
          'border-t border-b2b-border-light',
          'shadow-lg',
          'lg:hidden', // Only show on mobile/tablet
          triggerClassName
        )}
      >
        <button
          type="button"
          onClick={handleOpen}
          className={cn(
            'flex items-center justify-center gap-2 w-full',
            'px-4 py-3',
            'bg-b2b-bg-secondary',
            'border border-b2b-border-medium rounded-lg',
            'text-b2b-body font-medium text-b2b-text-primary',
            'hover:bg-b2b-bg-tertiary',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-b2b-primary',
            'transition-colors duration-200'
          )}
          aria-label={`Ouvrir les filtres${activeFilterCount > 0 ? `, ${activeFilterCount} filtre${activeFilterCount > 1 ? 's' : ''} actif${activeFilterCount > 1 ? 's' : ''}` : ''}`}
        >
          {/* Filter icon */}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>

          <span>{triggerLabel}</span>

          {/* Active filter count badge */}
          {activeFilterCount > 0 && (
            <span
              className={cn(
                'inline-flex items-center justify-center',
                'min-w-[22px] h-[22px] px-1.5',
                'text-xs font-semibold',
                'bg-b2b-primary text-white',
                'rounded-full'
              )}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Drawer */}
      <Drawer
        isOpen={isOpen}
        onClose={handleClose}
        title="Filtres"
        side="left"
        size="md"
        footer={drawerFooter}
        className={drawerClassName}
      >
        <ProductFilters
          showActiveFilters={true}
          showCategories={true}
          showBrands={true}
          showPrice={true}
          showStock={true}
          attributeIds={['material', 'stone']}
        />
      </Drawer>

      {/* Spacer to prevent content from being hidden behind fixed trigger */}
      <div className="h-[72px] lg:hidden" aria-hidden="true" />
    </>
  );
}

/**
 * FilterMobileTrigger
 *
 * Standalone trigger button that can be placed anywhere.
 * Useful when you don't want the fixed bottom bar.
 */
export interface FilterMobileTriggerProps {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Callback to open the drawer */
  onOpen: () => void;
  /** Number of active filters */
  activeFilterCount?: number;
  /** Custom label */
  label?: string;
  /** Additional class name */
  className?: string;
}

export function FilterMobileTrigger({
  isOpen,
  onOpen,
  activeFilterCount = 0,
  label = 'Filtres',
  className,
}: FilterMobileTriggerProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'inline-flex items-center gap-2',
        'px-4 py-2.5',
        'bg-b2b-bg-secondary',
        'border border-b2b-border-medium rounded-lg',
        'text-b2b-body-sm font-medium text-b2b-text-primary',
        'hover:bg-b2b-bg-tertiary',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-b2b-primary',
        'transition-colors duration-200',
        className
      )}
      aria-expanded={isOpen}
      aria-label={`${label}${activeFilterCount > 0 ? `, ${activeFilterCount} actif${activeFilterCount > 1 ? 's' : ''}` : ''}`}
    >
      {/* Filter icon */}
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
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        />
      </svg>

      <span>{label}</span>

      {activeFilterCount > 0 && (
        <span
          className={cn(
            'inline-flex items-center justify-center',
            'min-w-[20px] h-5 px-1.5',
            'text-xs font-semibold',
            'bg-b2b-primary text-white',
            'rounded-full'
          )}
        >
          {activeFilterCount}
        </span>
      )}
    </button>
  );
}

export default FilterMobile;
