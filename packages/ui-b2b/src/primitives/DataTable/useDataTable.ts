import { useCallback, useMemo, useReducer } from "react";
import type {
  ColumnDef,
  DataTableState,
  FilterConfig,
  PaginationConfig,
  PaginationState,
  RowSelectionState,
  SortConfig,
  SortDirection,
  UseDataTableOptions,
  UseDataTableReturn,
} from "./types";

/**
 * Action types for the data table reducer
 */
type DataTableAction<TData> =
  | { type: "SET_SORT"; payload: SortConfig<TData> | null }
  | { type: "SET_FILTER"; payload: FilterConfig<TData> }
  | { type: "REMOVE_FILTER"; payload: keyof TData | string }
  | { type: "CLEAR_FILTERS" }
  | { type: "SET_FILTERS"; payload: FilterConfig<TData>[] }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_PAGE_SIZE"; payload: number }
  | { type: "SELECT_ROW"; payload: string }
  | { type: "DESELECT_ROW"; payload: string }
  | { type: "TOGGLE_ROW"; payload: string }
  | { type: "SELECT_ALL"; payload: string[] }
  | { type: "DESELECT_ALL" }
  | { type: "SET_COLUMN_VISIBILITY"; payload: { columnId: string; visible: boolean } }
  | { type: "SET_DATA"; payload: TData[] }
  | { type: "RESET"; payload: InternalState<TData> };

/**
 * Internal state (without computed values)
 */
interface InternalState<TData> {
  originalData: TData[];
  columns: ColumnDef<TData>[];
  sort: SortConfig<TData> | null;
  filters: FilterConfig<TData>[];
  pageIndex: number;
  pageSize: number;
  selectedRowIds: Set<string>;
}

/**
 * Create initial state
 */
function createInitialState<TData>(
  options: UseDataTableOptions<TData>
): InternalState<TData> {
  return {
    originalData: options.data,
    columns: options.columns.map((col) => ({
      ...col,
      visible: col.visible !== false,
    })),
    sort: options.initialSort ?? null,
    filters: options.initialFilters ?? [],
    pageIndex: 0,
    pageSize: options.pageSize ?? 10,
    selectedRowIds: new Set(options.initialSelection ?? []),
  };
}

/**
 * Reducer for data table state
 */
function dataTableReducer<TData>(
  state: InternalState<TData>,
  action: DataTableAction<TData>
): InternalState<TData> {
  switch (action.type) {
    case "SET_SORT":
      return { ...state, sort: action.payload, pageIndex: 0 };

    case "SET_FILTER": {
      const existingIndex = state.filters.findIndex(
        (f) => f.key === action.payload.key
      );
      const newFilters =
        existingIndex >= 0
          ? state.filters.map((f, i) => (i === existingIndex ? action.payload : f))
          : [...state.filters, action.payload];
      return { ...state, filters: newFilters, pageIndex: 0 };
    }

    case "REMOVE_FILTER":
      return {
        ...state,
        filters: state.filters.filter((f) => f.key !== action.payload),
        pageIndex: 0,
      };

    case "CLEAR_FILTERS":
      return { ...state, filters: [], pageIndex: 0 };

    case "SET_FILTERS":
      return { ...state, filters: action.payload, pageIndex: 0 };

    case "SET_PAGE":
      return { ...state, pageIndex: action.payload };

    case "SET_PAGE_SIZE":
      return { ...state, pageSize: action.payload, pageIndex: 0 };

    case "SELECT_ROW": {
      const newSelected = new Set(state.selectedRowIds);
      newSelected.add(action.payload);
      return { ...state, selectedRowIds: newSelected };
    }

    case "DESELECT_ROW": {
      const newSelected = new Set(state.selectedRowIds);
      newSelected.delete(action.payload);
      return { ...state, selectedRowIds: newSelected };
    }

    case "TOGGLE_ROW": {
      const newSelected = new Set(state.selectedRowIds);
      if (newSelected.has(action.payload)) {
        newSelected.delete(action.payload);
      } else {
        newSelected.add(action.payload);
      }
      return { ...state, selectedRowIds: newSelected };
    }

    case "SELECT_ALL":
      return { ...state, selectedRowIds: new Set(action.payload) };

    case "DESELECT_ALL":
      return { ...state, selectedRowIds: new Set() };

    case "SET_COLUMN_VISIBILITY":
      return {
        ...state,
        columns: state.columns.map((col) =>
          col.id === action.payload.columnId
            ? { ...col, visible: action.payload.visible }
            : col
        ),
      };

    case "SET_DATA":
      return { ...state, originalData: action.payload };

    case "RESET":
      return action.payload;

    default:
      return state;
  }
}

/**
 * Get nested value from object using dot notation path
 */
function getNestedValue<TData>(obj: TData, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Default sort function
 */
function defaultSortFn<TData>(
  a: TData,
  b: TData,
  key: string,
  direction: SortDirection
): number {
  if (direction === null) return 0;

  const aVal = getNestedValue(a, key);
  const bVal = getNestedValue(b, key);

  // Handle null/undefined
  if (aVal == null && bVal == null) return 0;
  if (aVal == null) return direction === "asc" ? 1 : -1;
  if (bVal == null) return direction === "asc" ? -1 : 1;

  // Compare values
  let comparison = 0;
  if (typeof aVal === "string" && typeof bVal === "string") {
    comparison = aVal.localeCompare(bVal);
  } else if (typeof aVal === "number" && typeof bVal === "number") {
    comparison = aVal - bVal;
  } else if (aVal instanceof Date && bVal instanceof Date) {
    comparison = aVal.getTime() - bVal.getTime();
  } else {
    comparison = String(aVal).localeCompare(String(bVal));
  }

  return direction === "asc" ? comparison : -comparison;
}

/**
 * Default filter function
 */
function defaultFilterFn<TData>(row: TData, filter: FilterConfig<TData>): boolean {
  const value = getNestedValue(row, filter.key as string);

  switch (filter.operator) {
    case "equals":
      return value === filter.value;

    case "notEquals":
      return value !== filter.value;

    case "contains":
      return String(value).toLowerCase().includes(String(filter.value).toLowerCase());

    case "notContains":
      return !String(value).toLowerCase().includes(String(filter.value).toLowerCase());

    case "startsWith":
      return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase());

    case "endsWith":
      return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase());

    case "gt":
      return Number(value) > Number(filter.value);

    case "gte":
      return Number(value) >= Number(filter.value);

    case "lt":
      return Number(value) < Number(filter.value);

    case "lte":
      return Number(value) <= Number(filter.value);

    case "between":
      return (
        Number(value) >= Number(filter.value) &&
        Number(value) <= Number(filter.valueTo)
      );

    case "in":
      return Array.isArray(filter.value) && filter.value.includes(value);

    case "notIn":
      return Array.isArray(filter.value) && !filter.value.includes(value);

    case "isEmpty":
      return value == null || value === "";

    case "isNotEmpty":
      return value != null && value !== "";

    default:
      return true;
  }
}

/**
 * Hook for headless data table state management
 *
 * Provides sorting, filtering, pagination, and row selection
 * functionality without any UI rendering.
 *
 * @example
 * ```tsx
 * const table = useDataTable({
 *   data: products,
 *   columns: [
 *     { id: 'name', accessorKey: 'name', header: 'Name', sortable: true },
 *     { id: 'price', accessorKey: 'price', header: 'Price', sortable: true },
 *   ],
 *   getRowId: (row) => row.id,
 *   pageSize: 20,
 *   selectionMode: 'multiple',
 * });
 *
 * // Use table.state.data for current page data
 * // Use table.toggleSort('name') to sort by name
 * // Use table.nextPage() to go to next page
 * ```
 */
export function useDataTable<TData>(
  options: UseDataTableOptions<TData>
): UseDataTableReturn<TData> {
  const {
    data,
    columns,
    getRowId,
    pageSize = 10,
    selectionMode = "none",
    enableClientSideSort = true,
    enableClientSideFilter = true,
    enableClientSidePagination = true,
    serverSideTotalCount,
    onSortChange,
    onFiltersChange,
    onPaginationChange,
    onSelectionChange,
  } = options;

  const initialState = useMemo(
    () => createInitialState(options),
    // Only recreate on column changes, not data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns]
  );

  const [state, dispatch] = useReducer(dataTableReducer<TData>, initialState);

  // Update data when it changes externally
  useMemo(() => {
    if (data !== state.originalData) {
      dispatch({ type: "SET_DATA", payload: data });
    }
  }, [data, state.originalData]);

  // Process data (filter and sort)
  const processedData = useMemo(() => {
    let result = [...(data || [])];

    // Apply filters (client-side)
    if (enableClientSideFilter && state.filters.length > 0) {
      result = result.filter((row) => {
        return state.filters.every((filter) => {
          const column = state.columns.find(
            (c) => c.id === filter.key || c.accessorKey === filter.key
          );
          if (column?.filterFn) {
            return column.filterFn(row, filter);
          }
          return defaultFilterFn(row, filter);
        });
      });
    }

    // Apply sort (client-side)
    if (enableClientSideSort && state.sort && state.sort.direction) {
      const column = state.columns.find(
        (c) => c.id === state.sort!.key || c.accessorKey === state.sort!.key
      );
      const sortKey = (column?.accessorKey as string) || (state.sort.key as string);

      result.sort((a, b) => {
        if (column?.sortFn) {
          return column.sortFn(a, b, state.sort!.direction);
        }
        return defaultSortFn(a, b, sortKey, state.sort!.direction);
      });
    }

    return result;
  }, [
    data,
    state.filters,
    state.sort,
    state.columns,
    enableClientSideFilter,
    enableClientSideSort,
  ]);

  // Calculate pagination
  const paginationState: PaginationState = useMemo(() => {
    const totalItems = serverSideTotalCount ?? processedData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / state.pageSize));
    const safePageIndex = Math.min(state.pageIndex, totalPages - 1);
    const startIndex = safePageIndex * state.pageSize + 1;
    const endIndex = Math.min(startIndex + state.pageSize - 1, totalItems);

    return {
      pageIndex: safePageIndex,
      pageSize: state.pageSize,
      totalItems,
      totalPages,
      hasPreviousPage: safePageIndex > 0,
      hasNextPage: safePageIndex < totalPages - 1,
      startIndex: totalItems > 0 ? startIndex : 0,
      endIndex,
    };
  }, [processedData.length, state.pageIndex, state.pageSize, serverSideTotalCount]);

  // Get paginated data
  const paginatedData = useMemo(() => {
    if (!enableClientSidePagination) {
      return processedData;
    }
    const start = paginationState.pageIndex * paginationState.pageSize;
    const end = start + paginationState.pageSize;
    return processedData.slice(start, end);
  }, [processedData, paginationState, enableClientSidePagination]);

  // Calculate row selection state
  const rowSelectionState: RowSelectionState = useMemo(() => {
    const visibleRowIds = paginatedData.map(getRowId);
    const selectedVisibleCount = visibleRowIds.filter((id) =>
      state.selectedRowIds.has(id)
    ).length;

    return {
      selectedRowIds: state.selectedRowIds,
      allSelected: visibleRowIds.length > 0 && selectedVisibleCount === visibleRowIds.length,
      someSelected: selectedVisibleCount > 0 && selectedVisibleCount < visibleRowIds.length,
    };
  }, [paginatedData, state.selectedRowIds, getRowId]);

  // Build full state
  const fullState: DataTableState<TData> = useMemo(
    () => ({
      data: paginatedData,
      originalData: data,
      columns: state.columns,
      sort: state.sort,
      filters: state.filters,
      pagination: paginationState,
      rowSelection: rowSelectionState,
      isLoading: false,
      error: null,
    }),
    [
      paginatedData,
      data,
      state.columns,
      state.sort,
      state.filters,
      paginationState,
      rowSelectionState,
    ]
  );

  // Sorting actions
  const setSort = useCallback(
    (sort: SortConfig<TData> | null) => {
      dispatch({ type: "SET_SORT", payload: sort });
      onSortChange?.(sort);
    },
    [onSortChange]
  );

  const toggleSort = useCallback(
    (columnId: string) => {
      const column = state.columns.find((c) => c.id === columnId);
      if (!column?.sortable) return;

      const key = (column.accessorKey as string) || columnId;
      let newDirection: SortDirection = "asc";

      if (state.sort?.key === key) {
        if (state.sort.direction === "asc") {
          newDirection = "desc";
        } else if (state.sort.direction === "desc") {
          newDirection = null;
        }
      }

      const newSort = newDirection ? { key, direction: newDirection } : null;
      dispatch({ type: "SET_SORT", payload: newSort });
      onSortChange?.(newSort);
    },
    [state.columns, state.sort, onSortChange]
  );

  const clearSort = useCallback(() => {
    dispatch({ type: "SET_SORT", payload: null });
    onSortChange?.(null);
  }, [onSortChange]);

  // Filter actions
  const setFilter = useCallback(
    (filter: FilterConfig<TData>) => {
      dispatch({ type: "SET_FILTER", payload: filter });
      const newFilters = state.filters.some((f) => f.key === filter.key)
        ? state.filters.map((f) => (f.key === filter.key ? filter : f))
        : [...state.filters, filter];
      onFiltersChange?.(newFilters);
    },
    [state.filters, onFiltersChange]
  );

  const removeFilter = useCallback(
    (columnKey: keyof TData | string) => {
      dispatch({ type: "REMOVE_FILTER", payload: columnKey });
      onFiltersChange?.(state.filters.filter((f) => f.key !== columnKey));
    },
    [state.filters, onFiltersChange]
  );

  const clearFilters = useCallback(() => {
    dispatch({ type: "CLEAR_FILTERS" });
    onFiltersChange?.([]);
  }, [onFiltersChange]);

  const setFilters = useCallback(
    (filters: FilterConfig<TData>[]) => {
      dispatch({ type: "SET_FILTERS", payload: filters });
      onFiltersChange?.(filters);
    },
    [onFiltersChange]
  );

  // Pagination actions
  const goToPage = useCallback(
    (pageIndex: number) => {
      const safePage = Math.max(0, Math.min(pageIndex, paginationState.totalPages - 1));
      dispatch({ type: "SET_PAGE", payload: safePage });
      onPaginationChange?.({ pageIndex: safePage, pageSize: state.pageSize });
    },
    [paginationState.totalPages, state.pageSize, onPaginationChange]
  );

  const nextPage = useCallback(() => {
    if (paginationState.hasNextPage) {
      goToPage(paginationState.pageIndex + 1);
    }
  }, [paginationState, goToPage]);

  const previousPage = useCallback(() => {
    if (paginationState.hasPreviousPage) {
      goToPage(paginationState.pageIndex - 1);
    }
  }, [paginationState, goToPage]);

  const firstPage = useCallback(() => {
    goToPage(0);
  }, [goToPage]);

  const lastPage = useCallback(() => {
    goToPage(paginationState.totalPages - 1);
  }, [paginationState.totalPages, goToPage]);

  const setPageSize = useCallback(
    (size: number) => {
      dispatch({ type: "SET_PAGE_SIZE", payload: size });
      onPaginationChange?.({ pageIndex: 0, pageSize: size });
    },
    [onPaginationChange]
  );

  // Row selection actions
  const selectRow = useCallback(
    (rowId: string) => {
      if (selectionMode === "none") return;

      if (selectionMode === "single") {
        dispatch({ type: "DESELECT_ALL" });
      }
      dispatch({ type: "SELECT_ROW", payload: rowId });

      const newSelected = new Set(state.selectedRowIds);
      if (selectionMode === "single") {
        newSelected.clear();
      }
      newSelected.add(rowId);
      onSelectionChange?.(Array.from(newSelected));
    },
    [selectionMode, state.selectedRowIds, onSelectionChange]
  );

  const deselectRow = useCallback(
    (rowId: string) => {
      dispatch({ type: "DESELECT_ROW", payload: rowId });
      const newSelected = new Set(state.selectedRowIds);
      newSelected.delete(rowId);
      onSelectionChange?.(Array.from(newSelected));
    },
    [state.selectedRowIds, onSelectionChange]
  );

  const toggleRowSelection = useCallback(
    (rowId: string) => {
      if (selectionMode === "none") return;

      if (state.selectedRowIds.has(rowId)) {
        deselectRow(rowId);
      } else {
        selectRow(rowId);
      }
    },
    [selectionMode, state.selectedRowIds, selectRow, deselectRow]
  );

  const selectAll = useCallback(() => {
    if (selectionMode !== "multiple") return;

    const allIds = paginatedData.map(getRowId);
    dispatch({ type: "SELECT_ALL", payload: allIds });
    onSelectionChange?.(allIds);
  }, [selectionMode, paginatedData, getRowId, onSelectionChange]);

  const deselectAll = useCallback(() => {
    dispatch({ type: "DESELECT_ALL" });
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  const toggleSelectAll = useCallback(() => {
    if (rowSelectionState.allSelected) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [rowSelectionState.allSelected, selectAll, deselectAll]);

  const isRowSelected = useCallback(
    (rowId: string) => state.selectedRowIds.has(rowId),
    [state.selectedRowIds]
  );

  const getSelectedRows = useCallback((): TData[] => {
    return data.filter((row) => state.selectedRowIds.has(getRowId(row)));
  }, [data, state.selectedRowIds, getRowId]);

  // Column visibility
  const toggleColumnVisibility = useCallback((columnId: string) => {
    const column = state.columns.find((c) => c.id === columnId);
    if (column) {
      dispatch({
        type: "SET_COLUMN_VISIBILITY",
        payload: { columnId, visible: !column.visible },
      });
    }
  }, [state.columns]);

  const setColumnVisibility = useCallback((columnId: string, visible: boolean) => {
    dispatch({ type: "SET_COLUMN_VISIBILITY", payload: { columnId, visible } });
  }, []);

  const getVisibleColumns = useCallback(
    () => state.columns.filter((c) => c.visible !== false),
    [state.columns]
  );

  // Data access
  const getPaginatedData = useCallback(() => paginatedData, [paginatedData]);

  const getProcessedData = useCallback(() => processedData, [processedData]);

  const getCellValue = useCallback(
    <TValue = unknown>(row: TData, columnId: string): TValue => {
      const column = state.columns.find((c) => c.id === columnId);
      if (!column) {
        return undefined as TValue;
      }

      if (column.accessorFn) {
        return column.accessorFn(row) as TValue;
      }

      if (column.accessorKey) {
        return getNestedValue(row, column.accessorKey as string) as TValue;
      }

      return undefined as TValue;
    },
    [state.columns]
  );

  // Reset
  const reset = useCallback(() => {
    dispatch({ type: "RESET", payload: initialState });
  }, [initialState]);

  return {
    state: fullState,

    // Sorting
    setSort,
    toggleSort,
    clearSort,

    // Filtering
    setFilter,
    removeFilter,
    clearFilters,
    setFilters,

    // Pagination
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setPageSize,

    // Row selection
    selectRow,
    deselectRow,
    toggleRowSelection,
    selectAll,
    deselectAll,
    toggleSelectAll,
    isRowSelected,
    getSelectedRows,

    // Column visibility
    toggleColumnVisibility,
    setColumnVisibility,
    getVisibleColumns,

    // Data access
    getPaginatedData,
    getProcessedData,
    getCellValue,

    // Reset
    reset,
  };
}
