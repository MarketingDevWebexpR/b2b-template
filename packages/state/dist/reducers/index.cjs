'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// src/types/state.ts
var initialPaginationState = {
  currentPage: 1,
  pageSize: 20,
  totalItems: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false
};
var initialCompanyState = {
  currentCompany: null,
  currentEmployee: null,
  employees: [],
  status: "idle",
  error: null,
  isB2BActive: false,
  lastRefreshedAt: null
};
var initialQuotesState = {
  quotes: [],
  selectedQuote: null,
  filters: {},
  activeStatusFilter: "all",
  searchQuery: "",
  listStatus: "idle",
  detailStatus: "idle",
  error: null,
  pagination: initialPaginationState
};
var initialApprovalsState = {
  pendingApprovals: [],
  allApprovals: [],
  selectedApproval: null,
  filters: {},
  activeStatusFilter: "all",
  listStatus: "idle",
  detailStatus: "idle",
  error: null,
  pendingCount: 0,
  pagination: initialPaginationState
};
var initialSpendingValidation = {
  isWithinLimits: true,
  requiresApproval: false,
  approvalReason: null,
  applicableLimits: [],
  warnings: []
};
var initialCartTotals = {
  subtotal: 0,
  tierDiscount: 0,
  volumeDiscount: 0,
  totalDiscount: 0,
  shippingEstimate: 0,
  tax: 0,
  total: 0,
  currency: "EUR"
};
var initialCartB2BState = {
  items: [],
  itemCount: 0,
  totals: initialCartTotals,
  spendingValidation: initialSpendingValidation,
  canCheckout: false,
  checkoutBlockedReason: "Cart is empty",
  shippingAddressId: null,
  purchaseOrderNumber: "",
  notes: "",
  status: "idle",
  error: null,
  lastUpdatedAt: null
};
var initialRootState = {
  company: initialCompanyState,
  quotes: initialQuotesState,
  approvals: initialApprovalsState,
  cartB2B: initialCartB2BState
};

// src/types/actions.ts
var CompanyActionTypes = {
  // Fetch company
  FETCH_COMPANY_START: "company/fetchStart",
  FETCH_COMPANY_SUCCESS: "company/fetchSuccess",
  FETCH_COMPANY_FAILURE: "company/fetchFailure",
  // Set current context
  SET_CURRENT_COMPANY: "company/setCurrent",
  SET_CURRENT_EMPLOYEE: "company/setCurrentEmployee",
  // Employee management
  LOAD_EMPLOYEES: "company/loadEmployees",
  // Reset
  RESET_COMPANY_STATE: "company/reset",
  CLEAR_COMPANY_ERROR: "company/clearError"
};
var QuotesActionTypes = {
  // Fetch quotes list
  FETCH_QUOTES_START: "quotes/fetchListStart",
  FETCH_QUOTES_SUCCESS: "quotes/fetchListSuccess",
  FETCH_QUOTES_FAILURE: "quotes/fetchListFailure",
  // Fetch single quote
  FETCH_QUOTE_DETAIL_START: "quotes/fetchDetailStart",
  FETCH_QUOTE_DETAIL_SUCCESS: "quotes/fetchDetailSuccess",
  FETCH_QUOTE_DETAIL_FAILURE: "quotes/fetchDetailFailure",
  // Selection
  SELECT_QUOTE: "quotes/select",
  CLEAR_SELECTED_QUOTE: "quotes/clearSelected",
  // Filters
  SET_QUOTE_FILTERS: "quotes/setFilters",
  SET_QUOTE_STATUS_FILTER: "quotes/setStatusFilter",
  SET_QUOTE_SEARCH: "quotes/setSearch",
  CLEAR_QUOTE_FILTERS: "quotes/clearFilters",
  // Pagination
  SET_QUOTES_PAGINATION: "quotes/setPagination",
  SET_QUOTES_PAGE: "quotes/setPage",
  // Quote operations
  CREATE_QUOTE_SUCCESS: "quotes/createSuccess",
  UPDATE_QUOTE_SUCCESS: "quotes/updateSuccess",
  // Reset
  RESET_QUOTES_STATE: "quotes/reset",
  CLEAR_QUOTES_ERROR: "quotes/clearError"
};
var ApprovalsActionTypes = {
  // Fetch approvals
  FETCH_APPROVALS_START: "approvals/fetchListStart",
  FETCH_APPROVALS_SUCCESS: "approvals/fetchListSuccess",
  FETCH_APPROVALS_FAILURE: "approvals/fetchListFailure",
  // Fetch pending
  FETCH_PENDING_START: "approvals/fetchPendingStart",
  FETCH_PENDING_SUCCESS: "approvals/fetchPendingSuccess",
  FETCH_PENDING_FAILURE: "approvals/fetchPendingFailure",
  // Fetch detail
  FETCH_APPROVAL_DETAIL_START: "approvals/fetchDetailStart",
  FETCH_APPROVAL_DETAIL_SUCCESS: "approvals/fetchDetailSuccess",
  FETCH_APPROVAL_DETAIL_FAILURE: "approvals/fetchDetailFailure",
  // Selection
  SELECT_APPROVAL: "approvals/select",
  CLEAR_SELECTED_APPROVAL: "approvals/clearSelected",
  // Filters
  SET_APPROVAL_FILTERS: "approvals/setFilters",
  SET_APPROVAL_STATUS_FILTER: "approvals/setStatusFilter",
  CLEAR_APPROVAL_FILTERS: "approvals/clearFilters",
  // Pagination
  SET_APPROVALS_PAGINATION: "approvals/setPagination",
  SET_APPROVALS_PAGE: "approvals/setPage",
  // Actions
  APPROVAL_ACTION_SUCCESS: "approvals/actionSuccess",
  UPDATE_PENDING_COUNT: "approvals/updatePendingCount",
  // Reset
  RESET_APPROVALS_STATE: "approvals/reset",
  CLEAR_APPROVALS_ERROR: "approvals/clearError"
};
var CartB2BActionTypes = {
  // Item operations
  ADD_ITEM: "cartB2B/addItem",
  UPDATE_ITEM_QUANTITY: "cartB2B/updateItemQuantity",
  REMOVE_ITEM: "cartB2B/removeItem",
  UPDATE_ITEM_NOTES: "cartB2B/updateItemNotes",
  CLEAR_CART: "cartB2B/clear",
  // Bulk operations
  ADD_ITEMS_BULK: "cartB2B/addItemsBulk",
  // Cart metadata
  SET_SHIPPING_ADDRESS: "cartB2B/setShippingAddress",
  SET_PURCHASE_ORDER_NUMBER: "cartB2B/setPurchaseOrderNumber",
  SET_NOTES: "cartB2B/setNotes",
  // Totals and validation
  UPDATE_TOTALS: "cartB2B/updateTotals",
  UPDATE_SPENDING_VALIDATION: "cartB2B/updateSpendingValidation",
  // Loading states
  CART_LOADING_START: "cartB2B/loadingStart",
  CART_LOADING_SUCCESS: "cartB2B/loadingSuccess",
  CART_LOADING_FAILURE: "cartB2B/loadingFailure",
  // Hydration
  HYDRATE_CART: "cartB2B/hydrate",
  // Reset
  RESET_CART_STATE: "cartB2B/reset",
  CLEAR_CART_ERROR: "cartB2B/clearError"
};

// src/reducers/company.reducer.ts
function companyReducer(state = initialCompanyState, action) {
  switch (action.type) {
    case CompanyActionTypes.FETCH_COMPANY_START: {
      return {
        ...state,
        status: "loading",
        error: null
      };
    }
    case CompanyActionTypes.FETCH_COMPANY_SUCCESS: {
      const { company, employee } = action.payload;
      return {
        ...state,
        currentCompany: company,
        currentEmployee: employee,
        status: "succeeded",
        error: null,
        isB2BActive: true,
        lastRefreshedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    case CompanyActionTypes.FETCH_COMPANY_FAILURE: {
      return {
        ...state,
        status: "failed",
        error: action.payload.error,
        isB2BActive: false
      };
    }
    case CompanyActionTypes.SET_CURRENT_COMPANY: {
      const { company } = action.payload;
      const isB2BActive = company !== null && state.currentEmployee !== null;
      return {
        ...state,
        currentCompany: company,
        isB2BActive,
        lastRefreshedAt: company !== null ? (/* @__PURE__ */ new Date()).toISOString() : state.lastRefreshedAt
      };
    }
    case CompanyActionTypes.SET_CURRENT_EMPLOYEE: {
      const { employee } = action.payload;
      const isB2BActive = state.currentCompany !== null && employee !== null;
      return {
        ...state,
        currentEmployee: employee,
        isB2BActive
      };
    }
    case CompanyActionTypes.LOAD_EMPLOYEES: {
      return {
        ...state,
        employees: action.payload.employees
      };
    }
    case CompanyActionTypes.RESET_COMPANY_STATE: {
      return initialCompanyState;
    }
    case CompanyActionTypes.CLEAR_COMPANY_ERROR: {
      return {
        ...state,
        error: null
      };
    }
    default: {
      return state;
    }
  }
}
var company_reducer_default = companyReducer;

// src/reducers/quotes.reducer.ts
function calculatePagination(currentPage, pageSize, totalItems) {
  const totalPages = Math.ceil(totalItems / pageSize);
  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  };
}
function quotesReducer(state = initialQuotesState, action) {
  switch (action.type) {
    case QuotesActionTypes.FETCH_QUOTES_START: {
      return {
        ...state,
        listStatus: "loading",
        error: null
      };
    }
    case QuotesActionTypes.FETCH_QUOTES_SUCCESS: {
      return {
        ...state,
        quotes: action.payload.quotes,
        pagination: action.payload.pagination,
        listStatus: "succeeded",
        error: null
      };
    }
    case QuotesActionTypes.FETCH_QUOTES_FAILURE: {
      return {
        ...state,
        listStatus: "failed",
        error: action.payload.error
      };
    }
    case QuotesActionTypes.FETCH_QUOTE_DETAIL_START: {
      return {
        ...state,
        detailStatus: "loading",
        error: null
      };
    }
    case QuotesActionTypes.FETCH_QUOTE_DETAIL_SUCCESS: {
      return {
        ...state,
        selectedQuote: action.payload.quote,
        detailStatus: "succeeded",
        error: null
      };
    }
    case QuotesActionTypes.FETCH_QUOTE_DETAIL_FAILURE: {
      return {
        ...state,
        detailStatus: "failed",
        error: action.payload.error
      };
    }
    case QuotesActionTypes.SELECT_QUOTE: {
      const quote = state.quotes.find((q) => q.id === action.payload.quoteId);
      if (quote === void 0) {
        return state;
      }
      return state;
    }
    case QuotesActionTypes.CLEAR_SELECTED_QUOTE: {
      return {
        ...state,
        selectedQuote: null,
        detailStatus: "idle"
      };
    }
    case QuotesActionTypes.SET_QUOTE_FILTERS: {
      return {
        ...state,
        filters: action.payload.filters,
        pagination: {
          ...state.pagination,
          currentPage: 1
          // Reset to first page on filter change
        }
      };
    }
    case QuotesActionTypes.SET_QUOTE_STATUS_FILTER: {
      const { status: _unusedStatus, ...restFilters } = state.filters;
      const newFilters = action.payload.status === "all" ? restFilters : { ...restFilters, status: action.payload.status };
      return {
        ...state,
        activeStatusFilter: action.payload.status,
        filters: newFilters,
        pagination: {
          ...state.pagination,
          currentPage: 1
        }
      };
    }
    case QuotesActionTypes.SET_QUOTE_SEARCH: {
      const { search: _unusedSearch, ...filtersWithoutSearch } = state.filters;
      const newFilters = action.payload.query ? { ...filtersWithoutSearch, search: action.payload.query } : filtersWithoutSearch;
      return {
        ...state,
        searchQuery: action.payload.query,
        filters: newFilters,
        pagination: {
          ...state.pagination,
          currentPage: 1
        }
      };
    }
    case QuotesActionTypes.CLEAR_QUOTE_FILTERS: {
      return {
        ...state,
        filters: {},
        activeStatusFilter: "all",
        searchQuery: "",
        pagination: {
          ...state.pagination,
          currentPage: 1
        }
      };
    }
    case QuotesActionTypes.SET_QUOTES_PAGINATION: {
      return {
        ...state,
        pagination: action.payload.pagination
      };
    }
    case QuotesActionTypes.SET_QUOTES_PAGE: {
      const newPagination = calculatePagination(
        action.payload.page,
        state.pagination.pageSize,
        state.pagination.totalItems
      );
      return {
        ...state,
        pagination: newPagination
      };
    }
    case QuotesActionTypes.CREATE_QUOTE_SUCCESS: {
      return {
        ...state,
        quotes: [action.payload.quote, ...state.quotes],
        pagination: {
          ...state.pagination,
          totalItems: state.pagination.totalItems + 1,
          totalPages: Math.ceil(
            (state.pagination.totalItems + 1) / state.pagination.pageSize
          )
        }
      };
    }
    case QuotesActionTypes.UPDATE_QUOTE_SUCCESS: {
      const updatedQuote = action.payload.quote;
      const updatedQuotes = state.quotes.map(
        (q) => q.id === updatedQuote.id ? {
          id: updatedQuote.id,
          quoteNumber: updatedQuote.quoteNumber,
          companyId: updatedQuote.companyId,
          companyName: updatedQuote.companyName,
          status: updatedQuote.status,
          priority: updatedQuote.priority,
          itemCount: updatedQuote.items.length,
          total: updatedQuote.totals.total,
          currency: updatedQuote.totals.currency,
          validUntil: updatedQuote.validUntil,
          createdAt: updatedQuote.createdAt,
          updatedAt: updatedQuote.updatedAt,
          hasUnreadMessages: updatedQuote.unreadMessageCount > 0
        } : q
      );
      return {
        ...state,
        quotes: updatedQuotes,
        selectedQuote: state.selectedQuote?.id === updatedQuote.id ? updatedQuote : state.selectedQuote
      };
    }
    case QuotesActionTypes.RESET_QUOTES_STATE: {
      return initialQuotesState;
    }
    case QuotesActionTypes.CLEAR_QUOTES_ERROR: {
      return {
        ...state,
        error: null
      };
    }
    default: {
      return state;
    }
  }
}
var quotes_reducer_default = quotesReducer;

// src/reducers/approvals.reducer.ts
function calculatePagination2(currentPage, pageSize, totalItems) {
  const totalPages = Math.ceil(totalItems / pageSize);
  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  };
}
function approvalsReducer(state = initialApprovalsState, action) {
  switch (action.type) {
    case ApprovalsActionTypes.FETCH_APPROVALS_START: {
      return {
        ...state,
        listStatus: "loading",
        error: null
      };
    }
    case ApprovalsActionTypes.FETCH_APPROVALS_SUCCESS: {
      return {
        ...state,
        allApprovals: action.payload.approvals,
        pagination: action.payload.pagination,
        listStatus: "succeeded",
        error: null
      };
    }
    case ApprovalsActionTypes.FETCH_APPROVALS_FAILURE: {
      return {
        ...state,
        listStatus: "failed",
        error: action.payload.error
      };
    }
    case ApprovalsActionTypes.FETCH_PENDING_START: {
      return {
        ...state,
        listStatus: "loading",
        error: null
      };
    }
    case ApprovalsActionTypes.FETCH_PENDING_SUCCESS: {
      return {
        ...state,
        pendingApprovals: action.payload.approvals,
        pendingCount: action.payload.count,
        listStatus: "succeeded",
        error: null
      };
    }
    case ApprovalsActionTypes.FETCH_PENDING_FAILURE: {
      return {
        ...state,
        listStatus: "failed",
        error: action.payload.error
      };
    }
    case ApprovalsActionTypes.FETCH_APPROVAL_DETAIL_START: {
      return {
        ...state,
        detailStatus: "loading",
        error: null
      };
    }
    case ApprovalsActionTypes.FETCH_APPROVAL_DETAIL_SUCCESS: {
      return {
        ...state,
        selectedApproval: action.payload.approval,
        detailStatus: "succeeded",
        error: null
      };
    }
    case ApprovalsActionTypes.FETCH_APPROVAL_DETAIL_FAILURE: {
      return {
        ...state,
        detailStatus: "failed",
        error: action.payload.error
      };
    }
    case ApprovalsActionTypes.SELECT_APPROVAL: {
      return state;
    }
    case ApprovalsActionTypes.CLEAR_SELECTED_APPROVAL: {
      return {
        ...state,
        selectedApproval: null,
        detailStatus: "idle"
      };
    }
    case ApprovalsActionTypes.SET_APPROVAL_FILTERS: {
      return {
        ...state,
        filters: action.payload.filters,
        pagination: {
          ...state.pagination,
          currentPage: 1
        }
      };
    }
    case ApprovalsActionTypes.SET_APPROVAL_STATUS_FILTER: {
      const { status: _unusedStatus, ...restFilters } = state.filters;
      const newFilters = action.payload.status === "all" ? restFilters : { ...restFilters, status: action.payload.status };
      return {
        ...state,
        activeStatusFilter: action.payload.status,
        filters: newFilters,
        pagination: {
          ...state.pagination,
          currentPage: 1
        }
      };
    }
    case ApprovalsActionTypes.CLEAR_APPROVAL_FILTERS: {
      return {
        ...state,
        filters: {},
        activeStatusFilter: "all",
        pagination: {
          ...state.pagination,
          currentPage: 1
        }
      };
    }
    case ApprovalsActionTypes.SET_APPROVALS_PAGINATION: {
      return {
        ...state,
        pagination: action.payload.pagination
      };
    }
    case ApprovalsActionTypes.SET_APPROVALS_PAGE: {
      const newPagination = calculatePagination2(
        action.payload.page,
        state.pagination.pageSize,
        state.pagination.totalItems
      );
      return {
        ...state,
        pagination: newPagination
      };
    }
    case ApprovalsActionTypes.APPROVAL_ACTION_SUCCESS: {
      const { approvalId, updatedApproval } = action.payload;
      const baseSummary = {
        id: updatedApproval.id,
        requestNumber: updatedApproval.requestNumber,
        entityType: updatedApproval.entityType,
        entityReference: updatedApproval.entityReference,
        entitySummary: updatedApproval.entitySummary,
        requesterName: updatedApproval.requesterName,
        status: updatedApproval.status,
        currentLevel: updatedApproval.currentLevel,
        totalLevels: updatedApproval.totalLevels,
        priority: updatedApproval.priority,
        createdAt: updatedApproval.createdAt,
        isOverdue: updatedApproval.dueAt !== void 0 && new Date(updatedApproval.dueAt) < /* @__PURE__ */ new Date()
      };
      const updatedSummary = {
        ...baseSummary,
        ...updatedApproval.entityAmount !== void 0 && {
          entityAmount: updatedApproval.entityAmount
        },
        ...updatedApproval.entityCurrency !== void 0 && {
          entityCurrency: updatedApproval.entityCurrency
        },
        ...updatedApproval.dueAt !== void 0 && {
          dueAt: updatedApproval.dueAt
        }
      };
      const updatedAllApprovals = state.allApprovals.map(
        (a) => a.id === approvalId ? updatedSummary : a
      );
      const isPending = updatedApproval.status === "pending";
      const updatedPendingApprovals = isPending ? state.pendingApprovals.map(
        (a) => a.id === approvalId ? updatedSummary : a
      ) : state.pendingApprovals.filter((a) => a.id !== approvalId);
      const newPendingCount = isPending ? state.pendingCount : Math.max(0, state.pendingCount - 1);
      return {
        ...state,
        allApprovals: updatedAllApprovals,
        pendingApprovals: updatedPendingApprovals,
        pendingCount: newPendingCount,
        selectedApproval: state.selectedApproval?.id === approvalId ? updatedApproval : state.selectedApproval
      };
    }
    case ApprovalsActionTypes.UPDATE_PENDING_COUNT: {
      return {
        ...state,
        pendingCount: action.payload.count
      };
    }
    case ApprovalsActionTypes.RESET_APPROVALS_STATE: {
      return initialApprovalsState;
    }
    case ApprovalsActionTypes.CLEAR_APPROVALS_ERROR: {
      return {
        ...state,
        error: null
      };
    }
    default: {
      return state;
    }
  }
}
var approvals_reducer_default = approvalsReducer;

// src/reducers/cart-b2b.reducer.ts
function calculateTotals(items, currentTotals) {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalDiscount = currentTotals.tierDiscount + currentTotals.volumeDiscount;
  const total = subtotal - totalDiscount + currentTotals.shippingEstimate + currentTotals.tax;
  return {
    ...currentTotals,
    subtotal,
    totalDiscount,
    total: Math.max(0, total)
  };
}
function calculateItemCount(items) {
  return items.reduce((count, item) => count + item.quantity, 0);
}
function determineCheckoutStatus(items, isWithinLimits, shippingAddressId) {
  if (items.length === 0) {
    return [false, "Cart is empty"];
  }
  if (!isWithinLimits) {
    return [false, "Order exceeds spending limits"];
  }
  if (shippingAddressId === null) {
    return [false, "Shipping address required"];
  }
  const hasInvalidQuantity = items.some(
    (item) => item.quantity < item.minOrderQuantity || item.quantity > item.maxOrderQuantity
  );
  if (hasInvalidQuantity) {
    return [false, "Some items have invalid quantities"];
  }
  return [true, null];
}
function cartB2BReducer(state = initialCartB2BState, action) {
  switch (action.type) {
    case CartB2BActionTypes.ADD_ITEM: {
      const { item } = action.payload;
      const existingIndex = state.items.findIndex(
        (i) => i.productId === item.productId
      );
      let newItems;
      if (existingIndex >= 0) {
        const existingItem = state.items[existingIndex];
        if (existingItem === void 0) {
          return state;
        }
        const newQuantity = Math.min(
          existingItem.quantity + item.quantity,
          item.maxOrderQuantity
        );
        const updatedItem = {
          ...existingItem,
          quantity: newQuantity,
          lineTotal: newQuantity * existingItem.unitPrice
        };
        newItems = [
          ...state.items.slice(0, existingIndex),
          updatedItem,
          ...state.items.slice(existingIndex + 1)
        ];
      } else {
        newItems = [...state.items, item];
      }
      const newTotals = calculateTotals(newItems, state.totals);
      const [canCheckout, checkoutBlockedReason] = determineCheckoutStatus(
        newItems,
        state.spendingValidation.isWithinLimits,
        state.shippingAddressId
      );
      return {
        ...state,
        items: newItems,
        itemCount: calculateItemCount(newItems),
        totals: newTotals,
        canCheckout,
        checkoutBlockedReason,
        lastUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    case CartB2BActionTypes.UPDATE_ITEM_QUANTITY: {
      const { productId, quantity } = action.payload;
      const itemIndex = state.items.findIndex((i) => i.productId === productId);
      if (itemIndex < 0) {
        return state;
      }
      const item = state.items[itemIndex];
      if (item === void 0) {
        return state;
      }
      const validQuantity = Math.max(
        item.minOrderQuantity,
        Math.min(quantity, item.maxOrderQuantity)
      );
      const updatedItem = {
        ...item,
        quantity: validQuantity,
        lineTotal: validQuantity * item.unitPrice
      };
      const newItems = [
        ...state.items.slice(0, itemIndex),
        updatedItem,
        ...state.items.slice(itemIndex + 1)
      ];
      const newTotals = calculateTotals(newItems, state.totals);
      const [canCheckout, checkoutBlockedReason] = determineCheckoutStatus(
        newItems,
        state.spendingValidation.isWithinLimits,
        state.shippingAddressId
      );
      return {
        ...state,
        items: newItems,
        itemCount: calculateItemCount(newItems),
        totals: newTotals,
        canCheckout,
        checkoutBlockedReason,
        lastUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    case CartB2BActionTypes.REMOVE_ITEM: {
      const { productId } = action.payload;
      const newItems = state.items.filter((i) => i.productId !== productId);
      const newTotals = calculateTotals(newItems, state.totals);
      const [canCheckout, checkoutBlockedReason] = determineCheckoutStatus(
        newItems,
        state.spendingValidation.isWithinLimits,
        state.shippingAddressId
      );
      return {
        ...state,
        items: newItems,
        itemCount: calculateItemCount(newItems),
        totals: newTotals,
        canCheckout,
        checkoutBlockedReason,
        lastUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    case CartB2BActionTypes.UPDATE_ITEM_NOTES: {
      const { productId, notes } = action.payload;
      const itemIndex = state.items.findIndex((i) => i.productId === productId);
      if (itemIndex < 0) {
        return state;
      }
      const item = state.items[itemIndex];
      if (item === void 0) {
        return state;
      }
      const updatedItem = {
        ...item,
        notes
      };
      const newItems = [
        ...state.items.slice(0, itemIndex),
        updatedItem,
        ...state.items.slice(itemIndex + 1)
      ];
      return {
        ...state,
        items: newItems,
        lastUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    case CartB2BActionTypes.CLEAR_CART: {
      return {
        ...initialCartB2BState,
        shippingAddressId: state.shippingAddressId,
        // Preserve shipping address
        lastUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    case CartB2BActionTypes.ADD_ITEMS_BULK: {
      const { items: newItemsToAdd } = action.payload;
      const itemMap = /* @__PURE__ */ new Map();
      for (const item of state.items) {
        itemMap.set(item.productId, item);
      }
      for (const newItem of newItemsToAdd) {
        const existing = itemMap.get(newItem.productId);
        if (existing !== void 0) {
          const newQuantity = Math.min(
            existing.quantity + newItem.quantity,
            newItem.maxOrderQuantity
          );
          itemMap.set(newItem.productId, {
            ...existing,
            quantity: newQuantity,
            lineTotal: newQuantity * existing.unitPrice
          });
        } else {
          itemMap.set(newItem.productId, newItem);
        }
      }
      const newItems = Array.from(itemMap.values());
      const newTotals = calculateTotals(newItems, state.totals);
      const [canCheckout, checkoutBlockedReason] = determineCheckoutStatus(
        newItems,
        state.spendingValidation.isWithinLimits,
        state.shippingAddressId
      );
      return {
        ...state,
        items: newItems,
        itemCount: calculateItemCount(newItems),
        totals: newTotals,
        canCheckout,
        checkoutBlockedReason,
        lastUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    case CartB2BActionTypes.SET_SHIPPING_ADDRESS: {
      const { addressId } = action.payload;
      const [canCheckout, checkoutBlockedReason] = determineCheckoutStatus(
        state.items,
        state.spendingValidation.isWithinLimits,
        addressId
      );
      return {
        ...state,
        shippingAddressId: addressId,
        canCheckout,
        checkoutBlockedReason,
        lastUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    case CartB2BActionTypes.SET_PURCHASE_ORDER_NUMBER: {
      return {
        ...state,
        purchaseOrderNumber: action.payload.poNumber,
        lastUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    case CartB2BActionTypes.SET_NOTES: {
      return {
        ...state,
        notes: action.payload.notes,
        lastUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    case CartB2BActionTypes.UPDATE_TOTALS: {
      const { totals } = action.payload;
      return {
        ...state,
        totals,
        lastUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    case CartB2BActionTypes.UPDATE_SPENDING_VALIDATION: {
      const { validation, limits } = action.payload;
      const [canCheckout, checkoutBlockedReason] = determineCheckoutStatus(
        state.items,
        validation.isWithinLimits,
        state.shippingAddressId
      );
      return {
        ...state,
        spendingValidation: {
          ...validation,
          applicableLimits: limits
        },
        canCheckout,
        checkoutBlockedReason,
        lastUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    case CartB2BActionTypes.CART_LOADING_START: {
      return {
        ...state,
        status: "loading",
        error: null
      };
    }
    case CartB2BActionTypes.CART_LOADING_SUCCESS: {
      return {
        ...state,
        status: "succeeded",
        error: null
      };
    }
    case CartB2BActionTypes.CART_LOADING_FAILURE: {
      return {
        ...state,
        status: "failed",
        error: action.payload.error
      };
    }
    case CartB2BActionTypes.HYDRATE_CART: {
      const { items, shippingAddressId, purchaseOrderNumber, notes } = action.payload;
      const newTotals = calculateTotals(items, initialCartTotals);
      const [canCheckout, checkoutBlockedReason] = determineCheckoutStatus(
        items,
        initialSpendingValidation.isWithinLimits,
        shippingAddressId
      );
      return {
        ...state,
        items,
        itemCount: calculateItemCount(items),
        totals: newTotals,
        shippingAddressId,
        purchaseOrderNumber,
        notes,
        canCheckout,
        checkoutBlockedReason,
        status: "succeeded",
        error: null,
        lastUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    case CartB2BActionTypes.RESET_CART_STATE: {
      return initialCartB2BState;
    }
    case CartB2BActionTypes.CLEAR_CART_ERROR: {
      return {
        ...state,
        error: null
      };
    }
    default: {
      return state;
    }
  }
}
var cart_b2b_reducer_default = cartB2BReducer;

// src/reducers/index.ts
function rootReducer(state = initialRootState, action) {
  return {
    company: companyReducer(state.company, action),
    quotes: quotesReducer(state.quotes, action),
    approvals: approvalsReducer(state.approvals, action),
    cartB2B: cartB2BReducer(state.cartB2B, action)
  };
}
var reducers_default = rootReducer;
var reducers = {
  company: companyReducer,
  quotes: quotesReducer,
  approvals: approvalsReducer,
  cartB2B: cartB2BReducer
};

exports.approvalsReducer = approvalsReducer;
exports.approvalsReducerDefault = approvals_reducer_default;
exports.cartB2BReducer = cartB2BReducer;
exports.cartB2BReducerDefault = cart_b2b_reducer_default;
exports.companyReducer = companyReducer;
exports.companyReducerDefault = company_reducer_default;
exports.default = reducers_default;
exports.quotesReducer = quotesReducer;
exports.quotesReducerDefault = quotes_reducer_default;
exports.reducers = reducers;
exports.rootReducer = rootReducer;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map