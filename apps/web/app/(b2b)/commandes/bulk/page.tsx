'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { useB2B } from '@/contexts/B2BContext';
import { PageLoader, EmptyState, StatsGrid } from '@/components/b2b';
import type { BulkOrderItem } from '@maison/types';

/**
 * Bulk Order Page
 *
 * Allows B2B users to import products via CSV or add them manually
 * for bulk ordering. Uses the B2B context for product lookup and validation.
 */
export default function BulkOrderPage() {
  const { isReady, isLoading, productCatalog, lookupProducts } = useB2B();
  const [items, setItems] = useState<BulkOrderItem[]>([]);
  const [csvContent, setCsvContent] = useState('');
  const [manualSku, setManualSku] = useState('');
  const [manualQty, setManualQty] = useState(1);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  /**
   * Lookup a single product with quantity validation
   */
  const lookupProduct = useCallback(
    (sku: string, quantity: number): BulkOrderItem => {
      const normalizedSku = sku.toUpperCase().trim();
      const product = productCatalog[normalizedSku];

      if (!product) {
        return {
          sku: normalizedSku,
          name: 'Produit non trouve',
          quantity,
          unitPrice: 0,
          available: false,
          stock: 0,
          error: 'SKU inconnu',
        };
      }

      const available = product.stock >= quantity;
      return {
        sku: normalizedSku,
        name: product.name,
        quantity,
        unitPrice: product.price,
        available,
        stock: product.stock,
        error: available ? undefined : `Stock insuffisant (${formatNumber(product.stock)} disponibles)`,
      };
    },
    [productCatalog]
  );

  /**
   * Handle CSV import with validation
   */
  const handleCsvImport = useCallback(async () => {
    setImportError(null);
    setIsImporting(true);

    try {
      const lines = csvContent.trim().split('\n');
      const parsedItems: Array<{ sku: string; quantity: number }> = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;

        // Skip header row if detected
        if (
          line.toLowerCase().includes('sku') &&
          (line.toLowerCase().includes('quantity') || line.toLowerCase().includes('quantite'))
        ) {
          continue;
        }

        const parts = line.split(/[,;\t]/);
        if (parts.length < 2) {
          setImportError(`Ligne ${i + 1}: Format invalide (SKU,Quantite attendu)`);
          setIsImporting(false);
          return;
        }

        const sku = parts[0]?.trim() ?? '';
        const qty = parseInt(parts[1]?.trim() ?? '0', 10);

        if (!sku) {
          setImportError(`Ligne ${i + 1}: SKU manquant`);
          setIsImporting(false);
          return;
        }

        if (isNaN(qty) || qty <= 0) {
          setImportError(`Ligne ${i + 1}: Quantite invalide`);
          setIsImporting(false);
          return;
        }

        parsedItems.push({ sku, quantity: qty });
      }

      if (parsedItems.length === 0) {
        setImportError('Aucun produit valide trouve dans le CSV');
        setIsImporting(false);
        return;
      }

      // Use context lookup for batch processing
      const quantities: Record<string, number> = {};
      const skus = parsedItems.map((item) => {
        quantities[item.sku.toUpperCase()] = item.quantity;
        return item.sku;
      });

      const lookedUpItems = await lookupProducts(skus, quantities);
      setItems(lookedUpItems);
      setCsvContent('');
    } catch (error) {
      setImportError('Erreur lors de l\'import du CSV');
      console.error('CSV import error:', error);
    } finally {
      setIsImporting(false);
    }
  }, [csvContent, lookupProducts]);

  /**
   * Handle manual product addition
   */
  const handleManualAdd = useCallback(() => {
    if (!manualSku.trim()) return;

    const normalizedSku = manualSku.toUpperCase().trim();
    const existingIndex = items.findIndex((item) => item.sku === normalizedSku);

    if (existingIndex >= 0) {
      // Update existing item quantity
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex
            ? lookupProduct(item.sku, item.quantity + manualQty)
            : item
        )
      );
    } else {
      // Add new item
      setItems((prev) => [...prev, lookupProduct(manualSku, manualQty)]);
    }

    setManualSku('');
    setManualQty(1);
  }, [manualSku, manualQty, items, lookupProduct]);

  /**
   * Update item quantity
   */
  const updateQuantity = useCallback(
    (index: number, newQty: number) => {
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === index ? lookupProduct(item.sku, Math.max(1, newQty)) : item
        )
      );
    },
    [lookupProduct]
  );

  /**
   * Remove item from list
   */
  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  /**
   * Clear all items
   */
  const clearAll = useCallback(() => {
    setItems([]);
    setImportError(null);
  }, []);

  /**
   * Computed values for summary
   */
  const summary = useMemo(() => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const errorCount = items.filter((item) => item.error).length;
    const availableItems = items.filter((item) => item.available);

    return {
      totalItems: items.length,
      totalQuantity,
      totalAmount,
      errorCount,
      hasErrors: errorCount > 0,
      availableItems,
      availableCount: availableItems.length,
    };
  }, [items]);

  /**
   * Stats for the summary grid
   */
  const summaryStats = useMemo(
    () => [
      {
        label: 'References',
        value: formatNumber(summary.totalItems),
      },
      {
        label: 'Articles',
        value: formatNumber(summary.totalQuantity),
      },
      {
        label: 'Erreurs',
        value: formatNumber(summary.errorCount),
        color: summary.hasErrors ? ('red' as const) : ('default' as const),
      },
    ],
    [summary]
  );

  // Show loading state while B2B context initializes
  if (!isReady || isLoading) {
    return <PageLoader message="Chargement..." />;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-heading-3 text-text-primary">
            Commande en lot
          </h1>
          <p className="mt-1 font-sans text-body text-text-muted">
            Importez une liste de produits par CSV ou ajoutez-les manuellement
          </p>
        </div>
        <Link
          href="/commandes"
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2',
            'bg-white border border-border-light text-text-secondary rounded-soft',
            'font-sans text-body-sm font-medium',
            'hover:bg-background-muted transition-colors duration-200'
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Import Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* CSV Import */}
          <div className="bg-white rounded-soft border border-border-light">
            <div className="p-6 border-b border-border-light">
              <h2 className="font-serif text-heading-5 text-text-primary">
                Import CSV
              </h2>
              <p className="mt-1 font-sans text-body-sm text-text-muted">
                Format: SKU,Quantite (une ligne par produit)
              </p>
            </div>
            <div className="p-6 space-y-4">
              <textarea
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                placeholder="BRA-001,5&#10;COL-002,10&#10;BAG-001,3"
                rows={6}
                aria-label="Contenu CSV"
                className={cn(
                  'w-full px-3 py-2',
                  'bg-white border border-border-light rounded-soft',
                  'font-mono text-body-sm text-text-primary',
                  'placeholder:text-text-muted',
                  'focus:outline-none focus:ring-2 focus:ring-hermes-200 focus:border-hermes-500',
                  'resize-none'
                )}
              />
              {importError && (
                <p className="font-sans text-caption text-red-600" role="alert">
                  {importError}
                </p>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCsvImport}
                  disabled={!csvContent.trim() || isImporting}
                  className={cn(
                    'px-4 py-2 rounded-soft',
                    'font-sans text-body-sm font-medium',
                    'bg-hermes-500 text-white hover:bg-hermes-600',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'transition-colors duration-200'
                  )}
                >
                  {isImporting ? 'Import en cours...' : 'Importer'}
                </button>
                <span className="font-sans text-caption text-text-muted">
                  ou glissez-deposez un fichier CSV
                </span>
              </div>
            </div>
          </div>

          {/* Manual Add */}
          <div className="bg-white rounded-soft border border-border-light">
            <div className="p-6 border-b border-border-light">
              <h2 className="font-serif text-heading-5 text-text-primary">
                Ajout manuel
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label
                    htmlFor="manual-sku"
                    className="block font-sans text-caption font-medium text-text-secondary mb-1"
                  >
                    SKU
                  </label>
                  <input
                    id="manual-sku"
                    type="text"
                    value={manualSku}
                    onChange={(e) => setManualSku(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleManualAdd();
                      }
                    }}
                    placeholder="Ex: BRA-001"
                    className={cn(
                      'w-full px-3 py-2',
                      'bg-white border border-border-light rounded-soft',
                      'font-sans text-body-sm text-text-primary',
                      'placeholder:text-text-muted',
                      'focus:outline-none focus:ring-2 focus:ring-hermes-200 focus:border-hermes-500'
                    )}
                  />
                </div>
                <div className="w-24">
                  <label
                    htmlFor="manual-qty"
                    className="block font-sans text-caption font-medium text-text-secondary mb-1"
                  >
                    Quantite
                  </label>
                  <input
                    id="manual-qty"
                    type="number"
                    min={1}
                    value={manualQty}
                    onChange={(e) =>
                      setManualQty(parseInt(e.target.value, 10) || 1)
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleManualAdd();
                      }
                    }}
                    className={cn(
                      'w-full px-3 py-2',
                      'bg-white border border-border-light rounded-soft',
                      'font-sans text-body-sm text-text-primary',
                      'focus:outline-none focus:ring-2 focus:ring-hermes-200 focus:border-hermes-500'
                    )}
                  />
                </div>
                <button
                  onClick={handleManualAdd}
                  disabled={!manualSku.trim()}
                  className={cn(
                    'px-4 py-2 rounded-soft',
                    'font-sans text-body-sm font-medium',
                    'bg-hermes-500 text-white hover:bg-hermes-600',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'transition-colors duration-200'
                  )}
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>

          {/* Items List */}
          {items.length === 0 ? (
            <EmptyState
              icon="cart"
              message="Aucun produit dans la commande"
              description="Importez un fichier CSV ou ajoutez des produits manuellement"
            />
          ) : (
            <div className="bg-white rounded-soft border border-border-light">
              <div className="p-4 border-b border-border-light flex items-center justify-between">
                <h2 className="font-serif text-heading-5 text-text-primary">
                  Produits ({formatNumber(items.length)})
                </h2>
                <button
                  onClick={clearAll}
                  className="font-sans text-caption text-red-600 hover:text-red-700"
                >
                  Tout effacer
                </button>
              </div>
              <div className="divide-y divide-border-light">
                {items.map((item, index) => (
                  <div
                    key={`${item.sku}-${index}`}
                    className={cn(
                      'p-4 flex items-center gap-4',
                      item.error && 'bg-red-50'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-body-sm font-medium text-hermes-500">
                          {item.sku}
                        </span>
                        {!item.available && (
                          <svg
                            className="w-4 h-4 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-label="Produit indisponible"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <p className="font-sans text-body-sm text-text-secondary truncate">
                        {item.name}
                      </p>
                      {item.error && (
                        <p className="font-sans text-caption text-red-600">
                          {item.error}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        aria-label="Diminuer la quantite"
                        className={cn(
                          'w-8 h-8 flex items-center justify-center rounded-soft',
                          'bg-background-muted text-text-secondary hover:bg-border-light',
                          'transition-colors duration-200'
                        )}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            index,
                            parseInt(e.target.value, 10) || 1
                          )
                        }
                        aria-label={`Quantite pour ${item.sku}`}
                        className={cn(
                          'w-16 px-2 py-1 text-center',
                          'bg-white border border-border-light rounded-soft',
                          'font-sans text-body-sm text-text-primary',
                          'focus:outline-none focus:ring-2 focus:ring-hermes-200 focus:border-hermes-500'
                        )}
                      />
                      <button
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        aria-label="Augmenter la quantite"
                        className={cn(
                          'w-8 h-8 flex items-center justify-center rounded-soft',
                          'bg-background-muted text-text-secondary hover:bg-border-light',
                          'transition-colors duration-200'
                        )}
                      >
                        +
                      </button>
                    </div>
                    <div className="w-24 text-right">
                      <p className="font-sans text-body-sm font-medium text-text-primary">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </p>
                      <p className="font-sans text-caption text-text-muted">
                        {formatCurrency(item.unitPrice)} /u
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      aria-label={`Supprimer ${item.sku}`}
                      className={cn(
                        'p-2 rounded-soft',
                        'text-text-muted hover:text-red-600 hover:bg-red-50',
                        'transition-colors duration-200'
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
                          strokeWidth={1.5}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-soft border border-border-light sticky top-6">
            <div className="p-6 border-b border-border-light">
              <h2 className="font-serif text-heading-5 text-text-primary">
                Recapitulatif
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Stats Grid */}
              <StatsGrid stats={summaryStats} columns={3} />

              {/* Total */}
              <div className="pt-4 border-t border-border-light">
                <div className="flex justify-between">
                  <span className="font-sans text-body font-medium text-text-primary">
                    Total HT
                  </span>
                  <span className="font-serif text-heading-4 text-text-primary">
                    {formatCurrency(summary.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <button
                disabled={items.length === 0 || summary.hasErrors}
                className={cn(
                  'w-full px-4 py-3 rounded-soft',
                  'font-sans text-body-sm font-medium',
                  'bg-hermes-500 text-white hover:bg-hermes-600',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-colors duration-200'
                )}
              >
                Ajouter au panier
              </button>

              {summary.hasErrors && (
                <button
                  onClick={() => setItems(summary.availableItems)}
                  className={cn(
                    'w-full px-4 py-2 rounded-soft',
                    'font-sans text-caption font-medium',
                    'bg-white border border-border-light text-text-secondary',
                    'hover:bg-background-muted',
                    'transition-colors duration-200'
                  )}
                >
                  Ajouter uniquement les produits disponibles (
                  {formatNumber(summary.availableCount)})
                </button>
              )}
            </div>
          </div>

          {/* Help */}
          <div className="bg-background-muted rounded-soft p-4">
            <h3 className="font-sans text-body-sm font-medium text-text-primary mb-2">
              Besoin d&apos;aide ?
            </h3>
            <p className="font-sans text-caption text-text-muted mb-3">
              Telechargez notre modele CSV pour faciliter l&apos;import de vos
              produits.
            </p>
            <button
              className={cn(
                'w-full px-3 py-2 rounded-soft',
                'font-sans text-caption font-medium',
                'bg-white border border-border-light text-text-secondary',
                'hover:bg-white hover:border-hermes-300',
                'transition-colors duration-200'
              )}
            >
              Telecharger le modele CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
