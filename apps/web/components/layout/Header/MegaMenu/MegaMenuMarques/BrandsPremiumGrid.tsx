'use client';

/**
 * BrandsPremiumGrid Component
 *
 * A grid display of premium/featured brands.
 * Shows larger cards with prominent visual treatment.
 *
 * Features:
 * - 2x3 grid on desktop
 * - 2x2 grid on tablet
 * - Horizontal scroll on mobile
 * - Premium visual indicators
 */

import { memo } from 'react';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandCard } from './BrandCard';
import type { BrandsPremiumGridProps } from './types';

export const BrandsPremiumGrid = memo(function BrandsPremiumGrid({
  brands,
  onClose,
  className,
}: BrandsPremiumGridProps) {
  if (!brands || brands.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Section header */}
      <h3
        className={cn(
          'flex items-center gap-2',
          'text-xs font-semibold uppercase tracking-wider',
          'text-neutral-500'
        )}
      >
        <Crown className="w-4 h-4 text-amber-500" aria-hidden="true" />
        <span>Marques Premium</span>
      </h3>

      {/* Grid of premium brands */}
      <div
        className={cn(
          // Mobile: horizontal scroll
          'flex gap-3 overflow-x-auto pb-2 -mb-2',
          'scrollbar-none',
          // Tablet and up: grid
          'sm:grid sm:grid-cols-2 sm:gap-3 sm:overflow-visible sm:pb-0 sm:mb-0',
          // Large desktop: 3 columns
          'lg:grid-cols-3'
        )}
        role="list"
        aria-label="Marques premium"
      >
        {brands.slice(0, 6).map((brand) => (
          <div
            key={brand.id}
            className={cn(
              // Mobile: fixed width for scroll
              'flex-shrink-0 w-32',
              // Tablet and up: flexible
              'sm:w-auto'
            )}
          >
            <BrandCard
              brand={brand}
              variant="grid"
              size="md"
              onClose={onClose}
              className={cn(
                'h-full',
                // Premium visual treatment
                'bg-gradient-to-b from-amber-50/30 to-white',
                'border-amber-200/40',
                'hover:border-amber-300/60'
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

BrandsPremiumGrid.displayName = 'BrandsPremiumGrid';

export default BrandsPremiumGrid;
