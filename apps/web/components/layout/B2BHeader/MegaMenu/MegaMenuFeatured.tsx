'use client';

/**
 * MegaMenuFeatured Component
 *
 * Featured products section in the MegaMenu.
 * Displays promoted products, new arrivals, or special offers.
 *
 * Features:
 * - Product cards with images
 * - Price display with discounts
 * - Stock indicator
 * - Product badges (new, promo, bestseller)
 */

import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FeaturedProduct } from '../mockData';

export interface MegaMenuFeaturedProps {
  /** Featured products to display */
  products: FeaturedProduct[];
  /** Section title */
  title?: string;
  /** Additional CSS classes */
  className?: string;
  /** Callback when a link is clicked */
  onLinkClick?: () => void;
}

interface ProductCardProps {
  product: FeaturedProduct;
  onLinkClick?: () => void;
}

const getBadgeStyles = (badge: FeaturedProduct['badge']) => {
  switch (badge) {
    case 'new':
      return 'bg-neutral-900 text-white';
    case 'promo':
      return 'bg-red-500 text-white';
    case 'bestseller':
      return 'bg-accent text-white';
    default:
      return '';
  }
};

const getBadgeLabel = (badge: FeaturedProduct['badge']) => {
  switch (badge) {
    case 'new':
      return 'Nouveau';
    case 'promo':
      return 'Promo';
    case 'bestseller':
      return 'Best-seller';
    default:
      return '';
  }
};

const ProductCard = memo(function ProductCard({
  product,
  onLinkClick,
}: ProductCardProps) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <Link
      href={`/produit/${product.sku.toLowerCase()}`}
      className={cn(
        'group flex flex-col bg-white rounded-lg border border-neutral-200',
        'hover:border-neutral-300 hover:shadow-md',
        'transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/20'
      )}
      onClick={onLinkClick}
    >
      {/* Image container */}
      <div className="relative aspect-square bg-neutral-50 rounded-t-lg overflow-hidden">
        {/* Placeholder for product image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-neutral-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Badge */}
        {product.badge && (
          <span
            className={cn(
              'absolute top-2 left-2',
              'px-2 py-0.5 rounded text-xs font-semibold',
              getBadgeStyles(product.badge)
            )}
          >
            {getBadgeLabel(product.badge)}
          </span>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-red-500 text-white text-xs font-semibold">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3">
        {/* SKU */}
        <span className="text-xs font-mono text-neutral-500 mb-1">
          {product.sku}
        </span>

        {/* Name */}
        <h4 className="text-sm font-medium text-neutral-900 line-clamp-2 group-hover:text-accent transition-colors">
          {product.name}
        </h4>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-base font-semibold text-neutral-900">
            {product.price.toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            })}
          </span>
          {hasDiscount && (
            <span className="text-sm text-neutral-500 line-through">
              {product.originalPrice?.toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              })}
            </span>
          )}
        </div>

        {/* Stock indicator */}
        <div className="flex items-center gap-1.5 mt-2">
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              product.stock > 10
                ? 'bg-green-500'
                : product.stock > 0
                ? 'bg-amber-500'
                : 'bg-red-500'
            )}
            aria-hidden="true"
          />
          <span className="text-xs text-neutral-500">
            {product.stock > 10
              ? 'En stock'
              : product.stock > 0
              ? `${product.stock} restants`
              : 'Rupture'}
          </span>
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';

export const MegaMenuFeatured = memo(function MegaMenuFeatured({
  products,
  title = 'A la une',
  className,
  onLinkClick,
}: MegaMenuFeaturedProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-col bg-neutral-50 rounded-lg p-4',
        className
      )}
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-neutral-900">
          {title}
        </h3>
        <Link
          href="/promotions"
          className={cn(
            'inline-flex items-center gap-1',
            'text-sm font-medium text-accent',
            'hover:text-orange-600 transition-colors duration-150',
            'focus:outline-none focus-visible:underline'
          )}
          onClick={onLinkClick}
        >
          <span>Voir tout</span>
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
        </Link>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 gap-3">
        {products.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onLinkClick={onLinkClick}
          />
        ))}
      </div>

      {/* Promo banner */}
      <div className="mt-4 p-3 bg-gradient-to-r from-accent to-orange-600 rounded-lg">
        <p className="text-white text-sm font-medium">
          Professionnels : -15% sur votre premiere commande
        </p>
        <Link
          href="/promotions/bienvenue"
          className={cn(
            'inline-flex items-center gap-1 mt-1',
            'text-sm font-medium text-white/90',
            'hover:text-white transition-colors duration-150',
            'focus:outline-none focus-visible:underline'
          )}
          onClick={onLinkClick}
        >
          <span>En profiter</span>
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
});

MegaMenuFeatured.displayName = 'MegaMenuFeatured';

export default MegaMenuFeatured;
