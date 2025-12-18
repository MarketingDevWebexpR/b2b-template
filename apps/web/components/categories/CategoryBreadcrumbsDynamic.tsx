'use client';

/**
 * CategoryBreadcrumbsDynamic Component
 *
 * Dynamic breadcrumb navigation based on category hierarchy.
 * Supports full hierarchical URL paths up to 5 levels.
 *
 * Features:
 * - Hierarchical path display
 * - Responsive truncation
 * - Home and categories root links
 * - Structured data support (JSON-LD)
 * - Accessible navigation
 *
 * @packageDocumentation
 */

import { memo, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, Home, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HierarchicalBreadcrumb } from '@/lib/categories/hierarchy';

// ============================================================================
// Types
// ============================================================================

export interface CategoryBreadcrumbsDynamicProps {
  /** Array of breadcrumb items */
  breadcrumbs: HierarchicalBreadcrumb[];
  /** Whether to show home link */
  showHome?: boolean;
  /** Whether to show categories root link */
  showCategoriesRoot?: boolean;
  /** Maximum items to show before collapsing (0 = no collapse) */
  maxItems?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Include structured data JSON-LD */
  includeStructuredData?: boolean;
}

// ============================================================================
// Size Configurations
// ============================================================================

const sizeConfig = {
  sm: {
    text: 'text-xs',
    icon: 'w-3 h-3',
    chevron: 'w-3 h-3',
    padding: 'py-1',
    gap: 'gap-1',
  },
  md: {
    text: 'text-sm',
    icon: 'w-4 h-4',
    chevron: 'w-3.5 h-3.5',
    padding: 'py-2',
    gap: 'gap-1.5',
  },
  lg: {
    text: 'text-base',
    icon: 'w-5 h-5',
    chevron: 'w-4 h-4',
    padding: 'py-3',
    gap: 'gap-2',
  },
};

// ============================================================================
// Structured Data Generator
// ============================================================================

function generateBreadcrumbJsonLd(
  breadcrumbs: HierarchicalBreadcrumb[],
  baseUrl: string = ''
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.href ? `${baseUrl}${crumb.href}` : undefined,
    })),
  };
}

// ============================================================================
// Component
// ============================================================================

/**
 * CategoryBreadcrumbsDynamic - Hierarchical breadcrumb navigation
 *
 * @example
 * ```tsx
 * <CategoryBreadcrumbsDynamic
 *   breadcrumbs={[
 *     { id: '1', name: 'Bijoux', handle: 'bijoux', href: '/categorie/bijoux', hierarchicalHref: '/categorie/bijoux', depth: 0 },
 *     { id: '2', name: 'Colliers', handle: 'colliers', href: '/categorie/bijoux/colliers', hierarchicalHref: '/categorie/bijoux/colliers', depth: 1 },
 *   ]}
 *   showHome
 *   includeStructuredData
 * />
 * ```
 */
export const CategoryBreadcrumbsDynamic = memo(function CategoryBreadcrumbsDynamic({
  breadcrumbs,
  showHome = true,
  showCategoriesRoot = true,
  maxItems = 0,
  size = 'md',
  className,
  includeStructuredData = false,
}: CategoryBreadcrumbsDynamicProps) {
  const config = sizeConfig[size];

  // Filter out home and categories if they're already in breadcrumbs
  const filteredBreadcrumbs = useMemo(() => {
    return breadcrumbs.filter(
      (crumb) => crumb.id !== 'home' && crumb.id !== 'categories'
    );
  }, [breadcrumbs]);

  // Build display items
  const displayItems = useMemo(() => {
    const items: Array<{
      id: string;
      name: string;
      href: string | null;
      isHome?: boolean;
      isCategories?: boolean;
      isLast: boolean;
    }> = [];

    // Add home
    if (showHome) {
      items.push({
        id: 'home',
        name: 'Accueil',
        href: '/',
        isHome: true,
        isLast: false,
      });
    }

    // Add categories root
    if (showCategoriesRoot) {
      items.push({
        id: 'categories',
        name: 'Categories',
        href: '/c',
        isCategories: true,
        isLast: false,
      });
    }

    // Add category breadcrumbs
    filteredBreadcrumbs.forEach((crumb, index) => {
      const isLast = index === filteredBreadcrumbs.length - 1;
      items.push({
        id: crumb.id,
        name: crumb.name,
        href: isLast ? null : crumb.hierarchicalHref,
        isLast,
      });
    });

    // Apply max items collapse
    if (maxItems > 0 && items.length > maxItems) {
      const firstItems = items.slice(0, 2); // Keep home and categories
      const lastItems = items.slice(-Math.max(1, maxItems - 2));
      return [
        ...firstItems,
        { id: 'ellipsis', name: '...', href: null, isLast: false },
        ...lastItems,
      ];
    }

    return items;
  }, [filteredBreadcrumbs, showHome, showCategoriesRoot, maxItems]);

  // Generate structured data
  const structuredData = useMemo(() => {
    if (!includeStructuredData) return null;

    const allCrumbs: HierarchicalBreadcrumb[] = [];

    if (showHome) {
      allCrumbs.push({
        id: 'home',
        name: 'Accueil',
        handle: '',
        href: '/',
        hierarchicalHref: '/',
        depth: -1,
      });
    }

    if (showCategoriesRoot) {
      allCrumbs.push({
        id: 'categories',
        name: 'Categories',
        handle: '',
        href: '/categorie',
        hierarchicalHref: '/categorie',
        depth: -1,
      });
    }

    allCrumbs.push(...filteredBreadcrumbs);

    return generateBreadcrumbJsonLd(allCrumbs);
  }, [includeStructuredData, showHome, showCategoriesRoot, filteredBreadcrumbs]);

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <>
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      {/* Breadcrumb Navigation */}
      <nav
        className={cn(
          'flex flex-wrap items-center',
          config.gap,
          config.padding,
          className
        )}
        aria-label="Fil d'Ariane"
      >
        <ol className={cn('flex flex-wrap items-center', config.gap)}>
          {displayItems.map((item, index) => {
            const isLast = item.isLast || index === displayItems.length - 1;

            return (
              <li
                key={item.id}
                className={cn('flex items-center', config.gap)}
              >
                {/* Separator (except for first item) */}
                {index > 0 && (
                  <ChevronRight
                    className={cn(config.chevron, 'text-neutral-400 flex-shrink-0')}
                    aria-hidden="true"
                  />
                )}

                {/* Breadcrumb Item */}
                {item.id === 'ellipsis' ? (
                  <span className={cn(config.text, 'text-neutral-400 px-1')}>
                    {item.name}
                  </span>
                ) : isLast ? (
                  <span
                    className={cn(
                      config.text,
                      'font-medium text-neutral-900',
                      'truncate max-w-[200px] sm:max-w-[300px]'
                    )}
                    aria-current="page"
                    title={item.name}
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href || '/'}
                    className={cn(
                      config.text,
                      'flex items-center',
                      config.gap,
                      'text-neutral-600 hover:text-accent',
                      'transition-colors duration-200',
                      'truncate max-w-[150px] sm:max-w-[200px]',
                      'focus:outline-none focus-visible:underline'
                    )}
                    title={item.name}
                  >
                    {item.isHome && (
                      <Home className={cn(config.icon, 'flex-shrink-0')} aria-hidden="true" />
                    )}
                    {item.isCategories && (
                      <Grid3X3 className={cn(config.icon, 'flex-shrink-0')} aria-hidden="true" />
                    )}
                    <span className={cn(!item.isHome && !item.isCategories && 'truncate')}>
                      {item.name}
                    </span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
});

CategoryBreadcrumbsDynamic.displayName = 'CategoryBreadcrumbsDynamic';

export default CategoryBreadcrumbsDynamic;
