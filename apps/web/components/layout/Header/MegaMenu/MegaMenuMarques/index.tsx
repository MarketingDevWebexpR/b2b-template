'use client';

/**
 * MegaMenuMarques Component
 *
 * A world-class "Marques" (Brands) tab for the B2B e-commerce MegaMenu.
 * Displays brand names, logos, and product counts with exceptional UX.
 *
 * Features:
 * - Premium brands grid with visual prominence
 * - Alphabetical brand list with quick navigation
 * - Search functionality with debouncing
 * - Logo display with initials fallback
 * - Lazy loading for performance
 * - Full accessibility support
 * - Responsive layout
 *
 * @example
 * ```tsx
 * <MegaMenuMarques onClose={() => setMenuOpen(false)} />
 * ```
 */

import { memo, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// Sub-components
import { BrandsSearchBar } from './BrandsSearchBar';
import { BrandsPremiumGrid } from './BrandsPremiumGrid';
import { BrandsAlphabeticalList } from './BrandsAlphabeticalList';
import { BrandPromoCard } from './BrandPromoCard';
import { BrandsSkeleton } from './BrandsSkeleton';
import { BrandCard } from './BrandCard';

// Hooks
import { useBrandsData } from './hooks/useBrandsData';

export interface MegaMenuMarquesProps {
  /** Callback when menu should close */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const MegaMenuMarques = memo(function MegaMenuMarques({
  onClose,
  className,
}: MegaMenuMarquesProps) {
  // Fetch and manage brands data
  const {
    premiumBrands,
    brandsByLetter,
    filteredBrands,
    filteredBrandsByLetter,
    searchQuery,
    setSearchQuery,
    isSearching,
    isLoading,
    error,
    totalCount,
  } = useBrandsData({ premiumLimit: 6 });

  // Active letter state for alphabetical navigation
  const [activeLetter, setActiveLetter] = useState<string | undefined>();

  // Handle search input change with debounce
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    // Clear active letter when searching
    if (query) {
      setActiveLetter(undefined);
    }
  }, [setSearchQuery]);

  // Handle letter selection
  const handleLetterSelect = useCallback((letter: string) => {
    setActiveLetter(letter);
  }, []);

  // Determine which brands to show based on search
  const displayBrandsByLetter = isSearching ? filteredBrandsByLetter : brandsByLetter;

  // Loading state
  if (isLoading) {
    return <BrandsSkeleton className={className} />;
  }

  // Error state
  if (error) {
    return (
      <div className={cn('py-12 text-center', className)}>
        <div className="text-danger-500 mb-2">
          Impossible de charger les marques
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-accent hover:underline"
        >
          Reessayer
        </button>
      </div>
    );
  }

  return (
    <nav
      className={cn('space-y-5', className)}
      aria-label="Navigation des marques"
    >
      {/* Header: Search bar and View All link */}
      <div className="flex items-center gap-4">
        <BrandsSearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Rechercher une marque..."
          className="flex-1"
        />

        <Link
          href="/marques"
          onClick={onClose}
          className={cn(
            'hidden sm:flex items-center gap-2',
            'text-sm font-medium',
            'text-accent hover:text-accent/80',
            'whitespace-nowrap',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:underline'
          )}
        >
          <span>Voir toutes les marques</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Search results view */}
      {isSearching ? (
        <div className="space-y-4">
          {/* Search results header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500">
              {filteredBrands.length} resultat{filteredBrands.length !== 1 ? 's' : ''} pour "{searchQuery}"
            </p>
            {filteredBrands.length > 0 && (
              <button
                onClick={() => handleSearchChange('')}
                className="text-xs text-accent hover:underline"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Search results */}
          {filteredBrands.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredBrands.slice(0, 12).map((brand) => (
                <BrandCard
                  key={brand.id}
                  brand={brand}
                  variant="grid"
                  size="sm"
                  onClose={onClose}
                />
              ))}
            </div>
          ) : (
            /* No results */
            <div className="py-12 text-center">
              <Search className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
              <p className="text-neutral-600 font-medium">
                Aucune marque trouvee pour "{searchQuery}"
              </p>
              <p className="text-neutral-400 text-sm mt-1">
                Essayez avec un autre terme de recherche
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Default view: Premium + Alphabetical */
        <div className="grid grid-cols-12 gap-6">
          {/* Left column: Premium brands */}
          <div className="col-span-12 sm:col-span-4">
            <BrandsPremiumGrid
              brands={premiumBrands}
              onClose={onClose}
            />
          </div>

          {/* Middle column: Alphabetical list */}
          <div className="col-span-12 sm:col-span-5">
            <BrandsAlphabeticalList
              brandsByLetter={displayBrandsByLetter}
              activeLetter={activeLetter}
              onLetterSelect={handleLetterSelect}
              onClose={onClose}
            />
          </div>

          {/* Right column: Promo card */}
          <div className="col-span-12 sm:col-span-3">
            <BrandPromoCard
              label="Nouveaute"
              title="Collection Cartier 2024"
              description="Decouvrez la nouvelle collection exclusive de haute joaillerie."
              href="/marques/cartier/collection-2024"
              ctaText="Decouvrir"
              onClose={onClose}
            />
          </div>
        </div>
      )}

      {/* Mobile: View all link */}
      <div className="sm:hidden pt-3 border-t border-neutral-100">
        <Link
          href="/marques"
          onClick={onClose}
          className={cn(
            'flex items-center justify-center gap-2',
            'w-full py-3',
            'text-sm font-medium',
            'text-accent',
            'bg-accent/5 hover:bg-accent/10',
            'rounded-lg',
            'transition-colors duration-150'
          )}
        >
          <span>Voir les {totalCount} marques</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </nav>
  );
});

MegaMenuMarques.displayName = 'MegaMenuMarques';

// Export sub-components for flexibility
export { BrandsSearchBar } from './BrandsSearchBar';
export { BrandsPremiumGrid } from './BrandsPremiumGrid';
export { BrandsAlphabeticalList } from './BrandsAlphabeticalList';
export { BrandCard } from './BrandCard';
export { BrandInitials } from './BrandInitials';
export { BrandLogo } from './BrandLogo';
export { BrandPromoCard } from './BrandPromoCard';
export { BrandsSkeleton } from './BrandsSkeleton';
export { AlphabetNav } from './AlphabetNav';

// Export types
export type { Brand, BrandsData, BrandCardProps } from './types';

// Export utilities
export { getBrandColor, getBrandColorPair, getBrandInitials } from './utils/brandColors';
export { groupBrandsByLetter, filterBrands, ALPHABET } from './utils/groupBrandsByLetter';

// Export hooks
export { useBrandsData } from './hooks/useBrandsData';

export default MegaMenuMarques;
