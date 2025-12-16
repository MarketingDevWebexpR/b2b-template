// src/primitives/DataTable/useDataTable.ts
import { useCallback, useMemo, useReducer } from "react";
function createInitialState(options) {
  return {
    originalData: options.data,
    columns: options.columns.map((col) => ({
      ...col,
      visible: col.visible !== false
    })),
    sort: options.initialSort ?? null,
    filters: options.initialFilters ?? [],
    pageIndex: 0,
    pageSize: options.pageSize ?? 10,
    selectedRowIds: new Set(options.initialSelection ?? [])
  };
}
function dataTableReducer(state, action) {
  switch (action.type) {
    case "SET_SORT":
      return { ...state, sort: action.payload, pageIndex: 0 };
    case "SET_FILTER": {
      const existingIndex = state.filters.findIndex(
        (f) => f.key === action.payload.key
      );
      const newFilters = existingIndex >= 0 ? state.filters.map((f, i) => i === existingIndex ? action.payload : f) : [...state.filters, action.payload];
      return { ...state, filters: newFilters, pageIndex: 0 };
    }
    case "REMOVE_FILTER":
      return {
        ...state,
        filters: state.filters.filter((f) => f.key !== action.payload),
        pageIndex: 0
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
      return { ...state, selectedRowIds: /* @__PURE__ */ new Set() };
    case "SET_COLUMN_VISIBILITY":
      return {
        ...state,
        columns: state.columns.map(
          (col) => col.id === action.payload.columnId ? { ...col, visible: action.payload.visible } : col
        )
      };
    case "SET_DATA":
      return { ...state, originalData: action.payload };
    case "RESET":
      return action.payload;
    default:
      return state;
  }
}
function getNestedValue(obj, path) {
  return path.split(".").reduce((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return current[key];
    }
    return void 0;
  }, obj);
}
function defaultSortFn(a, b, key, direction) {
  if (direction === null) return 0;
  const aVal = getNestedValue(a, key);
  const bVal = getNestedValue(b, key);
  if (aVal == null && bVal == null) return 0;
  if (aVal == null) return direction === "asc" ? 1 : -1;
  if (bVal == null) return direction === "asc" ? -1 : 1;
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
function defaultFilterFn(row, filter) {
  const value = getNestedValue(row, filter.key);
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
      return Number(value) >= Number(filter.value) && Number(value) <= Number(filter.valueTo);
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
function useDataTable(options) {
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
    onSelectionChange
  } = options;
  const initialState = useMemo(
    () => createInitialState(options),
    // Only recreate on column changes, not data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns]
  );
  const [state, dispatch] = useReducer(dataTableReducer, initialState);
  useMemo(() => {
    if (data !== state.originalData) {
      dispatch({ type: "SET_DATA", payload: data });
    }
  }, [data, state.originalData]);
  const processedData = useMemo(() => {
    let result = [...data || []];
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
    if (enableClientSideSort && state.sort && state.sort.direction) {
      const column = state.columns.find(
        (c) => c.id === state.sort.key || c.accessorKey === state.sort.key
      );
      const sortKey = column?.accessorKey || state.sort.key;
      result.sort((a, b) => {
        if (column?.sortFn) {
          return column.sortFn(a, b, state.sort.direction);
        }
        return defaultSortFn(a, b, sortKey, state.sort.direction);
      });
    }
    return result;
  }, [
    data,
    state.filters,
    state.sort,
    state.columns,
    enableClientSideFilter,
    enableClientSideSort
  ]);
  const paginationState = useMemo(() => {
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
      endIndex
    };
  }, [processedData.length, state.pageIndex, state.pageSize, serverSideTotalCount]);
  const paginatedData = useMemo(() => {
    if (!enableClientSidePagination) {
      return processedData;
    }
    const start = paginationState.pageIndex * paginationState.pageSize;
    const end = start + paginationState.pageSize;
    return processedData.slice(start, end);
  }, [processedData, paginationState, enableClientSidePagination]);
  const rowSelectionState = useMemo(() => {
    const visibleRowIds = paginatedData.map(getRowId);
    const selectedVisibleCount = visibleRowIds.filter(
      (id) => state.selectedRowIds.has(id)
    ).length;
    return {
      selectedRowIds: state.selectedRowIds,
      allSelected: visibleRowIds.length > 0 && selectedVisibleCount === visibleRowIds.length,
      someSelected: selectedVisibleCount > 0 && selectedVisibleCount < visibleRowIds.length
    };
  }, [paginatedData, state.selectedRowIds, getRowId]);
  const fullState = useMemo(
    () => ({
      data: paginatedData,
      originalData: data,
      columns: state.columns,
      sort: state.sort,
      filters: state.filters,
      pagination: paginationState,
      rowSelection: rowSelectionState,
      isLoading: false,
      error: null
    }),
    [
      paginatedData,
      data,
      state.columns,
      state.sort,
      state.filters,
      paginationState,
      rowSelectionState
    ]
  );
  const setSort = useCallback(
    (sort) => {
      dispatch({ type: "SET_SORT", payload: sort });
      onSortChange?.(sort);
    },
    [onSortChange]
  );
  const toggleSort = useCallback(
    (columnId) => {
      const column = state.columns.find((c) => c.id === columnId);
      if (!column?.sortable) return;
      const key = column.accessorKey || columnId;
      let newDirection = "asc";
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
  const setFilter = useCallback(
    (filter) => {
      dispatch({ type: "SET_FILTER", payload: filter });
      const newFilters = state.filters.some((f) => f.key === filter.key) ? state.filters.map((f) => f.key === filter.key ? filter : f) : [...state.filters, filter];
      onFiltersChange?.(newFilters);
    },
    [state.filters, onFiltersChange]
  );
  const removeFilter = useCallback(
    (columnKey) => {
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
    (filters) => {
      dispatch({ type: "SET_FILTERS", payload: filters });
      onFiltersChange?.(filters);
    },
    [onFiltersChange]
  );
  const goToPage = useCallback(
    (pageIndex) => {
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
    (size) => {
      dispatch({ type: "SET_PAGE_SIZE", payload: size });
      onPaginationChange?.({ pageIndex: 0, pageSize: size });
    },
    [onPaginationChange]
  );
  const selectRow = useCallback(
    (rowId) => {
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
    (rowId) => {
      dispatch({ type: "DESELECT_ROW", payload: rowId });
      const newSelected = new Set(state.selectedRowIds);
      newSelected.delete(rowId);
      onSelectionChange?.(Array.from(newSelected));
    },
    [state.selectedRowIds, onSelectionChange]
  );
  const toggleRowSelection = useCallback(
    (rowId) => {
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
    (rowId) => state.selectedRowIds.has(rowId),
    [state.selectedRowIds]
  );
  const getSelectedRows = useCallback(() => {
    return data.filter((row) => state.selectedRowIds.has(getRowId(row)));
  }, [data, state.selectedRowIds, getRowId]);
  const toggleColumnVisibility = useCallback((columnId) => {
    const column = state.columns.find((c) => c.id === columnId);
    if (column) {
      dispatch({
        type: "SET_COLUMN_VISIBILITY",
        payload: { columnId, visible: !column.visible }
      });
    }
  }, [state.columns]);
  const setColumnVisibility = useCallback((columnId, visible) => {
    dispatch({ type: "SET_COLUMN_VISIBILITY", payload: { columnId, visible } });
  }, []);
  const getVisibleColumns = useCallback(
    () => state.columns.filter((c) => c.visible !== false),
    [state.columns]
  );
  const getPaginatedData = useCallback(() => paginatedData, [paginatedData]);
  const getProcessedData = useCallback(() => processedData, [processedData]);
  const getCellValue = useCallback(
    (row, columnId) => {
      const column = state.columns.find((c) => c.id === columnId);
      if (!column) {
        return void 0;
      }
      if (column.accessorFn) {
        return column.accessorFn(row);
      }
      if (column.accessorKey) {
        return getNestedValue(row, column.accessorKey);
      }
      return void 0;
    },
    [state.columns]
  );
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
    reset
  };
}

// src/primitives/BulkSelector/useBulkSelector.ts
import { useCallback as useCallback2, useMemo as useMemo2, useState } from "react";
function defaultGetItemId(item) {
  return item.id;
}
function defaultIsItemSelectable() {
  return true;
}
function useBulkSelector(options) {
  const {
    items,
    initialSelectedIds = [],
    getItemId = defaultGetItemId,
    isItemSelectable = defaultIsItemSelectable,
    maxSelection,
    onSelectionChange
  } = options;
  const [selectedIds, setSelectedIds] = useState(
    () => new Set(initialSelectedIds)
  );
  const selectableItems = useMemo2(
    () => items.filter(isItemSelectable),
    [items, isItemSelectable]
  );
  const selectableIds = useMemo2(
    () => new Set(selectableItems.map(getItemId)),
    [selectableItems, getItemId]
  );
  const state = useMemo2(() => {
    const validSelectedIds = new Set(
      Array.from(selectedIds).filter((id) => selectableIds.has(id))
    );
    const selectedCount = validSelectedIds.size;
    const totalCount = selectableItems.length;
    let selectionState = "none";
    if (selectedCount === 0) {
      selectionState = "none";
    } else if (selectedCount === totalCount && totalCount > 0) {
      selectionState = "all";
    } else {
      selectionState = "some";
    }
    return {
      selectedIds: validSelectedIds,
      selectionState,
      selectedCount,
      totalCount,
      isAllSelected: selectionState === "all",
      isPartiallySelected: selectionState === "some",
      isNoneSelected: selectionState === "none"
    };
  }, [selectedIds, selectableIds, selectableItems.length]);
  const notifyChange = useCallback2(
    (newSelectedIds) => {
      if (onSelectionChange) {
        const ids = Array.from(newSelectedIds);
        const selectedItems = items.filter(
          (item) => newSelectedIds.has(getItemId(item))
        );
        onSelectionChange(ids, selectedItems);
      }
    },
    [items, getItemId, onSelectionChange]
  );
  const select = useCallback2(
    (id) => {
      if (!selectableIds.has(id)) return;
      if (maxSelection && selectedIds.size >= maxSelection && !selectedIds.has(id)) {
        return;
      }
      setSelectedIds((prev) => {
        if (prev.has(id)) return prev;
        const newSet = new Set(prev);
        newSet.add(id);
        notifyChange(newSet);
        return newSet;
      });
    },
    [selectableIds, maxSelection, selectedIds.size, notifyChange]
  );
  const deselect = useCallback2(
    (id) => {
      setSelectedIds((prev) => {
        if (!prev.has(id)) return prev;
        const newSet = new Set(prev);
        newSet.delete(id);
        notifyChange(newSet);
        return newSet;
      });
    },
    [notifyChange]
  );
  const toggle = useCallback2(
    (id) => {
      if (!selectableIds.has(id)) return;
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          if (maxSelection && newSet.size >= maxSelection) {
            return prev;
          }
          newSet.add(id);
        }
        notifyChange(newSet);
        return newSet;
      });
    },
    [selectableIds, maxSelection, notifyChange]
  );
  const selectAll = useCallback2(() => {
    const allIds = selectableItems.map(getItemId);
    const idsToSelect = maxSelection ? allIds.slice(0, maxSelection) : allIds;
    const newSet = new Set(idsToSelect);
    setSelectedIds(newSet);
    notifyChange(newSet);
  }, [selectableItems, getItemId, maxSelection, notifyChange]);
  const deselectAll = useCallback2(() => {
    const newSet = /* @__PURE__ */ new Set();
    setSelectedIds(newSet);
    notifyChange(newSet);
  }, [notifyChange]);
  const toggleAll = useCallback2(() => {
    if (state.isAllSelected) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [state.isAllSelected, selectAll, deselectAll]);
  const selectMany = useCallback2(
    (ids) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        let count = newSet.size;
        for (const id of ids) {
          if (selectableIds.has(id) && !newSet.has(id)) {
            if (maxSelection && count >= maxSelection) break;
            newSet.add(id);
            count++;
          }
        }
        if (newSet.size === prev.size) return prev;
        notifyChange(newSet);
        return newSet;
      });
    },
    [selectableIds, maxSelection, notifyChange]
  );
  const deselectMany = useCallback2(
    (ids) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        let changed = false;
        for (const id of ids) {
          if (newSet.has(id)) {
            newSet.delete(id);
            changed = true;
          }
        }
        if (!changed) return prev;
        notifyChange(newSet);
        return newSet;
      });
    },
    [notifyChange]
  );
  const setSelection = useCallback2(
    (ids) => {
      const validIds = ids.filter((id) => selectableIds.has(id));
      const limitedIds = maxSelection ? validIds.slice(0, maxSelection) : validIds;
      const newSet = new Set(limitedIds);
      setSelectedIds(newSet);
      notifyChange(newSet);
    },
    [selectableIds, maxSelection, notifyChange]
  );
  const isSelected = useCallback2((id) => selectedIds.has(id), [selectedIds]);
  const canSelect = useCallback2(
    (id) => {
      if (!selectableIds.has(id)) return false;
      if (selectedIds.has(id)) return true;
      if (maxSelection && selectedIds.size >= maxSelection) return false;
      return true;
    },
    [selectableIds, selectedIds, maxSelection]
  );
  const getSelectedItems = useCallback2(
    () => items.filter((item) => selectedIds.has(getItemId(item))),
    [items, selectedIds, getItemId]
  );
  const getSelectedIds = useCallback2(
    () => Array.from(selectedIds),
    [selectedIds]
  );
  const selectRange = useCallback2(
    (fromId, toId) => {
      const fromIndex = selectableItems.findIndex(
        (item) => getItemId(item) === fromId
      );
      const toIndex = selectableItems.findIndex(
        (item) => getItemId(item) === toId
      );
      if (fromIndex === -1 || toIndex === -1) return;
      const start = Math.min(fromIndex, toIndex);
      const end = Math.max(fromIndex, toIndex);
      const rangeIds = selectableItems.slice(start, end + 1).map(getItemId);
      selectMany(rangeIds);
    },
    [selectableItems, getItemId, selectMany]
  );
  const reset = useCallback2(() => {
    const newSet = new Set(initialSelectedIds);
    setSelectedIds(newSet);
    notifyChange(newSet);
  }, [initialSelectedIds, notifyChange]);
  return {
    state,
    // Selection actions
    select,
    deselect,
    toggle,
    selectAll,
    deselectAll,
    toggleAll,
    selectMany,
    deselectMany,
    setSelection,
    // Query helpers
    isSelected,
    canSelect,
    getSelectedItems,
    getSelectedIds,
    // Range selection
    selectRange,
    // Reset
    reset
  };
}

// src/primitives/ApprovalFlow/useApprovalFlow.ts
import { useCallback as useCallback3, useMemo as useMemo3, useState as useState2 } from "react";
function calculateWorkflowStatus(steps) {
  if (steps.length === 0) return "draft";
  const hasRejected = steps.some((s) => s.status === "rejected");
  if (hasRejected) return "rejected";
  const hasCancelled = steps.some((s) => s.status === "cancelled");
  if (hasCancelled) return "cancelled";
  const allComplete = steps.every(
    (s) => s.status === "approved" || s.status === "skipped" || s.optional && s.status === "pending"
  );
  if (allComplete) return "approved";
  const hasInProgress = steps.some(
    (s) => s.status === "in_review" || s.status === "approved"
  );
  if (hasInProgress) return "in_progress";
  const hasPending = steps.some((s) => s.status === "pending");
  if (hasPending) return "pending";
  return "draft";
}
function findCurrentStepIndex(steps) {
  const activeIndex = steps.findIndex(
    (s) => s.status === "pending" || s.status === "in_review"
  );
  if (activeIndex >= 0) return activeIndex;
  const allComplete = steps.every(
    (s) => s.status === "approved" || s.status === "skipped" || s.status === "rejected"
  );
  if (allComplete && steps.length > 0) {
    return steps.length - 1;
  }
  return 0;
}
function hasEnoughApprovals(step) {
  const approvalCount = step.actions.filter((a) => a.type === "approve").length;
  return approvalCount >= step.minApprovals;
}
function useApprovalFlow(options) {
  const {
    workflow: initialWorkflow,
    currentUser,
    onStepChange,
    onWorkflowChange,
    onApproved,
    onRejected
  } = options;
  const [workflow, setWorkflow] = useState2(initialWorkflow);
  const [viewingStepIndex, setViewingStepIndex] = useState2(null);
  const updateWorkflow = useCallback3(
    (updater, changedStep) => {
      setWorkflow((prev) => {
        const updated = updater(prev);
        const newStatus = calculateWorkflowStatus(updated.steps);
        const finalWorkflow = {
          ...updated,
          status: newStatus,
          updatedAt: /* @__PURE__ */ new Date()
        };
        if (changedStep) {
          onStepChange?.(changedStep, finalWorkflow);
        }
        onWorkflowChange?.(finalWorkflow);
        if (newStatus === "approved" && prev.status !== "approved") {
          onApproved?.(finalWorkflow);
        }
        if (newStatus === "rejected" && prev.status !== "rejected") {
          onRejected?.(finalWorkflow);
        }
        return finalWorkflow;
      });
    },
    [onStepChange, onWorkflowChange, onApproved, onRejected]
  );
  const state = useMemo3(() => {
    const steps = workflow.steps;
    const currentStepIndex = viewingStepIndex ?? findCurrentStepIndex(steps);
    const currentStep = steps[currentStepIndex] ?? null;
    const completedSteps = steps.filter(
      (s) => s.status === "approved" || s.status === "skipped"
    );
    const pendingSteps = steps.filter(
      (s) => s.status === "pending" || s.status === "in_review"
    );
    const totalSteps = steps.filter((s) => !s.optional).length;
    const completedCount = completedSteps.filter((s) => !s.optional).length;
    const progress = totalSteps > 0 ? completedCount / totalSteps * 100 : 0;
    let userPendingAction = null;
    if (currentUser) {
      userPendingAction = pendingSteps.find(
        (step) => step.requiredApprovers.some((a) => a.id === currentUser.id)
      ) ?? null;
    }
    return {
      workflow,
      currentStepIndex,
      currentStep,
      completedSteps,
      pendingSteps,
      progress,
      isComplete: workflow.status === "approved" || workflow.status === "rejected",
      isApproved: workflow.status === "approved",
      isRejected: workflow.status === "rejected",
      canCancel: workflow.status !== "cancelled" && workflow.status !== "approved" && workflow.status !== "rejected",
      userPendingAction
    };
  }, [workflow, viewingStepIndex, currentUser]);
  const createAction = useCallback3(
    (type, comment, delegatedTo) => {
      const action = {
        type,
        approver: currentUser ?? {
          id: "system",
          name: "System"
        },
        timestamp: /* @__PURE__ */ new Date()
      };
      if (comment !== void 0) {
        action.comment = comment;
      }
      if (delegatedTo !== void 0) {
        action.delegatedTo = delegatedTo;
      }
      return action;
    },
    [currentUser]
  );
  const updateStep = useCallback3(
    (stepId, updater) => {
      updateWorkflow((prev) => {
        const stepIndex = prev.steps.findIndex((s) => s.id === stepId);
        if (stepIndex === -1) return prev;
        const existingStep = prev.steps[stepIndex];
        if (!existingStep) return prev;
        const updatedStep = updater(existingStep);
        const newSteps = [...prev.steps];
        newSteps[stepIndex] = updatedStep;
        return { ...prev, steps: newSteps };
      });
    },
    [updateWorkflow]
  );
  const approve = useCallback3(
    (stepId, comment) => {
      const targetStepId = stepId ?? state.currentStep?.id;
      if (!targetStepId) return;
      updateStep(targetStepId, (step) => {
        const action = createAction("approve", comment);
        const newActions = [...step.actions, action];
        const newStep = { ...step, actions: newActions };
        if (hasEnoughApprovals(newStep)) {
          newStep.status = "approved";
        } else {
          newStep.status = "in_review";
        }
        return newStep;
      });
    },
    [state.currentStep, updateStep, createAction]
  );
  const reject = useCallback3(
    (stepId, comment) => {
      const targetStepId = stepId ?? state.currentStep?.id;
      if (!targetStepId) return;
      updateStep(targetStepId, (step) => {
        const action = createAction("reject", comment);
        return {
          ...step,
          status: "rejected",
          actions: [...step.actions, action]
        };
      });
    },
    [state.currentStep, updateStep, createAction]
  );
  const requestChanges = useCallback3(
    (stepId, comment) => {
      const targetStepId = stepId ?? state.currentStep?.id;
      if (!targetStepId) return;
      updateStep(targetStepId, (step) => {
        const action = createAction("request_changes", comment);
        return {
          ...step,
          status: "pending",
          actions: [...step.actions, action]
        };
      });
    },
    [state.currentStep, updateStep, createAction]
  );
  const delegate = useCallback3(
    (stepId, delegateTo, comment) => {
      updateStep(stepId, (step) => {
        const action = createAction("delegate", comment, delegateTo);
        const newApprovers = step.requiredApprovers.some(
          (a) => a.id === delegateTo.id
        ) ? step.requiredApprovers : [...step.requiredApprovers, delegateTo];
        return {
          ...step,
          requiredApprovers: newApprovers,
          actions: [...step.actions, action]
        };
      });
    },
    [updateStep, createAction]
  );
  const skipStep = useCallback3(
    (stepId, comment) => {
      updateStep(stepId, (step) => {
        if (!step.optional) return step;
        const action = createAction("skip", comment);
        return {
          ...step,
          status: "skipped",
          actions: [...step.actions, action]
        };
      });
    },
    [updateStep, createAction]
  );
  const cancel = useCallback3(
    (comment) => {
      updateWorkflow((prev) => ({
        ...prev,
        status: "cancelled",
        steps: prev.steps.map(
          (step) => step.status === "pending" || step.status === "in_review" ? {
            ...step,
            status: "cancelled",
            actions: [
              ...step.actions,
              createAction("skip", comment ?? "Workflow cancelled")
            ]
          } : step
        )
      }));
    },
    [updateWorkflow, createAction]
  );
  const resetToDraft = useCallback3(() => {
    updateWorkflow((prev) => ({
      ...prev,
      status: "draft",
      steps: prev.steps.map((step) => ({
        ...step,
        status: "pending",
        actions: []
      }))
    }));
  }, [updateWorkflow]);
  const restart = useCallback3(() => {
    updateWorkflow((prev) => ({
      ...prev,
      status: "pending",
      steps: prev.steps.map((step, index) => ({
        ...step,
        status: index === 0 ? "in_review" : "pending",
        actions: []
      }))
    }));
  }, [updateWorkflow]);
  const canApprove = useCallback3(
    (stepId, userId) => {
      const step = workflow.steps.find((s) => s.id === stepId);
      if (!step) return false;
      if (step.status !== "pending" && step.status !== "in_review") return false;
      const checkUserId = userId ?? currentUser?.id;
      if (!checkUserId) return false;
      const isApprover = step.requiredApprovers.some((a) => a.id === checkUserId);
      if (!isApprover) return false;
      const hasAlreadyApproved = step.actions.some(
        (a) => a.type === "approve" && a.approver.id === checkUserId
      );
      return !hasAlreadyApproved;
    },
    [workflow.steps, currentUser]
  );
  const canReject = useCallback3(
    (stepId, userId) => {
      const step = workflow.steps.find((s) => s.id === stepId);
      if (!step) return false;
      if (step.status !== "pending" && step.status !== "in_review") return false;
      const checkUserId = userId ?? currentUser?.id;
      if (!checkUserId) return false;
      return step.requiredApprovers.some((a) => a.id === checkUserId);
    },
    [workflow.steps, currentUser]
  );
  const isCurrentStep = useCallback3(
    (stepId) => state.currentStep?.id === stepId,
    [state.currentStep]
  );
  const isStepComplete = useCallback3(
    (stepId) => {
      const step = workflow.steps.find((s) => s.id === stepId);
      return step?.status === "approved" || step?.status === "skipped";
    },
    [workflow.steps]
  );
  const getStep = useCallback3(
    (stepId) => workflow.steps.find((s) => s.id === stepId),
    [workflow.steps]
  );
  const getStepApprovers = useCallback3(
    (stepId) => {
      const step = workflow.steps.find((s) => s.id === stepId);
      return step?.requiredApprovers ?? [];
    },
    [workflow.steps]
  );
  const getRemainingApprovers = useCallback3(
    (stepId) => {
      const step = workflow.steps.find((s) => s.id === stepId);
      if (!step) return [];
      const approvedUserIds = new Set(
        step.actions.filter((a) => a.type === "approve").map((a) => a.approver.id)
      );
      return step.requiredApprovers.filter((a) => !approvedUserIds.has(a.id));
    },
    [workflow.steps]
  );
  const goToStep = useCallback3(
    (stepId) => {
      const index = workflow.steps.findIndex((s) => s.id === stepId);
      if (index >= 0) {
        setViewingStepIndex(index);
      }
    },
    [workflow.steps]
  );
  const getNextStep = useCallback3(() => {
    const nextIndex = state.currentStepIndex + 1;
    const nextStep = workflow.steps[nextIndex];
    return nextStep !== void 0 ? nextStep : null;
  }, [workflow.steps, state.currentStepIndex]);
  const getPreviousStep = useCallback3(() => {
    const prevIndex = state.currentStepIndex - 1;
    if (prevIndex < 0) return null;
    const prevStep = workflow.steps[prevIndex];
    return prevStep !== void 0 ? prevStep : null;
  }, [workflow.steps, state.currentStepIndex]);
  return {
    state,
    // Step actions
    approve,
    reject,
    requestChanges,
    delegate,
    skipStep,
    // Workflow actions
    cancel,
    resetToDraft,
    restart,
    // Query helpers
    canApprove,
    canReject,
    isCurrentStep,
    isStepComplete,
    getStep,
    getStepApprovers,
    getRemainingApprovers,
    // Navigation
    goToStep,
    getNextStep,
    getPreviousStep
  };
}

// src/primitives/SpendingMeter/types.ts
var DEFAULT_THRESHOLDS = [
  { level: "safe", percentage: 0, label: "On Track", color: "#22c55e" },
  { level: "warning", percentage: 75, label: "Approaching Limit", color: "#f59e0b" },
  { level: "danger", percentage: 90, label: "Near Limit", color: "#ef4444" },
  { level: "exceeded", percentage: 100, label: "Limit Exceeded", color: "#dc2626" }
];
var DEFAULT_CURRENCY = {
  code: "EUR",
  symbol: "\u20AC",
  decimals: 2,
  symbolPosition: "after",
  thousandsSeparator: " ",
  decimalSeparator: ","
};

// src/primitives/SpendingMeter/useSpendingMeter.ts
import { useCallback as useCallback4, useEffect, useMemo as useMemo4, useRef, useState as useState3 } from "react";
function defaultFormatCurrency(amount, currency) {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  const parts = absAmount.toFixed(currency.decimals).split(".");
  const integerPart = (parts[0] ?? "0").replace(
    /\B(?=(\d{3})+(?!\d))/g,
    currency.thousandsSeparator
  );
  const decimalPart = parts[1];
  const formattedNumber = decimalPart ? `${integerPart}${currency.decimalSeparator}${decimalPart}` : integerPart;
  if (currency.symbolPosition === "before") {
    return `${sign}${currency.symbol}${formattedNumber}`;
  }
  return `${sign}${formattedNumber} ${currency.symbol}`;
}
function daysBetween(start, end) {
  const msPerDay = 24 * 60 * 60 * 1e3;
  return Math.ceil((end.getTime() - start.getTime()) / msPerDay);
}
function getThresholdLevelForPercentage(percentage, thresholds) {
  const sorted = [...thresholds].sort((a, b) => b.percentage - a.percentage);
  for (const threshold of sorted) {
    if (percentage >= threshold.percentage) {
      return threshold.level;
    }
  }
  return "safe";
}
function getActiveThreshold(percentage, thresholds) {
  const level = getThresholdLevelForPercentage(percentage, thresholds);
  const found = thresholds.find((t) => t.level === level);
  if (found) return found;
  const first = thresholds[0];
  return first ?? { level: "safe", percentage: 0, label: "Safe", color: "#22c55e" };
}
function useSpendingMeter(options) {
  const {
    limit: initialLimit,
    warningThreshold = 75,
    dangerThreshold = 90,
    onThresholdChange,
    onLimitExceeded,
    onSoftLimitExceeded,
    formatCurrency = defaultFormatCurrency
  } = options;
  const [limit, setLimit] = useState3(initialLimit);
  const previousThresholdRef = useRef(null);
  const thresholds = useMemo4(() => {
    if (limit.thresholds && limit.thresholds.length > 0) {
      return limit.thresholds;
    }
    return [
      { level: "safe", percentage: 0, label: "On Track", color: "#22c55e" },
      {
        level: "warning",
        percentage: warningThreshold,
        label: "Approaching Limit",
        color: "#f59e0b"
      },
      {
        level: "danger",
        percentage: dangerThreshold,
        label: "Near Limit",
        color: "#ef4444"
      },
      {
        level: "exceeded",
        percentage: 100,
        label: "Limit Exceeded",
        color: "#dc2626"
      }
    ];
  }, [limit.thresholds, warningThreshold, dangerThreshold]);
  const state = useMemo4(() => {
    const spent = limit.spentAmount;
    const maxAmount = limit.maxAmount;
    const remaining = Math.max(0, maxAmount - spent);
    const percentage = maxAmount > 0 ? spent / maxAmount * 100 : 0;
    const displayPercentage = Math.min(100, percentage);
    const thresholdLevel = getThresholdLevelForPercentage(percentage, thresholds);
    const activeThreshold = getActiveThreshold(percentage, thresholds);
    const isExceeded = spent > maxAmount;
    const isSoftLimitExceeded = limit.softLimit ? spent > limit.softLimit : percentage >= warningThreshold;
    const isHardLimitExceeded = limit.hardLimit ? spent > limit.hardLimit : isExceeded;
    const currency = limit.currency ?? DEFAULT_CURRENCY;
    const formattedSpent = formatCurrency(spent, currency);
    const formattedRemaining = formatCurrency(remaining, currency);
    const formattedLimit = formatCurrency(maxAmount, currency);
    const now = /* @__PURE__ */ new Date();
    const daysInPeriod = daysBetween(limit.periodStart, limit.periodEnd);
    const daysElapsed = Math.max(1, daysBetween(limit.periodStart, now));
    const daysRemaining = Math.max(0, daysBetween(now, limit.periodEnd));
    const averageDailySpending = spent / daysElapsed;
    const projectedSpending = averageDailySpending * daysInPeriod;
    const isOnTrack = projectedSpending <= maxAmount;
    return {
      limit,
      spent,
      remaining,
      percentage,
      displayPercentage,
      thresholdLevel,
      activeThreshold,
      thresholds,
      isExceeded,
      isSoftLimitExceeded,
      isHardLimitExceeded,
      formattedSpent,
      formattedRemaining,
      formattedLimit,
      daysRemaining,
      averageDailySpending,
      projectedSpending,
      isOnTrack
    };
  }, [limit, thresholds, warningThreshold, formatCurrency]);
  useEffect(() => {
    const currentLevel = state.thresholdLevel;
    if (previousThresholdRef.current !== null) {
      if (previousThresholdRef.current !== currentLevel) {
        onThresholdChange?.(currentLevel, state);
      }
    }
    previousThresholdRef.current = currentLevel;
  }, [state.thresholdLevel, state, onThresholdChange]);
  useEffect(() => {
    if (state.isExceeded) {
      onLimitExceeded?.(state);
    }
  }, [state.isExceeded, state, onLimitExceeded]);
  useEffect(() => {
    if (state.isSoftLimitExceeded) {
      onSoftLimitExceeded?.(state);
    }
  }, [state.isSoftLimitExceeded, state, onSoftLimitExceeded]);
  const setSpent = useCallback4((amount) => {
    setLimit((prev) => ({
      ...prev,
      spentAmount: Math.max(0, amount)
    }));
  }, []);
  const addSpending = useCallback4((amount) => {
    setLimit((prev) => ({
      ...prev,
      spentAmount: Math.max(0, prev.spentAmount + amount)
    }));
  }, []);
  const updateLimit = useCallback4((updates) => {
    setLimit((prev) => ({
      ...prev,
      ...updates
    }));
  }, []);
  const resetSpending = useCallback4(() => {
    setLimit((prev) => ({
      ...prev,
      spentAmount: 0
    }));
    previousThresholdRef.current = null;
  }, []);
  const canSpend = useCallback4(
    (amount) => {
      if (!limit.isActive) return true;
      if (limit.allowExceed) return true;
      const newTotal = limit.spentAmount + amount;
      if (limit.hardLimit && newTotal > limit.hardLimit) {
        return false;
      }
      return newTotal <= limit.maxAmount;
    },
    [limit]
  );
  const getSpendableAmount = useCallback4(() => {
    if (!limit.isActive || limit.allowExceed) {
      return Infinity;
    }
    const maxAllowed = limit.hardLimit ?? limit.maxAmount;
    return Math.max(0, maxAllowed - limit.spentAmount);
  }, [limit]);
  const wouldTriggerWarning = useCallback4(
    (amount) => {
      const newPercentage = (limit.spentAmount + amount) / limit.maxAmount * 100;
      return newPercentage >= warningThreshold;
    },
    [limit, warningThreshold]
  );
  const wouldExceedLimit = useCallback4(
    (amount) => {
      return limit.spentAmount + amount > limit.maxAmount;
    },
    [limit]
  );
  const formatAmount = useCallback4(
    (amount) => {
      return formatCurrency(amount, limit.currency ?? DEFAULT_CURRENCY);
    },
    [formatCurrency, limit.currency]
  );
  const getPercentage = useCallback4(
    (amount) => {
      return limit.maxAmount > 0 ? amount / limit.maxAmount * 100 : 0;
    },
    [limit.maxAmount]
  );
  const getThresholdLevel = useCallback4(
    (percentage) => {
      return getThresholdLevelForPercentage(percentage, thresholds);
    },
    [thresholds]
  );
  return {
    state,
    // Actions
    setSpent,
    addSpending,
    updateLimit,
    resetSpending,
    // Query helpers
    canSpend,
    getSpendableAmount,
    wouldTriggerWarning,
    wouldExceedLimit,
    // Formatting helpers
    formatAmount,
    getPercentage,
    getThresholdLevel
  };
}

// src/primitives/QuoteBuilder/useQuoteBuilder.ts
import { useCallback as useCallback5, useMemo as useMemo5, useState as useState4 } from "react";
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
function defaultGenerateQuoteNumber() {
  const date = /* @__PURE__ */ new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `Q-${year}${month}-${random}`;
}
function calculateEffectiveUnitPrice(unitPrice, discount) {
  if (!discount) return unitPrice;
  switch (discount.type) {
    case "percentage":
      return unitPrice * (1 - discount.value / 100);
    case "fixed":
      return Math.max(0, unitPrice - discount.value);
    case "per_unit":
      return Math.max(0, unitPrice - discount.value);
    default:
      return unitPrice;
  }
}
function calculateLineTotal(effectiveUnitPrice, quantity, taxRate, includeTax) {
  const subtotal = effectiveUnitPrice * quantity;
  const taxAmount = taxRate ? subtotal * (taxRate / 100) : 0;
  const lineTotal = includeTax ? subtotal + taxAmount : subtotal;
  return { lineTotal, taxAmount };
}
function calculateQuoteDiscount(subtotal, discount) {
  if (discount.minOrderValue && subtotal < discount.minOrderValue) {
    return 0;
  }
  let amount;
  switch (discount.type) {
    case "percentage":
      amount = subtotal * (discount.value / 100);
      break;
    case "fixed":
      amount = discount.value;
      break;
    default:
      amount = 0;
  }
  if (discount.maxDiscount) {
    amount = Math.min(amount, discount.maxDiscount);
  }
  return amount;
}
function calculatePricing(items, discounts, shipping, taxRate, taxType, currency) {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discountTotal = discounts.reduce(
    (sum, discount) => sum + calculateQuoteDiscount(subtotal, discount),
    0
  );
  const discountedSubtotal = Math.max(0, subtotal - discountTotal);
  let taxAmount = 0;
  if (taxType !== "exempt") {
    const taxableAmount = discountedSubtotal + shipping;
    taxAmount = taxableAmount * (taxRate / 100);
  }
  let total = discountedSubtotal + shipping;
  if (taxType === "excluded") {
    total += taxAmount;
  }
  return {
    subtotal,
    discountTotal,
    discountedSubtotal,
    shipping,
    taxType,
    taxRate,
    taxAmount,
    total,
    currency
  };
}
function createInitialQuote(options, generateQuoteNumber) {
  const now = /* @__PURE__ */ new Date();
  const validityDays = options.validityDays ?? 30;
  const expirationDate = new Date(now);
  expirationDate.setDate(expirationDate.getDate() + validityDays);
  const initialQuote = {
    id: options.initialQuote?.id ?? generateId(),
    quoteNumber: options.initialQuote?.quoteNumber ?? generateQuoteNumber(),
    status: options.initialQuote?.status ?? "draft",
    customer: options.customer,
    items: options.initialQuote?.items ?? [],
    discounts: options.initialQuote?.discounts ?? [],
    pricing: options.initialQuote?.pricing ?? {
      subtotal: 0,
      discountTotal: 0,
      discountedSubtotal: 0,
      shipping: 0,
      taxType: options.taxType ?? "excluded",
      taxRate: options.taxRate ?? 20,
      taxAmount: 0,
      total: 0,
      currency: options.currency ?? "EUR"
    },
    terms: options.initialQuote?.terms ?? {
      paymentTerms: options.paymentTerms ?? "NET30",
      validityDays,
      expirationDate
    },
    createdBy: options.initialQuote?.createdBy ?? {
      id: "",
      name: "",
      email: ""
    },
    createdAt: options.initialQuote?.createdAt ?? now,
    updatedAt: now,
    version: options.initialQuote?.version ?? 1
  };
  if (options.initialQuote?.metadata) {
    initialQuote.metadata = options.initialQuote.metadata;
  }
  return initialQuote;
}
function validateQuote(quote) {
  const errors = [];
  if (quote.items.length === 0) {
    errors.push({
      field: "items",
      message: "Quote must have at least one item",
      type: "error"
    });
  }
  quote.items.forEach((item, index) => {
    if (item.quantity <= 0) {
      errors.push({
        field: `items[${index}].quantity`,
        message: `Item "${item.name}" must have a positive quantity`,
        type: "error"
      });
    }
    if (item.unitPrice < 0) {
      errors.push({
        field: `items[${index}].unitPrice`,
        message: `Item "${item.name}" cannot have a negative price`,
        type: "error"
      });
    }
  });
  if (!quote.customer.companyName) {
    errors.push({
      field: "customer.companyName",
      message: "Company name is required",
      type: "error"
    });
  }
  if (!quote.customer.email) {
    errors.push({
      field: "customer.email",
      message: "Customer email is required",
      type: "error"
    });
  }
  if (quote.terms.expirationDate < /* @__PURE__ */ new Date()) {
    errors.push({
      field: "terms.expirationDate",
      message: "Quote expiration date is in the past",
      type: "warning"
    });
  }
  return errors;
}
function useQuoteBuilder(options) {
  const {
    customer,
    currency = "EUR",
    taxRate = 20,
    taxType = "excluded",
    autoCalculate = true,
    generateQuoteNumber = defaultGenerateQuoteNumber,
    onChange,
    onSave,
    onSend
  } = options;
  const [quote, setQuote] = useState4(
    () => createInitialQuote(options, generateQuoteNumber)
  );
  const [isDirty, setIsDirty] = useState4(false);
  const [selectedItems, setSelectedItems] = useState4(/* @__PURE__ */ new Set());
  const recalculatePricing = useCallback5(
    (currentQuote) => {
      const pricing = calculatePricing(
        currentQuote.items,
        currentQuote.discounts,
        currentQuote.pricing.shipping,
        currentQuote.pricing.taxRate,
        currentQuote.pricing.taxType,
        currentQuote.pricing.currency
      );
      return {
        ...currentQuote,
        pricing,
        updatedAt: /* @__PURE__ */ new Date()
      };
    },
    []
  );
  const updateQuote = useCallback5(
    (updater) => {
      setQuote((prev) => {
        let updated = updater(prev);
        if (autoCalculate) {
          updated = recalculatePricing(updated);
        }
        setIsDirty(true);
        onChange?.(updated);
        return updated;
      });
    },
    [autoCalculate, recalculatePricing, onChange]
  );
  const calculateItemTotals = useCallback5(
    (item) => {
      const unitPrice = item.unitPrice ?? 0;
      const quantity = item.quantity ?? 1;
      const effectiveUnitPrice = calculateEffectiveUnitPrice(
        unitPrice,
        item.discount
      );
      const { lineTotal, taxAmount: calculatedTaxAmount } = calculateLineTotal(
        effectiveUnitPrice,
        quantity,
        item.taxRate ?? taxRate,
        taxType === "included"
      );
      const result = {
        id: item.id ?? generateId(),
        productId: item.productId ?? "",
        name: item.name ?? "",
        quantity,
        unitPrice,
        effectiveUnitPrice,
        lineTotal
      };
      if (item.description !== void 0) result.description = item.description;
      if (item.sku !== void 0) result.sku = item.sku;
      if (item.unit !== void 0) result.unit = item.unit;
      if (item.discount !== void 0) result.discount = item.discount;
      result.taxRate = item.taxRate ?? taxRate;
      result.taxAmount = calculatedTaxAmount;
      if (item.customizable !== void 0) result.customizable = item.customizable;
      if (item.customOptions !== void 0) result.customOptions = item.customOptions;
      if (item.leadTime !== void 0) result.leadTime = item.leadTime;
      if (item.notes !== void 0) result.notes = item.notes;
      if (item.cartItemId !== void 0) result.cartItemId = item.cartItemId;
      return result;
    },
    [taxRate, taxType]
  );
  const errors = useMemo5(() => validateQuote(quote), [quote]);
  const isValid = errors.filter((e) => e.type === "error").length === 0;
  const state = useMemo5(
    () => ({
      quote,
      isDirty,
      errors,
      isValid,
      selectedItems
    }),
    [quote, isDirty, errors, isValid, selectedItems]
  );
  const addItem = useCallback5(
    (item) => {
      const newItem = calculateItemTotals(item);
      updateQuote((prev) => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    },
    [calculateItemTotals, updateQuote]
  );
  const updateItem = useCallback5(
    (itemId, updates) => {
      updateQuote((prev) => ({
        ...prev,
        items: prev.items.map(
          (item) => item.id === itemId ? calculateItemTotals({ ...item, ...updates }) : item
        )
      }));
    },
    [calculateItemTotals, updateQuote]
  );
  const removeItem = useCallback5(
    (itemId) => {
      updateQuote((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== itemId)
      }));
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    },
    [updateQuote]
  );
  const duplicateItem = useCallback5(
    (itemId) => {
      const item = quote.items.find((i) => i.id === itemId);
      if (item) {
        const newItem = calculateItemTotals({
          ...item,
          id: generateId(),
          notes: `Copy of: ${item.name}`
        });
        updateQuote((prev) => {
          const index = prev.items.findIndex((i) => i.id === itemId);
          const newItems = [...prev.items];
          newItems.splice(index + 1, 0, newItem);
          return { ...prev, items: newItems };
        });
      }
    },
    [quote.items, calculateItemTotals, updateQuote]
  );
  const setItemQuantity = useCallback5(
    (itemId, quantity) => {
      updateItem(itemId, { quantity: Math.max(1, quantity) });
    },
    [updateItem]
  );
  const applyItemDiscount = useCallback5(
    (itemId, discount) => {
      if (discount) {
        updateItem(itemId, { discount });
      }
    },
    [updateItem]
  );
  const clearItemDiscount = useCallback5(
    (itemId) => {
      updateQuote((prev) => ({
        ...prev,
        items: prev.items.map((item) => {
          if (item.id !== itemId) return item;
          const { discount: _, ...itemWithoutDiscount } = item;
          return calculateItemTotals(itemWithoutDiscount);
        })
      }));
    },
    [updateQuote, calculateItemTotals]
  );
  const reorderItems = useCallback5(
    (fromIndex, toIndex) => {
      updateQuote((prev) => {
        if (fromIndex < 0 || fromIndex >= prev.items.length) return prev;
        if (toIndex < 0 || toIndex > prev.items.length) return prev;
        const newItems = [...prev.items];
        const [removed] = newItems.splice(fromIndex, 1);
        if (removed === void 0) return prev;
        newItems.splice(toIndex, 0, removed);
        return { ...prev, items: newItems };
      });
    },
    [updateQuote]
  );
  const cartItemToPartial = useCallback5(
    (cartItem) => {
      const partial = {
        productId: cartItem.productId,
        name: cartItem.name,
        quantity: cartItem.quantity,
        unitPrice: cartItem.unitPrice,
        cartItemId: cartItem.id
      };
      if (cartItem.description) partial.description = cartItem.description;
      if (cartItem.sku) partial.sku = cartItem.sku;
      if (cartItem.customOptions) partial.customOptions = cartItem.customOptions;
      return partial;
    },
    []
  );
  const importFromCart = useCallback5(
    (cartItems) => {
      const newItems = cartItems.map(
        (cartItem) => calculateItemTotals(cartItemToPartial(cartItem))
      );
      updateQuote((prev) => ({
        ...prev,
        items: [...prev.items, ...newItems]
      }));
    },
    [calculateItemTotals, cartItemToPartial, updateQuote]
  );
  const replaceFromCart = useCallback5(
    (cartItems) => {
      const newItems = cartItems.map(
        (cartItem) => calculateItemTotals(cartItemToPartial(cartItem))
      );
      updateQuote((prev) => ({
        ...prev,
        items: newItems
      }));
      setSelectedItems(/* @__PURE__ */ new Set());
    },
    [calculateItemTotals, updateQuote]
  );
  const addDiscount = useCallback5(
    (discount) => {
      const newDiscount = {
        ...discount,
        id: generateId()
      };
      updateQuote((prev) => ({
        ...prev,
        discounts: [...prev.discounts, newDiscount]
      }));
    },
    [updateQuote]
  );
  const removeDiscount = useCallback5(
    (discountId) => {
      updateQuote((prev) => ({
        ...prev,
        discounts: prev.discounts.filter((d) => d.id !== discountId)
      }));
    },
    [updateQuote]
  );
  const clearDiscounts = useCallback5(() => {
    updateQuote((prev) => ({
      ...prev,
      discounts: []
    }));
  }, [updateQuote]);
  const setShipping = useCallback5(
    (amount) => {
      updateQuote((prev) => ({
        ...prev,
        pricing: { ...prev.pricing, shipping: Math.max(0, amount) }
      }));
    },
    [updateQuote]
  );
  const setTaxRate = useCallback5(
    (rate) => {
      updateQuote((prev) => ({
        ...prev,
        pricing: { ...prev.pricing, taxRate: Math.max(0, rate) }
      }));
    },
    [updateQuote]
  );
  const setTaxType = useCallback5(
    (type) => {
      updateQuote((prev) => ({
        ...prev,
        pricing: { ...prev.pricing, taxType: type }
      }));
    },
    [updateQuote]
  );
  const recalculate = useCallback5(() => {
    setQuote((prev) => recalculatePricing(prev));
  }, [recalculatePricing]);
  const updateTerms = useCallback5(
    (terms) => {
      updateQuote((prev) => ({
        ...prev,
        terms: { ...prev.terms, ...terms }
      }));
    },
    [updateQuote]
  );
  const setExpirationDate = useCallback5(
    (date) => {
      updateTerms({ expirationDate: date });
    },
    [updateTerms]
  );
  const setValidityDays = useCallback5(
    (days) => {
      const expirationDate = /* @__PURE__ */ new Date();
      expirationDate.setDate(expirationDate.getDate() + days);
      updateTerms({ validityDays: days, expirationDate });
    },
    [updateTerms]
  );
  const updateCustomer = useCallback5(
    (customerUpdates) => {
      updateQuote((prev) => ({
        ...prev,
        customer: { ...prev.customer, ...customerUpdates }
      }));
    },
    [updateQuote]
  );
  const selectItem = useCallback5((itemId) => {
    setSelectedItems((prev) => new Set(prev).add(itemId));
  }, []);
  const deselectItem = useCallback5((itemId) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  }, []);
  const toggleItemSelection = useCallback5((itemId) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);
  const selectAllItems = useCallback5(() => {
    setSelectedItems(new Set(quote.items.map((item) => item.id)));
  }, [quote.items]);
  const deselectAllItems = useCallback5(() => {
    setSelectedItems(/* @__PURE__ */ new Set());
  }, []);
  const removeSelectedItems = useCallback5(() => {
    updateQuote((prev) => ({
      ...prev,
      items: prev.items.filter((item) => !selectedItems.has(item.id))
    }));
    setSelectedItems(/* @__PURE__ */ new Set());
  }, [selectedItems, updateQuote]);
  const applyDiscountToSelected = useCallback5(
    (discount) => {
      if (!discount) return;
      updateQuote((prev) => ({
        ...prev,
        items: prev.items.map(
          (item) => selectedItems.has(item.id) ? calculateItemTotals({ ...item, discount }) : item
        )
      }));
    },
    [selectedItems, calculateItemTotals, updateQuote]
  );
  const save = useCallback5(() => {
    const savedQuote = recalculatePricing(quote);
    setQuote(savedQuote);
    setIsDirty(false);
    onSave?.(savedQuote);
    return savedQuote;
  }, [quote, recalculatePricing, onSave]);
  const send = useCallback5(() => {
    const sentQuote = {
      ...recalculatePricing(quote),
      status: "sent",
      sentAt: /* @__PURE__ */ new Date()
    };
    setQuote(sentQuote);
    setIsDirty(false);
    onSend?.(sentQuote);
  }, [quote, recalculatePricing, onSend]);
  const createRevision = useCallback5(() => {
    const { sentAt, viewedAt, respondedAt, ...baseQuote } = quote;
    const revision = {
      ...baseQuote,
      id: generateId(),
      quoteNumber: generateQuoteNumber(),
      status: "draft",
      version: quote.version + 1,
      originalQuoteId: quote.id,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    setQuote(revision);
    setIsDirty(true);
  }, [quote, generateQuoteNumber]);
  const reset = useCallback5(() => {
    setQuote(createInitialQuote(options, generateQuoteNumber));
    setIsDirty(false);
    setSelectedItems(/* @__PURE__ */ new Set());
  }, [options, generateQuoteNumber]);
  const markDirty = useCallback5(() => {
    setIsDirty(true);
  }, []);
  const markClean = useCallback5(() => {
    setIsDirty(false);
  }, []);
  const validate = useCallback5(() => validateQuote(quote), [quote]);
  const getItem = useCallback5(
    (itemId) => quote.items.find((item) => item.id === itemId),
    [quote.items]
  );
  const hasItem = useCallback5(
    (itemId) => quote.items.some((item) => item.id === itemId),
    [quote.items]
  );
  return {
    state,
    // Line item actions
    addItem,
    updateItem,
    removeItem,
    duplicateItem,
    setItemQuantity,
    applyItemDiscount,
    clearItemDiscount,
    reorderItems,
    // Cart conversion
    importFromCart,
    replaceFromCart,
    // Quote-level discount actions
    addDiscount,
    removeDiscount,
    clearDiscounts,
    // Pricing actions
    setShipping,
    setTaxRate,
    setTaxType,
    recalculate,
    // Terms actions
    updateTerms,
    setExpirationDate,
    setValidityDays,
    // Customer actions
    updateCustomer,
    // Selection actions
    selectItem,
    deselectItem,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    removeSelectedItems,
    applyDiscountToSelected,
    // Quote actions
    save,
    send,
    createRevision,
    reset,
    markDirty,
    markClean,
    // Validation
    validate,
    getItem,
    hasItem
  };
}

export {
  useDataTable,
  useBulkSelector,
  useApprovalFlow,
  DEFAULT_THRESHOLDS,
  DEFAULT_CURRENCY,
  useSpendingMeter,
  useQuoteBuilder
};
//# sourceMappingURL=chunk-4GGOZDGK.js.map