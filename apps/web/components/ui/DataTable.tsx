'use client';

import {
  useState,
  useMemo,
  type ReactNode,
  type HTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

// Column definition
export interface DataTableColumn<T> {
  /** Unique key for the column */
  key: string;
  /** Column header */
  header: ReactNode;
  /** Cell renderer */
  cell: (row: T, rowIndex: number) => ReactNode;
  /** Column width */
  width?: string | number;
  /** Minimum width */
  minWidth?: string | number;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Custom sort function */
  sortFn?: (a: T, b: T) => number;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Whether column is sticky */
  sticky?: 'left' | 'right';
  /** Whether column is hidden on mobile */
  hideOnMobile?: boolean;
}

// Sort state
export interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

// DataTable props
export interface DataTableProps<T> extends HTMLAttributes<HTMLDivElement> {
  /** Data to display */
  data: T[];
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Row key extractor */
  getRowKey: (row: T, index: number) => string | number;
  /** Whether to show row selection checkboxes */
  selectable?: boolean;
  /** Selected row keys */
  selectedKeys?: (string | number)[];
  /** Callback when selection changes */
  onSelectionChange?: (keys: (string | number)[]) => void;
  /** Current sort state */
  sortState?: SortState;
  /** Callback when sort changes */
  onSortChange?: (sort: SortState | undefined) => void;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Row click handler */
  onRowClick?: (row: T, index: number) => void;
  /** Whether rows are hoverable */
  hoverable?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Striped rows */
  striped?: boolean;
  /** Show borders */
  bordered?: boolean;
  /** Sticky header */
  stickyHeader?: boolean;
  /** Maximum height with scroll */
  maxHeight?: string | number;
}

/**
 * Professional B2B DataTable component.
 * Used for displaying tabular data with sorting, selection, and pagination.
 */
function DataTable<T>({
  data,
  columns,
  getRowKey,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  sortState,
  onSortChange,
  isLoading = false,
  emptyMessage = 'Aucune donnée disponible',
  onRowClick,
  hoverable = true,
  compact = false,
  striped = false,
  bordered = false,
  stickyHeader = false,
  maxHeight,
  className,
  ...props
}: DataTableProps<T>) {
  // Local sort state if not controlled
  const [localSort, setLocalSort] = useState<SortState | undefined>();
  const currentSort = sortState !== undefined ? sortState : localSort;

  // Handle sort
  const handleSort = (column: DataTableColumn<T>) => {
    if (!column.sortable) return;

    let newSort: SortState | undefined;

    if (currentSort?.column === column.key) {
      if (currentSort.direction === 'asc') {
        newSort = { column: column.key, direction: 'desc' };
      } else {
        newSort = undefined; // Remove sort
      }
    } else {
      newSort = { column: column.key, direction: 'asc' };
    }

    if (sortState === undefined) {
      setLocalSort(newSort);
    }
    onSortChange?.(newSort);
  };

  // Sorted data
  const sortedData = useMemo(() => {
    if (!currentSort) return data;

    const column = columns.find((c) => c.key === currentSort.column);
    if (!column) return data;

    const sorted = [...data].sort((a, b) => {
      if (column.sortFn) {
        return column.sortFn(a, b);
      }
      // Default string comparison
      const aVal = String((a as Record<string, unknown>)[column.key] ?? '');
      const bVal = String((b as Record<string, unknown>)[column.key] ?? '');
      return aVal.localeCompare(bVal);
    });

    return currentSort.direction === 'desc' ? sorted.reverse() : sorted;
  }, [data, columns, currentSort]);

  // Selection handlers
  const allSelected = data.length > 0 && selectedKeys.length === data.length;
  const someSelected = selectedKeys.length > 0 && selectedKeys.length < data.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(data.map((row, i) => getRowKey(row, i)));
    }
  };

  const handleSelectRow = (key: string | number) => {
    if (selectedKeys.includes(key)) {
      onSelectionChange?.(selectedKeys.filter((k) => k !== key));
    } else {
      onSelectionChange?.([...selectedKeys, key]);
    }
  };

  // Cell padding based on compact mode
  const cellPadding = compact ? 'px-3 py-2' : 'px-4 py-3';

  return (
    <div
      className={cn(
        'w-full overflow-hidden',
        bordered && 'border border-b2b-border rounded-lg',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'overflow-auto',
          maxHeight && 'overflow-y-auto'
        )}
        style={{ maxHeight }}
      >
        <table className="w-full border-collapse">
          {/* Header */}
          <thead
            className={cn(
              'bg-b2b-bg-secondary',
              stickyHeader && 'sticky top-0 z-10'
            )}
          >
            <tr>
              {/* Selection column */}
              {selectable && (
                <th
                  className={cn(
                    cellPadding,
                    'w-12',
                    'text-left',
                    'border-b border-b2b-border'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={handleSelectAll}
                    className={cn(
                      'w-4 h-4',
                      'rounded border-b2b-border-medium',
                      'text-b2b-primary',
                      'focus:ring-2 focus:ring-b2b-primary focus:ring-offset-0'
                    )}
                  />
                </th>
              )}

              {/* Data columns */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    cellPadding,
                    'text-b2b-label text-b2b-text-secondary font-semibold',
                    'border-b border-b2b-border',
                    'whitespace-nowrap',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && 'cursor-pointer hover:bg-b2b-bg-tertiary select-none',
                    column.sticky === 'left' && 'sticky left-0 bg-b2b-bg-secondary z-20',
                    column.sticky === 'right' && 'sticky right-0 bg-b2b-bg-secondary z-20',
                    column.hideOnMobile && 'hidden md:table-cell'
                  )}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                  }}
                  onClick={() => handleSort(column)}
                >
                  <span className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && (
                      <span className="inline-flex flex-col">
                        <svg
                          className={cn(
                            'w-3 h-3 -mb-1',
                            currentSort?.column === column.key && currentSort?.direction === 'asc'
                              ? 'text-b2b-primary'
                              : 'text-b2b-text-muted'
                          )}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M5 12l5-5 5 5H5z" />
                        </svg>
                        <svg
                          className={cn(
                            'w-3 h-3',
                            currentSort?.column === column.key && currentSort?.direction === 'desc'
                              ? 'text-b2b-primary'
                              : 'text-b2b-text-muted'
                          )}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M15 8l-5 5-5-5h10z" />
                        </svg>
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  {selectable && (
                    <td className={cellPadding}>
                      <div className="w-4 h-4 bg-b2b-bg-tertiary rounded animate-pulse" />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className={cellPadding}>
                      <div className="h-4 bg-b2b-bg-tertiary rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              // Empty state
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-12 text-center text-b2b-body text-b2b-text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              // Data rows
              sortedData.map((row, rowIndex) => {
                const rowKey = getRowKey(row, rowIndex);
                const isSelected = selectedKeys.includes(rowKey);

                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick?.(row, rowIndex)}
                    className={cn(
                      'transition-colors duration-150',
                      striped && rowIndex % 2 === 1 && 'bg-b2b-bg-secondary/50',
                      isSelected && 'bg-b2b-primary-50',
                      hoverable && 'hover:bg-b2b-bg-tertiary',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {/* Selection checkbox */}
                    {selectable && (
                      <td
                        className={cn(
                          cellPadding,
                          'border-b border-b2b-border-light'
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowKey)}
                          className={cn(
                            'w-4 h-4',
                            'rounded border-b2b-border-medium',
                            'text-b2b-primary',
                            'focus:ring-2 focus:ring-b2b-primary focus:ring-offset-0'
                          )}
                        />
                      </td>
                    )}

                    {/* Data cells */}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          cellPadding,
                          'text-b2b-body text-b2b-text-primary',
                          'border-b border-b2b-border-light',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                          column.sticky === 'left' && 'sticky left-0 bg-inherit z-10',
                          column.sticky === 'right' && 'sticky right-0 bg-inherit z-10',
                          column.hideOnMobile && 'hidden md:table-cell'
                        )}
                        style={{
                          width: column.width,
                          minWidth: column.minWidth,
                        }}
                      >
                        {column.cell(row, rowIndex)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

DataTable.displayName = 'DataTable';

export { DataTable };
