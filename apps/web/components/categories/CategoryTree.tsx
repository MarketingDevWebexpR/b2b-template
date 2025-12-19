'use client';

/**
 * CategoryTree Component
 *
 * Expandable hierarchical tree navigation for categories.
 * Supports up to 5 levels of depth with smooth animations.
 *
 * Features:
 * - Expandable/collapsible nodes
 * - Active state highlighting
 * - Product count badges
 * - Keyboard navigation
 * - Responsive design
 *
 * @packageDocumentation
 */

import { memo, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCategoryPath } from '@/lib/categories/hierarchy';
import type { CategoryTreeNode, IndexedCategory } from '@/types/category';

// ============================================================================
// Types
// ============================================================================

export interface CategoryTreeProps {
  /** Tree data to display */
  tree: CategoryTreeNode[];
  /** Currently active category handle */
  activeHandle?: string;
  /** Maximum depth to display (default: 5) */
  maxDepth?: number;
  /** Whether to show product counts */
  showCounts?: boolean;
  /** Whether to auto-expand path to active category */
  autoExpandActive?: boolean;
  /** Callback when a category is selected */
  onSelect?: (category: IndexedCategory) => void;
  /** Additional CSS classes */
  className?: string;
  /** Compact mode for sidebars */
  compact?: boolean;
}

interface TreeNodeProps {
  node: CategoryTreeNode;
  depth: number;
  maxDepth: number;
  activeHandle?: string;
  expandedIds: Set<string>;
  showCounts: boolean;
  compact: boolean;
  onToggle: (id: string) => void;
  onSelect?: (category: IndexedCategory) => void;
}

// ============================================================================
// Animation Variants
// ============================================================================

const childrenVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.2,
      ease: 'easeInOut' as const,
    },
  },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
};

// ============================================================================
// Tree Node Component
// ============================================================================

const TreeNode = memo(function TreeNode({
  node,
  depth,
  maxDepth,
  activeHandle,
  expandedIds,
  showCounts,
  compact,
  onToggle,
  onSelect,
}: TreeNodeProps) {
  const isExpanded = expandedIds.has(node.id);
  const isActive = node.handle === activeHandle;
  const hasChildren = node.children.length > 0;
  const canExpand = hasChildren && depth < maxDepth;
  const categoryPath = getCategoryPath(node);

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (canExpand) {
        onToggle(node.id);
      }
    },
    [canExpand, node.id, onToggle]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (canExpand) {
          onToggle(node.id);
        }
      }
    },
    [canExpand, node.id, onToggle]
  );

  const handleSelect = useCallback(() => {
    onSelect?.(node);
  }, [node, onSelect]);

  // Indentation based on depth
  const indentPadding = compact ? depth * 12 : depth * 16;

  return (
    <div className="select-none">
      <div
        className={cn(
          'group flex items-center gap-2',
          'rounded-lg transition-colors duration-150',
          compact ? 'py-1.5 px-2' : 'py-2 px-3',
          isActive
            ? 'bg-accent/10 text-accent'
            : 'hover:bg-neutral-100 text-neutral-700 hover:text-neutral-900'
        )}
        style={{ paddingLeft: `${indentPadding + (compact ? 8 : 12)}px` }}
      >
        {/* Expand/Collapse Button */}
        {canExpand ? (
          <button
            type="button"
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            className={cn(
              'flex-shrink-0 p-0.5 rounded transition-colors',
              'hover:bg-neutral-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
            )}
            aria-label={isExpanded ? 'Reduire' : 'Developper'}
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <ChevronDown className={cn('w-4 h-4', isActive && 'text-accent')} />
            ) : (
              <ChevronRight className={cn('w-4 h-4', isActive && 'text-accent')} />
            )}
          </button>
        ) : (
          <span className="w-5 flex-shrink-0" aria-hidden="true" />
        )}

        {/* Folder Icon */}
        <span className="flex-shrink-0" aria-hidden="true">
          {hasChildren ? (
            isExpanded ? (
              <FolderOpen className={cn('w-4 h-4', isActive ? 'text-accent' : 'text-neutral-400')} />
            ) : (
              <Folder className={cn('w-4 h-4', isActive ? 'text-accent' : 'text-neutral-400')} />
            )
          ) : (
            <Package className={cn('w-4 h-4', isActive ? 'text-accent' : 'text-neutral-400')} />
          )}
        </span>

        {/* Category Link */}
        <Link
          href={categoryPath}
          onClick={handleSelect}
          className={cn(
            'flex-1 min-w-0 truncate',
            compact ? 'text-sm' : 'text-sm',
            'font-medium',
            'focus:outline-none focus-visible:underline',
            isActive && 'font-semibold'
          )}
          title={node.name}
        >
          {node.name}
        </Link>

        {/* Product Count Badge */}
        {showCounts && node.product_count > 0 && (
          <span
            className={cn(
              'flex-shrink-0 px-1.5 py-0.5 rounded-full',
              'text-[10px] font-medium',
              isActive
                ? 'bg-accent/20 text-accent'
                : 'bg-neutral-200 text-neutral-600'
            )}
          >
            {node.product_count}
          </span>
        )}
      </div>

      {/* Children */}
      <AnimatePresence initial={false}>
        {isExpanded && hasChildren && depth < maxDepth && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={childrenVariants}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                maxDepth={maxDepth}
                activeHandle={activeHandle}
                expandedIds={expandedIds}
                showCounts={showCounts}
                compact={compact}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// ============================================================================
// Main Component
// ============================================================================

/**
 * CategoryTree - Expandable hierarchical category navigation
 *
 * @example
 * ```tsx
 * <CategoryTree
 *   tree={categoryTree}
 *   activeHandle="colliers"
 *   showCounts
 *   autoExpandActive
 * />
 * ```
 */
export const CategoryTree = memo(function CategoryTree({
  tree,
  activeHandle,
  maxDepth = 5,
  showCounts = true,
  autoExpandActive = true,
  onSelect,
  className,
  compact = false,
}: CategoryTreeProps) {
  // Find all category IDs that should be expanded to show active category
  const initialExpanded = useMemo(() => {
    if (!autoExpandActive || !activeHandle) {
      return new Set<string>();
    }

    const expanded = new Set<string>();

    // Find the active category and expand all its ancestors
    function findAndExpand(nodes: CategoryTreeNode[]): boolean {
      for (const node of nodes) {
        if (node.handle === activeHandle) {
          return true;
        }

        if (node.children.length > 0) {
          const found = findAndExpand(node.children);
          if (found) {
            expanded.add(node.id);
            return true;
          }
        }
      }

      return false;
    }

    findAndExpand(tree);
    return expanded;
  }, [tree, activeHandle, autoExpandActive]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(initialExpanded);

  const handleToggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    const allIds = new Set<string>();

    function collect(nodes: CategoryTreeNode[]) {
      for (const node of nodes) {
        if (node.children.length > 0) {
          allIds.add(node.id);
          collect(node.children);
        }
      }
    }

    collect(tree);
    setExpandedIds(allIds);
  }, [tree]);

  const handleCollapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  if (tree.length === 0) {
    return (
      <div className={cn('p-4 text-center text-sm text-neutral-500', className)}>
        Aucune categorie disponible
      </div>
    );
  }

  return (
    <nav
      className={cn('space-y-0.5', className)}
      aria-label="Arborescence des categories"
    >
      {/* Expand/Collapse All Controls */}
      {!compact && tree.some((node) => node.children.length > 0) && (
        <div className="flex items-center justify-end gap-2 mb-3 pb-2 border-b border-neutral-200">
          <button
            type="button"
            onClick={handleExpandAll}
            className="text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Tout developper
          </button>
          <span className="text-neutral-300">|</span>
          <button
            type="button"
            onClick={handleCollapseAll}
            className="text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Tout reduire
          </button>
        </div>
      )}

      {/* Tree Nodes */}
      {tree.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          depth={0}
          maxDepth={maxDepth}
          activeHandle={activeHandle}
          expandedIds={expandedIds}
          showCounts={showCounts}
          compact={compact}
          onToggle={handleToggle}
          onSelect={onSelect}
        />
      ))}
    </nav>
  );
});

CategoryTree.displayName = 'CategoryTree';

export default CategoryTree;
