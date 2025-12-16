'use client';

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber, formatDate, formatRelativeDate } from '@/lib/formatters';
import type { OrderSummary, ProductCatalogEntry } from '@maison/types';

/**
 * Frequently ordered product with statistics
 */
interface FrequentProduct {
  sku: string;
  name: string;
  totalOrdered: number;
  lastOrderDate: string;
  averageQuantity: number;
  unitPrice: number;
  imageUrl?: string;
}

/**
 * Props for ReorderList component
 */
export interface ReorderListProps {
  /** Past orders for history */
  orders: OrderSummary[];
  /** Product catalog for product details */
  productCatalog: Record<string, ProductCatalogEntry>;
  /** Callback when user wants to reorder an entire order */
  onReorder: (orderId: string) => void;
  /** Callback when user adds products from history */
  onAddProducts: (products: Array<{ sku: string; quantity: number }>) => void;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Mock order items for demonstration
 * In production, this would come from the API
 */
function getMockOrderItems(orderId: string): Array<{ sku: string; quantity: number }> {
  const itemSets: Record<string, Array<{ sku: string; quantity: number }>> = {
    ord_001: [
      { sku: 'BRA-001', quantity: 5 },
      { sku: 'COL-002', quantity: 3 },
    ],
    ord_002: [
      { sku: 'BAG-001', quantity: 2 },
      { sku: 'BOU-001', quantity: 10 },
      { sku: 'BRA-002', quantity: 5 },
    ],
    ord_003: [
      { sku: 'COL-001', quantity: 3 },
      { sku: 'BAG-002', quantity: 4 },
    ],
    ord_004: [
      { sku: 'BRA-001', quantity: 10 },
      { sku: 'BOU-002', quantity: 15 },
      { sku: 'COL-002', quantity: 8 },
    ],
    ord_005: [
      { sku: 'BAG-001', quantity: 1 },
      { sku: 'BOU-001', quantity: 2 },
    ],
    ord_006: [
      { sku: 'BRA-002', quantity: 8 },
      { sku: 'COL-001', quantity: 5 },
      { sku: 'BAG-002', quantity: 3 },
    ],
  };
  return itemSets[orderId] || [];
}

/**
 * ReorderList Component
 *
 * Displays order history and frequently ordered products with:
 * - Past orders with reorder button
 * - Frequently ordered products
 * - Quick add from history
 *
 * @example
 * ```tsx
 * <ReorderList
 *   orders={orderHistory}
 *   productCatalog={catalog}
 *   onReorder={(id) => handleReorder(id)}
 *   onAddProducts={(products) => handleAdd(products)}
 * />
 * ```
 */
export function ReorderList({
  orders,
  productCatalog,
  onReorder,
  onAddProducts,
  isLoading = false,
}: ReorderListProps) {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'orders' | 'frequent'>('orders');

  /**
   * Calculate frequently ordered products from order history
   */
  const frequentProducts = useMemo((): FrequentProduct[] => {
    const productStats: Record<
      string,
      {
        totalOrdered: number;
        orderCount: number;
        lastOrderDate: string;
      }
    > = {};

    // Aggregate product statistics from orders
    orders.forEach((order) => {
      const items = getMockOrderItems(order.id);
      items.forEach((item) => {
        if (!productStats[item.sku]) {
          productStats[item.sku] = {
            totalOrdered: 0,
            orderCount: 0,
            lastOrderDate: order.createdAt,
          };
        }
        productStats[item.sku].totalOrdered += item.quantity;
        productStats[item.sku].orderCount += 1;
        if (order.createdAt > productStats[item.sku].lastOrderDate) {
          productStats[item.sku].lastOrderDate = order.createdAt;
        }
      });
    });

    // Convert to array and sort by total ordered
    return Object.entries(productStats)
      .map(([sku, stats]) => {
        const product = productCatalog[sku];
        return {
          sku,
          name: product?.name ?? 'Produit inconnu',
          totalOrdered: stats.totalOrdered,
          lastOrderDate: stats.lastOrderDate,
          averageQuantity: Math.round(stats.totalOrdered / stats.orderCount),
          unitPrice: product?.unitPrice ?? 0,
          imageUrl: product?.imageUrl,
        };
      })
      .sort((a, b) => b.totalOrdered - a.totalOrdered)
      .slice(0, 10);
  }, [orders, productCatalog]);

  /**
   * Toggle product selection
   */
  const toggleProduct = useCallback((sku: string, defaultQty: number) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(sku)) {
        next.delete(sku);
      } else {
        next.add(sku);
        setQuantities((q) => ({ ...q, [sku]: q[sku] ?? defaultQty }));
      }
      return next;
    });
  }, []);

  /**
   * Update quantity for a product
   */
  const updateQuantity = useCallback((sku: string, qty: number) => {
    setQuantities((prev) => ({ ...prev, [sku]: Math.max(1, qty) }));
  }, []);

  /**
   * Add selected products
   */
  const handleAddSelected = useCallback(() => {
    const products = Array.from(selectedProducts).map((sku) => ({
      sku,
      quantity: quantities[sku] ?? 1,
    }));
    onAddProducts(products);
    setSelectedProducts(new Set());
    setQuantities({});
  }, [selectedProducts, quantities, onAddProducts]);

  /**
   * Get status color for order
   */
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      delivered: 'bg-green-100 text-green-700',
      shipped: 'bg-purple-100 text-purple-700',
      processing: 'bg-blue-100 text-blue-700',
      pending_approval: 'bg-amber-100 text-amber-700',
      cancelled: 'bg-gray-100 text-gray-500',
    };
    return colors[status] ?? 'bg-gray-100 text-gray-700';
  };

  /**
   * Get status label for order
   */
  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      delivered: 'Livree',
      shipped: 'Expediee',
      processing: 'En cours',
      pending_approval: 'En attente',
      cancelled: 'Annulee',
    };
    return labels[status] ?? status;
  };

  // Filter orders to only show delivered/shipped (can be reordered)
  const reorderableOrders = orders.filter(
    (o) => o.status === 'delivered' || o.status === 'shipped'
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={cn(
            'px-4 py-3 font-sans text-body-sm font-medium',
            'border-b-2 transition-colors duration-200',
            activeTab === 'orders'
              ? 'border-accent text-accent'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          )}
        >
          Commandes precedentes
          <span className="ml-2 px-2 py-0.5 bg-neutral-100 rounded-full text-caption">
            {reorderableOrders.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('frequent')}
          className={cn(
            'px-4 py-3 font-sans text-body-sm font-medium',
            'border-b-2 transition-colors duration-200',
            activeTab === 'frequent'
              ? 'border-accent text-accent'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          )}
        >
          Produits frequents
          <span className="ml-2 px-2 py-0.5 bg-neutral-100 rounded-full text-caption">
            {frequentProducts.length}
          </span>
        </button>
      </div>

      {/* Orders tab */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          {reorderableOrders.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 mx-auto text-neutral-500 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p className="font-sans text-body text-neutral-500">
                Aucune commande a recommander
              </p>
              <p className="mt-1 font-sans text-body-sm text-neutral-500">
                Vos commandes livrees apparaitront ici
              </p>
            </div>
          ) : (
            reorderableOrders.map((order) => (
              <div
                key={order.id}
                className={cn(
                  'bg-white border border-neutral-200 rounded-lg p-4',
                  'hover:border-accent/20 transition-colors duration-200'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-body-sm font-medium text-accent">
                        {order.orderNumber}
                      </span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-caption font-medium',
                          getStatusColor(order.status)
                        )}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-body-sm text-neutral-600">
                      <span>{formatDate(order.createdAt)}</span>
                      <span>{formatNumber(order.itemCount)} articles</span>
                      <span className="font-medium text-neutral-900">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                    {order.deliveredAt && (
                      <p className="mt-1 font-sans text-caption text-neutral-500">
                        Livre {formatRelativeDate(order.deliveredAt)}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onReorder(order.id)}
                    className={cn(
                      'inline-flex items-center gap-2 px-4 py-2',
                      'bg-accent text-white rounded-lg',
                      'font-sans text-body-sm font-medium',
                      'hover:bg-accent/90',
                      'transition-colors duration-200'
                    )}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Recommander
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Frequent products tab */}
      {activeTab === 'frequent' && (
        <div className="space-y-4">
          {frequentProducts.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 mx-auto text-neutral-500 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <p className="font-sans text-body text-neutral-500">
                Pas encore de produits frequents
              </p>
              <p className="mt-1 font-sans text-body-sm text-neutral-500">
                Commandez pour voir vos favoris ici
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-3">
                {frequentProducts.map((product) => {
                  const isSelected = selectedProducts.has(product.sku);
                  return (
                    <div
                      key={product.sku}
                      className={cn(
                        'bg-white border rounded-lg p-4',
                        'transition-colors duration-200',
                        isSelected
                          ? 'border-accent/30 bg-accent/5'
                          : 'border-neutral-200 hover:border-accent/20'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        {/* Checkbox */}
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              toggleProduct(product.sku, product.averageQuantity)
                            }
                            className="rounded border-neutral-200 text-accent focus:ring-accent/20"
                          />
                        </label>

                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-body-sm font-medium text-accent">
                              {product.sku}
                            </span>
                            <span className="px-2 py-0.5 bg-neutral-100 rounded text-caption text-neutral-500">
                              {formatNumber(product.totalOrdered)} commandes
                            </span>
                          </div>
                          <p className="font-sans text-body-sm text-neutral-900 truncate">
                            {product.name}
                          </p>
                          <p className="font-sans text-caption text-neutral-500">
                            Derniere commande: {formatRelativeDate(product.lastOrderDate)}
                          </p>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-sans text-body-sm font-medium text-neutral-900">
                            {formatCurrency(product.unitPrice)}
                          </p>
                          <p className="font-sans text-caption text-neutral-500">
                            Qte moy.: {formatNumber(product.averageQuantity)}
                          </p>
                        </div>

                        {/* Quantity selector when selected */}
                        {isSelected && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  product.sku,
                                  (quantities[product.sku] ?? product.averageQuantity) - 1
                                )
                              }
                              className={cn(
                                'w-8 h-8 flex items-center justify-center rounded-lg',
                                'bg-white border border-neutral-200 text-neutral-600',
                                'hover:bg-neutral-100',
                                'transition-colors duration-200'
                              )}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={quantities[product.sku] ?? product.averageQuantity}
                              onChange={(e) =>
                                updateQuantity(product.sku, parseInt(e.target.value, 10) || 1)
                              }
                              className={cn(
                                'w-16 px-2 py-1 text-center',
                                'bg-white border border-neutral-200 rounded-lg',
                                'font-sans text-body-sm text-neutral-900',
                                'focus:outline-none focus:ring-2 focus-visible:ring-accent/30',
                                '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                              )}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  product.sku,
                                  (quantities[product.sku] ?? product.averageQuantity) + 1
                                )
                              }
                              className={cn(
                                'w-8 h-8 flex items-center justify-center rounded-lg',
                                'bg-white border border-neutral-200 text-neutral-600',
                                'hover:bg-neutral-100',
                                'transition-colors duration-200'
                              )}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add selected button */}
              {selectedProducts.size > 0 && (
                <div className="sticky bottom-0 bg-white border-t border-neutral-200 pt-4 -mb-4 -mx-4 px-4 pb-4">
                  <button
                    type="button"
                    onClick={handleAddSelected}
                    className={cn(
                      'w-full px-4 py-3',
                      'bg-accent text-white rounded-lg',
                      'font-sans text-body-sm font-medium',
                      'hover:bg-accent/90',
                      'transition-colors duration-200'
                    )}
                  >
                    Ajouter {formatNumber(selectedProducts.size)} produit
                    {selectedProducts.size > 1 ? 's' : ''} a la commande
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ReorderList;
