/**
 * SEO Components Index
 *
 * JSON-LD Schema components for structured data.
 *
 * @packageDocumentation
 */

// Schema Components
export { OrganizationSchema, type OrganizationSchemaProps } from './OrganizationSchema';
export { WebSiteSchema, type WebSiteSchemaProps } from './WebSiteSchema';
export { BrandSchema, type BrandSchemaProps } from './BrandSchema';
export { ProductSchema, type ProductSchemaProps, type ProductSchemaOffer } from './ProductSchema';
export {
  BreadcrumbSchema,
  type BreadcrumbSchemaProps,
  type BreadcrumbItem,
  buildCategoryBreadcrumbs,
  buildProductBreadcrumbs,
  buildSimpleBreadcrumbs,
} from './BreadcrumbSchema';
export {
  CollectionPageSchema,
  CategoryPageSchema,
  SearchResultsSchema,
  type CollectionPageSchemaProps,
  type CollectionProduct,
} from './CollectionPageSchema';
