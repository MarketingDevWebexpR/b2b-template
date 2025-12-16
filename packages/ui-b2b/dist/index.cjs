"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  DEFAULT_APPROVAL_RULES: () => DEFAULT_APPROVAL_RULES,
  DEFAULT_CURRENCY: () => DEFAULT_CURRENCY,
  DEFAULT_THRESHOLDS: () => DEFAULT_THRESHOLDS,
  EMPLOYEE_COLUMN_MAPPINGS: () => EMPLOYEE_COLUMN_MAPPINGS,
  addressSchema: () => addressSchema,
  calculateByCategory: () => calculateByCategory,
  calculateByDay: () => calculateByDay,
  calculateEffectiveLimit: () => calculateEffectiveLimit,
  calculateRollover: () => calculateRollover,
  calculateSavingsOpportunity: () => calculateSavingsOpportunity,
  calculateSpending: () => calculateSpending,
  calculateTotal: () => calculateTotal,
  calculateTrend: () => calculateTrend,
  canAutoApprove: () => canAutoApprove,
  canMakePurchase: () => canMakePurchase,
  categorySpendingLimitCreateSchema: () => categorySpendingLimitCreateSchema,
  companyAddressSchema: () => companyAddressSchema,
  companyBillingSettingsSchema: () => companyBillingSettingsSchema,
  companyBrandingSettingsSchema: () => companyBrandingSettingsSchema,
  companyFilterSchema: () => companyFilterSchema,
  companyNotificationSettingsSchema: () => companyNotificationSettingsSchema,
  companyOrderingSettingsSchema: () => companyOrderingSettingsSchema,
  companyProfileSchema: () => companyProfileSchema,
  companyRegistrationSchema: () => companyRegistrationSchema,
  companySettingsSchema: () => companySettingsSchema,
  companyShippingSettingsSchema: () => companyShippingSettingsSchema,
  companySpendingLimitCreateSchema: () => companySpendingLimitCreateSchema,
  companyStatusSchema: () => companyStatusSchema,
  companyTypeSchema: () => companyTypeSchema,
  costCenterSpendingLimitCreateSchema: () => costCenterSpendingLimitCreateSchema,
  createAmountRule: () => createAmountRule,
  createDepartmentRule: () => createDepartmentRule,
  createRoleRule: () => createRoleRule,
  currencyConfigSchema: () => currencyConfigSchema,
  daysBetween: () => daysBetween2,
  departmentSpendingLimitCreateSchema: () => departmentSpendingLimitCreateSchema,
  discountTypeSchema: () => discountTypeSchema,
  employeeBaseSchema: () => employeeBaseSchema,
  employeeBulkImportRowSchema: () => employeeBulkImportRowSchema,
  employeeCreateSchema: () => employeeCreateSchema,
  employeeFilterSchema: () => employeeFilterSchema,
  employeeInviteSchema: () => employeeInviteSchema,
  employeePermissionsSchema: () => employeePermissionsSchema,
  employeeRoleSchema: () => employeeRoleSchema,
  employeeSpendingLimitCreateSchema: () => employeeSpendingLimitCreateSchema,
  employeeSpendingLimitSchema: () => employeeSpendingLimitSchema,
  employeeStatusSchema: () => employeeStatusSchema,
  employeeUpdateSchema: () => employeeUpdateSchema,
  evaluateCondition: () => evaluateCondition,
  evaluateRule: () => evaluateRule,
  evaluateRules: () => evaluateRules,
  filterByPeriod: () => filterByPeriod,
  formatAddress: () => formatAddress,
  formatCompanyName: () => formatCompanyName,
  formatCurrency: () => formatCurrency,
  formatCurrencyCompact: () => formatCurrencyCompact,
  formatDate: () => formatDate,
  formatDuration: () => formatDuration,
  formatFileSize: () => formatFileSize,
  formatInvoiceNumber: () => formatInvoiceNumber,
  formatNumber: () => formatNumber,
  formatOrderNumber: () => formatOrderNumber,
  formatPaymentTerms: () => formatPaymentTerms,
  formatPercentage: () => formatPercentage,
  formatPhoneNumber: () => formatPhoneNumber,
  formatQuantity: () => formatQuantity,
  formatQuoteNumber: () => formatQuoteNumber,
  formatRelativeDate: () => formatRelativeDate,
  formatVatId: () => formatVatId,
  generateCsv: () => generateCsv,
  generateForecast: () => generateForecast,
  generateTemplate: () => generateTemplate,
  getPeriodDates: () => getPeriodDates,
  getRequiredApprovers: () => getRequiredApprovers,
  lineItemDiscountSchema: () => lineItemDiscountSchema,
  mapColumns: () => mapColumns,
  parseCsv: () => parseCsv,
  quoteCreateSchema: () => quoteCreateSchema,
  quoteCustomerSchema: () => quoteCustomerSchema,
  quoteDiscountSchema: () => quoteDiscountSchema,
  quoteFilterSchema: () => quoteFilterSchema,
  quoteLineItemSchema: () => quoteLineItemSchema,
  quotePricingSchema: () => quotePricingSchema,
  quoteResponseSchema: () => quoteResponseSchema,
  quoteSendSchema: () => quoteSendSchema,
  quoteStatusSchema: () => quoteStatusSchema,
  quoteTermsSchema: () => quoteTermsSchema,
  quoteUpdateSchema: () => quoteUpdateSchema,
  readAndParseCsv: () => readAndParseCsv,
  readFileAsText: () => readFileAsText,
  requiresApproval: () => requiresApproval,
  shouldReject: () => shouldReject,
  spendingAdjustmentSchema: () => spendingAdjustmentSchema,
  spendingLimitBaseSchema: () => spendingLimitBaseSchema,
  spendingLimitCreateSchema: () => spendingLimitCreateSchema,
  spendingLimitFilterSchema: () => spendingLimitFilterSchema,
  spendingLimitStatusSchema: () => spendingLimitStatusSchema,
  spendingLimitTypeSchema: () => spendingLimitTypeSchema,
  spendingLimitUpdateSchema: () => spendingLimitUpdateSchema,
  spendingPeriodSchema: () => spendingPeriodSchema,
  spendingThresholdSchema: () => spendingThresholdSchema,
  spendingTransactionSchema: () => spendingTransactionSchema,
  taxTypeSchema: () => taxTypeSchema,
  thresholdActionSchema: () => thresholdActionSchema,
  truncateText: () => truncateText,
  useApprovalFlow: () => useApprovalFlow,
  useBulkSelector: () => useBulkSelector,
  useDataTable: () => useDataTable,
  useQuoteBuilder: () => useQuoteBuilder,
  useSpendingMeter: () => useSpendingMeter,
  validateFileSize: () => validateFileSize
});
module.exports = __toCommonJS(src_exports);

// src/primitives/DataTable/useDataTable.ts
var import_react = require("react");
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
  const initialState = (0, import_react.useMemo)(
    () => createInitialState(options),
    // Only recreate on column changes, not data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns]
  );
  const [state, dispatch] = (0, import_react.useReducer)(dataTableReducer, initialState);
  (0, import_react.useMemo)(() => {
    if (data !== state.originalData) {
      dispatch({ type: "SET_DATA", payload: data });
    }
  }, [data, state.originalData]);
  const processedData = (0, import_react.useMemo)(() => {
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
  const paginationState = (0, import_react.useMemo)(() => {
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
  const paginatedData = (0, import_react.useMemo)(() => {
    if (!enableClientSidePagination) {
      return processedData;
    }
    const start = paginationState.pageIndex * paginationState.pageSize;
    const end = start + paginationState.pageSize;
    return processedData.slice(start, end);
  }, [processedData, paginationState, enableClientSidePagination]);
  const rowSelectionState = (0, import_react.useMemo)(() => {
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
  const fullState = (0, import_react.useMemo)(
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
  const setSort = (0, import_react.useCallback)(
    (sort) => {
      dispatch({ type: "SET_SORT", payload: sort });
      onSortChange?.(sort);
    },
    [onSortChange]
  );
  const toggleSort = (0, import_react.useCallback)(
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
  const clearSort = (0, import_react.useCallback)(() => {
    dispatch({ type: "SET_SORT", payload: null });
    onSortChange?.(null);
  }, [onSortChange]);
  const setFilter = (0, import_react.useCallback)(
    (filter) => {
      dispatch({ type: "SET_FILTER", payload: filter });
      const newFilters = state.filters.some((f) => f.key === filter.key) ? state.filters.map((f) => f.key === filter.key ? filter : f) : [...state.filters, filter];
      onFiltersChange?.(newFilters);
    },
    [state.filters, onFiltersChange]
  );
  const removeFilter = (0, import_react.useCallback)(
    (columnKey) => {
      dispatch({ type: "REMOVE_FILTER", payload: columnKey });
      onFiltersChange?.(state.filters.filter((f) => f.key !== columnKey));
    },
    [state.filters, onFiltersChange]
  );
  const clearFilters = (0, import_react.useCallback)(() => {
    dispatch({ type: "CLEAR_FILTERS" });
    onFiltersChange?.([]);
  }, [onFiltersChange]);
  const setFilters = (0, import_react.useCallback)(
    (filters) => {
      dispatch({ type: "SET_FILTERS", payload: filters });
      onFiltersChange?.(filters);
    },
    [onFiltersChange]
  );
  const goToPage = (0, import_react.useCallback)(
    (pageIndex) => {
      const safePage = Math.max(0, Math.min(pageIndex, paginationState.totalPages - 1));
      dispatch({ type: "SET_PAGE", payload: safePage });
      onPaginationChange?.({ pageIndex: safePage, pageSize: state.pageSize });
    },
    [paginationState.totalPages, state.pageSize, onPaginationChange]
  );
  const nextPage = (0, import_react.useCallback)(() => {
    if (paginationState.hasNextPage) {
      goToPage(paginationState.pageIndex + 1);
    }
  }, [paginationState, goToPage]);
  const previousPage = (0, import_react.useCallback)(() => {
    if (paginationState.hasPreviousPage) {
      goToPage(paginationState.pageIndex - 1);
    }
  }, [paginationState, goToPage]);
  const firstPage = (0, import_react.useCallback)(() => {
    goToPage(0);
  }, [goToPage]);
  const lastPage = (0, import_react.useCallback)(() => {
    goToPage(paginationState.totalPages - 1);
  }, [paginationState.totalPages, goToPage]);
  const setPageSize = (0, import_react.useCallback)(
    (size) => {
      dispatch({ type: "SET_PAGE_SIZE", payload: size });
      onPaginationChange?.({ pageIndex: 0, pageSize: size });
    },
    [onPaginationChange]
  );
  const selectRow = (0, import_react.useCallback)(
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
  const deselectRow = (0, import_react.useCallback)(
    (rowId) => {
      dispatch({ type: "DESELECT_ROW", payload: rowId });
      const newSelected = new Set(state.selectedRowIds);
      newSelected.delete(rowId);
      onSelectionChange?.(Array.from(newSelected));
    },
    [state.selectedRowIds, onSelectionChange]
  );
  const toggleRowSelection = (0, import_react.useCallback)(
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
  const selectAll = (0, import_react.useCallback)(() => {
    if (selectionMode !== "multiple") return;
    const allIds = paginatedData.map(getRowId);
    dispatch({ type: "SELECT_ALL", payload: allIds });
    onSelectionChange?.(allIds);
  }, [selectionMode, paginatedData, getRowId, onSelectionChange]);
  const deselectAll = (0, import_react.useCallback)(() => {
    dispatch({ type: "DESELECT_ALL" });
    onSelectionChange?.([]);
  }, [onSelectionChange]);
  const toggleSelectAll = (0, import_react.useCallback)(() => {
    if (rowSelectionState.allSelected) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [rowSelectionState.allSelected, selectAll, deselectAll]);
  const isRowSelected = (0, import_react.useCallback)(
    (rowId) => state.selectedRowIds.has(rowId),
    [state.selectedRowIds]
  );
  const getSelectedRows = (0, import_react.useCallback)(() => {
    return data.filter((row) => state.selectedRowIds.has(getRowId(row)));
  }, [data, state.selectedRowIds, getRowId]);
  const toggleColumnVisibility = (0, import_react.useCallback)((columnId) => {
    const column = state.columns.find((c) => c.id === columnId);
    if (column) {
      dispatch({
        type: "SET_COLUMN_VISIBILITY",
        payload: { columnId, visible: !column.visible }
      });
    }
  }, [state.columns]);
  const setColumnVisibility = (0, import_react.useCallback)((columnId, visible) => {
    dispatch({ type: "SET_COLUMN_VISIBILITY", payload: { columnId, visible } });
  }, []);
  const getVisibleColumns = (0, import_react.useCallback)(
    () => state.columns.filter((c) => c.visible !== false),
    [state.columns]
  );
  const getPaginatedData = (0, import_react.useCallback)(() => paginatedData, [paginatedData]);
  const getProcessedData = (0, import_react.useCallback)(() => processedData, [processedData]);
  const getCellValue = (0, import_react.useCallback)(
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
  const reset = (0, import_react.useCallback)(() => {
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
var import_react2 = require("react");
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
  const [selectedIds, setSelectedIds] = (0, import_react2.useState)(
    () => new Set(initialSelectedIds)
  );
  const selectableItems = (0, import_react2.useMemo)(
    () => items.filter(isItemSelectable),
    [items, isItemSelectable]
  );
  const selectableIds = (0, import_react2.useMemo)(
    () => new Set(selectableItems.map(getItemId)),
    [selectableItems, getItemId]
  );
  const state = (0, import_react2.useMemo)(() => {
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
  const notifyChange = (0, import_react2.useCallback)(
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
  const select = (0, import_react2.useCallback)(
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
  const deselect = (0, import_react2.useCallback)(
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
  const toggle = (0, import_react2.useCallback)(
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
  const selectAll = (0, import_react2.useCallback)(() => {
    const allIds = selectableItems.map(getItemId);
    const idsToSelect = maxSelection ? allIds.slice(0, maxSelection) : allIds;
    const newSet = new Set(idsToSelect);
    setSelectedIds(newSet);
    notifyChange(newSet);
  }, [selectableItems, getItemId, maxSelection, notifyChange]);
  const deselectAll = (0, import_react2.useCallback)(() => {
    const newSet = /* @__PURE__ */ new Set();
    setSelectedIds(newSet);
    notifyChange(newSet);
  }, [notifyChange]);
  const toggleAll = (0, import_react2.useCallback)(() => {
    if (state.isAllSelected) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [state.isAllSelected, selectAll, deselectAll]);
  const selectMany = (0, import_react2.useCallback)(
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
  const deselectMany = (0, import_react2.useCallback)(
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
  const setSelection = (0, import_react2.useCallback)(
    (ids) => {
      const validIds = ids.filter((id) => selectableIds.has(id));
      const limitedIds = maxSelection ? validIds.slice(0, maxSelection) : validIds;
      const newSet = new Set(limitedIds);
      setSelectedIds(newSet);
      notifyChange(newSet);
    },
    [selectableIds, maxSelection, notifyChange]
  );
  const isSelected = (0, import_react2.useCallback)((id) => selectedIds.has(id), [selectedIds]);
  const canSelect = (0, import_react2.useCallback)(
    (id) => {
      if (!selectableIds.has(id)) return false;
      if (selectedIds.has(id)) return true;
      if (maxSelection && selectedIds.size >= maxSelection) return false;
      return true;
    },
    [selectableIds, selectedIds, maxSelection]
  );
  const getSelectedItems = (0, import_react2.useCallback)(
    () => items.filter((item) => selectedIds.has(getItemId(item))),
    [items, selectedIds, getItemId]
  );
  const getSelectedIds = (0, import_react2.useCallback)(
    () => Array.from(selectedIds),
    [selectedIds]
  );
  const selectRange = (0, import_react2.useCallback)(
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
  const reset = (0, import_react2.useCallback)(() => {
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
var import_react3 = require("react");
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
  const [workflow, setWorkflow] = (0, import_react3.useState)(initialWorkflow);
  const [viewingStepIndex, setViewingStepIndex] = (0, import_react3.useState)(null);
  const updateWorkflow = (0, import_react3.useCallback)(
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
  const state = (0, import_react3.useMemo)(() => {
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
  const createAction = (0, import_react3.useCallback)(
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
  const updateStep = (0, import_react3.useCallback)(
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
  const approve = (0, import_react3.useCallback)(
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
  const reject = (0, import_react3.useCallback)(
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
  const requestChanges = (0, import_react3.useCallback)(
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
  const delegate = (0, import_react3.useCallback)(
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
  const skipStep = (0, import_react3.useCallback)(
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
  const cancel = (0, import_react3.useCallback)(
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
  const resetToDraft = (0, import_react3.useCallback)(() => {
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
  const restart = (0, import_react3.useCallback)(() => {
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
  const canApprove = (0, import_react3.useCallback)(
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
  const canReject = (0, import_react3.useCallback)(
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
  const isCurrentStep = (0, import_react3.useCallback)(
    (stepId) => state.currentStep?.id === stepId,
    [state.currentStep]
  );
  const isStepComplete = (0, import_react3.useCallback)(
    (stepId) => {
      const step = workflow.steps.find((s) => s.id === stepId);
      return step?.status === "approved" || step?.status === "skipped";
    },
    [workflow.steps]
  );
  const getStep = (0, import_react3.useCallback)(
    (stepId) => workflow.steps.find((s) => s.id === stepId),
    [workflow.steps]
  );
  const getStepApprovers = (0, import_react3.useCallback)(
    (stepId) => {
      const step = workflow.steps.find((s) => s.id === stepId);
      return step?.requiredApprovers ?? [];
    },
    [workflow.steps]
  );
  const getRemainingApprovers = (0, import_react3.useCallback)(
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
  const goToStep = (0, import_react3.useCallback)(
    (stepId) => {
      const index = workflow.steps.findIndex((s) => s.id === stepId);
      if (index >= 0) {
        setViewingStepIndex(index);
      }
    },
    [workflow.steps]
  );
  const getNextStep = (0, import_react3.useCallback)(() => {
    const nextIndex = state.currentStepIndex + 1;
    const nextStep = workflow.steps[nextIndex];
    return nextStep !== void 0 ? nextStep : null;
  }, [workflow.steps, state.currentStepIndex]);
  const getPreviousStep = (0, import_react3.useCallback)(() => {
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

// src/primitives/SpendingMeter/useSpendingMeter.ts
var import_react4 = require("react");

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
    formatCurrency: formatCurrency2 = defaultFormatCurrency
  } = options;
  const [limit, setLimit] = (0, import_react4.useState)(initialLimit);
  const previousThresholdRef = (0, import_react4.useRef)(null);
  const thresholds = (0, import_react4.useMemo)(() => {
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
  const state = (0, import_react4.useMemo)(() => {
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
    const formattedSpent = formatCurrency2(spent, currency);
    const formattedRemaining = formatCurrency2(remaining, currency);
    const formattedLimit = formatCurrency2(maxAmount, currency);
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
  }, [limit, thresholds, warningThreshold, formatCurrency2]);
  (0, import_react4.useEffect)(() => {
    const currentLevel = state.thresholdLevel;
    if (previousThresholdRef.current !== null) {
      if (previousThresholdRef.current !== currentLevel) {
        onThresholdChange?.(currentLevel, state);
      }
    }
    previousThresholdRef.current = currentLevel;
  }, [state.thresholdLevel, state, onThresholdChange]);
  (0, import_react4.useEffect)(() => {
    if (state.isExceeded) {
      onLimitExceeded?.(state);
    }
  }, [state.isExceeded, state, onLimitExceeded]);
  (0, import_react4.useEffect)(() => {
    if (state.isSoftLimitExceeded) {
      onSoftLimitExceeded?.(state);
    }
  }, [state.isSoftLimitExceeded, state, onSoftLimitExceeded]);
  const setSpent = (0, import_react4.useCallback)((amount) => {
    setLimit((prev) => ({
      ...prev,
      spentAmount: Math.max(0, amount)
    }));
  }, []);
  const addSpending = (0, import_react4.useCallback)((amount) => {
    setLimit((prev) => ({
      ...prev,
      spentAmount: Math.max(0, prev.spentAmount + amount)
    }));
  }, []);
  const updateLimit = (0, import_react4.useCallback)((updates) => {
    setLimit((prev) => ({
      ...prev,
      ...updates
    }));
  }, []);
  const resetSpending = (0, import_react4.useCallback)(() => {
    setLimit((prev) => ({
      ...prev,
      spentAmount: 0
    }));
    previousThresholdRef.current = null;
  }, []);
  const canSpend = (0, import_react4.useCallback)(
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
  const getSpendableAmount = (0, import_react4.useCallback)(() => {
    if (!limit.isActive || limit.allowExceed) {
      return Infinity;
    }
    const maxAllowed = limit.hardLimit ?? limit.maxAmount;
    return Math.max(0, maxAllowed - limit.spentAmount);
  }, [limit]);
  const wouldTriggerWarning = (0, import_react4.useCallback)(
    (amount) => {
      const newPercentage = (limit.spentAmount + amount) / limit.maxAmount * 100;
      return newPercentage >= warningThreshold;
    },
    [limit, warningThreshold]
  );
  const wouldExceedLimit = (0, import_react4.useCallback)(
    (amount) => {
      return limit.spentAmount + amount > limit.maxAmount;
    },
    [limit]
  );
  const formatAmount = (0, import_react4.useCallback)(
    (amount) => {
      return formatCurrency2(amount, limit.currency ?? DEFAULT_CURRENCY);
    },
    [formatCurrency2, limit.currency]
  );
  const getPercentage = (0, import_react4.useCallback)(
    (amount) => {
      return limit.maxAmount > 0 ? amount / limit.maxAmount * 100 : 0;
    },
    [limit.maxAmount]
  );
  const getThresholdLevel = (0, import_react4.useCallback)(
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
var import_react5 = require("react");
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
  const [quote, setQuote] = (0, import_react5.useState)(
    () => createInitialQuote(options, generateQuoteNumber)
  );
  const [isDirty, setIsDirty] = (0, import_react5.useState)(false);
  const [selectedItems, setSelectedItems] = (0, import_react5.useState)(/* @__PURE__ */ new Set());
  const recalculatePricing = (0, import_react5.useCallback)(
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
  const updateQuote = (0, import_react5.useCallback)(
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
  const calculateItemTotals = (0, import_react5.useCallback)(
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
  const errors = (0, import_react5.useMemo)(() => validateQuote(quote), [quote]);
  const isValid = errors.filter((e) => e.type === "error").length === 0;
  const state = (0, import_react5.useMemo)(
    () => ({
      quote,
      isDirty,
      errors,
      isValid,
      selectedItems
    }),
    [quote, isDirty, errors, isValid, selectedItems]
  );
  const addItem = (0, import_react5.useCallback)(
    (item) => {
      const newItem = calculateItemTotals(item);
      updateQuote((prev) => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    },
    [calculateItemTotals, updateQuote]
  );
  const updateItem = (0, import_react5.useCallback)(
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
  const removeItem = (0, import_react5.useCallback)(
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
  const duplicateItem = (0, import_react5.useCallback)(
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
  const setItemQuantity = (0, import_react5.useCallback)(
    (itemId, quantity) => {
      updateItem(itemId, { quantity: Math.max(1, quantity) });
    },
    [updateItem]
  );
  const applyItemDiscount = (0, import_react5.useCallback)(
    (itemId, discount) => {
      if (discount) {
        updateItem(itemId, { discount });
      }
    },
    [updateItem]
  );
  const clearItemDiscount = (0, import_react5.useCallback)(
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
  const reorderItems = (0, import_react5.useCallback)(
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
  const cartItemToPartial = (0, import_react5.useCallback)(
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
  const importFromCart = (0, import_react5.useCallback)(
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
  const replaceFromCart = (0, import_react5.useCallback)(
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
  const addDiscount = (0, import_react5.useCallback)(
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
  const removeDiscount = (0, import_react5.useCallback)(
    (discountId) => {
      updateQuote((prev) => ({
        ...prev,
        discounts: prev.discounts.filter((d) => d.id !== discountId)
      }));
    },
    [updateQuote]
  );
  const clearDiscounts = (0, import_react5.useCallback)(() => {
    updateQuote((prev) => ({
      ...prev,
      discounts: []
    }));
  }, [updateQuote]);
  const setShipping = (0, import_react5.useCallback)(
    (amount) => {
      updateQuote((prev) => ({
        ...prev,
        pricing: { ...prev.pricing, shipping: Math.max(0, amount) }
      }));
    },
    [updateQuote]
  );
  const setTaxRate = (0, import_react5.useCallback)(
    (rate) => {
      updateQuote((prev) => ({
        ...prev,
        pricing: { ...prev.pricing, taxRate: Math.max(0, rate) }
      }));
    },
    [updateQuote]
  );
  const setTaxType = (0, import_react5.useCallback)(
    (type) => {
      updateQuote((prev) => ({
        ...prev,
        pricing: { ...prev.pricing, taxType: type }
      }));
    },
    [updateQuote]
  );
  const recalculate = (0, import_react5.useCallback)(() => {
    setQuote((prev) => recalculatePricing(prev));
  }, [recalculatePricing]);
  const updateTerms = (0, import_react5.useCallback)(
    (terms) => {
      updateQuote((prev) => ({
        ...prev,
        terms: { ...prev.terms, ...terms }
      }));
    },
    [updateQuote]
  );
  const setExpirationDate = (0, import_react5.useCallback)(
    (date) => {
      updateTerms({ expirationDate: date });
    },
    [updateTerms]
  );
  const setValidityDays = (0, import_react5.useCallback)(
    (days) => {
      const expirationDate = /* @__PURE__ */ new Date();
      expirationDate.setDate(expirationDate.getDate() + days);
      updateTerms({ validityDays: days, expirationDate });
    },
    [updateTerms]
  );
  const updateCustomer = (0, import_react5.useCallback)(
    (customerUpdates) => {
      updateQuote((prev) => ({
        ...prev,
        customer: { ...prev.customer, ...customerUpdates }
      }));
    },
    [updateQuote]
  );
  const selectItem = (0, import_react5.useCallback)((itemId) => {
    setSelectedItems((prev) => new Set(prev).add(itemId));
  }, []);
  const deselectItem = (0, import_react5.useCallback)((itemId) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  }, []);
  const toggleItemSelection = (0, import_react5.useCallback)((itemId) => {
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
  const selectAllItems = (0, import_react5.useCallback)(() => {
    setSelectedItems(new Set(quote.items.map((item) => item.id)));
  }, [quote.items]);
  const deselectAllItems = (0, import_react5.useCallback)(() => {
    setSelectedItems(/* @__PURE__ */ new Set());
  }, []);
  const removeSelectedItems = (0, import_react5.useCallback)(() => {
    updateQuote((prev) => ({
      ...prev,
      items: prev.items.filter((item) => !selectedItems.has(item.id))
    }));
    setSelectedItems(/* @__PURE__ */ new Set());
  }, [selectedItems, updateQuote]);
  const applyDiscountToSelected = (0, import_react5.useCallback)(
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
  const save = (0, import_react5.useCallback)(() => {
    const savedQuote = recalculatePricing(quote);
    setQuote(savedQuote);
    setIsDirty(false);
    onSave?.(savedQuote);
    return savedQuote;
  }, [quote, recalculatePricing, onSave]);
  const send = (0, import_react5.useCallback)(() => {
    const sentQuote = {
      ...recalculatePricing(quote),
      status: "sent",
      sentAt: /* @__PURE__ */ new Date()
    };
    setQuote(sentQuote);
    setIsDirty(false);
    onSend?.(sentQuote);
  }, [quote, recalculatePricing, onSend]);
  const createRevision = (0, import_react5.useCallback)(() => {
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
  const reset = (0, import_react5.useCallback)(() => {
    setQuote(createInitialQuote(options, generateQuoteNumber));
    setIsDirty(false);
    setSelectedItems(/* @__PURE__ */ new Set());
  }, [options, generateQuoteNumber]);
  const markDirty = (0, import_react5.useCallback)(() => {
    setIsDirty(true);
  }, []);
  const markClean = (0, import_react5.useCallback)(() => {
    setIsDirty(false);
  }, []);
  const validate = (0, import_react5.useCallback)(() => validateQuote(quote), [quote]);
  const getItem = (0, import_react5.useCallback)(
    (itemId) => quote.items.find((item) => item.id === itemId),
    [quote.items]
  );
  const hasItem = (0, import_react5.useCallback)(
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

// src/forms/employee.schema.ts
var import_zod = require("zod");
var employeeRoleSchema = import_zod.z.enum([
  "admin",
  "manager",
  "purchaser",
  "viewer",
  "approver"
]);
var employeeStatusSchema = import_zod.z.enum([
  "active",
  "inactive",
  "pending",
  "suspended"
]);
var employeeBaseSchema = import_zod.z.object({
  /** First name */
  firstName: import_zod.z.string().min(1, "First name is required").max(50, "First name must be 50 characters or less"),
  /** Last name */
  lastName: import_zod.z.string().min(1, "Last name is required").max(50, "Last name must be 50 characters or less"),
  /** Email address */
  email: import_zod.z.string().email("Invalid email address"),
  /** Phone number */
  phone: import_zod.z.string().regex(
    /^[+]?[(]?[0-9]{1,3}[)]?[-\s.]?[(]?[0-9]{1,3}[)]?[-\s.]?[0-9]{4,10}$/,
    "Invalid phone number"
  ).optional().or(import_zod.z.literal("")),
  /** Job title */
  jobTitle: import_zod.z.string().max(100, "Job title must be 100 characters or less").optional(),
  /** Department */
  department: import_zod.z.string().max(100, "Department must be 100 characters or less").optional(),
  /** Employee number/ID */
  employeeNumber: import_zod.z.string().max(50, "Employee number must be 50 characters or less").optional()
});
var employeePermissionsSchema = import_zod.z.object({
  /** Can create orders */
  canCreateOrders: import_zod.z.boolean().default(false),
  /** Can approve orders */
  canApproveOrders: import_zod.z.boolean().default(false),
  /** Maximum order amount they can approve (without further approval) */
  maxApprovalAmount: import_zod.z.number().min(0, "Amount must be positive").optional(),
  /** Can manage employees */
  canManageEmployees: import_zod.z.boolean().default(false),
  /** Can view all orders */
  canViewAllOrders: import_zod.z.boolean().default(false),
  /** Can manage company settings */
  canManageSettings: import_zod.z.boolean().default(false),
  /** Can export data */
  canExportData: import_zod.z.boolean().default(false),
  /** Can create quotes */
  canCreateQuotes: import_zod.z.boolean().default(false),
  /** Allowed product categories (empty = all) */
  allowedCategories: import_zod.z.array(import_zod.z.string()).default([]),
  /** Allowed cost centers */
  allowedCostCenters: import_zod.z.array(import_zod.z.string()).default([])
});
var employeeSpendingLimitSchema = import_zod.z.object({
  /** Monthly spending limit */
  monthlyLimit: import_zod.z.number().min(0, "Limit must be positive").optional(),
  /** Single order limit */
  orderLimit: import_zod.z.number().min(0, "Limit must be positive").optional(),
  /** Whether to require approval above limit */
  requireApprovalAboveLimit: import_zod.z.boolean().default(true),
  /** Reporting manager ID for approvals */
  managerId: import_zod.z.string().optional(),
  /** Custom approval chain */
  approvalChain: import_zod.z.array(import_zod.z.string()).default([])
});
var employeeCreateSchema = employeeBaseSchema.extend({
  /** Employee role */
  role: employeeRoleSchema,
  /** Permissions */
  permissions: employeePermissionsSchema.optional(),
  /** Spending limits */
  spendingLimits: employeeSpendingLimitSchema.optional(),
  /** Send welcome email */
  sendWelcomeEmail: import_zod.z.boolean().default(true),
  /** Notes */
  notes: import_zod.z.string().max(1e3, "Notes must be 1000 characters or less").optional()
});
var employeeUpdateSchema = employeeBaseSchema.partial().extend({
  /** Employee role */
  role: employeeRoleSchema.optional(),
  /** Employee status */
  status: employeeStatusSchema.optional(),
  /** Permissions */
  permissions: employeePermissionsSchema.partial().optional(),
  /** Spending limits */
  spendingLimits: employeeSpendingLimitSchema.partial().optional(),
  /** Notes */
  notes: import_zod.z.string().max(1e3, "Notes must be 1000 characters or less").optional()
});
var employeeBulkImportRowSchema = import_zod.z.object({
  firstName: import_zod.z.string().min(1),
  lastName: import_zod.z.string().min(1),
  email: import_zod.z.string().email(),
  phone: import_zod.z.string().optional(),
  role: employeeRoleSchema.default("viewer"),
  department: import_zod.z.string().optional(),
  jobTitle: import_zod.z.string().optional(),
  employeeNumber: import_zod.z.string().optional(),
  monthlyLimit: import_zod.z.coerce.number().optional(),
  orderLimit: import_zod.z.coerce.number().optional(),
  managerId: import_zod.z.string().optional()
});
var employeeInviteSchema = import_zod.z.object({
  email: import_zod.z.string().email("Invalid email address"),
  role: employeeRoleSchema,
  permissions: employeePermissionsSchema.optional(),
  message: import_zod.z.string().max(500, "Message must be 500 characters or less").optional(),
  expiresIn: import_zod.z.number().min(1).max(30).default(7)
  // days
});
var employeeFilterSchema = import_zod.z.object({
  search: import_zod.z.string().optional(),
  role: employeeRoleSchema.optional(),
  status: employeeStatusSchema.optional(),
  department: import_zod.z.string().optional(),
  hasSpendingLimit: import_zod.z.boolean().optional(),
  managerId: import_zod.z.string().optional()
});

// src/forms/quote.schema.ts
var import_zod2 = require("zod");
var quoteStatusSchema = import_zod2.z.enum([
  "draft",
  "pending_review",
  "sent",
  "viewed",
  "accepted",
  "rejected",
  "expired",
  "cancelled"
]);
var discountTypeSchema = import_zod2.z.enum(["percentage", "fixed", "per_unit"]);
var taxTypeSchema = import_zod2.z.enum(["included", "excluded", "exempt"]);
var addressSchema = import_zod2.z.object({
  line1: import_zod2.z.string().min(1, "Address line 1 is required").max(200),
  line2: import_zod2.z.string().max(200).optional(),
  city: import_zod2.z.string().min(1, "City is required").max(100),
  state: import_zod2.z.string().max(100).optional(),
  postalCode: import_zod2.z.string().min(1, "Postal code is required").max(20),
  country: import_zod2.z.string().min(2, "Country is required").max(2)
});
var quoteCustomerSchema = import_zod2.z.object({
  companyName: import_zod2.z.string().min(1, "Company name is required").max(200, "Company name must be 200 characters or less"),
  contactName: import_zod2.z.string().min(1, "Contact name is required").max(100, "Contact name must be 100 characters or less"),
  email: import_zod2.z.string().email("Invalid email address"),
  phone: import_zod2.z.string().max(30, "Phone must be 30 characters or less").optional().or(import_zod2.z.literal("")),
  billingAddress: addressSchema.optional(),
  shippingAddress: addressSchema.optional(),
  taxId: import_zod2.z.string().max(50, "Tax ID must be 50 characters or less").optional(),
  paymentTerms: import_zod2.z.string().max(50).optional()
});
var lineItemDiscountSchema = import_zod2.z.object({
  type: discountTypeSchema,
  value: import_zod2.z.number().min(0, "Discount value must be positive"),
  reason: import_zod2.z.string().max(200).optional()
});
var quoteLineItemSchema = import_zod2.z.object({
  productId: import_zod2.z.string().min(1, "Product ID is required"),
  name: import_zod2.z.string().min(1, "Product name is required").max(200, "Product name must be 200 characters or less"),
  description: import_zod2.z.string().max(1e3).optional(),
  sku: import_zod2.z.string().max(50).optional(),
  quantity: import_zod2.z.number().int("Quantity must be a whole number").min(1, "Quantity must be at least 1"),
  unit: import_zod2.z.string().max(20).optional(),
  unitPrice: import_zod2.z.number().min(0, "Unit price must be positive"),
  discount: lineItemDiscountSchema.optional(),
  taxRate: import_zod2.z.number().min(0).max(100).optional(),
  customOptions: import_zod2.z.record(import_zod2.z.unknown()).optional(),
  leadTime: import_zod2.z.number().int().min(0).optional(),
  notes: import_zod2.z.string().max(500).optional()
});
var quoteDiscountSchema = import_zod2.z.object({
  type: discountTypeSchema,
  value: import_zod2.z.number().min(0, "Discount value must be positive"),
  code: import_zod2.z.string().max(50).optional(),
  reason: import_zod2.z.string().max(200).optional(),
  minOrderValue: import_zod2.z.number().min(0).optional(),
  maxDiscount: import_zod2.z.number().min(0).optional()
});
var quoteTermsSchema = import_zod2.z.object({
  paymentTerms: import_zod2.z.string().min(1, "Payment terms are required").max(50, "Payment terms must be 50 characters or less"),
  paymentDueDate: import_zod2.z.coerce.date().optional(),
  deliveryTerms: import_zod2.z.string().max(50).optional(),
  deliveryDate: import_zod2.z.coerce.date().optional(),
  validityDays: import_zod2.z.number().int("Validity must be a whole number").min(1, "Validity must be at least 1 day").max(365, "Validity cannot exceed 365 days"),
  customTerms: import_zod2.z.string().max(5e3, "Custom terms must be 5000 characters or less").optional(),
  notes: import_zod2.z.string().max(2e3, "Notes must be 2000 characters or less").optional(),
  internalNotes: import_zod2.z.string().max(2e3, "Internal notes must be 2000 characters or less").optional()
});
var quotePricingSchema = import_zod2.z.object({
  shipping: import_zod2.z.number().min(0, "Shipping must be positive"),
  taxType: taxTypeSchema,
  taxRate: import_zod2.z.number().min(0, "Tax rate must be positive").max(100, "Tax rate cannot exceed 100%"),
  currency: import_zod2.z.string().length(3, "Currency must be a 3-letter code")
});
var quoteCreateSchema = import_zod2.z.object({
  customer: quoteCustomerSchema,
  items: import_zod2.z.array(quoteLineItemSchema).min(1, "Quote must have at least one item"),
  discounts: import_zod2.z.array(quoteDiscountSchema).default([]),
  pricing: quotePricingSchema,
  terms: quoteTermsSchema,
  metadata: import_zod2.z.record(import_zod2.z.unknown()).optional()
});
var quoteUpdateSchema = import_zod2.z.object({
  customer: quoteCustomerSchema.partial().optional(),
  items: import_zod2.z.array(quoteLineItemSchema).optional(),
  discounts: import_zod2.z.array(quoteDiscountSchema).optional(),
  pricing: quotePricingSchema.partial().optional(),
  terms: quoteTermsSchema.partial().optional(),
  status: quoteStatusSchema.optional(),
  metadata: import_zod2.z.record(import_zod2.z.unknown()).optional()
});
var quoteSendSchema = import_zod2.z.object({
  recipientEmail: import_zod2.z.string().email("Invalid recipient email"),
  ccEmails: import_zod2.z.array(import_zod2.z.string().email()).default([]),
  subject: import_zod2.z.string().min(1, "Subject is required").max(200),
  message: import_zod2.z.string().max(5e3).optional(),
  attachPdf: import_zod2.z.boolean().default(true)
});
var quoteResponseSchema = import_zod2.z.object({
  action: import_zod2.z.enum(["accept", "reject", "request_revision"]),
  comment: import_zod2.z.string().max(2e3).optional(),
  purchaseOrderNumber: import_zod2.z.string().max(50).optional()
});
var quoteFilterSchema = import_zod2.z.object({
  search: import_zod2.z.string().optional(),
  status: quoteStatusSchema.optional(),
  customerId: import_zod2.z.string().optional(),
  createdBy: import_zod2.z.string().optional(),
  dateFrom: import_zod2.z.coerce.date().optional(),
  dateTo: import_zod2.z.coerce.date().optional(),
  minTotal: import_zod2.z.number().optional(),
  maxTotal: import_zod2.z.number().optional()
});

// src/forms/company.schema.ts
var import_zod3 = require("zod");
var companyTypeSchema = import_zod3.z.enum([
  "retailer",
  "wholesaler",
  "distributor",
  "manufacturer",
  "other"
]);
var companyStatusSchema = import_zod3.z.enum([
  "active",
  "pending_approval",
  "suspended",
  "inactive"
]);
var companyAddressSchema = import_zod3.z.object({
  line1: import_zod3.z.string().min(1, "Address line 1 is required").max(200),
  line2: import_zod3.z.string().max(200).optional(),
  city: import_zod3.z.string().min(1, "City is required").max(100),
  state: import_zod3.z.string().max(100).optional(),
  postalCode: import_zod3.z.string().min(1, "Postal code is required").max(20),
  country: import_zod3.z.string().min(2, "Country code must be 2 characters").max(2, "Country code must be 2 characters"),
  isDefault: import_zod3.z.boolean().default(false),
  label: import_zod3.z.string().max(50).optional()
});
var companyBillingSettingsSchema = import_zod3.z.object({
  /** Payment terms (e.g., 'NET30', 'NET60') */
  paymentTerms: import_zod3.z.string().min(1, "Payment terms are required").max(50),
  /** Credit limit */
  creditLimit: import_zod3.z.number().min(0, "Credit limit must be positive").optional(),
  /** Whether to auto-approve orders under credit limit */
  autoApproveUnderCreditLimit: import_zod3.z.boolean().default(false),
  /** Tax exemption status */
  taxExempt: import_zod3.z.boolean().default(false),
  /** Tax exemption certificate number */
  taxExemptionCertificate: import_zod3.z.string().max(100).optional(),
  /** Preferred currency */
  preferredCurrency: import_zod3.z.string().length(3, "Currency must be a 3-letter code").default("EUR"),
  /** Default billing address ID */
  defaultBillingAddressId: import_zod3.z.string().optional(),
  /** Invoice email */
  invoiceEmail: import_zod3.z.string().email("Invalid invoice email").optional(),
  /** PO required for orders */
  requirePurchaseOrder: import_zod3.z.boolean().default(false)
});
var companyShippingSettingsSchema = import_zod3.z.object({
  /** Default shipping address ID */
  defaultShippingAddressId: import_zod3.z.string().optional(),
  /** Preferred shipping method */
  preferredShippingMethod: import_zod3.z.string().max(50).optional(),
  /** Shipping account number (for carrier accounts) */
  shippingAccountNumber: import_zod3.z.string().max(50).optional(),
  /** Special shipping instructions */
  shippingInstructions: import_zod3.z.string().max(500).optional(),
  /** Allow partial shipments */
  allowPartialShipments: import_zod3.z.boolean().default(true),
  /** Consolidate shipments */
  consolidateShipments: import_zod3.z.boolean().default(false)
});
var companyOrderingSettingsSchema = import_zod3.z.object({
  /** Minimum order value */
  minimumOrderValue: import_zod3.z.number().min(0, "Minimum order must be positive").optional(),
  /** Maximum order value */
  maximumOrderValue: import_zod3.z.number().min(0, "Maximum order must be positive").optional(),
  /** Require approval for orders over amount */
  approvalThreshold: import_zod3.z.number().min(0).optional(),
  /** Allowed product categories (empty = all) */
  allowedCategories: import_zod3.z.array(import_zod3.z.string()).default([]),
  /** Blocked product categories */
  blockedCategories: import_zod3.z.array(import_zod3.z.string()).default([]),
  /** Enable bulk ordering */
  enableBulkOrdering: import_zod3.z.boolean().default(true),
  /** Enable quick reorder */
  enableQuickReorder: import_zod3.z.boolean().default(true),
  /** Default cost center */
  defaultCostCenter: import_zod3.z.string().max(50).optional()
});
var companyNotificationSettingsSchema = import_zod3.z.object({
  /** Order confirmation emails */
  orderConfirmation: import_zod3.z.boolean().default(true),
  /** Shipping notification emails */
  shippingNotification: import_zod3.z.boolean().default(true),
  /** Invoice emails */
  invoiceNotification: import_zod3.z.boolean().default(true),
  /** Quote emails */
  quoteNotification: import_zod3.z.boolean().default(true),
  /** Spending alert emails */
  spendingAlerts: import_zod3.z.boolean().default(true),
  /** Weekly spending summary */
  weeklySpendingSummary: import_zod3.z.boolean().default(false),
  /** Monthly spending summary */
  monthlySpendingSummary: import_zod3.z.boolean().default(true),
  /** Additional notification emails */
  additionalEmails: import_zod3.z.array(import_zod3.z.string().email()).default([])
});
var companyBrandingSettingsSchema = import_zod3.z.object({
  /** Company logo URL */
  logoUrl: import_zod3.z.string().url("Invalid logo URL").optional(),
  /** Primary brand color */
  primaryColor: import_zod3.z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional(),
  /** Custom CSS class prefix */
  cssPrefix: import_zod3.z.string().max(20).optional(),
  /** Custom footer text */
  footerText: import_zod3.z.string().max(500).optional()
});
var companyProfileSchema = import_zod3.z.object({
  /** Company legal name */
  legalName: import_zod3.z.string().min(1, "Legal name is required").max(200, "Legal name must be 200 characters or less"),
  /** Trading/display name */
  tradingName: import_zod3.z.string().max(200).optional(),
  /** Company type */
  type: companyTypeSchema,
  /** Tax ID / VAT number */
  taxId: import_zod3.z.string().min(1, "Tax ID is required").max(50, "Tax ID must be 50 characters or less"),
  /** Registration number */
  registrationNumber: import_zod3.z.string().max(50).optional(),
  /** Company website */
  website: import_zod3.z.string().url("Invalid website URL").optional().or(import_zod3.z.literal("")),
  /** Company phone */
  phone: import_zod3.z.string().max(30).optional(),
  /** Company email */
  email: import_zod3.z.string().email("Invalid email address"),
  /** Industry/sector */
  industry: import_zod3.z.string().max(100).optional(),
  /** Company description */
  description: import_zod3.z.string().max(2e3).optional(),
  /** Year established */
  yearEstablished: import_zod3.z.number().int().min(1800).max((/* @__PURE__ */ new Date()).getFullYear()).optional(),
  /** Number of employees */
  employeeCount: import_zod3.z.number().int().min(1).optional(),
  /** Annual revenue range */
  revenueRange: import_zod3.z.string().max(50).optional()
});
var companySettingsSchema = import_zod3.z.object({
  profile: companyProfileSchema,
  addresses: import_zod3.z.array(companyAddressSchema).default([]),
  billing: companyBillingSettingsSchema,
  shipping: companyShippingSettingsSchema,
  ordering: companyOrderingSettingsSchema,
  notifications: companyNotificationSettingsSchema,
  branding: companyBrandingSettingsSchema.optional()
});
var companyRegistrationSchema = import_zod3.z.object({
  profile: companyProfileSchema,
  primaryAddress: companyAddressSchema,
  primaryContact: import_zod3.z.object({
    firstName: import_zod3.z.string().min(1, "First name is required").max(50),
    lastName: import_zod3.z.string().min(1, "Last name is required").max(50),
    email: import_zod3.z.string().email("Invalid email address"),
    phone: import_zod3.z.string().max(30).optional(),
    jobTitle: import_zod3.z.string().max(100).optional()
  }),
  billing: companyBillingSettingsSchema.pick({
    paymentTerms: true,
    preferredCurrency: true,
    invoiceEmail: true
  }),
  acceptTerms: import_zod3.z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" })
  })
});
var companyFilterSchema = import_zod3.z.object({
  search: import_zod3.z.string().optional(),
  type: companyTypeSchema.optional(),
  status: companyStatusSchema.optional(),
  country: import_zod3.z.string().optional(),
  hasCredit: import_zod3.z.boolean().optional(),
  minCreditLimit: import_zod3.z.number().optional(),
  maxCreditLimit: import_zod3.z.number().optional()
});

// src/forms/spending-limit.schema.ts
var import_zod4 = require("zod");
var spendingPeriodSchema = import_zod4.z.enum([
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
  "custom"
]);
var spendingLimitTypeSchema = import_zod4.z.enum([
  "employee",
  "department",
  "cost_center",
  "company",
  "category"
]);
var spendingLimitStatusSchema = import_zod4.z.enum([
  "active",
  "paused",
  "expired",
  "exceeded"
]);
var thresholdActionSchema = import_zod4.z.enum([
  "notify",
  "notify_manager",
  "require_approval",
  "block"
]);
var spendingThresholdSchema = import_zod4.z.object({
  /** Percentage at which this threshold triggers (0-100) */
  percentage: import_zod4.z.number().min(0, "Percentage must be at least 0").max(100, "Percentage cannot exceed 100"),
  /** Action to take when threshold is reached */
  action: thresholdActionSchema,
  /** Custom message for notifications */
  notificationMessage: import_zod4.z.string().max(500).optional(),
  /** Whether threshold is active */
  isActive: import_zod4.z.boolean().default(true)
});
var currencyConfigSchema = import_zod4.z.object({
  code: import_zod4.z.string().length(3, "Currency code must be 3 characters"),
  symbol: import_zod4.z.string().min(1).max(5),
  decimals: import_zod4.z.number().int().min(0).max(4).default(2),
  symbolPosition: import_zod4.z.enum(["before", "after"]).default("before"),
  thousandsSeparator: import_zod4.z.string().max(1).default(","),
  decimalSeparator: import_zod4.z.string().max(1).default(".")
});
var spendingLimitBaseSchema = import_zod4.z.object({
  /** Limit name */
  name: import_zod4.z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  /** Description */
  description: import_zod4.z.string().max(500).optional(),
  /** Limit type */
  type: spendingLimitTypeSchema,
  /** Maximum spending amount */
  maxAmount: import_zod4.z.number().positive("Maximum amount must be positive").max(999999999, "Maximum amount is too large"),
  /** Spending period */
  period: spendingPeriodSchema,
  /** Currency */
  currency: currencyConfigSchema.optional(),
  /** Whether limit is active */
  isActive: import_zod4.z.boolean().default(true),
  /** Whether to allow exceeding the limit */
  allowExceed: import_zod4.z.boolean().default(false),
  /** Soft limit (warning threshold) */
  softLimit: import_zod4.z.number().positive("Soft limit must be positive").optional(),
  /** Hard limit (absolute maximum) */
  hardLimit: import_zod4.z.number().positive("Hard limit must be positive").optional()
});
var employeeSpendingLimitCreateSchema = spendingLimitBaseSchema.extend({
  type: import_zod4.z.literal("employee"),
  /** Employee ID */
  employeeId: import_zod4.z.string().min(1, "Employee ID is required"),
  /** Per-order limit */
  orderLimit: import_zod4.z.number().positive().optional(),
  /** Require approval above amount */
  approvalThreshold: import_zod4.z.number().positive().optional(),
  /** Manager ID for approvals */
  managerId: import_zod4.z.string().optional(),
  /** Custom thresholds */
  thresholds: import_zod4.z.array(spendingThresholdSchema).default([])
});
var departmentSpendingLimitCreateSchema = spendingLimitBaseSchema.extend({
  type: import_zod4.z.literal("department"),
  /** Department ID */
  departmentId: import_zod4.z.string().min(1, "Department ID is required"),
  /** Department name */
  departmentName: import_zod4.z.string().min(1).max(100),
  /** Whether to distribute across employees */
  distributeToEmployees: import_zod4.z.boolean().default(false),
  /** Per-employee limit when distributed */
  perEmployeeLimit: import_zod4.z.number().positive().optional(),
  /** Approval chain */
  approvalChain: import_zod4.z.array(import_zod4.z.string()).default([]),
  /** Custom thresholds */
  thresholds: import_zod4.z.array(spendingThresholdSchema).default([])
});
var costCenterSpendingLimitCreateSchema = spendingLimitBaseSchema.extend({
  type: import_zod4.z.literal("cost_center"),
  /** Cost center code */
  costCenterCode: import_zod4.z.string().min(1, "Cost center code is required").max(50),
  /** Cost center name */
  costCenterName: import_zod4.z.string().min(1).max(100),
  /** Account code */
  accountCode: import_zod4.z.string().max(50).optional(),
  /** GL code */
  glCode: import_zod4.z.string().max(50).optional(),
  /** Approval chain */
  approvalChain: import_zod4.z.array(import_zod4.z.string()).default([]),
  /** Custom thresholds */
  thresholds: import_zod4.z.array(spendingThresholdSchema).default([])
});
var categorySpendingLimitCreateSchema = spendingLimitBaseSchema.extend({
  type: import_zod4.z.literal("category"),
  /** Category ID */
  categoryId: import_zod4.z.string().min(1, "Category ID is required"),
  /** Category name */
  categoryName: import_zod4.z.string().min(1).max(100),
  /** Include subcategories */
  includeSubcategories: import_zod4.z.boolean().default(true),
  /** Custom thresholds */
  thresholds: import_zod4.z.array(spendingThresholdSchema).default([])
});
var companySpendingLimitCreateSchema = spendingLimitBaseSchema.extend({
  type: import_zod4.z.literal("company"),
  /** Company ID */
  companyId: import_zod4.z.string().min(1, "Company ID is required"),
  /** Whether this is a global cap */
  isGlobalCap: import_zod4.z.boolean().default(true),
  /** Custom thresholds */
  thresholds: import_zod4.z.array(spendingThresholdSchema).default([])
});
var spendingLimitCreateSchema = import_zod4.z.discriminatedUnion("type", [
  employeeSpendingLimitCreateSchema,
  departmentSpendingLimitCreateSchema,
  costCenterSpendingLimitCreateSchema,
  categorySpendingLimitCreateSchema,
  companySpendingLimitCreateSchema
]);
var spendingLimitUpdateSchema = spendingLimitBaseSchema.partial().extend({
  /** Custom thresholds */
  thresholds: import_zod4.z.array(spendingThresholdSchema).optional()
});
var spendingLimitFilterSchema = import_zod4.z.object({
  search: import_zod4.z.string().optional(),
  type: spendingLimitTypeSchema.optional(),
  status: spendingLimitStatusSchema.optional(),
  period: spendingPeriodSchema.optional(),
  employeeId: import_zod4.z.string().optional(),
  departmentId: import_zod4.z.string().optional(),
  isActive: import_zod4.z.boolean().optional(),
  isExceeded: import_zod4.z.boolean().optional()
});
var spendingTransactionSchema = import_zod4.z.object({
  /** Transaction amount */
  amount: import_zod4.z.number().positive("Amount must be positive"),
  /** Transaction description */
  description: import_zod4.z.string().max(500).optional(),
  /** Reference (order ID, etc.) */
  reference: import_zod4.z.string().max(100).optional(),
  /** Transaction date */
  transactionDate: import_zod4.z.coerce.date().default(() => /* @__PURE__ */ new Date()),
  /** Category */
  category: import_zod4.z.string().optional(),
  /** Cost center */
  costCenter: import_zod4.z.string().optional()
});
var spendingAdjustmentSchema = import_zod4.z.object({
  /** Adjustment amount (positive to increase, negative to decrease) */
  amount: import_zod4.z.number(),
  /** Reason for adjustment */
  reason: import_zod4.z.string().min(1, "Reason is required").max(500),
  /** Reference (order ID, refund ID, etc.) */
  reference: import_zod4.z.string().max(100).optional(),
  /** Approved by */
  approvedBy: import_zod4.z.string().min(1, "Approver is required")
});

// src/utils/approval-rules.ts
function evaluateCondition(condition, context) {
  switch (condition.type) {
    case "amount_greater_than":
      return context.amount !== void 0 && context.amount > condition.value;
    case "amount_less_than":
      return context.amount !== void 0 && context.amount < condition.value;
    case "amount_between":
      return context.amount !== void 0 && context.amount >= condition.value && context.amount <= condition.valueTo;
    case "quantity_greater_than":
      return context.quantity !== void 0 && context.quantity > condition.value;
    case "quantity_less_than":
      return context.quantity !== void 0 && context.quantity < condition.value;
    case "category_in":
      return context.categories !== void 0 && condition.value.some(
        (cat) => context.categories.includes(cat)
      );
    case "category_not_in":
      return context.categories !== void 0 && !condition.value.some(
        (cat) => context.categories.includes(cat)
      );
    case "user_role_in":
      return context.userRole !== void 0 && condition.value.includes(context.userRole);
    case "user_role_not_in":
      return context.userRole !== void 0 && !condition.value.includes(context.userRole);
    case "department_in":
      return context.department !== void 0 && condition.value.includes(context.department);
    case "department_not_in":
      return context.department !== void 0 && !condition.value.includes(context.department);
    case "cost_center_in":
      return context.costCenter !== void 0 && condition.value.includes(context.costCenter);
    case "cost_center_not_in":
      return context.costCenter !== void 0 && !condition.value.includes(context.costCenter);
    case "vendor_in":
      return context.vendorId !== void 0 && condition.value.includes(context.vendorId);
    case "vendor_not_in":
      return context.vendorId !== void 0 && !condition.value.includes(context.vendorId);
    case "custom":
      if (typeof condition.value === "function") {
        return condition.value(
          context
        );
      }
      return false;
    default:
      return false;
  }
}
function evaluateRule(rule, context) {
  if (!rule.isActive) {
    return { matched: false, failedConditions: rule.conditions };
  }
  const failedConditions = [];
  for (const condition of rule.conditions) {
    if (!evaluateCondition(condition, context)) {
      failedConditions.push(condition);
    }
  }
  return {
    matched: failedConditions.length === 0,
    failedConditions
  };
}
function evaluateRules(rules, context) {
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);
  const evaluations = [];
  let matchedRule;
  for (const rule of sortedRules) {
    const { matched, failedConditions } = evaluateRule(rule, context);
    evaluations.push({
      rule,
      matched,
      failedConditions
    });
    if (matched && !matchedRule) {
      matchedRule = rule;
    }
  }
  const result = {
    matched: matchedRule !== void 0,
    evaluations
  };
  if (matchedRule) {
    result.matchedRule = matchedRule;
    result.action = matchedRule.action;
  }
  return result;
}
function getRequiredApprovers(result) {
  if (!result.matched || !result.action) {
    return [];
  }
  switch (result.action.type) {
    case "require_approval":
    case "require_multi_approval":
      return result.action.approverIds ?? [];
    case "escalate":
      return result.action.escalateTo ? [result.action.escalateTo] : [];
    default:
      return [];
  }
}
function requiresApproval(result) {
  if (!result.matched || !result.action) {
    return true;
  }
  return result.action.type === "require_approval" || result.action.type === "require_multi_approval" || result.action.type === "escalate";
}
function canAutoApprove(result) {
  return result.matched && result.action?.type === "auto_approve";
}
function shouldReject(result) {
  return result.matched && result.action?.type === "reject";
}
function createAmountRule(id, name, threshold, action, priority = 100) {
  return {
    id,
    name,
    conditions: [
      {
        type: "amount_greater_than",
        value: threshold
      }
    ],
    action,
    priority,
    isActive: true
  };
}
function createRoleRule(id, name, roles, action, priority = 100) {
  return {
    id,
    name,
    conditions: [
      {
        type: "user_role_in",
        value: roles
      }
    ],
    action,
    priority,
    isActive: true
  };
}
function createDepartmentRule(id, name, departments, action, priority = 100) {
  return {
    id,
    name,
    conditions: [
      {
        type: "department_in",
        value: departments
      }
    ],
    action,
    priority,
    isActive: true
  };
}
var DEFAULT_APPROVAL_RULES = [
  {
    id: "auto-approve-small",
    name: "Auto-approve small orders",
    description: "Automatically approve orders under 500",
    conditions: [{ type: "amount_less_than", value: 500 }],
    action: { type: "auto_approve" },
    priority: 10,
    isActive: true
  },
  {
    id: "manager-approval-medium",
    name: "Manager approval for medium orders",
    description: "Require manager approval for orders 500-5000",
    conditions: [{ type: "amount_between", value: 500, valueTo: 5e3 }],
    action: {
      type: "require_approval",
      approverIds: []
      // To be filled with manager IDs
    },
    priority: 20,
    isActive: true
  },
  {
    id: "executive-approval-large",
    name: "Executive approval for large orders",
    description: "Require executive approval for orders over 5000",
    conditions: [{ type: "amount_greater_than", value: 5e3 }],
    action: {
      type: "require_multi_approval",
      approverIds: [],
      // To be filled with executive IDs
      requiredApprovals: 2
    },
    priority: 30,
    isActive: true
  }
];

// src/utils/spending-calculator.ts
function getPeriodDates(period, referenceDate = /* @__PURE__ */ new Date()) {
  const date = new Date(referenceDate);
  switch (period) {
    case "daily": {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      end.setMilliseconds(-1);
      return { start, end };
    }
    case "weekly": {
      const start = new Date(date);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      end.setMilliseconds(-1);
      return { start, end };
    }
    case "monthly": {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start, end };
    }
    case "quarterly": {
      const quarter = Math.floor(date.getMonth() / 3);
      const start = new Date(date.getFullYear(), quarter * 3, 1);
      const end = new Date(date.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999);
      return { start, end };
    }
    case "yearly": {
      const start = new Date(date.getFullYear(), 0, 1);
      const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { start, end };
    }
    default:
      throw new Error(`Unknown period type: ${period}`);
  }
}
function daysBetween2(start, end) {
  const msPerDay = 24 * 60 * 60 * 1e3;
  return Math.ceil((end.getTime() - start.getTime()) / msPerDay);
}
function filterByPeriod(records, start, end) {
  return records.filter(
    (record) => record.date >= start && record.date <= end
  );
}
function calculateTotal(records) {
  return records.reduce((sum, record) => sum + record.amount, 0);
}
function calculateByCategory(records) {
  const byCategory = {};
  for (const record of records) {
    const category = record.category ?? "uncategorized";
    byCategory[category] = (byCategory[category] ?? 0) + record.amount;
  }
  return byCategory;
}
function calculateByDay(records) {
  const byDay = {};
  for (const record of records) {
    const isoString = record.date.toISOString();
    const day = isoString.split("T")[0] ?? isoString.substring(0, 10);
    byDay[day] = (byDay[day] ?? 0) + record.amount;
  }
  return byDay;
}
function calculateSpending(records, config, referenceDate = /* @__PURE__ */ new Date()) {
  const { start: periodStart, end: periodEnd } = getPeriodDates(
    config.period,
    referenceDate
  );
  const periodRecords = filterByPeriod(records, periodStart, periodEnd);
  const totalSpent = calculateTotal(periodRecords);
  const remaining = Math.max(0, config.maxAmount - totalSpent);
  const percentage = config.maxAmount > 0 ? totalSpent / config.maxAmount * 100 : 0;
  const softLimitPercentage = config.softLimitPercentage ?? 75;
  const hardLimitPercentage = config.hardLimitPercentage ?? 100;
  const softLimitExceeded = percentage >= softLimitPercentage;
  const hardLimitExceeded = percentage >= hardLimitPercentage;
  const now = new Date(referenceDate);
  const daysInPeriod = daysBetween2(periodStart, periodEnd);
  const daysElapsed = Math.max(1, daysBetween2(periodStart, now));
  const daysRemaining = Math.max(0, daysBetween2(now, periodEnd));
  const averageDaily = totalSpent / daysElapsed;
  const projected = averageDaily * daysInPeriod;
  const onTrack = projected <= config.maxAmount;
  const recommendedDaily = daysRemaining > 0 ? remaining / daysRemaining : 0;
  return {
    totalSpent,
    remaining,
    percentage,
    softLimitExceeded,
    hardLimitExceeded,
    periodStart,
    periodEnd,
    daysRemaining,
    averageDaily,
    projected,
    onTrack,
    recommendedDaily
  };
}
function calculateRollover(previousPeriodSpent, config) {
  if (!config.rollover) return 0;
  const unused = Math.max(0, config.maxAmount - previousPeriodSpent);
  const rolloverPercentage = config.rolloverPercentage ?? 100;
  return unused * (rolloverPercentage / 100);
}
function calculateEffectiveLimit(config, rolloverAmount = 0) {
  return config.maxAmount + rolloverAmount;
}
function canMakePurchase(purchaseAmount, currentSpent, limit, allowExceed = false) {
  if (allowExceed) {
    return { allowed: true };
  }
  const newTotal = currentSpent + purchaseAmount;
  if (newTotal > limit) {
    return {
      allowed: false,
      reason: `Purchase would exceed spending limit. Current: ${currentSpent}, Purchase: ${purchaseAmount}, Limit: ${limit}`
    };
  }
  return { allowed: true };
}
function calculateTrend(currentPeriodSpent, previousPeriodSpent) {
  if (previousPeriodSpent === 0) {
    return {
      direction: currentPeriodSpent > 0 ? "up" : "stable",
      percentage: currentPeriodSpent > 0 ? 100 : 0
    };
  }
  const change = (currentPeriodSpent - previousPeriodSpent) / previousPeriodSpent * 100;
  let direction;
  if (Math.abs(change) < 1) {
    direction = "stable";
  } else if (change > 0) {
    direction = "up";
  } else {
    direction = "down";
  }
  return {
    direction,
    percentage: Math.abs(change)
  };
}
function generateForecast(records, config, forecastDays = 30) {
  const { start: periodStart } = getPeriodDates(config.period);
  const periodRecords = filterByPeriod(
    records,
    periodStart,
    /* @__PURE__ */ new Date()
  );
  const byDay = calculateByDay(periodRecords);
  const days = Object.keys(byDay);
  const total = calculateTotal(periodRecords);
  const avgDaily = days.length > 0 ? total / days.length : 0;
  const forecast = [];
  let cumulative = total;
  for (let i = 1; i <= forecastDays; i++) {
    const date = /* @__PURE__ */ new Date();
    date.setDate(date.getDate() + i);
    cumulative += avgDaily;
    forecast.push({
      date,
      projected: cumulative,
      limit: config.maxAmount
    });
  }
  return forecast;
}
function calculateSavingsOpportunity(records, targetPercentage = 10) {
  const byCategory = calculateByCategory(records);
  const total = calculateTotal(records);
  const targetSavings = total * (targetPercentage / 100);
  const suggestions = [];
  let potentialSavings = 0;
  const sortedCategories = Object.entries(byCategory).sort(
    ([, a], [, b]) => b - a
  );
  for (const [category, amount] of sortedCategories) {
    const categoryPercentage = amount / total * 100;
    if (categoryPercentage > 20) {
      const savingAmount = amount * 0.1;
      potentialSavings += savingAmount;
      suggestions.push(
        `Reduce "${category}" spending by 10% to save ${savingAmount.toFixed(2)}`
      );
    }
    if (potentialSavings >= targetSavings) break;
  }
  return {
    potentialSavings,
    suggestions
  };
}

// src/utils/csv-parser.ts
function parseLine(line, delimiter, quote) {
  const result = [];
  let current = "";
  let inQuotes = false;
  let i = 0;
  while (i < line.length) {
    const char = line[i];
    if (char === quote) {
      if (inQuotes && line[i + 1] === quote) {
        current += quote;
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
      i++;
      continue;
    }
    if (char === delimiter && !inQuotes) {
      result.push(current);
      current = "";
      i++;
      continue;
    }
    current += char;
    i++;
  }
  result.push(current);
  return result;
}
function parseCsv(csvString, options = {}) {
  const {
    delimiter = ",",
    hasHeader = true,
    quote = '"',
    trim = true,
    skipEmptyLines = true,
    maxRows = 0,
    expectedColumns,
    requiredColumns
  } = options;
  const errors = [];
  const rawRows = [];
  const lines = csvString.split(/\r?\n/);
  let rowIndex = 0;
  for (const line of lines) {
    if (skipEmptyLines && line.trim() === "") {
      continue;
    }
    if (maxRows > 0 && rowIndex >= maxRows) {
      break;
    }
    try {
      let values = parseLine(line, delimiter, quote);
      if (trim) {
        values = values.map((v) => v.trim());
      }
      rawRows.push(values);
      rowIndex++;
    } catch {
      errors.push({
        row: rowIndex + 1,
        message: `Failed to parse line: ${line.substring(0, 50)}...`,
        type: "parse"
      });
      rowIndex++;
    }
  }
  if (rawRows.length === 0) {
    return {
      data: [],
      headers: [],
      totalRows: 0,
      errors: [{ row: 0, message: "Empty CSV file", type: "parse" }],
      success: false,
      rawRows: []
    };
  }
  const firstRow = rawRows[0];
  if (!firstRow) {
    return {
      data: [],
      headers: [],
      totalRows: 0,
      errors: [{ row: 0, message: "No data rows found", type: "parse" }],
      success: false,
      rawRows: []
    };
  }
  const headers = hasHeader ? firstRow : firstRow.map((_, i) => `column_${i + 1}`);
  const dataRows = hasHeader ? rawRows.slice(1) : rawRows;
  if (expectedColumns) {
    const missingColumns = expectedColumns.filter(
      (col) => !headers.includes(col)
    );
    if (missingColumns.length > 0) {
      errors.push({
        row: 1,
        message: `Missing expected columns: ${missingColumns.join(", ")}`,
        type: "validation"
      });
    }
  }
  if (requiredColumns) {
    const missingRequired = requiredColumns.filter(
      (col) => !headers.includes(col)
    );
    if (missingRequired.length > 0) {
      errors.push({
        row: 1,
        message: `Missing required columns: ${missingRequired.join(", ")}`,
        type: "missing_required"
      });
    }
  }
  const data = dataRows.map((row, index) => {
    const obj = {};
    headers.forEach((header, colIndex) => {
      obj[header] = row[colIndex] ?? "";
    });
    return obj;
  });
  return {
    data,
    headers,
    totalRows: rawRows.length,
    errors,
    success: errors.filter((e) => e.type !== "validation").length === 0,
    rawRows
  };
}
function mapColumns(data, mappings) {
  const errors = [];
  const result = [];
  data.forEach((row, rowIndex) => {
    const mapped = {};
    for (const mapping of mappings) {
      const rawValue = row[mapping.source];
      if (mapping.required && (rawValue === void 0 || rawValue === "")) {
        const error = {
          row: rowIndex + 2,
          // +2 for header and 0-indexing
          columnName: mapping.source,
          message: `Required field "${mapping.source}" is empty`,
          type: "missing_required"
        };
        if (rawValue !== void 0) {
          error.value = rawValue;
        }
        errors.push(error);
        continue;
      }
      if ((rawValue === void 0 || rawValue === "") && mapping.defaultValue !== void 0) {
        mapped[mapping.target] = mapping.defaultValue;
        continue;
      }
      if (mapping.validate && rawValue !== void 0 && rawValue !== "") {
        const validationResult = mapping.validate(rawValue);
        if (validationResult !== true) {
          errors.push({
            row: rowIndex + 2,
            columnName: mapping.source,
            message: typeof validationResult === "string" ? validationResult : `Invalid value for "${mapping.source}"`,
            type: "invalid_value",
            value: rawValue
          });
          continue;
        }
      }
      if (mapping.transform && rawValue !== void 0) {
        try {
          mapped[mapping.target] = mapping.transform(rawValue);
        } catch {
          errors.push({
            row: rowIndex + 2,
            columnName: mapping.source,
            message: `Failed to transform value for "${mapping.source}"`,
            type: "invalid_value",
            value: rawValue
          });
        }
      } else {
        mapped[mapping.target] = rawValue;
      }
    }
    result.push(mapped);
  });
  return { data: result, errors };
}
function generateCsv(data, options = {}) {
  const {
    columns,
    delimiter = ",",
    includeHeader = true,
    quote = '"'
  } = options;
  if (data.length === 0) {
    return columns && includeHeader ? columns.join(delimiter) : "";
  }
  const firstDataRow = data[0];
  const headers = columns ?? (firstDataRow ? Object.keys(firstDataRow) : []);
  const escapeValue = (value) => {
    const str = String(value ?? "");
    if (str.includes(delimiter) || str.includes(quote) || str.includes("\n") || str.includes("\r")) {
      return `${quote}${str.replace(new RegExp(quote, "g"), quote + quote)}${quote}`;
    }
    return str;
  };
  const lines = [];
  if (includeHeader) {
    lines.push(headers.map(escapeValue).join(delimiter));
  }
  for (const row of data) {
    const values = headers.map((header) => escapeValue(row[header]));
    lines.push(values.join(delimiter));
  }
  return lines.join("\n");
}
var EMPLOYEE_COLUMN_MAPPINGS = [
  {
    source: "first_name",
    target: "firstName",
    required: true,
    validate: (v) => v.length > 0 || "First name is required"
  },
  {
    source: "last_name",
    target: "lastName",
    required: true,
    validate: (v) => v.length > 0 || "Last name is required"
  },
  {
    source: "email",
    target: "email",
    required: true,
    validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Invalid email format"
  },
  {
    source: "phone",
    target: "phone",
    required: false
  },
  {
    source: "role",
    target: "role",
    required: false,
    defaultValue: "viewer",
    validate: (v) => ["admin", "manager", "purchaser", "viewer", "approver"].includes(v) || "Invalid role"
  },
  {
    source: "department",
    target: "department",
    required: false
  },
  {
    source: "job_title",
    target: "jobTitle",
    required: false
  },
  {
    source: "employee_number",
    target: "employeeNumber",
    required: false
  },
  {
    source: "monthly_limit",
    target: "monthlyLimit",
    required: false,
    transform: (v) => v ? parseFloat(v) : void 0,
    validate: (v) => !v || !isNaN(parseFloat(v)) || "Invalid number"
  },
  {
    source: "order_limit",
    target: "orderLimit",
    required: false,
    transform: (v) => v ? parseFloat(v) : void 0,
    validate: (v) => !v || !isNaN(parseFloat(v)) || "Invalid number"
  },
  {
    source: "manager_id",
    target: "managerId",
    required: false
  }
];
function generateTemplate(mappings, sampleData) {
  const headers = mappings.map((m) => m.source);
  if (!sampleData || sampleData.length === 0) {
    return headers.join(",");
  }
  return generateCsv(sampleData, { columns: headers });
}
function validateFileSize(file, maxSizeBytes = 10 * 1024 * 1024) {
  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`
    };
  }
  return { valid: true };
}
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    if (typeof FileReader === "undefined") {
      reject(new Error("FileReader is not available in this environment"));
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Failed to read file as text"));
      }
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsText(file);
  });
}
async function readAndParseCsv(file, options = {}) {
  const text = await readFileAsText(file);
  return parseCsv(text, options);
}

// src/utils/format.ts
var DEFAULT_LOCALE = "fr-FR";
function formatCurrency(amount, options = {}) {
  const {
    code = "EUR",
    locale = DEFAULT_LOCALE,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true,
    showCode = false
  } = options;
  if (showSymbol) {
    const formatter2 = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits,
      maximumFractionDigits
    });
    return formatter2.format(amount);
  }
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits
  });
  const formatted = formatter.format(amount);
  return showCode ? `${formatted} ${code}` : formatted;
}
function formatCurrencyCompact(amount, options = {}) {
  const { code = "EUR", locale = DEFAULT_LOCALE } = options;
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1
  });
  return formatter.format(amount);
}
function formatDate(date, options = {}) {
  const {
    style = "medium",
    includeTime = false,
    timeStyle = "short",
    locale = DEFAULT_LOCALE
  } = options;
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }
  const dateStyleMap = {
    short: "short",
    medium: "medium",
    long: "long",
    full: "full"
  };
  const timeStyleMap = {
    short: "short",
    medium: "medium",
    long: "long"
  };
  const formatOptions = {
    dateStyle: dateStyleMap[style]
  };
  if (includeTime) {
    formatOptions.timeStyle = timeStyleMap[timeStyle];
  }
  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
}
function formatRelativeDate(date, locale = DEFAULT_LOCALE) {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = /* @__PURE__ */ new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1e3);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);
  const diffWeeks = Math.round(diffDays / 7);
  const diffMonths = Math.round(diffDays / 30);
  const diffYears = Math.round(diffDays / 365);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (Math.abs(diffSeconds) < 60) {
    return rtf.format(diffSeconds, "second");
  }
  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }
  if (Math.abs(diffDays) < 7) {
    return rtf.format(diffDays, "day");
  }
  if (Math.abs(diffWeeks) < 4) {
    return rtf.format(diffWeeks, "week");
  }
  if (Math.abs(diffMonths) < 12) {
    return rtf.format(diffMonths, "month");
  }
  return rtf.format(diffYears, "year");
}
function formatNumber(value, options = {}) {
  const {
    locale = DEFAULT_LOCALE,
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping = true,
    notation = "standard",
    compactDisplay = "short"
  } = options;
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping,
    notation,
    compactDisplay: notation === "compact" ? compactDisplay : void 0
  });
  return formatter.format(value);
}
function formatPercentage(value, options = {}) {
  const {
    locale = DEFAULT_LOCALE,
    minimumFractionDigits = 0,
    maximumFractionDigits = 1,
    showSign = false
  } = options;
  const formatter = new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits,
    maximumFractionDigits,
    signDisplay: showSign ? "always" : "auto"
  });
  const normalizedValue = Math.abs(value) > 1 ? value / 100 : value;
  return formatter.format(normalizedValue);
}
function formatOrderNumber(number, prefix = "ORD") {
  const numStr = String(number).padStart(6, "0");
  return `${prefix}-${numStr}`;
}
function formatQuoteNumber(number, prefix = "QUO") {
  const numStr = String(number).padStart(6, "0");
  return `${prefix}-${numStr}`;
}
function formatInvoiceNumber(number, prefix = "INV") {
  const numStr = String(number).padStart(6, "0");
  return `${prefix}-${numStr}`;
}
function formatPhoneNumber(phone, countryCode = "FR") {
  const cleaned = phone.replace(/\D/g, "");
  switch (countryCode) {
    case "FR":
      if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5");
      }
      if (cleaned.length === 11 && cleaned.startsWith("33")) {
        return `+33 ${cleaned.slice(2).replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5")}`;
      }
      break;
    case "US":
      if (cleaned.length === 10) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      }
      break;
  }
  return phone;
}
function formatAddress(address, options = {}) {
  const { multiline = false, separator = ", " } = options;
  const parts = [];
  if (address.line1) parts.push(address.line1);
  if (address.line2) parts.push(address.line2);
  const cityParts = [];
  if (address.city) cityParts.push(address.city);
  if (address.state) cityParts.push(address.state);
  if (address.postalCode) cityParts.push(address.postalCode);
  if (cityParts.length > 0) parts.push(cityParts.join(" "));
  if (address.country) parts.push(address.country);
  return multiline ? parts.join("\n") : parts.join(separator);
}
function formatVatId(vatId, countryCode = "FR") {
  const cleaned = vatId.replace(/\s/g, "");
  switch (countryCode) {
    case "FR":
      if (cleaned.length === 13 && cleaned.startsWith("FR")) {
        return `FR ${cleaned.slice(2, 4)} ${cleaned.slice(4)}`;
      }
      break;
    case "DE":
      if (cleaned.length === 11 && cleaned.startsWith("DE")) {
        return `DE ${cleaned.slice(2)}`;
      }
      break;
  }
  return vatId;
}
function formatFileSize(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  let size = bytes;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}
function formatQuantity(quantity, unit, options = {}) {
  const formatted = formatNumber(quantity, {
    ...options,
    maximumFractionDigits: options.maximumFractionDigits ?? 0
  });
  return unit ? `${formatted} ${unit}` : formatted;
}
function formatDuration(minutes, options = {}) {
  const { short = false } = options;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (short) {
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    }
    if (hours > 0) {
      return `${hours}h`;
    }
    return `${mins}m`;
  }
  const parts = [];
  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  }
  if (mins > 0 || parts.length === 0) {
    parts.push(`${mins} ${mins === 1 ? "minute" : "minutes"}`);
  }
  return parts.join(" ");
}
function truncateText(text, maxLength, options = {}) {
  const { ellipsis = "...", wordBoundary = true } = options;
  if (text.length <= maxLength) {
    return text;
  }
  let truncated = text.slice(0, maxLength - ellipsis.length);
  if (wordBoundary) {
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > maxLength * 0.5) {
      truncated = truncated.slice(0, lastSpace);
    }
  }
  return truncated.trim() + ellipsis;
}
function formatCompanyName(name) {
  const lowercaseWords = /* @__PURE__ */ new Set([
    "and",
    "or",
    "the",
    "a",
    "an",
    "of",
    "in",
    "for",
    "to",
    "et",
    "de",
    "la",
    "le",
    "du",
    "des"
  ]);
  const uppercaseWords = /* @__PURE__ */ new Set([
    "sarl",
    "sas",
    "sa",
    "eurl",
    "sci",
    "llc",
    "inc",
    "ltd",
    "plc",
    "gmbh",
    "ag"
  ]);
  return name.toLowerCase().split(/\s+/).map((word, index) => {
    const lowerWord = word.toLowerCase();
    if (uppercaseWords.has(lowerWord)) {
      return word.toUpperCase();
    }
    if (index > 0 && lowercaseWords.has(lowerWord)) {
      return lowerWord;
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(" ");
}
function formatPaymentTerms(terms) {
  const termsMap = {
    NET30: "Net 30 days",
    NET60: "Net 60 days",
    NET90: "Net 90 days",
    DUE_ON_RECEIPT: "Due on receipt",
    COD: "Cash on delivery",
    PREPAID: "Prepaid",
    "2/10_NET30": "2% 10, Net 30"
  };
  return termsMap[terms] ?? terms;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_APPROVAL_RULES,
  DEFAULT_CURRENCY,
  DEFAULT_THRESHOLDS,
  EMPLOYEE_COLUMN_MAPPINGS,
  addressSchema,
  calculateByCategory,
  calculateByDay,
  calculateEffectiveLimit,
  calculateRollover,
  calculateSavingsOpportunity,
  calculateSpending,
  calculateTotal,
  calculateTrend,
  canAutoApprove,
  canMakePurchase,
  categorySpendingLimitCreateSchema,
  companyAddressSchema,
  companyBillingSettingsSchema,
  companyBrandingSettingsSchema,
  companyFilterSchema,
  companyNotificationSettingsSchema,
  companyOrderingSettingsSchema,
  companyProfileSchema,
  companyRegistrationSchema,
  companySettingsSchema,
  companyShippingSettingsSchema,
  companySpendingLimitCreateSchema,
  companyStatusSchema,
  companyTypeSchema,
  costCenterSpendingLimitCreateSchema,
  createAmountRule,
  createDepartmentRule,
  createRoleRule,
  currencyConfigSchema,
  daysBetween,
  departmentSpendingLimitCreateSchema,
  discountTypeSchema,
  employeeBaseSchema,
  employeeBulkImportRowSchema,
  employeeCreateSchema,
  employeeFilterSchema,
  employeeInviteSchema,
  employeePermissionsSchema,
  employeeRoleSchema,
  employeeSpendingLimitCreateSchema,
  employeeSpendingLimitSchema,
  employeeStatusSchema,
  employeeUpdateSchema,
  evaluateCondition,
  evaluateRule,
  evaluateRules,
  filterByPeriod,
  formatAddress,
  formatCompanyName,
  formatCurrency,
  formatCurrencyCompact,
  formatDate,
  formatDuration,
  formatFileSize,
  formatInvoiceNumber,
  formatNumber,
  formatOrderNumber,
  formatPaymentTerms,
  formatPercentage,
  formatPhoneNumber,
  formatQuantity,
  formatQuoteNumber,
  formatRelativeDate,
  formatVatId,
  generateCsv,
  generateForecast,
  generateTemplate,
  getPeriodDates,
  getRequiredApprovers,
  lineItemDiscountSchema,
  mapColumns,
  parseCsv,
  quoteCreateSchema,
  quoteCustomerSchema,
  quoteDiscountSchema,
  quoteFilterSchema,
  quoteLineItemSchema,
  quotePricingSchema,
  quoteResponseSchema,
  quoteSendSchema,
  quoteStatusSchema,
  quoteTermsSchema,
  quoteUpdateSchema,
  readAndParseCsv,
  readFileAsText,
  requiresApproval,
  shouldReject,
  spendingAdjustmentSchema,
  spendingLimitBaseSchema,
  spendingLimitCreateSchema,
  spendingLimitFilterSchema,
  spendingLimitStatusSchema,
  spendingLimitTypeSchema,
  spendingLimitUpdateSchema,
  spendingPeriodSchema,
  spendingThresholdSchema,
  spendingTransactionSchema,
  taxTypeSchema,
  thresholdActionSchema,
  truncateText,
  useApprovalFlow,
  useBulkSelector,
  useDataTable,
  useQuoteBuilder,
  useSpendingMeter,
  validateFileSize
});
//# sourceMappingURL=index.cjs.map