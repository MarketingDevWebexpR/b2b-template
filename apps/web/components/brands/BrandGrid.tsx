'use client';

/**
 * BrandGrid Component
 *
 * Displays brands in a grid layout with optional alphabetical grouping.
 * Features:
 * - Responsive grid layout
 * - Alphabetical section headers
 * - Premium brands section
 * - Empty state
 * - Loading skeleton
 *
 * @packageDocumentation
 */

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandCard } from './BrandCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Brand } from '@/types/brand';

// ============================================================================
// Types
// ============================================================================

export interface BrandGridProps {
  /** Brands to display */
  brands: Brand[];
  /** Group brands alphabetically */
  groupByLetter?: boolean;
  /** Brands grouped by letter (if already grouped) */
  byLetter?: Record<string, Brand[]>;
  /** Premium brands to feature at top */
  premiumBrands?: Brand[];
  /** Show premium section */
  showPremiumSection?: boolean;
  /** Selected letter filter */
  selectedLetter?: string | null;
  /** Card variant */
  cardVariant?: 'default' | 'compact' | 'featured';
  /** Show product counts */
  showProductCount?: boolean;
  /** Show country */
  showCountry?: boolean;
  /** Grid columns config */
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /** Is loading */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

// ============================================================================
// Sub-Components
// ============================================================================

interface SectionHeaderProps {
  letter: string;
  count: number;
}

const SectionHeader = memo(function SectionHeader({ letter, count }: SectionHeaderProps) {
  return (
    <motion.div
      variants={sectionVariants}
      className="flex items-baseline gap-3 mb-4"
    >
      <h3 className="text-2xl font-bold text-neutral-900">{letter}</h3>
      <span className="text-sm text-neutral-400">
        {count} marque{count !== 1 ? 's' : ''}
      </span>
      <div className="flex-1 h-px bg-neutral-200" />
    </motion.div>
  );
});

SectionHeader.displayName = 'SectionHeader';

interface PremiumSectionProps {
  brands: Brand[];
  cardVariant?: 'default' | 'compact' | 'featured';
}

const PremiumSection = memo(function PremiumSection({
  brands,
  cardVariant = 'featured',
}: PremiumSectionProps) {
  if (brands.length === 0) return null;

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mb-12"
      aria-labelledby="premium-brands-title"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 text-amber-600">
          <Award className="w-6 h-6" />
          <h2
            id="premium-brands-title"
            className="text-xl font-bold text-neutral-900"
          >
            Marques Vedettes
          </h2>
        </div>
        <span className="text-sm text-neutral-400">
          {brands.length} marque{brands.length !== 1 ? 's' : ''} premium
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-amber-200 to-transparent" />
      </div>

      {/* Premium Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {brands.map((brand, index) => (
          <motion.div key={brand.id} variants={itemVariants}>
            <BrandCard
              brand={brand}
              variant={cardVariant}
              showProductCount
              showCountry
              priority={index < 5}
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
});

PremiumSection.displayName = 'PremiumSection';

interface LoadingSkeletonProps {
  columns: { sm?: number; md?: number; lg?: number; xl?: number };
}

const LoadingSkeleton = memo(function LoadingSkeleton({ columns }: LoadingSkeletonProps) {
  return (
    <div className="space-y-8">
      {/* Premium section skeleton */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Letter sections skeleton */}
      {['A', 'B', 'C'].map((letter) => (
        <div key={letter}>
          <div className="flex items-baseline gap-3 mb-4">
            <Skeleton className="w-8 h-8" />
            <Skeleton className="h-4 w-20" />
            <div className="flex-1 h-px bg-neutral-200" />
          </div>
          <div
            className={cn(
              'grid gap-4',
              `grid-cols-${columns.sm || 1}`,
              `sm:grid-cols-${columns.sm || 2}`,
              `md:grid-cols-${columns.md || 3}`,
              `lg:grid-cols-${columns.lg || 4}`,
              `xl:grid-cols-${columns.xl || 5}`
            )}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

LoadingSkeleton.displayName = 'LoadingSkeleton';

interface EmptyStateProps {
  hasFilters: boolean;
}

const EmptyState = memo(function EmptyState({ hasFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        {hasFilters ? 'Aucune marque trouvee' : 'Aucune marque disponible'}
      </h3>
      <p className="text-neutral-500 max-w-sm">
        {hasFilters
          ? 'Essayez de modifier vos criteres de recherche ou de supprimer certains filtres.'
          : 'Les marques partenaires seront bientot disponibles.'}
      </p>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

// ============================================================================
// Main Component
// ============================================================================

/**
 * BrandGrid - Grid display for brands with alphabetical grouping
 *
 * @example
 * ```tsx
 * // With alphabetical grouping
 * <BrandGrid
 *   brands={brands}
 *   byLetter={byLetter}
 *   premiumBrands={premium}
 *   groupByLetter
 *   showPremiumSection
 * />
 *
 * // Simple grid
 * <BrandGrid brands={brands} />
 *
 * // With custom columns
 * <BrandGrid
 *   brands={brands}
 *   columns={{ sm: 2, md: 3, lg: 4, xl: 6 }}
 * />
 * ```
 */
export const BrandGrid = memo(function BrandGrid({
  brands,
  groupByLetter = true,
  byLetter: providedByLetter,
  premiumBrands = [],
  showPremiumSection = true,
  selectedLetter,
  cardVariant = 'default',
  showProductCount = true,
  showCountry = false,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  isLoading = false,
  className,
}: BrandGridProps) {
  // Compute byLetter if not provided
  const byLetter = useMemo(() => {
    if (providedByLetter) return providedByLetter;

    return brands.reduce(
      (acc, brand) => {
        const letter = brand.name.charAt(0).toUpperCase();
        if (!acc[letter]) {
          acc[letter] = [];
        }
        acc[letter].push(brand);
        return acc;
      },
      {} as Record<string, Brand[]>
    );
  }, [brands, providedByLetter]);

  // Sorted letters
  const sortedLetters = useMemo(() => {
    const letters = Object.keys(byLetter).sort();
    if (selectedLetter) {
      return letters.filter((l) => l === selectedLetter);
    }
    return letters;
  }, [byLetter, selectedLetter]);

  // Filter premium brands not to show in main grid (if showing premium section)
  const premiumIds = useMemo(
    () => new Set(showPremiumSection ? premiumBrands.map((b) => b.id) : []),
    [premiumBrands, showPremiumSection]
  );

  // Grid column classes
  const gridClasses = cn(
    'grid gap-4',
    columns.sm === 1 && 'grid-cols-1',
    columns.sm === 2 && 'grid-cols-2',
    columns.md === 2 && 'sm:grid-cols-2',
    columns.md === 3 && 'sm:grid-cols-3',
    columns.lg === 3 && 'md:grid-cols-3',
    columns.lg === 4 && 'md:grid-cols-4',
    columns.xl === 4 && 'lg:grid-cols-4',
    columns.xl === 5 && 'lg:grid-cols-5',
    columns.xl === 6 && 'lg:grid-cols-6'
  );

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton columns={columns} />;
  }

  // Empty state
  if (brands.length === 0) {
    return <EmptyState hasFilters={!!selectedLetter} />;
  }

  return (
    <div className={cn('space-y-8', className)}>
      {/* Premium Section */}
      {showPremiumSection && premiumBrands.length > 0 && !selectedLetter && (
        <PremiumSection brands={premiumBrands} cardVariant="featured" />
      )}

      {/* Main Grid */}
      {groupByLetter ? (
        // Grouped by letter
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-10"
        >
          {sortedLetters.map((letter) => {
            const letterBrands = byLetter[letter].filter(
              (b) => !premiumIds.has(b.id) || selectedLetter
            );

            if (letterBrands.length === 0) return null;

            return (
              <motion.section
                key={letter}
                variants={containerVariants}
                id={`brands-${letter.toLowerCase()}`}
                aria-labelledby={`brands-letter-${letter}`}
              >
                <SectionHeader letter={letter} count={letterBrands.length} />

                <div className={gridClasses}>
                  {letterBrands.map((brand) => (
                    <motion.div key={brand.id} variants={itemVariants}>
                      <BrandCard
                        brand={brand}
                        variant={cardVariant}
                        showProductCount={showProductCount}
                        showCountry={showCountry}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            );
          })}
        </motion.div>
      ) : (
        // Flat grid
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={gridClasses}
        >
          {brands.map((brand) => (
            <motion.div key={brand.id} variants={itemVariants}>
              <BrandCard
                brand={brand}
                variant={cardVariant}
                showProductCount={showProductCount}
                showCountry={showCountry}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
});

BrandGrid.displayName = 'BrandGrid';

export default BrandGrid;
