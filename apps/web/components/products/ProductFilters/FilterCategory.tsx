'use client';

import { useCallback, useMemo, type MouseEvent, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { useSearchFilters, useSearch } from '@/contexts/SearchContext';
import { FilterCollapsible } from './FilterCollapsible';
import type {
  CategoryNode,
  HierarchicalFacetValue,
  HierarchicalCategoryFacets,
  HierarchicalCategoryPath,
} from '@/contexts/SearchContext';
import { ChevronRight, ChevronLeft, Home } from 'lucide-react';

export interface FilterCategoryProps {
  /** Custom title for the section */
  title?: string;
  /** Whether to show product counts */
  showCounts?: boolean;
  /** Additional class name */
  className?: string;
  /** Use hierarchical facets (v3 format) instead of tree */
  useHierarchical?: boolean;
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
          'hover:bg-neutral-100',
          isSelected && 'text-accent font-medium'
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
              'text-neutral-500 hover:text-accent',
              'transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded'
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
                isSelected ? 'bg-accent' : 'bg-neutral-300'
              )}
            />
          </span>
        )}

        {/* Category name */}
        <span
          className={cn(
            'flex-1 text-sm',
            isSelected ? 'text-accent' : 'text-neutral-900'
          )}
        >
          {node.name}
        </span>

        {/* Count badge */}
        {showCounts && (
          <span
            className={cn(
              'text-xs text-neutral-500',
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

// ============================================================================
// Hierarchical Category Breadcrumb (v3)
// ============================================================================

interface HierarchicalBreadcrumbProps {
  path: HierarchicalCategoryPath | undefined;
  onNavigateToLevel: (level: number) => void;
  onClear: () => void;
}

function HierarchicalBreadcrumb({
  path,
  onNavigateToLevel,
  onClear,
}: HierarchicalBreadcrumbProps) {
  if (!path || path.path.length === 0) {
    return null;
  }

  return (
    <nav
      className="flex items-center flex-wrap gap-1 mb-3 text-sm"
      aria-label="Chemin de categorie"
    >
      <button
        type="button"
        onClick={onClear}
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded',
          'text-neutral-600 hover:text-accent hover:bg-orange-50',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
        )}
        aria-label="Retour a toutes les categories"
      >
        <Home className="w-3.5 h-3.5" />
      </button>

      {path.path.map((segment, index) => (
        <span key={index} className="flex items-center">
          <ChevronRight className="w-4 h-4 text-neutral-400 mx-0.5" aria-hidden="true" />
          {index < path.path.length - 1 ? (
            <button
              type="button"
              onClick={() => onNavigateToLevel(index)}
              className={cn(
                'px-2 py-1 rounded',
                'text-neutral-600 hover:text-accent hover:bg-orange-50',
                'transition-colors duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
              )}
            >
              {segment}
            </button>
          ) : (
            <span className="px-2 py-1 font-medium text-accent">
              {segment}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

// ============================================================================
// Hierarchical Category List (v3)
// ============================================================================

interface HierarchicalCategoryListProps {
  facets: HierarchicalCategoryFacets;
  currentPath: HierarchicalCategoryPath | undefined;
  onSelectCategory: (value: string, level: number) => void;
  onNavigateToLevel: (level: number) => void;
  onClear: () => void;
  showCounts: boolean;
}

function HierarchicalCategoryList({
  facets,
  currentPath,
  onSelectCategory,
  onNavigateToLevel,
  onClear,
  showCounts,
}: HierarchicalCategoryListProps) {
  const currentLevel = currentPath?.level ?? -1;
  const nextLevel = currentLevel + 1;
  const currentPrefix = currentPath?.pathString ?? '';

  const getVisibleCategories = (): HierarchicalFacetValue[] => {
    const levelKeys: (keyof HierarchicalCategoryFacets)[] = [
      'category_lvl0',
      'category_lvl1',
      'category_lvl2',
      'category_lvl3',
      'category_lvl4',
    ];

    if (nextLevel > 4) {
      return [];
    }

    const levelKey = levelKeys[nextLevel];
    const levelFacets = facets[levelKey];

    if (currentLevel < 0) {
      return levelFacets;
    }

    return levelFacets.filter((item) =>
      item.value.startsWith(currentPrefix + ' > ')
    );
  };

  const visibleCategories = getVisibleCategories();
  const showBackButton = currentLevel >= 0;

  return (
    <div className="space-y-2">
      <HierarchicalBreadcrumb
        path={currentPath}
        onNavigateToLevel={onNavigateToLevel}
        onClear={onClear}
      />

      {showBackButton && (
        <button
          type="button"
          onClick={() => onNavigateToLevel(currentLevel - 1)}
          className={cn(
            'flex items-center gap-2 w-full px-2 py-2 rounded-md',
            'text-sm text-neutral-600',
            'hover:bg-neutral-100 hover:text-neutral-900',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Retour</span>
        </button>
      )}

      {visibleCategories.length > 0 ? (
        <div className="space-y-1">
          {visibleCategories.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => onSelectCategory(category.value, nextLevel)}
              className={cn(
                'flex items-center justify-between w-full px-2 py-2 rounded-md',
                'text-sm text-left',
                'hover:bg-neutral-100',
                'transition-colors duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                category.isSelected && 'bg-orange-50 text-accent font-medium'
              )}
              aria-current={category.isSelected ? 'true' : undefined}
            >
              <span>{category.label}</span>
              <span className="flex items-center gap-2">
                {showCounts && (
                  <span className="text-xs text-neutral-500">
                    ({category.count.toLocaleString('fr-FR')})
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </span>
            </button>
          ))}
        </div>
      ) : currentLevel >= 0 ? (
        <p className="text-sm text-neutral-500 italic px-2 py-2">
          Pas de sous-categories
        </p>
      ) : null}
    </div>
  );
}

// ============================================================================
// Main FilterCategory Component
// ============================================================================

/**
 * FilterCategory
 *
 * Hierarchical category filter with tree structure or drill-down navigation.
 * Supports both legacy tree mode and v3 hierarchical facets.
 */
export function FilterCategory({
  title = 'Categories',
  showCounts = true,
  className,
  useHierarchical = true,
}: FilterCategoryProps) {
  const {
    categoryTree,
    hierarchicalCategoryFacets,
    filters,
    toggleCategoryFilter,
    selectHierarchicalCategory,
    navigateToHierarchicalLevel,
    clearHierarchicalCategory,
  } = useSearchFilters();

  const { toggleCategoryExpansion } = useSearch();

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

  // Compute active count based on mode
  const activeCount = useMemo(() => {
    if (useHierarchical) {
      return filters.hierarchicalCategory ? 1 : 0;
    }
    return filters.categories.length;
  }, [useHierarchical, filters.hierarchicalCategory, filters.categories]);

  // Check if we have data to show
  const hasData = useHierarchical
    ? hierarchicalCategoryFacets?.category_lvl0?.length > 0
    : categoryTree?.length > 0;

  if (!hasData) {
    return null;
  }

  return (
    <FilterCollapsible
      title={title}
      activeCount={activeCount}
      defaultExpanded={true}
      className={className}
    >
      {useHierarchical ? (
        <HierarchicalCategoryList
          facets={hierarchicalCategoryFacets}
          currentPath={filters.hierarchicalCategory}
          onSelectCategory={selectHierarchicalCategory}
          onNavigateToLevel={navigateToHierarchicalLevel}
          onClear={clearHierarchicalCategory}
          showCounts={showCounts}
        />
      ) : (
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
      )}
    </FilterCollapsible>
  );
}

export default FilterCategory;
