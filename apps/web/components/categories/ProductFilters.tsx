'use client';

/**
 * ProductFilters - Product filtering component for category pages
 *
 * Features:
 * - Brand filter (from API facets)
 * - Price range filter
 * - In-stock filter
 * - URL-based state management via searchParams
 * - Responsive: collapsible on mobile, sidebar on desktop
 *
 * @packageDocumentation
 */

import { useState, useCallback, useTransition, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  X,
  SlidersHorizontal,
  Check,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';

// ============================================================================
// Types
// ============================================================================

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface ProductFiltersProps {
  /** Brand facets from API */
  brands?: FacetOption[];
  /** Price range facets from API */
  priceRanges?: FacetOption[];
  /** Total product count (before filters) */
  totalCount?: number;
  /** Additional CSS classes */
  className?: string;
  /** Layout variant */
  variant?: 'sidebar' | 'horizontal';
}

// ============================================================================
// Constants
// ============================================================================

const PRICE_RANGES: FacetOption[] = [
  { value: '0-5000', label: 'Moins de 50 EUR', count: 0 },
  { value: '5000-10000', label: '50 - 100 EUR', count: 0 },
  { value: '10000-25000', label: '100 - 250 EUR', count: 0 },
  { value: '25000-50000', label: '250 - 500 EUR', count: 0 },
  { value: '50000-100000', label: '500 - 1000 EUR', count: 0 },
  { value: '100000-', label: 'Plus de 1000 EUR', count: 0 },
];

// ============================================================================
// Utility Functions
// ============================================================================

function parsePriceRange(range: string): { min?: number; max?: number } {
  const [minStr, maxStr] = range.split('-');
  return {
    min: minStr ? parseInt(minStr, 10) : undefined,
    max: maxStr ? parseInt(maxStr, 10) : undefined,
  };
}

// ============================================================================
// Sub-Components
// ============================================================================

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  badge?: number;
}

function FilterSection({
  title,
  children,
  defaultExpanded = true,
  badge,
}: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-neutral-200 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full py-4 text-left"
        aria-expanded={isExpanded}
      >
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">
            {title}
          </span>
          {badge !== undefined && badge > 0 && (
            <Badge variant="primary" size="sm">
              {badge}
            </Badge>
          )}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-neutral-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-neutral-500" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FilterCheckboxProps {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}

function FilterCheckbox({ label, count, checked, onChange }: FilterCheckboxProps) {
  return (
    <label className="flex items-center gap-3 py-1.5 cursor-pointer group">
      <div
        className={cn(
          'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
          checked
            ? 'bg-accent border-accent'
            : 'border-neutral-300 group-hover:border-accent/50'
        )}
      >
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={cn(
          'text-sm flex-1 transition-colors',
          checked ? 'text-neutral-900 font-medium' : 'text-neutral-700 group-hover:text-neutral-900'
        )}
      >
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-neutral-400">({count})</span>
      )}
    </label>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ProductFilters({
  brands = [],
  priceRanges = PRICE_RANGES,
  totalCount,
  className,
  variant = 'sidebar',
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Parse current filter values from URL
  const currentBrands = useMemo(() => {
    return searchParams.get('brand')?.split(',').filter(Boolean) || [];
  }, [searchParams]);

  const currentPriceRange = searchParams.get('priceRange') || '';
  const inStockOnly = searchParams.get('inStock') === 'true';

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (currentBrands.length > 0) count += currentBrands.length;
    if (currentPriceRange) count += 1;
    if (inStockOnly) count += 1;
    return count;
  }, [currentBrands, currentPriceRange, inStockOnly]);

  // Update URL with new params
  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Reset page when filters change
      params.delete('page');

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  // Handle brand toggle
  const toggleBrand = useCallback(
    (brandValue: string) => {
      const newBrands = currentBrands.includes(brandValue)
        ? currentBrands.filter((b) => b !== brandValue)
        : [...currentBrands, brandValue];

      updateFilters({
        brand: newBrands.length > 0 ? newBrands.join(',') : null,
      });
    },
    [currentBrands, updateFilters]
  );

  // Handle price range selection
  const handlePriceRangeChange = useCallback(
    (range: string) => {
      const isCurrentlySelected = currentPriceRange === range;

      if (isCurrentlySelected) {
        updateFilters({
          priceRange: null,
          minPrice: null,
          maxPrice: null,
        });
      } else {
        const { min, max } = parsePriceRange(range);
        updateFilters({
          priceRange: range,
          minPrice: min ? String(min) : null,
          maxPrice: max ? String(max) : null,
        });
      }
    },
    [currentPriceRange, updateFilters]
  );

  // Handle in-stock toggle
  const handleInStockToggle = useCallback(() => {
    updateFilters({
      inStock: inStockOnly ? null : 'true',
    });
  }, [inStockOnly, updateFilters]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    startTransition(() => {
      // Keep sort param if it exists
      const sortParam = searchParams.get('sort');
      const newParams = new URLSearchParams();
      if (sortParam) {
        newParams.set('sort', sortParam);
      }
      router.push(`${pathname}${newParams.toString() ? `?${newParams.toString()}` : ''}`, {
        scroll: false,
      });
    });
    setIsMobileOpen(false);
  }, [pathname, router, searchParams]);

  // Filter content JSX
  const filterContent = (
    <div className="space-y-0">
      {/* In Stock Filter */}
      <FilterSection title="Disponibilite" defaultExpanded>
        <FilterCheckbox
          label="En stock uniquement"
          checked={inStockOnly}
          onChange={handleInStockToggle}
        />
      </FilterSection>

      {/* Brand Filter */}
      {brands.length > 0 && (
        <FilterSection
          title="Marques"
          badge={currentBrands.length > 0 ? currentBrands.length : undefined}
          defaultExpanded
        >
          <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
            {brands.map((brand) => (
              <FilterCheckbox
                key={brand.value}
                label={brand.label}
                count={brand.count}
                checked={currentBrands.includes(brand.value)}
                onChange={() => toggleBrand(brand.value)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Range Filter */}
      <FilterSection
        title="Prix"
        badge={currentPriceRange ? 1 : undefined}
        defaultExpanded
      >
        <div className="space-y-1">
          {priceRanges.map((range) => (
            <FilterCheckbox
              key={range.value}
              label={range.label}
              count={range.count > 0 ? range.count : undefined}
              checked={currentPriceRange === range.value}
              onChange={() => handlePriceRangeChange(range.value)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Reset Button */}
      {activeFilterCount > 0 && (
        <div className="pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Effacer les filtres ({activeFilterCount})
          </Button>
        </div>
      )}

      {/* Loading overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );

  // Horizontal variant (compact bar)
  if (variant === 'horizontal') {
    return (
      <div className={cn('flex items-center gap-4 flex-wrap', className)}>
        {/* In Stock Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={inStockOnly}
            onChange={handleInStockToggle}
            size="sm"
          />
          <span className="text-sm text-neutral-700">En stock</span>
        </label>

        {/* Brand Dropdown - simplified for horizontal */}
        {brands.length > 0 && currentBrands.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">Marques:</span>
            {currentBrands.slice(0, 2).map((brand) => (
              <Badge
                key={brand}
                variant="light"
                size="sm"
                className="cursor-pointer"
              >
                <button
                  type="button"
                  onClick={() => toggleBrand(brand)}
                  className="flex items-center"
                >
                  {brand}
                  <X className="w-3 h-3 ml-1" />
                </button>
              </Badge>
            ))}
            {currentBrands.length > 2 && (
              <Badge variant="light" size="sm">
                +{currentBrands.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Active filter count */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-neutral-500 hover:text-neutral-700"
          >
            Effacer ({activeFilterCount})
          </Button>
        )}
      </div>
    );
  }

  // Sidebar variant (default)
  return (
    <>
      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsMobileOpen(true)}
          className="w-full justify-center"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filtres
          {activeFilterCount > 0 && (
            <Badge variant="primary" size="sm" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden overflow-y-auto shadow-xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="sticky top-0 bg-white border-b border-neutral-200 px-4 py-4 flex items-center justify-between z-10">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Filtres
                </h2>
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-neutral-700 transition-colors"
                  aria-label="Fermer les filtres"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 relative">{filterContent}</div>

              {/* Apply button for mobile */}
              <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-4">
                <Button
                  variant="primary"
                  onClick={() => setIsMobileOpen(false)}
                  className="w-full"
                >
                  Voir les resultats
                  {totalCount !== undefined && ` (${totalCount})`}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:block relative',
          className
        )}
      >
        <div className="sticky top-24">
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-4">
              Filtrer par
            </h2>
            {filterContent}
          </div>
        </div>
      </aside>
    </>
  );
}

export default ProductFilters;
