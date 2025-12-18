/**
 * Brand Components Index
 *
 * Exports all brand-related components for the B2B jewelry e-commerce platform.
 *
 * @packageDocumentation
 */

// Main components
export { BrandCard, type BrandCardProps } from './BrandCard';
export { BrandHero, type BrandHeroProps } from './BrandHero';
export { BrandFilter, type BrandFilterProps } from './BrandFilter';
export { BrandGrid, type BrandGridProps } from './BrandGrid';
export { BrandProductsGrid, type BrandProductsGridProps, type BrandProduct } from './BrandProductsGrid';

// Server-side pagination components
export {
  BrandProductsSection,
  BrandProductsSectionLoading,
  type BrandProductsSectionProps,
} from './BrandProductsSection';

// Client-side interaction components
export {
  BrandProductsClient,
  type BrandProductsClientProps,
} from './BrandProductsClient';

// Default exports
export { default as BrandCardDefault } from './BrandCard';
export { default as BrandHeroDefault } from './BrandHero';
export { default as BrandFilterDefault } from './BrandFilter';
export { default as BrandGridDefault } from './BrandGrid';
export { default as BrandProductsGridDefault } from './BrandProductsGrid';
export { default as BrandProductsSectionDefault } from './BrandProductsSection';
export { default as BrandProductsClientDefault } from './BrandProductsClient';
