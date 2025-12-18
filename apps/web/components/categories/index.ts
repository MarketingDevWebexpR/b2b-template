/**
 * Categories Components
 *
 * Components for displaying and navigating category hierarchies.
 * Supports up to 5 levels of depth with hierarchical URLs.
 *
 * @packageDocumentation
 */

// Existing Components
export { CategoryCard } from './CategoryCard';
export { CategoryFilters } from './CategoryFilters';
export { CategoryFiltersLight } from './CategoryFiltersLight';
export { CategoryProductsGrid } from './CategoryProductsGrid';

// Tree Navigation
export { CategoryTree } from './CategoryTree';
export type { CategoryTreeProps } from './CategoryTree';

// Dynamic Breadcrumbs
export { CategoryBreadcrumbsDynamic } from './CategoryBreadcrumbsDynamic';
export type { CategoryBreadcrumbsDynamicProps } from './CategoryBreadcrumbsDynamic';

// Enhanced Hero
export { CategoryHeroEnhanced } from './CategoryHeroEnhanced';
export type { CategoryHeroEnhancedProps } from './CategoryHeroEnhanced';

// Subcategories Grid
export { SubcategoriesGrid } from './SubcategoriesGrid';
export type { SubcategoriesGridProps } from './SubcategoriesGrid';

// Subcategories Tags (Compact)
export { SubcategoriesTags } from './SubcategoriesTags';
export type { SubcategoriesTagsProps } from './SubcategoriesTags';

// Subcategories Tags Inline (Ultra-Compact)
export { SubcategoriesTagsInline } from './SubcategoriesTagsInline';
export type { SubcategoriesTagsInlineProps } from './SubcategoriesTagsInline';

// Sidebar Navigation
export { CategorySidebar } from './CategorySidebar';
export type { CategorySidebarProps } from './CategorySidebar';

// Horizontal Navigation Bar (Compact)
export { CategoryNavBar } from './CategoryNavBar';
export type { CategoryNavBarProps } from './CategoryNavBar';

// Product Listing Components
export { CategoryProductsSection } from './CategoryProductsSection';
export type {
  CategoryProductsSectionProps,
  TransformedProduct,
  FacetOption,
  Facets,
  ProductsResponse,
} from './CategoryProductsSection';

export { ProductFilters } from './ProductFilters';
export type { ProductFiltersProps } from './ProductFilters';

export { ProductSortSelect } from './ProductSortSelect';
export type { ProductSortSelectProps, SortOption } from './ProductSortSelect';

export { ProductGridSkeleton, ProductGridSkeletonCompact } from './ProductGridSkeleton';
export type { ProductGridSkeletonProps } from './ProductGridSkeleton';

export { PaginationClient } from './PaginationClient';
export type { PaginationClientProps } from './PaginationClient';
