'use client';

/**
 * BrandCard Component
 *
 * A card component displaying a single brand with logo, name, and product count.
 * Automatically falls back to initials when no logo is available.
 *
 * Features:
 * - Logo with lazy loading
 * - Initials fallback with deterministic colors
 * - Product count badge
 * - Premium tier indicator
 * - Accessible keyboard navigation
 * - Smooth hover animations
 */

import { memo, useCallback } from 'react';
import Link from 'next/link';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandLogo } from './BrandLogo';
import { BrandInitials } from './BrandInitials';
import type { BrandCardProps } from './types';

// Size configurations for different variants
const sizeConfig = {
  sm: {
    card: 'p-2',
    logo: 32,
    name: 'text-xs',
    count: 'text-[10px]',
  },
  md: {
    card: 'p-3',
    logo: 48,
    name: 'text-sm',
    count: 'text-xs',
  },
  lg: {
    card: 'p-4',
    logo: 64,
    name: 'text-base font-medium',
    count: 'text-sm',
  },
} as const;

export const BrandCard = memo(function BrandCard({
  brand,
  variant = 'grid',
  size = 'md',
  onSelect,
  onClose,
  className,
}: BrandCardProps) {
  const config = sizeConfig[size];
  const isPremium = brand.tier === 'premium';

  const handleClick = useCallback(() => {
    onSelect?.(brand);
    onClose?.();
  }, [brand, onSelect, onClose]);

  // Grid variant: vertical card with centered content
  if (variant === 'grid') {
    return (
      <Link
        href={`/marques/${brand.slug}`}
        onClick={handleClick}
        className={cn(
          // Base styles
          'flex flex-col items-center justify-center',
          'bg-white rounded-xl',
          'border border-neutral-200',
          config.card,
          // Hover styles
          'hover:border-neutral-300 hover:shadow-sm',
          'hover:bg-neutral-50/50',
          // Focus styles (accessibility)
          'focus:outline-none',
          'focus-visible:ring-2 focus-visible:ring-accent/30',
          'focus-visible:border-accent',
          // Transition
          'transition-all duration-150',
          // Premium variant
          isPremium && 'border-amber-200/50 hover:border-amber-300',
          // Group for child animations
          'group',
          className
        )}
        aria-label={`${brand.name} - ${brand.productCount} produits`}
      >
        {/* Premium badge */}
        {isPremium && (
          <div className="absolute top-2 right-2">
            <Crown
              className="w-3.5 h-3.5 text-amber-500"
              aria-label="Marque premium"
            />
          </div>
        )}

        {/* Logo or Initials */}
        <div className="relative mb-2 group-hover:scale-105 transition-transform duration-200">
          {brand.logoUrl ? (
            <BrandLogo
              src={brand.logoUrl}
              alt={brand.logoAlt || brand.name}
              size={config.logo}
              fallback={<BrandInitials name={brand.name} size={config.logo} />}
            />
          ) : (
            <BrandInitials name={brand.name} size={config.logo} />
          )}
        </div>

        {/* Brand name */}
        <span
          className={cn(
            'text-neutral-700 text-center',
            'group-hover:text-neutral-900',
            'transition-colors duration-150',
            'line-clamp-1',
            config.name
          )}
        >
          {brand.name}
        </span>

        {/* Product count */}
        <span
          className={cn(
            'text-neutral-400 mt-0.5',
            'group-hover:text-neutral-500',
            'transition-colors duration-150',
            config.count
          )}
        >
          {brand.productCount} produit{brand.productCount > 1 ? 's' : ''}
        </span>
      </Link>
    );
  }

  // List variant: horizontal row layout
  return (
    <Link
      href={`/marques/${brand.slug}`}
      onClick={handleClick}
      className={cn(
        // Base styles
        'flex items-center gap-3',
        'py-2 px-3 -mx-3',
        'rounded-lg',
        // Hover styles
        'hover:bg-neutral-50',
        // Focus styles (accessibility)
        'focus:outline-none',
        'focus-visible:ring-2 focus-visible:ring-accent/30',
        'focus-visible:bg-neutral-50',
        // Transition
        'transition-all duration-150',
        // Group for child animations
        'group',
        className
      )}
      aria-label={`${brand.name} - ${brand.productCount} produits`}
    >
      {/* Logo or Initials */}
      <div className="flex-shrink-0">
        {brand.logoUrl ? (
          <BrandLogo
            src={brand.logoUrl}
            alt={brand.logoAlt || brand.name}
            size={config.logo}
            fallback={<BrandInitials name={brand.name} size={config.logo} />}
            className="rounded-lg"
          />
        ) : (
          <BrandInitials name={brand.name} size={config.logo} />
        )}
      </div>

      {/* Brand info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-neutral-700 truncate',
              'group-hover:text-neutral-900',
              'transition-colors duration-150',
              config.name
            )}
          >
            {brand.name}
          </span>

          {/* Premium badge */}
          {isPremium && (
            <Crown
              className="w-3 h-3 text-amber-500 flex-shrink-0"
              aria-label="Marque premium"
            />
          )}
        </div>

        {/* Product count */}
        <span
          className={cn(
            'text-neutral-400 block',
            'group-hover:text-neutral-500',
            'transition-colors duration-150',
            config.count
          )}
        >
          {brand.productCount} produit{brand.productCount > 1 ? 's' : ''}
        </span>
      </div>

      {/* Chevron icon */}
      <svg
        className={cn(
          'w-4 h-4 text-neutral-300 flex-shrink-0',
          'group-hover:text-neutral-400 group-hover:translate-x-0.5',
          'transition-all duration-150'
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  );
});

BrandCard.displayName = 'BrandCard';

export default BrandCard;
