'use client';

/**
 * BrandFilter Component
 *
 * Filter controls for brands listing page:
 * - Alphabetical letter filter (A-Z)
 * - Search input
 * - Premium filter toggle
 * - Country filter (optional)
 *
 * @packageDocumentation
 */

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Award, Filter, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// ============================================================================
// Types
// ============================================================================

export interface BrandFilterProps {
  /** Available letters that have brands */
  availableLetters: string[];
  /** Currently selected letter */
  selectedLetter: string | null;
  /** Callback when letter is selected */
  onLetterChange: (letter: string | null) => void;
  /** Current search query */
  searchQuery: string;
  /** Callback when search changes */
  onSearchChange: (query: string) => void;
  /** Premium filter active */
  premiumOnly: boolean;
  /** Callback for premium filter toggle */
  onPremiumChange: (value: boolean) => void;
  /** Available countries */
  countries?: string[];
  /** Selected country */
  selectedCountry?: string | null;
  /** Callback for country change */
  onCountryChange?: (country: string | null) => void;
  /** Total brand count */
  totalBrands: number;
  /** Filtered brand count */
  filteredCount: number;
  /** Sticky positioning */
  sticky?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// ============================================================================
// Sub-Components
// ============================================================================

interface LetterButtonProps {
  letter: string;
  isAvailable: boolean;
  isSelected: boolean;
  onClick: () => void;
}

const LetterButton = memo(function LetterButton({
  letter,
  isAvailable,
  isSelected,
  onClick,
}: LetterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isAvailable}
      className={cn(
        'w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium',
        'transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
        isSelected
          ? 'bg-accent text-white shadow-sm'
          : isAvailable
            ? 'bg-white text-neutral-700 hover:bg-neutral-100 hover:text-accent'
            : 'bg-neutral-50 text-neutral-300 cursor-not-allowed'
      )}
      aria-label={`Filtrer par la lettre ${letter}`}
      aria-pressed={isSelected}
    >
      {letter}
    </button>
  );
});

LetterButton.displayName = 'LetterButton';

// ============================================================================
// Main Component
// ============================================================================

/**
 * BrandFilter - Filter controls for brands listing
 *
 * @example
 * ```tsx
 * <BrandFilter
 *   availableLetters={['A', 'B', 'C']}
 *   selectedLetter={selectedLetter}
 *   onLetterChange={setSelectedLetter}
 *   searchQuery={query}
 *   onSearchChange={setQuery}
 *   premiumOnly={false}
 *   onPremiumChange={setPremiumOnly}
 *   totalBrands={120}
 *   filteredCount={15}
 *   sticky
 * />
 * ```
 */
export const BrandFilter = memo(function BrandFilter({
  availableLetters,
  selectedLetter,
  onLetterChange,
  searchQuery,
  onSearchChange,
  premiumOnly,
  onPremiumChange,
  countries = [],
  selectedCountry,
  onCountryChange,
  totalBrands,
  filteredCount,
  sticky = true,
  className,
}: BrandFilterProps) {
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCountryDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const handleClearSearch = useCallback(() => {
    onSearchChange('');
    searchInputRef.current?.focus();
  }, [onSearchChange]);

  const handleClearFilters = useCallback(() => {
    onLetterChange(null);
    onSearchChange('');
    onPremiumChange(false);
    onCountryChange?.(null);
  }, [onLetterChange, onSearchChange, onPremiumChange, onCountryChange]);

  const hasActiveFilters =
    selectedLetter || searchQuery || premiumOnly || selectedCountry;

  const availableLettersSet = new Set(availableLetters);

  return (
    <div
      className={cn(
        'bg-white border-b border-neutral-200',
        sticky && 'sticky top-0 z-40',
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Top Row: Search and Quick Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="Rechercher une marque..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10"
              aria-label="Rechercher une marque"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-neutral-100 transition-colors"
                aria-label="Effacer la recherche"
              >
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            )}
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Premium Filter */}
            <Button
              variant={premiumOnly ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => onPremiumChange(!premiumOnly)}
              className="gap-1.5"
            >
              <Award className="w-4 h-4" />
              Premium
            </Button>

            {/* Country Dropdown */}
            {countries.length > 0 && onCountryChange && (
              <div className="relative" ref={countryDropdownRef}>
                <Button
                  variant={selectedCountry ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                  className="gap-1.5"
                >
                  <Filter className="w-4 h-4" />
                  {selectedCountry || 'Pays'}
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform',
                      isCountryDropdownOpen && 'rotate-180'
                    )}
                  />
                </Button>

                <AnimatePresence>
                  {isCountryDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-1 right-0 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onCountryChange(null);
                          setIsCountryDropdownOpen(false);
                        }}
                        className={cn(
                          'w-full px-4 py-2 text-left text-sm',
                          'hover:bg-neutral-50 transition-colors',
                          !selectedCountry && 'text-accent font-medium'
                        )}
                      >
                        Tous les pays
                      </button>
                      {countries.map((country) => (
                        <button
                          key={country}
                          type="button"
                          onClick={() => {
                            onCountryChange(country);
                            setIsCountryDropdownOpen(false);
                          }}
                          className={cn(
                            'w-full px-4 py-2 text-left text-sm',
                            'hover:bg-neutral-50 transition-colors',
                            selectedCountry === country && 'text-accent font-medium'
                          )}
                        >
                          {country}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Clear All Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <X className="w-4 h-4 mr-1" />
                Effacer
              </Button>
            )}
          </div>
        </div>

        {/* Alphabetical Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider hidden sm:block">
            A-Z
          </span>
          <div className="flex flex-wrap gap-1" role="group" aria-label="Filtrer par lettre">
            {/* All button */}
            <button
              type="button"
              onClick={() => onLetterChange(null)}
              className={cn(
                'px-3 h-8 flex items-center justify-center rounded-md text-sm font-medium',
                'transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                !selectedLetter
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              )}
              aria-label="Afficher toutes les marques"
              aria-pressed={!selectedLetter}
            >
              Toutes
            </button>

            {/* Letter buttons */}
            {ALPHABET.map((letter) => (
              <LetterButton
                key={letter}
                letter={letter}
                isAvailable={availableLettersSet.has(letter)}
                isSelected={selectedLetter === letter}
                onClick={() =>
                  onLetterChange(selectedLetter === letter ? null : letter)
                }
              />
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-600">
            {hasActiveFilters ? (
              <>
                <span className="font-medium">{filteredCount}</span> marque
                {filteredCount !== 1 ? 's' : ''} trouvee
                {filteredCount !== 1 ? 's' : ''} sur {totalBrands}
              </>
            ) : (
              <>
                <span className="font-medium">{totalBrands}</span> marque
                {totalBrands !== 1 ? 's' : ''} partenaires
              </>
            )}
          </p>

          {/* Active Filters Tags */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              {selectedLetter && (
                <button
                  type="button"
                  onClick={() => onLetterChange(null)}
                  className="focus:outline-none"
                >
                  <Badge
                    variant="light"
                    size="sm"
                    className="gap-1 cursor-pointer hover:bg-neutral-200"
                  >
                    Lettre: {selectedLetter}
                    <X className="w-3 h-3" />
                  </Badge>
                </button>
              )}
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="focus:outline-none"
                >
                  <Badge
                    variant="light"
                    size="sm"
                    className="gap-1 cursor-pointer hover:bg-neutral-200"
                  >
                    "{searchQuery}"
                    <X className="w-3 h-3" />
                  </Badge>
                </button>
              )}
              {premiumOnly && (
                <button
                  type="button"
                  onClick={() => onPremiumChange(false)}
                  className="focus:outline-none"
                >
                  <Badge
                    variant="primary"
                    size="sm"
                    className="gap-1 cursor-pointer"
                  >
                    Premium
                    <X className="w-3 h-3" />
                  </Badge>
                </button>
              )}
              {selectedCountry && (
                <button
                  type="button"
                  onClick={() => onCountryChange?.(null)}
                  className="focus:outline-none"
                >
                  <Badge
                    variant="light"
                    size="sm"
                    className="gap-1 cursor-pointer hover:bg-neutral-200"
                  >
                    {selectedCountry}
                    <X className="w-3 h-3" />
                  </Badge>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

BrandFilter.displayName = 'BrandFilter';

export default BrandFilter;
