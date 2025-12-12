'use client';

import { useState, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryFiltersProps {
  className?: string;
}

const MATERIALS = [
  { id: 'or', label: 'Or' },
  { id: 'diamant', label: 'Diamant' },
  { id: 'platine', label: 'Platine' },
  { id: 'perle', label: 'Perle' },
  { id: 'saphir', label: 'Saphir' },
  { id: 'rubis', label: 'Rubis' },
  { id: 'emeraude', label: 'Emeraude' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Nouveautes' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix decroissant' },
  { value: 'name', label: 'Nom A-Z' },
];

const PRICE_PRESETS = [
  { min: 0, max: 5000, label: 'Moins de 5 000 EUR' },
  { min: 5000, max: 10000, label: '5 000 - 10 000 EUR' },
  { min: 10000, max: 25000, label: '10 000 - 25 000 EUR' },
  { min: 25000, max: Infinity, label: 'Plus de 25 000 EUR' },
];

export function CategoryFilters({ className }: CategoryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for inputs
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Get current filter values from URL
  const currentMaterials = searchParams.get('materials')?.split(',').filter(Boolean) || [];
  const currentSort = searchParams.get('sort') || 'newest';

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

  const filterContent = (
    <>
      {/* Sort Dropdown */}
      <div className="space-y-3">
        <h3 className="text-sm uppercase tracking-wider text-luxury-silver font-medium">
          Trier par
        </h3>
        <div className="relative">
          <select
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full bg-luxury-charcoal border border-luxury-gray/50 px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:border-gold-500 transition-colors"
            aria-label="Trier les produits"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-silver pointer-events-none" />
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3 pt-6 border-t border-luxury-gray/30">
        <h3 className="text-sm uppercase tracking-wider text-luxury-silver font-medium">
          Fourchette de prix
        </h3>

        {/* Price Presets */}
        <div className="space-y-2">
          {PRICE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPricePreset(preset)}
              className={cn(
                'w-full text-left px-3 py-2 text-sm transition-colors',
                'hover:bg-luxury-gray/50 hover:text-gold-500',
                searchParams.get('minPrice') === (preset.min > 0 ? preset.min.toString() : '') &&
                  searchParams.get('maxPrice') === (preset.max < Infinity ? preset.max.toString() : '')
                  ? 'bg-gold-500/10 text-gold-500 border-l-2 border-gold-500'
                  : 'text-luxury-pearl'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Price Inputs */}
        <div className="flex gap-3 items-center pt-3">
          <div className="flex-1">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min"
              className="w-full bg-luxury-charcoal border border-luxury-gray/50 px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors"
              aria-label="Prix minimum"
            />
          </div>
          <span className="text-luxury-silver">-</span>
          <div className="flex-1">
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max"
              className="w-full bg-luxury-charcoal border border-luxury-gray/50 px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors"
              aria-label="Prix maximum"
            />
          </div>
        </div>
        <button
          onClick={applyPriceFilter}
          className="w-full py-2 text-sm uppercase tracking-wider text-gold-500 border border-gold-500/50 hover:bg-gold-500 hover:text-luxury-black transition-colors"
        >
          Appliquer
        </button>
      </div>

      {/* Materials */}
      <div className="space-y-3 pt-6 border-t border-luxury-gray/30">
        <h3 className="text-sm uppercase tracking-wider text-luxury-silver font-medium">
          Materiaux
        </h3>
        <div className="space-y-2">
          {MATERIALS.map((material) => (
            <label
              key={material.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={cn(
                  'w-5 h-5 border-2 flex items-center justify-center transition-all',
                  currentMaterials.includes(material.id)
                    ? 'bg-gold-500 border-gold-500'
                    : 'border-luxury-gray group-hover:border-gold-500/50'
                )}
              >
                {currentMaterials.includes(material.id) && (
                  <motion.svg
                    className="w-3 h-3 text-luxury-black"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                )}
              </div>
              <input
                type="checkbox"
                checked={currentMaterials.includes(material.id)}
                onChange={() => toggleMaterial(material.id)}
                className="sr-only"
                aria-label={`Filtrer par ${material.label}`}
              />
              <span
                className={cn(
                  'text-sm transition-colors',
                  currentMaterials.includes(material.id)
                    ? 'text-gold-500'
                    : 'text-luxury-pearl group-hover:text-gold-400'
                )}
              >
                {material.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <motion.div
          className="pt-6 border-t border-luxury-gray/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <button
            onClick={resetFilters}
            className="w-full py-3 text-sm uppercase tracking-wider text-luxury-silver border border-luxury-gray hover:border-red-500/50 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Reinitialiser les filtres
          </button>
        </motion.div>
      )}

      {/* Loading Indicator */}
      {isPending && (
        <div className="fixed inset-0 bg-luxury-black/50 flex items-center justify-center z-50 pointer-events-none">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="w-full py-3 px-4 bg-luxury-charcoal border border-luxury-gray/50 text-white flex items-center justify-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm uppercase tracking-wider">Filtres</span>
          {hasActiveFilters && (
            <span className="ml-2 w-5 h-5 bg-gold-500 text-luxury-black text-xs flex items-center justify-center rounded-full">
              {currentMaterials.length +
                (searchParams.has('minPrice') || searchParams.has('maxPrice') ? 1 : 0)}
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
              className="fixed inset-0 bg-luxury-black/80 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-luxury-charcoal z-50 lg:hidden overflow-y-auto"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl text-white">Filtres</h2>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="w-10 h-10 flex items-center justify-center text-luxury-silver hover:text-white transition-colors"
                    aria-label="Fermer les filtres"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {filterContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className={cn('hidden lg:block space-y-6', className)}>
        {filterContent}
      </aside>
    </>
  );
}

export default CategoryFilters;
