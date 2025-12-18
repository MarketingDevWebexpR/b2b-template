// B2B E-commerce Homepage - Primary Components

// SSR-compatible HeroCarousel (recommended - prevents content flash)
export { HeroCarouselSSR, type HeroCarouselSSRProps } from './HeroCarouselSSR';

// Legacy HeroCarousel (client-side fetch - may cause content flash)
export { HeroCarousel, type HeroCarouselProps, type HeroSlide } from './HeroCarousel';
export { ProductCarouselSection, type ProductCarouselSectionProps, type CarouselProduct } from './ProductCarouselSection';
export { QuickLinksBar, type QuickLinksBarProps, type QuickLinkCategory } from './QuickLinksBar';
export { ServicesHighlights, type ServicesHighlightsProps, type ServiceItem } from './ServicesHighlights';
export { CategoryShowcaseEcom, type CategoryShowcaseEcomProps, type CategoryCard } from './CategoryShowcaseEcom';
export { Newsletter } from './Newsletter';
export { PromoBanner, type PromoBannerProps } from './PromoBanner';

// Categories Section - New "Nos Categories" showcase
export { CategoriesSection, type CategoriesSectionProps } from './CategoriesSection';
export { CategoryCard as CategoryCardHover, type CategoryCardProps, type CategoryCardData } from './CategoryCard';
export { SectionHeader, type SectionHeaderProps } from './SectionHeader';

// B2B Dashboard style (alternative layouts)
export { B2BHero, type B2BHeroProps } from './B2BHero';
export { CategoryGrid, type CategoryGridProps } from './CategoryGrid';
export { BrandShowcase, type BrandShowcaseProps } from './BrandShowcase';
export { B2BServices, type B2BServicesProps } from './B2BServices';
export { TrendingProductsB2B, type TrendingProductsB2BProps } from './TrendingProductsB2B';
