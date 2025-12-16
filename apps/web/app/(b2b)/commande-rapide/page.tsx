'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { useB2B } from '@/contexts/B2BContext';
import { PageLoader } from '@/components/b2b';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import {
  QuickOrderForm,
  QuickOrderSummary,
  CSVImport,
  ReorderList,
  BulkOrderValidation,
} from '@/components/orders/QuickOrder';
import type { BulkOrderItem, BulkOrderValidationResult } from '@maison/types';

/**
 * Mock function to get order items for reorder
 * In production, this would call the API
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
 * QuickOrderPage Component
 *
 * Main page for B2B rapid order entry with three modes:
 * 1. Manual entry - Grid-based SKU/quantity input
 * 2. CSV Import - Upload and map CSV files
 * 3. Reorder - Quick reorder from past orders
 *
 * Features:
 * - Real-time validation
 * - Auto-complete product lookup
 * - Running total calculation
 * - Error correction workflow
 */
export default function QuickOrderPage() {
  const {
    isReady,
    isLoading,
    productCatalog,
    orders,
    lookupProducts,
    validateBulkOrder,
  } = useB2B();

  // Current items in the order
  const [items, setItems] = useState<BulkOrderItem[]>([]);
  // Active tab
  const [activeTab, setActiveTab] = useState('manual');
  // Show validation panel
  const [showValidation, setShowValidation] = useState(false);
  // Validation result
  const [validationResult, setValidationResult] = useState<BulkOrderValidationResult | null>(null);
  // Loading states
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  /**
   * Lookup and update items
   */
  const lookupAndSetItems = useCallback(
    async (newItems: Array<{ sku: string; quantity: number }>) => {
      const quantities: Record<string, number> = {};
      newItems.forEach((item) => {
        quantities[item.sku.toUpperCase()] = item.quantity;
      });

      const lookedUpItems = await lookupProducts(
        newItems.map((i) => i.sku),
        quantities
      );
      setItems(lookedUpItems);
    },
    [lookupProducts]
  );

  /**
   * Handle items change from QuickOrderForm
   */
  const handleItemsChange = useCallback((newItems: BulkOrderItem[]) => {
    setItems(newItems);
    setShowValidation(false);
    setValidationResult(null);
  }, []);

  /**
   * Handle CSV import
   */
  const handleCSVImport = useCallback(
    async (importedItems: Array<{ sku: string; quantity: number }>) => {
      await lookupAndSetItems(importedItems);
      setActiveTab('manual');
    },
    [lookupAndSetItems]
  );

  /**
   * Handle reorder
   */
  const handleReorder = useCallback(
    async (orderId: string) => {
      const orderItems = getMockOrderItems(orderId);
      await lookupAndSetItems(orderItems);
      setActiveTab('manual');
    },
    [lookupAndSetItems]
  );

  /**
   * Handle add products from history
   */
  const handleAddProducts = useCallback(
    async (products: Array<{ sku: string; quantity: number }>) => {
      // Merge with existing items
      const existingSkus = new Set(items.map((i) => i.sku));
      const newProducts = products.filter((p) => !existingSkus.has(p.sku));

      if (newProducts.length > 0) {
        const allItems = [
          ...items.filter((i) => i.sku).map((i) => ({ sku: i.sku, quantity: i.quantity })),
          ...newProducts,
        ];
        await lookupAndSetItems(allItems);
      }

      // Update quantities for existing items
      products.forEach((product) => {
        if (existingSkus.has(product.sku)) {
          setItems((prev) =>
            prev.map((item) =>
              item.sku === product.sku
                ? { ...item, quantity: item.quantity + product.quantity }
                : item
            )
          );
        }
      });

      setActiveTab('manual');
    },
    [items, lookupAndSetItems]
  );

  /**
   * Validate order before adding to cart
   */
  const handleValidate = useCallback(async () => {
    const result = await validateBulkOrder(items);
    setValidationResult(result);

    if (!result.isValid) {
      setShowValidation(true);
    }

    return result;
  }, [items, validateBulkOrder]);

  /**
   * Add to cart
   */
  const handleAddToCart = useCallback(async () => {
    setIsAddingToCart(true);

    try {
      const result = await handleValidate();

      if (result.isValid) {
        // In production, this would call the cart API
        console.log('Adding to cart:', result.validItems);
        alert(`${result.validItems.length} articles ajoutes au panier!`);
        setItems([]);
      }
    } finally {
      setIsAddingToCart(false);
    }
  }, [handleValidate]);

  /**
   * Add only available items to cart
   */
  const handleAddAvailableOnly = useCallback(async () => {
    setIsAddingToCart(true);

    try {
      const validItems = items.filter((item) => item.isValid);
      if (validItems.length > 0) {
        // In production, this would call the cart API
        console.log('Adding to cart (available only):', validItems);
        alert(`${validItems.length} articles disponibles ajoutes au panier!`);

        // Keep only invalid items
        setItems(items.filter((item) => !item.isValid));
        setShowValidation(false);
        setValidationResult(null);
      }
    } finally {
      setIsAddingToCart(false);
    }
  }, [items]);

  /**
   * Apply corrections from validation panel
   */
  const handleApplyCorrections = useCallback(
    async (
      corrections: Array<{
        index: number;
        action: 'ignore' | 'correct' | 'replace';
        sku?: string;
        quantity?: number;
      }>
    ) => {
      const newItems = [...items];
      const indicesToRemove: number[] = [];

      corrections.forEach((correction) => {
        if (correction.action === 'ignore') {
          indicesToRemove.push(correction.index);
        } else if (correction.action === 'correct' || correction.action === 'replace') {
          const item = newItems[correction.index];
          if (item) {
            newItems[correction.index] = {
              ...item,
              sku: correction.sku ?? item.sku,
              quantity: correction.quantity ?? item.quantity,
            };
          }
        }
      });

      // Remove ignored items
      const filteredItems = newItems.filter((_, idx) => !indicesToRemove.includes(idx));

      // Re-lookup to validate corrections
      await lookupAndSetItems(
        filteredItems
          .filter((i) => i.sku)
          .map((i) => ({ sku: i.sku, quantity: i.quantity }))
      );

      setShowValidation(false);
      setValidationResult(null);
    },
    [items, lookupAndSetItems]
  );

  /**
   * Ignore all errors
   */
  const handleIgnoreAll = useCallback(() => {
    const validItems = items.filter((item) => item.isValid);
    setItems(validItems);
    setShowValidation(false);
    setValidationResult(null);
  }, [items]);

  // Show loading state while B2B context initializes
  if (!isReady || isLoading) {
    return <PageLoader message="Chargement..." />;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-sans text-heading-3 text-content-primary">Commande rapide</h1>
          <p className="mt-1 font-sans text-body text-content-muted">
            Saisissez vos references produits pour une commande express
          </p>
        </div>
        <Link
          href="/commandes"
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2',
            'bg-white border border-stroke-light text-content-secondary rounded-lg',
            'font-sans text-body-sm font-medium',
            'hover:bg-surface-secondary transition-colors duration-200'
          )}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Retour aux commandes
        </Link>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Order form area */}
        <div className="xl:col-span-3 space-y-6">
          {/* Validation panel */}
          {showValidation && validationResult && !validationResult.isValid && (
            <BulkOrderValidation
              validationResult={validationResult}
              items={items}
              productCatalog={productCatalog}
              onApplyCorrections={handleApplyCorrections}
              onIgnoreAll={handleIgnoreAll}
              onClose={() => setShowValidation(false)}
            />
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start">
              <TabsTrigger
                value="manual"
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                }
              >
                Saisie manuelle
              </TabsTrigger>
              <TabsTrigger
                value="csv"
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                }
              >
                Import CSV
              </TabsTrigger>
              <TabsTrigger
                value="reorder"
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                }
              >
                Recommander
              </TabsTrigger>
            </TabsList>

            {/* Manual entry tab */}
            <TabsContent value="manual">
              <div className="bg-white rounded-lg border border-stroke-light p-6">
                <QuickOrderForm
                  productCatalog={productCatalog}
                  onItemsChange={handleItemsChange}
                  initialItems={items}
                  minRows={5}
                  maxRows={100}
                />
              </div>
            </TabsContent>

            {/* CSV Import tab */}
            <TabsContent value="csv">
              <div className="bg-white rounded-lg border border-stroke-light p-6">
                <CSVImport
                  productCatalog={productCatalog}
                  onImport={handleCSVImport}
                  onCancel={() => setActiveTab('manual')}
                />
              </div>
            </TabsContent>

            {/* Reorder tab */}
            <TabsContent value="reorder">
              <div className="bg-white rounded-lg border border-stroke-light p-6">
                <ReorderList
                  orders={orders}
                  productCatalog={productCatalog}
                  onReorder={handleReorder}
                  onAddProducts={handleAddProducts}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Summary sidebar */}
        <div className="xl:col-span-1">
          <QuickOrderSummary
            items={items}
            onAddToCart={handleAddToCart}
            onAddAvailableOnly={handleAddAvailableOnly}
            onViewErrors={() => setShowValidation(true)}
            isLoading={isAddingToCart}
          />

          {/* Help section */}
          <div className="mt-6 bg-surface-secondary rounded-lg p-4">
            <h3 className="font-sans text-body-sm font-medium text-content-primary mb-2">
              Besoin d&apos;aide ?
            </h3>
            <ul className="space-y-2 font-sans text-caption text-content-muted">
              <li className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-primary shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Entrez les references produits (SKU) et quantites</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-primary shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>L&apos;auto-completion vous aide a trouver les produits</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-primary shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Importez un fichier CSV pour les commandes volumineuses</span>
              </li>
            </ul>

            <Link
              href="/aide/commande-rapide"
              className={cn(
                'inline-flex items-center gap-1 mt-4',
                'font-sans text-caption font-medium text-primary-600',
                'hover:text-primary-700 hover:underline'
              )}
            >
              En savoir plus
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
