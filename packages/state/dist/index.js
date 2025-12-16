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

// src/reducers/index.ts
function rootReducer(state = initialRootState, action) {
  return {
    company: companyReducer(state.company, action),
    quotes: quotesReducer(state.quotes, action),
    approvals: approvalsReducer(state.approvals, action),
    cartB2B: cartB2BReducer(state.cartB2B, action)
  };
}
var reducers = {
  company: companyReducer,
  quotes: quotesReducer,
  approvals: approvalsReducer,
  cartB2B: cartB2BReducer
};

// src/utils/memoize.ts
function createSelector(selector) {
  let lastState;
  let lastResult;
  return (state) => {
    if (lastState === state && lastResult !== void 0) {
      return lastResult;
    }
    const result = selector(state);
    lastState = state;
    lastResult = result;
    return result;
  };
}
function createDerivedSelector(dependencies, combiner) {
  let lastDeps;
  let lastResult;
  return (state) => {
    const deps = dependencies.map((dep) => dep(state));
    if (lastDeps !== void 0 && deps.every((dep, i) => Object.is(dep, lastDeps[i]))) {
      return lastResult;
    }
    const result = combiner(...deps);
    lastDeps = deps;
    lastResult = result;
    return result;
  };
}
function shallowEqual(objA, objB) {
  if (Object.is(objA, objB)) {
    return true;
  }
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) {
    return false;
  }
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key) || !Object.is(objA[key], objB[key])) {
      return false;
    }
  }
  return true;
}
function createShallowEqualSelector(selector) {
  let lastState;
  let lastResult;
  return (state) => {
    if (lastState === state && lastResult !== void 0) {
      return lastResult;
    }
    const result = selector(state);
    if (lastResult !== void 0 && shallowEqual(result, lastResult)) {
      lastState = state;
      return lastResult;
    }
    lastState = state;
    lastResult = result;
    return result;
  };
}
function createParameterizedSelector(selector, cacheSize = 10) {
  const cache = /* @__PURE__ */ new Map();
  return (state, param) => {
    const cached = cache.get(param);
    if (cached !== void 0 && cached.state === state) {
      return cached.result;
    }
    const result = selector(state, param);
    if (cache.size >= cacheSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== void 0) {
        cache.delete(firstKey);
      }
    }
    cache.set(param, { state, result });
    return result;
  };
}
function createDerivedShallowSelector(dependencies, combiner) {
  let lastDeps;
  let lastResult;
  return (state) => {
    const deps = dependencies.map((dep) => dep(state));
    if (lastDeps !== void 0 && deps.every((dep, i) => Object.is(dep, lastDeps[i]))) {
      return lastResult;
    }
    const result = combiner(...deps);
    if (lastResult !== void 0 && shallowEqual(result, lastResult)) {
      lastDeps = deps;
      return lastResult;
    }
    lastDeps = deps;
    lastResult = result;
    return result;
  };
}

// src/selectors/company.selectors.ts
function selectCompanyState(state) {
  return state.company;
}
function selectCurrentCompany(state) {
  return state.company.currentCompany;
}
function selectCurrentEmployee(state) {
  return state.company.currentEmployee;
}
function selectEmployees(state) {
  return state.company.employees;
}
function selectIsB2BActive(state) {
  return state.company.isB2BActive;
}
function selectCompanyStatus(state) {
  return state.company.status;
}
function selectIsCompanyLoading(state) {
  return state.company.status === "loading";
}
function selectCompanyError(state) {
  return state.company.error;
}
function selectCompanyLastRefreshed(state) {
  return state.company.lastRefreshedAt;
}
function selectCurrentCompanyId(state) {
  return state.company.currentCompany?.id ?? null;
}
function selectCurrentCompanyName(state) {
  return state.company.currentCompany?.name ?? null;
}
function selectCurrentCompanyTier(state) {
  return state.company.currentCompany?.tier ?? null;
}
function selectCompanyAvailableCredit(state) {
  return state.company.currentCompany?.creditAvailable ?? 0;
}
function selectCompanyCreditLimit(state) {
  return state.company.currentCompany?.creditLimit ?? 0;
}
function selectCompanyCreditUsagePercent(state) {
  const company = state.company.currentCompany;
  if (company === null || company.creditLimit === 0) {
    return 0;
  }
  return Math.round(company.creditUsed / company.creditLimit * 100);
}
function selectCompanyPaymentTerms(state) {
  return state.company.currentCompany?.paymentTerms ?? null;
}
function selectCompanyAddresses(state) {
  return state.company.currentCompany?.addresses ?? [];
}
function selectDefaultShippingAddressId(state) {
  return state.company.currentCompany?.defaultShippingAddressId ?? null;
}
function selectDefaultBillingAddressId(state) {
  return state.company.currentCompany?.defaultBillingAddressId ?? null;
}
function selectCurrentEmployeeId(state) {
  return state.company.currentEmployee?.id ?? null;
}
function selectCurrentEmployeeName(state) {
  return state.company.currentEmployee?.fullName ?? null;
}
function selectCurrentEmployeeRole(state) {
  return state.company.currentEmployee?.role ?? null;
}
function selectCurrentEmployeePermissions(state) {
  return state.company.currentEmployee?.permissions ?? [];
}
function selectHasPermission(state, permission) {
  const employee = state.company.currentEmployee;
  if (employee === null) {
    return false;
  }
  if (employee.permissions.includes("admin.full_access")) {
    return true;
  }
  return employee.permissions.includes(permission);
}
function selectIsApprover(state) {
  return state.company.currentEmployee?.isApprover ?? false;
}
function selectEmployeeApprovalLimit(state) {
  return state.company.currentEmployee?.approvalLimit ?? null;
}
var selectEmployeeSpendingLimits = createDerivedShallowSelector(
  [selectCurrentEmployee],
  (employee) => ({
    perOrder: employee?.spendingLimitPerOrder ?? null,
    daily: employee?.spendingLimitDaily ?? null,
    weekly: employee?.spendingLimitWeekly ?? null,
    monthly: employee?.spendingLimitMonthly ?? null
  })
);
var selectEmployeeCurrentSpending = createDerivedShallowSelector(
  [selectCurrentEmployee],
  (employee) => ({
    daily: employee?.currentDailySpending ?? 0,
    weekly: employee?.currentWeeklySpending ?? 0,
    monthly: employee?.currentMonthlySpending ?? 0
  })
);
var selectEmployeeById = createParameterizedSelector(
  (state, employeeId) => state.company.employees.find((e) => e.id === employeeId)
);
var selectApproverEmployees = createDerivedSelector(
  [selectEmployees],
  (employees) => employees.filter((e) => e.isApprover)
);
function selectEmployeeCount(state) {
  return state.company.employees.length;
}
function selectCanCreateOrders(state) {
  const company = state.company.currentCompany;
  const employee = state.company.currentEmployee;
  if (company === null || employee === null) {
    return false;
  }
  if (company.status !== "active") {
    return false;
  }
  return selectHasPermission(state, "orders.create");
}
function selectCanCreateQuotes(state) {
  const company = state.company.currentCompany;
  const employee = state.company.currentEmployee;
  if (company === null || employee === null) {
    return false;
  }
  if (company.status !== "active") {
    return false;
  }
  return selectHasPermission(state, "quotes.create");
}
function selectCanApproveOrders(state) {
  const employee = state.company.currentEmployee;
  if (employee === null) {
    return false;
  }
  return employee.isApprover && selectHasPermission(state, "approvals.approve");
}
function selectRequiresOrderApproval(state) {
  return state.company.currentCompany?.settings.requireOrderApproval ?? false;
}

// src/selectors/quotes.selectors.ts
function selectQuotesState(state) {
  return state.quotes;
}
function selectQuotes(state) {
  return state.quotes.quotes;
}
function selectSelectedQuote(state) {
  return state.quotes.selectedQuote;
}
function selectQuoteFilters(state) {
  return state.quotes.filters;
}
function selectActiveStatusFilter(state) {
  return state.quotes.activeStatusFilter;
}
function selectQuoteSearchQuery(state) {
  return state.quotes.searchQuery;
}
function selectQuotesListStatus(state) {
  return state.quotes.listStatus;
}
function selectIsQuotesLoading(state) {
  return state.quotes.listStatus === "loading";
}
function selectQuoteDetailStatus(state) {
  return state.quotes.detailStatus;
}
function selectIsQuoteDetailLoading(state) {
  return state.quotes.detailStatus === "loading";
}
function selectQuotesError(state) {
  return state.quotes.error;
}
function selectQuotesPagination(state) {
  return state.quotes.pagination;
}
function selectQuotesCurrentPage(state) {
  return state.quotes.pagination.currentPage;
}
function selectQuotesTotalCount(state) {
  return state.quotes.pagination.totalItems;
}
function selectQuotesHasNextPage(state) {
  return state.quotes.pagination.hasNextPage;
}
function selectQuotesHasPreviousPage(state) {
  return state.quotes.pagination.hasPreviousPage;
}
var selectQuoteById = createParameterizedSelector(
  (state, quoteId) => state.quotes.quotes.find((q) => q.id === quoteId)
);
var selectQuotesByStatus = createParameterizedSelector(
  (state, status) => state.quotes.quotes.filter((q) => q.status === status)
);
var selectFilteredQuotes = createDerivedSelector(
  [selectQuotes, selectActiveStatusFilter, selectQuoteSearchQuery],
  (quotes, activeStatusFilter, searchQuery) => {
    let filtered = quotes;
    if (activeStatusFilter !== "all") {
      filtered = filtered.filter((q) => q.status === activeStatusFilter);
    }
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (q) => q.quoteNumber.toLowerCase().includes(query) || q.companyName.toLowerCase().includes(query)
      );
    }
    return filtered;
  }
);
var selectQuoteCountByStatus = createParameterizedSelector(
  (state, status) => state.quotes.quotes.filter((q) => q.status === status).length
);
var selectQuotesWithUnreadMessages = createDerivedSelector(
  [selectQuotes],
  (quotes) => quotes.filter((q) => q.hasUnreadMessages)
);
function selectUnreadQuotesCount(state) {
  return state.quotes.quotes.filter((q) => q.hasUnreadMessages).length;
}
var SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1e3;
var FINALIZED_STATUSES = [
  "accepted",
  "rejected",
  "expired",
  "converted",
  "cancelled"
];
var selectExpiringQuotes = createDerivedSelector(
  [selectQuotes],
  (quotes) => {
    const now = Date.now();
    const sevenDaysFromNow = now + SEVEN_DAYS_MS;
    return quotes.filter((q) => {
      const validUntilTime = new Date(q.validUntil).getTime();
      return validUntilTime > now && validUntilTime <= sevenDaysFromNow && !FINALIZED_STATUSES.includes(q.status);
    });
  }
);
function selectHasQuotes(state) {
  return state.quotes.quotes.length > 0;
}
function selectQuotesTotalValue(state) {
  return state.quotes.quotes.reduce((sum, q) => sum + q.total, 0);
}
function selectSelectedQuoteId(state) {
  return state.quotes.selectedQuote?.id ?? null;
}
function selectSelectedQuoteStatus(state) {
  return state.quotes.selectedQuote?.status ?? null;
}
function selectSelectedQuoteItems(state) {
  return state.quotes.selectedQuote?.items ?? [];
}
function selectSelectedQuoteTotals(state) {
  return state.quotes.selectedQuote?.totals ?? null;
}
function selectCanAcceptSelectedQuote(state) {
  const status = state.quotes.selectedQuote?.status;
  return status === "responded" || status === "negotiating";
}
function selectCanEditSelectedQuote(state) {
  return state.quotes.selectedQuote?.status === "draft";
}

// src/selectors/approvals.selectors.ts
function selectApprovalsState(state) {
  return state.approvals;
}
function selectPendingApprovals(state) {
  return state.approvals.pendingApprovals;
}
function selectAllApprovals(state) {
  return state.approvals.allApprovals;
}
function selectSelectedApproval(state) {
  return state.approvals.selectedApproval;
}
function selectPendingApprovalCount(state) {
  return state.approvals.pendingCount;
}
function selectApprovalCount(state) {
  return state.approvals.pendingCount;
}
function selectApprovalFilters(state) {
  return state.approvals.filters;
}
function selectApprovalStatusFilter(state) {
  return state.approvals.activeStatusFilter;
}
function selectApprovalsListStatus(state) {
  return state.approvals.listStatus;
}
function selectIsApprovalsLoading(state) {
  return state.approvals.listStatus === "loading";
}
function selectApprovalDetailStatus(state) {
  return state.approvals.detailStatus;
}
function selectIsApprovalDetailLoading(state) {
  return state.approvals.detailStatus === "loading";
}
function selectApprovalsError(state) {
  return state.approvals.error;
}
function selectApprovalsPagination(state) {
  return state.approvals.pagination;
}
function selectApprovalsCurrentPage(state) {
  return state.approvals.pagination.currentPage;
}
function selectApprovalsTotalCount(state) {
  return state.approvals.pagination.totalItems;
}
var selectApprovalById = createParameterizedSelector(
  (state, approvalId) => state.approvals.allApprovals.find((a) => a.id === approvalId)
);
var selectApprovalsByStatus = createParameterizedSelector(
  (state, status) => state.approvals.allApprovals.filter((a) => a.status === status)
);
var selectApprovalsByEntityType = createParameterizedSelector(
  (state, entityType) => state.approvals.allApprovals.filter((a) => a.entityType === entityType)
);
var selectPendingOrderApprovals = createDerivedSelector(
  [selectPendingApprovals],
  (pendingApprovals) => pendingApprovals.filter((a) => a.entityType === "order")
);
var selectPendingQuoteApprovals = createDerivedSelector(
  [selectPendingApprovals],
  (pendingApprovals) => pendingApprovals.filter((a) => a.entityType === "quote")
);
var selectOverdueApprovals = createDerivedSelector(
  [selectPendingApprovals],
  (pendingApprovals) => pendingApprovals.filter((a) => a.isOverdue)
);
function selectOverdueApprovalCount(state) {
  return state.approvals.pendingApprovals.filter((a) => a.isOverdue).length;
}
var selectHighPriorityApprovals = createDerivedSelector(
  [selectPendingApprovals],
  (pendingApprovals) => pendingApprovals.filter((a) => a.priority === "high" || a.priority === "urgent")
);
function selectHasPendingApprovals(state) {
  return state.approvals.pendingCount > 0;
}
function selectPendingApprovalsTotalValue(state) {
  return state.approvals.pendingApprovals.reduce(
    (sum, a) => sum + (a.entityAmount ?? 0),
    0
  );
}
var INITIAL_STATUS_COUNTS = {
  pending: 0,
  in_review: 0,
  approved: 0,
  rejected: 0,
  escalated: 0,
  delegated: 0,
  expired: 0,
  cancelled: 0
};
var selectApprovalCountsByStatus = createDerivedShallowSelector(
  [selectAllApprovals],
  (allApprovals) => {
    const counts = { ...INITIAL_STATUS_COUNTS };
    for (const approval of allApprovals) {
      counts[approval.status]++;
    }
    return counts;
  }
);
function selectSelectedApprovalId(state) {
  return state.approvals.selectedApproval?.id ?? null;
}
function selectSelectedApprovalStatus(state) {
  return state.approvals.selectedApproval?.status ?? null;
}
function selectSelectedApprovalSteps(state) {
  return state.approvals.selectedApproval?.steps ?? [];
}
function selectSelectedApprovalCurrentLevel(state) {
  return state.approvals.selectedApproval?.currentLevel ?? 0;
}
function selectCanActionSelectedApproval(state) {
  const status = state.approvals.selectedApproval?.status;
  return status === "pending" || status === "in_review";
}
function selectIsSelectedApprovalOverdue(state) {
  const approval = state.approvals.selectedApproval;
  if (approval === null || approval.dueAt === void 0) {
    return false;
  }
  return new Date(approval.dueAt) < /* @__PURE__ */ new Date();
}

// src/selectors/cart.selectors.ts
function selectCartB2BState(state) {
  return state.cartB2B;
}
function selectCartItems(state) {
  return state.cartB2B.items;
}
function selectCartItemCount(state) {
  return state.cartB2B.itemCount;
}
function selectCartTotals(state) {
  return state.cartB2B.totals;
}
function selectCartTotal(state) {
  return state.cartB2B.totals.total;
}
function selectSpendingValidation(state) {
  return state.cartB2B.spendingValidation;
}
function selectCanCheckout(state) {
  return state.cartB2B.canCheckout;
}
function selectCheckoutBlockedReason(state) {
  return state.cartB2B.checkoutBlockedReason;
}
function selectCartStatus(state) {
  return state.cartB2B.status;
}
function selectIsCartLoading(state) {
  return state.cartB2B.status === "loading";
}
function selectCartError(state) {
  return state.cartB2B.error;
}
function selectCartLastUpdated(state) {
  return state.cartB2B.lastUpdatedAt;
}
function selectCartShippingAddressId(state) {
  return state.cartB2B.shippingAddressId;
}
function selectCartPurchaseOrderNumber(state) {
  return state.cartB2B.purchaseOrderNumber;
}
function selectCartNotes(state) {
  return state.cartB2B.notes;
}
var selectCartItemByProductId = createParameterizedSelector(
  (state, productId) => state.cartB2B.items.find((item) => item.productId === productId)
);
var selectCartItemQuantity = createParameterizedSelector(
  (state, productId) => {
    const item = state.cartB2B.items.find((i) => i.productId === productId);
    return item?.quantity ?? 0;
  }
);
var selectIsProductInCart = createParameterizedSelector(
  (state, productId) => state.cartB2B.items.some((item) => item.productId === productId)
);
function selectCartUniqueItemCount(state) {
  return state.cartB2B.items.length;
}
function selectCartSubtotal(state) {
  return state.cartB2B.totals.subtotal;
}
function selectCartTierDiscount(state) {
  return state.cartB2B.totals.tierDiscount;
}
function selectCartVolumeDiscount(state) {
  return state.cartB2B.totals.volumeDiscount;
}
function selectCartTotalDiscount(state) {
  return state.cartB2B.totals.totalDiscount;
}
function selectCartShippingEstimate(state) {
  return state.cartB2B.totals.shippingEstimate;
}
function selectCartTax(state) {
  return state.cartB2B.totals.tax;
}
function selectCartCurrency(state) {
  return state.cartB2B.totals.currency;
}
function selectIsWithinSpendingLimits(state) {
  return state.cartB2B.spendingValidation.isWithinLimits;
}
function selectRequiresApproval(state) {
  return state.cartB2B.spendingValidation.requiresApproval;
}
function selectApprovalReason(state) {
  return state.cartB2B.spendingValidation.approvalReason;
}
function selectApplicableSpendingLimits(state) {
  return state.cartB2B.spendingValidation.applicableLimits;
}
function selectSpendingWarnings(state) {
  return state.cartB2B.spendingValidation.warnings;
}
function selectHasSpendingWarnings(state) {
  return state.cartB2B.spendingValidation.warnings.length > 0;
}
function selectIsCartEmpty(state) {
  return state.cartB2B.items.length === 0;
}
var selectInvalidQuantityItems = createDerivedSelector(
  [selectCartItems],
  (items) => items.filter(
    (item) => item.quantity < item.minOrderQuantity || item.quantity > item.maxOrderQuantity
  )
);
function selectAllQuantitiesValid(state) {
  return state.cartB2B.items.every(
    (item) => item.quantity >= item.minOrderQuantity && item.quantity <= item.maxOrderQuantity
  );
}
function selectCartTotalQuantity(state) {
  return state.cartB2B.items.reduce((sum, item) => sum + item.quantity, 0);
}
function selectAverageItemPrice(state) {
  const items = state.cartB2B.items;
  if (items.length === 0) {
    return 0;
  }
  const totalValue = items.reduce((sum, item) => sum + item.unitPrice, 0);
  return totalValue / items.length;
}
var selectCartForPersistence = createDerivedShallowSelector(
  [
    selectCartItems,
    selectCartShippingAddressId,
    selectCartPurchaseOrderNumber,
    selectCartNotes
  ],
  (items, shippingAddressId, purchaseOrderNumber, notes) => ({
    items,
    shippingAddressId,
    purchaseOrderNumber,
    notes
  })
);
var selectCheckoutSummary = createDerivedShallowSelector(
  [
    selectCartItemCount,
    selectCartItems,
    selectCartTotals,
    selectSpendingValidation,
    selectCanCheckout,
    selectCheckoutBlockedReason
  ],
  (itemCount, items, totals, spendingValidation, canCheckout, checkoutBlockedReason) => ({
    itemCount,
    uniqueItems: items.length,
    subtotal: totals.subtotal,
    discount: totals.totalDiscount,
    shipping: totals.shippingEstimate,
    tax: totals.tax,
    total: totals.total,
    currency: totals.currency,
    requiresApproval: spendingValidation.requiresApproval,
    canCheckout,
    blockedReason: checkoutBlockedReason
  })
);

// src/actions/company.actions.ts
function fetchCompanyStart() {
  return {
    type: CompanyActionTypes.FETCH_COMPANY_START
  };
}
function fetchCompanySuccess(company, employee) {
  return {
    type: CompanyActionTypes.FETCH_COMPANY_SUCCESS,
    payload: {
      company,
      employee
    }
  };
}
function fetchCompanyFailure(error) {
  return {
    type: CompanyActionTypes.FETCH_COMPANY_FAILURE,
    payload: {
      error
    }
  };
}
function setCurrentCompany(company) {
  return {
    type: CompanyActionTypes.SET_CURRENT_COMPANY,
    payload: {
      company
    }
  };
}
function setCurrentEmployee(employee) {
  return {
    type: CompanyActionTypes.SET_CURRENT_EMPLOYEE,
    payload: {
      employee
    }
  };
}
function loadEmployees(employees) {
  return {
    type: CompanyActionTypes.LOAD_EMPLOYEES,
    payload: {
      employees
    }
  };
}
function resetCompanyState() {
  return {
    type: CompanyActionTypes.RESET_COMPANY_STATE
  };
}
function clearCompanyError() {
  return {
    type: CompanyActionTypes.CLEAR_COMPANY_ERROR
  };
}
var CompanyAsyncActionTypes = {
  /** Fetch company and employee data */
  FETCH_COMPANY: "company/fetch",
  /** Refresh company data */
  REFRESH_COMPANY: "company/refresh",
  /** Switch to different company (for multi-company users) */
  SWITCH_COMPANY: "company/switch",
  /** Fetch employees list */
  FETCH_EMPLOYEES: "company/fetchEmployees"
};

// src/actions/quotes.actions.ts
function fetchQuotesStart() {
  return {
    type: QuotesActionTypes.FETCH_QUOTES_START
  };
}
function fetchQuotesSuccess(quotes, pagination) {
  return {
    type: QuotesActionTypes.FETCH_QUOTES_SUCCESS,
    payload: {
      quotes,
      pagination
    }
  };
}
function fetchQuotesFailure(error) {
  return {
    type: QuotesActionTypes.FETCH_QUOTES_FAILURE,
    payload: {
      error
    }
  };
}
function fetchQuoteDetailStart() {
  return {
    type: QuotesActionTypes.FETCH_QUOTE_DETAIL_START
  };
}
function fetchQuoteDetailSuccess(quote) {
  return {
    type: QuotesActionTypes.FETCH_QUOTE_DETAIL_SUCCESS,
    payload: {
      quote
    }
  };
}
function fetchQuoteDetailFailure(error) {
  return {
    type: QuotesActionTypes.FETCH_QUOTE_DETAIL_FAILURE,
    payload: {
      error
    }
  };
}
function selectQuote(quoteId) {
  return {
    type: QuotesActionTypes.SELECT_QUOTE,
    payload: {
      quoteId
    }
  };
}
function clearSelectedQuote() {
  return {
    type: QuotesActionTypes.CLEAR_SELECTED_QUOTE
  };
}
function setQuoteFilters(filters) {
  return {
    type: QuotesActionTypes.SET_QUOTE_FILTERS,
    payload: {
      filters
    }
  };
}
function setQuoteStatusFilter(status) {
  return {
    type: QuotesActionTypes.SET_QUOTE_STATUS_FILTER,
    payload: {
      status
    }
  };
}
function setQuoteSearch(query) {
  return {
    type: QuotesActionTypes.SET_QUOTE_SEARCH,
    payload: {
      query
    }
  };
}
function clearQuoteFilters() {
  return {
    type: QuotesActionTypes.CLEAR_QUOTE_FILTERS
  };
}
function setQuotesPagination(pagination) {
  return {
    type: QuotesActionTypes.SET_QUOTES_PAGINATION,
    payload: {
      pagination
    }
  };
}
function setQuotesPage(page) {
  return {
    type: QuotesActionTypes.SET_QUOTES_PAGE,
    payload: {
      page
    }
  };
}
function createQuoteSuccess(quote) {
  return {
    type: QuotesActionTypes.CREATE_QUOTE_SUCCESS,
    payload: {
      quote
    }
  };
}
function updateQuoteSuccess(quote) {
  return {
    type: QuotesActionTypes.UPDATE_QUOTE_SUCCESS,
    payload: {
      quote
    }
  };
}
function resetQuotesState() {
  return {
    type: QuotesActionTypes.RESET_QUOTES_STATE
  };
}
function clearQuotesError() {
  return {
    type: QuotesActionTypes.CLEAR_QUOTES_ERROR
  };
}
var QuotesAsyncActionTypes = {
  /** Fetch quotes list */
  FETCH_QUOTES: "quotes/fetch",
  /** Fetch single quote details */
  FETCH_QUOTE_DETAIL: "quotes/fetchDetail",
  /** Create new quote */
  CREATE_QUOTE: "quotes/create",
  /** Update existing quote */
  UPDATE_QUOTE: "quotes/update",
  /** Submit quote for review */
  SUBMIT_QUOTE: "quotes/submit",
  /** Accept a quote */
  ACCEPT_QUOTE: "quotes/accept",
  /** Reject a quote */
  REJECT_QUOTE: "quotes/reject",
  /** Cancel a quote */
  CANCEL_QUOTE: "quotes/cancel",
  /** Convert quote to order */
  CONVERT_QUOTE: "quotes/convert"
};

// src/actions/approvals.actions.ts
function fetchApprovalsStart() {
  return {
    type: ApprovalsActionTypes.FETCH_APPROVALS_START
  };
}
function fetchApprovalsSuccess(approvals, pagination) {
  return {
    type: ApprovalsActionTypes.FETCH_APPROVALS_SUCCESS,
    payload: {
      approvals,
      pagination
    }
  };
}
function fetchApprovalsFailure(error) {
  return {
    type: ApprovalsActionTypes.FETCH_APPROVALS_FAILURE,
    payload: {
      error
    }
  };
}
function fetchPendingStart() {
  return {
    type: ApprovalsActionTypes.FETCH_PENDING_START
  };
}
function fetchPendingSuccess(approvals, count) {
  return {
    type: ApprovalsActionTypes.FETCH_PENDING_SUCCESS,
    payload: {
      approvals,
      count
    }
  };
}
function fetchPendingFailure(error) {
  return {
    type: ApprovalsActionTypes.FETCH_PENDING_FAILURE,
    payload: {
      error
    }
  };
}
function fetchApprovalDetailStart() {
  return {
    type: ApprovalsActionTypes.FETCH_APPROVAL_DETAIL_START
  };
}
function fetchApprovalDetailSuccess(approval) {
  return {
    type: ApprovalsActionTypes.FETCH_APPROVAL_DETAIL_SUCCESS,
    payload: {
      approval
    }
  };
}
function fetchApprovalDetailFailure(error) {
  return {
    type: ApprovalsActionTypes.FETCH_APPROVAL_DETAIL_FAILURE,
    payload: {
      error
    }
  };
}
function selectApproval(approvalId) {
  return {
    type: ApprovalsActionTypes.SELECT_APPROVAL,
    payload: {
      approvalId
    }
  };
}
function clearSelectedApproval() {
  return {
    type: ApprovalsActionTypes.CLEAR_SELECTED_APPROVAL
  };
}
function setApprovalFilters(filters) {
  return {
    type: ApprovalsActionTypes.SET_APPROVAL_FILTERS,
    payload: {
      filters
    }
  };
}
function setApprovalStatusFilter(status) {
  return {
    type: ApprovalsActionTypes.SET_APPROVAL_STATUS_FILTER,
    payload: {
      status
    }
  };
}
function clearApprovalFilters() {
  return {
    type: ApprovalsActionTypes.CLEAR_APPROVAL_FILTERS
  };
}
function setApprovalsPagination(pagination) {
  return {
    type: ApprovalsActionTypes.SET_APPROVALS_PAGINATION,
    payload: {
      pagination
    }
  };
}
function setApprovalsPage(page) {
  return {
    type: ApprovalsActionTypes.SET_APPROVALS_PAGE,
    payload: {
      page
    }
  };
}
function approvalActionSuccess(approvalId, action, updatedApproval) {
  return {
    type: ApprovalsActionTypes.APPROVAL_ACTION_SUCCESS,
    payload: {
      approvalId,
      action,
      updatedApproval
    }
  };
}
function updatePendingCount(count) {
  return {
    type: ApprovalsActionTypes.UPDATE_PENDING_COUNT,
    payload: {
      count
    }
  };
}
function resetApprovalsState() {
  return {
    type: ApprovalsActionTypes.RESET_APPROVALS_STATE
  };
}
function clearApprovalsError() {
  return {
    type: ApprovalsActionTypes.CLEAR_APPROVALS_ERROR
  };
}
var ApprovalsAsyncActionTypes = {
  /** Fetch all approvals */
  FETCH_APPROVALS: "approvals/fetch",
  /** Fetch pending approvals */
  FETCH_PENDING: "approvals/fetchPending",
  /** Fetch single approval details */
  FETCH_APPROVAL_DETAIL: "approvals/fetchDetail",
  /** Approve a request */
  APPROVE: "approvals/approve",
  /** Reject a request */
  REJECT: "approvals/reject",
  /** Escalate a request */
  ESCALATE: "approvals/escalate",
  /** Delegate a request */
  DELEGATE: "approvals/delegate",
  /** Request more info */
  REQUEST_INFO: "approvals/requestInfo"
};

// src/actions/cart-b2b.actions.ts
function addItem(item) {
  return {
    type: CartB2BActionTypes.ADD_ITEM,
    payload: {
      item
    }
  };
}
function updateItemQuantity(productId, quantity) {
  return {
    type: CartB2BActionTypes.UPDATE_ITEM_QUANTITY,
    payload: {
      productId,
      quantity
    }
  };
}
function removeItem(productId) {
  return {
    type: CartB2BActionTypes.REMOVE_ITEM,
    payload: {
      productId
    }
  };
}
function updateItemNotes(productId, notes) {
  return {
    type: CartB2BActionTypes.UPDATE_ITEM_NOTES,
    payload: {
      productId,
      notes
    }
  };
}
function clearCart() {
  return {
    type: CartB2BActionTypes.CLEAR_CART
  };
}
function addItemsBulk(items) {
  return {
    type: CartB2BActionTypes.ADD_ITEMS_BULK,
    payload: {
      items
    }
  };
}
function setShippingAddress(addressId) {
  return {
    type: CartB2BActionTypes.SET_SHIPPING_ADDRESS,
    payload: {
      addressId
    }
  };
}
function setPurchaseOrderNumber(poNumber) {
  return {
    type: CartB2BActionTypes.SET_PURCHASE_ORDER_NUMBER,
    payload: {
      poNumber
    }
  };
}
function setCartNotes(notes) {
  return {
    type: CartB2BActionTypes.SET_NOTES,
    payload: {
      notes
    }
  };
}
function updateTotals(totals) {
  return {
    type: CartB2BActionTypes.UPDATE_TOTALS,
    payload: {
      totals
    }
  };
}
function updateSpendingValidation(validation, limits) {
  return {
    type: CartB2BActionTypes.UPDATE_SPENDING_VALIDATION,
    payload: {
      validation,
      limits
    }
  };
}
function cartLoadingStart() {
  return {
    type: CartB2BActionTypes.CART_LOADING_START
  };
}
function cartLoadingSuccess() {
  return {
    type: CartB2BActionTypes.CART_LOADING_SUCCESS
  };
}
function cartLoadingFailure(error) {
  return {
    type: CartB2BActionTypes.CART_LOADING_FAILURE,
    payload: {
      error
    }
  };
}
function hydrateCart(items, shippingAddressId, purchaseOrderNumber, notes) {
  return {
    type: CartB2BActionTypes.HYDRATE_CART,
    payload: {
      items,
      shippingAddressId,
      purchaseOrderNumber,
      notes
    }
  };
}
function resetCartState() {
  return {
    type: CartB2BActionTypes.RESET_CART_STATE
  };
}
function clearCartError() {
  return {
    type: CartB2BActionTypes.CLEAR_CART_ERROR
  };
}
var CartB2BAsyncActionTypes = {
  /** Validate cart with server */
  VALIDATE_CART: "cartB2B/validate",
  /** Calculate totals with server (discounts, tax, shipping) */
  CALCULATE_TOTALS: "cartB2B/calculateTotals",
  /** Validate spending limits */
  VALIDATE_SPENDING: "cartB2B/validateSpending",
  /** Submit cart as order */
  SUBMIT_ORDER: "cartB2B/submitOrder",
  /** Convert cart to quote request */
  REQUEST_QUOTE: "cartB2B/requestQuote",
  /** Sync cart with server */
  SYNC_CART: "cartB2B/sync",
  /** Load cart from server */
  LOAD_CART: "cartB2B/load"
};

export { ApprovalsActionTypes, ApprovalsAsyncActionTypes, CartB2BActionTypes, CartB2BAsyncActionTypes, CompanyActionTypes, CompanyAsyncActionTypes, QuotesActionTypes, QuotesAsyncActionTypes, addItem, addItemsBulk, approvalActionSuccess, approvalsReducer, cartB2BReducer, cartLoadingFailure, cartLoadingStart, cartLoadingSuccess, clearApprovalFilters, clearApprovalsError, clearCart, clearCartError, clearCompanyError, clearQuoteFilters, clearQuotesError, clearSelectedApproval, clearSelectedQuote, companyReducer, createDerivedSelector, createDerivedShallowSelector, createParameterizedSelector, createQuoteSuccess, createSelector, createShallowEqualSelector, fetchApprovalDetailFailure, fetchApprovalDetailStart, fetchApprovalDetailSuccess, fetchApprovalsFailure, fetchApprovalsStart, fetchApprovalsSuccess, fetchCompanyFailure, fetchCompanyStart, fetchCompanySuccess, fetchPendingFailure, fetchPendingStart, fetchPendingSuccess, fetchQuoteDetailFailure, fetchQuoteDetailStart, fetchQuoteDetailSuccess, fetchQuotesFailure, fetchQuotesStart, fetchQuotesSuccess, hydrateCart, initialApprovalsState, initialCartB2BState, initialCartTotals, initialCompanyState, initialPaginationState, initialQuotesState, initialRootState, initialSpendingValidation, loadEmployees, quotesReducer, reducers, removeItem, resetApprovalsState, resetCartState, resetCompanyState, resetQuotesState, rootReducer, selectActiveStatusFilter, selectAllApprovals, selectAllQuantitiesValid, selectApplicableSpendingLimits, selectApproval, selectApprovalById, selectApprovalCount, selectApprovalCountsByStatus, selectApprovalDetailStatus, selectApprovalFilters, selectApprovalReason, selectApprovalStatusFilter, selectApprovalsByEntityType, selectApprovalsByStatus, selectApprovalsCurrentPage, selectApprovalsError, selectApprovalsListStatus, selectApprovalsPagination, selectApprovalsState, selectApprovalsTotalCount, selectApproverEmployees, selectAverageItemPrice, selectCanAcceptSelectedQuote, selectCanActionSelectedApproval, selectCanApproveOrders, selectCanCheckout, selectCanCreateOrders, selectCanCreateQuotes, selectCanEditSelectedQuote, selectCartB2BState, selectCartCurrency, selectCartError, selectCartForPersistence, selectCartItemByProductId, selectCartItemCount, selectCartItemQuantity, selectCartItems, selectCartLastUpdated, selectCartNotes, selectCartPurchaseOrderNumber, selectCartShippingAddressId, selectCartShippingEstimate, selectCartStatus, selectCartSubtotal, selectCartTax, selectCartTierDiscount, selectCartTotal, selectCartTotalDiscount, selectCartTotalQuantity, selectCartTotals, selectCartUniqueItemCount, selectCartVolumeDiscount, selectCheckoutBlockedReason, selectCheckoutSummary, selectCompanyAddresses, selectCompanyAvailableCredit, selectCompanyCreditLimit, selectCompanyCreditUsagePercent, selectCompanyError, selectCompanyLastRefreshed, selectCompanyPaymentTerms, selectCompanyState, selectCompanyStatus, selectCurrentCompany, selectCurrentCompanyId, selectCurrentCompanyName, selectCurrentCompanyTier, selectCurrentEmployee, selectCurrentEmployeeId, selectCurrentEmployeeName, selectCurrentEmployeePermissions, selectCurrentEmployeeRole, selectDefaultBillingAddressId, selectDefaultShippingAddressId, selectEmployeeApprovalLimit, selectEmployeeById, selectEmployeeCount, selectEmployeeCurrentSpending, selectEmployeeSpendingLimits, selectEmployees, selectExpiringQuotes, selectFilteredQuotes, selectHasPendingApprovals, selectHasPermission, selectHasQuotes, selectHasSpendingWarnings, selectHighPriorityApprovals, selectInvalidQuantityItems, selectIsApprovalDetailLoading, selectIsApprovalsLoading, selectIsApprover, selectIsB2BActive, selectIsCartEmpty, selectIsCartLoading, selectIsCompanyLoading, selectIsProductInCart, selectIsQuoteDetailLoading, selectIsQuotesLoading, selectIsSelectedApprovalOverdue, selectIsWithinSpendingLimits, selectOverdueApprovalCount, selectOverdueApprovals, selectPendingApprovalCount, selectPendingApprovals, selectPendingApprovalsTotalValue, selectPendingOrderApprovals, selectPendingQuoteApprovals, selectQuote, selectQuoteById, selectQuoteCountByStatus, selectQuoteDetailStatus, selectQuoteFilters, selectQuoteSearchQuery, selectQuotes, selectQuotesByStatus, selectQuotesCurrentPage, selectQuotesError, selectQuotesHasNextPage, selectQuotesHasPreviousPage, selectQuotesListStatus, selectQuotesPagination, selectQuotesState, selectQuotesTotalCount, selectQuotesTotalValue, selectQuotesWithUnreadMessages, selectRequiresApproval, selectRequiresOrderApproval, selectSelectedApproval, selectSelectedApprovalCurrentLevel, selectSelectedApprovalId, selectSelectedApprovalStatus, selectSelectedApprovalSteps, selectSelectedQuote, selectSelectedQuoteId, selectSelectedQuoteItems, selectSelectedQuoteStatus, selectSelectedQuoteTotals, selectSpendingValidation, selectSpendingWarnings, selectUnreadQuotesCount, setApprovalFilters, setApprovalStatusFilter, setApprovalsPage, setApprovalsPagination, setCartNotes, setCurrentCompany, setCurrentEmployee, setPurchaseOrderNumber, setQuoteFilters, setQuoteSearch, setQuoteStatusFilter, setQuotesPage, setQuotesPagination, setShippingAddress, updateItemNotes, updateItemQuantity, updatePendingCount, updateQuoteSuccess, updateSpendingValidation, updateTotals };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map