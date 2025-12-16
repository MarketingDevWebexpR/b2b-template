'use client';

/**
 * MegaMenuFeatured Component
 *
 * Featured products panel in the MegaMenu.
 * Shows best sellers and promotions with elegant styling.
 */

import { memo } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MockProduct } from '@/hooks/useMockData';

export interface MegaMenuFeaturedProps {
  /** Featured products */
  products: MockProduct[];
  /** Title of the section */
  title?: string;
  /** Callback when link is clicked */
  onLinkClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const MegaMenuFeatured = memo(function MegaMenuFeatured({
  products,
  title = 'Best-sellers',
  onLinkClick,
  className,
}: MegaMenuFeaturedProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" fill="currentColor" />
          {title}
        </h3>
        <Link
          href="/produits?sort=bestsellers"
          onClick={onLinkClick}
          className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
        >
          Voir tout
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Product cards */}
      <div className="space-y-3 flex-1">
        {products.slice(0, 3).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onLinkClick={onLinkClick}
          />
        ))}
      </div>

      {/* Promo banner */}
      <div className="mt-4 p-4 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Gem className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-semibold">
              -15% premiere commande
            </p>
            <p className="text-white/80 text-xs mt-0.5">
              Code: BIENVENUE15
            </p>
          </div>
        </div>
        <Link
          href="/promotions/bienvenue"
          onClick={onLinkClick}
          className={cn(
            'inline-flex items-center gap-1 mt-3',
            'text-xs font-medium text-white/90',
            'hover:text-white transition-colors duration-150'
          )}
        >
          <span>En profiter</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
});

MegaMenuFeatured.displayName = 'MegaMenuFeatured';

// Product card component
interface ProductCardProps {
  product: MockProduct;
  onLinkClick?: () => void;
}

const ProductCard = memo(function ProductCard({
  product,
  onLinkClick,
}: ProductCardProps) {
  const formattedPrice = product.price.toLocaleString('fr-FR', {
    style: 'currency',
    currency: product.currency,
  });

  return (
    <Link
      href={`/produits/${product.slug}`}
      onClick={onLinkClick}
      className={cn(
        'flex items-center gap-3 p-2 -mx-2 rounded-lg',
        'hover:bg-neutral-50 transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20',
        'group'
      )}
    >
      {/* Product image placeholder */}
      <div
        className={cn(
          'flex-shrink-0 w-14 h-14',
          'bg-neutral-100 rounded-lg',
          'flex items-center justify-center',
          'group-hover:bg-neutral-200 transition-colors duration-150'
        )}
      >
        <Gem className="w-5 h-5 text-neutral-400" />
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 truncate group-hover:text-amber-700 transition-colors">
          {product.name}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5">
          {product.sku}
        </p>
        <p className="text-sm font-semibold text-amber-700 mt-1">
          {formattedPrice}
        </p>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';

export default MegaMenuFeatured;
