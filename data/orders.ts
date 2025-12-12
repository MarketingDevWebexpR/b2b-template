import {
  Order,
  OrderItem,
  OrderTotals,
  ShippingAddress,
  PaymentInfo,
  OrderStatus,
  CartItemWithDetails,
  PaymentMethod,
} from '@/types';
import { products } from './products';

/**
 * Helper to convert product to OrderItem
 */
function productToOrderItem(product: typeof products[0], quantity: number): OrderItem {
  return {
    productId: product.id,
    productReference: product.reference,
    productName: product.name,
    productImage: product.images[0] || '',
    quantity,
    unitPrice: product.price,
    totalPrice: product.price * quantity,
  };
}

/**
 * In-memory orders storage
 * In a real application, this would be a database
 */
let orders: Order[] = [
  {
    id: 'ord_1',
    orderNumber: 'ORD-2024-001',
    userId: '1',
    items: [productToOrderItem(products[0], 1)], // Solitaire Eternite
    totals: {
      subtotal: 8500,
      shipping: 0,
      tax: 0,
      discount: 0,
      total: 8500,
    },
    shippingAddress: {
      firstName: 'Test',
      lastName: 'Utilisateur',
      address: '15 Rue de la Paix',
      city: 'Paris',
      postalCode: '75002',
      country: 'France',
      phone: '+33 1 42 86 87 88',
    },
    paymentInfo: {
      method: 'card',
      status: 'completed',
      transactionId: 'txn_abc123',
      lastFourDigits: '4242',
      cardBrand: 'visa',
      paidAt: '2024-02-15T10:30:00Z',
    },
    status: 'delivered',
    trackingNumber: 'FR123456789',
    createdAt: '2024-02-15T10:30:00Z',
    updatedAt: '2024-02-20T14:00:00Z',
    shippedAt: '2024-02-16T09:00:00Z',
    deliveredAt: '2024-02-20T14:00:00Z',
  },
  {
    id: 'ord_2',
    orderNumber: 'ORD-2024-002',
    userId: '1',
    items: [
      productToOrderItem(products[11], 1), // Creoles Diamantees
      productToOrderItem(products[5], 1), // Pendentif Goutte d'Or
    ],
    totals: {
      subtotal: 11400,
      shipping: 0,
      tax: 0,
      discount: 0,
      total: 11400,
    },
    shippingAddress: {
      firstName: 'Test',
      lastName: 'Utilisateur',
      address: '15 Rue de la Paix',
      city: 'Paris',
      postalCode: '75002',
      country: 'France',
      phone: '+33 1 42 86 87 88',
    },
    paymentInfo: {
      method: 'card',
      status: 'completed',
      transactionId: 'txn_def456',
      lastFourDigits: '1234',
      cardBrand: 'mastercard',
      paidAt: '2024-03-01T14:45:00Z',
    },
    status: 'shipped',
    trackingNumber: 'FR987654321',
    createdAt: '2024-03-01T14:45:00Z',
    updatedAt: '2024-03-05T09:15:00Z',
    shippedAt: '2024-03-05T09:15:00Z',
  },
  {
    id: 'ord_3',
    orderNumber: 'ORD-2024-003',
    userId: '1',
    items: [productToOrderItem(products[8], 1)], // Bracelet Tennis Diamants
    totals: {
      subtotal: 15000,
      shipping: 0,
      tax: 0,
      discount: 0,
      total: 15000,
    },
    shippingAddress: {
      firstName: 'Test',
      lastName: 'Utilisateur',
      address: '15 Rue de la Paix',
      city: 'Paris',
      postalCode: '75002',
      country: 'France',
      phone: '+33 1 42 86 87 88',
    },
    paymentInfo: {
      method: 'card',
      status: 'completed',
      transactionId: 'txn_ghi789',
      lastFourDigits: '5678',
      cardBrand: 'cb',
      paidAt: '2024-03-10T11:20:00Z',
    },
    status: 'processing',
    createdAt: '2024-03-10T11:20:00Z',
    updatedAt: '2024-03-10T11:20:00Z',
  },
  {
    id: 'ord_4',
    orderNumber: 'ORD-2024-004',
    userId: '2',
    items: [productToOrderItem(products[1], 2)], // Alliance Royale x2
    totals: {
      subtotal: 6400,
      shipping: 0,
      tax: 0,
      discount: 0,
      total: 6400,
    },
    shippingAddress: {
      firstName: 'Marie',
      lastName: 'Dupont',
      address: '8 Avenue Montaigne',
      city: 'Paris',
      postalCode: '75008',
      country: 'France',
      phone: '+33 1 53 67 65 00',
    },
    paymentInfo: {
      method: 'paypal',
      status: 'completed',
      transactionId: 'pp_xyz789',
      paidAt: '2024-02-28T09:00:00Z',
    },
    status: 'delivered',
    trackingNumber: 'FR456789123',
    createdAt: '2024-02-28T09:00:00Z',
    updatedAt: '2024-03-08T16:30:00Z',
    shippedAt: '2024-03-01T10:00:00Z',
    deliveredAt: '2024-03-08T16:30:00Z',
  },
];

/**
 * Counter for order number generation
 */
let orderCounter = orders.length;

/**
 * Generate a unique order ID
 */
function generateOrderId(): string {
  return `ord_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a human-readable order number
 */
function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  orderCounter++;
  return `ORD-${year}-${String(orderCounter).padStart(3, '0')}`;
}

/**
 * Convert CartItemWithDetails to OrderItem
 */
function cartItemToOrderItem(item: CartItemWithDetails): OrderItem {
  return {
    productId: item.productId,
    productReference: item.productReference,
    productName: item.productName,
    productImage: item.productImage,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
  };
}

/**
 * Create a new order
 */
export function createOrder(
  userId: string,
  items: CartItemWithDetails[],
  shippingAddress: ShippingAddress,
  paymentMethod: PaymentMethod = 'card'
): Order {
  const orderItems = items.map(cartItemToOrderItem);
  const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const totals: OrderTotals = {
    subtotal,
    shipping: 0, // Free shipping for luxury items
    tax: 0,
    discount: 0,
    total: subtotal,
  };

  const paymentInfo: PaymentInfo = {
    method: paymentMethod,
    status: 'completed', // Mock: auto-complete payment
    transactionId: `txn_${Date.now()}`,
    paidAt: new Date().toISOString(),
  };

  const now = new Date().toISOString();

  const newOrder: Order = {
    id: generateOrderId(),
    orderNumber: generateOrderNumber(),
    userId,
    items: orderItems,
    totals,
    shippingAddress,
    paymentInfo,
    status: 'confirmed',
    createdAt: now,
    updatedAt: now,
  };

  orders.push(newOrder);
  return newOrder;
}

/**
 * Get all orders for a specific user
 */
export function getOrdersByUserId(userId: string): Order[] {
  return orders
    .filter((order) => order.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Get a specific order by ID
 */
export function getOrderById(orderId: string): Order | undefined {
  return orders.find((order) => order.id === orderId);
}

/**
 * Get order by order number
 */
export function getOrderByNumber(orderNumber: string): Order | undefined {
  return orders.find((order) => order.orderNumber === orderNumber);
}

/**
 * Get order by ID for a specific user (security check)
 */
export function getOrderByIdForUser(orderId: string, userId: string): Order | undefined {
  return orders.find((order) => order.id === orderId && order.userId === userId);
}

/**
 * Update order status
 */
export function updateOrderStatus(orderId: string, status: OrderStatus): Order | undefined {
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();

    if (status === 'shipped') {
      order.shippedAt = new Date().toISOString();
    }
    if (status === 'delivered') {
      order.deliveredAt = new Date().toISOString();
    }
  }
  return order;
}

/**
 * Get all orders (admin function)
 */
export function getAllOrders(): Order[] {
  return orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Get order count for a user
 */
export function getOrderCountByUserId(userId: string): number {
  return orders.filter((order) => order.userId === userId).length;
}

/**
 * Get total spent by a user
 */
export function getTotalSpentByUserId(userId: string): number {
  return orders
    .filter((order) => order.userId === userId && order.status !== 'cancelled' && order.status !== 'refunded')
    .reduce((sum, order) => sum + order.totals.total, 0);
}

/**
 * Status labels in French
 */
export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmee',
  processing: 'En preparation',
  shipped: 'Expediee',
  delivered: 'Livree',
  cancelled: 'Annulee',
  refunded: 'Remboursee',
};

/**
 * Status colors for UI (Tailwind classes)
 */
export const orderStatusColors: Record<OrderStatus, { text: string; bg: string }> = {
  pending: { text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  confirmed: { text: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  processing: { text: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  shipped: { text: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  delivered: { text: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  cancelled: { text: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  refunded: { text: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' },
};
