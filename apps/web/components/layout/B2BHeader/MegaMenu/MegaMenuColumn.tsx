'use client';

/**
 * MegaMenuColumn Component
 *
 * A single column in the MegaMenu displaying a category
 * with its subcategories and third-level items.
 *
 * Features:
 * - Category header with link
 * - Subcategories with collapsible items
 * - Product count badges
 * - Hover interactions
 */

import { memo, useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category, SubCategory, CategoryItem } from '../mockData';

export interface MegaMenuColumnProps {
  /** Category data */
  category: Category;
  /** Additional CSS classes */
  className?: string;
  /** Callback when a link is clicked */
  onLinkClick?: () => void;
}

interface SubCategoryItemProps {
  subcategory: SubCategory;
  categorySlug: string;
  onLinkClick?: () => void;
}

const SubCategorySection = memo(function SubCategorySection({
  subcategory,
  categorySlug,
  onLinkClick,
}: SubCategoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <div className="mb-3">
      {/* Subcategory header */}
      <Link
        href={`/categorie/${categorySlug}/${subcategory.slug}`}
        className={cn(
          'flex items-center justify-between py-1',
          'text-sm font-medium text-neutral-900',
          'hover:text-accent transition-colors duration-150',
          'focus:outline-none focus-visible:text-accent'
        )}
        onClick={onLinkClick}
      >
        <span>{subcategory.name}</span>
        <ChevronRight
          className="w-3.5 h-3.5 text-neutral-500"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </Link>

      {/* Third-level items */}
      {subcategory.items && subcategory.items.length > 0 && isExpanded && (
        <ul className="mt-1 space-y-0.5 pl-0">
          {subcategory.items.slice(0, 5).map((item) => (
            <li key={item.id}>
              <Link
                href={`/categorie/${categorySlug}/${subcategory.slug}/${item.slug}`}
                className={cn(
                  'flex items-center justify-between py-1',
                  'text-sm text-neutral-600',
                  'hover:text-accent transition-colors duration-150',
                  'focus:outline-none focus-visible:text-accent',
                  'group'
                )}
                onClick={onLinkClick}
              >
                <span>{item.name}</span>
                {item.productCount && (
                  <span className="text-xs text-neutral-500 group-hover:text-orange-400">
                    ({item.productCount})
                  </span>
                )}
              </Link>
            </li>
          ))}

          {/* "Voir plus" if there are more than 5 items */}
          {subcategory.items.length > 5 && (
            <li>
              <Link
                href={`/categorie/${categorySlug}/${subcategory.slug}`}
                className={cn(
                  'inline-flex items-center gap-1 py-1',
                  'text-sm text-accent font-medium',
                  'hover:text-orange-600 transition-colors duration-150',
                  'focus:outline-none focus-visible:underline'
                )}
                onClick={onLinkClick}
              >
                <span>Voir tout</span>
                <ChevronRight className="w-3 h-3" strokeWidth={2} />
              </Link>
            </li>
          )}
        </ul>
      )}
    </div>
  );
});

SubCategorySection.displayName = 'SubCategorySection';

export const MegaMenuColumn = memo(function MegaMenuColumn({
  category,
  className,
  onLinkClick,
}: MegaMenuColumnProps) {
  return (
    <div
      className={cn(
        'flex flex-col min-w-[200px]',
        className
      )}
    >
      {/* Category header */}
      <Link
        href={`/categorie/${category.slug}`}
        className={cn(
          'flex items-center gap-2 pb-3 mb-3',
          'text-base font-semibold text-neutral-900',
          'border-b-2 border-accent',
          'hover:text-accent transition-colors duration-150',
          'focus:outline-none focus-visible:text-accent'
        )}
        onClick={onLinkClick}
      >
        <span>{category.name}</span>
      </Link>

      {/* Subcategories */}
      <div className="space-y-1">
        {category.subcategories?.map((subcategory) => (
          <SubCategorySection
            key={subcategory.id}
            subcategory={subcategory}
            categorySlug={category.slug}
            onLinkClick={onLinkClick}
          />
        ))}
      </div>

      {/* View all category link */}
      <Link
        href={`/categorie/${category.slug}`}
        className={cn(
          'inline-flex items-center gap-1 mt-4 pt-3 border-t border-neutral-200',
          'text-sm font-medium text-accent',
          'hover:text-orange-600 transition-colors duration-150',
          'focus:outline-none focus-visible:underline'
        )}
        onClick={onLinkClick}
      >
        <span>Tout voir {category.name}</span>
        <ChevronRight className="w-4 h-4" strokeWidth={2} />
      </Link>
    </div>
  );
});

MegaMenuColumn.displayName = 'MegaMenuColumn';

export default MegaMenuColumn;
