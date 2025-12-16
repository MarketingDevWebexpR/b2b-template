// Layout Components
export { Logo, LogoText, LogoMinimal } from './Logo';
export { FooterEcom, type FooterEcomProps } from './FooterEcom';

// B2B Header Components (legacy dashboard style)
export {
  B2BHeader,
  B2BHeaderSpacer,
  HeaderSearch,
  HeaderQuickAccess,
  WarehouseSelector,
  MegaMenu,
  MegaMenuColumn,
  MegaMenuFeatured,
} from './B2BHeader';

export type {
  B2BHeaderProps,
  HeaderSearchProps,
  HeaderQuickAccessProps,
  WarehouseSelectorProps,
  MegaMenuProps,
  Category,
  SubCategory,
  CategoryItem,
  FeaturedProduct,
  NavLink,
} from './B2BHeader';

// B2B E-commerce Header (main header for shop)
export {
  B2BHeaderEcom,
  B2BHeaderEcomSpacer,
  PromoBanner,
  HeaderTop,
  HeaderNav,
  MegaMenuEcom,
  MobileMenuEcom,
} from './B2BHeaderEcom';

export type { B2BHeaderEcomProps } from './B2BHeaderEcom';
