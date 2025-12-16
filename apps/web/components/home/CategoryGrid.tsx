'use client';

/**
 * CategoryGrid Component
 *
 * Displays a grid of main product categories with icons and labels.
 * Designed for B2B homepage with professional styling.
 *
 * Features:
 * - 6-8 main categories in responsive grid
 * - Custom icons for each category
 * - Hover effects with accent color
 * - Links to category pages
 * - Product count badges
 *
 * Design: Professional B2B style
 * Colors: b2b-primary, b2b-accent, b2b-bg-secondary
 */

import { memo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

// ============================================================================
// Types
// ============================================================================

export interface CategoryGridProps {
  /** Categories to display (from API or mock) */
  categories?: Category[];
  /** Section title */
  title?: string;
  /** Maximum categories to show */
  maxCategories?: number;
  /** Additional CSS classes */
  className?: string;
}

export interface CategoryCardProps {
  /** Category data */
  category: Category;
  /** Icon component or JSX */
  icon: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Icons (SVG inline for performance)
// ============================================================================

const CategoryIcons: Record<string, React.ReactNode> = {
  bagues: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
    </svg>
  ),
  colliers: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.5.33 2.92.92 4.2" />
      <path d="M22 12c0-5.52-4.48-10-10-10" />
      <circle cx="12" cy="20" r="2" />
      <path d="M10 20h4" />
    </svg>
  ),
  bracelets: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <ellipse cx="12" cy="12" rx="9" ry="6" />
      <ellipse cx="12" cy="12" rx="5" ry="3" />
    </svg>
  ),
  boucles: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="8" cy="8" r="4" />
      <circle cx="16" cy="8" r="4" />
      <path d="M8 12v6M16 12v6" />
      <circle cx="8" cy="20" r="2" />
      <circle cx="16" cy="20" r="2" />
    </svg>
  ),
  pendentifs: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 2v6" />
      <path d="M8 8l4-2 4 2" />
      <path d="M12 8l-6 10h12L12 8z" />
    </svg>
  ),
  montres: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 10v2l1.5 1.5" />
      <path d="M8 4V2M16 4V2M8 20v2M16 20v2" />
    </svg>
  ),
  accessoires: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6l3-6z" />
    </svg>
  ),
  pierres: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <polygon points="12,2 22,8.5 18,21 6,21 2,8.5" />
      <path d="M12 2v19M2 8.5h20M6 21l6-12.5 6 12.5" />
    </svg>
  ),
  default: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
};

/**
 * Get icon for a category based on its slug
 */
function getCategoryIcon(slug: string): React.ReactNode {
  const normalizedSlug = slug.toLowerCase().replace(/-/g, '');

  // Map common category names to icons
  if (normalizedSlug.includes('bague') || normalizedSlug.includes('ring')) {
    return CategoryIcons.bagues;
  }
  if (normalizedSlug.includes('collier') || normalizedSlug.includes('necklace')) {
    return CategoryIcons.colliers;
  }
  if (normalizedSlug.includes('bracelet')) {
    return CategoryIcons.bracelets;
  }
  if (normalizedSlug.includes('boucle') || normalizedSlug.includes('earring')) {
    return CategoryIcons.boucles;
  }
  if (normalizedSlug.includes('pendentif') || normalizedSlug.includes('pendant')) {
    return CategoryIcons.pendentifs;
  }
  if (normalizedSlug.includes('montre') || normalizedSlug.includes('watch')) {
    return CategoryIcons.montres;
  }
  if (normalizedSlug.includes('accessoire') || normalizedSlug.includes('accessory')) {
    return CategoryIcons.accessoires;
  }
  if (normalizedSlug.includes('pierre') || normalizedSlug.includes('stone') || normalizedSlug.includes('gem')) {
    return CategoryIcons.pierres;
  }

  return CategoryIcons.default;
}

// ============================================================================
// Mock Data (fallback when no categories provided)
// ============================================================================

const mockCategories: Category[] = [
  { id: '1', name: 'Bagues', slug: 'bagues', description: 'Bagues et alliances', image: '', productCount: 2450 },
  { id: '2', name: 'Colliers', slug: 'colliers', description: 'Colliers et chaines', image: '', productCount: 1890 },
  { id: '3', name: 'Bracelets', slug: 'bracelets', description: 'Bracelets et joncs', image: '', productCount: 1650 },
  { id: '4', name: 'Boucles d\'oreilles', slug: 'boucles-oreilles', description: 'Boucles et puces', image: '', productCount: 2100 },
  { id: '5', name: 'Pendentifs', slug: 'pendentifs', description: 'Pendentifs et medailles', image: '', productCount: 980 },
  { id: '6', name: 'Montres', slug: 'montres', description: 'Montres homme et femme', image: '', productCount: 540 },
  { id: '7', name: 'Accessoires', slug: 'accessoires', description: 'Accessoires bijoux', image: '', productCount: 320 },
  { id: '8', name: 'Pierres precieuses', slug: 'pierres-precieuses', description: 'Pierres et gemmes', image: '', productCount: 180 },
];

// ============================================================================
// Sub-components
// ============================================================================

const CategoryCard = memo(function CategoryCard({
  category,
  icon,
  className,
}: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        'group flex flex-col items-center p-6',
        'bg-white rounded-xl',
        'border border-neutral-200 hover:border-neutral-300',
        'shadow-sm hover:shadow-md',
        'transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        className
      )}
    >
      {/* Icon container */}
      <div
        className={cn(
          'flex items-center justify-center',
          'w-16 h-16 mb-4',
          'bg-neutral-100 rounded-xl',
          'text-neutral-600 group-hover:text-accent',
          'group-hover:bg-orange-50',
          'transition-all duration-200'
        )}
      >
        {icon}
      </div>

      {/* Category name */}
      <h3
        className={cn(
          'text-base text-neutral-900 font-medium',
          'text-center',
          'group-hover:text-neutral-700',
          'transition-colors duration-200'
        )}
      >
        {category.name}
      </h3>

      {/* Product count */}
      <span
        className={cn(
          'mt-2 px-3 py-1',
          'text-xs text-neutral-500',
          'bg-neutral-50 rounded-full'
        )}
      >
        {category.productCount.toLocaleString('fr-FR')} produits
      </span>
    </Link>
  );
});

CategoryCard.displayName = 'CategoryCard';

// ============================================================================
// Main Component
// ============================================================================

export const CategoryGrid = memo(function CategoryGrid({
  categories,
  title = 'Categories principales',
  maxCategories = 8,
  className,
}: CategoryGridProps) {
  // Use provided categories or fallback to mock data
  const displayCategories = (categories && categories.length > 0)
    ? categories.slice(0, maxCategories)
    : mockCategories.slice(0, maxCategories);

  return (
    <section
      className={cn('py-12 lg:py-16', className)}
      aria-labelledby="category-grid-title"
    >
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              id="category-grid-title"
              className="text-2xl font-bold text-neutral-900"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Parcourez notre catalogue par type de produit
            </p>
          </div>

          {/* View all link */}
          <Link
            href="/categories"
            className={cn(
              'hidden sm:flex items-center gap-2',
              'text-sm text-accent hover:text-orange-600',
              'font-medium',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded'
            )}
          >
            Voir toutes les categories
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* Category grid */}
        <div
          className={cn(
            'grid gap-4 lg:gap-6',
            'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4'
          )}
          role="list"
          aria-label="Liste des categories"
        >
          {displayCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              icon={getCategoryIcon(category.slug)}
            />
          ))}
        </div>

        {/* Mobile view all link */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/categories"
            className={cn(
              'inline-flex items-center gap-2',
              'px-6 py-3',
              'text-sm text-accent',
              'bg-orange-50 hover:bg-orange-100',
              'rounded-lg',
              'font-medium',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
            )}
          >
            Voir toutes les categories
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
});

CategoryGrid.displayName = 'CategoryGrid';

export default CategoryGrid;
