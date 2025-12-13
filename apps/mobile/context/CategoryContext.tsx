import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Category } from '@bijoux/types';
import { api } from '@/lib/api';

interface CategoryContextType {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  getCategoryIndex: (categoryId: string) => number;
  getCategoryBySlug: (slug: string) => Category | undefined;
  getCategoryById: (id: string) => Category | undefined;
  refetch: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Impossible de charger les catégories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Get consistent index for a category (1-based for display)
  const getCategoryIndex = useCallback(
    (categoryId: string): number => {
      const index = categories.findIndex((c) => c.id === categoryId);
      return index >= 0 ? index + 1 : 0;
    },
    [categories]
  );

  // Get category by slug
  const getCategoryBySlug = useCallback(
    (slug: string): Category | undefined => {
      return categories.find((c) => c.slug === slug);
    },
    [categories]
  );

  // Get category by ID
  const getCategoryById = useCallback(
    (id: string): Category | undefined => {
      return categories.find((c) => c.id === id);
    },
    [categories]
  );

  return (
    <CategoryContext.Provider
      value={{
        categories,
        isLoading,
        error,
        getCategoryIndex,
        getCategoryBySlug,
        getCategoryById,
        refetch: fetchCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
}
