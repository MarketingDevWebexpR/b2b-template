'use client';

import { useCallback, useMemo, type MouseEvent, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { useSearchFilters, useSearch } from '@/contexts/SearchContext';
import { FilterCollapsible } from './FilterCollapsible';
import type { CategoryNode } from '@/contexts/SearchContext';

export interface FilterCategoryProps {
  /** Custom title for the section */
  title?: string;
  /** Whether to show product counts */
  showCounts?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * CategoryTreeNode
 *
 * Recursive component for rendering category tree nodes with expand/collapse functionality.
 */
interface CategoryTreeNodeProps {
  node: CategoryNode;
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
  onToggleExpand: (categoryId: string) => void;
  showCounts: boolean;
  level?: number;
}

function CategoryTreeNode({
  node,
  selectedCategories,
  onToggleCategory,
  onToggleExpand,
  showCounts,
  level = 0,
}: CategoryTreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedCategories.includes(node.id);
  const isExpanded = node.isExpanded ?? false;

  const handleExpandClick = useCallback(
    (e: MouseEvent | KeyboardEvent) => {
      e.stopPropagation();
      onToggleExpand(node.id);
    },
    [node.id, onToggleExpand]
  );

  const handleSelectClick = useCallback(() => {
    onToggleCategory(node.id);
  }, [node.id, onToggleCategory]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelectClick();
      } else if (e.key === 'ArrowRight' && hasChildren && !isExpanded) {
        e.preventDefault();
        onToggleExpand(node.id);
      } else if (e.key === 'ArrowLeft' && hasChildren && isExpanded) {
        e.preventDefault();
        onToggleExpand(node.id);
      }
    },
    [handleSelectClick, hasChildren, isExpanded, node.id, onToggleExpand]
  );

  return (
    <div className="w-full" role="treeitem" aria-selected={isSelected} aria-expanded={hasChildren ? isExpanded : undefined}>
      <div
        className={cn(
          'flex items-center gap-2 py-1.5 rounded-md cursor-pointer',
          'transition-colors duration-150',
          'hover:bg-b2b-bg-tertiary',
          isSelected && 'text-b2b-primary font-medium'
        )}
        style={{ paddingLeft: `${level * 16 + 4}px` }}
        onClick={handleSelectClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`${node.name}${showCounts ? `, ${node.count} produits` : ''}`}
      >
        {/* Expand/Collapse toggle for parent categories */}
        {hasChildren ? (
          <button
            type="button"
            onClick={handleExpandClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleExpandClick(e);
              }
            }}
            className={cn(
              'flex items-center justify-center w-5 h-5',
              'text-b2b-text-muted hover:text-b2b-primary',
              'transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-b2b-primary rounded'
            )}
            aria-label={isExpanded ? 'Replier' : 'Deplier'}
          >
            <svg
              className={cn(
                'w-4 h-4 transform transition-transform duration-200',
                isExpanded ? 'rotate-90' : 'rotate-0'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        ) : (
          <span className="w-5 h-5 flex items-center justify-center">
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                isSelected ? 'bg-b2b-primary' : 'bg-b2b-border-medium'
              )}
            />
          </span>
        )}

        {/* Category name */}
        <span
          className={cn(
            'flex-1 text-b2b-body-sm',
            isSelected ? 'text-b2b-primary' : 'text-b2b-text-primary'
          )}
        >
          {node.name}
        </span>

        {/* Count badge */}
        {showCounts && (
          <span
            className={cn(
              'text-b2b-caption text-b2b-text-muted',
              'tabular-nums'
            )}
          >
            ({node.count.toLocaleString('fr-FR')})
          </span>
        )}
      </div>

      {/* Children (recursive) */}
      {hasChildren && isExpanded && (
        <div
          role="group"
          className="animate-in slide-in-from-top-2 duration-200"
        >
          {node.children!.map((child) => (
            <CategoryTreeNode
              key={child.id}
              node={child}
              selectedCategories={selectedCategories}
              onToggleCategory={onToggleCategory}
              onToggleExpand={onToggleExpand}
              showCounts={showCounts}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * FilterCategory
 *
 * Hierarchical category filter with tree structure.
 * Supports multi-level categories with expand/collapse and selection.
 */
export function FilterCategory({
  title = 'Categories',
  showCounts = true,
  className,
}: FilterCategoryProps) {
  const {
    categoryTree,
    filters,
    toggleCategoryFilter,
  } = useSearchFilters();

  // Access toggleCategoryExpansion from the main search context
  const { toggleCategoryExpansion } = useSearch();

  const activeCount = filters.categories.length;

  const handleToggleCategory = useCallback(
    (categoryId: string) => {
      toggleCategoryFilter(categoryId);
    },
    [toggleCategoryFilter]
  );

  const handleToggleExpand = useCallback(
    (categoryId: string) => {
      toggleCategoryExpansion(categoryId);
    },
    [toggleCategoryExpansion]
  );

  // Count all selected categories including nested ones
  const totalSelectedCount = useMemo(() => {
    return filters.categories.length;
  }, [filters.categories]);

  if (!categoryTree || categoryTree.length === 0) {
    return null;
  }

  return (
    <FilterCollapsible
      title={title}
      activeCount={totalSelectedCount}
      defaultExpanded={true}
      className={className}
    >
      <div
        role="tree"
        aria-label="Categories de produits"
        className="space-y-0.5"
      >
        {categoryTree.map((node) => (
          <CategoryTreeNode
            key={node.id}
            node={node}
            selectedCategories={filters.categories}
            onToggleCategory={handleToggleCategory}
            onToggleExpand={handleToggleExpand}
            showCounts={showCounts}
          />
        ))}
      </div>
    </FilterCollapsible>
  );
}

export default FilterCategory;
