'use client';

/**
 * SearchPagination Component
 *
 * Pagination component for search results with page size selector.
 * Integrates with SearchContext for state management.
 */

import { cn } from '@/lib/utils';
import { useSearchPagination } from '@/contexts/SearchContext';
import { Pagination, PaginationWithInfo } from '@/components/ui';

export interface SearchPaginationProps {
  /** Custom class name */
  className?: string;
  /** Show page info (X-Y sur Z resultats) */
  showInfo?: boolean;
  /** Show page size selector */
  showPageSize?: boolean;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Number of siblings to show */
  siblingCount?: number;
}

/**
 * SearchPagination component with search context integration
 */
export function SearchPagination({
  className,
  showInfo = true,
  showPageSize = true,
  pageSizeOptions = [12, 24, 48, 96],
  size = 'md',
  siblingCount = 1,
}: SearchPaginationProps) {
  const {
    currentPage,
    pageSize,
    totalPages,
    totalResults,
    setPage,
    setPageSize,
  } = useSearchPagination();

  // Don't render if there are no results or only one page
  if (totalResults === 0) {
    return null;
  }

  if (showInfo) {
    return (
      <PaginationWithInfo
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalResults}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={showPageSize ? setPageSize : undefined}
        pageSizeOptions={pageSizeOptions}
        showPageSize={showPageSize}
        showTotal={showInfo}
        size={size}
        siblingCount={siblingCount}
        className={className}
      />
    );
  }

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setPage}
      size={size}
      siblingCount={siblingCount}
      className={className}
    />
  );
}

/**
 * Compact pagination for mobile or small spaces
 */
export function SearchPaginationCompact({
  className,
}: {
  className?: string;
}) {
  const { currentPage, totalPages, setPage } = useSearchPagination();

  if (totalPages <= 1) {
    return null;
  }

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-4',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setPage(currentPage - 1)}
        disabled={!canGoPrev}
        className={cn(
          'px-4 py-2',
          'text-sm font-medium',
          'rounded-lg',
          'border border-b2b-border',
          'transition-all duration-200',
          canGoPrev
            ? 'text-b2b-text-primary hover:bg-b2b-bg-tertiary hover:border-b2b-border-medium'
            : 'text-b2b-text-muted cursor-not-allowed opacity-50',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-b2b-primary focus-visible:ring-offset-2'
        )}
        aria-label="Page precedente"
      >
        Precedent
      </button>

      <span className="text-sm text-b2b-text-secondary tabular-nums">
        <span className="font-medium text-b2b-text-primary">{currentPage}</span>
        {' '}/ {totalPages}
      </span>

      <button
        type="button"
        onClick={() => setPage(currentPage + 1)}
        disabled={!canGoNext}
        className={cn(
          'px-4 py-2',
          'text-sm font-medium',
          'rounded-lg',
          'border border-b2b-border',
          'transition-all duration-200',
          canGoNext
            ? 'text-b2b-text-primary hover:bg-b2b-bg-tertiary hover:border-b2b-border-medium'
            : 'text-b2b-text-muted cursor-not-allowed opacity-50',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-b2b-primary focus-visible:ring-offset-2'
        )}
        aria-label="Page suivante"
      >
        Suivant
      </button>
    </div>
  );
}

/**
 * Load more button (alternative to pagination)
 */
export function SearchLoadMore({
  className,
  label = 'Charger plus de produits',
}: {
  className?: string;
  label?: string;
}) {
  const { currentPage, totalPages, setPage, totalResults, pageSize } =
    useSearchPagination();

  const loadedItems = currentPage * pageSize;
  const hasMore = loadedItems < totalResults;

  if (!hasMore) {
    return null;
  }

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <p className="text-sm text-b2b-text-secondary">
        {loadedItems} produits sur {totalResults.toLocaleString('fr-FR')}
      </p>
      <button
        type="button"
        onClick={() => setPage(currentPage + 1)}
        className={cn(
          'px-6 py-3',
          'text-sm font-medium',
          'text-b2b-primary',
          'bg-white',
          'border-2 border-b2b-primary',
          'rounded-lg',
          'transition-all duration-200',
          'hover:bg-b2b-primary hover:text-white',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-b2b-primary focus-visible:ring-offset-2'
        )}
      >
        {label}
      </button>
    </div>
  );
}

export default SearchPagination;
