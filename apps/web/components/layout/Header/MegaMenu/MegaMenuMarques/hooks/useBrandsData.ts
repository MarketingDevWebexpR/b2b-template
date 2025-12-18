/**
 * useBrandsData Hook
 *
 * Custom hook for fetching and managing brands data.
 * Includes memoized grouping and filtering operations.
 */

import { useMemo, useState, useCallback } from 'react';
import type { Brand, BrandsData } from '../types';
import {
  groupBrandsByLetter,
  filterBrands,
  getPremiumBrands,
} from '../utils/groupBrandsByLetter';

// Mock data for demonstration - replace with actual API call
const MOCK_BRANDS: Brand[] = [
  // Premium brands
  { id: '1', name: 'Cartier', slug: 'cartier', productCount: 234, tier: 'premium', featured: true },
  { id: '2', name: 'Bulgari', slug: 'bulgari', productCount: 156, tier: 'premium', featured: true },
  { id: '3', name: 'Tiffany & Co.', slug: 'tiffany', productCount: 312, tier: 'premium', featured: true },
  { id: '4', name: 'Van Cleef & Arpels', slug: 'van-cleef', productCount: 89, tier: 'premium', featured: true },
  { id: '5', name: 'Chopard', slug: 'chopard', productCount: 78, tier: 'premium', featured: true },
  { id: '6', name: 'Piaget', slug: 'piaget', productCount: 145, tier: 'premium', featured: true },

  // Standard brands - A
  { id: '7', name: 'Amor & Amore', slug: 'amor-amore', productCount: 45, tier: 'standard' },
  { id: '8', name: 'Argyor', slug: 'argyor', productCount: 123, tier: 'standard' },
  { id: '9', name: 'Ateliers Saint-Germain', slug: 'ateliers-saint-germain', productCount: 67, tier: 'standard' },

  // B
  { id: '10', name: 'Boucheron', slug: 'boucheron', productCount: 89, tier: 'premium' },
  { id: '11', name: 'Breil', slug: 'breil', productCount: 56, tier: 'standard' },

  // C
  { id: '12', name: 'Calvin Klein', slug: 'calvin-klein', productCount: 178, tier: 'standard' },
  { id: '13', name: 'Cerruti', slug: 'cerruti', productCount: 34, tier: 'standard' },
  { id: '14', name: 'Chaumet', slug: 'chaumet', productCount: 92, tier: 'premium' },

  // D
  { id: '15', name: 'Daniel Wellington', slug: 'daniel-wellington', productCount: 87, tier: 'standard' },
  { id: '16', name: 'Dior', slug: 'dior', productCount: 156, tier: 'premium' },

  // E
  { id: '17', name: 'Emporio Armani', slug: 'emporio-armani', productCount: 134, tier: 'standard' },

  // F
  { id: '18', name: 'Fossil', slug: 'fossil', productCount: 245, tier: 'standard' },
  { id: '19', name: 'Fred', slug: 'fred', productCount: 67, tier: 'premium' },

  // G
  { id: '20', name: 'Guess', slug: 'guess', productCount: 189, tier: 'standard' },
  { id: '21', name: 'Graff', slug: 'graff', productCount: 45, tier: 'premium' },

  // H
  { id: '22', name: 'Harry Winston', slug: 'harry-winston', productCount: 56, tier: 'premium' },
  { id: '23', name: 'Hugo Boss', slug: 'hugo-boss', productCount: 123, tier: 'standard' },

  // I
  { id: '24', name: 'Ice Watch', slug: 'ice-watch', productCount: 234, tier: 'standard' },

  // J
  { id: '25', name: 'Jaeger-LeCoultre', slug: 'jaeger-lecoultre', productCount: 78, tier: 'premium' },

  // K
  { id: '26', name: 'Kate Spade', slug: 'kate-spade', productCount: 145, tier: 'standard' },
  { id: '27', name: 'Kenzo', slug: 'kenzo', productCount: 89, tier: 'standard' },

  // L
  { id: '28', name: 'Lacoste', slug: 'lacoste', productCount: 167, tier: 'standard' },
  { id: '29', name: 'Longines', slug: 'longines', productCount: 134, tier: 'premium' },

  // M
  { id: '30', name: 'Mauboussin', slug: 'mauboussin', productCount: 89, tier: 'premium' },
  { id: '31', name: 'Michael Kors', slug: 'michael-kors', productCount: 278, tier: 'standard' },
  { id: '32', name: 'Messika', slug: 'messika', productCount: 67, tier: 'premium' },
  { id: '33', name: 'Morellato', slug: 'morellato', productCount: 145, tier: 'standard' },

  // N
  { id: '34', name: 'Nixon', slug: 'nixon', productCount: 98, tier: 'standard' },

  // O
  { id: '35', name: 'Omega', slug: 'omega', productCount: 156, tier: 'premium' },
  { id: '36', name: 'Olivia Burton', slug: 'olivia-burton', productCount: 87, tier: 'standard' },

  // P
  { id: '37', name: 'Pandora', slug: 'pandora', productCount: 456, tier: 'standard', featured: true },
  { id: '38', name: 'Pierre Lannier', slug: 'pierre-lannier', productCount: 123, tier: 'standard' },

  // R
  { id: '39', name: 'Rado', slug: 'rado', productCount: 78, tier: 'premium' },
  { id: '40', name: 'Rolex', slug: 'rolex', productCount: 189, tier: 'premium' },

  // S
  { id: '41', name: 'Swarovski', slug: 'swarovski', productCount: 345, tier: 'standard', featured: true },
  { id: '42', name: 'Seiko', slug: 'seiko', productCount: 234, tier: 'standard' },
  { id: '43', name: 'Skagen', slug: 'skagen', productCount: 156, tier: 'standard' },

  // T
  { id: '44', name: 'Tag Heuer', slug: 'tag-heuer', productCount: 145, tier: 'premium' },
  { id: '45', name: 'Thomas Sabo', slug: 'thomas-sabo', productCount: 267, tier: 'standard' },
  { id: '46', name: 'Tissot', slug: 'tissot', productCount: 198, tier: 'standard' },
  { id: '47', name: 'Tommy Hilfiger', slug: 'tommy-hilfiger', productCount: 178, tier: 'standard' },

  // V
  { id: '48', name: 'Versace', slug: 'versace', productCount: 134, tier: 'premium' },

  // Z
  { id: '49', name: 'Zenith', slug: 'zenith', productCount: 67, tier: 'premium' },
];

interface UseBrandsDataOptions {
  /** Initial search query */
  initialQuery?: string;
  /** Number of premium brands to show */
  premiumLimit?: number;
}

interface UseBrandsDataReturn {
  /** All brands */
  brands: Brand[];
  /** Premium brands for featured section */
  premiumBrands: Brand[];
  /** Brands grouped by letter */
  brandsByLetter: Record<string, Brand[]>;
  /** Filtered brands (by search) */
  filteredBrands: Brand[];
  /** Filtered brands grouped by letter */
  filteredBrandsByLetter: Record<string, Brand[]>;
  /** Current search query */
  searchQuery: string;
  /** Update search query */
  setSearchQuery: (query: string) => void;
  /** Whether search is active */
  isSearching: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Total brand count */
  totalCount: number;
}

export function useBrandsData({
  initialQuery = '',
  premiumLimit = 6,
}: UseBrandsDataOptions = {}): UseBrandsDataReturn {
  // In a real app, this would be fetched from an API
  const [brands] = useState<Brand[]>(MOCK_BRANDS);
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Memoized premium brands
  const premiumBrands = useMemo(
    () => getPremiumBrands(brands, premiumLimit),
    [brands, premiumLimit]
  );

  // Memoized grouped brands
  const brandsByLetter = useMemo(
    () => groupBrandsByLetter(brands),
    [brands]
  );

  // Filtered brands (by search)
  const filteredBrands = useMemo(
    () => filterBrands(brands, searchQuery),
    [brands, searchQuery]
  );

  // Filtered brands grouped by letter
  const filteredBrandsByLetter = useMemo(
    () => groupBrandsByLetter(filteredBrands),
    [filteredBrands]
  );

  // Search state
  const isSearching = searchQuery.length >= 2;

  // Handler for updating search
  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    brands,
    premiumBrands,
    brandsByLetter,
    filteredBrands,
    filteredBrandsByLetter,
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
    isSearching,
    isLoading,
    error,
    totalCount: brands.length,
  };
}

export default useBrandsData;
