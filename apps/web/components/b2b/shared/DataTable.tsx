import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface Column<T> {
  /** Column header label */
  header: string;
  /** Unique key for the column */
  key: string;
  /** Function to render cell content */
  render: (item: T, index: number) => ReactNode;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Additional class names for the column */
  className?: string;
}

export interface DataTableProps<T> {
  /** Array of column definitions */
  columns: Column<T>[];
  /** Data array */
  data: T[];
  /** Function to get unique key for each row */
  getRowKey: (item: T, index: number) => string | number;
  /** Optional row click handler */
  onRowClick?: (item: T, index: number) => void;
  /** Show hover effect on rows */
  hoverable?: boolean;
  /** Empty state content */
  emptyContent?: ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * DataTable Component
 *
 * A reusable table component for displaying B2B data.
 *
 * @example
 * ```tsx
 * <DataTable
 *   columns={[
 *     { header: 'Devis', key: 'id', render: (q) => <Link href={`/devis/${q.id}`}>{q.quoteNumber}</Link> },
 *     { header: 'Statut', key: 'status', render: (q) => <StatusBadge status={q.status} /> },
 *     { header: 'Total', key: 'total', render: (q) => formatCurrency(q.total), align: 'right' },
 *   ]}
 *   data={quotes}
 *   getRowKey={(q) => q.id}
 *   hoverable
 * />
 * ```
 */
export function DataTable<T>({
  columns,
  data,
  getRowKey,
  onRowClick,
  hoverable = true,
  emptyContent,
  className,
}: DataTableProps<T>) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  if (data.length === 0 && emptyContent) {
    return <>{emptyContent}</>;
  }

  return (
    <div
      className={cn(
        'bg-white rounded-soft border border-border-light overflow-hidden',
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-light bg-background-muted">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 font-sans text-caption font-medium text-text-muted',
                    alignClasses[column.align ?? 'left'],
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {data.map((item, rowIndex) => (
              <tr
                key={getRowKey(item, rowIndex)}
                className={cn(
                  hoverable && 'hover:bg-background-muted transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(item, rowIndex)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-4',
                      alignClasses[column.align ?? 'left'],
                      column.className
                    )}
                  >
                    {column.render(item, rowIndex)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
