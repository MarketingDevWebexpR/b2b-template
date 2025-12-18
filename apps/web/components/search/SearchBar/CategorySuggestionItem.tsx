'use client';

/**
 * CategorySuggestionItem Component
 *
 * Displays a category suggestion in the search dropdown with:
 * - Category icon distinguishing it from products
 * - Full hierarchical path (e.g., "Bijoux > Bagues > Or")
 * - Product count badge
 * - Highlight of matching text
 * - Keyboard navigation support
 *
 * @packageDocumentation
 */

import { memo, useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { CategorySuggestion } from '@/lib/search/medusa-search-client';

// ============================================================================
// Icons
// ============================================================================

function FolderTreeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z" />
      <path d="M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.9a1 1 0 0 1-.88-.55l-.42-.85a1 1 0 0 0-.88-.55H13a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1Z" />
      <path d="M3 5a2 2 0 0 0 2 2h3" />
      <path d="M3 3v13a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

// ============================================================================
// Types
// ============================================================================

export interface CategorySuggestionItemProps {
  /** Category suggestion data */
  category: CategorySuggestion;
  /** Current search query for highlighting */
  query: string;
  /** Whether this item is currently active/focused */
  isActive: boolean;
  /** Index for accessibility */
  index: number;
  /** Click handler */
  onClick: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Highlights matching text in a string
 */
function highlightText(text: string, query: string): JSX.Element {
  if (!query.trim()) {
    return <>{text}</>;
  }

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-orange-100 text-orange-700 rounded px-0.5 font-medium"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

// ============================================================================
// Component
// ============================================================================

export const CategorySuggestionItem = memo(function CategorySuggestionItem({
  category,
  query,
  isActive,
  index,
  onClick,
}: CategorySuggestionItemProps) {
  // Build the category path with highlighting
  const pathElements = useMemo(() => {
    return category.path.map((segment, i) => (
      <span key={i} className="flex items-center">
        {i > 0 && (
          <ChevronRightIcon className="w-3 h-3 mx-1 text-neutral-400 flex-shrink-0" />
        )}
        <span
          className={cn(
            'whitespace-nowrap',
            i === category.path.length - 1 ? 'font-medium text-neutral-900' : 'text-neutral-600'
          )}
        >
          {highlightText(segment, query)}
        </span>
      </span>
    ));
  }, [category.path, query]);

  // Use fullPath if available, otherwise fallback to handle
  const categoryPath = category.fullPath || category.handle;

  return (
    <Link
      href={`/categorie/${categoryPath}`}
      role="option"
      id={`search-category-${index}`}
      aria-selected={isActive}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        'w-full flex items-center gap-3',
        'px-4 py-3',
        'text-left',
        'transition-colors duration-150',
        'focus:outline-none',
        'group',
        isActive
          ? 'bg-orange-50'
          : 'hover:bg-neutral-50'
      )}
    >
      {/* Category Icon */}
      <div
        className={cn(
          'flex items-center justify-center',
          'w-10 h-10',
          'bg-gradient-to-br from-amber-50 to-orange-50',
          'border border-amber-200',
          'rounded-lg',
          'flex-shrink-0',
          'transition-all duration-200',
          isActive && 'border-orange-300 from-orange-50 to-amber-50',
          'group-hover:border-orange-300'
        )}
      >
        <FolderTreeIcon
          className={cn(
            'w-5 h-5',
            'text-amber-600',
            'transition-colors duration-200',
            isActive && 'text-orange-600',
            'group-hover:text-orange-600'
          )}
        />
      </div>

      {/* Category Info */}
      <div className="flex-1 min-w-0 overflow-hidden">
        {/* Category Path */}
        <div className="flex items-center flex-wrap gap-0.5 text-sm">
          {pathElements}
        </div>

        {/* Category Stats */}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-neutral-500">
            Voir les produits de cette categorie
          </span>
        </div>
      </div>

      {/* Product Count Badge */}
      {category.productCount > 0 && (
        <div
          className={cn(
            'flex-shrink-0',
            'px-2 py-0.5',
            'text-xs font-medium',
            'bg-neutral-100 text-neutral-600',
            'rounded-full',
            'transition-colors duration-200',
            isActive && 'bg-orange-100 text-orange-700',
            'group-hover:bg-orange-100 group-hover:text-orange-700'
          )}
        >
          {category.productCount} {category.productCount === 1 ? 'produit' : 'produits'}
        </div>
      )}

      {/* Arrow Indicator */}
      <ChevronRightIcon
        className={cn(
          'w-4 h-4 flex-shrink-0',
          'text-neutral-400',
          'transition-all duration-200',
          isActive && 'text-orange-500 translate-x-0.5',
          'group-hover:text-orange-500 group-hover:translate-x-0.5'
        )}
      />
    </Link>
  );
});

CategorySuggestionItem.displayName = 'CategorySuggestionItem';

export default CategorySuggestionItem;
