'use client';

import { useMemo, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Number of sibling pages to show on each side */
  siblingCount?: number;
  /** Show first/last page buttons */
  showFirstLast?: boolean;
  /** Show previous/next buttons */
  showPrevNext?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Generate pagination range with ellipsis
 */
function generatePaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | 'ellipsis')[] {
  const totalNumbers = siblingCount * 2 + 3; // siblings + current + 2 boundaries
  const totalBlocks = totalNumbers + 2; // + 2 ellipsis

  // If total pages is less than the calculated blocks, show all pages
  if (totalPages <= totalBlocks) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = Array.from(
      { length: 3 + 2 * siblingCount },
      (_, i) => i + 1
    );
    return [...leftRange, 'ellipsis', totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = Array.from(
      { length: 3 + 2 * siblingCount },
      (_, i) => totalPages - (3 + 2 * siblingCount) + i + 1
    );
    return [1, 'ellipsis', ...rightRange];
  }

  const middleRange = Array.from(
    { length: 1 + 2 * siblingCount },
    (_, i) => leftSiblingIndex + i
  );
  return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages];
}

/**
 * Pagination size configurations
 */
const paginationSizes = {
  sm: {
    button: 'w-8 h-8 text-sm',
    gap: 'gap-1',
  },
  md: {
    button: 'w-10 h-10 text-base',
    gap: 'gap-1.5',
  },
  lg: {
    button: 'w-12 h-12 text-lg',
    gap: 'gap-2',
  },
};

/**
 * Professional B2B Pagination component.
 * Used for navigating through paginated content.
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  showPrevNext = true,
  size = 'md',
  disabled = false,
  className,
  ...props
}: PaginationProps) => {
  const sizeConfig = paginationSizes[size];

  const paginationRange = useMemo(
    () => generatePaginationRange(currentPage, totalPages, siblingCount),
    [currentPage, totalPages, siblingCount]
  );

  // Don't render if there's only one page
  if (totalPages <= 1) return null;

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const buttonClasses = cn(
    'inline-flex items-center justify-center',
    sizeConfig.button,
    'rounded-lg',
    'font-medium',
    'transition-all duration-200',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:ring-offset-2'
  );

  const activeButtonClasses = cn(
    'bg-accent text-white',
    'hover:bg-orange-600'
  );

  const inactiveButtonClasses = cn(
    'bg-white text-neutral-900',
    'border border-neutral-200',
    'hover:bg-neutral-100 hover:border-neutral-300'
  );

  const disabledButtonClasses = cn(
    'opacity-50 cursor-not-allowed',
    'hover:bg-white hover:border-neutral-200'
  );

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn('flex items-center', sizeConfig.gap, className)}
      {...props}
    >
      {/* First page button */}
      {showFirstLast && (
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={disabled || isFirstPage}
          aria-label="Première page"
          className={cn(
            buttonClasses,
            inactiveButtonClasses,
            (disabled || isFirstPage) && disabledButtonClasses
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Previous page button */}
      {showPrevNext && (
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || isFirstPage}
          aria-label="Page précédente"
          className={cn(
            buttonClasses,
            inactiveButtonClasses,
            (disabled || isFirstPage) && disabledButtonClasses
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Page numbers */}
      {paginationRange.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className={cn(
                'inline-flex items-center justify-center',
                sizeConfig.button,
                'text-neutral-500'
              )}
            >
              ...
            </span>
          );
        }

        const isActive = page === currentPage;

        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            disabled={disabled}
            aria-label={`Page ${page}`}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              buttonClasses,
              isActive ? activeButtonClasses : inactiveButtonClasses,
              disabled && !isActive && disabledButtonClasses
            )}
          >
            {page}
          </button>
        );
      })}

      {/* Next page button */}
      {showPrevNext && (
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || isLastPage}
          aria-label="Page suivante"
          className={cn(
            buttonClasses,
            inactiveButtonClasses,
            (disabled || isLastPage) && disabledButtonClasses
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Last page button */}
      {showFirstLast && (
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={disabled || isLastPage}
          aria-label="Dernière page"
          className={cn(
            buttonClasses,
            inactiveButtonClasses,
            (disabled || isLastPage) && disabledButtonClasses
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </nav>
  );
};

Pagination.displayName = 'Pagination';

/**
 * Pagination with page size selector and info
 */
export interface PaginationWithInfoProps extends PaginationProps {
  /** Total number of items */
  totalItems: number;
  /** Items per page */
  pageSize: number;
  /** Callback when page size changes */
  onPageSizeChange?: (size: number) => void;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Whether to show page size selector */
  showPageSize?: boolean;
  /** Whether to show total count */
  showTotal?: boolean;
}

const PaginationWithInfo = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSize = true,
  showTotal = true,
  ...props
}: PaginationWithInfoProps) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Info section */}
      <div className="flex items-center gap-4 text-sm text-neutral-600">
        {showTotal && (
          <span>
            {startItem}-{endItem} sur {totalItems.toLocaleString('fr-FR')} résultats
          </span>
        )}

        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span>Afficher</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className={cn(
                'px-2 py-1',
                'bg-white',
                'border border-neutral-200 rounded-md',
                'text-sm',
                'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent'
              )}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span>par page</span>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        {...props}
      />
    </div>
  );
};

PaginationWithInfo.displayName = 'PaginationWithInfo';

export { Pagination, PaginationWithInfo, paginationSizes };
