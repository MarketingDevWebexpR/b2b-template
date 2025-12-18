'use client';

/**
 * BrandInitials Component
 *
 * Displays brand initials as a fallback when no logo is available.
 * Uses deterministic colors based on the brand name for consistency.
 *
 * Features:
 * - Consistent colors based on brand name hash
 * - Accessible color contrast
 * - Multiple size variants
 * - Smooth animations
 */

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { getBrandColorPair, getBrandInitials } from './utils/brandColors';
import type { BrandInitialsProps } from './types';

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
} as const;

export const BrandInitials = memo(function BrandInitials({
  name,
  size = 48,
  className,
}: BrandInitialsProps) {
  const initials = getBrandInitials(name);
  const { bg, text } = getBrandColorPair(name);

  // Determine size class based on pixel size
  const sizeClass = size <= 32 ? sizeClasses.sm :
                    size <= 48 ? sizeClasses.md :
                    sizeClasses.lg;

  return (
    <div
      className={cn(
        // Base styles
        'flex items-center justify-center',
        'rounded-full',
        'font-semibold uppercase',
        'select-none',
        'transition-all duration-200',
        // Size
        sizeClass,
        className
      )}
      style={{
        backgroundColor: bg,
        color: text,
        width: size,
        height: size,
      }}
      role="img"
      aria-label={`Logo ${name}`}
    >
      {initials}
    </div>
  );
});

BrandInitials.displayName = 'BrandInitials';

export default BrandInitials;
