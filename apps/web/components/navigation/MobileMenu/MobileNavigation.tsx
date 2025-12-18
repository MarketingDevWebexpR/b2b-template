'use client';

/**
 * MobileNavigation Component
 *
 * Wrapper component that connects MobileDrawer to the categories API.
 * Handles data fetching and transformation for the mobile menu.
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
 * Transform CategoryTreeNode to CategoryData format for mobile menu
 */
/**
 * Build hierarchical URL path for a category
 * Uses ancestor_handles to construct full path like /c/bijoux/colliers/or
 */
function buildCategoryPath(node: CategoryTreeNode): string {
  const handles = node.ancestor_handles && node.ancestor_handles.length > 0
    ? [...node.ancestor_handles, node.handle]
    : [node.handle];
  return `/categorie/${handles.join('/')}`;
}

function transformToMobileCategoryData(node: CategoryTreeNode): CategoryData {
  return {
    id: node.id,
    name: node.name,
    href: buildCategoryPath(node),
    icon: node.icon || undefined,
    productCount: node.product_count,
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
