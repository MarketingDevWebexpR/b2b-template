/**
 * Stock Types
 *
 * Defines types for multi-warehouse stock management in B2B e-commerce.
 * Supports real-time availability, stock reservations, and backorder handling.
 *
 * @packageDocumentation
 */

// ============================================================================
// Stock Status
// ============================================================================

/**
 * Stock availability status
 */
export type StockStatus =
  | 'in_stock'       // Available immediately
  | 'low_stock'      // Limited quantity
  | 'out_of_stock'   // Not available
  | 'backorder'      // Can be ordered, waiting for supply
  | 'discontinued'   // No longer available
  | 'preorder';      // Future availability

/**
 * Stock reservation status
 */
export type ReservationStatus =
  | 'pending'        // Reservation created
  | 'confirmed'      // Stock reserved
  | 'released'       // Reservation cancelled
  | 'fulfilled';     // Order completed

// ============================================================================
// Stock by Warehouse
// ============================================================================

/**
 * Stock information for a specific warehouse
 */
export interface WarehouseStock {
  /** Warehouse ID */
  warehouseId: string;
  /** Warehouse name (for display) */
  warehouseName: string;
  /** Warehouse code */
  warehouseCode: string;
  /** Available quantity */
  availableQuantity: number;
  /** Reserved quantity (pending orders) */
  reservedQuantity: number;
  /** Total physical quantity */
  physicalQuantity: number;
  /** Stock status */
  status: StockStatus;
  /** Low stock threshold */
  lowStockThreshold: number;
  /** Expected restock date */
  nextRestockDate?: string;
  /** Expected restock quantity */
  nextRestockQuantity?: number;
  /** Whether pickup is available at this warehouse */
  pickupAvailable: boolean;
  /** Pickup delay (e.g., "2h", "24h", "48h") */
  pickupDelay?: string;
  /** Pickup ready time (ISO 8601) */
  pickupReadyAt?: string;
  /** Whether delivery is available from this warehouse */
  deliveryAvailable: boolean;
  /** Estimated delivery delay (e.g., "24h", "2-3 jours") */
  deliveryDelay?: string;
  /** Last stock update timestamp */
  updatedAt: string;
}

/**
 * Complete stock information for a product across all warehouses
 */
export interface ProductStock {
  /** Product ID */
  productId: string;
  /** Product SKU */
  sku: string;
  /** Variant ID (if applicable) */
  variantId?: string;
  /** Global stock status (best available) */
  globalStatus: StockStatus;
  /** Total available quantity across all warehouses */
  totalAvailable: number;
  /** Stock by warehouse */
  warehouseStock: WarehouseStock[];
  /** Whether the product is available anywhere */
  isAvailable: boolean;
  /** Best warehouse for pickup (closest with stock) */
  bestPickupWarehouseId?: string;
  /** Best warehouse for delivery (fastest) */
  bestDeliveryWarehouseId?: string;
  /** Last global update timestamp */
  updatedAt: string;
}

// ============================================================================
// Stock Reservation
// ============================================================================

/**
 * Stock reservation for cart/order
 */
export interface StockReservation {
  /** Unique reservation ID */
  id: string;
  /** Product ID */
  productId: string;
  /** Variant ID */
  variantId?: string;
  /** SKU */
  sku: string;
  /** Warehouse ID where stock is reserved */
  warehouseId: string;
  /** Reserved quantity */
  quantity: number;
  /** Reservation status */
  status: ReservationStatus;
  /** Cart ID (if from cart) */
  cartId?: string;
  /** Order ID (if from order) */
  orderId?: string;
  /** Company ID */
  companyId: string;
  /** Employee ID who created reservation */
  employeeId: string;
  /** Reservation expiration time */
  expiresAt: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Reservation summary for a cart/order
 */
export interface ReservationSummary {
  /** Cart or Order ID */
  referenceId: string;
  /** Reference type */
  referenceType: 'cart' | 'order';
  /** Total items reserved */
  totalItems: number;
  /** Total quantity reserved */
  totalQuantity: number;
  /** Reservations by warehouse */
  reservationsByWarehouse: {
    warehouseId: string;
    warehouseName: string;
    itemCount: number;
    totalQuantity: number;
  }[];
  /** Items that couldn't be reserved */
  unavailableItems: {
    productId: string;
    sku: string;
    requestedQuantity: number;
    availableQuantity: number;
    reason: string;
  }[];
  /** Reservation expiration */
  expiresAt: string;
  /** Creation timestamp */
  createdAt: string;
}

// ============================================================================
// Stock Movement
// ============================================================================

/**
 * Type of stock movement
 */
export type StockMovementType =
  | 'receipt'        // Stock received from supplier
  | 'sale'           // Stock sold to customer
  | 'transfer'       // Transfer between warehouses
  | 'adjustment'     // Manual adjustment
  | 'return'         // Customer return
  | 'damage'         // Damaged goods
  | 'reservation'    // Reserved for order
  | 'release';       // Released reservation

/**
 * Stock movement record
 */
export interface StockMovement {
  /** Unique movement ID */
  id: string;
  /** Product ID */
  productId: string;
  /** SKU */
  sku: string;
  /** Warehouse ID */
  warehouseId: string;
  /** Movement type */
  type: StockMovementType;
  /** Quantity (positive or negative) */
  quantity: number;
  /** Stock before movement */
  previousQuantity: number;
  /** Stock after movement */
  newQuantity: number;
  /** Reference (order ID, transfer ID, etc.) */
  referenceId?: string;
  /** Reference type */
  referenceType?: string;
  /** Reason/notes */
  reason?: string;
  /** User who made the movement */
  createdBy: string;
  /** Creation timestamp */
  createdAt: string;
}

// ============================================================================
// Stock Alert
// ============================================================================

/**
 * Type of stock alert
 */
export type StockAlertType =
  | 'low_stock'           // Below threshold
  | 'out_of_stock'        // No stock available
  | 'restock_due'         // Expected restock approaching
  | 'overstock'           // Above maximum threshold
  | 'expiring_soon'       // Products expiring soon (if applicable)
  | 'reservation_expiring'; // Reservation about to expire

/**
 * Stock alert for monitoring
 */
export interface StockAlert {
  /** Alert ID */
  id: string;
  /** Alert type */
  type: StockAlertType;
  /** Severity level */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Product ID */
  productId: string;
  /** SKU */
  sku: string;
  /** Product name (for display) */
  productName: string;
  /** Warehouse ID */
  warehouseId: string;
  /** Warehouse name */
  warehouseName: string;
  /** Alert message */
  message: string;
  /** Current quantity */
  currentQuantity: number;
  /** Threshold that triggered alert */
  threshold?: number;
  /** Whether alert has been acknowledged */
  acknowledged: boolean;
  /** User who acknowledged */
  acknowledgedBy?: string;
  /** Acknowledgement timestamp */
  acknowledgedAt?: string;
  /** Creation timestamp */
  createdAt: string;
}

// ============================================================================
// Availability Check
// ============================================================================

/**
 * Request to check product availability
 */
export interface AvailabilityCheckRequest {
  /** Product ID */
  productId: string;
  /** Variant ID */
  variantId?: string;
  /** Requested quantity */
  quantity: number;
  /** Preferred warehouse ID */
  preferredWarehouseId?: string;
  /** Company ID for personalized availability */
  companyId?: string;
  /** Whether to include alternative warehouses */
  includeAlternatives?: boolean;
}

/**
 * Availability check result
 */
export interface AvailabilityResult {
  /** Product ID */
  productId: string;
  /** Variant ID */
  variantId?: string;
  /** Requested quantity */
  requestedQuantity: number;
  /** Whether fully available */
  isAvailable: boolean;
  /** Available quantity */
  availableQuantity: number;
  /** Primary fulfillment option */
  primaryOption?: FulfillmentOption;
  /** Alternative fulfillment options */
  alternativeOptions: FulfillmentOption[];
  /** Partial availability options */
  partialOptions?: PartialFulfillmentOption[];
  /** Expected availability date if not in stock */
  expectedAvailableDate?: string;
  /** Message to display */
  message: string;
}

/**
 * Fulfillment option from a warehouse
 */
export interface FulfillmentOption {
  /** Warehouse ID */
  warehouseId: string;
  /** Warehouse name */
  warehouseName: string;
  /** Available quantity */
  availableQuantity: number;
  /** Fulfillment type */
  type: 'pickup' | 'delivery';
  /** Estimated ready/delivery time */
  estimatedTime: string;
  /** Estimated time in hours (for sorting) */
  estimatedHours: number;
  /** Additional cost (if any) */
  additionalCost?: number;
  /** Whether this is the recommended option */
  isRecommended: boolean;
}

/**
 * Partial fulfillment option (split across warehouses)
 */
export interface PartialFulfillmentOption {
  /** Fulfillment parts */
  parts: {
    warehouseId: string;
    warehouseName: string;
    quantity: number;
    type: 'pickup' | 'delivery';
    estimatedTime: string;
  }[];
  /** Total quantity fulfilled */
  totalQuantity: number;
  /** Whether this completes the order */
  completesOrder: boolean;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Input for creating a stock reservation
 */
export interface CreateReservationInput {
  productId: string;
  variantId?: string;
  warehouseId: string;
  quantity: number;
  cartId?: string;
  orderId?: string;
  /** Duration in minutes */
  durationMinutes?: number;
}

/**
 * Input for recording stock movement
 */
export interface CreateStockMovementInput {
  productId: string;
  warehouseId: string;
  type: StockMovementType;
  quantity: number;
  referenceId?: string;
  referenceType?: string;
  reason?: string;
}

/**
 * Input for stock adjustment
 */
export interface StockAdjustmentInput {
  productId: string;
  warehouseId: string;
  newQuantity: number;
  reason: string;
}

/**
 * Input for stock transfer between warehouses
 */
export interface StockTransferInput {
  productId: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  quantity: number;
  reason?: string;
}

// ============================================================================
// Filters
// ============================================================================

/**
 * Filters for stock queries
 */
export interface StockFilters {
  /** Filter by product IDs */
  productIds?: string[];
  /** Filter by SKUs */
  skus?: string[];
  /** Filter by warehouse IDs */
  warehouseIds?: string[];
  /** Filter by status */
  statuses?: StockStatus[];
  /** Filter products with low stock */
  lowStockOnly?: boolean;
  /** Filter products out of stock */
  outOfStockOnly?: boolean;
  /** Filter products with pending reservations */
  hasReservations?: boolean;
  /** Filter by category ID */
  categoryId?: string;
  /** Filter by brand */
  brand?: string;
}

/**
 * Filters for stock alerts
 */
export interface StockAlertFilters {
  /** Filter by alert types */
  types?: StockAlertType[];
  /** Filter by severity */
  severities?: ('low' | 'medium' | 'high' | 'critical')[];
  /** Filter by warehouse IDs */
  warehouseIds?: string[];
  /** Show only unacknowledged alerts */
  unacknowledgedOnly?: boolean;
  /** Date range start */
  dateFrom?: string;
  /** Date range end */
  dateTo?: string;
}

/**
 * Filters for stock movement history
 */
export interface StockMovementFilters {
  /** Filter by product ID */
  productId?: string;
  /** Filter by warehouse ID */
  warehouseId?: string;
  /** Filter by movement types */
  types?: StockMovementType[];
  /** Date range start */
  dateFrom?: string;
  /** Date range end */
  dateTo?: string;
  /** Filter by user */
  createdBy?: string;
}
