'use client';

/**
 * ProductSortSelect - Product sorting dropdown for category pages
 *
 * Features:
 * - Multiple sort options (relevance, price, newest)
 * - URL-based state management via searchParams
 * - Accessible with keyboard navigation
 * - Loading state indicator
 *
 * @packageDocumentation
 */

import { useCallback, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export type SortOption =
  | 'newest'
  | 'name_asc'
  | 'name_desc'
  | 'price_asc'
  | 'price_desc'
  | 'popular';

export interface ProductSortSelectProps {
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show label */
  showLabel?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'newest', label: 'Nouveautes' },
  { value: 'popular', label: 'Populaires' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix decroissant' },
  { value: 'name_asc', label: 'Nom A-Z' },
  { value: 'name_desc', label: 'Nom Z-A' },
];

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

// ============================================================================
// Main Component
// ============================================================================

export function ProductSortSelect({
  className,
  size = 'md',
  showLabel = true,
}: ProductSortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Get current sort from URL
  const currentSort = (searchParams.get('sort') as SortOption) || 'newest';

  // Handle sort change
  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      const params = new URLSearchParams(searchParams.toString());

      // Reset page when sort changes
      params.delete('page');

      if (value === 'newest') {
        params.delete('sort'); // Default value, no need to include in URL
      } else {
        params.set('sort', value);
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showLabel && (
        <label
          htmlFor="product-sort"
          className="text-sm text-neutral-600 whitespace-nowrap hidden sm:flex items-center"
        >
          <ArrowUpDown className="w-4 h-4 mr-1.5" />
          Trier par
        </label>
      )}
      <div className="relative">
        <select
          id="product-sort"
          value={currentSort}
          onChange={handleSortChange}
          aria-label="Trier les produits"
          className={cn(
            'appearance-none',
            'bg-white text-neutral-900',
            'border border-neutral-200 rounded-lg',
            'pr-10',
            'transition-all duration-200',
            'hover:border-neutral-300',
            'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20',
            sizeClasses[size],
            isPending && 'opacity-70 pointer-events-none',
            'min-w-[160px]'
          )}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none',
            isPending && 'hidden'
          )}
        />
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductSortSelect;
