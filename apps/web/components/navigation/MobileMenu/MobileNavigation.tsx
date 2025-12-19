'use client';

/**
 * MobileNavigation Component
 *
 * Wrapper component that connects MobileDrawer to the categories API.
 * Handles data fetching and transformation for the mobile menu.
 *
 * Compatible with App Search v3 category schema:
 * - depth: 0-4 indicating hierarchy level (supports 5-level navigation)
 * - parent_category_id: reference to parent
 * - path: full path like "Plomberie > Robinetterie > Mitigeurs"
 * - ancestor_handles/ancestor_names: for URL and breadcrumb construction
 * - product_count: total products including descendants
 */

import { memo, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCategories } from '@/hooks/use-categories';
import { MobileDrawer, DefaultFooterContent } from './MobileDrawer';
import type { CategoryData } from './NavigationPanel';
import type { CategoryTreeNode } from '@/types/category';

// ============================================================================
// Types
// ============================================================================

export interface MobileNavigationProps {
  /** Root menu title */
  rootTitle?: string;
}

// ============================================================================
// Transform Functions
// ============================================================================

/**
 * Build hierarchical URL path for a category using v3 ancestor_handles
 * Constructs full path like /categorie/bijoux/colliers/or
 *
 * @param node - Category tree node with v3 fields
 * @returns Full URL path for the category
 */
function buildCategoryPath(node: CategoryTreeNode): string {
  // Use ancestor_handles from v3 API if available for accurate path construction
  const handles = node.ancestor_handles && node.ancestor_handles.length > 0
    ? [...node.ancestor_handles, node.handle]
    : [node.handle];
  return `/categorie/${handles.join('/')}`;
}

/**
 * Transform CategoryTreeNode to CategoryData format for mobile menu
 * Maps v3 fields: depth, path, ancestor_handles, product_count
 *
 * @param node - Category tree node from API
 * @returns CategoryData for mobile navigation
 */
function transformToMobileCategoryData(node: CategoryTreeNode): CategoryData {
  return {
    id: node.id,
    name: node.name,
    href: buildCategoryPath(node),
    icon: node.icon || undefined,
    productCount: node.product_count,
    // Recursively transform children (supports full 5-level hierarchy L1-L5)
    children: node.children?.map(transformToMobileCategoryData),
  };
}

// ============================================================================
// Component
// ============================================================================

/**
 * MobileNavigation
 *
 * Connects the MobileDrawer to the categories API.
 * Provides category data and navigation handling.
 *
 * @example
 * ```tsx
 * <MobileNavigation rootTitle="Catalogue" />
 * ```
 */
const MobileNavigation = memo(function MobileNavigation({
  rootTitle = 'Catalogue',
}: MobileNavigationProps) {
  const router = useRouter();
  const { tree, byId, isLoading } = useCategories();

  // Transform tree to mobile format
  const mobileCategories = useMemo(() => {
    if (!tree) return [];
    return tree.map(transformToMobileCategoryData);
  }, [tree]);

  // Create a flat map for quick lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, CategoryData>();

    function addToMap(category: CategoryData) {
      map.set(category.id, category);
      if (category.children) {
        category.children.forEach(addToMap);
      }
    }

    mobileCategories.forEach(addToMap);
    return map;
  }, [mobileCategories]);

  // Get children for a category ID
  const getChildCategories = useCallback(
    (categoryId: string): CategoryData[] => {
      const category = categoryMap.get(categoryId);
      return category?.children || [];
    },
    [categoryMap]
  );

  // Handle navigation
  const handleNavigate = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );

  // Loading state - show empty drawer
  if (isLoading || mobileCategories.length === 0) {
    return (
      <MobileDrawer
        categories={[]}
        rootTitle={rootTitle}
      />
    );
  }

  return (
    <MobileDrawer
      categories={mobileCategories}
      getChildCategories={getChildCategories}
      onNavigate={handleNavigate}
      rootTitle={rootTitle}
      footerContent={
        <DefaultFooterContent
          phoneNumber="01 23 45 67 89"
          links={[
            { label: 'Mon compte', href: '/compte' },
            { label: 'Mes devis', href: '/devis' },
            { label: 'Aide', href: '/aide' },
          ]}
        />
      }
    />
  );
});

export { MobileNavigation };
export default MobileNavigation;
