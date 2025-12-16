/**
 * DataTable Types
 *
 * Type definitions for headless data table component with
 * sorting, pagination, filtering, and row selection.
 */

/**
 * Sort direction for columns
 */
export type SortDirection = "asc" | "desc" | null;

/**
 * Sort configuration for a column
 */
export interface SortConfig<TData> {
  /** Column key to sort by */
  key: keyof TData | string;
  /** Sort direction */
  direction: SortDirection;
}

/**
 * Filter operator types
 */
export type FilterOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between"
  | "in"
  | "notIn"
  | "isEmpty"
  | "isNotEmpty";

/**
 * Filter configuration for a column
 */
export interface FilterConfig<TData> {
  /** Column key to filter */
  key: keyof TData | string;
  /** Filter operator */
  operator: FilterOperator;
  /** Filter value(s) */
  value: unknown;
  /** Second value for 'between' operator */
  valueTo?: unknown;
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  /** Current page index (0-based) */
  pageIndex: number;
  /** Number of items per page */
  pageSize: number;
}

/**
 * Pagination state with computed values
 */
export interface PaginationState extends PaginationConfig {
  /** Total number of items */
  totalItems: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Start index for current page (1-based for display) */
  startIndex: number;
  /** End index for current page (1-based for display) */
  endIndex: number;
}

/**
 * Column definition for the data table
 */
export interface ColumnDef<TData, TValue = unknown> {
  /** Unique column identifier */
  id: string;
  /** Access key for data (supports nested paths like 'user.name') */
  accessorKey?: keyof TData | string;
  /** Custom accessor function */
  accessorFn?: (row: TData) => TValue;
  /** Header label */
  header: string;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Whether column is filterable */
  filterable?: boolean;
  /** Custom sort function */
  sortFn?: (a: TData, b: TData, direction: SortDirection) => number;
  /** Custom filter function */
  filterFn?: (row: TData, filter: FilterConfig<TData>) => boolean;
  /** Column width (CSS value) */
  width?: string | number;
  /** Minimum column width */
  minWidth?: string | number;
  /** Maximum column width */
  maxWidth?: string | number;
  /** Whether column is visible */
  visible?: boolean;
  /** Whether column can be resized */
  resizable?: boolean;
  /** Column alignment */
  align?: "left" | "center" | "right";
  /** Additional column metadata */
  meta?: Record<string, unknown>;
}

/**
 * Row selection mode
 */
export type RowSelectionMode = "single" | "multiple" | "none";

/**
 * Row selection state
 */
export interface RowSelectionState {
  /** Set of selected row IDs */
  selectedRowIds: Set<string>;
  /** Whether all visible rows are selected */
  allSelected: boolean;
  /** Whether some (but not all) rows are selected */
  someSelected: boolean;
}

/**
 * Data table state
 */
export interface DataTableState<TData> {
  /** Current data (after sorting/filtering) */
  data: TData[];
  /** Original unprocessed data */
  originalData: TData[];
  /** Column definitions */
  columns: ColumnDef<TData>[];
  /** Current sort configuration */
  sort: SortConfig<TData> | null;
  /** Active filters */
  filters: FilterConfig<TData>[];
  /** Pagination state */
  pagination: PaginationState;
  /** Row selection state */
  rowSelection: RowSelectionState;
  /** Whether data is loading */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
}

/**
 * Options for useDataTable hook
 */
export interface UseDataTableOptions<TData> {
  /** Data array */
  data: TData[];
  /** Column definitions */
  columns: ColumnDef<TData>[];
  /** Function to get unique row ID */
  getRowId: (row: TData) => string;
  /** Initial page size */
  pageSize?: number;
  /** Available page sizes */
  pageSizeOptions?: number[];
  /** Row selection mode */
  selectionMode?: RowSelectionMode;
  /** Initial selected row IDs */
  initialSelection?: string[];
  /** Initial sort configuration */
  initialSort?: SortConfig<TData>;
  /** Initial filters */
  initialFilters?: FilterConfig<TData>[];
  /** Whether to enable client-side sorting */
  enableClientSideSort?: boolean;
  /** Whether to enable client-side filtering */
  enableClientSideFilter?: boolean;
  /** Whether to enable client-side pagination */
  enableClientSidePagination?: boolean;
  /** Server-side total count (for server-side pagination) */
  serverSideTotalCount?: number;
  /** Callback when sort changes */
  onSortChange?: (sort: SortConfig<TData> | null) => void;
  /** Callback when filters change */
  onFiltersChange?: (filters: FilterConfig<TData>[]) => void;
  /** Callback when pagination changes */
  onPaginationChange?: (pagination: PaginationConfig) => void;
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
}

/**
 * Return type for useDataTable hook
 */
export interface UseDataTableReturn<TData> {
  /** Current table state */
  state: DataTableState<TData>;

  // Sorting
  /** Set sort configuration */
  setSort: (sort: SortConfig<TData> | null) => void;
  /** Toggle sort for a column */
  toggleSort: (columnId: string) => void;
  /** Clear all sorting */
  clearSort: () => void;

  // Filtering
  /** Set filter for a column */
  setFilter: (filter: FilterConfig<TData>) => void;
  /** Remove filter for a column */
  removeFilter: (columnKey: keyof TData | string) => void;
  /** Clear all filters */
  clearFilters: () => void;
  /** Set multiple filters at once */
  setFilters: (filters: FilterConfig<TData>[]) => void;

  // Pagination
  /** Go to specific page */
  goToPage: (pageIndex: number) => void;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  previousPage: () => void;
  /** Go to first page */
  firstPage: () => void;
  /** Go to last page */
  lastPage: () => void;
  /** Set page size */
  setPageSize: (size: number) => void;

  // Row selection
  /** Select a row */
  selectRow: (rowId: string) => void;
  /** Deselect a row */
  deselectRow: (rowId: string) => void;
  /** Toggle row selection */
  toggleRowSelection: (rowId: string) => void;
  /** Select all visible rows */
  selectAll: () => void;
  /** Deselect all rows */
  deselectAll: () => void;
  /** Toggle select all */
  toggleSelectAll: () => void;
  /** Check if a row is selected */
  isRowSelected: (rowId: string) => boolean;
  /** Get selected rows */
  getSelectedRows: () => TData[];

  // Column visibility
  /** Toggle column visibility */
  toggleColumnVisibility: (columnId: string) => void;
  /** Set column visibility */
  setColumnVisibility: (columnId: string, visible: boolean) => void;
  /** Get visible columns */
  getVisibleColumns: () => ColumnDef<TData>[];

  // Data access
  /** Get paginated data */
  getPaginatedData: () => TData[];
  /** Get all processed data (sorted/filtered) */
  getProcessedData: () => TData[];
  /** Get cell value */
  getCellValue: <TValue = unknown>(row: TData, columnId: string) => TValue;

  // Reset
  /** Reset to initial state */
  reset: () => void;
}
