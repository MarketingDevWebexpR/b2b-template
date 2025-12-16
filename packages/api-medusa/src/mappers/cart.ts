/**
 * Cart Mappers
 *
 * Transform Medusa cart data to domain types.
 */

import type {
  Cart,
  CartLineItem,
  CartTotals,
  CartDiscount,
  CartShippingOption,
} from "@maison/api-client";

/**
 * Medusa cart response type
 */
export interface MedusaCart {
  id: string;
  email: string | null;
  customer_id: string | null;
  region_id: string;
  currency_code: string;
  items: MedusaLineItem[];
  shipping_methods?: MedusaShippingMethod[];
  shipping_address?: MedusaAddress | null;
  billing_address?: MedusaAddress | null;
  discounts?: MedusaDiscount[];
  subtotal: number;
  shipping_total: number;
  tax_total: number;
  discount_total: number;
  total: number;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MedusaLineItem {
  id: string;
  cart_id: string;
  variant_id: string;
  product_id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  quantity: number;
  unit_price: number;
  original_price?: number;
  subtotal: number;
  total: number;
  variant?: {
    id: string;
    sku: string | null;
    inventory_quantity?: number;
    product?: {
      id: string;
      title: string;
      handle: string;
    };
  };
  metadata?: Record<string, string>;
}

export interface MedusaShippingMethod {
  id: string;
  shipping_option_id: string;
  price: number;
  shipping_option?: {
    id: string;
    name: string;
    amount: number;
    provider_id?: string;
  };
}

export interface MedusaAddress {
  id: string;
  first_name: string | null;
  last_name: string | null;
  address_1: string | null;
  address_2: string | null;
  city: string | null;
  postal_code: string | null;
  country_code: string | null;
  phone: string | null;
}

export interface MedusaDiscount {
  id: string;
  code: string;
  rule: {
    type: "fixed" | "percentage" | "free_shipping";
    value: number;
    description?: string;
  };
}

export interface MedusaShippingOption {
  id: string;
  name: string;
  amount: number;
  price_type: "flat_rate" | "calculated";
  provider_id?: string;
}

/**
 * Map Medusa cart to domain Cart type.
 *
 * @param medusaCart - Medusa cart response
 * @returns Mapped Cart
 *
 * @example
 * ```typescript
 * const cart = mapMedusaCart(medusaCart);
 * ```
 */
export function mapMedusaCart(medusaCart: MedusaCart): Cart {
  const items = medusaCart.items.map(mapMedusaLineItem);
  const totals = mapMedusaTotals(medusaCart, items);

  // Map selected shipping method if present
  const selectedShipping = medusaCart.shipping_methods?.[0];
  const shippingOption: CartShippingOption | undefined = selectedShipping?.shipping_option
    ? {
        id: selectedShipping.shipping_option.id,
        carrier: selectedShipping.shipping_option.provider_id ?? "standard",
        name: selectedShipping.shipping_option.name,
        price: selectedShipping.price / 100,
      }
    : undefined;

  return {
    id: medusaCart.id,
    customerId: medusaCart.customer_id ?? undefined,
    regionId: medusaCart.region_id,
    items,
    discounts: medusaCart.discounts?.map(mapMedusaDiscount) ?? [],
    shippingOption,
    totals,
    shippingAddressId: medusaCart.shipping_address?.id,
    billingAddressId: medusaCart.billing_address?.id,
    metadata: medusaCart.metadata,
    createdAt: medusaCart.created_at,
    updatedAt: medusaCart.updated_at,
  };
}

/**
 * Map Medusa line item to domain CartLineItem.
 */
export function mapMedusaLineItem(item: MedusaLineItem): CartLineItem {
  const unitPrice = item.unit_price / 100;
  const originalPrice = item.original_price ? item.original_price / 100 : undefined;
  const discountAmount = originalPrice && originalPrice > unitPrice
    ? originalPrice - unitPrice
    : undefined;

  return {
    id: item.id,
    productId: item.product_id,
    variantId: item.variant_id,
    sku: item.variant?.sku ?? "",
    name: item.title,
    imageUrl: item.thumbnail ?? undefined,
    unitPrice,
    quantity: item.quantity,
    lineTotal: item.total / 100,
    originalPrice,
    discountAmount,
    isAvailable: true, // Medusa items are available if they're in cart
    availableStock: item.variant?.inventory_quantity,
    attributes: item.metadata,
    productSlug: item.variant?.product?.handle,
  };
}

/**
 * Map Medusa discount to domain CartDiscount.
 */
export function mapMedusaDiscount(discount: MedusaDiscount): CartDiscount {
  return {
    id: discount.id,
    code: discount.code,
    type: discount.rule.type,
    value: discount.rule.value,
    amount: 0, // Will be calculated by Medusa in the totals
    description: discount.rule.description,
  };
}

/**
 * Map Medusa cart totals to domain CartTotals.
 */
export function mapMedusaTotals(cart: MedusaCart, items: CartLineItem[]): CartTotals {
  return {
    subtotal: cart.subtotal / 100,
    discount: cart.discount_total / 100,
    shipping: cart.shipping_total / 100,
    tax: cart.tax_total / 100,
    total: cart.total / 100,
    currency: cart.currency_code.toUpperCase(),
    itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
    uniqueItemCount: items.length,
  };
}

/**
 * Map Medusa shipping options to domain CartShippingOption array.
 */
export function mapMedusaShippingOptions(
  options: MedusaShippingOption[]
): CartShippingOption[] {
  return options.map((opt) => ({
    id: opt.id,
    carrier: opt.provider_id ?? "standard",
    name: opt.name,
    price: opt.amount / 100,
    estimatedDays: undefined, // Medusa doesn't provide this by default
  }));
}
