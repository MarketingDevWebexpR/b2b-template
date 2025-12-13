'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import type { Product } from '@/types';
import { cn, formatPrice, calculateDiscount } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
  onQuickAdd?: (product: Product) => void;
}

const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg';

/**
 * ProductCard - Hermes-inspired luxury product card
 *
 * Design principles:
 * - Clean white/cream background
 * - Elegant serif typography for product names
 * - Subtle hover elevation with soft shadows
 * - Minimalist aesthetic with generous spacing
 * - Discreet badges and wishlist button
 */
export function ProductCard({
  product,
  className,
  priority = false,
  onQuickAdd
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Determine the image source - use placeholder on error or if no images
  const imageSrc = imageError || !product.images[0] ? PLACEHOLDER_IMAGE : product.images[0];

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = hasDiscount
    ? calculateDiscount(product.price, product.compareAtPrice!)
    : 0;

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickAdd?.(product);
  };

  return (
    <motion.article
      className={cn('group relative', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link
        href={`/products/${product.id}`}
        className="block"
        aria-label={`Voir ${product.name}`}
      >
        {/* Card Container with Hover Elevation */}
        <div
          className={cn(
            'relative bg-white rounded-soft overflow-hidden',
            'transition-all duration-500 ease-luxe-out',
            'shadow-card',
            isHovered && 'shadow-card-hover -translate-y-1'
          )}
        >
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-white">
            {/* Loading Skeleton with Shimmer */}
            <div
              className={cn(
                'absolute inset-0 transition-opacity duration-500 ease-luxe',
                imageLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-background-muted via-background-cream to-background-muted bg-[length:200%_100%] animate-shimmer" />
            </div>

            {/* Product Image with Subtle Zoom */}
            <div
              className={cn(
                'relative w-full h-full transition-transform duration-700 ease-luxe-out scale-110',
                isHovered && 'scale-[1.15]'
              )}
            >
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className={cn(
                  'object-contain transition-opacity duration-600 ease-luxe',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                priority={priority}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>

            {/* Inner Frame - Solid overlay to mask image edges */}
            <div
              className="absolute inset-0 pointer-events-none z-20"
              style={{ boxShadow: 'inset 0 0 0 12px #FFFFFF' }}
              aria-hidden="true"
            />

            {/* Badge "Nouveau" - Discret et Elegant */}
            {product.isNew && (
              <span
                className={cn(
                  'absolute top-4 left-4 z-10',
                  'px-3 py-1.5',
                  'bg-luxe-charcoal text-text-inverse',
                  'text-[10px] font-sans font-medium uppercase tracking-luxe'
                )}
              >
                Nouveau
              </span>
            )}

            {/* Badge Promotion */}
            {hasDiscount && (
              <span
                className={cn(
                  'absolute top-4 z-10',
                  product.isNew ? 'left-[90px]' : 'left-4',
                  'px-3 py-1.5',
                  'bg-luxe-bronze text-text-inverse',
                  'text-[10px] font-sans font-medium uppercase tracking-elegant'
                )}
              >
                -{discountPercentage}%
              </span>
            )}

            {/* Wishlist Button - Minimaliste */}
            <button
              onClick={handleWishlistToggle}
              className={cn(
                'absolute top-4 right-4 z-10',
                'w-9 h-9 flex items-center justify-center',
                'rounded-full bg-white/90 backdrop-blur-sm',
                'transition-all duration-350 ease-luxe',
                'hover:bg-white hover:scale-110',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-luxe-charcoal focus-visible:ring-offset-2'
              )}
              aria-label={isWishlisted ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}
              aria-pressed={isWishlisted}
            >
              <Heart
                className={cn(
                  'w-4 h-4 transition-all duration-350 ease-luxe',
                  isWishlisted
                    ? 'fill-luxe-charcoal text-luxe-charcoal'
                    : 'text-text-muted hover:text-luxe-charcoal'
                )}
                strokeWidth={1.5}
              />
            </button>

            {/* Quick Add Button - Apparait au hover */}
            {onQuickAdd && (
              <motion.button
                onClick={handleQuickAdd}
                className={cn(
                  'absolute bottom-4 left-4 right-4 z-10',
                  'py-3 px-4',
                  'bg-luxe-charcoal text-text-inverse',
                  'text-xs font-sans font-medium uppercase tracking-luxe',
                  'transition-colors duration-350 ease-luxe',
                  'hover:bg-luxe-noir',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-luxe-charcoal focus-visible:ring-offset-2'
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  y: isHovered ? 0 : 10,
                }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                aria-label={`Ajouter ${product.name} au panier`}
              >
                Ajouter au panier
              </motion.button>
            )}
          </div>

          {/* Product Info - Hauteur Fixe */}
          <div className="flex h-[130px] flex-col px-4 py-4">
            {/* Category - Discret */}
            <span className="block font-sans text-[11px] uppercase tracking-elegant text-text-muted">
              {product.category?.name || '\u00A0'}
            </span>

            {/* Product Name - Serif Elegant */}
            <h3
              className={cn(
                'mt-1.5 font-serif text-base text-text-primary',
                'leading-snug tracking-tight',
                'transition-colors duration-350 ease-luxe',
                'line-clamp-2',
                'group-hover:text-luxe-bronze'
              )}
            >
              {product.name}
            </h3>

            {/* Spacer */}
            <div className="flex-grow" />

            {/* Price Display - Discret */}
            <div className="flex items-baseline gap-2.5">
              <span className="font-sans text-sm font-normal text-text-secondary">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="font-sans text-xs text-text-light line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default ProductCard;
