'use client';

import { useState, useCallback, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, SlidersHorizontal, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// API URL for fetching filter data
const API_BASE_URL = process.env.NEXT_PUBLIC_SAGE_API_URL || 'https://sage-portal.webexpr.dev/api';

interface CategoryFiltersLightProps {
  className?: string;
  /** Total product count for display */
  totalProducts?: number;
  /** Category slug for filtering (optional - if not provided, uses all products) */
  categorySlug?: string;
}

interface PricePreset {
  min: number;
  max: number;
  label: string;
}

interface Material {
  id: string;
  label: string;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Nouveautes' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix decroissant' },
  { value: 'name', label: 'Nom A-Z' },
];

// Default price presets (used as fallback if API fails)
const DEFAULT_PRICE_PRESETS: PricePreset[] = [
  { min: 0, max: 500, label: 'Moins de 500 EUR' },
  { min: 500, max: 1000, label: '500 - 1 000 EUR' },
  { min: 1000, max: 5000, label: '1 000 - 5 000 EUR' },
  { min: 5000, max: Infinity, label: 'Plus de 5 000 EUR' },
];

/**
 * Generate dynamic price presets based on actual min/max prices
 */
function generatePricePresets(minPrice: number, maxPrice: number): PricePreset[] {
  if (minPrice === 0 && maxPrice === 0) {
    return DEFAULT_PRICE_PRESETS;
  }

  const range = maxPrice - minPrice;
  const presets: PricePreset[] = [];

  // Round to nice numbers
  const roundToNice = (value: number): number => {
    if (value <= 100) return Math.ceil(value / 10) * 10;
    if (value <= 1000) return Math.ceil(value / 100) * 100;
    if (value <= 10000) return Math.ceil(value / 1000) * 1000;
    return Math.ceil(value / 5000) * 5000;
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  // Create 4 price brackets based on range
  if (range > 0) {
    const step = range / 4;
    const p1 = roundToNice(minPrice + step);
    const p2 = roundToNice(minPrice + step * 2);
    const p3 = roundToNice(minPrice + step * 3);

    presets.push({
      min: 0,
      max: p1,
      label: `Moins de ${formatPrice(p1)} EUR`,
    });

    presets.push({
      min: p1,
      max: p2,
      label: `${formatPrice(p1)} - ${formatPrice(p2)} EUR`,
    });

    presets.push({
      min: p2,
      max: p3,
      label: `${formatPrice(p2)} - ${formatPrice(p3)} EUR`,
    });

    presets.push({
      min: p3,
      max: Infinity,
      label: `Plus de ${formatPrice(p3)} EUR`,
    });
  } else {
    // All products have the same price
    const price = roundToNice(maxPrice);
    presets.push({
      min: 0,
      max: Infinity,
      label: `Environ ${formatPrice(price)} EUR`,
    });
  }

  return presets;
}

// Animation variants
const filterSectionVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: {
      height: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
      opacity: { duration: 0.2, delay: 0.1 },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      height: { duration: 0.2 },
      opacity: { duration: 0.1 },
    },
  },
};

const drawerVariants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 300,
    },
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/**
 * CategoryFiltersLight - Elegant filters with light Hermes-inspired theme
 *
 * Features:
 * - Collapsible filter sections with smooth animations
 * - Light cream/white background
 * - Hermes orange accent color
 * - Mobile drawer with backdrop
 * - Custom checkboxes with elegant styling
 * - Dynamic price presets from API
 * - Dynamic materials from API
 */
export function CategoryFiltersLight({ className, totalProducts, categorySlug }: CategoryFiltersLightProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Dynamic filter data from API
  const [pricePresets, setPricePresets] = useState<PricePreset[]>(DEFAULT_PRICE_PRESETS);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);

  // Fetch filter data from API
  useEffect(() => {
    async function fetchFilterData() {
      setIsLoadingFilters(true);
      try {
        // Fetch price range and materials in parallel
        const categoryParam = categorySlug ? `?categorySlug=${encodeURIComponent(categorySlug)}` : '';

        const [priceResponse, materialsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/sage/filters/price-range${categoryParam}`).catch(() => null),
          fetch(`${API_BASE_URL}/sage/filters/materials${categoryParam}`).catch(() => null),
        ]);

        // If dedicated filter endpoints don't exist, fetch products and compute locally
        // This is a fallback approach using existing product data
        const productsResponse = await fetch(
          `${API_BASE_URL}/sage/articles`,
          { next: { revalidate: 300 } }
        );

        if (productsResponse.ok) {
          const articles = await productsResponse.json();

          // Filter by category if provided
          let filteredArticles = articles.filter(
            (a: { EstEnSommeil: boolean; Fictif: boolean }) => !a.EstEnSommeil && !a.Fictif
          );

          if (categorySlug) {
            // Need to fetch families to map slug to code
            const familiesResponse = await fetch(`${API_BASE_URL}/sage/families`);
            if (familiesResponse.ok) {
              const families = await familiesResponse.json();
              const categoryFamily = families.find((f: { Intitule: string }) => {
                const slug = f.Intitule
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/(^-|-$)/g, '');
                return slug === categorySlug;
              });

              if (categoryFamily) {
                filteredArticles = filteredArticles.filter(
                  (a: { CodeFamille: string }) => a.CodeFamille === categoryFamily.CodeFamille
                );
              }
            }
          }

          // Calculate price range
          if (filteredArticles.length > 0) {
            const prices = filteredArticles.map((a: { PrixVente: number }) => a.PrixVente);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            setPriceRange({ min: minPrice, max: maxPrice });
            setPricePresets(generatePricePresets(minPrice, maxPrice));
          }

          // Extract unique materials (from InfosLibres if available, otherwise leave empty)
          // Since materials aren't directly available in the current API, we keep an empty array
          // This can be extended when material data becomes available
          setMaterials([]);
        }
      } catch (error) {
        console.error('Failed to fetch filter data:', error);
        // Keep default presets on error
        setPricePresets(DEFAULT_PRICE_PRESETS);
      } finally {
        setIsLoadingFilters(false);
      }
    }

    fetchFilterData();
  }, [categorySlug]);

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState({
    sort: true,
    price: true,
    materials: true,
  });

  // Local state for inputs
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Get current filter values from URL
  const currentMaterials = searchParams.get('materials')?.split(',').filter(Boolean) || [];
  const currentSort = searchParams.get('sort') || 'newest';

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Update URL with new params
  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

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

  // Handle material toggle
  const toggleMaterial = useCallback(
    (materialId: string) => {
      const newMaterials = currentMaterials.includes(materialId)
        ? currentMaterials.filter((m) => m !== materialId)
        : [...currentMaterials, materialId];

      updateFilters({
        materials: newMaterials.length > 0 ? newMaterials.join(',') : null,
      });
    },
    [currentMaterials, updateFilters]
  );

  // Handle sort change
  const handleSortChange = useCallback(
    (value: string) => {
      updateFilters({ sort: value === 'newest' ? null : value });
    },
    [updateFilters]
  );

  // Handle price filter
  const applyPriceFilter = useCallback(() => {
    updateFilters({
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
    });
  }, [minPrice, maxPrice, updateFilters]);

  // Handle price preset
  const applyPricePreset = useCallback(
    (preset: { min: number; max: number }) => {
      const newMin = preset.min > 0 ? preset.min.toString() : '';
      const newMax = preset.max < Infinity ? preset.max.toString() : '';
      setMinPrice(newMin);
      setMaxPrice(newMax);
      updateFilters({
        minPrice: newMin || null,
        maxPrice: newMax || null,
      });
    },
    [updateFilters]
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    setMinPrice('');
    setMaxPrice('');
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }, [pathname, router]);

  // Check if any filters are active
  const hasActiveFilters =
    currentMaterials.length > 0 ||
    searchParams.has('minPrice') ||
    searchParams.has('maxPrice') ||
    (searchParams.has('sort') && searchParams.get('sort') !== 'newest');

  // Count active filters
  const activeFilterCount =
    currentMaterials.length +
    (searchParams.has('minPrice') || searchParams.has('maxPrice') ? 1 : 0) +
    (searchParams.has('sort') && searchParams.get('sort') !== 'newest' ? 1 : 0);

  // Check if price preset is selected
  const isPricePresetSelected = (preset: { min: number; max: number }) => {
    const minMatch = searchParams.get('minPrice') === (preset.min > 0 ? preset.min.toString() : null);
    const maxMatch = searchParams.get('maxPrice') === (preset.max < Infinity ? preset.max.toString() : null);
    return minMatch && maxMatch;
  };

  // Filter section header component
  const FilterSectionHeader = ({
    title,
    section,
    isExpanded,
  }: {
    title: string;
    section: keyof typeof expandedSections;
    isExpanded: boolean;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="flex w-full items-center justify-between py-3 text-left"
      aria-expanded={isExpanded}
      aria-controls={`filter-${section}`}
    >
      <span className="font-sans text-xs font-medium uppercase tracking-luxe text-text-primary">
        {title}
      </span>
      <motion.span
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <ChevronDown className="h-4 w-4 text-text-muted" />
      </motion.span>
    </button>
  );

  // Custom checkbox component
  const CustomCheckbox = ({
    checked,
    onChange,
    label,
  }: {
    checked: boolean;
    onChange: () => void;
    label: string;
  }) => (
    <label className="group flex cursor-pointer items-center gap-3">
      <div
        className={cn(
          'flex h-5 w-5 items-center justify-center border transition-all duration-250 ease-luxe',
          checked
            ? 'border-hermes-500 bg-hermes-500'
            : 'border-border-medium group-hover:border-hermes-400'
        )}
      >
        <AnimatePresence mode="wait">
          {checked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
        aria-label={`Filtrer par ${label}`}
      />
      <span
        className={cn(
          'font-sans text-sm transition-colors duration-250',
          checked
            ? 'text-hermes-500'
            : 'text-text-secondary group-hover:text-text-primary'
        )}
      >
        {label}
      </span>
    </label>
  );

  const filterContent = (
    <div className="space-y-1">
      {/* Sort Section */}
      <div className="border-b border-border-light pb-1">
        <FilterSectionHeader
          title="Trier par"
          section="sort"
          isExpanded={expandedSections.sort}
        />
        <AnimatePresence>
          {expandedSections.sort && (
            <motion.div
              id="filter-sort"
              variants={filterSectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="overflow-hidden"
            >
              <div className="pb-4">
                <div className="relative">
                  <select
                    value={currentSort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className={cn(
                      'w-full appearance-none bg-white px-4 py-3',
                      'border border-border-light',
                      'font-sans text-sm text-text-primary',
                      'transition-all duration-250 ease-luxe',
                      'hover:border-border-medium focus:border-hermes-500 focus:outline-none',
                      'cursor-pointer'
                    )}
                    aria-label="Trier les produits"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price Range Section */}
      <div className="border-b border-border-light pb-1">
        <FilterSectionHeader
          title="Fourchette de prix"
          section="price"
          isExpanded={expandedSections.price}
        />
        <AnimatePresence>
          {expandedSections.price && (
            <motion.div
              id="filter-price"
              variants={filterSectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="overflow-hidden"
            >
              <div className="space-y-3 pb-4">
                {/* Price Presets */}
                <div className="space-y-1">
                  {isLoadingFilters ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-9 animate-pulse rounded bg-background-muted"
                        />
                      ))}
                    </div>
                  ) : (
                    pricePresets.map((preset) => {
                      const isSelected = isPricePresetSelected(preset);
                      return (
                        <button
                          key={preset.label}
                          onClick={() => applyPricePreset(preset)}
                          className={cn(
                            'w-full px-3 py-2 text-left font-sans text-sm transition-all duration-250 ease-luxe',
                            isSelected
                              ? 'border-l-2 border-hermes-500 bg-hermes-50 text-hermes-600'
                              : 'border-l-2 border-transparent text-text-secondary hover:border-hermes-300 hover:bg-background-muted hover:text-text-primary'
                          )}
                        >
                          {preset.label}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Custom Price Inputs */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min"
                      className={cn(
                        'w-full bg-white px-3 py-2',
                        'border border-border-light',
                        'font-sans text-sm text-text-primary placeholder:text-text-light',
                        'transition-all duration-250 ease-luxe',
                        'hover:border-border-medium focus:border-hermes-500 focus:outline-none'
                      )}
                      aria-label="Prix minimum"
                    />
                  </div>
                  <span className="font-sans text-sm text-text-light">-</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max"
                      className={cn(
                        'w-full bg-white px-3 py-2',
                        'border border-border-light',
                        'font-sans text-sm text-text-primary placeholder:text-text-light',
                        'transition-all duration-250 ease-luxe',
                        'hover:border-border-medium focus:border-hermes-500 focus:outline-none'
                      )}
                      aria-label="Prix maximum"
                    />
                  </div>
                </div>
                <button
                  onClick={applyPriceFilter}
                  className={cn(
                    'w-full py-2.5',
                    'border border-hermes-500',
                    'font-sans text-xs font-medium uppercase tracking-luxe text-hermes-500',
                    'transition-all duration-350 ease-luxe',
                    'hover:bg-hermes-500 hover:text-white'
                  )}
                >
                  Appliquer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Materials Section - Only show if materials are available */}
      {materials.length > 0 && (
        <div className="pb-1">
          <FilterSectionHeader
            title="Materiaux"
            section="materials"
            isExpanded={expandedSections.materials}
          />
          <AnimatePresence>
            {expandedSections.materials && (
              <motion.div
                id="filter-materials"
                variants={filterSectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="overflow-hidden"
              >
                <div className="space-y-3 pb-4">
                  {isLoadingFilters ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3"
                        >
                          <div className="h-5 w-5 animate-pulse rounded bg-background-muted" />
                          <div className="h-4 w-20 animate-pulse rounded bg-background-muted" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    materials.map((material) => (
                      <CustomCheckbox
                        key={material.id}
                        checked={currentMaterials.includes(material.id)}
                        onChange={() => toggleMaterial(material.id)}
                        label={material.label}
                      />
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Reset Button */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            className="pt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
          >
            <button
              onClick={resetFilters}
              className={cn(
                'flex w-full items-center justify-center gap-2 py-3',
                'border border-border-medium',
                'font-sans text-xs font-medium uppercase tracking-luxe text-text-muted',
                'transition-all duration-350 ease-luxe',
                'hover:border-text-muted hover:text-text-primary'
              )}
            >
              <X className="h-4 w-4" />
              Reinitialiser les filtres
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Indicator */}
      <AnimatePresence>
        {isPending && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-hermes-500 border-t-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsMobileOpen(true)}
          className={cn(
            'flex w-full items-center justify-center gap-2 py-3.5 px-4',
            'bg-white border border-border-light',
            'transition-all duration-250 ease-luxe',
            'hover:border-hermes-500'
          )}
        >
          <SlidersHorizontal className="h-4 w-4 text-text-primary" />
          <span className="font-sans text-xs font-medium uppercase tracking-luxe text-text-primary">
            Filtres
          </span>
          {activeFilterCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-hermes-500 text-xs text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-luxe-charcoal/40 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] overflow-y-auto bg-background-cream lg:hidden"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-label="Filtres de produits"
            >
              <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between border-b border-border-light pb-4">
                  <h2 className="font-serif text-xl text-text-primary">Filtres</h2>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="flex h-10 w-10 items-center justify-center text-text-muted transition-colors hover:text-text-primary"
                    aria-label="Fermer les filtres"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {totalProducts !== undefined && (
                  <p className="mb-6 font-sans text-sm text-text-muted">
                    {totalProducts} {totalProducts > 1 ? 'produits' : 'produit'}
                  </p>
                )}

                {filterContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className={cn('hidden lg:block', className)}>
        {filterContent}
      </aside>
    </>
  );
}

export default CategoryFiltersLight;
