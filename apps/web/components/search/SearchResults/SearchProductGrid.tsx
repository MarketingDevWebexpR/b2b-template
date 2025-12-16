'use client';

/**
 * SearchProductGrid Component
 *
 * Displays search results in different view modes: Grid, List, and Compact.
 * Supports virtualization for large result sets.
 */

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn, formatPrice } from '@/lib/utils';
import { useSearchPagination } from '@/contexts/SearchContext';
import type { ProductViewMode } from '@/contexts/SearchContext';
import type { Product } from '@/types';
import { Badge, Skeleton } from '@/components/ui';
import { Heart, ShoppingCart, Package, Check } from 'lucide-react';

// ============================================================================
// Mock Products Data
// ============================================================================

/**
 * Generate mock products for demonstration
 */
export function generateMockProducts(count: number = 24): Product[] {
  const categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    productCount: number;
  }> = [
    { id: 'bagues', name: 'Bagues', slug: 'bagues', description: 'Collection de bagues', image: '/images/categories/bagues.jpg', productCount: 1234 },
    { id: 'colliers', name: 'Colliers', slug: 'colliers', description: 'Collection de colliers', image: '/images/categories/colliers.jpg', productCount: 987 },
    { id: 'boucles', name: "Boucles d'oreilles", slug: 'boucles-oreilles', description: "Collection de boucles d'oreilles", image: '/images/categories/boucles.jpg', productCount: 856 },
    { id: 'bracelets', name: 'Bracelets', slug: 'bracelets', description: 'Collection de bracelets', image: '/images/categories/bracelets.jpg', productCount: 654 },
  ];

  const brands = ['Cartier', 'Bulgari', 'Chopard', 'Van Cleef', 'Boucheron'];
  const materials = ['Or jaune 18K', 'Or blanc 18K', 'Or rose 18K', 'Platine', 'Argent 925'];
  const stones = ['Diamant', 'Saphir', 'Emeraude', 'Rubis', 'Perle'];

  const productNames = [
    'Solitaire Brillant',
    'Alliance Classique',
    'Pendentif Coeur',
    'Creoles Diamants',
    'Bracelet Tennis',
    'Bague Cocktail',
    'Collier Riviere',
    'Puces Diamant',
    'Jonc Or Rose',
    'Chevaliere Homme',
    'Trilogy Diamants',
    'Sautoir Perles',
  ];

  return Array.from({ length: count }, (_, i) => {
    const category = categories[i % categories.length];
    const brand = brands[i % brands.length];
    const material = materials[i % materials.length];
    const stone = stones[i % stones.length];
    const name = productNames[i % productNames.length];
    const price = Math.round((500 + Math.random() * 9500) / 50) * 50;
    const hasDiscount = Math.random() > 0.7;
    const stock = Math.floor(Math.random() * 50);

    return {
      id: `prod_${String(i + 1).padStart(4, '0')}`,
      reference: `REF-${String(i + 1).padStart(5, '0')}`,
      name: `${name} ${stone} ${material}`,
      slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${i}`,
      description: `Magnifique ${name.toLowerCase()} en ${material.toLowerCase()} serti de ${stone.toLowerCase()}.`,
      shortDescription: `${name} en ${material}`,
      price,
      compareAtPrice: hasDiscount ? Math.round(price * 1.2) : undefined,
      isPriceTTC: false,
      images: [`/images/products/product-${(i % 12) + 1}.jpg`],
      categoryId: category.id,
      category,
      collection: i % 2 === 0 ? 'Automne/Hiver' : 'Printemps/Ete',
      style: i % 3 === 0 ? 'Classique' : 'Contemporain',
      materials: [material],
      weight: 5 + Math.random() * 20,
      weightUnit: 'g',
      brand,
      origin: 'France',
      warranty: 24,
      stock,
      isAvailable: stock > 0,
      featured: i < 4,
      isNew: i % 5 === 0,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
}

// ============================================================================
// Product Card Variants
// ============================================================================

interface ProductCardProps {
  product: Product;
  viewMode: ProductViewMode;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  isInWishlist?: boolean;
}

/**
 * Stock status badge
 */
function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <Badge variant="light" size="sm" className="bg-gray-100 text-gray-600">
        Rupture
      </Badge>
    );
  }
  if (stock <= 5) {
    return (
      <Badge variant="warning" size="sm">
        Stock faible
      </Badge>
    );
  }
  return (
    <Badge variant="success" size="sm">
      <Check className="w-3 h-3 mr-1" />
      En stock
    </Badge>
  );
}

/**
 * Grid view product card
 */
function GridProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
}: Omit<ProductCardProps, 'viewMode'>) {
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  return (
    <article
      className={cn(
        'group relative',
        'bg-white rounded-lg',
        'border border-neutral-200',
        'overflow-hidden',
        'transition-all duration-300',
        'hover:shadow-lg hover:border-neutral-300'
      )}
    >
      <Link href={`/products/${product.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-square bg-neutral-50 overflow-hidden">
          <Image
            src={product.images[0] || '/images/placeholder-product.svg'}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.isNew && (
              <Badge variant="primary" size="sm">
                Nouveau
              </Badge>
            )}
            {hasDiscount && (
              <Badge variant="primary-soft" size="sm">
                -{discountPercent}%
              </Badge>
            )}
          </div>

          {/* Wishlist button */}
          {onToggleWishlist && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onToggleWishlist(product);
              }}
              className={cn(
                'absolute top-3 right-3',
                'w-8 h-8 rounded-full',
                'flex items-center justify-center',
                'bg-white/90 backdrop-blur-sm',
                'border border-neutral-200',
                'transition-all duration-200',
                'hover:bg-white hover:scale-110',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
              )}
              aria-label={isInWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Heart
                className={cn(
                  'w-4 h-4',
                  isInWishlist ? 'fill-red-500 text-red-500' : 'text-neutral-400'
                )}
              />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Brand */}
          {product.brand && (
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">
              {product.brand}
            </p>
          )}

          {/* Name */}
          <h3 className="text-sm font-medium text-neutral-900 line-clamp-2 min-h-[2.5rem] mb-2 group-hover:text-accent transition-colors">
            {product.name}
          </h3>

          {/* Reference */}
          <p className="text-xs text-neutral-500 mb-2">
            Ref: {product.reference}
          </p>

          {/* Stock */}
          <div className="mb-3">
            <StockBadge stock={product.stock} />
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-accent">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-neutral-500 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
            <span className="text-xs text-neutral-500">HT</span>
          </div>
        </div>
      </Link>

      {/* Quick add button */}
      {onAddToCart && product.isAvailable && (
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className={cn(
              'w-full py-2.5',
              'flex items-center justify-center gap-2',
              'text-sm font-medium',
              'bg-accent text-white',
              'rounded-lg',
              'transition-all duration-200',
              'hover:bg-orange-600',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
            )}
          >
            <ShoppingCart className="w-4 h-4" />
            Ajouter au panier
          </button>
        </div>
      )}
    </article>
  );
}

/**
 * List view product card
 */
function ListProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
}: Omit<ProductCardProps, 'viewMode'>) {
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <article
      className={cn(
        'group',
        'bg-white rounded-lg',
        'border border-neutral-200',
        'overflow-hidden',
        'transition-all duration-300',
        'hover:shadow-lg hover:border-neutral-300'
      )}
    >
      <Link href={`/products/${product.id}`} className="flex">
        {/* Image */}
        <div className="relative w-48 h-48 flex-shrink-0 bg-neutral-50">
          <Image
            src={product.images[0] || '/images/placeholder-product.svg'}
            alt={product.name}
            fill
            sizes="192px"
            className="object-contain p-4"
          />

          {/* New badge */}
          {product.isNew && (
            <Badge variant="primary" size="sm" className="absolute top-2 left-2">
              Nouveau
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex-1">
            {/* Brand & Reference */}
            <div className="flex items-center gap-4 mb-1">
              {product.brand && (
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  {product.brand}
                </p>
              )}
              <p className="text-xs text-neutral-500">
                Ref: {product.reference}
              </p>
            </div>

            {/* Name */}
            <h3 className="text-base font-medium text-neutral-900 mb-2 group-hover:text-accent transition-colors">
              {product.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
              {product.shortDescription || product.description}
            </p>

            {/* Attributes */}
            <div className="flex flex-wrap gap-2 mb-3">
              {product.materials.map((material) => (
                <Badge key={material} variant="light" size="sm">
                  {material}
                </Badge>
              ))}
              {product.collection && (
                <Badge variant="light" size="sm">
                  {product.collection}
                </Badge>
              )}
            </div>

            {/* Stock */}
            <StockBadge stock={product.stock} />
          </div>

          {/* Footer: Price & Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200">
            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-accent">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-neutral-500 line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              )}
              <span className="text-xs text-neutral-500">HT</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {onToggleWishlist && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onToggleWishlist(product);
                  }}
                  className={cn(
                    'p-2 rounded-lg',
                    'border border-neutral-200',
                    'transition-all duration-200',
                    'hover:bg-neutral-100',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                  )}
                  aria-label={isInWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <Heart
                    className={cn(
                      'w-5 h-5',
                      isInWishlist ? 'fill-red-500 text-red-500' : 'text-neutral-400'
                    )}
                  />
                </button>
              )}

              {onAddToCart && product.isAvailable && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onAddToCart(product);
                  }}
                  className={cn(
                    'px-4 py-2',
                    'flex items-center gap-2',
                    'text-sm font-medium',
                    'bg-accent text-white',
                    'rounded-lg',
                    'transition-all duration-200',
                    'hover:bg-orange-600',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                  )}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Ajouter
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

/**
 * Compact view product row
 */
function CompactProductRow({
  product,
  onAddToCart,
}: Omit<ProductCardProps, 'viewMode' | 'onToggleWishlist' | 'isInWishlist'>) {
  return (
    <article
      className={cn(
        'group',
        'bg-white',
        'border-b border-neutral-200 last:border-b-0',
        'transition-colors duration-200',
        'hover:bg-neutral-50'
      )}
    >
      <Link
        href={`/products/${product.id}`}
        className="flex items-center gap-4 py-3 px-4"
      >
        {/* Image */}
        <div className="relative w-12 h-12 flex-shrink-0 bg-neutral-50 rounded">
          <Image
            src={product.images[0] || '/images/placeholder-product.svg'}
            alt={product.name}
            fill
            sizes="48px"
            className="object-contain p-1"
          />
        </div>

        {/* Reference */}
        <div className="w-28 flex-shrink-0">
          <p className="text-xs font-mono text-neutral-500">
            {product.reference}
          </p>
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-neutral-900 truncate group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          {product.brand && (
            <p className="text-xs text-neutral-500">{product.brand}</p>
          )}
        </div>

        {/* Stock */}
        <div className="w-24 flex-shrink-0 text-center">
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium',
              product.stock > 5
                ? 'text-green-600'
                : product.stock > 0
                  ? 'text-amber-600'
                  : 'text-gray-400'
            )}
          >
            <Package className="w-3 h-3" />
            {product.stock > 0 ? product.stock : 'Rupture'}
          </span>
        </div>

        {/* Price */}
        <div className="w-28 flex-shrink-0 text-right">
          <span className="text-sm font-semibold text-accent">
            {formatPrice(product.price)}
          </span>
          <span className="text-xs text-neutral-500 ml-1">HT</span>
        </div>

        {/* Add button */}
        {onAddToCart && product.isAvailable && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(product);
            }}
            className={cn(
              'flex-shrink-0',
              'p-2 rounded-lg',
              'bg-accent text-white',
              'opacity-0 group-hover:opacity-100',
              'transition-all duration-200',
              'hover:bg-orange-600',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
            )}
            aria-label={`Ajouter ${product.name} au panier`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        )}
      </Link>
    </article>
  );
}

// ============================================================================
// Loading Skeletons
// ============================================================================

function GridSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      <Skeleton className="aspect-square" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden flex">
      <Skeleton className="w-48 h-48 flex-shrink-0" />
      <div className="flex-1 p-4 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-full max-w-md" />
        <Skeleton className="h-4 w-full max-w-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
    </div>
  );
}

function CompactSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 px-4 border-b border-neutral-200">
      <Skeleton className="w-12 h-12 rounded" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 flex-1 max-w-xs" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

// ============================================================================
// Main SearchProductGrid Component
// ============================================================================

export interface SearchProductGridProps {
  /** Products to display */
  products: Product[];
  /** Loading state */
  isLoading?: boolean;
  /** Custom class name */
  className?: string;
  /** Add to cart handler */
  onAddToCart?: (product: Product) => void;
  /** Toggle wishlist handler */
  onToggleWishlist?: (product: Product) => void;
  /** Check if product is in wishlist */
  isInWishlist?: (productId: string) => boolean;
  /** Number of skeleton items when loading */
  skeletonCount?: number;
}

/**
 * SearchProductGrid displays products in different view modes
 */
export function SearchProductGrid({
  products,
  isLoading = false,
  className,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  skeletonCount = 12,
}: SearchProductGridProps) {
  const { viewMode } = useSearchPagination();

  // Render loading skeletons
  if (isLoading) {
    if (viewMode === 'compact') {
      return (
        <div className={cn('bg-white rounded-lg border border-neutral-200', className)}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <CompactSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (viewMode === 'list') {
      return (
        <div className={cn('space-y-4', className)}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <ListSkeleton key={i} />
          ))}
        </div>
      );
    }

    return (
      <div
        className={cn(
          'grid gap-4',
          'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
          className
        )}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <GridSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center',
          'py-16 px-4',
          'bg-white rounded-lg border border-neutral-200',
          className
        )}
      >
        <Package className="w-16 h-16 text-neutral-400 mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Aucun produit trouve
        </h3>
        <p className="text-sm text-neutral-600 text-center max-w-md">
          Essayez de modifier vos filtres ou d'effectuer une nouvelle recherche
          avec des termes differents.
        </p>
      </div>
    );
  }

  // Compact view
  if (viewMode === 'compact') {
    return (
      <div
        className={cn(
          'bg-white rounded-lg border border-neutral-200 overflow-hidden',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-4 py-2 px-4 bg-neutral-50 border-b border-neutral-200 text-xs font-medium text-neutral-500 uppercase tracking-wide">
          <div className="w-12" />
          <div className="w-28">Reference</div>
          <div className="flex-1">Produit</div>
          <div className="w-24 text-center">Stock</div>
          <div className="w-28 text-right">Prix HT</div>
          <div className="w-10" />
        </div>

        {/* Rows */}
        {products.map((product) => (
          <CompactProductRow
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    );
  }

  // List view
  if (viewMode === 'list') {
    return (
      <div className={cn('space-y-4', className)}>
        {products.map((product) => (
          <ListProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            isInWishlist={isInWishlist?.(product.id)}
          />
        ))}
      </div>
    );
  }

  // Grid view (default)
  return (
    <div
      className={cn(
        'grid gap-4',
        'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        className
      )}
    >
      {products.map((product) => (
        <GridProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          isInWishlist={isInWishlist?.(product.id)}
        />
      ))}
    </div>
  );
}

export default SearchProductGrid;
