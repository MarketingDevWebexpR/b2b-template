'use client';

/**
 * B2BHero Component
 *
 * Compact hero section for B2B homepage featuring:
 * - Professional blue gradient background
 * - Prominent search bar for quick product lookup
 * - Company statistics (products count, brands, etc.)
 * - B2B-focused call to action
 *
 * Design: Professional B2B style (not luxury)
 * Colors: b2b-primary (#0059a1), b2b-accent (#f67828)
 */

import { memo, useCallback, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface B2BHeroProps {
  /** Total products count */
  productsCount?: number;
  /** Partner brands count */
  brandsCount?: number;
  /** Active categories count */
  categoriesCount?: number;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Callback when search is submitted */
  onSearch?: (query: string) => void;
  /** Additional CSS classes */
  className?: string;
}

export interface StatItemProps {
  /** Stat value */
  value: string | number;
  /** Stat label */
  label: string;
}

// ============================================================================
// Sub-components
// ============================================================================

const StatItem = memo(function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="text-center">
      <div className="text-2xl lg:text-3xl text-white font-bold">
        {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
      </div>
      <div className="text-xs text-white/80 mt-1">
        {label}
      </div>
    </div>
  );
});

StatItem.displayName = 'StatItem';

// ============================================================================
// Main Component
// ============================================================================

export const B2BHero = memo(function B2BHero({
  productsCount = 15000,
  brandsCount = 120,
  categoriesCount = 45,
  searchPlaceholder = 'Rechercher par nom, reference, SKU ou EAN...',
  onSearch,
  className,
}: B2BHeroProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery) {
        onSearch?.(trimmedQuery);
        router.push(`/recherche?q=${encodeURIComponent(trimmedQuery)}`);
      }
    },
    [searchQuery, onSearch, router]
  );

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        'bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-900',
        'py-12 lg:py-16',
        className
      )}
      aria-label="Recherche et statistiques"
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      <div className="relative container mx-auto px-4 lg:px-6">
        {/* Title section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl lg:text-4xl text-white font-bold">
            Votre partenaire bijoux B2B
          </h1>
          <p className="mt-2 text-sm lg:text-base text-white/90 max-w-2xl mx-auto">
            Acces professionnel a notre catalogue complet. Commandez rapidement,
            gerez vos devis et beneficiez de tarifs preferentiels.
          </p>
        </div>

        {/* Search bar */}
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto mb-10"
          role="search"
          aria-label="Rechercher des produits"
        >
          <div
            className={cn(
              'relative flex items-center',
              'bg-white rounded-xl',
              'shadow-lg',
              'transition-all duration-200',
              isFocused && 'ring-4 ring-orange-300/50'
            )}
          >
            {/* Search icon */}
            <div className="pl-4 pr-2">
              <svg
                className="w-5 h-5 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Input field */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={searchPlaceholder}
              className={cn(
                'flex-1 py-4 px-2',
                'text-sm text-neutral-900',
                'placeholder:text-neutral-400',
                'bg-transparent',
                'border-none outline-none',
                'focus:ring-0'
              )}
              aria-label="Rechercher des produits"
            />

            {/* Clear button */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={cn(
                  'p-2 mr-1',
                  'text-neutral-400 hover:text-neutral-600',
                  'transition-colors duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded'
                )}
                aria-label="Effacer la recherche"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className={cn(
                'flex items-center gap-2',
                'px-6 py-3 mr-1.5',
                'bg-accent hover:bg-orange-600',
                'text-white font-medium text-sm',
                'rounded-lg',
                'transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2'
              )}
            >
              <span className="hidden sm:inline">Rechercher</span>
              <svg
                className="w-4 h-4 sm:hidden"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>

          {/* Quick search hints */}
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            <span className="text-xs text-white/70">Recherches populaires:</span>
            {['Bagues or', 'Colliers argent', 'Bracelets', 'Nouveautes'].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setSearchQuery(term);
                  router.push(`/recherche?q=${encodeURIComponent(term)}`);
                }}
                className={cn(
                  'px-3 py-1',
                  'text-xs text-white/90',
                  'bg-white/10 hover:bg-white/20',
                  'rounded-full',
                  'transition-colors duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
                )}
              >
                {term}
              </button>
            ))}
          </div>
        </form>

        {/* Statistics */}
        <div
          className={cn(
            'flex flex-wrap items-center justify-center gap-8 lg:gap-16',
            'pt-8 border-t border-white/20'
          )}
          role="group"
          aria-label="Statistiques du catalogue"
        >
          <StatItem value={productsCount} label="Produits disponibles" />
          <StatItem value={brandsCount} label="Marques partenaires" />
          <StatItem value={categoriesCount} label="Categories" />
          <StatItem value="24h" label="Livraison express" />
        </div>
      </div>
    </section>
  );
});

B2BHero.displayName = 'B2BHero';

export default B2BHero;
