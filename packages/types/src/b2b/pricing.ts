/**
 * Pricing Types
 *
 * Defines types for B2B pricing, price lists, volume discounts, and personalized pricing.
 * Supports multi-tier pricing, customer-specific rates, and promotional pricing.
 *
 * @packageDocumentation
 */

// ============================================================================
// Price List Types
// ============================================================================

/**
 * Type of price list
 */
export type PriceListType =
  | 'standard'      // Default catalog pricing
  | 'contract'      // Negotiated contract pricing
  | 'promotional'   // Time-limited promotions
  | 'tier'          // Volume/tier-based pricing
  | 'seasonal';     // Seasonal pricing

/**
 * Status of a price list
 */
export type PriceListStatus = 'active' | 'inactive' | 'scheduled' | 'expired';

/**
 * Currency code (ISO 4217)
 */
export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'CAD';

// ============================================================================
// Volume Discounts
// ============================================================================

/**
 * Volume discount tier
 */
export interface VolumeDiscount {
  /** Minimum quantity to activate this tier */
  minQuantity: number;
  /** Maximum quantity for this tier (optional) */
  maxQuantity?: number;
  /** Discount percentage (0-100) */
  discountPercent?: number;
  /** Fixed unit price (alternative to percentage) */
  fixedUnitPrice?: number;
  /** Label for display (e.g., "Lot de 10") */
  label?: string;
}

/**
 * Volume discount configuration for a product
 */
export interface VolumeDiscountConfig {
  /** Product ID */
  productId: string;
  /** Volume discount tiers */
  tiers: VolumeDiscount[];
  /** Whether tiers are cumulative */
  isCumulative: boolean;
  /** Minimum order quantity */
  minOrderQuantity: number;
  /** Order quantity step (e.g., multiples of 5) */
  quantityStep: number;
}

// ============================================================================
// Unit of Measure
// ============================================================================

/**
 * Unit of measure for pricing
 */
export type UnitOfMeasure =
  | 'unit'           // Single item
  | 'pack'           // Pack/bundle
  | 'box'            // Box
  | 'case'           // Case
  | 'pallet'         // Pallet
  | 'kg'             // Kilogram
  | 'g'              // Gram
  | 'm'              // Meter
  | 'm2'             // Square meter
  | 'm3'             // Cubic meter
  | 'l'              // Liter
  | 'ml';            // Milliliter

/**
 * Unit of measure configuration
 */
export interface UnitConfig {
  /** Primary unit */
  baseUnit: UnitOfMeasure;
  /** Conversion factor from base unit */
  conversionFactor: number;
  /** Number of items per unit (e.g., 10 per pack) */
  quantityPerUnit: number;
  /** Display label */
  displayLabel: string;
  /** Short label */
  shortLabel: string;
}

// ============================================================================
// Product Pricing
// ============================================================================

/**
 * Tax rate configuration
 */
export interface TaxRate {
  /** Tax rate percentage */
  rate: number;
  /** Tax type/name */
  name: string;
  /** Whether price includes tax */
  isIncluded: boolean;
}

/**
 * Base product price
 */
export interface BasePrice {
  /** Unit price excluding tax */
  priceHT: number;
  /** Unit price including tax */
  priceTTC: number;
  /** Currency */
  currency: CurrencyCode;
  /** Tax rate */
  taxRate: TaxRate;
  /** Unit of measure */
  unit: UnitOfMeasure;
  /** Unit configuration */
  unitConfig?: UnitConfig;
}

/**
 * Product pricing with all variations
 */
export interface ProductPricing {
  /** Product ID */
  productId: string;
  /** Product SKU */
  sku: string;
  /** Variant ID (if applicable) */
  variantId?: string;
  /** Price list ID */
  priceListId: string;
  /** Base price */
  basePrice: BasePrice;
  /** Volume discounts */
  volumeDiscounts?: VolumeDiscount[];
  /** Pack size (if sold in packs) */
  packSize?: number;
  /** Pack price (if different from unit price * packSize) */
  packPrice?: number;
  /** Minimum order quantity */
  minOrderQuantity: number;
  /** Quantity step (multiples) */
  quantityStep: number;
  /** Price valid from */
  validFrom?: string;
  /** Price valid until */
  validUntil?: string;
  /** Last price update */
  updatedAt: string;
}

// ============================================================================
// Price List Entity
// ============================================================================

/**
 * Price list entity
 */
export interface PriceList {
  /** Unique identifier */
  id: string;
  /** Internal code */
  code: string;
  /** Display name */
  name: string;
  /** Description */
  description?: string;
  /** Type of price list */
  type: PriceListType;
  /** Status */
  status: PriceListStatus;
  /** Currency */
  currency: CurrencyCode;
  /** Priority (higher = more important) */
  priority: number;
  /** Whether this is the default price list */
  isDefault: boolean;
  /** Valid from date */
  validFrom?: string;
  /** Valid until date */
  validUntil?: string;
  /** Assigned company IDs */
  companyIds?: string[];
  /** Assigned company tier */
  companyTier?: string;
  /** Discount percentage from base price */
  globalDiscount?: number;
  /** Markup percentage from base price */
  globalMarkup?: number;
  /** Rounding rule */
  roundingRule?: PriceRoundingRule;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Price rounding rule
 */
export interface PriceRoundingRule {
  /** Round to nearest value (e.g., 0.05 for 5 cents) */
  roundTo: number;
  /** Rounding direction */
  direction: 'up' | 'down' | 'nearest';
}

/**
 * Price list summary for lists
 */
export interface PriceListSummary {
  id: string;
  code: string;
  name: string;
  type: PriceListType;
  status: PriceListStatus;
  currency: CurrencyCode;
  companiesCount: number;
  productsCount: number;
}

// ============================================================================
// Customer-Specific Pricing
// ============================================================================

/**
 * Customer-specific price override
 */
export interface CustomerPriceOverride {
  /** Unique identifier */
  id: string;
  /** Company ID */
  companyId: string;
  /** Product ID */
  productId: string;
  /** SKU */
  sku: string;
  /** Negotiated unit price (HT) */
  negotiatedPriceHT: number;
  /** Original price (HT) for reference */
  originalPriceHT: number;
  /** Discount percentage from original */
  discountPercent: number;
  /** Contract reference */
  contractRef?: string;
  /** Valid from */
  validFrom?: string;
  /** Valid until */
  validUntil?: string;
  /** Notes */
  notes?: string;
  /** Created by employee ID */
  createdBy: string;
  /** Creation timestamp */
  createdAt: string;
}

// ============================================================================
// Calculated Price
// ============================================================================

/**
 * Fully calculated price for display
 */
export interface CalculatedPrice {
  /** Product ID */
  productId: string;
  /** Variant ID */
  variantId?: string;
  /** Unit price excluding tax */
  unitPriceHT: number;
  /** Unit price including tax */
  unitPriceTTC: number;
  /** Currency */
  currency: CurrencyCode;
  /** Tax rate applied */
  taxRate: number;
  /** Original price before discounts */
  originalPriceHT?: number;
  /** Discount percentage applied */
  discountPercent?: number;
  /** Volume discount applicable */
  volumeDiscountApplied?: VolumeDiscount;
  /** Price source (which price list/override) */
  priceSource: {
    type: 'price_list' | 'customer_override' | 'contract';
    id: string;
    name: string;
  };
  /** Whether price is negotiated/special */
  isNegotiated: boolean;
  /** Whether price is promotional */
  isPromotional: boolean;
  /** Promotion end date */
  promotionEndsAt?: string;
  /** Unit of measure */
  unit: UnitOfMeasure;
  /** Unit label */
  unitLabel: string;
  /** Pack configuration (if applicable) */
  pack?: {
    size: number;
    priceHT: number;
    priceTTC: number;
    savingsPercent: number;
  };
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Input for creating a price list
 */
export interface CreatePriceListInput {
  code: string;
  name: string;
  description?: string;
  type: PriceListType;
  currency: CurrencyCode;
  priority?: number;
  isDefault?: boolean;
  validFrom?: string;
  validUntil?: string;
  companyIds?: string[];
  companyTier?: string;
  globalDiscount?: number;
  globalMarkup?: number;
  roundingRule?: PriceRoundingRule;
}

/**
 * Input for updating a price list
 */
export interface UpdatePriceListInput {
  name?: string;
  description?: string;
  status?: PriceListStatus;
  priority?: number;
  isDefault?: boolean;
  validFrom?: string;
  validUntil?: string;
  companyIds?: string[];
  companyTier?: string;
  globalDiscount?: number;
  globalMarkup?: number;
  roundingRule?: PriceRoundingRule;
}

/**
 * Input for setting product price in a price list
 */
export interface SetProductPriceInput {
  productId: string;
  variantId?: string;
  priceHT: number;
  taxRate?: number;
  volumeDiscounts?: VolumeDiscount[];
  packSize?: number;
  packPrice?: number;
  minOrderQuantity?: number;
  quantityStep?: number;
  validFrom?: string;
  validUntil?: string;
}

/**
 * Input for creating customer price override
 */
export interface CreateCustomerPriceInput {
  companyId: string;
  productId: string;
  negotiatedPriceHT: number;
  contractRef?: string;
  validFrom?: string;
  validUntil?: string;
  notes?: string;
}

// ============================================================================
// Filters
// ============================================================================

/**
 * Filters for price list search
 */
export interface PriceListFilters {
  /** Search by name or code */
  search?: string;
  /** Filter by type */
  types?: PriceListType[];
  /** Filter by status */
  statuses?: PriceListStatus[];
  /** Filter by currency */
  currency?: CurrencyCode;
  /** Filter by company ID */
  companyId?: string;
  /** Only show active/valid price lists */
  activeOnly?: boolean;
}

/**
 * Request for price calculation
 */
export interface PriceCalculationRequest {
  /** Product ID */
  productId: string;
  /** Variant ID */
  variantId?: string;
  /** Quantity for volume discount calculation */
  quantity?: number;
  /** Company ID for customer-specific pricing */
  companyId?: string;
  /** Warehouse ID for location-specific pricing */
  warehouseId?: string;
  /** Currency override */
  currency?: CurrencyCode;
}
