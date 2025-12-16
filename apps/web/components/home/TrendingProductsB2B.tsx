'use client';

/**
 * TrendingProductsB2B Component
 *
 * Displays trending/popular products in a B2B-optimized grid.
 * Uses ProductCardB2B component for product display.
 *
 * Features:
 * - Professional B2B styling (not luxury)
 * - Responsive grid layout
 * - ProductCardB2B integration
 * - Sort options (popular, newest, price)
 * - View more CTA
 *
 * Design: Clean, efficient, business-focused
 */

import { memo, useState, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  ProductCardB2B,
  createMockProductB2B,
  createMockPriceInfo,
  createMockStockInfo,
  type ProductCardVariant,
} from '@/components/products/ProductCardB2B';
import type { Product } from '@/types';

// ============================================================================
// Types
// ============================================================================

export interface TrendingProductsB2BProps {
  /** Products to display */
  products?: Product[];
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Maximum products to show */
  maxProducts?: number;
  /** Card variant */
  cardVariant?: ProductCardVariant;
  /** Show sort options */
  showSortOptions?: boolean;
  /** Link to view all products */
  viewAllLink?: string;
  /** Additional CSS classes */
  className?: string;
}

export type SortOption = 'popular' | 'newest' | 'price-asc' | 'price-desc';

// ============================================================================
// Mock Products (fallback when no products provided)
// ============================================================================

const mockProducts = [
  createMockProductB2B({
    id: '1',
    name: 'Bague Solitaire Diamant 0.5ct',
    reference: 'BAG-DIA-050',
    price: 1250,
    stock: 45,
    isNew: true,
  }),
  createMockProductB2B({
    id: '2',
    name: 'Collier Perles Akoya 7mm',
    reference: 'COL-PER-007',
    price: 890,
    stock: 23,
  }),
  createMockProductB2B({
    id: '3',
    name: 'Bracelet Tennis Diamants 2ct',
    reference: 'BRA-TEN-200',
    price: 3450,
    stock: 12,
    featured: true,
  }),
  createMockProductB2B({
    id: '4',
    name: 'Boucles Creoles Or 18K',
    reference: 'BOU-CRE-18K',
    price: 420,
    stock: 67,
  }),
  createMockProductB2B({
    id: '5',
    name: 'Alliance Or Blanc Platine',
    reference: 'ALL-PLT-001',
    price: 780,
    stock: 89,
  }),
  createMockProductB2B({
    id: '6',
    name: 'Pendentif Saphir Ceylon',
    reference: 'PEN-SAP-CEY',
    price: 1890,
    stock: 8,
    isNew: true,
  }),
  createMockProductB2B({
    id: '7',
    name: 'Montre Automatique Acier',
    reference: 'MON-AUT-001',
    price: 2100,
    stock: 15,
  }),
  createMockProductB2B({
    id: '8',
    name: 'Gourmette Argent Massif',
    reference: 'GOU-ARG-MAS',
    price: 185,
    stock: 124,
  }),
];

// ============================================================================
// Sub-components
// ============================================================================

interface SortButtonsProps {
  activeSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Populaires' },
  { value: 'newest', label: 'Nouveautes' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix decroissant' },
];

const SortButtons = memo(function SortButtons({
  activeSort,
  onSortChange,
}: SortButtonsProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Options de tri"
    >
      {sortOptions.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onSortChange(value)}
          className={cn(
            'px-4 py-2',
            'text-sm font-medium',
            'rounded-lg',
            'transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            activeSort === value
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
          )}
          aria-pressed={activeSort === value}
        >
          {label}
        </button>
      ))}
    </div>
  );
});

SortButtons.displayName = 'SortButtons';

// ============================================================================
// Main Component
// ============================================================================

export const TrendingProductsB2B = memo(function TrendingProductsB2B({
  products,
  title = 'Produits tendance',
  description = 'Les produits les plus commandes par nos clients professionnels',
  maxProducts = 8,
  cardVariant = 'grid',
  showSortOptions = true,
  viewAllLink = '/produits',
  className,
}: TrendingProductsB2BProps) {
  const [activeSort, setActiveSort] = useState<SortOption>('popular');

  // Use provided products or fallback to mock data
  const displayProducts = (products && products.length > 0)
    ? products.slice(0, maxProducts)
    : mockProducts.slice(0, maxProducts);

  const handleSortChange = useCallback((sort: SortOption) => {
    setActiveSort(sort);
    // In a real implementation, this would trigger a data fetch or sort
  }, []);

  const handleAddToCart = useCallback((productId: string, quantity: number) => {
    console.log('Add to cart:', productId, quantity);
    // TODO: Integrate with cart context
  }, []);

  const handleToggleFavorite = useCallback((productId: string) => {
    console.log('Toggle favorite:', productId);
    // TODO: Integrate with favorites context
  }, []);

  return (
    <section
      className={cn('py-12 lg:py-16', className)}
      aria-labelledby="trending-products-title"
    >
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h2
              id="trending-products-title"
              className="text-2xl font-bold text-neutral-900"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              {description}
            </p>
          </div>

          {/* Sort options */}
          {showSortOptions && (
            <SortButtons
              activeSort={activeSort}
              onSortChange={handleSortChange}
            />
          )}
        </div>

        {/* Products grid */}
        <div
          className={cn(
            'grid gap-4 lg:gap-6',
            cardVariant === 'grid'
              ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
              : 'grid-cols-1'
          )}
          role="list"
          aria-label="Liste des produits tendance"
        >
          {displayProducts.map((product, index) => (
            <ProductCardB2B
              key={product.id}
              product={product}
              variant={cardVariant}
              showStock
              showVolumeDiscount={false}
              showActions
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
              priority={index < 4}
            />
          ))}
        </div>

        {/* View all CTA */}
        <div className="mt-10 text-center">
          <Link
            href={viewAllLink}
            className={cn(
              'inline-flex items-center gap-2',
              'px-8 py-3',
              'text-sm font-medium',
              'text-accent hover:text-white',
              'bg-transparent hover:bg-accent',
              'border-2 border-accent',
              'rounded-lg',
              'transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
            )}
          >
            Voir tout le catalogue
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
});

TrendingProductsB2B.displayName = 'TrendingProductsB2B';

export default TrendingProductsB2B;
