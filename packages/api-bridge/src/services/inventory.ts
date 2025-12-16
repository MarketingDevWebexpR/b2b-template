/**
 * Bridge Inventory Service
 *
 * Provides real-time inventory operations via Laravel Bridge API.
 * This service is specific to Bridge adapter and not part of ICommerceClient.
 */

import type { BaseApiClient } from "@maison/api-core";

/**
 * Inventory item from Bridge API
 */
export interface BridgeInventoryItem {
  sku: string;
  product_id?: string;
  variant_id?: string;
  quantity: number;
  reserved?: number;
  available: number;
  location?: string;
  warehouse_id?: string;
  last_updated: string;
  low_stock_threshold?: number;
  is_low_stock?: boolean;
  reorder_point?: number;
  expected_restock_date?: string | null;
}

/**
 * Inventory update request
 */
export interface InventoryUpdateRequest {
  sku: string;
  quantity: number;
  adjustment_type: "set" | "increment" | "decrement";
  reason?: string;
  location?: string;
}

/**
 * Inventory reservation request
 */
export interface InventoryReservation {
  sku: string;
  quantity: number;
  reference_type: "cart" | "order" | "quote";
  reference_id: string;
  expires_at?: string;
}

/**
 * Inventory sync status
 */
export interface InventorySyncStatus {
  last_sync: string;
  status: "synced" | "pending" | "error";
  items_synced: number;
  items_failed: number;
  next_sync?: string;
  errors?: Array<{ sku: string; message: string }>;
}

/**
 * Bridge Inventory Service
 *
 * Provides real-time inventory management for B2B operations.
 *
 * @example
 * ```typescript
 * const inventory = new BridgeInventoryService(httpClient);
 *
 * // Check stock for multiple SKUs
 * const stock = await inventory.checkStock(['SKU001', 'SKU002']);
 *
 * // Reserve inventory for a cart
 * await inventory.reserve({
 *   sku: 'SKU001',
 *   quantity: 5,
 *   reference_type: 'cart',
 *   reference_id: 'cart_123'
 * });
 * ```
 */
export class BridgeInventoryService {
  constructor(private readonly client: BaseApiClient) {}

  /**
   * Get inventory for a single SKU
   */
  async getBySku(sku: string): Promise<BridgeInventoryItem> {
    const response = await this.client.get<{ data: BridgeInventoryItem }>(
      `/inventory/${encodeURIComponent(sku)}`
    );
    return response.data.data;
  }

  /**
   * Check stock for multiple SKUs
   */
  async checkStock(skus: string[]): Promise<BridgeInventoryItem[]> {
    if (skus.length === 0) return [];

    const response = await this.client.post<{ data: BridgeInventoryItem[] }>(
      "/inventory/check",
      { skus }
    );
    return response.data.data;
  }

  /**
   * Check if specific quantities are available
   */
  async checkAvailability(
    items: Array<{ sku: string; quantity: number }>
  ): Promise<
    Array<{
      sku: string;
      requested: number;
      available: number;
      is_available: boolean;
    }>
  > {
    const response = await this.client.post<{
      data: Array<{
        sku: string;
        requested: number;
        available: number;
        is_available: boolean;
      }>;
    }>("/inventory/availability", { items });
    return response.data.data;
  }

  /**
   * Reserve inventory for a cart, order, or quote
   */
  async reserve(reservation: InventoryReservation): Promise<{
    reservation_id: string;
    sku: string;
    quantity: number;
    expires_at: string;
  }> {
    const response = await this.client.post<{
      data: {
        reservation_id: string;
        sku: string;
        quantity: number;
        expires_at: string;
      };
    }>("/inventory/reserve", reservation);
    return response.data.data;
  }

  /**
   * Reserve inventory for multiple items
   */
  async reserveMany(
    reservations: InventoryReservation[]
  ): Promise<
    Array<{
      reservation_id: string;
      sku: string;
      quantity: number;
      expires_at: string;
      success: boolean;
      error?: string;
    }>
  > {
    const response = await this.client.post<{
      data: Array<{
        reservation_id: string;
        sku: string;
        quantity: number;
        expires_at: string;
        success: boolean;
        error?: string;
      }>;
    }>("/inventory/reserve-many", { reservations });
    return response.data.data;
  }

  /**
   * Release a reservation
   */
  async releaseReservation(reservationId: string): Promise<void> {
    await this.client.delete(`/inventory/reservations/${reservationId}`);
  }

  /**
   * Release all reservations for a reference (cart/order/quote)
   */
  async releaseByReference(
    referenceType: "cart" | "order" | "quote",
    referenceId: string
  ): Promise<{ released_count: number }> {
    const response = await this.client.delete<{
      data: { released_count: number };
    }>(`/inventory/reservations/${referenceType}/${referenceId}`);
    return response.data.data;
  }

  /**
   * Confirm reservation (convert to actual stock deduction)
   */
  async confirmReservation(reservationId: string): Promise<void> {
    await this.client.post(`/inventory/reservations/${reservationId}/confirm`);
  }

  /**
   * Update inventory (admin operation)
   */
  async update(request: InventoryUpdateRequest): Promise<BridgeInventoryItem> {
    const response = await this.client.put<{ data: BridgeInventoryItem }>(
      `/inventory/${encodeURIComponent(request.sku)}`,
      request
    );
    return response.data.data;
  }

  /**
   * Batch update inventory (admin operation)
   */
  async updateMany(
    updates: InventoryUpdateRequest[]
  ): Promise<Array<BridgeInventoryItem & { success: boolean; error?: string }>> {
    const response = await this.client.post<{
      data: Array<BridgeInventoryItem & { success: boolean; error?: string }>;
    }>("/inventory/batch", { updates });
    return response.data.data;
  }

  /**
   * Get low stock items
   */
  async getLowStock(options?: {
    threshold?: number;
    warehouse_id?: string;
    page?: number;
    per_page?: number;
  }): Promise<{
    items: BridgeInventoryItem[];
    total: number;
    page: number;
    per_page: number;
  }> {
    const params = new URLSearchParams();
    if (options?.threshold) params.set("threshold", String(options.threshold));
    if (options?.warehouse_id) params.set("warehouse_id", options.warehouse_id);
    if (options?.page) params.set("page", String(options.page));
    if (options?.per_page) params.set("per_page", String(options.per_page));

    const response = await this.client.get<{
      data: BridgeInventoryItem[];
      meta: { total: number; current_page: number; per_page: number };
    }>(`/inventory/low-stock?${params.toString()}`);

    return {
      items: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.current_page,
      per_page: response.data.meta.per_page,
    };
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<InventorySyncStatus> {
    const response = await this.client.get<{ data: InventorySyncStatus }>(
      "/inventory/sync-status"
    );
    return response.data.data;
  }

  /**
   * Trigger manual sync (admin operation)
   */
  async triggerSync(options?: {
    full?: boolean;
    skus?: string[];
  }): Promise<{ job_id: string; status: string }> {
    const response = await this.client.post<{
      data: { job_id: string; status: string };
    }>("/inventory/sync", options ?? {});
    return response.data.data;
  }
}
