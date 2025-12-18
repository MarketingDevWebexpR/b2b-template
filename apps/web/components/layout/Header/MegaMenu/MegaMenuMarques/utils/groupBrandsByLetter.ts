/**
 * Brand Grouping Utilities
 *
 * Functions for organizing brands alphabetically and by other criteria.
 */

import type { Brand } from '../types';

// French alphabet with special handling for numeric names
export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

/**
 * Normalize a string for sorting and grouping
 * Handles accented characters and special cases
 */
function normalizeForGrouping(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toUpperCase()
    .trim();
}

/**
 * Get the grouping letter for a brand name
 */
export function getGroupingLetter(brandName: string): string {
  const normalized = normalizeForGrouping(brandName);
  const firstChar = normalized.charAt(0);

  // If starts with a letter, use it
  if (/[A-Z]/.test(firstChar)) {
    return firstChar;
  }

  // Otherwise, group under "#" (for numbers and special characters)
  return '#';
}

/**
 * Group brands by their first letter
 */
export function groupBrandsByLetter(brands: Brand[]): Record<string, Brand[]> {
  const groups: Record<string, Brand[]> = {};

  // Initialize all letters with empty arrays
  ALPHABET.forEach(letter => {
    groups[letter] = [];
  });

  // Sort brands into groups
  brands.forEach(brand => {
    const letter = getGroupingLetter(brand.name);
    if (groups[letter]) {
      groups[letter].push(brand);
    } else {
      // Fallback to "#" for any unexpected characters
      groups['#'].push(brand);
    }
  });

  // Sort brands within each group alphabetically
  Object.keys(groups).forEach(letter => {
    groups[letter].sort((a, b) =>
      normalizeForGrouping(a.name).localeCompare(normalizeForGrouping(b.name))
    );
  });

  return groups;
}

/**
 * Get letters that have at least one brand
 */
export function getAvailableLetters(brandsByLetter: Record<string, Brand[]>): Set<string> {
  return new Set(
    Object.entries(brandsByLetter)
      .filter(([, brands]) => brands.length > 0)
      .map(([letter]) => letter)
  );
}

/**
 * Filter brands by search query
 */
export function filterBrands(brands: Brand[], query: string): Brand[] {
  if (!query || query.length < 2) {
    return brands;
  }

  const normalizedQuery = normalizeForGrouping(query).toLowerCase();

  return brands.filter(brand => {
    const normalizedName = normalizeForGrouping(brand.name).toLowerCase();
    return normalizedName.includes(normalizedQuery);
  });
}

/**
 * Sort brands by various criteria
 */
export type BrandSortCriteria = 'name' | 'productCount' | 'tier';

export function sortBrands(
  brands: Brand[],
  criteria: BrandSortCriteria = 'name',
  direction: 'asc' | 'desc' = 'asc'
): Brand[] {
  const sorted = [...brands].sort((a, b) => {
    let comparison = 0;

    switch (criteria) {
      case 'name':
        comparison = normalizeForGrouping(a.name).localeCompare(
          normalizeForGrouping(b.name)
        );
        break;
      case 'productCount':
        comparison = a.productCount - b.productCount;
        break;
      case 'tier':
        // Premium comes first
        comparison = (a.tier === 'premium' ? 0 : 1) - (b.tier === 'premium' ? 0 : 1);
        break;
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Get premium brands from a list
 */
export function getPremiumBrands(brands: Brand[], limit?: number): Brand[] {
  const premium = brands.filter(brand => brand.tier === 'premium');
  const sorted = sortBrands(premium, 'productCount', 'desc');
  return limit ? sorted.slice(0, limit) : sorted;
}

/**
 * Get popular brands (by product count)
 */
export function getPopularBrands(brands: Brand[], limit: number = 10): Brand[] {
  return sortBrands(brands, 'productCount', 'desc').slice(0, limit);
}

export default {
  ALPHABET,
  groupBrandsByLetter,
  getAvailableLetters,
  filterBrands,
  sortBrands,
  getPremiumBrands,
  getPopularBrands,
};
