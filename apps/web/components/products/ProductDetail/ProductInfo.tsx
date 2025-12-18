'use client';

/**
 * ProductInfo - Product Information Display Component
 *
 * Features:
 * - Product name, reference, brand
 * - Short and long descriptions
 * - Product badges (new, promo, exclusive)
 * - Breadcrumb navigation
 * - Collection and style info
 * - Origin and warranty information
 *
 * @packageDocumentation
 */

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Award,
  Shield,
  Globe,
  Sparkles,
  Tag,
  Star,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import type { Product, Category } from '@maison/types';

// ============================================================================
// Types
// ============================================================================

export interface ProductBadge {
  type: 'new' | 'promo' | 'exclusive' | 'bestseller' | 'limited' | 'custom';
  label: string;
  variant?: 'warning' | 'light' | 'success' | 'error' | 'info';
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface ProductInfoProps {
  /** Product data */
  product: Product;
  /** Product badges to display */
  badges?: ProductBadge[];
  /** Custom breadcrumb items */
  breadcrumbs?: BreadcrumbItem[];
  /** Show detailed info (origin, warranty, etc.) */
  showDetailedInfo?: boolean;
  /** Show collection/style info */
  showCollectionInfo?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback when badge is clicked */
  onBadgeClick?: (badge: ProductBadge) => void;
}

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

function getBadgeVariant(type: ProductBadge['type']): ProductBadge['variant'] {
  switch (type) {
    case 'new':
      return 'warning';
    case 'promo':
      return 'error';
    case 'exclusive':
      return 'light';
    case 'bestseller':
      return 'success';
    case 'limited':
      return 'warning';
    default:
      return 'warning';
  }
}

function getBadgeIcon(type: ProductBadge['type']) {
  switch (type) {
    case 'new':
      return <Sparkles className="w-3 h-3" />;
    case 'promo':
      return <Tag className="w-3 h-3" />;
    case 'exclusive':
      return <Award className="w-3 h-3" />;
    case 'bestseller':
      return <Star className="w-3 h-3" />;
    case 'limited':
      return <Clock className="w-3 h-3" />;
    default:
      return null;
  }
}

// ============================================================================
// Component
// ============================================================================

export function ProductInfo({
  product,
  badges = [],
  breadcrumbs,
  showDetailedInfo = true,
  showCollectionInfo = true,
  className,
  onBadgeClick,
}: ProductInfoProps) {
  // Generate default breadcrumbs from product category
  const defaultBreadcrumbs = useMemo<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [
      { label: 'Catalogue', href: '/produits' },
    ];

    if (product.category) {
      items.push({
        label: product.category.name,
        href: `/categorie/${product.category.slug}`,
      });
    }

    items.push({ label: product.name });

    return items;
  }, [product.category, product.name]);

  const displayBreadcrumbs = breadcrumbs || defaultBreadcrumbs;

  // Auto-generate badges based on product properties
  const displayBadges = useMemo<ProductBadge[]>(() => {
    const autoBadges: ProductBadge[] = [...badges];

    // Add "new" badge if product is new
    if (product.isNew && !autoBadges.some((b) => b.type === 'new')) {
      autoBadges.unshift({
        type: 'new',
        label: 'Nouveau',
        variant: 'warning',
      });
    }

    // Add "promo" badge if product has discount
    if (product.compareAtPrice && product.compareAtPrice > product.price) {
      const discountPercent = Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
      );
      if (!autoBadges.some((b) => b.type === 'promo')) {
        autoBadges.push({
          type: 'promo',
          label: `-${discountPercent}%`,
          variant: 'error',
        });
      }
    }

    return autoBadges;
  }, [badges, product.isNew, product.compareAtPrice, product.price]);

  return (
    <motion.div
      className={cn('space-y-6', className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Breadcrumbs */}
      <motion.nav
        variants={itemVariants}
        aria-label="Fil d'Ariane"
        className="flex flex-wrap items-center gap-1.5 text-sm"
      >
        {displayBreadcrumbs.map((item, index) => {
          const isLast = index === displayBreadcrumbs.length - 1;

          return (
            <div key={item.label} className="flex items-center">
              {index > 0 && (
                <ChevronRight
                  className="mx-1.5 h-3.5 w-3.5 text-neutral-500"
                  aria-hidden="true"
                />
              )}
              {isLast || !item.href ? (
                <span
                  className={cn(
                    'text-neutral-900 font-medium',
                    isLast && 'truncate max-w-[200px]'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'text-neutral-600 hover:text-accent',
                    'transition-colors duration-200'
                  )}
                >
                  {item.label}
                </Link>
              )}
            </div>
          );
        })}
      </motion.nav>

      {/* Badges */}
      {displayBadges.length > 0 && (
        <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
          {displayBadges.map((badge, index) => (
            <button
              key={`${badge.type}-${index}`}
              type="button"
              onClick={() => onBadgeClick?.(badge)}
              disabled={!onBadgeClick}
              className={cn(
                'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded',
                !onBadgeClick && 'cursor-default'
              )}
            >
              <Badge
                variant={badge.variant || getBadgeVariant(badge.type)}
                size="sm"
                className="flex items-center gap-1"
              >
                {getBadgeIcon(badge.type)}
                {badge.label}
              </Badge>
            </button>
          ))}
        </motion.div>
      )}

      {/* Brand */}
      {product.brand && (
        <motion.div variants={itemVariants}>
          <Link
            href={`/marques/${product.brand.toLowerCase().replace(/\s+/g, '-')}`}
            className={cn(
              'inline-block text-neutral-600 text-sm uppercase tracking-wider',
              'hover:text-accent transition-colors duration-200'
            )}
          >
            {product.brand}
          </Link>
        </motion.div>
      )}

      {/* Product Name */}
      <motion.h1
        variants={itemVariants}
        className="text-2xl md:text-3xl font-semibold text-neutral-900 leading-tight"
      >
        {product.name}
      </motion.h1>

      {/* Reference */}
      <motion.div variants={itemVariants} className="flex items-center gap-4 text-sm">
        <span className="text-neutral-500">
          Ref: <span className="font-mono text-neutral-600">{product.reference}</span>
        </span>
        {product.ean && (
          <span className="text-neutral-500">
            EAN: <span className="font-mono text-neutral-600">{product.ean}</span>
          </span>
        )}
      </motion.div>

      {/* Short Description */}
      {product.shortDescription && (
        <motion.p
          variants={itemVariants}
          className="text-neutral-600 leading-relaxed"
        >
          {product.shortDescription}
        </motion.p>
      )}

      {/* Collection & Style Info */}
      {showCollectionInfo && (product.collection || product.style) && (
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap gap-4 pt-2 border-t border-neutral-200"
        >
          {product.collection && (
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 text-sm">Collection:</span>
              <Link
                href={`/collections/${product.collection.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-accent text-sm font-medium hover:underline"
              >
                {product.collection}
              </Link>
            </div>
          )}
          {product.style && (
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 text-sm">Style:</span>
              <span className="text-neutral-600 text-sm">{product.style}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Detailed Info */}
      {showDetailedInfo && (
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-neutral-200"
        >
          {/* Origin */}
          {product.origin && (
            <div className="flex items-center gap-2.5 text-sm">
              <Globe className="w-4 h-4 text-neutral-500 flex-shrink-0" />
              <span className="text-neutral-500">Origine:</span>
              <span className="text-neutral-600">{product.origin}</span>
            </div>
          )}

          {/* Warranty */}
          {product.warranty && product.warranty > 0 && (
            <div className="flex items-center gap-2.5 text-sm">
              <Shield className="w-4 h-4 text-neutral-500 flex-shrink-0" />
              <span className="text-neutral-500">Garantie:</span>
              <span className="text-neutral-600">
                {product.warranty >= 12
                  ? `${Math.floor(product.warranty / 12)} an${Math.floor(product.warranty / 12) > 1 ? 's' : ''}`
                  : `${product.warranty} mois`}
              </span>
            </div>
          )}

          {/* Weight */}
          {product.weight && product.weight > 0 && (
            <div className="flex items-center gap-2.5 text-sm">
              <Award className="w-4 h-4 text-neutral-500 flex-shrink-0" />
              <span className="text-neutral-500">Poids:</span>
              <span className="text-neutral-600">
                {product.weight} {product.weightUnit || 'g'}
              </span>
            </div>
          )}

          {/* Materials */}
          {product.materials && product.materials.length > 0 && (
            <div className="flex items-center gap-2.5 text-sm sm:col-span-2">
              <Sparkles className="w-4 h-4 text-neutral-500 flex-shrink-0" />
              <span className="text-neutral-500">Matieres:</span>
              <span className="text-neutral-600">
                {product.materials.join(', ')}
              </span>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export default ProductInfo;
