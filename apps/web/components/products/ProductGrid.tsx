'use client';

import { motion } from 'framer-motion';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
  loading?: boolean;
  onQuickAdd?: (product: Product) => void;
  className?: string;
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square bg-luxury-charcoal rounded" />
      <div className="pt-4 space-y-2">
        <div className="h-5 bg-luxury-charcoal rounded w-3/4" />
        <div className="h-4 bg-luxury-charcoal rounded w-1/4" />
      </div>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function ProductGrid({
  products,
  columns = 4,
  loading = false,
  onQuickAdd,
  className,
}: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  if (loading) {
    return (
      <div
        className={cn(
          'grid gap-6 md:gap-8',
          gridCols[columns],
          className
        )}
        aria-busy="true"
        aria-label="Chargement des produits"
      >
        {Array.from({ length: columns * 2 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-luxury-silver text-lg">
          Aucun produit trouve.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        'grid gap-6 md:gap-8',
        gridCols[columns],
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      role="list"
      aria-label="Liste des produits"
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onQuickAdd={onQuickAdd}
        />
      ))}
    </motion.div>
  );
}

export default ProductGrid;
