'use client';

/**
 * CategoryCard Component
 *
 * Beautiful category card with background image, icon overlay, and hover effects.
 * Designed for the "Nos Categories" homepage section.
 *
 * Features:
 * - Background image with Next/Image (optimized, lazy loaded)
 * - Gradient overlay (transparent to black)
 * - Icon in top-left corner
 * - Category name at bottom
 * - Subcategory count badge
 * - Hover: scale(1.05) on image, darker overlay
 */

import { memo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface CategoryCardData {
  /** Unique identifier */
  id: string;
  /** Category display name */
  name: string;
  /** URL slug for category page */
  handle: string;
  /** Icon name or SVG string */
  icon?: string;
  /** Background image URL */
  image_url?: string;
  /** Number of direct subcategories */
  childCount?: number;
  /** Total product count (includes products from subcategories) */
  productCount?: number;
  /** Rank for sorting */
  rank?: number;
}

export interface CategoryCardProps {
  /** Category data */
  category: CategoryCardData;
  /** Priority for image loading (first 3 should be true) */
  priority?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Category Icons (SVG inline for performance)
// ============================================================================

const CategoryIcons: Record<string, React.ReactNode> = {
  electricite: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  plomberie: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 15.5m14.8-.2l.7 1.75a2.25 2.25 0 01-2.188 2.95h-10.5a2.25 2.25 0 01-2.188-2.95l.7-1.75" />
    </svg>
  ),
  outillage: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
  ),
  chauffage: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
    </svg>
  ),
  climatisation: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  ),
  quincaillerie: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  ),
  default: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
};

/**
 * Get icon for a category based on its handle/name
 */
function getCategoryIcon(handle: string, customIcon?: string): React.ReactNode {
  // If custom icon provided, try to use it
  if (customIcon && CategoryIcons[customIcon.toLowerCase()]) {
    return CategoryIcons[customIcon.toLowerCase()];
  }

  const normalizedHandle = handle.toLowerCase().replace(/-/g, '');

  // Map common category names to icons
  if (normalizedHandle.includes('electri') || normalizedHandle.includes('electric')) {
    return CategoryIcons.electricite;
  }
  if (normalizedHandle.includes('plomb') || normalizedHandle.includes('plumb')) {
    return CategoryIcons.plomberie;
  }
  if (normalizedHandle.includes('outil') || normalizedHandle.includes('tool')) {
    return CategoryIcons.outillage;
  }
  if (normalizedHandle.includes('chauff') || normalizedHandle.includes('heat')) {
    return CategoryIcons.chauffage;
  }
  if (normalizedHandle.includes('climat') || normalizedHandle.includes('cool') || normalizedHandle.includes('air')) {
    return CategoryIcons.climatisation;
  }
  if (normalizedHandle.includes('quinc') || normalizedHandle.includes('hardw')) {
    return CategoryIcons.quincaillerie;
  }

  return CategoryIcons.default;
}

// ============================================================================
// Component
// ============================================================================

export const CategoryCard = memo(function CategoryCard({
  category,
  priority = false,
  className,
}: CategoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const icon = getCategoryIcon(category.handle, category.icon);
  const hasImage = category.image_url && !imageError;
  const categoryUrl = `/categorie/${category.handle}`;

  return (
    <Link
      href={categoryUrl}
      className={cn(
        'group relative block overflow-hidden rounded-xl',
        // Responsive heights
        'h-[200px] md:h-[250px] lg:h-[280px]',
        // Focus styles
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`Voir la catégorie ${category.name}`}
    >
      {/* Background Image or Placeholder */}
      <div
        className={cn(
          'absolute inset-0 transition-transform duration-300 ease-luxe',
          isHovered && 'scale-105'
        )}
      >
        {hasImage ? (
          <Image
            src={category.image_url!}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover"
            priority={priority}
            onError={() => setImageError(true)}
          />
        ) : (
          // Gradient placeholder when no image
          <div
            className={cn(
              'absolute inset-0',
              'bg-gradient-to-br from-primary-200 via-primary-300 to-primary-400'
            )}
          >
            {/* Pattern overlay for visual interest */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div
        className={cn(
          'absolute inset-0 transition-all duration-300',
          'bg-gradient-to-t from-black/60 via-black/20 to-transparent',
          isHovered && 'from-black/70 via-black/30'
        )}
        aria-hidden="true"
      />

      {/* Icon Badge - Top Left */}
      <div
        className={cn(
          'absolute top-4 left-4',
          'flex items-center justify-center',
          'w-10 h-10 rounded-lg',
          'bg-white/20 backdrop-blur-sm',
          'text-white',
          'transition-all duration-300',
          isHovered && 'bg-white/30 scale-110'
        )}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Product Count Badge - Top Right (shows total products including subcategories) */}
      {category.productCount !== undefined && category.productCount > 0 && (
        <div
          className={cn(
            'absolute top-4 right-4',
            'px-2.5 py-1 rounded-full',
            'bg-white/20 backdrop-blur-sm',
            'text-white text-caption font-medium',
            'transition-all duration-300',
            isHovered && 'bg-white/30'
          )}
        >
          {category.productCount.toLocaleString('fr-FR')} {category.productCount === 1 ? 'produit' : 'produits'}
        </div>
      )}
      {/* Subcategory Count Badge - Fallback if no product count */}
      {(category.productCount === undefined || category.productCount === 0) &&
       category.childCount !== undefined && category.childCount > 0 && (
        <div
          className={cn(
            'absolute top-4 right-4',
            'px-2.5 py-1 rounded-full',
            'bg-white/20 backdrop-blur-sm',
            'text-white text-caption font-medium',
            'transition-all duration-300',
            isHovered && 'bg-white/30'
          )}
        >
          {category.childCount} {category.childCount === 1 ? 'categorie' : 'categories'}
        </div>
      )}

      {/* Content - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5">
        <h3
          className={cn(
            'text-card-title lg:text-product-title font-semibold text-white',
            'drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]',
            'transition-colors duration-200',
            'group-hover:text-accent-200'
          )}
        >
          {category.name}
        </h3>

      </div>

      {/* Card shadow on hover */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl pointer-events-none',
          'transition-shadow duration-300',
          isHovered && 'shadow-card-hover'
        )}
        aria-hidden="true"
      />
    </Link>
  );
});

CategoryCard.displayName = 'CategoryCard';

export default CategoryCard;
