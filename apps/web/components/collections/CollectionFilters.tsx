'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  ChevronDown,
  X,
  SlidersHorizontal,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface PriceRange {
  min: number;
  max: number;
  label: string;
}

interface CollectionFiltersProps {
  /** Available material options */
  materials?: FilterOption[];
  /** Price range options */
  priceRanges?: PriceRange[];
  /** Additional CSS classes */
  className?: string;
  /** Callback when filters change */
  onFiltersChange?: (filters: ActiveFilters) => void;
}

interface ActiveFilters {
  materials: string[];
  priceRange: string | null;
  sortBy: string;
}

// ============================================
// Constants
// ============================================

const DEFAULT_MATERIALS: FilterOption[] = [
  { value: 'or-jaune', label: 'Or jaune' },
  { value: 'or-blanc', label: 'Or blanc' },
  { value: 'or-rose', label: 'Or rose' },
  { value: 'argent', label: 'Argent' },
  { value: 'platine', label: 'Platine' },
  { value: 'vermeil', label: 'Vermeil' },
];

const DEFAULT_PRICE_RANGES: PriceRange[] = [
  { min: 0, max: 500, label: 'Moins de 500 EUR' },
  { min: 500, max: 1000, label: '500 - 1 000 EUR' },
  { min: 1000, max: 2500, label: '1 000 - 2 500 EUR' },
  { min: 2500, max: 5000, label: '2 500 - 5 000 EUR' },
  { min: 5000, max: Infinity, label: 'Plus de 5 000 EUR' },
];

const SORT_OPTIONS: FilterOption[] = [
  { value: 'newest', label: 'Nouveautes' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix decroissant' },
  { value: 'name', label: 'Nom A-Z' },
];

// ============================================
// Animation Variants
// ============================================

const accordionVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
      opacity: { duration: 0.2 },
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
      opacity: { duration: 0.2, delay: 0.1 },
    },
  },
};

const mobileDrawerVariants = {
  closed: {
    x: '-100%',
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  open: {
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const overlayVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
};

// ============================================
// Subcomponents
// ============================================

interface FilterSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({ title, isOpen, onToggle, children }: FilterSectionProps) {
  return (
    <div className="border-b border-border-light py-4">
      <button
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between',
          'font-sans text-sm font-medium uppercase tracking-elegant text-text-primary',
          'transition-colors duration-300',
          'hover:text-hermes-500',
          'focus:outline-none focus-visible:text-hermes-500'
        )}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
          strokeWidth={1.5}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            variants={accordionVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FilterCheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  count?: number;
}

function FilterCheckbox({ label, checked, onChange, count }: FilterCheckboxProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3 py-2',
        'transition-colors duration-200',
        'hover:text-hermes-500'
      )}
    >
      <span
        className={cn(
          'flex h-5 w-5 items-center justify-center',
          'border transition-all duration-200',
          checked
            ? 'border-hermes-500 bg-hermes-500'
            : 'border-border-medium bg-white'
        )}
      >
        {checked && (
          <Check className="h-3 w-3 text-white" strokeWidth={2} />
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span className="flex-1 font-sans text-sm text-text-secondary">
        {label}
      </span>
      {count !== undefined && (
        <span className="font-sans text-xs text-text-light">({count})</span>
      )}
    </label>
  );
}

interface FilterRadioProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

function FilterRadio({ label, checked, onChange }: FilterRadioProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3 py-2',
        'transition-colors duration-200',
        'hover:text-hermes-500'
      )}
    >
      <span
        className={cn(
          'flex h-5 w-5 items-center justify-center',
          'rounded-full border transition-all duration-200',
          checked
            ? 'border-hermes-500'
            : 'border-border-medium'
        )}
      >
        {checked && (
          <span className="h-2.5 w-2.5 rounded-full bg-hermes-500" />
        )}
      </span>
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span className="font-sans text-sm text-text-secondary">{label}</span>
    </label>
  );
}

// ============================================
// Main Component
// ============================================

/**
 * CollectionFilters - Sidebar filters for collection pages
 *
 * Features:
 * - Filter by price range (radio buttons)
 * - Filter by material (checkboxes)
 * - Sort options (radio buttons)
 * - Accordion/collapsible sections for mobile
 * - URL search params persistence
 * - Smooth open/close animations
 * - Mobile drawer mode
 * - Accessible with proper ARIA attributes
 */
export function CollectionFilters({
  materials = DEFAULT_MATERIALS,
  priceRanges = DEFAULT_PRICE_RANGES,
  className,
  onFiltersChange,
}: CollectionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Accordion states
  const [openSections, setOpenSections] = useState({
    price: true,
    materials: true,
    sort: true,
  });

  // Initialize filters from URL params
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(() => ({
    materials: searchParams.get('materials')?.split(',').filter(Boolean) ?? [],
    priceRange: searchParams.get('price') ?? null,
    sortBy: searchParams.get('sort') ?? 'newest',
  }));

  // Sync URL params when filters change
  const updateURLParams = useCallback(
    (filters: ActiveFilters) => {
      const params = new URLSearchParams(searchParams.toString());

      // Materials
      if (filters.materials.length > 0) {
        params.set('materials', filters.materials.join(','));
      } else {
        params.delete('materials');
      }

      // Price range
      if (filters.priceRange) {
        params.set('price', filters.priceRange);
      } else {
        params.delete('price');
      }

      // Sort
      if (filters.sortBy && filters.sortBy !== 'newest') {
        params.set('sort', filters.sortBy);
      } else {
        params.delete('sort');
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      router.push(newUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Handle filter changes
  const handleMaterialToggle = useCallback(
    (material: string) => {
      setActiveFilters((prev) => {
        const newMaterials = prev.materials.includes(material)
          ? prev.materials.filter((m) => m !== material)
          : [...prev.materials, material];

        const newFilters = { ...prev, materials: newMaterials };
        updateURLParams(newFilters);
        onFiltersChange?.(newFilters);
        return newFilters;
      });
    },
    [updateURLParams, onFiltersChange]
  );

  const handlePriceRangeChange = useCallback(
    (range: string) => {
      setActiveFilters((prev) => {
        const newPriceRange = prev.priceRange === range ? null : range;
        const newFilters = { ...prev, priceRange: newPriceRange };
        updateURLParams(newFilters);
        onFiltersChange?.(newFilters);
        return newFilters;
      });
    },
    [updateURLParams, onFiltersChange]
  );

  const handleSortChange = useCallback(
    (sortBy: string) => {
      setActiveFilters((prev) => {
        const newFilters = { ...prev, sortBy };
        updateURLParams(newFilters);
        onFiltersChange?.(newFilters);
        return newFilters;
      });
    },
    [updateURLParams, onFiltersChange]
  );

  const handleClearAll = useCallback(() => {
    const clearedFilters: ActiveFilters = {
      materials: [],
      priceRange: null,
      sortBy: 'newest',
    };
    setActiveFilters(clearedFilters);
    updateURLParams(clearedFilters);
    onFiltersChange?.(clearedFilters);
  }, [updateURLParams, onFiltersChange]);

  const toggleSection = useCallback((section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  // Count active filters
  const activeFilterCount =
    activeFilters.materials.length +
    (activeFilters.priceRange ? 1 : 0) +
    (activeFilters.sortBy !== 'newest' ? 1 : 0);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  // Filter content (shared between desktop and mobile)
  const filterContent = (
    <>
      {/* Sort Section */}
      <FilterSection
        title="Trier par"
        isOpen={openSections.sort}
        onToggle={() => toggleSection('sort')}
      >
        <div className="space-y-1">
          {SORT_OPTIONS.map((option) => (
            <FilterRadio
              key={option.value}
              label={option.label}
              checked={activeFilters.sortBy === option.value}
              onChange={() => handleSortChange(option.value)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Price Range Section */}
      <FilterSection
        title="Prix"
        isOpen={openSections.price}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-1">
          {priceRanges.map((range) => {
            const rangeKey = `${range.min}-${range.max}`;
            return (
              <FilterRadio
                key={rangeKey}
                label={range.label}
                checked={activeFilters.priceRange === rangeKey}
                onChange={() => handlePriceRangeChange(rangeKey)}
              />
            );
          })}
        </div>
      </FilterSection>

      {/* Materials Section */}
      <FilterSection
        title="Materiau"
        isOpen={openSections.materials}
        onToggle={() => toggleSection('materials')}
      >
        <div className="space-y-1">
          {materials.map((material) => (
            <FilterCheckbox
              key={material.value}
              label={material.label}
              checked={activeFilters.materials.includes(material.value)}
              onChange={() => handleMaterialToggle(material.value)}
              count={material.count}
            />
          ))}
        </div>
      </FilterSection>
    </>
  );

  return (
    <>
      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsMobileOpen(true)}
          className={cn(
            'inline-flex items-center gap-2',
            'border border-border-medium bg-white px-4 py-2.5',
            'font-sans text-xs uppercase tracking-luxe text-text-primary',
            'transition-all duration-300',
            'hover:border-hermes-500 hover:text-hermes-500',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500'
          )}
          aria-label="Ouvrir les filtres"
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
          <span>Filtres</span>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-hermes-500 font-sans text-[10px] font-medium text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-50 bg-luxe-charcoal/50 lg:hidden"
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              className={cn(
                'fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw]',
                'bg-background-cream shadow-elegant-lg',
                'flex flex-col lg:hidden'
              )}
              variants={mobileDrawerVariants}
              initial="closed"
              animate="open"
              exit="closed"
              role="dialog"
              aria-modal="true"
              aria-label="Filtres de produits"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-text-muted" strokeWidth={1.5} />
                  <span className="font-sans text-sm font-medium uppercase tracking-luxe text-text-primary">
                    Filtres
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center',
                    'rounded-full transition-colors duration-200',
                    'hover:bg-background-warm',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500'
                  )}
                  aria-label="Fermer les filtres"
                >
                  <X className="h-5 w-5 text-text-muted" strokeWidth={1.5} />
                </button>
              </div>

              {/* Filter Content */}
              <div className="flex-1 overflow-y-auto px-6">
                {filterContent}
              </div>

              {/* Footer */}
              <div className="border-t border-border-light p-6 space-y-3">
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleClearAll}
                    className={cn(
                      'w-full py-3',
                      'font-sans text-xs uppercase tracking-luxe text-text-muted',
                      'transition-colors duration-200',
                      'hover:text-hermes-500'
                    )}
                  >
                    Effacer tout ({activeFilterCount})
                  </button>
                )}
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'w-full py-3',
                    'bg-hermes-500 text-white',
                    'font-sans text-xs uppercase tracking-luxe',
                    'transition-colors duration-300',
                    'hover:bg-hermes-600',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2'
                  )}
                >
                  Voir les resultats
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:block',
          'w-64 shrink-0',
          className
        )}
        aria-label="Filtres de produits"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-light pb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-text-muted" strokeWidth={1.5} />
            <span className="font-sans text-sm font-medium uppercase tracking-luxe text-text-primary">
              Filtres
            </span>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAll}
              className={cn(
                'font-sans text-xs text-text-muted',
                'transition-colors duration-200',
                'hover:text-hermes-500',
                'focus:outline-none focus-visible:text-hermes-500'
              )}
            >
              Effacer ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Filter Content */}
        {filterContent}
      </aside>
    </>
  );
}

export default CollectionFilters;
