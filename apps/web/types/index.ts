// Re-export all types from shared package
export * from '@bijoux/types';

// CMS types
export * from './cms';

// Category types (Search Index)
// Note: Using explicit exports to avoid conflict with Category from @bijoux/types
export {
  type IndexedCategory,
  type CategoryTreeNode,
  type CategoryResponse,
  type SearchCategoryHit,
  type SearchCategoryResponse,
  type CategoryIconName,
  type CategoryFilterOptions,
  type CategoryNavItem,
  type CategoryBreadcrumb,
  type CatalogCategory,
} from './category';

// Medusa v2 Product Types
export * from './medusa';

// B2B Product Types (extended with rich metadata)
export * from './product-b2b';
