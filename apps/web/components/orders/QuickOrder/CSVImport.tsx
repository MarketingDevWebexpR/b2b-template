'use client';

import {
  useState,
  useCallback,
  useRef,
  type DragEvent,
  type ChangeEvent,
} from 'react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/formatters';
import type { BulkOrderCsvParseResult, ProductCatalogEntry } from '@maison/types';

/**
 * Column mapping configuration
 */
interface ColumnMapping {
  sku: number | null;
  quantity: number | null;
}

/**
 * Parsed CSV row
 */
interface ParsedRow {
  raw: string[];
  sku: string;
  quantity: number;
  isValid: boolean;
  error?: string;
}

/**
 * Props for CSVImport component
 */
export interface CSVImportProps {
  /** Product catalog for validation preview */
  productCatalog: Record<string, ProductCatalogEntry>;
  /** Callback when import is confirmed */
  onImport: (items: Array<{ sku: string; quantity: number }>) => void;
  /** Callback to cancel/close */
  onCancel?: () => void;
}

/**
 * Default column names to detect
 */
const SKU_COLUMN_NAMES = ['sku', 'ref', 'reference', 'code', 'article', 'produit'];
const QTY_COLUMN_NAMES = ['qty', 'quantity', 'quantite', 'qte', 'nombre'];

/**
 * CSV template content
 */
const CSV_TEMPLATE = 'SKU,Quantite\nBRA-001,5\nCOL-002,10\nBAG-001,3';

/**
 * CSVImport Component
 *
 * Drag & drop CSV file import with:
 * - File upload zone (drag & drop or click)
 * - Automatic column mapping
 * - Preview of parsed data
 * - Error highlighting
 * - Downloadable template
 *
 * @example
 * ```tsx
 * <CSVImport
 *   productCatalog={catalog}
 *   onImport={(items) => handleImport(items)}
 *   onCancel={() => setShowImport(false)}
 * />
 * ```
 */
export function CSVImport({
  productCatalog,
  onImport,
  onCancel,
}: CSVImportProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    sku: null,
    quantity: null,
  });
  const [delimiter, setDelimiter] = useState<',' | ';' | '\t'>(',');
  const [hasHeader, setHasHeader] = useState(true);
  const [parseError, setParseError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Detect delimiter from content
   */
  const detectDelimiter = useCallback((content: string): ',' | ';' | '\t' => {
    const firstLine = content.split('\n')[0] ?? '';
    const semicolons = (firstLine.match(/;/g) || []).length;
    const commas = (firstLine.match(/,/g) || []).length;
    const tabs = (firstLine.match(/\t/g) || []).length;

    if (tabs > semicolons && tabs > commas) return '\t';
    if (semicolons > commas) return ';';
    return ',';
  }, []);

  /**
   * Auto-detect column mapping from headers
   */
  const autoDetectMapping = useCallback((headerRow: string[]): ColumnMapping => {
    let skuCol: number | null = null;
    let qtyCol: number | null = null;

    headerRow.forEach((header, index) => {
      const normalized = header.toLowerCase().trim();
      if (skuCol === null && SKU_COLUMN_NAMES.some((name) => normalized.includes(name))) {
        skuCol = index;
      }
      if (qtyCol === null && QTY_COLUMN_NAMES.some((name) => normalized.includes(name))) {
        qtyCol = index;
      }
    });

    // Fallback: assume first column is SKU, second is quantity
    if (skuCol === null) skuCol = 0;
    if (qtyCol === null) qtyCol = 1;

    return { sku: skuCol, quantity: qtyCol };
  }, []);

  /**
   * Parse CSV content
   */
  const parseCSV = useCallback(
    (content: string, delim: string, withHeader: boolean): void => {
      setParseError(null);

      const lines = content
        .trim()
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length === 0) {
        setParseError('Le fichier est vide');
        return;
      }

      // Parse lines
      const allRows = lines.map((line) =>
        line.split(delim).map((cell) => cell.trim().replace(/^["']|["']$/g, ''))
      );

      // Extract headers and data
      let headerRow: string[] = [];
      let dataRows: string[][] = [];

      if (withHeader) {
        headerRow = allRows[0] ?? [];
        dataRows = allRows.slice(1);
      } else {
        // Generate column names
        const numCols = allRows[0]?.length ?? 2;
        headerRow = Array.from({ length: numCols }, (_, i) => `Colonne ${i + 1}`);
        dataRows = allRows;
      }

      setHeaders(headerRow);

      // Auto-detect mapping
      const mapping = autoDetectMapping(headerRow);
      setColumnMapping(mapping);

      // Parse data rows with mapping
      const parsed: ParsedRow[] = dataRows.map((row) => {
        const sku = (mapping.sku !== null ? row[mapping.sku] : '')?.toUpperCase().trim() ?? '';
        const qtyStr = mapping.quantity !== null ? row[mapping.quantity] : '';
        const quantity = parseInt(qtyStr ?? '0', 10);

        let isValid = true;
        let error: string | undefined;

        if (!sku) {
          isValid = false;
          error = 'Reference manquante';
        } else if (isNaN(quantity) || quantity <= 0) {
          isValid = false;
          error = 'Quantite invalide';
        }

        return {
          raw: row,
          sku,
          quantity: isNaN(quantity) ? 0 : quantity,
          isValid,
          error,
        };
      });

      setParsedRows(parsed);
    },
    [autoDetectMapping]
  );

  /**
   * Handle file read
   */
  const handleFileRead = useCallback(
    (content: string, fileName: string) => {
      setCsvContent(content);
      const detectedDelim = detectDelimiter(content);
      setDelimiter(detectedDelim);
      parseCSV(content, detectedDelim, hasHeader);
    },
    [detectDelimiter, parseCSV, hasHeader]
  );

  /**
   * Handle file selection
   */
  const handleFile = useCallback(
    (selectedFile: File) => {
      if (!selectedFile.name.endsWith('.csv') && !selectedFile.type.includes('csv')) {
        setParseError('Veuillez selectionner un fichier CSV');
        return;
      }

      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          handleFileRead(content, selectedFile.name);
        }
      };
      reader.onerror = () => {
        setParseError('Erreur lors de la lecture du fichier');
      };
      reader.readAsText(selectedFile);
    },
    [handleFileRead]
  );

  /**
   * Handle drag events
   */
  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
      }
    },
    [handleFile]
  );

  /**
   * Handle file input change
   */
  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFile(selectedFile);
      }
    },
    [handleFile]
  );

  /**
   * Handle column mapping change
   */
  const handleMappingChange = useCallback(
    (field: 'sku' | 'quantity', columnIndex: number) => {
      const newMapping = { ...columnMapping, [field]: columnIndex };
      setColumnMapping(newMapping);

      // Re-parse with new mapping
      if (csvContent) {
        parseCSV(csvContent, delimiter, hasHeader);
      }
    },
    [columnMapping, csvContent, delimiter, hasHeader, parseCSV]
  );

  /**
   * Handle header toggle
   */
  const handleHeaderToggle = useCallback(() => {
    const newHasHeader = !hasHeader;
    setHasHeader(newHasHeader);
    if (csvContent) {
      parseCSV(csvContent, delimiter, newHasHeader);
    }
  }, [hasHeader, csvContent, delimiter, parseCSV]);

  /**
   * Handle delimiter change
   */
  const handleDelimiterChange = useCallback(
    (newDelim: ',' | ';' | '\t') => {
      setDelimiter(newDelim);
      if (csvContent) {
        parseCSV(csvContent, newDelim, hasHeader);
      }
    },
    [csvContent, hasHeader, parseCSV]
  );

  /**
   * Download CSV template
   */
  const handleDownloadTemplate = useCallback(() => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_commande_rapide.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }, []);

  /**
   * Confirm import
   */
  const handleConfirmImport = useCallback(() => {
    const validItems = parsedRows
      .filter((row) => row.isValid)
      .map((row) => ({
        sku: row.sku,
        quantity: row.quantity,
      }));

    onImport(validItems);
  }, [parsedRows, onImport]);

  /**
   * Reset state
   */
  const handleReset = useCallback(() => {
    setFile(null);
    setCsvContent('');
    setHeaders([]);
    setParsedRows([]);
    setParseError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Calculate stats
  const validCount = parsedRows.filter((r) => r.isValid).length;
  const errorCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      {!file && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer',
            'transition-all duration-200',
            isDragging
              ? 'border-accent bg-accent/5'
              : 'border-neutral-200 hover:border-accent/30 hover:bg-neutral-100'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleInputChange}
            className="hidden"
            aria-label="Selectionner un fichier CSV"
          />

          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                isDragging ? 'bg-accent/10' : 'bg-neutral-100'
              )}
            >
              <svg
                className={cn(
                  'w-6 h-6',
                  isDragging ? 'text-accent' : 'text-neutral-500'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            <div>
              <p className="font-sans text-body text-neutral-900">
                {isDragging ? 'Deposez le fichier ici' : 'Glissez-deposez votre fichier CSV'}
              </p>
              <p className="mt-1 font-sans text-body-sm text-neutral-500">
                ou cliquez pour parcourir
              </p>
            </div>
          </div>
        </div>
      )}

      {/* File info and controls */}
      {file && (
        <div className="bg-neutral-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-sans text-body-sm font-medium text-neutral-900">
                  {file.name}
                </p>
                <p className="font-sans text-caption text-neutral-500">
                  {formatNumber(parsedRows.length)} lignes detectees
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className={cn(
                'px-3 py-1.5 text-neutral-500 rounded-lg',
                'font-sans text-body-sm',
                'hover:text-red-600 hover:bg-red-50',
                'transition-colors duration-200'
              )}
            >
              Changer de fichier
            </button>
          </div>

          {/* Options */}
          <div className="mt-4 pt-4 border-t border-neutral-200 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={handleHeaderToggle}
                className="rounded border-neutral-200 text-accent focus:ring-accent/20"
              />
              <span className="font-sans text-body-sm text-neutral-600">
                Premiere ligne = en-tete
              </span>
            </label>

            <div className="flex items-center gap-2">
              <span className="font-sans text-body-sm text-neutral-600">Separateur:</span>
              <select
                value={delimiter}
                onChange={(e) => handleDelimiterChange(e.target.value as ',' | ';' | '\t')}
                className={cn(
                  'px-2 py-1 bg-white border border-neutral-200 rounded-lg',
                  'font-sans text-body-sm text-neutral-900',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30'
                )}
              >
                <option value=",">Virgule (,)</option>
                <option value=";">Point-virgule (;)</option>
                <option value={'\t'}>Tabulation</option>
              </select>
            </div>
          </div>

          {/* Column mapping */}
          {headers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <p className="font-sans text-caption font-medium text-neutral-600 mb-2">
                Mapping des colonnes
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="sku-mapping"
                    className="font-sans text-body-sm text-neutral-600"
                  >
                    Reference:
                  </label>
                  <select
                    id="sku-mapping"
                    value={columnMapping.sku ?? ''}
                    onChange={(e) => handleMappingChange('sku', parseInt(e.target.value, 10))}
                    className={cn(
                      'px-2 py-1 bg-white border border-neutral-200 rounded-lg',
                      'font-sans text-body-sm text-neutral-900',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30'
                    )}
                  >
                    {headers.map((header, idx) => (
                      <option key={idx} value={idx}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor="qty-mapping"
                    className="font-sans text-body-sm text-neutral-600"
                  >
                    Quantite:
                  </label>
                  <select
                    id="qty-mapping"
                    value={columnMapping.quantity ?? ''}
                    onChange={(e) => handleMappingChange('quantity', parseInt(e.target.value, 10))}
                    className={cn(
                      'px-2 py-1 bg-white border border-neutral-200 rounded-lg',
                      'font-sans text-body-sm text-neutral-900',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30'
                    )}
                  >
                    {headers.map((header, idx) => (
                      <option key={idx} value={idx}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {parseError && (
        <div
          className="bg-red-50 border border-red-200 rounded-lg p-4"
          role="alert"
        >
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="font-sans text-body-sm text-red-700">{parseError}</p>
          </div>
        </div>
      )}

      {/* Preview table */}
      {parsedRows.length > 0 && (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="font-sans text-body font-medium text-neutral-900">
              Apercu des donnees
            </h3>
            <div className="flex items-center gap-4 text-body-sm">
              <span className="text-green-600">
                {formatNumber(validCount)} valide{validCount > 1 ? 's' : ''}
              </span>
              {errorCount > 0 && (
                <span className="text-red-600">
                  {formatNumber(errorCount)} erreur{errorCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          <div className="max-h-64 overflow-auto">
            <table className="w-full">
              <thead className="bg-neutral-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left font-sans text-caption font-medium text-neutral-600">
                    #
                  </th>
                  <th className="px-4 py-2 text-left font-sans text-caption font-medium text-neutral-600">
                    Reference
                  </th>
                  <th className="px-4 py-2 text-center font-sans text-caption font-medium text-neutral-600">
                    Quantite
                  </th>
                  <th className="px-4 py-2 text-left font-sans text-caption font-medium text-neutral-600">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {parsedRows.slice(0, 20).map((row, idx) => (
                  <tr
                    key={idx}
                    className={cn(!row.isValid && 'bg-red-50/50')}
                  >
                    <td className="px-4 py-2 font-sans text-caption text-neutral-500">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2 font-mono text-body-sm text-neutral-900">
                      {row.sku || '-'}
                    </td>
                    <td className="px-4 py-2 text-center font-sans text-body-sm text-neutral-900">
                      {row.quantity || '-'}
                    </td>
                    <td className="px-4 py-2">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1 font-sans text-caption text-green-600">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          OK
                        </span>
                      ) : (
                        <span className="font-sans text-caption text-red-600">
                          {row.error}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedRows.length > 20 && (
              <p className="px-4 py-2 bg-neutral-100 text-center font-sans text-caption text-neutral-500">
                + {formatNumber(parsedRows.length - 20)} autres lignes
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2',
            'text-neutral-600 rounded-lg',
            'font-sans text-body-sm',
            'hover:text-accent hover:bg-accent/5',
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
              strokeWidth={1.5}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Telecharger le modele CSV
        </button>

        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={cn(
                'px-4 py-2',
                'bg-white border border-neutral-200 text-neutral-600 rounded-lg',
                'font-sans text-body-sm font-medium',
                'hover:bg-neutral-100',
                'transition-colors duration-200'
              )}
            >
              Annuler
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={validCount === 0}
            className={cn(
              'px-4 py-2',
              'bg-accent text-white rounded-lg',
              'font-sans text-body-sm font-medium',
              'hover:bg-accent/90',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors duration-200'
            )}
          >
            Importer {validCount > 0 ? `(${formatNumber(validCount)} produits)` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CSVImport;
