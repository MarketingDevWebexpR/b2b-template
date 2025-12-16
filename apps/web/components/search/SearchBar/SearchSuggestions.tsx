'use client';

/**
 * SearchSuggestions Component
 *
 * Dropdown component displaying product, category, and brand suggestions
 * with highlight of matching text and keyboard navigation support.
 *
 * @packageDocumentation
 */

import { memo, useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import type { SearchSuggestion } from '@/contexts/SearchContext';

// ============================================================================
// Icons
// ============================================================================

function ArrowRightIcon({ className }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function PackageIcon({ className }: { className?: string }) {
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
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
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
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
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
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('animate-spin', className)}
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// ============================================================================
// Types
// ============================================================================

export interface SearchSuggestionsProps {
  /** Current search query for highlighting */
  query: string;
  /** Product suggestions */
  products: SearchSuggestion[];
  /** Category suggestions */
  categories: SearchSuggestion[];
  /** Brand suggestions */
  brands: SearchSuggestion[];
  /** Currently active/focused index */
  activeIndex: number;
  /** Loading state */
  isLoading?: boolean;
  /** Click handler for suggestion */
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Highlight matching text in a string
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
            className="bg-b2b-accent-100 text-b2b-accent-700 rounded px-0.5"
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
// Section Components
// ============================================================================

interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
}

function SectionHeader({ title, icon }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2',
        'px-4 py-2',
        'text-b2b-label',
        'text-b2b-text-muted',
        'uppercase tracking-wide',
        'bg-b2b-bg-secondary',
        'border-b border-b2b-border-light'
      )}
    >
      {icon}
      <span>{title}</span>
    </div>
  );
}

// ============================================================================
// Product Suggestion Item
// ============================================================================

interface ProductItemProps {
  suggestion: SearchSuggestion;
  query: string;
  isActive: boolean;
  index: number;
  onClick: () => void;
}

const ProductItem = memo(function ProductItem({
  suggestion,
  query,
  isActive,
  index,
  onClick,
}: ProductItemProps) {
  const imageSrc = suggestion.image || '/images/placeholder-product.svg';

  return (
    <button
      type="button"
      role="option"
      id={`search-option-${index}`}
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3',
        'px-4 py-3',
        'text-left',
        'transition-colors duration-150',
        'focus:outline-none',
        isActive
          ? 'bg-b2b-primary-50'
          : 'hover:bg-b2b-bg-secondary'
      )}
    >
      {/* Product Image */}
      <div
        className={cn(
          'relative flex-shrink-0',
          'w-12 h-12',
          'bg-white',
          'border border-b2b-border-light',
          'rounded-md',
          'overflow-hidden'
        )}
      >
        <Image
          src={imageSrc}
          alt={suggestion.text}
          fill
          sizes="48px"
          className="object-contain p-1"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={cn(
                'text-b2b-body font-medium',
                'text-b2b-text-primary',
                'truncate'
              )}
            >
              {highlightText(suggestion.text, query)}
            </p>
            {suggestion.category && (
              <p className="text-b2b-caption text-b2b-text-muted truncate">
                {suggestion.category}
              </p>
            )}
          </div>

          {/* Price */}
          {suggestion.price !== undefined && (
            <span
              className={cn(
                'flex-shrink-0',
                'text-b2b-price-sm',
                'text-b2b-primary-600',
                'whitespace-nowrap'
              )}
            >
              {formatCurrency(suggestion.price)} HT
            </span>
          )}
        </div>
      </div>
    </button>
  );
});

// ============================================================================
// Category/Brand Item
// ============================================================================

interface SimpleItemProps {
  suggestion: SearchSuggestion;
  query: string;
  isActive: boolean;
  index: number;
  onClick: () => void;
  count?: number;
}

const SimpleItem = memo(function SimpleItem({
  suggestion,
  query,
  isActive,
  index,
  onClick,
  count,
}: SimpleItemProps) {
  return (
    <button
      type="button"
      role="option"
      id={`search-option-${index}`}
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3',
        'px-4 py-2.5',
        'text-left',
        'transition-colors duration-150',
        'focus:outline-none',
        isActive
          ? 'bg-b2b-primary-50'
          : 'hover:bg-b2b-bg-secondary'
      )}
    >
      <ArrowRightIcon className="w-4 h-4 text-b2b-text-muted flex-shrink-0" />

      <span
        className={cn(
          'flex-1',
          'text-b2b-body',
          'text-b2b-text-primary'
        )}
      >
        {highlightText(suggestion.text, query)}
      </span>

      {count !== undefined && (
        <span className="text-b2b-caption text-b2b-text-muted">
          ({count})
        </span>
      )}
    </button>
  );
});

// ============================================================================
// Main Component
// ============================================================================

export function SearchSuggestions({
  query,
  products,
  categories,
  brands,
  activeIndex,
  isLoading = false,
  onSuggestionClick,
}: SearchSuggestionsProps) {
  // Calculate index offsets for each section
  const productIndexOffset = 0;
  const categoryIndexOffset = products.length;
  const brandIndexOffset = products.length + categories.length;

  const hasResults = products.length > 0 || categories.length > 0 || brands.length > 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoaderIcon className="w-6 h-6 text-b2b-primary" />
        <span className="ml-2 text-b2b-body text-b2b-text-muted">
          Recherche en cours...
        </span>
      </div>
    );
  }

  // No results
  if (!hasResults && query.trim().length >= 2) {
    return (
      <div className="py-8 text-center">
        <p className="text-b2b-body text-b2b-text-secondary">
          Aucun resultat pour "{query}"
        </p>
        <p className="mt-1 text-b2b-caption text-b2b-text-muted">
          Essayez avec d'autres termes de recherche
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[400px] overflow-y-auto">
      {/* Products Section */}
      {products.length > 0 && (
        <div>
          <SectionHeader
            title="Produits"
            icon={<PackageIcon className="w-4 h-4" />}
          />
          <div className="divide-y divide-b2b-border-light">
            {products.map((suggestion, index) => (
              <ProductItem
                key={suggestion.id}
                suggestion={suggestion}
                query={query}
                isActive={activeIndex === productIndexOffset + index}
                index={productIndexOffset + index}
                onClick={() => onSuggestionClick(suggestion)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Categories Section */}
      {categories.length > 0 && (
        <div>
          <SectionHeader
            title="Categories"
            icon={<FolderIcon className="w-4 h-4" />}
          />
          <div>
            {categories.map((suggestion, index) => (
              <SimpleItem
                key={suggestion.id}
                suggestion={suggestion}
                query={query}
                isActive={activeIndex === categoryIndexOffset + index}
                index={categoryIndexOffset + index}
                onClick={() => onSuggestionClick(suggestion)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Brands Section */}
      {brands.length > 0 && (
        <div>
          <SectionHeader
            title="Marques"
            icon={<BuildingIcon className="w-4 h-4" />}
          />
          <div>
            {brands.map((suggestion, index) => (
              <SimpleItem
                key={suggestion.id}
                suggestion={suggestion}
                query={query}
                isActive={activeIndex === brandIndexOffset + index}
                index={brandIndexOffset + index}
                onClick={() => onSuggestionClick(suggestion)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchSuggestions;
