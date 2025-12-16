/**
 * Cart Factory - Generation de paniers mock
 *
 * @packageDocumentation
 */

import { faker, generateId, randomItem, randomItems } from './base';
import { mockProducts, type MockProduct } from './product.factory';

export interface MockCartItem {
  id: string;
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  thumbnail: string;
  price: number;
  quantity: number;
  total: number;
  note?: string;
}

export interface MockCart {
  id: string;
  name?: string;
  items: MockCartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  itemCount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockSavedCart extends MockCart {
  name: string;
  description?: string;
  isShared: boolean;
  createdBy: string;
}

/**
 * Cree un item de panier depuis un produit
 */
export function createCartItem(product: MockProduct, quantity?: number): MockCartItem {
  const variant = product.variants.find((v) => v.isDefault) || product.variants[0];
  const qty = quantity || faker.number.int({ min: product.minOrderQuantity, max: 20 });
  const price = variant?.price || product.price;

  return {
    id: generateId('item'),
    productId: product.id,
    variantId: variant?.id || product.id,
    sku: variant?.sku || product.sku,
    name: product.name + (variant ? ` - ${variant.name}` : ''),
    thumbnail: product.thumbnail,
    price,
    quantity: qty,
    total: price * qty,
    note: faker.datatype.boolean({ probability: 0.2 })
      ? faker.lorem.sentence()
      : undefined,
  };
}

/**
 * Cree un panier mock
 */
export function createMockCart(
  itemCount: number = faker.number.int({ min: 1, max: 10 }),
  overrides: Partial<MockCart> = {}
): MockCart {
  const products = randomItems(mockProducts, itemCount);
  const items = products.map((p) => createCartItem(p));

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discount = faker.datatype.boolean({ probability: 0.3 })
    ? Math.round(subtotal * 0.1 * 100) / 100
    : 0;
  const taxableAmount = subtotal - discount;
  const tax = Math.round(taxableAmount * 0.2 * 100) / 100;
  const total = Math.round((taxableAmount + tax) * 100) / 100;

  return {
    id: generateId('cart'),
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    discount,
    tax,
    total,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    currency: 'EUR',
    createdAt: faker.date.recent({ days: 7 }).toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Cree un panier sauvegarde
 */
export function createMockSavedCart(
  createdBy: string,
  overrides: Partial<MockSavedCart> = {}
): MockSavedCart {
  const cart = createMockCart();

  return {
    ...cart,
    name: faker.helpers.arrayElement([
      'Commande mensuelle',
      'Reapprovisionnement stock',
      'Collection printemps',
      'Cadeaux clients',
      'Evenement special',
      'Stock showroom',
    ]),
    description: faker.datatype.boolean()
      ? faker.lorem.sentence()
      : undefined,
    isShared: faker.datatype.boolean({ probability: 0.3 }),
    createdBy,
    ...overrides,
  };
}

/**
 * Cree plusieurs paniers sauvegardes
 */
export function createMockSavedCarts(
  createdBy: string,
  count: number = 5
): MockSavedCart[] {
  return Array.from({ length: count }, () => createMockSavedCart(createdBy));
}

// Pre-generate current cart and saved carts
export const mockCurrentCart = createMockCart(5);
export const mockEmptyCart = createMockCart(0);
