/**
 * SEO Utilities Index
 *
 * Re-exports all SEO-related utilities for convenient imports.
 *
 * @packageDocumentation
 */

// Canonical URL helpers
export {
  getCanonicalUrl,
  getProductCanonicalUrl,
  getCategoryCanonicalUrl,
  getBrandCanonicalUrl,
  getSearchCanonicalUrl,
  getAlternateUrls,
  isIndexablePath,
  buildMetadataUrl,
  type CanonicalOptions,
  type AlternateUrl,
} from './canonical';

// Metadata generators
export {
  generateCategoryMetadata,
  generateBrandMetadata,
  generateProductMetadata,
  generateCollectionMetadata,
  generateSearchMetadata,
  defaultMetadata,
  type CategoryMetadataInput,
  type BrandMetadataInput,
  type ProductMetadataInput,
  type CollectionMetadataInput,
} from './metadata';
