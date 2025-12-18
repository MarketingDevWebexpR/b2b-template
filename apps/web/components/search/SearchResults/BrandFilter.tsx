'use client';

/**
 * BrandFilter Component
 *
 * A standalone brand filter component for search results pages.
 * Features:
 * - Brand logo display (when available)
 * - Country of origin badge
 * - Product count per brand
 * - Multiple brand selection via checkboxes
 * - Searchable brand list
 * - Show more/less functionality
 *
 * @packageDocumentation
 */

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useSearchFilters } from '@/contexts/SearchContext';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Search, Globe } from 'lucide-react';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate initials from brand name (max 2 characters)
 * Examples:
 * - "Cartier" -> "CA"
 * - "Van Cleef & Arpels" -> "VA"
 * - "LVMH" -> "LV"
 * - "Dior" -> "DI"
 */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    // Take first letter of first two words
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  // Take first two letters of single word
  return name.substring(0, 2).toUpperCase();
}

// ============================================================================
// Types
// ============================================================================

export interface BrandFilterItem {
  /** Brand identifier */
  id: string;
  /** Brand display name */
  name: string;
  /** URL-friendly slug */
  slug: string;
  /** Brand logo URL */
  logo_url?: string | null;
  /** Country of origin */
  country?: string | null;
  /** Number of products for this brand */
  product_count: number;
  /** Whether this brand is currently selected */
  selected?: boolean;
}

export interface BrandFilterProps {
  /** List of available brands */
  brands: BrandFilterItem[];
  /** Currently selected brand IDs */
  selectedBrands?: string[];
  /** Callback when brand selection changes */
  onBrandToggle?: (brandId: string) => void;
  /** Maximum number of brands to show initially */
  maxVisible?: number;
  /** Enable search functionality */
  searchable?: boolean;
  /** Show brand logos */
  showLogos?: boolean;
  /** Show country badges */
  showCountry?: boolean;
  /** Custom class name */
  className?: string;
  /** Title for the filter section */
  title?: string;
}

// ============================================================================
// Component
// ============================================================================

export function BrandFilter({
  brands,
  selectedBrands: externalSelectedBrands,
  onBrandToggle: externalOnBrandToggle,
  maxVisible = 6,
  searchable = true,
  showLogos = true,
  showCountry = true,
  className,
  title = 'Marques',
}: BrandFilterProps) {
  // Use context if no external handlers provided
  const { filters, toggleBrandFilter } = useSearchFilters();
  const selectedBrands = externalSelectedBrands ?? filters.brands;
  const onBrandToggle = externalOnBrandToggle ?? toggleBrandFilter;

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Filter brands by search query
  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return brands;
    const query = searchQuery.toLowerCase();
    return brands.filter(
      (brand) =>
        brand.name.toLowerCase().includes(query) ||
        brand.country?.toLowerCase().includes(query)
    );
  }, [brands, searchQuery]);

  // Determine visible brands
  const visibleBrands = useMemo(() => {
    return showAll ? filteredBrands : filteredBrands.slice(0, maxVisible);
  }, [filteredBrands, showAll, maxVisible]);

  const hasMore = filteredBrands.length > maxVisible;
  const hiddenCount = filteredBrands.length - maxVisible;

  // Handle search input
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowAll(false); // Reset to collapsed when searching
  }, []);

  // Check if a brand is selected
  const isBrandSelected = useCallback(
    (brandId: string) => selectedBrands.includes(brandId),
    [selectedBrands]
  );

  // Render brand item
  const renderBrandItem = (brand: BrandFilterItem) => {
    const isSelected = isBrandSelected(brand.id);

    return (
      <div
        key={brand.id}
        className={cn(
          'flex items-center gap-3',
          'py-2 px-1',
          'rounded-lg',
          'transition-colors duration-150',
          isSelected && 'bg-blue-50'
        )}
      >
        {/* Brand Logo or Initials */}
        {showLogos && (
          <div
            className={cn(
              'flex-shrink-0',
              'w-8 h-8',
              'rounded-md',
              'overflow-hidden',
              'flex items-center justify-center',
              'border',
              brand.logo_url
                ? 'bg-white'
                : 'bg-gradient-to-br from-blue-100 to-indigo-100',
              isSelected ? 'border-blue-300' : 'border-blue-200'
            )}
          >
            {brand.logo_url ? (
              <Image
                src={brand.logo_url}
                alt={`Logo ${brand.name}`}
                width={32}
                height={32}
                className="object-contain"
              />
            ) : (
              <span
                className={cn(
                  'text-xs font-bold',
                  'text-blue-700',
                  'select-none'
                )}
              >
                {getInitials(brand.name)}
              </span>
            )}
          </div>
        )}

        {/* Checkbox + Label */}
        <Checkbox
          size="sm"
          checked={isSelected}
          onChange={() => onBrandToggle(brand.id)}
          label={
            <span className="flex items-center gap-2 flex-1 min-w-0">
              {/* Brand Name */}
              <span
                className={cn(
                  'text-sm truncate',
                  isSelected ? 'font-medium text-neutral-900' : 'text-neutral-700'
                )}
              >
                {brand.name}
              </span>

              {/* Country Badge */}
              {showCountry && brand.country && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5',
                    'px-1.5 py-0.5',
                    'text-[10px]',
                    'rounded',
                    'flex-shrink-0',
                    isSelected
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-neutral-100 text-neutral-500'
                  )}
                >
                  <Globe className="w-2.5 h-2.5" />
                  {brand.country}
                </span>
              )}

              {/* Product Count */}
              <span
                className={cn(
                  'text-xs ml-auto flex-shrink-0',
                  isSelected ? 'text-blue-600' : 'text-neutral-500'
                )}
              >
                ({brand.product_count.toLocaleString('fr-FR')})
              </span>
            </span>
          }
        />
      </div>
    );
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Title */}
      {title && (
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-900">
          {title}
        </h3>
      )}

      {/* Search Input */}
      {searchable && brands.length > 5 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            type="text"
            placeholder="Rechercher une marque..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9 py-1.5 text-sm"
            aria-label="Rechercher une marque"
          />
        </div>
      )}

      {/* Brand List */}
      <div className="space-y-1">
        {visibleBrands.map(renderBrandItem)}
      </div>

      {/* Show More/Less Button */}
      {hasMore && !searchQuery && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className={cn(
            'w-full py-2',
            'text-sm font-medium',
            'text-accent hover:text-orange-600',
            'transition-colors duration-200',
            'focus:outline-none focus-visible:underline'
          )}
        >
          {showAll
            ? 'Voir moins'
            : `Voir ${hiddenCount} autres marques`}
        </button>
      )}

      {/* No Results Message */}
      {searchQuery && filteredBrands.length === 0 && (
        <p className="text-sm text-neutral-500 italic py-2">
          Aucune marque trouvee pour "{searchQuery}"
        </p>
      )}

      {/* Empty State */}
      {!searchQuery && brands.length === 0 && (
        <p className="text-sm text-neutral-500 italic py-2">
          Aucune marque disponible
        </p>
      )}
    </div>
  );
}

export default BrandFilter;
