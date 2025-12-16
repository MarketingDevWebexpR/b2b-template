'use client';

/**
 * ComparisonDrawer - Floating Bottom Drawer
 *
 * Fixed bar at the bottom of the page showing:
 * - Product thumbnails with remove buttons
 * - Compare button with count
 * - Only visible when >= 1 product is selected
 *
 * @packageDocumentation
 */

import { memo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useComparison, MAX_COMPARISON_ITEMS } from './ComparisonContext';
import type { Product } from '@/types';

// ============================================================================
// Types
// ============================================================================

export interface ComparisonDrawerProps {
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the "Compare" button that opens the modal */
  showCompareButton?: boolean;
  /** Custom compare action (if not using modal) */
  onCompare?: () => void;
  /** Whether to link to the comparison page instead of opening modal */
  linkToPage?: boolean;
}

// ============================================================================
// Sub-Components
// ============================================================================

interface ProductThumbnailProps {
  product: Product;
  onRemove: (productId: string) => void;
}

const ProductThumbnail = memo(function ProductThumbnail({
  product,
  onRemove,
}: ProductThumbnailProps) {
  const handleRemove = useCallback(() => {
    onRemove(product.id);
  }, [product.id, onRemove]);

  return (
    <div
      className={cn(
        'relative group',
        'w-14 h-14 sm:w-16 sm:h-16',
        'rounded-lg overflow-hidden',
        'bg-neutral-100',
        'border border-neutral-200',
        'flex-shrink-0',
        'transition-all duration-200',
        'hover:border-accent'
      )}
    >
      {/* Product image */}
      <Image
        src={product.images[0] || '/images/placeholder-product.jpg'}
        alt={product.name}
        fill
        className="object-cover"
        sizes="64px"
      />

      {/* Remove button */}
      <button
        type="button"
        onClick={handleRemove}
        className={cn(
          'absolute -top-1 -right-1',
          'w-5 h-5',
          'flex items-center justify-center',
          'bg-red-600 text-white',
          'rounded-full',
          'opacity-0 group-hover:opacity-100',
          'transition-opacity duration-150',
          'focus:opacity-100 focus:outline-none',
          'focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1',
          'shadow-sm'
        )}
        aria-label={`Retirer ${product.name} de la comparaison`}
      >
        <svg
          className="w-3 h-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Product name tooltip on hover */}
      <div
        className={cn(
          'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
          'px-2 py-1',
          'bg-neutral-900 text-white',
          'text-xs whitespace-nowrap',
          'rounded',
          'opacity-0 group-hover:opacity-100',
          'transition-opacity duration-150',
          'pointer-events-none',
          'z-10'
        )}
        role="tooltip"
      >
        {product.name}
        <div
          className={cn(
            'absolute top-full left-1/2 -translate-x-1/2',
            'border-4 border-transparent border-t-neutral-900'
          )}
        />
      </div>
    </div>
  );
});

interface EmptySlotProps {
  index: number;
}

const EmptySlot = memo(function EmptySlot({ index }: EmptySlotProps) {
  return (
    <div
      className={cn(
        'w-14 h-14 sm:w-16 sm:h-16',
        'rounded-lg',
        'border-2 border-dashed border-neutral-200',
        'bg-neutral-50',
        'flex-shrink-0',
        'flex items-center justify-center'
      )}
      aria-hidden="true"
    >
      <span className="text-neutral-500 text-xs font-medium">
        +
      </span>
    </div>
  );
});

// ============================================================================
// Main Component
// ============================================================================

export const ComparisonDrawer = memo(function ComparisonDrawer({
  className,
  showCompareButton = true,
  onCompare,
  linkToPage = false,
}: ComparisonDrawerProps) {
  const {
    products,
    count,
    isDrawerVisible,
    removeFromCompare,
    clearComparison,
    openModal,
  } = useComparison();

  const handleCompare = useCallback(() => {
    if (onCompare) {
      onCompare();
    } else {
      openModal();
    }
  }, [onCompare, openModal]);

  // Don't render if no products
  if (!isDrawerVisible) {
    return null;
  }

  // Calculate empty slots
  const emptySlots = MAX_COMPARISON_ITEMS - count;

  const drawerContent = (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'lg:left-72', // Account for B2B sidebar
        'animate-in slide-in-from-bottom-full duration-300'
      )}
      role="region"
      aria-label="Produits en comparaison"
    >
      {/* Drawer container */}
      <div
        className={cn(
          'bg-white',
          'border-t border-neutral-200',
          'shadow-[0_-4px_16px_rgba(0,0,0,0.08)]',
          className
        )}
      >
        <div
          className={cn(
            'flex items-center justify-between gap-4',
            'px-4 sm:px-6',
            'h-20 sm:h-24',
            'max-w-content-wide mx-auto'
          )}
        >
          {/* Left: Product thumbnails */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-2">
            {/* Selected products */}
            {products.map((product) => (
              <ProductThumbnail
                key={product.id}
                product={product}
                onRemove={removeFromCompare}
              />
            ))}

            {/* Empty slots */}
            {Array.from({ length: emptySlots }).map((_, index) => (
              <EmptySlot key={`empty-${index}`} index={index} />
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Clear button */}
            <button
              type="button"
              onClick={clearComparison}
              className={cn(
                'px-3 py-2',
                'text-sm font-medium',
                'text-neutral-600',
                'hover:text-red-600',
                'transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
                'rounded-lg',
                'hidden sm:block'
              )}
              aria-label="Vider la comparaison"
            >
              Vider
            </button>

            {/* Mobile clear button (icon only) */}
            <button
              type="button"
              onClick={clearComparison}
              className={cn(
                'p-2',
                'text-neutral-600',
                'hover:text-red-600 hover:bg-red-50',
                'transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
                'rounded-lg',
                'sm:hidden'
              )}
              aria-label="Vider la comparaison"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>

            {/* Compare button */}
            {showCompareButton && count >= 2 && (
              linkToPage ? (
                <Link
                  href={`/comparer?ids=${products.map((p) => p.id).join(',')}`}
                  className={cn(
                    'inline-flex items-center gap-2',
                    'px-4 sm:px-5 py-2.5 sm:py-3',
                    'bg-accent text-white',
                    'text-sm font-medium',
                    'rounded-lg',
                    'hover:bg-accent/90',
                    'transition-colors duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                    'shadow-sm'
                  )}
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                  <span>
                    Comparer
                    <span className="hidden sm:inline"> ({count})</span>
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleCompare}
                  className={cn(
                    'inline-flex items-center gap-2',
                    'px-4 sm:px-5 py-2.5 sm:py-3',
                    'bg-accent text-white',
                    'text-sm font-medium',
                    'rounded-lg',
                    'hover:bg-accent/90',
                    'transition-colors duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                    'shadow-sm'
                  )}
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <span>
                    Comparer
                    <span className="hidden sm:inline"> ({count})</span>
                  </span>
                </button>
              )
            )}

            {/* Disabled compare button when less than 2 products */}
            {showCompareButton && count < 2 && (
              <div
                className={cn(
                  'inline-flex items-center gap-2',
                  'px-4 sm:px-5 py-2.5 sm:py-3',
                  'bg-neutral-100 text-neutral-500',
                  'text-sm font-medium',
                  'rounded-lg',
                  'cursor-not-allowed'
                )}
                title="Selectionnez au moins 2 produits"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span className="hidden sm:inline">Min. 2 produits</span>
                <span className="sm:hidden">+1</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render in portal for proper z-index stacking
  if (typeof window !== 'undefined') {
    return createPortal(drawerContent, document.body);
  }

  return null;
});

export default ComparisonDrawer;
