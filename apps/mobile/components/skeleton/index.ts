/**
 * Skeleton Components
 * Luxury shimmer loading placeholders for jewelry e-commerce
 * 
 * Features:
 * - Pearl-like luminescence effect with warm bone tones
 * - Accessibility support (reduced motion, aria-busy)
 * - Memoized for performance
 * - Staggered animations for visual delight
 */

// Base skeleton components
export {
  Skeleton,
  SkeletonText,
  SkeletonHeading,
  SkeletonLines,
  SkeletonImage,
  SkeletonCircle,
  SkeletonButton,
  SkeletonCard,
  SkeletonRow,
  SkeletonStack,
  SKELETON_COLORS,
  SKELETON_RADIUS,
  getStaggeredDelay,
  type SkeletonProps,
  type SkeletonTextProps,
  type SkeletonLinesProps,
  type SkeletonImageProps,
  type SkeletonCircleProps,
  type SkeletonButtonProps,
  type SkeletonCardProps,
  type SkeletonRowProps,
  type SkeletonStackProps,
} from './Skeleton';

// Product skeletons
export {
  ProductCardSkeleton,
  ProductCardSkeletonGrid,
  ProductCardSkeletonRow,
  type ProductCardSkeletonProps,
  type ProductCardSkeletonGridProps,
  type ProductCardSkeletonRowProps,
} from './ProductCardSkeleton';

export {
  ProductDetailSkeleton,
  type ProductDetailSkeletonProps,
} from './ProductDetailSkeleton';

// Cart skeleton
export {
  CartSkeleton,
  CartItemSkeleton,
  type CartSkeletonProps,
  type CartItemSkeletonProps,
} from './CartSkeleton';

// Collection skeletons
export {
  CollectionSkeleton,
  CollectionHeaderSkeleton,
  CollectionListItemSkeleton,
  CollectionsListSkeleton,
  type CollectionSkeletonProps,
  type CollectionListItemSkeletonProps,
  type CollectionsListSkeletonProps,
} from './CollectionSkeleton';

// Account skeleton
export {
  AccountSkeleton,
  AccountHeaderSkeleton,
  MenuItemSkeleton,
  MenuSectionSkeleton,
  type MenuItemSkeletonProps,
  type MenuSectionSkeletonProps,
} from './AccountSkeleton';

// Favorites skeleton
export {
  FavoritesSkeleton,
  type FavoritesSkeletonProps,
} from './FavoritesSkeleton';

// Orders skeleton
export {
  OrdersSkeleton,
  OrderItemSkeleton,
  type OrdersSkeletonProps,
  type OrderItemSkeletonProps,
} from './OrdersSkeleton';

// List skeletons (for addresses, payment methods, settings, profile)
export {
  ListSkeleton,
  ListItemSkeleton,
  CardListItemSkeleton,
  SettingsSkeleton,
  ProfileSkeleton,
  type ListSkeletonProps,
  type ListItemSkeletonProps,
  type CardListItemSkeletonProps,
} from './ListSkeleton';

// Checkout skeletons
export {
  CheckoutSkeleton,
  CheckoutSummarySkeleton,
  CheckoutShippingSkeleton,
  CheckoutPaymentSkeleton,
  type CheckoutSkeletonProps,
} from './CheckoutSkeleton';
