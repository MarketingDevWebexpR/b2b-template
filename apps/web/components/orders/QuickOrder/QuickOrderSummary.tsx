'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import type { BulkOrderItem, BulkOrderSummary as BulkOrderSummaryType } from '@maison/types';

/**
 * Props for QuickOrderSummary component
 */
export interface QuickOrderSummaryProps {
  /** Current order items */
  items: BulkOrderItem[];
  /** Callback to add valid items to cart */
  onAddToCart: () => void;
  /** Callback to add only available items (when errors exist) */
  onAddAvailableOnly?: () => void;
  /** Callback to view/fix validation errors */
  onViewErrors?: () => void;
  /** Whether add to cart is loading */
  isLoading?: boolean;
  /** Currency code */
  currency?: string;
}

/**
 * QuickOrderSummary Component
 *
 * Summary panel showing:
 * - Number of valid articles
 * - Articles with errors (stock, unknown ref)
 * - Estimated total
 * - Add to cart button
 *
 * @example
 * ```tsx
 * <QuickOrderSummary
 *   items={orderItems}
 *   onAddToCart={() => handleAddToCart()}
 *   onViewErrors={() => setShowValidation(true)}
 * />
 * ```
 */
export function QuickOrderSummary({
  items,
  onAddToCart,
  onAddAvailableOnly,
  onViewErrors,
  isLoading = false,
  currency = 'EUR',
}: QuickOrderSummaryProps) {
  /**
   * Calculate summary statistics
   */
  const summary = useMemo((): BulkOrderSummaryType & {
    validItems: BulkOrderItem[];
    invalidItems: BulkOrderItem[];
    warningItems: BulkOrderItem[];
  } => {
    const filledItems = items.filter((item) => item.sku);
    const validItems = filledItems.filter((item) => item.isValid);
    const invalidItems = filledItems.filter((item) => item.isValid === false);
    const warningItems = filledItems.filter(
      (item) =>
        item.isValid !== false &&
        item.product &&
        item.quantity > (item.product.availableStock ?? 0) * 0.8
    );

    const totalQuantity = filledItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = validItems.reduce((sum, item) => sum + (item.lineTotal ?? 0), 0);

    return {
      totalItems: filledItems.length,
      totalQuantity,
      totalAmount,
      currency,
      errorCount: invalidItems.length,
      availableCount: validItems.length,
      validItems,
      invalidItems,
      warningItems,
    };
  }, [items, currency]);

  const hasItems = summary.totalItems > 0;
  const hasErrors = summary.errorCount > 0;
  const hasWarnings = summary.warningItems.length > 0;
  const canAddToCart = summary.availableCount > 0;

  return (
    <div className="bg-white rounded-lg border border-neutral-200 sticky top-6">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <h2 className="font-sans font-semibold text-heading-5 text-neutral-900">Recapitulatif</h2>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-neutral-100 rounded-lg">
            <p className="font-sans font-semibold text-heading-4 text-neutral-900">
              {formatNumber(summary.totalItems)}
            </p>
            <p className="font-sans text-caption text-neutral-500">
              Reference{summary.totalItems > 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-center p-3 bg-neutral-100 rounded-lg">
            <p className="font-sans font-semibold text-heading-4 text-neutral-900">
              {formatNumber(summary.totalQuantity)}
            </p>
            <p className="font-sans text-caption text-neutral-500">Articles</p>
          </div>
          <div
            className={cn(
              'text-center p-3 rounded-lg',
              hasErrors ? 'bg-red-50' : 'bg-green-50'
            )}
          >
            <p
              className={cn(
                'font-sans font-semibold text-heading-4',
                hasErrors ? 'text-red-600' : 'text-green-600'
              )}
            >
              {formatNumber(summary.errorCount)}
            </p>
            <p
              className={cn(
                'font-sans text-caption',
                hasErrors ? 'text-red-500' : 'text-green-500'
              )}
            >
              Erreur{summary.errorCount > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Valid items info */}
        {hasItems && (
          <div className="pt-4 border-t border-neutral-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-sans text-body-sm text-neutral-600">
                Articles valides
              </span>
              <span className="font-sans text-body-sm font-medium text-green-600">
                {formatNumber(summary.availableCount)}
              </span>
            </div>

            {hasWarnings && (
              <div className="flex items-center justify-between">
                <span className="font-sans text-body-sm text-neutral-600">
                  Stock faible
                </span>
                <span className="font-sans text-body-sm font-medium text-amber-600">
                  {formatNumber(summary.warningItems.length)}
                </span>
              </div>
            )}

            {hasErrors && (
              <div className="flex items-center justify-between">
                <span className="font-sans text-body-sm text-neutral-600">
                  Articles en erreur
                </span>
                <span className="font-sans text-body-sm font-medium text-red-600">
                  {formatNumber(summary.errorCount)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error details preview */}
        {hasErrors && summary.invalidItems.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-body-sm font-medium text-red-700">
                  {summary.errorCount} article{summary.errorCount > 1 ? 's' : ''} en erreur
                </p>
                <ul className="mt-1 space-y-0.5">
                  {summary.invalidItems.slice(0, 3).map((item, idx) => (
                    <li
                      key={`${item.sku}-${idx}`}
                      className="font-sans text-caption text-red-600"
                    >
                      <span className="font-mono">{item.sku}</span>
                      {item.errors?.[0] && (
                        <span className="ml-1">- {item.errors[0]}</span>
                      )}
                    </li>
                  ))}
                  {summary.invalidItems.length > 3 && (
                    <li className="font-sans text-caption text-red-500">
                      + {summary.invalidItems.length - 3} autre
                      {summary.invalidItems.length - 3 > 1 ? 's' : ''}
                    </li>
                  )}
                </ul>
                {onViewErrors && (
                  <button
                    type="button"
                    onClick={onViewErrors}
                    className="mt-2 font-sans text-caption font-medium text-red-700 hover:underline"
                  >
                    Voir toutes les erreurs
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Warning preview */}
        {hasWarnings && !hasErrors && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-amber-500 shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-sans text-body-sm font-medium text-amber-700">
                  Stock limite pour certains articles
                </p>
                <p className="mt-0.5 font-sans text-caption text-amber-600">
                  {summary.warningItems.length} produit
                  {summary.warningItems.length > 1 ? 's' : ''} proche
                  {summary.warningItems.length > 1 ? 's' : ''} de la limite de stock
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Total */}
        <div className="pt-4 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="font-sans text-body font-medium text-neutral-900">
              Total HT estime
            </span>
            <span className="font-sans font-semibold text-heading-4 text-neutral-900">
              {formatCurrency(summary.totalAmount)}
            </span>
          </div>
          {hasErrors && summary.availableCount > 0 && (
            <p className="mt-1 font-sans text-caption text-neutral-500 text-right">
              ({formatNumber(summary.availableCount)} articles valides uniquement)
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <button
            type="button"
            onClick={onAddToCart}
            disabled={!canAddToCart || isLoading}
            className={cn(
              'w-full px-4 py-3 rounded-lg',
              'font-sans text-body-sm font-medium',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus-visible:ring-accent/30 focus:ring-offset-2',
              canAddToCart && !hasErrors
                ? 'bg-accent text-white hover:bg-accent/90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Ajout en cours...
              </span>
            ) : hasErrors ? (
              'Corrigez les erreurs pour continuer'
            ) : (
              `Ajouter au panier (${formatNumber(summary.availableCount)} articles)`
            )}
          </button>

          {hasErrors && canAddToCart && onAddAvailableOnly && (
            <button
              type="button"
              onClick={onAddAvailableOnly}
              disabled={isLoading}
              className={cn(
                'w-full px-4 py-2 rounded-lg',
                'font-sans text-caption font-medium',
                'bg-white border border-neutral-200 text-neutral-600',
                'hover:bg-neutral-100 hover:border-accent/30',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors duration-200'
              )}
            >
              Ajouter uniquement les produits disponibles ({formatNumber(summary.availableCount)})
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {!hasItems && (
        <div className="px-6 pb-6">
          <div className="text-center py-4 px-3 bg-neutral-100 rounded-lg">
            <svg
              className="w-8 h-8 mx-auto text-neutral-500 mb-2"
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
            <p className="font-sans text-body-sm text-neutral-500">
              Ajoutez des produits pour voir le recapitulatif
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuickOrderSummary;
