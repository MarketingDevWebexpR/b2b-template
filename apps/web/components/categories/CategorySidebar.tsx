'use client';

/**
 * CategorySidebar Component
 *
 * Sidebar navigation for category pages showing:
 * - Parent category link
 * - Sibling categories
 * - Current category children
 * - Category tree navigation
 *
 * Features:
 * - Active state highlighting
 * - Collapsible sections
 * - Product counts
 * - Responsive design
 *
 * @packageDocumentation
 */

import { memo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  FolderTree,
  Package,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCategoryPath, getDepthLevelName } from '@/lib/categories/hierarchy';
import { CategoryTree } from './CategoryTree';
import type { IndexedCategory, CategoryTreeNode } from '@/types/category';

// ============================================================================
// Types
// ============================================================================

export interface CategorySidebarProps {
  /** Current category */
  currentCategory: IndexedCategory;
  /** Parent category (null if root) */
  parentCategory: IndexedCategory | null;
  /** Sibling categories (same level) */
  siblings: IndexedCategory[];
  /** Child categories */
  children: IndexedCategory[];
  /** Full category tree for navigation */
  categoryTree?: CategoryTreeNode[];
  /** Show product counts */
  showCounts?: boolean;
  /** Show full tree navigation */
  showTree?: boolean;
  /** Additional CSS classes */
  className?: string;
}

interface SidebarSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}

// ============================================================================
// Sidebar Section Component
// ============================================================================

const SidebarSection = memo(function SidebarSection({
  title,
  icon,
  children,
  defaultOpen = true,
  count,
}: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-neutral-200 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between',
          'py-3 px-4',
          'text-sm font-semibold text-neutral-900',
          'hover:bg-neutral-50 transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset'
        )}
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          {icon}
          {title}
          {count !== undefined && (
            <span className="text-xs font-normal text-neutral-500">({count})</span>
          )}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-neutral-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-neutral-400" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-3 px-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// ============================================================================
// Category Link Component
// ============================================================================

interface CategoryLinkProps {
  category: IndexedCategory;
  isActive?: boolean;
  showCount?: boolean;
  indent?: number;
}

const CategoryLink = memo(function CategoryLink({
  category,
  isActive = false,
  showCount = true,
  indent = 0,
}: CategoryLinkProps) {
  const categoryPath = getCategoryPath(category);

  return (
    <Link
      href={categoryPath}
      className={cn(
        'flex items-center justify-between',
        'py-2 px-3 rounded-lg',
        'text-sm transition-colors duration-150',
        isActive
          ? 'bg-accent/10 text-accent font-medium'
          : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
      )}
      style={{ paddingLeft: `${12 + indent * 12}px` }}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="truncate">{category.name}</span>
      {showCount && category.product_count > 0 && (
        <span
          className={cn(
            'flex-shrink-0 ml-2 px-1.5 py-0.5 rounded-full',
            'text-[10px] font-medium',
            isActive
              ? 'bg-accent/20 text-accent'
              : 'bg-neutral-200 text-neutral-600'
          )}
        >
          {category.product_count}
        </span>
      )}
    </Link>
  );
});

// ============================================================================
// Main Component
// ============================================================================

/**
 * CategorySidebar - Category page sidebar navigation
 *
 * @example
 * ```tsx
 * <CategorySidebar
 *   currentCategory={category}
 *   parentCategory={parent}
 *   siblings={siblings}
 *   children={children}
 *   showCounts
 * />
 * ```
 */
export const CategorySidebar = memo(function CategorySidebar({
  currentCategory,
  parentCategory,
  siblings,
  children,
  categoryTree,
  showCounts = true,
  showTree = false,
  className,
}: CategorySidebarProps) {
  const depthName = getDepthLevelName(currentCategory.depth);

  return (
    <aside className={cn('w-full', className)}>
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {/* Current Category Header */}
        <div className="p-4 bg-neutral-50 border-b border-neutral-200">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
            <Layers className="w-3.5 h-3.5" />
            {depthName}
          </div>
          <h3 className="font-semibold text-neutral-900 text-lg">
            {currentCategory.name}
          </h3>
          {currentCategory.product_count > 0 && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-neutral-600">
              <Package className="w-4 h-4" />
              {currentCategory.product_count.toLocaleString('fr-FR')} produit
              {currentCategory.product_count !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Back to Parent */}
        {parentCategory && (
          <div className="px-4 py-3 border-b border-neutral-200">
            <Link
              href={getCategoryPath(parentCategory)}
              className={cn(
                'flex items-center gap-2',
                'text-sm text-neutral-600 hover:text-accent',
                'transition-colors duration-150',
                'focus:outline-none focus-visible:underline'
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour a {parentCategory.name}</span>
            </Link>
          </div>
        )}

        {/* Subcategories */}
        {children.length > 0 && (
          <SidebarSection
            title="Sous-categories"
            icon={<FolderTree className="w-4 h-4" />}
            count={children.length}
            defaultOpen
          >
            <div className="space-y-1">
              {children
                .sort((a, b) => a.rank - b.rank)
                .map((child) => (
                  <CategoryLink
                    key={child.id}
                    category={child}
                    showCount={showCounts}
                  />
                ))}
            </div>
          </SidebarSection>
        )}

        {/* Sibling Categories */}
        {siblings.length > 0 && (
          <SidebarSection
            title="Categories du meme niveau"
            count={siblings.length}
            defaultOpen={children.length === 0}
          >
            <div className="space-y-1">
              {siblings
                .sort((a, b) => a.rank - b.rank)
                .map((sibling) => (
                  <CategoryLink
                    key={sibling.id}
                    category={sibling}
                    showCount={showCounts}
                  />
                ))}
            </div>
          </SidebarSection>
        )}

        {/* Full Tree Navigation */}
        {showTree && categoryTree && categoryTree.length > 0 && (
          <SidebarSection
            title="Toutes les categories"
            defaultOpen={false}
          >
            <CategoryTree
              tree={categoryTree}
              activeHandle={currentCategory.handle}
              showCounts={showCounts}
              compact
              autoExpandActive
              maxDepth={5}
            />
          </SidebarSection>
        )}

        {/* No Navigation Available */}
        {children.length === 0 && siblings.length === 0 && !parentCategory && (
          <div className="p-4 text-sm text-neutral-500 text-center">
            Navigation non disponible
          </div>
        )}
      </div>
    </aside>
  );
});

CategorySidebar.displayName = 'CategorySidebar';

export default CategorySidebar;
