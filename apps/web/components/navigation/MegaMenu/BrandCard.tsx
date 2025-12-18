'use client';

/**
 * BrandCard Component
 *
 * Displays a brand in a compact or full card format for the MegaMenu.
 * Features brand logo with initials fallback, name, product count,
 * and smooth hover animations using Framer Motion.
 *
 * @example
 * // Compact variant for grid display
 * <BrandCard brand={brandData} variant="compact" />
 *
 * // Full variant with priority loading
 * <BrandCard brand={brandData} variant="full" priority />
 */

import { memo, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { easeOut } from '@/lib/animation';
import type { BrandCardData } from '@/types/brand';

// ============================================================================
// Types
// ============================================================================

export interface BrandCardProps {
  /** Brand data to display */
  brand: BrandCardData;
  /** Display variant - compact for grids, full for featured sections */
  variant?: 'compact' | 'full';
  /** Priority loading for above-the-fold images */
  priority?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Animation Variants
// ============================================================================

/**
 * Subtle hover animation for the card container
 */
const cardVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: easeOut,
    },
  },
};

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Brand initials fallback when logo is not available
 */
interface BrandInitialsProps {
  initials: string;
  bgColor: string;
  textColor: string;
  size: 'sm' | 'md';
}

const BrandInitials = memo(function BrandInitials({
  initials,
  bgColor,
  textColor,
  size,
}: BrandInitialsProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-base',
    md: 'w-16 h-16 text-lg',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        'rounded-full',
        'font-semibold',
        'select-none',
        'transition-transform duration-200',
        sizeClasses[size]
      )}
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
});

BrandInitials.displayName = 'BrandInitials';

/**
 * Brand logo with loading state and error fallback
 */
interface BrandLogoProps {
  logoUrl: string;
  brandName: string;
  size: 'sm' | 'md';
  priority: boolean;
  fallback: React.ReactNode;
}

const BrandLogo = memo(function BrandLogo({
  logoUrl,
  brandName,
  size,
  priority,
  fallback,
}: BrandLogoProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
  };

  const handleLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setImageError(true);
  }, []);

  // Show fallback on error
  if (imageError) {
    return <>{fallback}</>;
  }

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        'rounded-lg overflow-hidden',
        'bg-white',
        sizeClasses[size]
      )}
    >
      {/* Loading skeleton */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-neutral-100 animate-pulse rounded-lg" />
      )}

      <Image
        src={logoUrl}
        alt={`Logo ${brandName}`}
        fill
        sizes={size === 'sm' ? '48px' : '64px'}
        className={cn(
          'object-contain p-1',
          'transition-opacity duration-300',
          imageLoaded ? 'opacity-100' : 'opacity-0'
        )}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
});

BrandLogo.displayName = 'BrandLogo';

// ============================================================================
// Main Component
// ============================================================================

/**
 * BrandCard displays brand information with logo/initials fallback,
 * name, product count, and smooth hover effects.
 *
 * Supports two variants:
 * - `compact`: Smaller card for grid layouts (48x48 logo)
 * - `full`: Larger card for featured sections (64x64 logo)
 */
export const BrandCard = memo(function BrandCard({
  brand,
  variant = 'compact',
  priority = false,
  className,
}: BrandCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // Determine sizes based on variant
  const logoSize = variant === 'compact' ? 'sm' : 'md';
  const isCompact = variant === 'compact';

  // Prefetch brand page on hover
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    router.prefetch(`/marques/${brand.slug}`);
  }, [router, brand.slug]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Build the initials fallback element
  const initialsFallback = (
    <BrandInitials
      initials={brand.initials}
      bgColor={brand.color.bg}
      textColor={brand.color.text}
      size={logoSize}
    />
  );

  return (
    <motion.article
      className={cn('group', className)}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={`/marques/${brand.slug}`}
        className={cn(
          // Base styles
          'block',
          'rounded-lg',
          'border border-neutral-200',
          'bg-white',
          'transition-all duration-200 ease-out',
          // Sizing based on variant
          isCompact ? 'p-3' : 'p-4',
          // Hover effects
          'hover:shadow-md hover:border-amber-200 hover:bg-amber-50/30',
          // Focus styles for accessibility
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2'
        )}
        aria-label={`Voir la marque ${brand.name} - ${brand.product_count} produit${brand.product_count !== 1 ? 's' : ''}`}
      >
        <div
          className={cn(
            'flex items-center',
            isCompact ? 'gap-3' : 'gap-4'
          )}
        >
          {/* Logo or Initials */}
          <div
            className={cn(
              'shrink-0',
              'transition-transform duration-200',
              isHovered && 'scale-105'
            )}
          >
            {brand.logo_url ? (
              <BrandLogo
                logoUrl={brand.logo_url}
                brandName={brand.name}
                size={logoSize}
                priority={priority}
                fallback={initialsFallback}
              />
            ) : (
              initialsFallback
            )}
          </div>

          {/* Brand Info */}
          <div className="flex-1 min-w-0">
            {/* Brand Name */}
            <h3
              className={cn(
                'font-medium text-neutral-900',
                'truncate',
                'transition-colors duration-150',
                'group-hover:text-amber-700',
                isCompact ? 'text-sm' : 'text-base'
              )}
            >
              {brand.name}
            </h3>

            {/* Product Count */}
            <p
              className={cn(
                'text-neutral-500',
                'mt-0.5',
                isCompact ? 'text-xs' : 'text-sm'
              )}
            >
              ({brand.product_count} produit{brand.product_count !== 1 ? 's' : ''})
            </p>

            {/* Premium badge for full variant */}
            {!isCompact && brand.is_premium && (
              <span
                className={cn(
                  'inline-flex items-center',
                  'mt-2 px-2 py-0.5',
                  'text-xs font-medium',
                  'text-amber-700 bg-amber-100',
                  'rounded-full'
                )}
              >
                Premium
              </span>
            )}
          </div>

          {/* Hover indicator arrow */}
          <div
            className={cn(
              'shrink-0',
              'text-neutral-300',
              'transition-all duration-200',
              'group-hover:text-amber-500 group-hover:translate-x-0.5'
            )}
            aria-hidden="true"
          >
            <svg
              className={cn(isCompact ? 'w-4 h-4' : 'w-5 h-5')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </Link>
    </motion.article>
  );
});

BrandCard.displayName = 'BrandCard';

export default BrandCard;
