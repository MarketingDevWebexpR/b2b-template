'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/products/ProductCard';
import { LoadMore } from '@/components/ui/LoadMore';

interface CategoryProductsGridProps {
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
      staggerChildren: 0.08,
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
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

/**
 * CategoryProductsGrid - 5-column product grid with load more pagination
 *
 * Features:
 * - 5 columns on desktop (matching FeaturedProducts)
 * - Staggered animation on initial load and when loading more
 * - Client-side pagination with smooth transitions
 * - Empty state handling
 */
export function CategoryProductsGrid({
  products,
  initialCount = 15,
  loadIncrement = 10,
  onQuickAdd,
  className,
}: CategoryProductsGridProps) {
  const [visibleCount, setVisibleCount] = useState(initialCount);

  // Get visible products
  const visibleProducts = products.slice(0, visibleCount);
  const totalCount = products.length;

  const handleLoadMore = useCallback((newCount: number) => {
    // Simulate slight delay for smoother UX
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setVisibleCount(newCount);
        resolve();
      }, 300);
    });
  }, []);

  // Empty state
  if (products.length === 0) {
    return (
      <motion.div
        className={cn('py-16 text-center', className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="font-sans text-xl text-content-muted">
          Aucun produit ne correspond a vos criteres.
        </p>
        <p className="mt-2 font-sans text-sm text-content-muted">
          Essayez de modifier vos filtres ou de reinitialiser votre recherche.
        </p>
      </motion.div>
    );
  }

  return (
    <div className={className}>
      {/* Products Grid - 5 columns like FeaturedProducts */}
      <motion.div
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        role="list"
        aria-label="Liste des produits"
      >
        {visibleProducts.map((product, index) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            role="listitem"
          >
            <ProductCard
              product={product}
              onQuickAdd={onQuickAdd}
              priority={index < 5}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Load More */}
      {totalCount > initialCount && (
        <div className="mt-16">
          <LoadMore
            currentCount={visibleCount}
            totalCount={totalCount}
            loadIncrement={loadIncrement}
            onLoadMore={handleLoadMore}
            variant="outline"
            buttonText="Decouvrir plus"
          />
        </div>
      )}
    </div>
  );
}

export default CategoryProductsGrid;
