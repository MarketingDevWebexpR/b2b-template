/**
 * ProductDetail Components
 *
 * B2B Product Detail Page Components for the jewelry e-commerce platform.
 * Includes gallery, pricing, variants, actions, tabs, and related products.
 *
 * @packageDocumentation
 */

// Gallery with zoom and lightbox
export { ProductGallery } from './ProductGallery';
export type { ProductGalleryProps, GalleryMedia } from './ProductGallery';

// Product information display
export { ProductInfo } from './ProductInfo';
export type { ProductInfoProps, ProductBadge, BreadcrumbItem } from './ProductInfo';

// B2B pricing with volume discounts
export { ProductPricing } from './ProductPricing';
export type { ProductPricingProps } from './ProductPricing';

// Variant selection (size, color, material)
export { ProductVariants } from './ProductVariants';
export type {
  ProductVariantsProps,
  ProductVariant,
  VariantAttribute,
} from './ProductVariants';

// Action buttons (cart, wishlist, quote)
export { ProductActions } from './ProductActions';
export type { ProductActionsProps } from './ProductActions';

// Tabbed content (description, specs, documents, reviews)
export { ProductTabs } from './ProductTabs';
export type {
  ProductTabsProps,
  TabId,
  ProductSpecification,
  ProductDocument,
  ProductReview,
  ProductQuestion,
} from './ProductTabs';

// Related products sections
export { RelatedProducts } from './RelatedProducts';
export type {
  RelatedProductsProps,
  RelatedProduct,
  RelatedSectionType,
  BoughtTogetherBundle,
} from './RelatedProducts';
