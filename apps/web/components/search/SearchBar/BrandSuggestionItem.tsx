'use client';

/**
 * BrandSuggestionItem Component
 *
 * Displays a brand suggestion in the search dropdown with:
 * - Brand logo (or placeholder icon)
 * - Brand name with highlight of matching text
 * - Country of origin badge
 * - Product count badge
 * - Keyboard navigation support
 *
 * @packageDocumentation
 */

import { memo, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { MarqueSuggestion } from '@/lib/search/medusa-search-client';

// ============================================================================
// Icons
// ============================================================================

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

// ============================================================================
// Types
// ============================================================================

export interface BrandSuggestionItemProps {
  /** Brand suggestion data */
  brand: MarqueSuggestion;
  /** Current search query for highlighting */
  query: string;
  /** Whether this item is currently active/focused */
  isActive: boolean;
  /** Index for accessibility */
  index: number;
  /** Click handler */
  onClick: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate initials from brand name (max 2 characters)
 * Examples:
 * - "Cartier" -> "CA"
 * - "Van Cleef & Arpels" -> "VA"
 * - "LVMH" -> "LV"
 * - "Dior" -> "DI"
 */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    // Take first letter of first two words
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  // Take first two letters of single word
  return name.substring(0, 2).toUpperCase();
}

/**
 * Highlights matching text in a string
 */
function highlightText(text: string, query: string): JSX.Element {
  if (!query.trim()) {
    return <>{text}</>;
  }

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-orange-100 text-orange-700 rounded px-0.5 font-medium"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

// ============================================================================
// Component
// ============================================================================

export const BrandSuggestionItem = memo(function BrandSuggestionItem({
  brand,
  query,
  isActive,
  index,
  onClick,
}: BrandSuggestionItemProps) {
  // Brand logo or initials fallback
  const logoElement = useMemo(() => {
    if (brand.logo_url) {
      return (
        <Image
          src={brand.logo_url}
          alt={`Logo ${brand.name}`}
          width={40}
          height={40}
          className="object-contain"
        />
      );
    }

    // Show initials when no logo
    const initials = getInitials(brand.name);
    return (
      <span
        className={cn(
          'text-sm font-bold',
          'text-blue-700',
          'select-none'
        )}
      >
        {initials}
      </span>
    );
  }, [brand.logo_url, brand.name]);

  return (
    <Link
      href={`/marques/${brand.slug}`}
      role="option"
      id={`search-brand-${index}`}
      aria-selected={isActive}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        'w-full flex items-center gap-3',
        'px-4 py-3',
        'text-left',
        'transition-colors duration-150',
        'focus:outline-none',
        'group',
        isActive
          ? 'bg-blue-50'
          : 'hover:bg-neutral-50'
      )}
    >
      {/* Brand Logo/Icon Container */}
      <div
        className={cn(
          'flex items-center justify-center',
          'w-10 h-10',
          brand.logo_url
            ? 'bg-white'
            : 'bg-gradient-to-br from-blue-100 to-indigo-100',
          'border border-blue-200',
          'rounded-lg',
          'flex-shrink-0',
          'overflow-hidden',
          'transition-all duration-200',
          isActive && 'border-blue-400 shadow-sm',
          'group-hover:border-blue-300'
        )}
      >
        {logoElement}
      </div>

      {/* Brand Info */}
      <div className="flex-1 min-w-0 overflow-hidden">
        {/* Brand Name */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium',
              'text-neutral-900',
              'truncate'
            )}
          >
            {highlightText(brand.name, query)}
          </span>

          {/* Country Badge */}
          {brand.country && (
            <span
              className={cn(
                'inline-flex items-center gap-1',
                'px-1.5 py-0.5',
                'text-xs',
                'bg-neutral-100 text-neutral-600',
                'rounded',
                'transition-colors duration-200',
                isActive && 'bg-blue-100 text-blue-700',
                'group-hover:bg-blue-100 group-hover:text-blue-700'
              )}
            >
              <GlobeIcon className="w-3 h-3" />
              {brand.country}
            </span>
          )}
        </div>

        {/* Brand Stats */}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-neutral-500">
            Voir les produits de cette marque
          </span>
        </div>
      </div>

      {/* Product Count Badge */}
      {brand.product_count > 0 && (
        <div
          className={cn(
            'flex-shrink-0',
            'px-2 py-0.5',
            'text-xs font-medium',
            'bg-neutral-100 text-neutral-600',
            'rounded-full',
            'transition-colors duration-200',
            isActive && 'bg-blue-100 text-blue-700',
            'group-hover:bg-blue-100 group-hover:text-blue-700'
          )}
        >
          {brand.product_count} {brand.product_count === 1 ? 'produit' : 'produits'}
        </div>
      )}

      {/* Arrow Indicator */}
      <ChevronRightIcon
        className={cn(
          'w-4 h-4 flex-shrink-0',
          'text-neutral-400',
          'transition-all duration-200',
          isActive && 'text-blue-500 translate-x-0.5',
          'group-hover:text-blue-500 group-hover:translate-x-0.5'
        )}
      />
    </Link>
  );
});

BrandSuggestionItem.displayName = 'BrandSuggestionItem';

export default BrandSuggestionItem;
