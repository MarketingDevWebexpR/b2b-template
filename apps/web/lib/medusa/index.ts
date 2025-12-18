/**
 * Medusa Library
 *
 * Exports for the Medusa storefront integration.
 *
 * @packageDocumentation
 */

export {
  MedusaClient,
  createMedusaClient,
  getMedusaClient,
  type MedusaClientConfig,
  type MedusaProduct,
  type MedusaVariant,
  type MedusaPrice,
  type MedusaCategory,
  type MedusaCollection,
  type ProductsResponse,
  type ProductResponse,
  type CategoriesResponse,
  type CategoryResponse,
} from './client';

export {
  adaptMedusaProduct,
  adaptProductImages,
  adaptMedusaCategory,
  adaptMedusaCategoryFull,
  getVariantImagesMap,
  formatMedusaPrice,
} from './adapters';
