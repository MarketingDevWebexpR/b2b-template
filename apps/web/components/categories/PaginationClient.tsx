'use client';

/**
 * PaginationClient - Client-side pagination with URL state
 *
 * @packageDocumentation
 */

import { useCallback, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Pagination } from '@/components/ui/Pagination';

// ============================================================================
// Types
// ============================================================================

export interface PaginationClientProps {
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Additional CSS classes */
  className?: string;
  /** Scroll to top on page change */
  scrollToTop?: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export function PaginationClient({
  currentPage,
  totalPages,
  className,
  scrollToTop = true,
}: PaginationClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());

      if (page === 1) {
        params.delete('page');
      } else {
        params.set('page', String(page));
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: scrollToTop });
      });
    },
    [pathname, router, searchParams, scrollToTop]
  );

  if (totalPages <= 1) return null;

  return (
    <div className={cn(isPending && 'opacity-50 pointer-events-none', className)}>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        size="md"
        showFirstLast
        showPrevNext
      />
    </div>
  );
}

export default PaginationClient;
