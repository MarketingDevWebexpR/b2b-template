/**
 * Order Factory - Generation de commandes mock
 *
 * @packageDocumentation
 */

import { faker, generateId, randomItem, randomItems, randomDate } from './base';
import { mockProducts, type MockProduct } from './product.factory';
import { createCartItem, type MockCartItem } from './cart.factory';
import { mockAddresses, type MockAddress } from './address.factory';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partial';

export interface MockOrderItem extends MockCartItem {
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
}

export interface MockShipment {
  id: string;
  trackingNumber?: string;
  carrier: string;
  status: 'pending' | 'shipped' | 'in_transit' | 'delivered';
  items: string[]; // item IDs
  shippedAt?: string;
  deliveredAt?: string;
  estimatedDelivery?: string;
}

export interface MockOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: MockOrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  itemCount: number;
  currency: string;
  billingAddress: MockAddress;
  shippingAddress: MockAddress;
  shipments: MockShipment[];
  notes?: string;
  internalNotes?: string;
  poNumber?: string;
  companyId: string;
  userId: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const orderStatuses: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

const paymentStatuses: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded'];

const carriers = [
  'Colissimo',
  'Chronopost',
  'DHL Express',
  'UPS',
  'FedEx',
  'TNT',
  'DPD',
  'GLS',
];

/**
 * Genere un numero de commande
 */
function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const sequence = faker.string.numeric(6);
  return `CMD-${year}${month}-${sequence}`;
}

/**
 * Genere un numero de suivi
 */
function generateTrackingNumber(): string {
  return faker.string.alphanumeric(16).toUpperCase();
}

/**
 * Cree les expeditions pour une commande
 */
function createShipments(
  items: MockOrderItem[],
  orderDate: Date,
  status: OrderStatus
): MockShipment[] {
  if (status === 'pending' || status === 'cancelled') {
    return [];
  }

  const shipments: MockShipment[] = [];

  // Pour simplifier, une seule expedition par commande
  const shipment: MockShipment = {
    id: generateId('ship'),
    carrier: randomItem(carriers),
    items: items.map((i) => i.id),
    status: 'pending',
  };

  if (status === 'shipped' || status === 'delivered') {
    shipment.trackingNumber = generateTrackingNumber();
    shipment.shippedAt = faker.date.between({ from: orderDate, to: new Date() }).toISOString();
    shipment.status = 'shipped';
    shipment.estimatedDelivery = faker.date.soon({ days: 5 }).toISOString();
  }

  if (status === 'delivered') {
    shipment.status = 'delivered';
    shipment.deliveredAt = faker.date.recent({ days: 7 }).toISOString();
  }

  shipments.push(shipment);
  return shipments;
}

/**
 * Cree une commande mock
 */
export function createMockOrder(
  companyId: string,
  userId: string,
  overrides: Partial<MockOrder> = {}
): MockOrder {
  const status = overrides.status || randomItem(orderStatuses);
  const itemCount = faker.number.int({ min: 1, max: 15 });
  const products = randomItems(mockProducts, itemCount);

  const items: MockOrderItem[] = products.map((p) => ({
    ...createCartItem(p),
    status: status === 'delivered' ? 'delivered' : status === 'shipped' ? 'shipped' : 'pending',
  }));

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discount = faker.datatype.boolean({ probability: 0.4 })
    ? Math.round(subtotal * faker.number.float({ min: 0.05, max: 0.2 }) * 100) / 100
    : 0;
  const shippingCost = faker.helpers.arrayElement([0, 9.9, 14.9, 19.9, 29.9]);
  const taxableAmount = subtotal - discount + shippingCost;
  const tax = Math.round(taxableAmount * 0.2 * 100) / 100;
  const total = Math.round((taxableAmount + tax) * 100) / 100;

  const createdAt = randomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date());
  const billingAddress = randomItem(mockAddresses);
  const shippingAddress = randomItem(mockAddresses);

  let paymentStatus: PaymentStatus = 'pending';
  if (status === 'confirmed' || status === 'processing' || status === 'shipped' || status === 'delivered') {
    paymentStatus = 'paid';
  } else if (status === 'cancelled') {
    paymentStatus = faker.helpers.arrayElement(['refunded', 'failed']);
  }

  const shipments = createShipments(items, createdAt, status);

  return {
    id: generateId('order'),
    orderNumber: generateOrderNumber(),
    status,
    paymentStatus,
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    discount,
    shippingCost,
    tax,
    total,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    currency: 'EUR',
    billingAddress,
    shippingAddress,
    shipments,
    notes: faker.datatype.boolean({ probability: 0.3 }) ? faker.lorem.sentence() : undefined,
    internalNotes: faker.datatype.boolean({ probability: 0.2 }) ? faker.lorem.sentence() : undefined,
    poNumber: faker.datatype.boolean({ probability: 0.5 })
      ? `PO-${faker.string.numeric(8)}`
      : undefined,
    companyId,
    userId,
    approvedBy: status !== 'pending' && faker.datatype.boolean() ? generateId('user') : undefined,
    approvedAt: status !== 'pending' ? faker.date.recent({ days: 30 }).toISOString() : undefined,
    createdAt: createdAt.toISOString(),
    updatedAt: faker.date.between({ from: createdAt, to: new Date() }).toISOString(),
    ...overrides,
  };
}

/**
 * Cree plusieurs commandes mock
 */
export function createMockOrders(
  companyId: string,
  userId: string,
  count: number = 20
): MockOrder[] {
  return Array.from({ length: count }, () => createMockOrder(companyId, userId));
}

/**
 * Filtre les commandes par statut
 */
export function filterOrdersByStatus(orders: MockOrder[], status: OrderStatus): MockOrder[] {
  return orders.filter((o) => o.status === status);
}

/**
 * Obtient les statistiques des commandes
 */
export function getOrderStats(orders: MockOrder[]) {
  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    totalAmount: orders.reduce((sum, o) => sum + o.total, 0),
  };
}
