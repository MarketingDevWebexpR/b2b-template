'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { QuickOrderRow } from './QuickOrderRow';
import type { BulkOrderItem, ProductCatalogEntry } from '@maison/types';

/**
 * Internal row type with required fields
 */
interface QuickOrderRowData {
  id: string;
  sku: string;
  quantity: number;
  product?: ProductCatalogEntry;
  isValid?: boolean;
  unitPrice?: number;
  lineTotal?: number;
  errors?: string[];
}

/**
 * Props for QuickOrderForm component
 */
export interface QuickOrderFormProps {
  /** Product catalog for lookups */
  productCatalog: Record<string, ProductCatalogEntry>;
  /** Callback when items change */
  onItemsChange?: (items: BulkOrderItem[]) => void;
  /** Initial items to populate */
  initialItems?: BulkOrderItem[];
  /** Minimum number of rows to display */
  minRows?: number;
  /** Maximum number of rows allowed */
  maxRows?: number;
}

/**
 * Generate unique ID for rows
 */
function generateRowId(): string {
  return `row-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create an empty row
 */
function createEmptyRow(): QuickOrderRowData {
  return {
    id: generateRowId(),
    sku: '',
    quantity: 1,
  };
}

/**
 * QuickOrderForm Component
 *
 * Grid-based form for rapid product entry with:
 * - Dynamic row addition/removal
 * - Real-time validation
 * - Running total calculation
 * - Keyboard navigation (Tab/Enter)
 *
 * @example
 * ```tsx
 * <QuickOrderForm
 *   productCatalog={catalog}
 *   onItemsChange={(items) => console.log(items)}
 *   minRows={5}
 * />
 * ```
 */
export function QuickOrderForm({
  productCatalog,
  onItemsChange,
  initialItems = [],
  minRows = 5,
  maxRows = 100,
}: QuickOrderFormProps) {
  // Initialize rows from initial items or create empty rows
  const [rows, setRows] = useState<QuickOrderRowData[]>(() => {
    if (initialItems.length > 0) {
      return initialItems.map((item) => ({
        id: generateRowId(),
        sku: item.sku,
        quantity: item.quantity,
        product: item.product,
        isValid: item.isValid,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        errors: item.errors,
      }));
    }
    // Create minimum number of empty rows
    return Array.from({ length: minRows }, () => createEmptyRow());
  });

  // Track which row should auto-focus
  const [focusRowIndex, setFocusRowIndex] = useState<number | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  /**
   * Lookup product and calculate line total
   */
  const lookupProduct = useCallback(
    (sku: string, quantity: number): Partial<QuickOrderRowData> => {
      if (!sku) {
        return {
          product: undefined,
          isValid: undefined,
          unitPrice: undefined,
          lineTotal: undefined,
          errors: undefined,
        };
      }

      const normalizedSku = sku.toUpperCase().trim();
      const product = productCatalog[normalizedSku];

      if (!product) {
        return {
          product: undefined,
          isValid: false,
          unitPrice: undefined,
          lineTotal: undefined,
          errors: ['Reference inconnue'],
        };
      }

      const availableStock = product.availableStock ?? 0;
      const unitPrice = product.unitPrice ?? 0;
      const isValid = availableStock >= quantity;
      const errors: string[] = [];

      if (!isValid) {
        errors.push(`Stock insuffisant (${formatNumber(availableStock)} disponibles)`);
      }

      if (product.minQuantity && quantity < product.minQuantity) {
        errors.push(`Quantite minimum: ${product.minQuantity}`);
      }

      if (product.maxQuantity && quantity > product.maxQuantity) {
        errors.push(`Quantite maximum: ${product.maxQuantity}`);
      }

      return {
        product,
        isValid: errors.length === 0,
        unitPrice,
        lineTotal: unitPrice * quantity,
        errors: errors.length > 0 ? errors : undefined,
      };
    },
    [productCatalog]
  );

  /**
   * Notify parent of items change
   */
  const notifyChange = useCallback(
    (newRows: QuickOrderRowData[]) => {
      if (onItemsChange) {
        const validItems = newRows
          .filter((row) => row.sku)
          .map((row) => ({
            sku: row.sku,
            quantity: row.quantity,
            product: row.product,
            isValid: row.isValid ?? false,
            unitPrice: row.unitPrice,
            lineTotal: row.lineTotal,
            errors: row.errors,
          }));
        onItemsChange(validItems);
      }
    },
    [onItemsChange]
  );

  /**
   * Handle SKU change for a row
   */
  const handleSkuChange = useCallback(
    (index: number, sku: string) => {
      setRows((prev) => {
        const newRows = [...prev];
        const row = newRows[index];
        const lookupResult = lookupProduct(sku, row.quantity);
        newRows[index] = {
          ...row,
          sku,
          ...lookupResult,
        };
        notifyChange(newRows);
        return newRows;
      });
    },
    [lookupProduct, notifyChange]
  );

  /**
   * Handle quantity change for a row
   */
  const handleQuantityChange = useCallback(
    (index: number, quantity: number) => {
      setRows((prev) => {
        const newRows = [...prev];
        const row = newRows[index];
        const lookupResult = lookupProduct(row.sku, quantity);
        newRows[index] = {
          ...row,
          quantity,
          ...lookupResult,
        };
        notifyChange(newRows);
        return newRows;
      });
    },
    [lookupProduct, notifyChange]
  );

  /**
   * Remove a row
   */
  const handleRemoveRow = useCallback(
    (index: number) => {
      setRows((prev) => {
        // Don't remove if we're at minimum rows
        if (prev.length <= minRows) {
          // Just clear the row instead
          const newRows = [...prev];
          newRows[index] = createEmptyRow();
          notifyChange(newRows);
          return newRows;
        }
        const newRows = prev.filter((_, i) => i !== index);
        notifyChange(newRows);
        return newRows;
      });
    },
    [minRows, notifyChange]
  );

  /**
   * Add a new row
   */
  const handleAddRow = useCallback(() => {
    if (rows.length >= maxRows) return;

    setRows((prev) => {
      const newRows = [...prev, createEmptyRow()];
      return newRows;
    });
    // Focus the new row
    setFocusRowIndex(rows.length);
  }, [rows.length, maxRows]);

  /**
   * Handle Enter press on a row - add new row if last, or focus next
   */
  const handleEnterPress = useCallback(
    (index: number) => {
      if (index === rows.length - 1) {
        // Last row - add new row
        handleAddRow();
      } else {
        // Focus next row
        setFocusRowIndex(index + 1);
      }
    },
    [rows.length, handleAddRow]
  );

  /**
   * Clear all rows
   */
  const handleClearAll = useCallback(() => {
    const emptyRows = Array.from({ length: minRows }, () => createEmptyRow());
    setRows(emptyRows);
    notifyChange(emptyRows);
    setFocusRowIndex(0);
  }, [minRows, notifyChange]);

  /**
   * Calculate summary statistics
   */
  const summary = useMemo(() => {
    const filledRows = rows.filter((row) => row.sku);
    const validRows = filledRows.filter((row) => row.isValid);
    const errorRows = filledRows.filter((row) => row.isValid === false);

    const totalQuantity = filledRows.reduce((sum, row) => sum + row.quantity, 0);
    const totalAmount = validRows.reduce((sum, row) => sum + (row.lineTotal ?? 0), 0);

    return {
      totalReferences: filledRows.length,
      validCount: validRows.length,
      errorCount: errorRows.length,
      totalQuantity,
      totalAmount,
      hasErrors: errorRows.length > 0,
    };
  }, [rows]);

  // Reset focus index after render
  if (focusRowIndex !== null) {
    setTimeout(() => setFocusRowIndex(null), 100);
  }

  return (
    <div ref={formRef} className="space-y-4">
      {/* Header row */}
      <div
        className={cn(
          'grid grid-cols-12 gap-3 px-3 py-2',
          'font-sans text-caption font-medium text-neutral-600 uppercase tracking-wider'
        )}
        role="row"
        aria-hidden="true"
      >
        <div className="col-span-1" />
        <div className="col-span-4">Reference</div>
        <div className="col-span-2 text-center">Qte</div>
        <div className="col-span-2 text-right">Prix unit.</div>
        <div className="col-span-2 text-right">Total</div>
        <div className="col-span-1" />
      </div>

      {/* Rows */}
      <div className="space-y-2" role="rowgroup">
        {rows.map((row, index) => (
          <QuickOrderRow
            key={row.id}
            item={row}
            index={index}
            productCatalog={productCatalog}
            onSkuChange={handleSkuChange}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemoveRow}
            onEnterPress={handleEnterPress}
            autoFocus={focusRowIndex === index}
            disableRemove={rows.length <= 1}
          />
        ))}
      </div>

      {/* Actions row */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAddRow}
            disabled={rows.length >= maxRows}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2',
              'bg-white border border-neutral-200 text-neutral-600 rounded-lg',
              'font-sans text-body-sm font-medium',
              'hover:bg-neutral-100 hover:border-accent/30 hover:text-accent',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-neutral-200 disabled:hover:text-neutral-600',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30'
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Ajouter une ligne
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            disabled={summary.totalReferences === 0}
            className={cn(
              'px-4 py-2',
              'text-neutral-500 rounded-lg',
              'font-sans text-body-sm',
              'hover:text-red-600 hover:bg-red-50',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-neutral-500 disabled:hover:bg-transparent',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-red-200'
            )}
          >
            Tout effacer
          </button>
        </div>

        {/* Running total */}
        <div className="flex items-center gap-6 text-right">
          <div>
            <p className="font-sans text-caption text-neutral-500">
              {formatNumber(summary.totalReferences)} ref. / {formatNumber(summary.totalQuantity)}{' '}
              articles
            </p>
            {summary.hasErrors && (
              <p className="font-sans text-caption text-red-600">
                {formatNumber(summary.errorCount)} erreur{summary.errorCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="pl-6 border-l border-neutral-200">
            <p className="font-sans text-caption text-neutral-500">Total HT</p>
            <p className="font-sans font-semibold text-heading-5 text-neutral-900">
              {formatCurrency(summary.totalAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      <p className="font-sans text-caption text-neutral-500 text-center">
        Utilisez <kbd className="px-1.5 py-0.5 bg-neutral-100 rounded text-xs">Tab</kbd> ou{' '}
        <kbd className="px-1.5 py-0.5 bg-neutral-100 rounded text-xs">Entree</kbd> pour
        naviguer rapidement entre les champs
      </p>
    </div>
  );
}

export default QuickOrderForm;
