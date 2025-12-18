'use client';

/**
 * BrandCard Component
 *
 * Displays a brand card with logo, name, and product count.
 * Features hover effects, fallback initials, and premium badge.
 *
 * @packageDocumentation
 */

import { memo, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Award, ExternalLink, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import type { Brand, BrandCardData, BrandColor } from '@/types/brand';

// ============================================================================
// Types
// ============================================================================

export interface BrandCardProps {
  /** Brand data */
  brand: Brand | BrandCardData;
  /** Card variant */
  variant?: 'default' | 'compact' | 'featured';
  /** Show product count */
  showProductCount?: boolean;
  /** Show country */
  showCountry?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Priority loading for images */
  priority?: boolean;
  /** On click handler (optional, overrides link) */
  onClick?: (brand: Brand | BrandCardData) => void;
}

// ============================================================================
// Constants
// ============================================================================

const BRAND_COLORS: BrandColor[] = [
  { bg: '#fef3c7', text: '#92400e' }, // Amber
  { bg: '#dbeafe', text: '#1e40af' }, // Blue
  { bg: '#dcfce7', text: '#166534' }, // Green
  { bg: '#fce7f3', text: '#9d174d' }, // Pink
  { bg: '#e0e7ff', text: '#3730a3' }, // Indigo
  { bg: '#ffedd5', text: '#c2410c' }, // Orange
  { bg: '#f3e8ff', text: '#7c3aed' }, // Purple
  { bg: '#ccfbf1', text: '#0f766e' }, // Teal
  { bg: '#fef9c3', text: '#854d0e' }, // Yellow
  { bg: '#fee2e2', text: '#b91c1c' }, // Red
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generates initials from brand name
 */
function getInitials(name: string): string {
  const words = name.split(' ').filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Gets consistent color for brand based on name
 */
function getBrandColor(name: string): BrandColor {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return BRAND_COLORS[hash % BRAND_COLORS.length];
}

// ============================================================================
// Sub-Components
// ============================================================================

interface BrandLogoProps {
  brand: Brand | BrandCardData;
  size: 'sm' | 'md' | 'lg';
  priority?: boolean;
}

const BrandLogo = memo(function BrandLogo({ brand, size, priority }: BrandLogoProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleError = useCallback(() => setImageError(true), []);
  const handleLoad = useCallback(() => setImageLoaded(true), []);

  // Size configurations
  const sizeConfig = {
    sm: { container: 'w-12 h-12', text: 'text-sm' },
    md: { container: 'w-16 h-16', text: 'text-lg' },
    lg: { container: 'w-24 h-24', text: 'text-2xl' },
  };

  const { container, text } = sizeConfig[size];

  // Get initials and color (from BrandCardData or generate)
  const initials = 'initials' in brand ? brand.initials : getInitials(brand.name);
  const color = 'color' in brand ? brand.color : getBrandColor(brand.name);

  // Show logo if available and not errored
  if (brand.logo_url && !imageError) {
    return (
      <div className={cn('relative rounded-lg overflow-hidden bg-white', container)}>
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-neutral-100 animate-pulse" />
        )}
        <Image
          src={brand.logo_url}
          alt={`Logo ${brand.name}`}
          fill
          sizes={size === 'lg' ? '96px' : size === 'md' ? '64px' : '48px'}
          className={cn(
            'object-contain p-2 transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          priority={priority}
          onError={handleError}
          onLoad={handleLoad}
        />
      </div>
    );
  }

  // Fallback: show initials
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg font-bold',
        container,
        text
      )}
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {initials}
    </div>
  );
});

BrandLogo.displayName = 'BrandLogo';

// ============================================================================
// Main Component
// ============================================================================

/**
 * BrandCard - Brand display card component
 *
 * @example
 * ```tsx
 * // Default variant
 * <BrandCard brand={brand} />
 *
 * // Featured variant with country
 * <BrandCard brand={brand} variant="featured" showCountry />
 *
 * // Compact variant
 * <BrandCard brand={brand} variant="compact" />
 * ```
 */
export const BrandCard = memo(function BrandCard({
  brand,
  variant = 'default',
  showProductCount = true,
  showCountry = false,
  className,
  priority = false,
  onClick,
}: BrandCardProps) {
  const isPremium = brand.is_premium || brand.is_favorite;
  const country = 'country' in brand ? brand.country : null;

  // Size based on variant
  const logoSize = variant === 'featured' ? 'lg' : variant === 'compact' ? 'sm' : 'md';

  // Card content
  const CardContent = (
    <motion.div
      className={cn(
        'group relative bg-white rounded-xl overflow-hidden',
        'border border-neutral-200',
        'transition-all duration-300 ease-out',
        'hover:shadow-lg hover:border-neutral-300 hover:-translate-y-1',
        'focus-within:ring-2 focus-within:ring-accent/50',
        variant === 'featured' && 'p-6',
        variant === 'default' && 'p-4',
        variant === 'compact' && 'p-3',
        className
      )}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute top-2 right-2 z-10">
          <Tooltip tooltipContent="Marque premium">
            <Badge variant="primary" size="sm" className="gap-1">
              <Award className="w-3 h-3" />
              {variant !== 'compact' && 'Premium'}
            </Badge>
          </Tooltip>
        </div>
      )}

      {/* Content Layout */}
      <div
        className={cn(
          'flex items-center',
          variant === 'featured' ? 'flex-col text-center gap-4' : 'gap-4'
        )}
      >
        {/* Logo */}
        <BrandLogo brand={brand} size={logoSize} priority={priority} />

        {/* Info */}
        <div
          className={cn(
            'flex-1 min-w-0',
            variant === 'featured' && 'text-center'
          )}
        >
          {/* Brand Name */}
          <h3
            className={cn(
              'font-semibold text-neutral-900 truncate',
              'transition-colors duration-200 group-hover:text-accent',
              variant === 'featured' ? 'text-lg' : 'text-sm'
            )}
          >
            {brand.name}
          </h3>

          {/* Country */}
          {showCountry && country && (
            <p
              className={cn(
                'flex items-center gap-1 text-neutral-500 mt-1',
                variant === 'featured' ? 'justify-center text-sm' : 'text-xs'
              )}
            >
              <MapPin className="w-3 h-3" />
              {country}
            </p>
          )}

          {/* Product Count */}
          {showProductCount && (
            <p
              className={cn(
                'text-neutral-400 mt-1',
                variant === 'featured' ? 'text-sm' : 'text-xs'
              )}
            >
              {brand.product_count} produit{brand.product_count !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Arrow indicator for non-featured */}
        {variant !== 'featured' && (
          <ExternalLink
            className={cn(
              'w-4 h-4 text-neutral-300 flex-shrink-0',
              'transition-all duration-200',
              'group-hover:text-accent group-hover:translate-x-1'
            )}
          />
        )}
      </div>
    </motion.div>
  );

  // Wrap with link or button
  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(brand)}
        className="w-full text-left focus:outline-none"
        aria-label={`Voir la marque ${brand.name}`}
      >
        {CardContent}
      </button>
    );
  }

  return (
    <Link
      href={`/marques/${brand.slug}`}
      className="block focus:outline-none"
      aria-label={`Voir la marque ${brand.name}`}
    >
      {CardContent}
    </Link>
  );
});

BrandCard.displayName = 'BrandCard';

export default BrandCard;
