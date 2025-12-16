'use client';

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import type {
  BulkOrderItem,
  BulkOrderValidationError,
  BulkOrderValidationWarning,
  BulkOrderValidationResult,
  ProductCatalogEntry,
} from '@maison/types';

/**
 * Action type for error handling
 */
type ErrorAction = 'ignore' | 'correct' | 'replace';

/**
 * Error item with action state
 */
interface ErrorItemState {
  error: BulkOrderValidationError;
  item: BulkOrderItem;
  action: ErrorAction | null;
  correctedSku?: string;
  correctedQuantity?: number;
}

/**
 * Props for BulkOrderValidation component
 */
export interface BulkOrderValidationProps {
  /** Validation result from bulk order */
  validationResult: BulkOrderValidationResult;
  /** Original items being validated */
  items: BulkOrderItem[];
  /** Product catalog for suggestions */
  productCatalog: Record<string, ProductCatalogEntry>;
  /** Callback to apply corrections */
  onApplyCorrections: (
    corrections: Array<{
      index: number;
      action: ErrorAction;
      sku?: string;
      quantity?: number;
    }>
  ) => void;
  /** Callback to ignore all errors and proceed */
  onIgnoreAll?: () => void;
  /** Callback to close the validation panel */
  onClose?: () => void;
}

/**
 * Get error code description
 */
function getErrorDescription(code: string): string {
  const descriptions: Record<string, string> = {
    UNKNOWN_SKU: 'Reference produit inconnue dans le catalogue',
    PRODUCT_NOT_FOUND: 'Produit introuvable',
    INSUFFICIENT_STOCK: 'Stock insuffisant pour la quantite demandee',
    INVALID_QUANTITY: 'Quantite invalide (doit etre superieure a 0)',
    PRODUCT_UNAVAILABLE: 'Produit temporairement indisponible',
    EXCEEDS_ORDER_LIMIT: 'Quantite depasse la limite de commande',
    BELOW_MIN_QUANTITY: 'Quantite inferieure au minimum requis',
    BELOW_MINIMUM: 'Commande en dessous du minimum',
  };
  return descriptions[code] ?? 'Erreur de validation';
}

/**
 * Get suggested SKUs based on partial match
 */
function getSuggestedSkus(
  sku: string,
  catalog: Record<string, ProductCatalogEntry>
): ProductCatalogEntry[] {
  if (!sku) return [];

  const normalizedSku = sku.toUpperCase();
  const suggestions: ProductCatalogEntry[] = [];

  // Find products with similar SKU
  Object.values(catalog).forEach((product) => {
    const productSku = product.sku.toUpperCase();
    // Check for partial match (contains or starts with)
    if (
      productSku.includes(normalizedSku) ||
      normalizedSku.includes(productSku) ||
      levenshteinDistance(productSku, normalizedSku) <= 2
    ) {
      suggestions.push(product);
    }
  });

  return suggestions.slice(0, 5);
}

/**
 * Simple Levenshtein distance for typo detection
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * BulkOrderValidation Component
 *
 * Detailed error list with correction options:
 * - List of all errors with descriptions
 * - Suggested corrections (similar SKUs)
 * - Actions: ignore, correct, replace
 * - Batch apply corrections
 *
 * @example
 * ```tsx
 * <BulkOrderValidation
 *   validationResult={result}
 *   items={orderItems}
 *   productCatalog={catalog}
 *   onApplyCorrections={(corrections) => handleCorrections(corrections)}
 *   onClose={() => setShowValidation(false)}
 * />
 * ```
 */
export function BulkOrderValidation({
  validationResult,
  items,
  productCatalog,
  onApplyCorrections,
  onIgnoreAll,
  onClose,
}: BulkOrderValidationProps) {
  // Initialize error states
  const [errorStates, setErrorStates] = useState<ErrorItemState[]>(() =>
    validationResult.errors.map((error) => ({
      error,
      item: items[error.row - 1] ?? { sku: '', quantity: 0, isValid: false },
      action: null,
      correctedSku: undefined,
      correctedQuantity: undefined,
    }))
  );

  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  /**
   * Get suggestions for an error
   */
  const getSuggestions = useCallback(
    (errorState: ErrorItemState): ProductCatalogEntry[] => {
      if (errorState.error.code === 'UNKNOWN_SKU' || errorState.error.code === 'PRODUCT_NOT_FOUND') {
        return getSuggestedSkus(errorState.item.sku, productCatalog);
      }
      return [];
    },
    [productCatalog]
  );

  /**
   * Set action for an error
   */
  const setErrorAction = useCallback(
    (index: number, action: ErrorAction, sku?: string, quantity?: number) => {
      setErrorStates((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          action,
          correctedSku: sku,
          correctedQuantity: quantity,
        };
        return next;
      });
    },
    []
  );

  /**
   * Apply all corrections
   */
  const handleApplyCorrections = useCallback(() => {
    const corrections = errorStates
      .filter((state) => state.action !== null)
      .map((state) => ({
        index: state.error.row - 1,
        action: state.action!,
        sku: state.correctedSku,
        quantity: state.correctedQuantity,
      }));

    onApplyCorrections(corrections);
  }, [errorStates, onApplyCorrections]);

  /**
   * Count actions
   */
  const actionCounts = useMemo(() => {
    const counts = {
      ignore: 0,
      correct: 0,
      replace: 0,
      pending: 0,
    };
    errorStates.forEach((state) => {
      if (state.action) {
        counts[state.action]++;
      } else {
        counts.pending++;
      }
    });
    return counts;
  }, [errorStates]);

  const hasActions = actionCounts.ignore + actionCounts.correct + actionCounts.replace > 0;

  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-red-50 border-b border-red-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-sans text-body font-medium text-red-800">
              {formatNumber(validationResult.errors.length)} erreur
              {validationResult.errors.length > 1 ? 's' : ''} de validation
            </h3>
            <p className="font-sans text-caption text-red-600">
              Corrigez les erreurs pour continuer la commande
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-100',
              'transition-colors duration-200'
            )}
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Warnings */}
      {validationResult.warnings.length > 0 && (
        <div className="p-4 bg-amber-50 border-b border-amber-200">
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
                {formatNumber(validationResult.warnings.length)} avertissement
                {validationResult.warnings.length > 1 ? 's' : ''}
              </p>
              <ul className="mt-1 space-y-0.5">
                {validationResult.warnings.map((warning, idx) => (
                  <li
                    key={`${warning.sku}-${idx}`}
                    className="font-sans text-caption text-amber-600"
                  >
                    <span className="font-mono">{warning.sku}</span> - {warning.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Error list */}
      <div className="divide-y divide-neutral-200 max-h-96 overflow-auto">
        {errorStates.map((state, index) => {
          const suggestions = getSuggestions(state);
          const isExpanded = expandedRow === index;

          return (
            <div
              key={`${state.error.row}-${index}`}
              className={cn(
                'transition-colors duration-200',
                state.action === 'ignore'
                  ? 'bg-gray-50'
                  : state.action === 'correct' || state.action === 'replace'
                  ? 'bg-green-50'
                  : 'bg-white'
              )}
            >
              {/* Error row */}
              <div
                className="p-4 cursor-pointer hover:bg-neutral-100/50"
                onClick={() => setExpandedRow(isExpanded ? null : index)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded-full font-sans text-caption font-medium">
                      {state.error.row}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-body-sm font-medium text-neutral-900">
                          {state.item.sku || '(vide)'}
                        </span>
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-caption">
                          {state.error.code}
                        </span>
                      </div>
                      <p className="mt-0.5 font-sans text-caption text-neutral-600">
                        {getErrorDescription(state.error.code)}
                      </p>
                      <p className="font-sans text-caption text-red-600">
                        {state.error.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {state.action && (
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-caption font-medium',
                          state.action === 'ignore'
                            ? 'bg-gray-200 text-gray-600'
                            : 'bg-green-200 text-green-700'
                        )}
                      >
                        {state.action === 'ignore'
                          ? 'Ignore'
                          : state.action === 'correct'
                          ? 'Corrige'
                          : 'Remplace'}
                      </span>
                    )}
                    <svg
                      className={cn(
                        'w-5 h-5 text-neutral-500 transition-transform duration-200',
                        isExpanded && 'rotate-180'
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expanded actions */}
              {isExpanded && (
                <div className="px-4 pb-4 pl-14 space-y-3">
                  {/* Suggestions */}
                  {suggestions.length > 0 && (
                    <div>
                      <p className="font-sans text-caption font-medium text-neutral-600 mb-2">
                        Suggestions:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.map((product) => (
                          <button
                            key={product.sku}
                            type="button"
                            onClick={() =>
                              setErrorAction(index, 'replace', product.sku, state.item.quantity)
                            }
                            className={cn(
                              'px-3 py-2 rounded-lg border transition-colors duration-200',
                              state.correctedSku === product.sku
                                ? 'border-accent bg-accent/5'
                                : 'border-neutral-200 hover:border-accent/30 hover:bg-accent/5'
                            )}
                          >
                            <span className="font-mono text-body-sm font-medium text-accent">
                              {product.sku}
                            </span>
                            <p className="font-sans text-caption text-neutral-600 truncate max-w-[150px]">
                              {product.name}
                            </p>
                            <p className="font-sans text-caption text-neutral-500">
                              {formatCurrency(product.unitPrice)} - Stock:{' '}
                              {formatNumber(product.availableStock)}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity correction for stock errors */}
                  {(state.error.code === 'INSUFFICIENT_STOCK' ||
                    state.error.code === 'EXCEEDS_ORDER_LIMIT') &&
                    state.item.product && (
                      <div>
                        <p className="font-sans text-caption font-medium text-neutral-600 mb-2">
                          Ajuster la quantite (Stock disponible:{' '}
                          {formatNumber(state.item.product.availableStock)}):
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={state.item.product.availableStock}
                            value={state.correctedQuantity ?? state.item.product.availableStock}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value, 10);
                              if (!isNaN(qty) && qty > 0) {
                                setErrorAction(index, 'correct', state.item.sku, qty);
                              }
                            }}
                            className={cn(
                              'w-24 px-3 py-2 text-center',
                              'bg-white border border-neutral-200 rounded-lg',
                              'font-sans text-body-sm text-neutral-900',
                              'focus:outline-none focus:ring-2 focus-visible:ring-accent/30'
                            )}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setErrorAction(
                                index,
                                'correct',
                                state.item.sku,
                                state.item.product!.availableStock
                              )
                            }
                            className={cn(
                              'px-3 py-2 rounded-lg',
                              'font-sans text-caption text-accent',
                              'hover:bg-accent/5',
                              'transition-colors duration-200'
                            )}
                          >
                            Utiliser le stock max
                          </button>
                        </div>
                      </div>
                    )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setErrorAction(index, 'ignore')}
                      className={cn(
                        'px-3 py-1.5 rounded-lg',
                        'font-sans text-caption',
                        'transition-colors duration-200',
                        state.action === 'ignore'
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      Ignorer cette ligne
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer with actions */}
      <div className="p-4 bg-neutral-100 border-t border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-caption">
            {actionCounts.pending > 0 && (
              <span className="text-neutral-500">
                {formatNumber(actionCounts.pending)} non traite
                {actionCounts.pending > 1 ? 's' : ''}
              </span>
            )}
            {actionCounts.ignore > 0 && (
              <span className="text-gray-600">
                {formatNumber(actionCounts.ignore)} ignore{actionCounts.ignore > 1 ? 's' : ''}
              </span>
            )}
            {actionCounts.correct + actionCounts.replace > 0 && (
              <span className="text-green-600">
                {formatNumber(actionCounts.correct + actionCounts.replace)} corrige
                {actionCounts.correct + actionCounts.replace > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {onIgnoreAll && (
              <button
                type="button"
                onClick={onIgnoreAll}
                className={cn(
                  'px-4 py-2 rounded-lg',
                  'font-sans text-body-sm text-neutral-600',
                  'hover:bg-gray-200',
                  'transition-colors duration-200'
                )}
              >
                Ignorer toutes les erreurs
              </button>
            )}

            <button
              type="button"
              onClick={handleApplyCorrections}
              disabled={!hasActions}
              className={cn(
                'px-4 py-2 rounded-lg',
                'font-sans text-body-sm font-medium',
                'bg-accent text-white',
                'hover:bg-accent/90',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors duration-200'
              )}
            >
              Appliquer les corrections
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkOrderValidation;
