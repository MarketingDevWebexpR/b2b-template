'use client';

/**
 * BrandsSkeleton Component
 *
 * Loading skeleton for the brands mega menu.
 * Provides visual feedback while data is being fetched.
 *
 * Features:
 * - Matching layout structure
 * - Smooth shimmer animation
 * - Accessible (hidden from screen readers)
 */

import { memo } from 'react';
import { cn } from '@/lib/utils';

interface BrandsSkeletonProps {
  /** Additional CSS classes */
  className?: string;
}

// Skeleton shimmer base class
const shimmerClass = cn(
  'relative overflow-hidden',
  'bg-neutral-100',
  'before:absolute before:inset-0',
  'before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
  'before:animate-[shimmer_1.5s_infinite]',
  'before:translate-x-[-100%]'
);

export const BrandsSkeleton = memo(function BrandsSkeleton({
  className,
}: BrandsSkeletonProps) {
  return (
    <div
      className={cn('animate-pulse', className)}
      aria-hidden="true"
      role="presentation"
    >
      {/* Search bar skeleton */}
      <div className={cn(shimmerClass, 'h-10 rounded-lg mb-6')} />

      <div className="grid grid-cols-12 gap-6">
        {/* Premium brands section skeleton */}
        <div className="col-span-4">
          {/* Section title */}
          <div className={cn(shimmerClass, 'h-4 w-32 rounded mb-4')} />

          {/* Grid of cards */}
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  shimmerClass,
                  'aspect-square rounded-xl'
                )}
              />
            ))}
          </div>
        </div>

        {/* Alphabetical list skeleton */}
        <div className="col-span-5">
          {/* Section title */}
          <div className={cn(shimmerClass, 'h-4 w-40 rounded mb-3')} />

          {/* Alphabet nav */}
          <div className="flex gap-1 mb-3 pb-3 border-b border-neutral-100">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className={cn(shimmerClass, 'w-7 h-7 rounded-md')}
              />
            ))}
          </div>

          {/* Brand list items */}
          <div className="space-y-3">
            {/* Letter header */}
            <div className={cn(shimmerClass, 'h-4 w-8 rounded')} />

            {/* Brand rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={cn(shimmerClass, 'w-8 h-8 rounded-full')} />
                <div className="flex-1 space-y-1">
                  <div className={cn(shimmerClass, 'h-4 w-24 rounded')} />
                  <div className={cn(shimmerClass, 'h-3 w-16 rounded')} />
                </div>
              </div>
            ))}

            {/* Another letter header */}
            <div className={cn(shimmerClass, 'h-4 w-8 rounded mt-4')} />

            {/* More brand rows */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`b-${i}`} className="flex items-center gap-3">
                <div className={cn(shimmerClass, 'w-8 h-8 rounded-full')} />
                <div className="flex-1 space-y-1">
                  <div className={cn(shimmerClass, 'h-4 w-28 rounded')} />
                  <div className={cn(shimmerClass, 'h-3 w-14 rounded')} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promo card skeleton */}
        <div className="col-span-3">
          <div className={cn(shimmerClass, 'h-full rounded-xl min-h-[200px]')} />
        </div>
      </div>
    </div>
  );
});

BrandsSkeleton.displayName = 'BrandsSkeleton';

export default BrandsSkeleton;
