'use client';

import { memo, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CarouselProduct {
  id: string;
  name: string;
  brand: string;
  sku: string;
  price: number;
  originalPrice?: number;
  priceUnit?: string;
  image: string;
  href: string;
  badge?: {
    label: string;
    variant: 'promo' | 'new' | 'premium' | 'stock';
  };
  stock?: {
    level: 'high' | 'medium' | 'low' | 'out';
    label: string;
  };
}

export interface ProductCarouselSectionProps {
  /** Section title */
  title: string;
  /** Section subtitle */
  subtitle?: string;
  /** Products to display */
  products: CarouselProduct[];
  /** View all link */
  viewAllHref?: string;
  /** View all label */
  viewAllLabel?: string;
  /** Background variant */
  variant?: 'default' | 'highlight';
  /** Additional CSS classes */
  className?: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

function getDiscountPercentage(original: number, current: number): number {
  return Math.round(((original - current) / original) * 100);
}

export const ProductCarouselSection = memo(function ProductCarouselSection({
  title,
  subtitle,
  products,
  viewAllHref,
  viewAllLabel = 'Voir tout',
  variant = 'default',
  className,
}: ProductCarouselSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = 280; // Approximate card width + gap
    const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;

    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });

    // Check scroll buttons after animation
    setTimeout(checkScrollButtons, 350);
  }, [checkScrollButtons]);

  const getBadgeStyles = (badgeVariant: CarouselProduct['badge']) => {
    if (!badgeVariant) return '';

    switch (badgeVariant.variant) {
      case 'promo':
        return 'bg-promo text-white';
      case 'new':
        return 'bg-success text-white';
      case 'premium':
        return 'bg-accent text-white';
      case 'stock':
        return 'bg-warning text-white';
      default:
        return 'bg-primary text-white';
    }
  };

  const getStockStyles = (stockLevel: CarouselProduct['stock']) => {
    if (!stockLevel) return '';

    switch (stockLevel.level) {
      case 'high':
        return 'text-success';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-warning';
      case 'out':
        return 'text-danger';
      default:
        return 'text-content-muted';
    }
  };

  return (
    <section
      className={cn(
        'py-8 lg:py-12',
        variant === 'highlight' ? 'bg-surface-secondary' : 'bg-white',
        className
      )}
    >
      <div className="container-ecom">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-section lg:text-section-xl font-heading text-content-primary">
              {title}
            </h2>
            {subtitle && (
              <p className="text-body text-content-secondary mt-1">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Navigation buttons */}
            <div className="hidden sm:flex gap-1">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={cn(
                  'flex items-center justify-center w-9 h-9 rounded-full',
                  'border border-stroke transition-all duration-200',
                  canScrollLeft
                    ? 'text-content-primary hover:bg-surface-secondary hover:border-stroke-medium'
                    : 'text-content-muted cursor-not-allowed opacity-50'
                )}
                aria-label="Defiler vers la gauche"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={cn(
                  'flex items-center justify-center w-9 h-9 rounded-full',
                  'border border-stroke transition-all duration-200',
                  canScrollRight
                    ? 'text-content-primary hover:bg-surface-secondary hover:border-stroke-medium'
                    : 'text-content-muted cursor-not-allowed opacity-50'
                )}
                aria-label="Defiler vers la droite"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* View all link */}
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className={cn(
                  'hidden sm:inline-flex items-center gap-1 ml-2 px-3 py-2 rounded-lg',
                  'text-body font-medium text-primary',
                  'hover:bg-primary-50 transition-colors duration-200'
                )}
              >
                {viewAllLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Products carousel */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollButtons}
          className={cn(
            'flex gap-4 overflow-x-auto scrollbar-hide pb-2',
            '-mx-4 px-4 lg:mx-0 lg:px-0'
          )}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-[240px] sm:w-[260px]"
            >
              <Link
                href={product.href}
                className="card-ecom-product block group"
              >
                {/* Image */}
                <div className="relative aspect-square bg-surface-secondary overflow-hidden">
                  {/* Placeholder for image */}
                  <div className="absolute inset-0 flex items-center justify-center text-content-muted">
                    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>

                  {/* Badge */}
                  {product.badge && (
                    <span
                      className={cn(
                        'absolute top-2 left-2 px-2 py-0.5 text-badge font-semibold rounded',
                        getBadgeStyles(product.badge)
                      )}
                    >
                      {product.badge.label}
                    </span>
                  )}

                  {/* Discount badge */}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 text-badge font-semibold bg-promo text-white rounded">
                      -{getDiscountPercentage(product.originalPrice, product.price)}%
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-3">
                  {/* Brand */}
                  <p className="text-caption text-content-muted mb-0.5 truncate">
                    {product.brand}
                  </p>

                  {/* Name */}
                  <h3 className="text-card-title-sm font-medium text-content-primary mb-1 line-clamp-2 group-hover:text-primary transition-colors duration-200">
                    {product.name}
                  </h3>

                  {/* SKU */}
                  <p className="text-caption text-content-muted mb-2">
                    Ref: {product.sku}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span
                      className={cn(
                        'text-price-sm font-bold',
                        product.originalPrice ? 'text-promo' : 'text-content-primary'
                      )}
                    >
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-price-old text-content-muted line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                    {product.priceUnit && (
                      <span className="text-caption text-content-muted">
                        /{product.priceUnit}
                      </span>
                    )}
                  </div>

                  {/* Stock */}
                  {product.stock && (
                    <p className={cn('text-caption mt-1.5', getStockStyles(product.stock))}>
                      {product.stock.label}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile view all */}
        {viewAllHref && (
          <div className="sm:hidden mt-4 text-center">
            <Link
              href={viewAllHref}
              className={cn(
                'inline-flex items-center gap-2 px-6 py-2.5 rounded-lg',
                'text-body font-medium text-primary border border-primary',
                'hover:bg-primary hover:text-white transition-colors duration-200'
              )}
            >
              {viewAllLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
});

ProductCarouselSection.displayName = 'ProductCarouselSection';

export default ProductCarouselSection;
