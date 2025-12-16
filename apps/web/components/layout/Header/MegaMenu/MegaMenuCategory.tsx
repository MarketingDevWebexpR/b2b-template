'use client';

/**
 * MegaMenuCategory Component
 *
 * A single category column in the MegaMenu with subcategories.
 */

import { memo } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CategoryData {
  id: string;
  name: string;
  handle: string;
  children?: {
    id: string;
    name: string;
    handle: string;
    productCount?: number;
  }[];
}

export interface MegaMenuCategoryProps {
  /** Category data */
  category: CategoryData;
  /** Callback when link is clicked */
  onLinkClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const MegaMenuCategory = memo(function MegaMenuCategory({
  category,
  onLinkClick,
  className,
}: MegaMenuCategoryProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {/* Category header */}
      <Link
        href={`/categories/${category.handle}`}
        onClick={onLinkClick}
        className={cn(
          'flex items-center gap-2 pb-3 mb-3',
          'text-base font-semibold text-neutral-900',
          'border-b-2 border-amber-500',
          'hover:text-amber-700 transition-colors duration-150',
          'focus:outline-none focus-visible:text-amber-700'
        )}
      >
        <span>{category.name}</span>
      </Link>

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <ul className="space-y-1">
          {category.children.slice(0, 8).map((sub) => (
            <li key={sub.id}>
              <Link
                href={`/categories/${category.handle}/${sub.handle}`}
                onClick={onLinkClick}
                className={cn(
                  'flex items-center justify-between py-1.5',
                  'text-sm text-neutral-600',
                  'hover:text-amber-700 transition-colors duration-150',
                  'focus:outline-none focus-visible:text-amber-700',
                  'group'
                )}
              >
                <span>{sub.name}</span>
                {sub.productCount && (
                  <span className="text-xs text-neutral-400 group-hover:text-amber-500">
                    ({sub.productCount})
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* View all link */}
      {category.children && category.children.length > 8 && (
        <Link
          href={`/categories/${category.handle}`}
          onClick={onLinkClick}
          className={cn(
            'inline-flex items-center gap-1 mt-3 pt-3 border-t border-neutral-100',
            'text-sm font-medium text-amber-700',
            'hover:text-amber-800 transition-colors duration-150',
            'focus:outline-none focus-visible:underline'
          )}
        >
          <span>Voir tout</span>
          <ChevronRight className="w-4 h-4" strokeWidth={2} />
        </Link>
      )}
    </div>
  );
});

MegaMenuCategory.displayName = 'MegaMenuCategory';

export default MegaMenuCategory;
