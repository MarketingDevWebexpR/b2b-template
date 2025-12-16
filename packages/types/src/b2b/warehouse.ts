/**
 * Warehouse Types
 *
 * Defines types for warehouse/point-of-sale management in B2B e-commerce.
 * Supports multi-location inventory, pickup points, and delivery options.
 *
 * @packageDocumentation
 */

// ============================================================================
// Warehouse Type
// ============================================================================

/**
 * Type of warehouse/location
 */
export type WarehouseType = 'store' | 'depot' | 'warehouse' | 'distribution_center';

/**
 * Status of the warehouse
 */
export type WarehouseStatus = 'active' | 'inactive' | 'maintenance' | 'closed';

// ============================================================================
// Address
// ============================================================================

/**
 * Warehouse physical address
 */
export interface WarehouseAddress {
  /** Street address line 1 */
  street1: string;
  /** Street address line 2 (optional) */
  street2?: string;
  /** City */
  city: string;
  /** Postal/ZIP code */
  postalCode: string;
  /** State/Province/Region */
  region?: string;
  /** Country code (ISO 3166-1 alpha-2) */
  countryCode: string;
  /** Country name */
  country: string;
  /** Latitude for map display */
  latitude?: number;
  /** Longitude for map display */
  longitude?: number;
}

// ============================================================================
// Opening Hours
// ============================================================================

/**
 * Time slot for opening hours
 */
export interface TimeSlot {
  /** Opening time (HH:mm format) */
  open: string;
  /** Closing time (HH:mm format) */
  close: string;
}

/**
 * Day of week
 */
export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

/**
 * Opening hours for a specific day
 */
export interface DaySchedule {
  /** Day of the week */
  day: DayOfWeek;
  /** Whether the warehouse is open on this day */
  isOpen: boolean;
  /** Time slots (supports lunch breaks) */
  slots: TimeSlot[];
}

/**
 * Special opening hours (holidays, special events)
 */
export interface SpecialSchedule {
  /** Date (YYYY-MM-DD format) */
  date: string;
  /** Description (e.g., "Christmas Eve") */
  description?: string;
  /** Whether the warehouse is open */
  isOpen: boolean;
  /** Time slots if open */
  slots?: TimeSlot[];
}

/**
 * Complete opening hours configuration
 */
export interface OpeningHours {
  /** Regular weekly schedule */
  regular: DaySchedule[];
  /** Special dates (holidays, etc.) */
  special?: SpecialSchedule[];
  /** Timezone (IANA format) */
  timezone: string;
}

// ============================================================================
// Delivery Options
// ============================================================================

/**
 * Type of delivery option
 */
export type DeliveryOptionType =
  | 'store_pickup'      // Click & Collect
  | 'express_pickup'    // 2-hour pickup
  | 'standard_delivery' // Standard shipping
  | 'express_delivery'  // Same-day/next-day
  | 'scheduled_delivery' // Time-slot delivery
  | 'locker_pickup';    // Parcel locker

/**
 * Delivery option configuration
 */
export interface DeliveryOption {
  /** Unique identifier */
  id: string;
  /** Type of delivery */
  type: DeliveryOptionType;
  /** Display name */
  name: string;
  /** Description */
  description?: string;
  /** Estimated delivery time (human readable) */
  estimatedTime: string;
  /** Estimated delivery time in hours (for calculations) */
  estimatedHours?: number;
  /** Price (HT - tax excluded) */
  priceHT: number;
  /** Currency */
  currency: string;
  /** Whether this option is free above certain order value */
  freeAbove?: number;
  /** Minimum order value to unlock this option */
  minOrderValue?: number;
  /** Maximum order weight in kg */
  maxWeight?: number;
  /** Whether this option is available */
  isAvailable: boolean;
  /** Available time slots for scheduled delivery */
  timeSlots?: TimeSlot[];
}

// ============================================================================
// Warehouse Entity
// ============================================================================

/**
 * Contact information for the warehouse
 */
export interface WarehouseContact {
  /** Contact name */
  name?: string;
  /** Phone number */
  phone?: string;
  /** Email address */
  email?: string;
  /** Fax number */
  fax?: string;
}

/**
 * Warehouse capabilities and features
 */
export interface WarehouseCapabilities {
  /** Supports click & collect */
  pickupEnabled: boolean;
  /** Supports delivery from this location */
  deliveryEnabled: boolean;
  /** Has professional counter service */
  hasCounter: boolean;
  /** Has showroom/display area */
  hasShowroom: boolean;
  /** Supports dangerous goods */
  handlesDangerousGoods: boolean;
  /** Has forklift for heavy items */
  hasForklift: boolean;
  /** Maximum item weight that can be handled (kg) */
  maxItemWeight?: number;
  /** Supports returns */
  acceptsReturns: boolean;
}

/**
 * Complete Warehouse entity
 */
export interface Warehouse {
  /** Unique identifier */
  id: string;
  /** Internal code (for reference) */
  code: string;
  /** Display name */
  name: string;
  /** Type of location */
  type: WarehouseType;
  /** Status */
  status: WarehouseStatus;
  /** Physical address */
  address: WarehouseAddress;
  /** Contact information */
  contact?: WarehouseContact;
  /** Opening hours */
  openingHours: OpeningHours;
  /** Available delivery options */
  deliveryOptions: DeliveryOption[];
  /** Capabilities and features */
  capabilities: WarehouseCapabilities;
  /** Associated company IDs (for restricted warehouses) */
  allowedCompanyIds?: string[];
  /** Whether this is the default warehouse */
  isDefault: boolean;
  /** Sort order for display */
  sortOrder: number;
  /** Custom metadata */
  metadata?: Record<string, unknown>;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Warehouse summary for lists
 */
export interface WarehouseSummary {
  /** Unique identifier */
  id: string;
  /** Internal code */
  code: string;
  /** Display name */
  name: string;
  /** Type of location */
  type: WarehouseType;
  /** City (for quick display) */
  city: string;
  /** Whether pickup is available */
  pickupEnabled: boolean;
  /** Whether delivery is available */
  deliveryEnabled: boolean;
  /** Whether currently open */
  isOpen: boolean;
  /** Next opening time if closed */
  nextOpenAt?: string;
  /** Distance from user (if location available) */
  distanceKm?: number;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Input for creating a warehouse
 */
export interface CreateWarehouseInput {
  code: string;
  name: string;
  type: WarehouseType;
  address: WarehouseAddress;
  contact?: WarehouseContact;
  openingHours: OpeningHours;
  deliveryOptions?: DeliveryOption[];
  capabilities?: Partial<WarehouseCapabilities>;
  allowedCompanyIds?: string[];
  isDefault?: boolean;
  sortOrder?: number;
}

/**
 * Input for updating a warehouse
 */
export interface UpdateWarehouseInput {
  name?: string;
  status?: WarehouseStatus;
  address?: Partial<WarehouseAddress>;
  contact?: WarehouseContact;
  openingHours?: OpeningHours;
  deliveryOptions?: DeliveryOption[];
  capabilities?: Partial<WarehouseCapabilities>;
  allowedCompanyIds?: string[];
  isDefault?: boolean;
  sortOrder?: number;
}

// ============================================================================
// Filters
// ============================================================================

/**
 * Filters for warehouse search
 */
export interface WarehouseFilters {
  /** Search by name or code */
  search?: string;
  /** Filter by type */
  types?: WarehouseType[];
  /** Filter by status */
  statuses?: WarehouseStatus[];
  /** Filter by pickup availability */
  pickupEnabled?: boolean;
  /** Filter by delivery availability */
  deliveryEnabled?: boolean;
  /** Filter by city */
  city?: string;
  /** Filter by country */
  countryCode?: string;
  /** Filter by proximity (requires lat/lng) */
  nearLocation?: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  };
  /** Only show currently open warehouses */
  isOpenNow?: boolean;
}
