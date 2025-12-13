'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ArrowRight } from 'lucide-react';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/products/ProductCard';

interface CollectionProductsGridProps {
  /** All products to display (pagination is handled client-side) */
  products: Product[];
  /** Initial number of products to show */
  initialCount?: number;
  /** Number of products to load per "Load More" click */
  loadIncrement?: number;
  /** Callback when product is added to cart */
  onQuickAdd?: (product: Product) => void;
  /** Additional CSS classes */
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const emptyStateVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

/**
 * CollectionProductsGrid - Responsive product grid for collection pages
 *
 * Features:
 * - Responsive grid: 1 col mobile, 2 cols tablet, 3-4 cols desktop
 * - Staggered framer-motion animations on load
 * - Client-side "Load More" pagination
 * - Elegant empty state with link to all collections
 * - Accessible with proper ARIA attributes
 */
export function CollectionProductsGrid({
  products,
  initialCount = 12,
  loadIncrement = 8,
  onQuickAdd,
  className,
}: CollectionProductsGridProps) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  // Get visible products
  const visibleProducts = products.slice(0, visibleCount);
  const totalCount = products.length;
  const hasMore = visibleCount < totalCount;

  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    // Simulate slight delay for smoother UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    setVisibleCount((prev) => Math.min(prev + loadIncrement, totalCount));
    setIsLoading(false);
  }, [isLoading, hasMore, loadIncrement, totalCount]);

  // Empty state
  if (products.length === 0) {
    return (
      <motion.div
        className={cn('py-16 text-center', className)}
        variants={emptyStateVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mx-auto flex flex-col items-center gap-6">
          {/* Icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-background-warm">
            <Package
              className="h-10 w-10 text-text-light"
              strokeWidth={1}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <p className="font-serif text-xl text-text-primary">
              Aucun produit dans cette collection
            </p>
            <p className="font-sans text-sm text-text-muted">
              Explorez nos autres collections pour decouvrir nos creations.
            </p>
          </div>

          {/* Link to all collections */}
          <Link
            href="/collections"
            className={cn(
              'group mt-4 inline-flex items-center gap-2',
              'border border-hermes-500 bg-transparent px-8 py-3',
              'font-sans text-xs uppercase tracking-luxe text-hermes-500',
              'transition-all duration-400',
              'hover:bg-hermes-500 hover:text-white',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2'
            )}
          >
            <span>Voir toutes les collections</span>
            <ArrowRight
              className="h-4 w-4 transition-transform duration-350 group-hover:translate-x-1"
              strokeWidth={1.5}
            />
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={className}>
      {/* Products Grid - Responsive */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        role="list"
        aria-label="Produits de la collection"
      >
        <AnimatePresence mode="popLayout">
          {visibleProducts.map((product, index) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
              role="listitem"
            >
              <ProductCard
                product={product}
                onQuickAdd={onQuickAdd}
                priority={index < 4}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Load More Button */}
      {hasMore && (
        <motion.div
          className="mt-12 flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Progress indicator */}
          <p className="font-sans text-sm text-text-muted">
            <span className="font-medium text-text-primary">{visibleCount}</span>
            {' sur '}
            <span className="font-medium text-text-primary">{totalCount}</span>
            {' produits'}
          </p>

          {/* Load More Button */}
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className={cn(
              'group inline-flex items-center gap-2',
              'border border-hermes-500 bg-transparent px-8 py-3',
              'font-sans text-xs uppercase tracking-luxe text-hermes-500',
              'transition-all duration-400',
              'hover:bg-hermes-500 hover:text-white',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            aria-label={`Charger ${Math.min(loadIncrement, totalCount - visibleCount)} produits supplementaires`}
          >
            {isLoading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Chargement...</span>
              </>
            ) : (
              <span>Charger plus</span>
            )}
          </button>
        </motion.div>
      )}

      {/* All products loaded message */}
      {!hasMore && products.length > initialCount && (
        <motion.p
          className="mt-12 text-center font-sans text-xs uppercase tracking-luxe text-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Vous avez vu tous les {totalCount} produits
        </motion.p>
      )}
    </div>
  );
}

export default CollectionProductsGrid;
