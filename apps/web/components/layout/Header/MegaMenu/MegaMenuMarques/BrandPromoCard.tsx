'use client';

/**
 * BrandPromoCard Component
 *
 * A promotional card for featuring a specific brand or collection.
 * Designed for the MegaMenu footer area.
 *
 * Features:
 * - Dark, premium background
 * - Featured brand highlight
 * - Call-to-action link
 * - Responsive layout
 */

import { memo } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BrandPromoCardProps {
  /** Promo title */
  title: string;
  /** Promo subtitle/description */
  description: string;
  /** Label/badge text */
  label?: string;
  /** Link URL */
  href: string;
  /** CTA button text */
  ctaText?: string;
  /** Close menu callback */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const BrandPromoCard = memo(function BrandPromoCard({
  title,
  description,
  label = 'Nouveaute',
  href,
  ctaText = 'Decouvrir',
  onClose,
  className,
}: BrandPromoCardProps) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className={cn(
        // Base styles
        'block',
        'bg-gradient-to-br from-neutral-900 to-neutral-800',
        'rounded-xl',
        'p-5',
        'overflow-hidden',
        'relative',
        // Hover styles
        'hover:from-neutral-800 hover:to-neutral-700',
        // Focus styles
        'focus:outline-none',
        'focus-visible:ring-2 focus-visible:ring-accent/50',
        'focus-visible:ring-offset-2',
        // Transition
        'transition-all duration-200',
        // Group for child animations
        'group',
        className
      )}
    >
      {/* Decorative sparkle */}
      <div
        className={cn(
          'absolute top-4 right-4',
          'opacity-20 group-hover:opacity-40',
          'transition-opacity duration-200'
        )}
        aria-hidden="true"
      >
        <Sparkles className="w-12 h-12 text-amber-400" />
      </div>

      {/* Label badge */}
      <span
        className={cn(
          'inline-flex items-center',
          'text-xs font-semibold uppercase tracking-wider',
          'text-amber-400'
        )}
      >
        {label}
      </span>

      {/* Title */}
      <h4
        className={cn(
          'text-lg font-semibold text-white',
          'mt-2',
          'group-hover:text-amber-50',
          'transition-colors duration-200'
        )}
      >
        {title}
      </h4>

      {/* Description */}
      <p
        className={cn(
          'text-sm text-neutral-400',
          'mt-2',
          'line-clamp-2',
          'group-hover:text-neutral-300',
          'transition-colors duration-200'
        )}
      >
        {description}
      </p>

      {/* CTA */}
      <span
        className={cn(
          'inline-flex items-center gap-2',
          'mt-4',
          'text-sm font-medium',
          'text-amber-400',
          'group-hover:text-amber-300',
          'transition-colors duration-200'
        )}
      >
        <span>{ctaText}</span>
        <ArrowRight
          className={cn(
            'w-4 h-4',
            'group-hover:translate-x-1',
            'transition-transform duration-200'
          )}
        />
      </span>
    </Link>
  );
});

BrandPromoCard.displayName = 'BrandPromoCard';

export default BrandPromoCard;
