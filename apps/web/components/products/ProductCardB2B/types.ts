/**
 * ProductCardB2B Types
 *
 * Shared TypeScript interfaces for B2B product card components.
 * Defines props, stock statuses, and pricing display types.
 *
 * @packageDocumentation
 */

import type { Product, VolumeDiscount, StockStatus as B2BStockStatus } from '@/types';

// ============================================================================
// Stock Display Types
// ============================================================================

/**
 * Extended stock status for B2B display
 */
export type ProductStockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder';

/**
 * Stock information for a specific warehouse
 */
export interface StockInfo {
  /** Current available quantity */
  quantity: number;
  /** Stock status */
  status: ProductStockStatus;
  /** Warehouse name */
  warehouseName?: string;
  /** Warehouse code */
  warehouseCode?: string;
  /** Low stock threshold */
  lowStockThreshold?: number;
  /** Expected restock date */
  restockDate?: string;
}

// ============================================================================
// Price Display Types
// ============================================================================

/**
 * Price information for B2B display
 */
export interface PriceInfo {
  /** Unit price excluding tax */
  unitPriceHT: number;
  /** Unit price including tax */
  unitPriceTTC: number;
  /** Currency code */
  currency: string;
  /** Original price before discount (for strikethrough) */
  originalPriceHT?: number;
  /** Discount percentage applied */
  discountPercent?: number;
  /** Whether this is a promotional price */
  isPromotional?: boolean;
  /** Promotion end date */
  promotionEndsAt?: string;
  /** Volume discounts available */
  volumeDiscounts?: VolumeDiscount[];
  /** Unit label (e.g., 'unite', 'lot') */
  unitLabel?: string;
}

// ============================================================================
// Product Card Props
// ============================================================================

/**
 * Card display variant
 */
export type ProductCardVariant = 'grid' | 'list' | 'compact';

/**
 * Main ProductCardB2B props
 */
export interface ProductCardB2BProps {
  /** Product data */
  product: Product;
  /** Card display variant */
  variant: ProductCardVariant;
  /** Show stock information */
  showStock?: boolean;
  /** Show volume discount information */
  showVolumeDiscount?: boolean;
  /** Show action buttons (cart, favorite, compare) */
  showActions?: boolean;
  /** Callback when adding to cart */
  onAddToCart?: (productId: string, quantity: number) => void;
  /** Callback when toggling favorite */
  onToggleFavorite?: (productId: string) => void;
  /** Callback when toggling compare */
  onToggleCompare?: (productId: string) => void;
  /** Whether product is being compared */
  isComparing?: boolean;
  /** Whether product is in favorites */
  isFavorite?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Priority loading for images */
  priority?: boolean;
}

// ============================================================================
// Sub-Component Props
// ============================================================================

/**
 * ProductCardPrice component props
 */
export interface ProductCardPriceProps {
  /** Price information */
  price: PriceInfo;
  /** Show volume discount tiers */
  showVolumeDiscount?: boolean;
  /** Current quantity (for volume discount calculation) */
  quantity?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

/**
 * ProductCardStock component props
 */
export interface ProductCardStockProps {
  /** Stock information */
  stock: StockInfo;
  /** Display mode */
  mode?: 'badge' | 'inline' | 'detailed';
  /** Show warehouse info */
  showWarehouse?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ProductCardActions component props
 */
export interface ProductCardActionsProps {
  /** Product ID */
  productId: string;
  /** Current quantity in selector */
  quantity: number;
  /** Callback to change quantity */
  onQuantityChange: (quantity: number) => void;
  /** Callback when adding to cart */
  onAddToCart?: () => void;
  /** Callback when toggling favorite */
  onToggleFavorite?: () => void;
  /** Callback when toggling compare */
  onToggleCompare?: () => void;
  /** Whether product is in favorites */
  isFavorite?: boolean;
  /** Whether product is being compared */
  isComparing?: boolean;
  /** Maximum quantity available */
  maxQuantity?: number;
  /** Minimum quantity */
  minQuantity?: number;
  /** Quantity step */
  quantityStep?: number;
  /** Layout variant */
  layout?: 'horizontal' | 'vertical' | 'compact';
  /** Show only essential actions */
  minimal?: boolean;
  /** Whether the product is out of stock */
  isOutOfStock?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Grid Variant Props
// ============================================================================

/**
 * ProductCardGrid component props
 */
export interface ProductCardGridProps extends Omit<ProductCardB2BProps, 'variant'> {
  /** Override price info (if not using context) */
  priceInfo?: PriceInfo;
  /** Override stock info (if not using context) */
  stockInfo?: StockInfo;
}

// ============================================================================
// List Variant Props
// ============================================================================

/**
 * ProductCardList component props
 */
export interface ProductCardListProps extends Omit<ProductCardB2BProps, 'variant'> {
  /** Override price info (if not using context) */
  priceInfo?: PriceInfo;
  /** Override stock info (if not using context) */
  stockInfo?: StockInfo;
  /** Show full description */
  showDescription?: boolean;
}

// ============================================================================
// Compact Variant Props
// ============================================================================

/**
 * ProductCardCompact component props
 */
export interface ProductCardCompactProps extends Omit<ProductCardB2BProps, 'variant'> {
  /** Override price info (if not using context) */
  priceInfo?: PriceInfo;
  /** Override stock info (if not using context) */
  stockInfo?: StockInfo;
  /** Selectable for bulk actions */
  selectable?: boolean;
  /** Whether item is selected */
  isSelected?: boolean;
  /** Callback when selection changes */
  onSelectionChange?: (selected: boolean) => void;
}

// ============================================================================
// Mock Data Helpers
// ============================================================================

/**
 * Mock product for development/testing
 */
export interface MockProductB2B extends Product {
  /** Brand name */
  brand: string;
  /** EAN code */
  ean: string;
  /** Reference code */
  reference: string;
}

/**
 * Create mock price info
 */
export function createMockPriceInfo(basePrice: number = 12.50): PriceInfo {
  return {
    unitPriceHT: basePrice,
    unitPriceTTC: basePrice * 1.2,
    currency: 'EUR',
    originalPriceHT: basePrice * 1.15,
    discountPercent: 13,
    volumeDiscounts: [
      { minQuantity: 5, discountPercent: 5, label: 'Lot de 5' },
      { minQuantity: 10, discountPercent: 10, label: 'Lot de 10' },
      { minQuantity: 25, discountPercent: 15, label: 'Lot de 25' },
    ],
    unitLabel: 'unite',
  };
}

/**
 * Create mock stock info
 */
export function createMockStockInfo(quantity: number = 152): StockInfo {
  let status: ProductStockStatus = 'in_stock';
  if (quantity === 0) status = 'out_of_stock';
  else if (quantity <= 10) status = 'low_stock';

  return {
    quantity,
    status,
    warehouseName: 'Paris Est',
    warehouseCode: 'PARIS-EST',
    lowStockThreshold: 10,
  };
}

/**
 * Create mock B2B product
 */
export function createMockProductB2B(overrides: Partial<MockProductB2B> = {}): MockProductB2B {
  return {
    id: 'prod_001',
    reference: 'ABC-123',
    name: 'Bracelet Or 18K - Maille Figaro',
    nameEn: 'Gold 18K Bracelet - Figaro Link',
    slug: 'bracelet-or-18k-maille-figaro',
    description: 'Bracelet en or 18 carats avec maille figaro, finition brillante.',
    shortDescription: 'Bracelet or 18K maille figaro',
    price: 450,
    isPriceTTC: false,
    images: ['/images/products/bracelet-or-1.jpg'],
    categoryId: 'cat_bracelets',
    category: {
      id: 'cat_bracelets',
      name: 'Bracelets',
      slug: 'bracelets',
      description: 'Collection de bracelets',
      image: '/images/categories/bracelets.jpg',
      productCount: 45,
    },
    collection: 'Automne/Hiver',
    style: 'Classique',
    materials: ['Or 18K'],
    weight: 12.5,
    weightUnit: 'g',
    brand: 'Maison Bijoux',
    origin: 'France',
    warranty: 24,
    stock: 152,
    isAvailable: true,
    featured: true,
    isNew: false,
    createdAt: '2024-01-15T10:00:00Z',
    ean: '3701234567890',
    ...overrides,
  };
}
