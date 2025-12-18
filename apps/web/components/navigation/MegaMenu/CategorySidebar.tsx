'use client';

/**
 * CategorySidebar Component (Level 2)
 *
 * Left sidebar in the dropdown panel displaying Level 2 categories.
 * Hovering over an item reveals Level 3 content in the main grid area.
 * Clicking navigates to the L2 category page.
 * Includes "Voir toutes les catégories" link at bottom.
 */

import { memo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CategoryIcon } from './CategoryIcon';
import type { CategoryLevel1, CategoryLevel2 } from './types';

export interface CategorySidebarProps {
  /** Parent category (Level 1) */
  parentCategory: CategoryLevel1;
  /** Currently active Level 2 category ID */
  activeL2: string | null;
  /** Callback when a Level 2 category is hovered */
  onL2Hover: (categoryId: string | null) => void;
  /** Callback when a Level 2 category is clicked (for closing menu) */
  onL2Click: (category: CategoryLevel2) => void;
  /** Callback when "Voir tout" link is clicked */
  onViewAllClick: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Individual sidebar item for Level 2 category
 * Now renders as a Link for navigation while maintaining hover behavior
 */
interface SidebarItemProps {
  category: CategoryLevel2;
  parentSlug: string;
  isActive: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const SidebarItem = memo(function SidebarItem({
  category,
  parentSlug,
  isActive,
  onMouseEnter,
  onClick,
  onKeyDown,
}: SidebarItemProps) {
  const router = useRouter();
  const hasChildren = category.children && category.children.length > 0;
  const hasProductCount = category.productCount !== undefined && category.productCount > 0;
  const href = `/categorie/${parentSlug}/${category.slug}`;

  // Prefetch on mount for faster navigation
  const handleMouseEnter = useCallback(() => {
    onMouseEnter();
    router.prefetch(href);
  }, [onMouseEnter, router, href]);

  return (
    <li role="none">
      <Link
        href={href}
        role="menuitem"
        aria-haspopup={hasChildren ? 'true' : undefined}
        aria-expanded={hasChildren ? isActive : undefined}
        onMouseEnter={handleMouseEnter}
        onClick={onClick}
        onKeyDown={onKeyDown}
        className={cn(
          // Base styles
          'group w-full flex items-center justify-between gap-3',
          'px-4 py-3',
          'text-left text-sm',
          'rounded-lg',
          'transition-all duration-150 ease-out',
          // Default state
          'text-neutral-700',
          // Hover state
          'hover:bg-neutral-100 hover:text-neutral-900',
          // Active state
          isActive && 'bg-amber-50 text-amber-900 border-l-2 border-amber-600 rounded-l-none',
          // Focus visible
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-inset'
        )}
      >
        <span className="flex items-center gap-3 min-w-0 flex-1">
          <CategoryIcon
            name={category.icon}
            size="sm"
            className={cn(
              'text-neutral-400 transition-colors duration-150',
              'group-hover:text-amber-600',
              isActive && 'text-amber-600'
            )}
          />
          <span className="truncate font-medium">{category.name}</span>
          {hasProductCount && (
            <span className={cn(
              'text-xs tabular-nums',
              'text-neutral-400 group-hover:text-neutral-500',
              isActive && 'text-amber-600'
            )}>
              ({category.productCount})
            </span>
          )}
        </span>
        {hasChildren && (
          <ChevronRight
            className={cn(
              'w-4 h-4 text-neutral-400 shrink-0',
              'transition-all duration-150',
              'group-hover:text-amber-600 group-hover:translate-x-0.5',
              isActive && 'text-amber-600 translate-x-0.5'
            )}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        )}
      </Link>
    </li>
  );
});

SidebarItem.displayName = 'SidebarItem';

/**
 * CategorySidebar renders the Level 2 navigation sidebar.
 * Items show icon and name with chevron for categories with children.
 *
 * @example
 * <CategorySidebar
 *   parentCategory={activeL1Category}
 *   activeL2={activeL2Id}
 *   onL2Hover={setActiveL2}
 *   onL2Click={handleL2Click}
 *   onViewAllClick={handleViewAll}
 * />
 */
export const CategorySidebar = memo(function CategorySidebar({
  parentCategory,
  activeL2,
  onL2Hover,
  onL2Click,
  onViewAllClick,
  className,
}: CategorySidebarProps) {
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number, category: CategoryLevel2) => {
      const items = parentCategory.children || [];
      let nextIndex: number | null = null;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = index < items.length - 1 ? index + 1 : 0;
          break;
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = index > 0 ? index - 1 : items.length - 1;
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (category.children && category.children.length > 0) {
            onL2Click(category);
          }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onL2Click(category);
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = items.length - 1;
          break;
      }

      if (nextIndex !== null) {
        const nextItem = items[nextIndex];
        onL2Hover(nextItem.id);
        // Focus would be handled by the parent component
      }
    },
    [parentCategory.children, onL2Hover, onL2Click]
  );

  const children = parentCategory.children || [];

  return (
    <div
      className={cn(
        'flex flex-col h-full',
        'bg-neutral-50/50',
        'border-r border-neutral-200',
        className
      )}
    >
      {/* Header */}
      <div className="px-4 py-4 border-b border-neutral-200">
        <Link
          href={`/categorie/${parentCategory.slug}`}
          onClick={onViewAllClick}
          className={cn(
            'group flex items-center gap-2',
            'text-base font-semibold text-neutral-900',
            'hover:text-amber-600',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:text-amber-600'
          )}
        >
          <CategoryIcon
            name={parentCategory.icon}
            size="md"
            className="text-amber-600"
          />
          <span>{parentCategory.name}</span>
        </Link>
        {parentCategory.productCount !== undefined && parentCategory.productCount > 0 && (
          <p className="mt-1 text-xs text-neutral-500">
            {parentCategory.productCount.toLocaleString('fr-FR')} produits
          </p>
        )}
      </div>

      {/* Category list */}
      <nav
        className="flex-1 overflow-y-auto py-2"
        aria-label={`Sous-catégories de ${parentCategory.name}`}
      >
        <ul role="menu" className="space-y-1 px-2">
          {children.map((category, index) => (
            <SidebarItem
              key={category.id}
              category={category}
              parentSlug={parentCategory.slug}
              isActive={activeL2 === category.id}
              onMouseEnter={() => onL2Hover(category.id)}
              onClick={() => onL2Click(category)}
              onKeyDown={(e) => handleKeyDown(e, index, category)}
            />
          ))}
        </ul>
      </nav>

      {/* Footer - View all link */}
      <div className="px-4 py-4 border-t border-neutral-200 bg-white">
        <Link
          href={`/categorie/${parentCategory.slug}`}
          onClick={onViewAllClick}
          className={cn(
            'group flex items-center justify-center gap-2',
            'w-full px-4 py-2.5',
            'text-sm font-medium text-amber-600',
            'bg-amber-50 hover:bg-amber-100',
            'rounded-lg',
            'transition-all duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50'
          )}
        >
          <span>Voir toutes les catégories</span>
          <ArrowRight
            className={cn(
              'w-4 h-4',
              'transition-transform duration-150',
              'group-hover:translate-x-1'
            )}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  );
});

CategorySidebar.displayName = 'CategorySidebar';

export default CategorySidebar;
