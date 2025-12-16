/**
 * Medusa Cart Service
 *
 * Implements ICartService for Medusa V2 backend.
 */

import type {
  ICartService,
  Cart,
  CartLineItem,
  CartShippingOption,
  AddToCartInput,
  UpdateCartItemInput,
  BulkAddToCartInput,
  BulkAddResult,
} from "@maison/api-client";
import type { BaseApiClient } from "@maison/api-core";
import {
  mapMedusaCart,
  mapMedusaShippingOptions,
  type MedusaCart,
  type MedusaShippingOption,
} from "../mappers";

/**
 * Medusa Cart Service implementation.
 *
 * @example
 * ```typescript
 * const cartService = new MedusaCartService(httpClient, "reg_123");
 * const cart = await cartService.create();
 * await cartService.addItem(cart.id, { productId: "prod_123", quantity: 2 });
 * ```
 */
export class MedusaCartService implements ICartService {
  constructor(
    private readonly client: BaseApiClient,
    private readonly regionId: string
  ) {}

  /**
   * Get or create a cart.
   */
  async get(cartId?: string): Promise<Cart> {
    if (!cartId) {
      return this.create();
    }

    try {
      const response = await this.client.get<{ cart: MedusaCart }>(
        `/store/carts/${cartId}`
      );
      return mapMedusaCart(response.data.cart);
    } catch {
      // Cart not found, create a new one
      return this.create();
    }
  }

  /**
   * Create a new cart.
   */
  async create(regionId?: string, customerId?: string): Promise<Cart> {
    const body: Record<string, string | undefined> = {
      region_id: regionId ?? this.regionId,
    };

    if (customerId) {
      body["customer_id"] = customerId;
    }

    const response = await this.client.post<{ cart: MedusaCart }>("/store/carts", body);

    return mapMedusaCart(response.data.cart);
  }

  /**
   * Add item to cart.
   */
  async addItem(cartId: string, input: AddToCartInput): Promise<Cart> {
    const response = await this.client.post<{ cart: MedusaCart }>(
      `/store/carts/${cartId}/line-items`,
      {
        variant_id: input.variantId ?? input.productId,
        quantity: input.quantity,
        metadata: input.metadata,
      }
    );

    return mapMedusaCart(response.data.cart);
  }

  /**
   * Update cart item quantity.
   */
  async updateItem(cartId: string, itemId: string, input: UpdateCartItemInput): Promise<Cart> {
    const response = await this.client.post<{ cart: MedusaCart }>(
      `/store/carts/${cartId}/line-items/${itemId}`,
      {
        quantity: input.quantity,
      }
    );

    return mapMedusaCart(response.data.cart);
  }

  /**
   * Remove item from cart.
   */
  async removeItem(cartId: string, itemId: string): Promise<Cart> {
    const response = await this.client.delete<{ cart: MedusaCart }>(
      `/store/carts/${cartId}/line-items/${itemId}`
    );

    return mapMedusaCart(response.data.cart);
  }

  /**
   * Add multiple items to cart (bulk operation).
   */
  async addItemsBulk(cartId: string, input: BulkAddToCartInput): Promise<BulkAddResult> {
    const added: CartLineItem[] = [];
    const failed: Array<{ input: AddToCartInput; reason: string }> = [];

    // Clear cart first if replaceExisting is true
    if (input.replaceExisting) {
      await this.clear(cartId);
    }

    let currentCart: Cart | null = null;

    for (const item of input.items) {
      try {
        currentCart = await this.addItem(cartId, item);
        // Find the newly added item
        const addedItem = currentCart.items.find(
          (i) => i.productId === item.productId || i.variantId === item.variantId
        );
        if (addedItem) {
          added.push(addedItem);
        }
      } catch (error) {
        failed.push({
          input: item,
          reason: error instanceof Error ? error.message : "Failed to add item",
        });
      }
    }

    // Fetch final cart state
    const finalCart = currentCart ?? (await this.get(cartId));

    return {
      added,
      failed,
      cart: finalCart,
    };
  }

  /**
   * Clear all items from cart.
   */
  async clear(cartId: string): Promise<Cart> {
    const cart = await this.get(cartId);

    // Remove all items one by one (Medusa doesn't have bulk clear)
    for (const item of cart.items) {
      await this.client.delete(`/store/carts/${cartId}/line-items/${item.id}`);
    }

    return this.get(cartId);
  }

  /**
   * Apply discount code to cart.
   */
  async applyDiscount(cartId: string, code: string): Promise<Cart> {
    const response = await this.client.post<{ cart: MedusaCart }>(
      `/store/carts/${cartId}/discounts`,
      { code }
    );

    return mapMedusaCart(response.data.cart);
  }

  /**
   * Remove discount from cart.
   */
  async removeDiscount(cartId: string, discountId: string): Promise<Cart> {
    const response = await this.client.delete<{ cart: MedusaCart }>(
      `/store/carts/${cartId}/discounts/${discountId}`
    );

    return mapMedusaCart(response.data.cart);
  }

  /**
   * Set shipping option.
   */
  async setShippingOption(cartId: string, optionId: string): Promise<Cart> {
    const response = await this.client.post<{ cart: MedusaCart }>(
      `/store/carts/${cartId}/shipping-methods`,
      { option_id: optionId }
    );

    return mapMedusaCart(response.data.cart);
  }

  /**
   * Get available shipping options.
   */
  async getShippingOptions(cartId: string): Promise<CartShippingOption[]> {
    const response = await this.client.get<{ shipping_options: MedusaShippingOption[] }>(
      `/store/shipping-options/${cartId}`
    );

    return mapMedusaShippingOptions(response.data.shipping_options ?? []);
  }

  /**
   * Associate cart with customer.
   */
  async setCustomer(cartId: string, customerId: string): Promise<Cart> {
    const response = await this.client.post<{ cart: MedusaCart }>(
      `/store/carts/${cartId}`,
      { customer_id: customerId }
    );

    return mapMedusaCart(response.data.cart);
  }

  /**
   * Set addresses for cart.
   */
  async setAddresses(
    cartId: string,
    shippingAddressId: string,
    billingAddressId?: string
  ): Promise<Cart> {
    // Note: Medusa V2 uses address IDs when the customer is logged in
    // For guest checkout, full address objects would be passed
    const response = await this.client.post<{ cart: MedusaCart }>(
      `/store/carts/${cartId}`,
      {
        shipping_address_id: shippingAddressId,
        billing_address_id: billingAddressId ?? shippingAddressId,
      }
    );

    return mapMedusaCart(response.data.cart);
  }

  /**
   * Update cart metadata.
   */
  async updateMetadata(cartId: string, metadata: Record<string, unknown>): Promise<Cart> {
    const response = await this.client.post<{ cart: MedusaCart }>(
      `/store/carts/${cartId}`,
      { metadata }
    );

    return mapMedusaCart(response.data.cart);
  }

  /**
   * Delete a cart.
   */
  async delete(cartId: string): Promise<void> {
    await this.client.delete(`/store/carts/${cartId}`);
  }

  /**
   * Merge guest cart into customer cart.
   */
  async merge(guestCartId: string, customerCartId: string): Promise<Cart> {
    // Get guest cart items
    const guestCart = await this.get(guestCartId);

    // Add each item to customer cart
    for (const item of guestCart.items) {
      await this.addItem(customerCartId, {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        attributes: item.attributes,
      });
    }

    // Delete guest cart
    await this.delete(guestCartId);

    // Return updated customer cart
    return this.get(customerCartId);
  }
}
