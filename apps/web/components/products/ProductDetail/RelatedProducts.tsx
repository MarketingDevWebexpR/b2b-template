'use client';

/**
 * RelatedProducts - Related Products Display Component
 *
 * Features:
 * - Similar products section
 * - Complementary products (accessories, etc.)
 * - "Frequently bought together" section
 * - Horizontal scrollable carousel
 * - Quick add to cart
 * - Lazy loading images
 *
 * @packageDocumentation
 */

import { useState, useCallback, useRef, useEffect, memo, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Plus,
  Check,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Product } from '@maison/types';

// ============================================================================
// Types
// ============================================================================

export type RelatedSectionType = 'similar' | 'complementary' | 'bought_together';

export interface RelatedProduct extends Pick<Product,
  'id' | 'name' | 'slug' | 'reference' | 'price' | 'compareAtPrice' | 'images' | 'isAvailable' | 'isNew' | 'brand'
> {
  /** Stock status indicator */
  inStock?: boolean;
}

export interface BoughtTogetherBundle {
  products: RelatedProduct[];
  bundlePrice: number;
  savings: number;
}

export interface RelatedProductsProps {
  /** Section type */
  type: RelatedSectionType;
  /** Products to display */
  products: RelatedProduct[];
  /** Bundle info for "bought together" type */
  bundle?: BoughtTogetherBundle;
  /** Section title override */
  title?: string;
  /** Format price function */
  formatPrice: (price: number) => string;
  /** Callback when product is clicked */
  onProductClick?: (product: RelatedProduct) => void;
  /** Callback when adding product to cart */
  onAddToCart?: (product: RelatedProduct) => Promise<void>;
  /** Callback when adding bundle to cart */
  onAddBundleToCart?: (bundle: BoughtTogetherBundle) => Promise<void>;
  /** Maximum products to show */
  maxProducts?: number;
  /** Show quick add button */
  showQuickAdd?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const SECTION_TITLES: Record<RelatedSectionType, string> = {
  similar: 'Produits similaires',
  complementary: 'Produits complementaires',
  bought_together: 'Souvent achetes ensemble',
};

const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg';

// ============================================================================
// Animation Variants
// ============================================================================

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

// ============================================================================
// Sub-Components
// ============================================================================

interface ProductCardProps {
  product: RelatedProduct;
  index: number;
  formatPrice: (price: number) => string;
  showQuickAdd: boolean;
  onAddToCart?: (product: RelatedProduct) => Promise<void>;
  onProductClick?: (product: RelatedProduct) => void;
  /** Load image with priority (for first visible items) */
  priority?: boolean;
}

/**
 * ProductCard - Memoized for performance
 * Only re-renders when product data or handlers change
 */
const ProductCard = memo(function ProductCard({
  product,
  index,
  formatPrice,
  showQuickAdd,
  onAddToCart,
  onProductClick,
  priority = false,
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '100px' });

  // Prefetch product page on hover for faster navigation
  const handlePrefetch = useCallback(() => {
    router.prefetch(`/produit/${product.slug}`);
  }, [router, product.slug]);

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!onAddToCart || isAdding) return;

      setIsAdding(true);
      try {
        await onAddToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      } catch (error) {
        console.error('Error adding to cart:', error);
      } finally {
        setIsAdding(false);
      }
    },
    [product, onAddToCart, isAdding]
  );

  // Memoize computed values
  const { hasDiscount, discountPercent, imageSrc } = useMemo(() => {
    const hasDisc = product.compareAtPrice && product.compareAtPrice > product.price;
    const discPerc = hasDisc
      ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
      : 0;
    const imgSrc = !imageError && product.images?.[0] ? product.images[0] : PLACEHOLDER_IMAGE;
    return { hasDiscount: hasDisc, discountPercent: discPerc, imageSrc: imgSrc };
  }, [product.compareAtPrice, product.price, product.images, imageError]);

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      custom={index}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="flex-shrink-0 w-[200px] md:w-[240px]"
    >
      <Link
        href={`/produit/${product.slug}`}
        onClick={() => onProductClick?.(product)}
        onMouseEnter={handlePrefetch}
        prefetch={false} // We handle prefetch manually on hover
        className={cn(
          'block group rounded-lg overflow-hidden',
          'bg-white border border-neutral-200',
          'hover:border-accent hover:shadow-lg',
          'transition-all duration-300'
        )}
      >
        {/* Image Container */}
        <div className="relative aspect-square bg-neutral-50 overflow-hidden">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 200px, 240px"
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
            priority={priority}
            loading={priority ? undefined : 'lazy'}
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && (
              <Badge variant="warning" size="xs">
                Nouveau
              </Badge>
            )}
            {hasDiscount && (
              <Badge variant="error" size="xs">
                -{discountPercent}%
              </Badge>
            )}
          </div>

          {/* Stock Indicator */}
          {product.inStock === false && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <Badge variant="error" size="sm">
                Rupture
              </Badge>
            </div>
          )}

          {/* Quick Add Button */}
          {showQuickAdd && product.isAvailable !== false && (
            <div
              className={cn(
                'absolute bottom-2 right-2 opacity-0 group-hover:opacity-100',
                'transition-opacity duration-200'
              )}
            >
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  'bg-accent text-white shadow-lg',
                  'hover:bg-accent/90 transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                aria-label="Ajouter au panier"
              >
                {isAdding ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : added ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          {/* Brand */}
          {product.brand && (
            <p className="text-xs text-neutral-500 uppercase tracking-wider">
              {product.brand}
            </p>
          )}

          {/* Name */}
          <h4 className="text-sm font-medium text-neutral-900 line-clamp-2 min-h-[2.5rem] group-hover:text-accent transition-colors">
            {product.name}
          </h4>

          {/* Reference */}
          <p className="text-xs text-neutral-500 font-mono">
            Ref: {product.reference}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-neutral-900">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-neutral-500 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

// "Bought Together" Bundle Card
interface BundleCardProps {
  bundle: BoughtTogetherBundle;
  formatPrice: (price: number) => string;
  onAddBundleToCart?: (bundle: BoughtTogetherBundle) => Promise<void>;
}

function BundleCard({ bundle, formatPrice, onAddBundleToCart }: BundleCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddBundle = useCallback(async () => {
    if (!onAddBundleToCart || isAdding) return;

    setIsAdding(true);
    try {
      await onAddBundleToCart(bundle);
    } catch (error) {
      console.error('Error adding bundle to cart:', error);
    } finally {
      setIsAdding(false);
    }
  }, [bundle, onAddBundleToCart, isAdding]);

  const totalOriginalPrice = bundle.products.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 md:p-6">
      {/* Products Grid */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
        {bundle.products.map((product, index) => (
          <div key={product.id} className="flex items-center">
            {index > 0 && (
              <Plus className="w-6 h-6 text-neutral-500 mx-2 flex-shrink-0" />
            )}
            <Link
              href={`/produit/${product.slug}`}
              className="group flex flex-col items-center p-2"
            >
              <div className="relative w-20 h-20 md:w-24 md:h-24 bg-white rounded-lg overflow-hidden border border-neutral-200 group-hover:border-accent transition-colors">
                <Image
                  src={product.images?.[0] || PLACEHOLDER_IMAGE}
                  alt={product.name}
                  fill
                  sizes="96px"
                  className="object-contain p-2"
                />
              </div>
              <span className="mt-2 text-xs text-neutral-600 text-center line-clamp-2 max-w-[100px] group-hover:text-accent transition-colors">
                {product.name}
              </span>
            </Link>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-200">
        <div className="text-center md:text-left">
          <div className="text-sm text-neutral-500">Prix du lot</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">
              {formatPrice(bundle.bundlePrice)}
            </span>
            <span className="text-sm text-neutral-500 line-through">
              {formatPrice(totalOriginalPrice)}
            </span>
          </div>
          {bundle.savings > 0 && (
            <Badge variant="success" size="sm" className="mt-1">
              Economisez {formatPrice(bundle.savings)}
            </Badge>
          )}
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleAddBundle}
          isLoading={isAdding}
          disabled={!onAddBundleToCart}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Ajouter le lot
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function RelatedProducts({
  type,
  products,
  bundle,
  title,
  formatPrice,
  onProductClick,
  onAddToCart,
  onAddBundleToCart,
  maxProducts = 8,
  showQuickAdd = true,
  className,
}: RelatedProductsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const displayProducts = products.slice(0, maxProducts);
  const sectionTitle = title || SECTION_TITLES[type];

  // Update scroll state
  const updateScrollState = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  // Scroll handlers
  const handleScroll = useCallback(
    (direction: 'left' | 'right') => {
      if (!scrollContainerRef.current) return;

      const scrollAmount = 260; // Card width + gap
      const newScrollLeft =
        direction === 'left'
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });

      // Update state after scroll animation
      setTimeout(updateScrollState, 300);
    },
    [updateScrollState]
  );

  if (displayProducts.length === 0 && !bundle) {
    return null;
  }

  // Special layout for "bought together" type
  if (type === 'bought_together' && bundle) {
    return (
      <section className={cn('py-8', className)}>
        <h3 className="text-xl font-semibold text-neutral-900 mb-6">
          {sectionTitle}
        </h3>
        <BundleCard
          bundle={bundle}
          formatPrice={formatPrice}
          onAddBundleToCart={onAddBundleToCart}
        />
      </section>
    );
  }

  return (
    <section className={cn('py-8', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-neutral-900">
          {sectionTitle}
        </h3>

        {/* Navigation Arrows */}
        {displayProducts.length > 4 && (
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                'border border-neutral-200 bg-white',
                'text-neutral-600 hover:text-neutral-900 hover:border-neutral-400',
                'transition-colors duration-200',
                'disabled:opacity-30 disabled:cursor-not-allowed'
              )}
              aria-label="Precedent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                'border border-neutral-200 bg-white',
                'text-neutral-600 hover:text-neutral-900 hover:border-neutral-400',
                'transition-colors duration-200',
                'disabled:opacity-30 disabled:cursor-not-allowed'
              )}
              aria-label="Suivant"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Products Carousel */}
      <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
        <div
          ref={scrollContainerRef}
          className={cn(
            'flex gap-4 overflow-x-auto scrollbar-hide',
            'pb-4 -mb-4' // Padding for shadow overflow
          )}
          onScroll={updateScrollState}
        >
          {displayProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              formatPrice={formatPrice}
              showQuickAdd={showQuickAdd}
              onAddToCart={onAddToCart}
              onProductClick={onProductClick}
              priority={index < 4} // Priority load first 4 images
            />
          ))}
        </div>

        {/* Gradient Overlays */}
        {canScrollLeft && (
          <div className="hidden md:block absolute left-0 top-0 bottom-4 w-16 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="hidden md:block absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        )}
      </div>

      {/* View All Link */}
      {products.length > maxProducts && (
        <div className="text-center mt-6">
          <Link
            href={`/recherche?related=${type}`}
            className={cn(
              'inline-flex items-center gap-2 text-sm font-medium',
              'text-accent hover:text-accent/90',
              'transition-colors duration-200'
            )}
          >
            Voir tous les produits ({products.length})
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </section>
  );
}

export default RelatedProducts;
