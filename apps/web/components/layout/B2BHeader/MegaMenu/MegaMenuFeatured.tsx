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
      return 'bg-b2b-primary-500 text-white';
    case 'promo':
      return 'bg-b2b-danger-500 text-white';
    case 'bestseller':
      return 'bg-b2b-accent-500 text-white';
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
      href={`/produits/${product.sku.toLowerCase()}`}
      className={cn(
        'group flex flex-col bg-white rounded-lg border border-b2b-border',
        'hover:border-b2b-primary-300 hover:shadow-md',
        'transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-b2b-primary-500/20'
      )}
      onClick={onLinkClick}
    >
      {/* Image container */}
      <div className="relative aspect-square bg-b2b-bg-secondary rounded-t-lg overflow-hidden">
        {/* Placeholder for product image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-b2b-bg-tertiary rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-b2b-text-muted" strokeWidth={1.5} />
          </div>
        </div>

        {/* Badge */}
        {product.badge && (
          <span
            className={cn(
              'absolute top-2 left-2',
              'px-2 py-0.5 rounded text-b2b-badge font-semibold',
              getBadgeStyles(product.badge)
            )}
          >
            {getBadgeLabel(product.badge)}
          </span>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-b2b-danger-500 text-white text-b2b-badge font-semibold">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3">
        {/* SKU */}
        <span className="text-b2b-sku text-b2b-text-muted mb-1">
          {product.sku}
        </span>

        {/* Name */}
        <h4 className="text-b2b-body font-medium text-b2b-text-primary line-clamp-2 group-hover:text-b2b-primary-500 transition-colors">
          {product.name}
        </h4>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-b2b-price font-semibold text-b2b-text-primary">
            {product.price.toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            })}
          </span>
          {hasDiscount && (
            <span className="text-b2b-body-sm text-b2b-text-muted line-through">
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
                ? 'bg-b2b-success-500'
                : product.stock > 0
                ? 'bg-b2b-warning-500'
                : 'bg-b2b-danger-500'
            )}
            aria-hidden="true"
          />
          <span className="text-b2b-caption text-b2b-text-muted">
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
        'flex flex-col bg-b2b-bg-secondary rounded-lg p-4',
        className
      )}
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-b2b-section-title font-semibold text-b2b-text-primary">
          {title}
        </h3>
        <Link
          href="/promotions"
          className={cn(
            'inline-flex items-center gap-1',
            'text-b2b-body-sm font-medium text-b2b-primary-500',
            'hover:text-b2b-primary-600 transition-colors duration-150',
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
      <div className="mt-4 p-3 bg-gradient-to-r from-b2b-accent-500 to-b2b-accent-600 rounded-lg">
        <p className="text-white text-b2b-body font-medium">
          Professionnels : -15% sur votre premiere commande
        </p>
        <Link
          href="/promotions/bienvenue"
          className={cn(
            'inline-flex items-center gap-1 mt-1',
            'text-b2b-body-sm font-medium text-white/90',
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
