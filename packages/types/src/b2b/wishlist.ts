/**
 * B2B Wishlist Types
 *
 * Types for managing multiple wishlists (product lists) with sharing
 * capabilities between B2B collaborators.
 *
 * @packageDocumentation
 */

// ============================================================================
// List Types & Status
// ============================================================================

/**
 * Visibility status for a wishlist
 */
export type WishlistVisibility = 'private' | 'shared' | 'public';

/**
 * Permission level for shared wishlists
 */
export type WishlistPermission = 'view' | 'edit';

/**
 * Template type for predefined list categories
 */
export type WishlistTemplate =
  | 'favorites'
  | 'seasonal_spring'
  | 'seasonal_summer'
  | 'seasonal_autumn'
  | 'seasonal_winter'
  | 'bestsellers'
  | 'new_arrivals'
  | 'reorder'
  | 'custom';

// ============================================================================
// Wishlist Item Types
// ============================================================================

/**
 * A single item in a wishlist with suggested quantity and notes
 */
export interface WishlistItemB2B {
  /** Unique item ID */
  id: string;
  /** Reference to the product */
  productId: string;
  /** Product SKU/Reference */
  productReference: string;
  /** Product name (cached for offline display) */
  productName: string;
  /** Product image URL */
  productImage: string;
  /** Current product price (may have changed since added) */
  currentPrice: number;
  /** Price when item was added */
  priceWhenAdded: number;
  /** Currency code */
  currency: string;
  /** Suggested quantity for ordering */
  suggestedQuantity: number;
  /** Current stock availability */
  stockAvailable: number;
  /** Whether the product is currently available */
  isAvailable: boolean;
  /** Optional notes for this item */
  notes?: string;
  /** ISO timestamp when item was added */
  addedAt: string;
  /** ID of employee who added the item */
  addedBy: string;
  /** Name of employee who added the item */
  addedByName: string;
}

// ============================================================================
// Collaborator Types
// ============================================================================

/**
 * A collaborator with access to a shared wishlist
 */
export interface WishlistCollaborator {
  /** Collaborator ID (can be employee ID or email for pending invites) */
  id: string;
  /** Employee ID if internal collaborator */
  employeeId?: string;
  /** Email address */
  email: string;
  /** Display name */
  name: string;
  /** Avatar URL */
  avatar?: string;
  /** Permission level */
  permission: WishlistPermission;
  /** Whether the invitation is pending */
  isPending: boolean;
  /** ISO timestamp when access was granted */
  grantedAt: string;
  /** ID of who granted access */
  grantedBy: string;
}

// ============================================================================
// Wishlist Entity
// ============================================================================

/**
 * A complete wishlist/product list with items and sharing info
 */
export interface WishlistB2B {
  /** Unique wishlist ID */
  id: string;
  /** Company ID this wishlist belongs to */
  companyId: string;
  /** Wishlist name */
  name: string;
  /** Optional description */
  description?: string;
  /** Visibility status */
  visibility: WishlistVisibility;
  /** Template type (for filtering/categorization) */
  template: WishlistTemplate;
  /** Whether this is the default favorites list */
  isDefault: boolean;
  /** Items in the wishlist */
  items: WishlistItemB2B[];
  /** Total number of items */
  itemCount: number;
  /** Estimated total value of items */
  estimatedTotal: number;
  /** Currency for estimated total */
  currency: string;
  /** Preview images (first 4 product images) */
  previewImages: string[];
  /** Collaborators with access */
  collaborators: WishlistCollaborator[];
  /** Public share link (if visibility is 'public') */
  publicShareLink?: string;
  /** ISO timestamp when created */
  createdAt: string;
  /** ID of employee who created the list */
  createdBy: string;
  /** Name of employee who created the list */
  createdByName: string;
  /** ISO timestamp of last update */
  updatedAt: string;
  /** ID of employee who last updated */
  lastUpdatedBy: string;
  /** Name of employee who last updated */
  lastUpdatedByName: string;
}

/**
 * Summary view of a wishlist for list displays
 */
export interface WishlistSummary {
  /** Unique wishlist ID */
  id: string;
  /** Wishlist name */
  name: string;
  /** Optional description */
  description?: string;
  /** Visibility status */
  visibility: WishlistVisibility;
  /** Template type */
  template: WishlistTemplate;
  /** Whether this is the default favorites list */
  isDefault: boolean;
  /** Total number of items */
  itemCount: number;
  /** Estimated total value */
  estimatedTotal: number;
  /** Currency */
  currency: string;
  /** Preview images (first 4 product images) */
  previewImages: string[];
  /** Number of collaborators */
  collaboratorCount: number;
  /** Whether current user owns this list */
  isOwner: boolean;
  /** Whether this list was shared with current user */
  isSharedWithMe: boolean;
  /** Permission level if shared */
  myPermission?: WishlistPermission;
  /** ISO timestamp of last update */
  updatedAt: string;
  /** Name of employee who last updated */
  lastUpdatedByName: string;
}

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

/**
 * Input for creating a new wishlist
 */
export interface CreateWishlistInput {
  /** Wishlist name */
  name: string;
  /** Optional description */
  description?: string;
  /** Visibility status (default: 'private') */
  visibility?: WishlistVisibility;
  /** Template type (default: 'custom') */
  template?: WishlistTemplate;
  /** Initial items to add */
  initialItems?: AddWishlistItemInput[];
}

/**
 * Input for updating a wishlist
 */
export interface UpdateWishlistInput {
  /** New name */
  name?: string;
  /** New description */
  description?: string;
  /** New visibility */
  visibility?: WishlistVisibility;
  /** New template */
  template?: WishlistTemplate;
}

/**
 * Input for adding an item to a wishlist
 */
export interface AddWishlistItemInput {
  /** Product ID to add */
  productId: string;
  /** Suggested quantity (default: 1) */
  suggestedQuantity?: number;
  /** Optional notes */
  notes?: string;
}

/**
 * Input for updating an item in a wishlist
 */
export interface UpdateWishlistItemInput {
  /** New suggested quantity */
  suggestedQuantity?: number;
  /** New notes */
  notes?: string;
}

/**
 * Input for sharing a wishlist
 */
export interface ShareWishlistInput {
  /** Email addresses to share with */
  emails: string[];
  /** Permission level to grant */
  permission: WishlistPermission;
  /** Optional message to include in invitation */
  message?: string;
}

/**
 * Input for updating collaborator permission
 */
export interface UpdateCollaboratorInput {
  /** New permission level */
  permission: WishlistPermission;
}

// ============================================================================
// Filters
// ============================================================================

/**
 * Filters for querying wishlists
 */
export interface WishlistFilters {
  /** Filter by visibility */
  visibility?: WishlistVisibility;
  /** Filter by template */
  template?: WishlistTemplate;
  /** Filter by ownership */
  ownership?: 'mine' | 'shared' | 'all';
  /** Search by name */
  search?: string;
}

// ============================================================================
// Actions & Events
// ============================================================================

/**
 * Wishlist action types for activity tracking
 */
export type WishlistActionType =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'item_added'
  | 'item_removed'
  | 'item_updated'
  | 'shared'
  | 'unshared'
  | 'permission_changed'
  | 'duplicated'
  | 'converted_to_order';

/**
 * Activity entry for wishlist history
 */
export interface WishlistActivity {
  /** Activity ID */
  id: string;
  /** Wishlist ID */
  wishlistId: string;
  /** Action type */
  action: WishlistActionType;
  /** Description of the action */
  description: string;
  /** ID of employee who performed action */
  performedBy: string;
  /** Name of employee who performed action */
  performedByName: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** ISO timestamp */
  timestamp: string;
}
