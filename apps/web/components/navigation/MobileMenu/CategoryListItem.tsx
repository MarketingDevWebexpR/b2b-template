'use client';

import { memo, useCallback, useRef, useState, type MouseEvent, type TouchEvent } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

// ============================================================================
// Types
// ============================================================================

export interface CategoryListItemProps {
  /** Unique category identifier */
  id: string;
  /** Category display name */
  name: string;
  /** Optional href for direct navigation */
  href?: string;
  /** Optional icon component or element (L1-L2 only) */
  icon?: React.ReactNode;
  /** Number of products in this category */
  productCount?: number;
  /** Whether this category has children */
  hasChildren?: boolean;
  /** Current navigation depth level (0-4) */
  level?: number;
  /** Callback when category is tapped to expand children */
  onExpand?: (id: string, name: string) => void;
  /** Callback when category link is clicked */
  onNavigate?: (href: string) => void;
  /** Whether the item is currently selected/active */
  isActive?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const LONG_PRESS_DURATION = 500; // ms

// ============================================================================
// Component
// ============================================================================

/**
 * Category List Item
 *
 * Renders a single category item in the mobile navigation.
 * Supports icons (L1-L2), product count badges, and expansion.
 *
 * Interaction behavior:
 * - Tap: Navigate to category page OR expand children (based on hasChildren)
 * - Long press: Expand children (if available)
 * - Chevron tap: Always expand children (if available)
 *
 * Features:
 * - 48px minimum touch target height
 * - Icons for L1-L2 categories
 * - Product count badge
 * - Chevron indicator for categories with children
 * - Active/pressed states
 * - Dividers between items (via parent styling)
 *
 * @example
 * ```tsx
 * // Category with children
 * <CategoryListItem
 *   id="rings"
 *   name="Bagues"
 *   icon={<RingIcon />}
 *   productCount={245}
 *   hasChildren
 *   onExpand={(id, name) => pushCategory(id, name)}
 * />
 *
 * // Leaf category (no children)
 * <CategoryListItem
 *   id="gold-rings"
 *   name="Bagues en or"
 *   href="/categories/bagues/or"
 *   productCount={89}
 *   onNavigate={(href) => router.push(href)}
 * />
 * ```
 */
const CategoryListItem = memo(function CategoryListItem({
  id,
  name,
  href,
  icon,
  productCount,
  hasChildren = false,
  level = 0,
  onExpand,
  onNavigate,
  isActive = false,
  className,
}: CategoryListItemProps) {
  const [isPressed, setIsPressed] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggeredRef = useRef(false);

  // Show icon only on L1-L2 (level 0-1)
  const showIcon = icon && level <= 1;

  // ============================================================================
  // Long Press Handlers
  // ============================================================================

  const startLongPress = useCallback(() => {
    if (!hasChildren || !onExpand) return;

    longPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      onExpand(id, name);
    }, LONG_PRESS_DURATION);
  }, [hasChildren, onExpand, id, name]);

  const cancelLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Mouse handlers
  const handleMouseDown = useCallback(() => {
    setIsPressed(true);
    startLongPress();
  }, [startLongPress]);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
    cancelLongPress();
  }, [cancelLongPress]);

  const handleMouseLeave = useCallback(() => {
    setIsPressed(false);
    cancelLongPress();
  }, [cancelLongPress]);

  // Touch handlers
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      setIsPressed(true);
      startLongPress();
    },
    [startLongPress]
  );

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
    cancelLongPress();
  }, [cancelLongPress]);

  const handleTouchCancel = useCallback(() => {
    setIsPressed(false);
    cancelLongPress();
  }, [cancelLongPress]);

  // ============================================================================
  // Click Handlers
  // ============================================================================

  const handleItemClick = useCallback(
    (e: MouseEvent) => {
      // If long press was triggered, don't navigate
      if (longPressTriggeredRef.current) {
        e.preventDefault();
        return;
      }

      // If has children, expand instead of navigate
      if (hasChildren && onExpand) {
        e.preventDefault();
        onExpand(id, name);
        return;
      }

      // Otherwise, navigate to href
      if (href && onNavigate) {
        onNavigate(href);
      }
    },
    [hasChildren, onExpand, id, name, href, onNavigate]
  );

  const handleChevronClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (hasChildren && onExpand) {
        onExpand(id, name);
      }
    },
    [hasChildren, onExpand, id, name]
  );

  // ============================================================================
  // Render
  // ============================================================================

  const itemContent = (
    <>
      {/* Icon (L1-L2 only) */}
      {showIcon && (
        <span
          className={cn(
            'flex-shrink-0',
            'flex items-center justify-center',
            'w-10 h-10 rounded-lg',
            'bg-surface-secondary',
            'text-content-muted',
            // Highlight when active
            isActive && 'bg-accent/10 text-accent'
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}

      {/* Name and count */}
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            'block truncate',
            'text-body font-medium',
            isActive ? 'text-accent' : 'text-content-primary'
          )}
        >
          {name}
        </span>
      </div>

      {/* Product count badge */}
      {productCount !== undefined && productCount > 0 && (
        <Badge
          variant="light"
          size="sm"
          className="flex-shrink-0"
        >
          {productCount}
        </Badge>
      )}

      {/* Chevron for categories with children */}
      {hasChildren && (
        <button
          type="button"
          onClick={handleChevronClick}
          className={cn(
            'flex-shrink-0',
            'flex items-center justify-center',
            'w-10 h-10 -mr-2',
            'rounded-lg',
            'text-content-muted',
            'hover:bg-surface-secondary hover:text-content-primary',
            'transition-colors duration-150',
            // Focus styles
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30'
          )}
          aria-label={`Voir les sous-categories de ${name}`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </>
  );

  const sharedStyles = cn(
    // Layout
    'flex items-center gap-3',
    'w-full px-4 py-3',
    // Minimum touch target height (48px)
    'min-h-[48px]',
    // Visual styles
    'bg-white',
    'border-b border-stroke-light last:border-b-0',
    // States
    isPressed && 'bg-surface-secondary',
    isActive && 'bg-accent/5',
    // Transitions
    'transition-colors duration-150',
    className
  );

  // If no children and has href, render as Link
  if (!hasChildren && href) {
    return (
      <Link
        href={href}
        onClick={handleItemClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        className={cn(
          sharedStyles,
          'hover:bg-surface-secondary',
          'focus:outline-none focus-visible:bg-surface-secondary'
        )}
      >
        {itemContent}
      </Link>
    );
  }

  // Otherwise, render as button
  return (
    <button
      type="button"
      onClick={handleItemClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      className={cn(
        sharedStyles,
        'text-left',
        'hover:bg-surface-secondary',
        'focus:outline-none focus-visible:bg-surface-secondary'
      )}
    >
      {itemContent}
    </button>
  );
});

export { CategoryListItem };
export default CategoryListItem;
