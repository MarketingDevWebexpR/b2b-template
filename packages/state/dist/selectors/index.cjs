'use strict';

// src/utils/memoize.ts
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

exports.selectActiveStatusFilter = selectActiveStatusFilter;
exports.selectAllApprovals = selectAllApprovals;
exports.selectAllQuantitiesValid = selectAllQuantitiesValid;
exports.selectApplicableSpendingLimits = selectApplicableSpendingLimits;
exports.selectApprovalById = selectApprovalById;
exports.selectApprovalCount = selectApprovalCount;
exports.selectApprovalCountsByStatus = selectApprovalCountsByStatus;
exports.selectApprovalDetailStatus = selectApprovalDetailStatus;
exports.selectApprovalFilters = selectApprovalFilters;
exports.selectApprovalReason = selectApprovalReason;
exports.selectApprovalStatusFilter = selectApprovalStatusFilter;
exports.selectApprovalsByEntityType = selectApprovalsByEntityType;
exports.selectApprovalsByStatus = selectApprovalsByStatus;
exports.selectApprovalsCurrentPage = selectApprovalsCurrentPage;
exports.selectApprovalsError = selectApprovalsError;
exports.selectApprovalsListStatus = selectApprovalsListStatus;
exports.selectApprovalsPagination = selectApprovalsPagination;
exports.selectApprovalsState = selectApprovalsState;
exports.selectApprovalsTotalCount = selectApprovalsTotalCount;
exports.selectApproverEmployees = selectApproverEmployees;
exports.selectAverageItemPrice = selectAverageItemPrice;
exports.selectCanAcceptSelectedQuote = selectCanAcceptSelectedQuote;
exports.selectCanActionSelectedApproval = selectCanActionSelectedApproval;
exports.selectCanApproveOrders = selectCanApproveOrders;
exports.selectCanCheckout = selectCanCheckout;
exports.selectCanCreateOrders = selectCanCreateOrders;
exports.selectCanCreateQuotes = selectCanCreateQuotes;
exports.selectCanEditSelectedQuote = selectCanEditSelectedQuote;
exports.selectCartB2BState = selectCartB2BState;
exports.selectCartCurrency = selectCartCurrency;
exports.selectCartError = selectCartError;
exports.selectCartForPersistence = selectCartForPersistence;
exports.selectCartItemByProductId = selectCartItemByProductId;
exports.selectCartItemCount = selectCartItemCount;
exports.selectCartItemQuantity = selectCartItemQuantity;
exports.selectCartItems = selectCartItems;
exports.selectCartLastUpdated = selectCartLastUpdated;
exports.selectCartNotes = selectCartNotes;
exports.selectCartPurchaseOrderNumber = selectCartPurchaseOrderNumber;
exports.selectCartShippingAddressId = selectCartShippingAddressId;
exports.selectCartShippingEstimate = selectCartShippingEstimate;
exports.selectCartStatus = selectCartStatus;
exports.selectCartSubtotal = selectCartSubtotal;
exports.selectCartTax = selectCartTax;
exports.selectCartTierDiscount = selectCartTierDiscount;
exports.selectCartTotal = selectCartTotal;
exports.selectCartTotalDiscount = selectCartTotalDiscount;
exports.selectCartTotalQuantity = selectCartTotalQuantity;
exports.selectCartTotals = selectCartTotals;
exports.selectCartUniqueItemCount = selectCartUniqueItemCount;
exports.selectCartVolumeDiscount = selectCartVolumeDiscount;
exports.selectCheckoutBlockedReason = selectCheckoutBlockedReason;
exports.selectCheckoutSummary = selectCheckoutSummary;
exports.selectCompanyAddresses = selectCompanyAddresses;
exports.selectCompanyAvailableCredit = selectCompanyAvailableCredit;
exports.selectCompanyCreditLimit = selectCompanyCreditLimit;
exports.selectCompanyCreditUsagePercent = selectCompanyCreditUsagePercent;
exports.selectCompanyError = selectCompanyError;
exports.selectCompanyLastRefreshed = selectCompanyLastRefreshed;
exports.selectCompanyPaymentTerms = selectCompanyPaymentTerms;
exports.selectCompanyState = selectCompanyState;
exports.selectCompanyStatus = selectCompanyStatus;
exports.selectCurrentCompany = selectCurrentCompany;
exports.selectCurrentCompanyId = selectCurrentCompanyId;
exports.selectCurrentCompanyName = selectCurrentCompanyName;
exports.selectCurrentCompanyTier = selectCurrentCompanyTier;
exports.selectCurrentEmployee = selectCurrentEmployee;
exports.selectCurrentEmployeeId = selectCurrentEmployeeId;
exports.selectCurrentEmployeeName = selectCurrentEmployeeName;
exports.selectCurrentEmployeePermissions = selectCurrentEmployeePermissions;
exports.selectCurrentEmployeeRole = selectCurrentEmployeeRole;
exports.selectDefaultBillingAddressId = selectDefaultBillingAddressId;
exports.selectDefaultShippingAddressId = selectDefaultShippingAddressId;
exports.selectEmployeeApprovalLimit = selectEmployeeApprovalLimit;
exports.selectEmployeeById = selectEmployeeById;
exports.selectEmployeeCount = selectEmployeeCount;
exports.selectEmployeeCurrentSpending = selectEmployeeCurrentSpending;
exports.selectEmployeeSpendingLimits = selectEmployeeSpendingLimits;
exports.selectEmployees = selectEmployees;
exports.selectExpiringQuotes = selectExpiringQuotes;
exports.selectFilteredQuotes = selectFilteredQuotes;
exports.selectHasPendingApprovals = selectHasPendingApprovals;
exports.selectHasPermission = selectHasPermission;
exports.selectHasQuotes = selectHasQuotes;
exports.selectHasSpendingWarnings = selectHasSpendingWarnings;
exports.selectHighPriorityApprovals = selectHighPriorityApprovals;
exports.selectInvalidQuantityItems = selectInvalidQuantityItems;
exports.selectIsApprovalDetailLoading = selectIsApprovalDetailLoading;
exports.selectIsApprovalsLoading = selectIsApprovalsLoading;
exports.selectIsApprover = selectIsApprover;
exports.selectIsB2BActive = selectIsB2BActive;
exports.selectIsCartEmpty = selectIsCartEmpty;
exports.selectIsCartLoading = selectIsCartLoading;
exports.selectIsCompanyLoading = selectIsCompanyLoading;
exports.selectIsProductInCart = selectIsProductInCart;
exports.selectIsQuoteDetailLoading = selectIsQuoteDetailLoading;
exports.selectIsQuotesLoading = selectIsQuotesLoading;
exports.selectIsSelectedApprovalOverdue = selectIsSelectedApprovalOverdue;
exports.selectIsWithinSpendingLimits = selectIsWithinSpendingLimits;
exports.selectOverdueApprovalCount = selectOverdueApprovalCount;
exports.selectOverdueApprovals = selectOverdueApprovals;
exports.selectPendingApprovalCount = selectPendingApprovalCount;
exports.selectPendingApprovals = selectPendingApprovals;
exports.selectPendingApprovalsTotalValue = selectPendingApprovalsTotalValue;
exports.selectPendingOrderApprovals = selectPendingOrderApprovals;
exports.selectPendingQuoteApprovals = selectPendingQuoteApprovals;
exports.selectQuoteById = selectQuoteById;
exports.selectQuoteCountByStatus = selectQuoteCountByStatus;
exports.selectQuoteDetailStatus = selectQuoteDetailStatus;
exports.selectQuoteFilters = selectQuoteFilters;
exports.selectQuoteSearchQuery = selectQuoteSearchQuery;
exports.selectQuotes = selectQuotes;
exports.selectQuotesByStatus = selectQuotesByStatus;
exports.selectQuotesCurrentPage = selectQuotesCurrentPage;
exports.selectQuotesError = selectQuotesError;
exports.selectQuotesHasNextPage = selectQuotesHasNextPage;
exports.selectQuotesHasPreviousPage = selectQuotesHasPreviousPage;
exports.selectQuotesListStatus = selectQuotesListStatus;
exports.selectQuotesPagination = selectQuotesPagination;
exports.selectQuotesState = selectQuotesState;
exports.selectQuotesTotalCount = selectQuotesTotalCount;
exports.selectQuotesTotalValue = selectQuotesTotalValue;
exports.selectQuotesWithUnreadMessages = selectQuotesWithUnreadMessages;
exports.selectRequiresApproval = selectRequiresApproval;
exports.selectRequiresOrderApproval = selectRequiresOrderApproval;
exports.selectSelectedApproval = selectSelectedApproval;
exports.selectSelectedApprovalCurrentLevel = selectSelectedApprovalCurrentLevel;
exports.selectSelectedApprovalId = selectSelectedApprovalId;
exports.selectSelectedApprovalStatus = selectSelectedApprovalStatus;
exports.selectSelectedApprovalSteps = selectSelectedApprovalSteps;
exports.selectSelectedQuote = selectSelectedQuote;
exports.selectSelectedQuoteId = selectSelectedQuoteId;
exports.selectSelectedQuoteItems = selectSelectedQuoteItems;
exports.selectSelectedQuoteStatus = selectSelectedQuoteStatus;
exports.selectSelectedQuoteTotals = selectSelectedQuoteTotals;
exports.selectSpendingValidation = selectSpendingValidation;
exports.selectSpendingWarnings = selectSpendingWarnings;
exports.selectUnreadQuotesCount = selectUnreadQuotesCount;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map