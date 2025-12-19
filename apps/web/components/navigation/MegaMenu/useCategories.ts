'use client';

/**
 * useCategories Hook for MegaMenu
 *
 * Fetches and transforms category data from the categories API.
 * Provides hierarchical category structure with 5 levels of nesting.
 *
 * Compatible with App Search v3 category schema:
 * - depth: 0-4 indicating hierarchy level
 * - parent_category_id: reference to parent
 * - path: full path like "Plomberie > Robinetterie > Mitigeurs"
 * - ancestor_handles/ancestor_names: for breadcrumb construction
 * - product_count: total products including descendants
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import type { CategoryTreeNode, CategoryResponse } from '@/types/category';
import type { CategoryLevel1, CategoryLevel2, CategoryLevel3, CategoryLevel4, CategoryLevel5 } from './types';

// ============================================================================
// Cache Implementation
// ============================================================================

interface CacheEntry {
  data: CategoryLevel1[];
  timestamp: number;
}

// Simple in-memory cache shared across hook instances
const cache: {
  entry: CacheEntry | null;
  fetchPromise: Promise<CategoryLevel1[]> | null;
} = {
  entry: null,
  fetchPromise: null,
};

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// Transform Functions
// ============================================================================

/**
 * Transform CategoryTreeNode to CategoryLevel5 (leaf node, depth=4)
 * Maps v3 fields: depth, path, ancestor_handles, product_count
 */
function transformToLevel5(node: CategoryTreeNode): CategoryLevel5 {
  return {
    id: node.id,
    name: node.name,
    slug: node.handle,
    productCount: node.product_count,
    depth: node.depth,
    path: node.path || node.full_path,
    ancestorHandles: node.ancestor_handles,
  };
}

/**
 * Transform CategoryTreeNode to CategoryLevel4 (depth=3)
 * Maps v3 fields: depth, path, ancestor_handles, product_count
 */
function transformToLevel4(node: CategoryTreeNode): CategoryLevel4 {
  return {
    id: node.id,
    name: node.name,
    slug: node.handle,
    icon: node.icon || undefined,
    productCount: node.product_count,
    depth: node.depth,
    path: node.path || node.full_path,
    ancestorHandles: node.ancestor_handles,
    children: node.children?.map(transformToLevel5),
  };
}

/**
 * Transform CategoryTreeNode to CategoryLevel3 (depth=2)
 * Maps v3 fields: depth, path, ancestor_handles, product_count
 */
function transformToLevel3(node: CategoryTreeNode): CategoryLevel3 {
  return {
    id: node.id,
    name: node.name,
    slug: node.handle,
    icon: node.icon || undefined,
    productCount: node.product_count,
    depth: node.depth,
    path: node.path || node.full_path,
    ancestorHandles: node.ancestor_handles,
    children: node.children?.map(transformToLevel4),
  };
}

/**
 * Transform CategoryTreeNode to CategoryLevel2 (depth=1)
 * Maps v3 fields: depth, path, ancestor_handles, product_count
 */
function transformToLevel2(node: CategoryTreeNode): CategoryLevel2 {
  return {
    id: node.id,
    name: node.name,
    slug: node.handle,
    icon: node.icon || undefined,
    productCount: node.product_count,
    depth: node.depth,
    path: node.path || node.full_path,
    ancestorHandles: node.ancestor_handles,
    children: node.children?.map(transformToLevel3),
  };
}

/**
 * Transform CategoryTreeNode to CategoryLevel1 (depth=0)
 * Maps v3 fields: depth, path, ancestor_handles, product_count
 */
function transformToLevel1(node: CategoryTreeNode): CategoryLevel1 {
  return {
    id: node.id,
    name: node.name,
    slug: node.handle,
    icon: node.icon || undefined,
    description: node.description || undefined,
    productCount: node.product_count,
    depth: node.depth,
    path: node.path || node.full_path,
    ancestorHandles: node.ancestor_handles,
    children: node.children?.map(transformToLevel2),
  };
}

/**
 * Transform API response tree to MegaMenu format
 * Preserves all v3 hierarchy fields for proper 5-level navigation
 */
function transformCategories(tree: CategoryTreeNode[]): CategoryLevel1[] {
  return tree.map(transformToLevel1);
}

// ============================================================================
// Fetch Function
// ============================================================================

async function fetchCategoriesFromAPI(): Promise<CategoryLevel1[]> {
  const response = await fetch('/api/categories', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }

  const data: CategoryResponse = await response.json();

  // Transform tree structure to MegaMenu format
  return transformCategories(data.tree);
}

// ============================================================================
// Hook
// ============================================================================

export interface UseCategoriesReturn {
  /** List of root categories (Level 1) */
  categories: CategoryLevel1[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Refetch categories */
  refetch: () => void;
}

/**
 * Hook to fetch and manage category data for MegaMenu
 *
 * @returns Category data and state
 *
 * @example
 * const { categories, isLoading } = useCategories();
 */
export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<CategoryLevel1[]>(
    cache.entry?.data ?? []
  );
  const [isLoading, setIsLoading] = useState(!cache.entry);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const doFetch = async () => {
    // Check if we already have a fresh cache
    if (cache.entry) {
      const age = Date.now() - cache.entry.timestamp;
      if (age < STALE_TIME) {
        setCategories(cache.entry.data);
        setIsLoading(false);
        return;
      }
    }

    // Check if another fetch is in progress
    if (cache.fetchPromise) {
      try {
        const result = await cache.fetchPromise;
        if (mountedRef.current) {
          setCategories(result);
          setIsLoading(false);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err : new Error('Fetch failed'));
          setIsLoading(false);
        }
      }
      return;
    }

    // Start new fetch
    setIsLoading(true);
    setError(null);

    cache.fetchPromise = fetchCategoriesFromAPI();

    try {
      const result = await cache.fetchPromise;

      // Update cache
      cache.entry = {
        data: result,
        timestamp: Date.now(),
      };

      if (mountedRef.current) {
        setCategories(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
      }
    } finally {
      cache.fetchPromise = null;
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    doFetch();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refetch = () => {
    cache.entry = null;
    doFetch();
  };

  return useMemo(
    () => ({
      categories,
      isLoading,
      error,
      refetch,
    }),
    [categories, isLoading, error]
  );
}
