'use client';

/**
 * BrandsPageClient - Client Component for Brands Listing Page
 *
 * Handles all interactive functionality:
 * - Search filtering
 * - Alphabetical filter
 * - Premium filter
 * - Country filter
 * - Animated transitions
 */

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Container } from '@/components/ui/Container';
import { BrandFilter, BrandGrid } from '@/components/brands';
import type { Brand } from '@/types/brand';

// ============================================================================
// Types
// ============================================================================

export interface BrandsPageClientProps {
  /** Initial brands data */
  initialBrands: Brand[];
  /** Initial brands grouped by letter */
  initialByLetter: Record<string, Brand[]>;
  /** Initial premium brands */
  initialPremium: Brand[];
  /** Initial total count */
  initialTotal: number;
  /** Available countries */
  countries: string[];
}

// ============================================================================
// Animation Variants
// ============================================================================

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

// ============================================================================
// Component
// ============================================================================

export function BrandsPageClient({
  initialBrands,
  initialByLetter,
  initialPremium,
  initialTotal,
  countries,
}: BrandsPageClientProps) {
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Available letters (letters that have brands)
  const availableLetters = useMemo(() => {
    return Object.keys(initialByLetter).sort();
  }, [initialByLetter]);

  // Filtered brands
  const filteredBrands = useMemo(() => {
    let result = initialBrands;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (brand) =>
          brand.name.toLowerCase().includes(query) ||
          brand.country?.toLowerCase().includes(query) ||
          brand.description?.toLowerCase().includes(query)
      );
    }

    // Letter filter
    if (selectedLetter) {
      result = result.filter(
        (brand) => brand.name.charAt(0).toUpperCase() === selectedLetter
      );
    }

    // Premium filter
    if (premiumOnly) {
      result = result.filter((brand) => brand.is_premium || brand.is_favorite);
    }

    // Country filter
    if (selectedCountry) {
      result = result.filter(
        (brand) => brand.country?.toLowerCase() === selectedCountry.toLowerCase()
      );
    }

    return result;
  }, [initialBrands, searchQuery, selectedLetter, premiumOnly, selectedCountry]);

  // Filtered byLetter
  const filteredByLetter = useMemo(() => {
    return filteredBrands.reduce(
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
  }, [filteredBrands]);

  // Filtered premium brands
  const filteredPremium = useMemo(() => {
    if (premiumOnly || selectedLetter) {
      return [];
    }
    return filteredBrands.filter((b) => b.is_premium || b.is_favorite);
  }, [filteredBrands, premiumOnly, selectedLetter]);

  // Filtered available letters
  const filteredAvailableLetters = useMemo(() => {
    if (searchQuery || premiumOnly || selectedCountry) {
      return Object.keys(filteredByLetter).sort();
    }
    return availableLetters;
  }, [filteredByLetter, searchQuery, premiumOnly, selectedCountry, availableLetters]);

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedLetter || premiumOnly || selectedCountry;

  return (
    <motion.div
      className="min-h-screen bg-white"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.section
        variants={slideUp}
        className="relative bg-gradient-to-b from-neutral-50 to-white py-12 lg:py-16 overflow-hidden"
      >
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden="true"
        />

        <Container className="relative">
          <div className="text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-accent/10">
              <Sparkles className="w-8 h-8 text-accent" />
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
              Nos Marques Partenaires
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Decouvrez notre selection de plus de {initialTotal} marques de confiance.
              Des partenaires de qualite pour votre activite professionnelle.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">{initialTotal}+</p>
                <p className="text-sm text-neutral-500">Marques</p>
              </div>
              <div className="w-px h-12 bg-neutral-200" />
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-500">
                  {initialPremium.length}
                </p>
                <p className="text-sm text-neutral-500">Premium</p>
              </div>
              <div className="w-px h-12 bg-neutral-200" />
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-500">
                  {countries.length}
                </p>
                <p className="text-sm text-neutral-500">Pays</p>
              </div>
            </div>
          </div>
        </Container>
      </motion.section>

      {/* Filter Bar */}
      <BrandFilter
        availableLetters={filteredAvailableLetters}
        selectedLetter={selectedLetter}
        onLetterChange={setSelectedLetter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        premiumOnly={premiumOnly}
        onPremiumChange={setPremiumOnly}
        countries={countries}
        selectedCountry={selectedCountry}
        onCountryChange={setSelectedCountry}
        totalBrands={initialTotal}
        filteredCount={filteredBrands.length}
        sticky
      />

      {/* Brands Grid */}
      <Container className="py-8 lg:py-12">
        <BrandGrid
          brands={filteredBrands}
          byLetter={filteredByLetter}
          premiumBrands={filteredPremium}
          showPremiumSection={!hasActiveFilters}
          selectedLetter={selectedLetter}
          groupByLetter
          cardVariant="default"
          showProductCount
          showCountry
          columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
        />
      </Container>

      {/* Bottom CTA */}
      {!hasActiveFilters && (
        <motion.section
          variants={slideUp}
          className="bg-neutral-50 py-12 lg:py-16"
        >
          <Container>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-4">
                <Award className="w-4 h-4" />
                Partenaires de confiance
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
                Vous ne trouvez pas votre marque ?
              </h2>
              <p className="text-neutral-600 max-w-xl mx-auto mb-6">
                Notre catalogue s'enrichit regulierement. Contactez-nous pour nous suggerer
                une marque ou pour une demande specifique.
              </p>
              <a
                href="/contact"
                className={cn(
                  'inline-flex items-center gap-2 px-6 py-3',
                  'bg-accent text-white rounded-lg font-medium',
                  'hover:bg-orange-600 transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
                )}
              >
                Nous contacter
              </a>
            </div>
          </Container>
        </motion.section>
      )}
    </motion.div>
  );
}

export default BrandsPageClient;
