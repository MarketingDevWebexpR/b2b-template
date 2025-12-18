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

// src/b2b/index.ts
var b2b_exports = {};
__export(b2b_exports, {
  useApprovals: () => useApprovals,
  useCompany: () => useCompany,
  useQuotes: () => useQuotes,
  useSpendingLimits: () => useSpendingLimits
});
module.exports = __toCommonJS(b2b_exports);

// src/b2b/useCompany.ts
var import_react = require("react");
function useCompany(api, options = {}) {
  const { companyId, includeEmployees = false, refreshInterval } = options;
  const [state, setState] = (0, import_react.useState)({
    company: null,
    employee: null,
    isLoading: false,
    error: null,
    isB2BActive: false
  });
  const [employees, setEmployees] = (0, import_react.useState)([]);
  const fetchCompany = (0, import_react.useCallback)(
    async (id) => {
      const targetId = id ?? companyId;
      if (!targetId || !api?.b2b?.companies) {
        return;
      }
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const company = await api.b2b.companies.get(targetId);
        const b2bContext = api.getB2BContext?.();
        let employee = null;
        if (b2bContext?.employeeId) {
          try {
            employee = await api.b2b.employees.get(b2bContext.employeeId);
          } catch {
          }
        }
        if (includeEmployees) {
          const employeeList = await api.b2b.employees.list({ companyId: targetId });
          setEmployees([...employeeList.items]);
        }
        setState({
          company,
          employee,
          isLoading: false,
          error: null,
          isB2BActive: true
        });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err : new Error(String(err))
        }));
      }
    },
    [api, companyId, includeEmployees]
  );
  const setCompany = (0, import_react.useCallback)(
    async (newCompanyId) => {
      api?.setB2BContext?.(newCompanyId);
      await fetchCompany(newCompanyId);
    },
    [api, fetchCompany]
  );
  const clearCompany = (0, import_react.useCallback)(() => {
    api?.clearB2BContext?.();
    setState({
      company: null,
      employee: null,
      isLoading: false,
      error: null,
      isB2BActive: false
    });
    setEmployees([]);
  }, [api]);
  const refresh = (0, import_react.useCallback)(async () => {
    const context = api?.getB2BContext?.();
    if (context?.companyId) {
      await fetchCompany(context.companyId);
    }
  }, [api, fetchCompany]);
  const canPerform = (0, import_react.useCallback)(
    (action) => {
      if (!state.isB2BActive || !state.employee) {
        return false;
      }
      const permissions = state.employee.permissions ?? [];
      const role = state.employee.role;
      if (role === "owner" || role === "admin") {
        return true;
      }
      switch (action) {
        case "create_quote":
          return permissions.includes("quotes.create") || role === "purchaser";
        case "approve_order":
          return permissions.includes("orders.approve") || role === "manager";
        case "manage_employees":
          return permissions.includes("company.manage_employees");
        case "view_spending":
          return permissions.includes("spending.view_reports") || role !== "viewer";
        case "edit_company":
          return permissions.includes("company.edit");
        case "place_order":
          return permissions.includes("orders.create") || role === "purchaser" || role === "manager";
        default:
          return false;
      }
    },
    [state.isB2BActive, state.employee]
  );
  (0, import_react.useEffect)(() => {
    const context = api?.getB2BContext?.();
    if (context?.companyId || companyId) {
      fetchCompany(context?.companyId ?? companyId);
    }
  }, [api, companyId]);
  (0, import_react.useEffect)(() => {
    if (!refreshInterval || !state.isB2BActive) return;
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, state.isB2BActive, refresh]);
  return {
    ...state,
    employees,
    setCompany,
    clearCompany,
    refresh,
    canPerform
  };
}

// src/b2b/useQuotes.ts
var import_react5 = require("react");

// src/api/useApiQuery.ts
var import_react3 = require("react");

// src/api/QueryCacheContext.tsx
var import_react2 = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var QueryCacheContext = (0, import_react2.createContext)(null);
var clientFallbackCache = null;
function getClientFallbackCache() {
  if (!clientFallbackCache) {
    clientFallbackCache = /* @__PURE__ */ new Map();
  }
  return clientFallbackCache;
}
function createCacheOperations(cacheRef) {
  const getFromCache = function(key, staleTime) {
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < staleTime) {
      return cached.data;
    }
    return null;
  };
  const hasValidCache = function(key, cacheTime) {
    const cached = cacheRef.current.get(key);
    return cached !== void 0 && Date.now() - cached.timestamp < cacheTime;
  };
  const getCachedData = function(key) {
    const cached = cacheRef.current.get(key);
    return cached ? cached.data : null;
  };
  const setInCache = function(key, data) {
    cacheRef.current.set(key, { data, timestamp: Date.now() });
  };
  const invalidate = function(key) {
    cacheRef.current.delete(key);
  };
  const invalidateByPrefix = function(prefix) {
    const keysToDelete = [];
    cacheRef.current.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => cacheRef.current.delete(key));
  };
  const invalidateAll = function() {
    cacheRef.current.clear();
  };
  return {
    getFromCache,
    hasValidCache,
    getCachedData,
    setInCache,
    invalidate,
    invalidateByPrefix,
    invalidateAll
  };
}
function useQueryCache() {
  const context = (0, import_react2.useContext)(QueryCacheContext);
  const fallbackRef = (0, import_react2.useRef)(null);
  const fallbackValue = (0, import_react2.useMemo)(() => {
    if (typeof window === "undefined") {
      return null;
    }
    if (!fallbackRef.current) {
      fallbackRef.current = getClientFallbackCache();
    }
    return createCacheOperations(
      fallbackRef
    );
  }, []);
  if (context) {
    return context;
  }
  if (typeof window === "undefined") {
    throw new Error(
      "QueryCacheProvider is required for SSR. Wrap your application with <QueryCacheProvider> to enable request-scoped caching."
    );
  }
  if (fallbackValue) {
    return fallbackValue;
  }
  throw new Error("Failed to initialize query cache");
}

// src/api/useApiQuery.ts
function useApiQuery(queryKey, queryFn, options = {}) {
  const {
    enabled = true,
    initialData,
    staleTime = 0,
    cacheTime = 5 * 60 * 1e3,
    retryCount = 3,
    retryDelay = 1e3,
    onSuccess,
    onError,
    refetchOnWindowFocus = false
  } = options;
  const cache = useQueryCache();
  const cacheKey = JSON.stringify(queryKey);
  const retryCountRef = (0, import_react3.useRef)(0);
  const retryTimeoutRef = (0, import_react3.useRef)(null);
  const abortControllerRef = (0, import_react3.useRef)(null);
  const isMountedRef = (0, import_react3.useRef)(true);
  const [state, setState] = (0, import_react3.useState)(() => {
    if (cache.hasValidCache(cacheKey, cacheTime)) {
      const cachedData = cache.getCachedData(cacheKey);
      if (cachedData !== null) {
        return {
          data: cachedData,
          isLoading: false,
          error: null,
          isSuccess: true,
          isFetching: false
        };
      }
    }
    return {
      data: initialData ?? null,
      isLoading: enabled,
      error: null,
      isSuccess: false,
      isFetching: enabled
    };
  });
  const fetchData = (0, import_react3.useCallback)(
    async (isRefetch = false) => {
      if (!isRefetch) {
        const cachedData = cache.getFromCache(cacheKey, staleTime);
        if (cachedData !== null) {
          setState((prev) => ({
            ...prev,
            data: cachedData,
            isLoading: false,
            isSuccess: true,
            isFetching: false
          }));
          return;
        }
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      setState((prev) => ({
        ...prev,
        isLoading: !prev.data,
        isFetching: true,
        error: null
      }));
      try {
        const data = await queryFn({ signal });
        if (!isMountedRef.current || signal.aborted) return;
        cache.setInCache(cacheKey, data);
        setState({
          data,
          isLoading: false,
          error: null,
          isSuccess: true,
          isFetching: false
        });
        retryCountRef.current = 0;
        onSuccess?.(data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        if (!isMountedRef.current) return;
        const error = err instanceof Error ? err : new Error(String(err));
        if (retryCountRef.current < retryCount) {
          retryCountRef.current++;
          retryTimeoutRef.current = setTimeout(
            () => fetchData(isRefetch),
            retryDelay * retryCountRef.current
          );
          return;
        }
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error,
          isFetching: false
        }));
        retryCountRef.current = 0;
        onError?.(error);
      }
    },
    [cacheKey, queryFn, staleTime, retryCount, retryDelay, onSuccess, onError, cache]
  );
  const refetch = (0, import_react3.useCallback)(async () => {
    retryCountRef.current = 0;
    await fetchData(true);
  }, [fetchData]);
  const reset = (0, import_react3.useCallback)(() => {
    cache.invalidate(cacheKey);
    setState({
      data: initialData ?? null,
      isLoading: false,
      error: null,
      isSuccess: false,
      isFetching: false
    });
  }, [cacheKey, initialData, cache]);
  (0, import_react3.useEffect)(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      abortControllerRef.current?.abort();
    };
  }, []);
  (0, import_react3.useEffect)(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, cacheKey]);
  (0, import_react3.useEffect)(() => {
    if (!refetchOnWindowFocus || !enabled || typeof window === "undefined") {
      return;
    }
    const handleFocus = () => {
      const cachedData = cache.getFromCache(cacheKey, staleTime);
      if (cachedData === null) {
        fetchData(true);
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetchOnWindowFocus, enabled, cacheKey, staleTime, fetchData, cache]);
  return {
    ...state,
    refetch,
    reset
  };
}
function invalidateQueries(_queryKey) {
  console.warn(
    "invalidateQueries() is deprecated. Use useInvalidateQueries().invalidate(queryKey) instead."
  );
}

// src/api/useApiMutation.ts
var import_react4 = require("react");
function useApiMutation(mutationFn, options = {}) {
  const {
    onSuccess,
    onError,
    onSettled,
    invalidateKeys = [],
    retryCount = 0
  } = options;
  const [state, setState] = (0, import_react4.useState)({
    data: null,
    isLoading: false,
    error: null,
    isSuccess: false,
    isError: false
  });
  const reset = (0, import_react4.useCallback)(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false,
      isError: false
    });
  }, []);
  const mutateAsync = (0, import_react4.useCallback)(
    async (variables) => {
      setState({
        data: null,
        isLoading: true,
        error: null,
        isSuccess: false,
        isError: false
      });
      let lastError = null;
      let attempts = 0;
      while (attempts <= retryCount) {
        try {
          const data = await mutationFn(variables);
          setState({
            data,
            isLoading: false,
            error: null,
            isSuccess: true,
            isError: false
          });
          for (const key of invalidateKeys) {
            invalidateQueries(key);
          }
          onSuccess?.(data, variables);
          onSettled?.(data, null, variables);
          return data;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          attempts++;
          if (attempts > retryCount) {
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 1e3 * attempts));
        }
      }
      setState({
        data: null,
        isLoading: false,
        error: lastError,
        isSuccess: false,
        isError: true
      });
      onError?.(lastError, variables);
      onSettled?.(null, lastError, variables);
      throw lastError;
    },
    [mutationFn, retryCount, invalidateKeys, onSuccess, onError, onSettled]
  );
  const mutate = (0, import_react4.useCallback)(
    (variables) => {
      mutateAsync(variables).catch(() => {
      });
    },
    [mutateAsync]
  );
  return {
    ...state,
    mutate,
    mutateAsync,
    reset
  };
}

// src/b2b/useQuotes.ts
function useQuotes(api, initialFilters = {}) {
  const [filters, setFilters] = (0, import_react5.useState)(initialFilters);
  const {
    data: quotes,
    isLoading,
    error,
    refetch
  } = useApiQuery(
    ["quotes", filters],
    async () => {
      if (!api?.b2b?.quotes) {
        return [];
      }
      const result = await api.b2b.quotes.list(filters);
      const resultAny = result;
      const items = resultAny.items ?? resultAny;
      return Array.isArray(items) ? [...items] : [];
    },
    {
      enabled: !!api?.b2b?.quotes,
      staleTime: 3e4
      // 30 seconds
    }
  );
  const createMutation = useApiMutation(
    async (input) => {
      if (!api?.b2b?.quotes) {
        throw new Error("B2B quotes not available");
      }
      return api.b2b.quotes.createFromCart(input.cartId, input);
    },
    {
      invalidateKeys: [["quotes"]]
    }
  );
  const submitMutation = useApiMutation(
    async (quoteId) => {
      if (!api?.b2b?.quotes) {
        throw new Error("B2B quotes not available");
      }
      return api.b2b.quotes.submit(quoteId);
    },
    {
      invalidateKeys: [["quotes"]]
    }
  );
  const acceptMutation = useApiMutation(
    async (quoteId) => {
      if (!api?.b2b?.quotes) {
        throw new Error("B2B quotes not available");
      }
      return api.b2b.quotes.accept(quoteId);
    },
    {
      invalidateKeys: [["quotes"]]
    }
  );
  const rejectMutation = useApiMutation(
    async ({ quoteId, reason }) => {
      if (!api?.b2b?.quotes) {
        throw new Error("B2B quotes not available");
      }
      return api.b2b.quotes.reject(quoteId, reason);
    },
    {
      invalidateKeys: [["quotes"]]
    }
  );
  const respondMutation = useApiMutation(
    async ({ quoteId, input }) => {
      if (!api?.b2b?.quotes) {
        throw new Error("B2B quotes not available");
      }
      const quotesApi = api.b2b.quotes;
      if (!quotesApi.respond) {
        throw new Error("Quote respond method not available");
      }
      return quotesApi.respond(quoteId, input);
    },
    {
      invalidateKeys: [["quotes"]]
    }
  );
  const convertMutation = useApiMutation(
    async (quoteId) => {
      if (!api?.b2b?.quotes) {
        throw new Error("B2B quotes not available");
      }
      return api.b2b.quotes.convertToOrder(quoteId);
    },
    {
      invalidateKeys: [["quotes"], ["orders"]]
    }
  );
  const deleteMutation = useApiMutation(
    async (quoteId) => {
      if (!api?.b2b?.quotes) {
        throw new Error("B2B quotes not available");
      }
      return api.b2b.quotes.delete(quoteId);
    },
    {
      invalidateKeys: [["quotes"]]
    }
  );
  const getQuote = (0, import_react5.useCallback)(
    async (quoteId) => {
      if (!api?.b2b?.quotes) {
        throw new Error("B2B quotes not available");
      }
      return api.b2b.quotes.get(quoteId);
    },
    [api]
  );
  const fetchQuotes = (0, import_react5.useCallback)(
    (newFilters) => {
      if (newFilters) {
        setFilters(newFilters);
      }
      invalidateQueries(["quotes", newFilters ?? filters]);
      refetch();
    },
    [filters, refetch]
  );
  return {
    quotes: quotes ?? [],
    isLoading,
    error,
    filters,
    setFilters,
    fetchQuotes,
    getQuote,
    createFromCart: createMutation.mutateAsync,
    submitQuote: submitMutation.mutateAsync,
    acceptQuote: acceptMutation.mutateAsync,
    rejectQuote: (quoteId, reason) => rejectMutation.mutateAsync({ quoteId, reason }),
    respondToQuote: (quoteId, input) => respondMutation.mutateAsync({ quoteId, input }),
    convertToOrder: convertMutation.mutateAsync,
    deleteQuote: deleteMutation.mutateAsync,
    refresh: refetch
  };
}

// src/b2b/useApprovals.ts
var import_react6 = require("react");
function useApprovals(api, initialFilters = {}) {
  const [filters, setFilters] = (0, import_react6.useState)(initialFilters);
  const {
    data: approvals,
    isLoading,
    error,
    refetch
  } = useApiQuery(
    ["approvals", filters],
    async () => {
      if (!api?.b2b?.approvals) {
        return [];
      }
      const result = await api.b2b.approvals.list(filters);
      const resultAny = result;
      const items = resultAny.items ?? resultAny;
      return Array.isArray(items) ? [...items] : [];
    },
    {
      enabled: !!api?.b2b?.approvals,
      staleTime: 15e3
      // 15 seconds - approvals need fresher data
    }
  );
  const pendingCount = (approvals ?? []).filter(
    (a) => a.status === "pending"
  ).length;
  const approveMutation = useApiMutation(
    async ({ approvalId, comment }) => {
      if (!api?.b2b?.approvals) {
        throw new Error("B2B approvals not available");
      }
      const approvalsApi = api.b2b.approvals;
      if (!approvalsApi.decide) {
        throw new Error("Approval decide method not available");
      }
      return approvalsApi.decide(approvalId, {
        approved: true,
        comment
      });
    },
    {
      invalidateKeys: [["approvals"], ["orders"], ["quotes"]]
    }
  );
  const rejectMutation = useApiMutation(
    async ({ approvalId, comment }) => {
      if (!api?.b2b?.approvals) {
        throw new Error("B2B approvals not available");
      }
      const approvalsApi = api.b2b.approvals;
      if (!approvalsApi.decide) {
        throw new Error("Approval decide method not available");
      }
      return approvalsApi.decide(approvalId, {
        approved: false,
        comment
      });
    },
    {
      invalidateKeys: [["approvals"], ["orders"], ["quotes"]]
    }
  );
  const forwardMutation = useApiMutation(
    async ({ approvalId, toEmployeeId, comment }) => {
      if (!api?.b2b?.approvals) {
        throw new Error("B2B approvals not available");
      }
      const approvalsApi = api.b2b.approvals;
      if (!approvalsApi.forward) {
        throw new Error("Approval forward method not available");
      }
      return approvalsApi.forward(approvalId, toEmployeeId, comment);
    },
    {
      invalidateKeys: [["approvals"]]
    }
  );
  const requestMutation = useApiMutation(
    async (input) => {
      if (!api?.b2b?.approvals) {
        throw new Error("B2B approvals not available");
      }
      const approvalsApi = api.b2b.approvals;
      if (!approvalsApi.request) {
        throw new Error("Approval request method not available");
      }
      return approvalsApi.request(input);
    },
    {
      invalidateKeys: [["approvals"]]
    }
  );
  const getApproval = (0, import_react6.useCallback)(
    async (approvalId) => {
      if (!api?.b2b?.approvals) {
        throw new Error("B2B approvals not available");
      }
      return api.b2b.approvals.get(approvalId);
    },
    [api]
  );
  return {
    approvals: approvals ?? [],
    pendingCount,
    isLoading,
    error,
    filters,
    setFilters: (newFilters) => {
      setFilters(newFilters);
      invalidateQueries(["approvals", newFilters]);
    },
    getApproval,
    approve: (approvalId, comment) => approveMutation.mutateAsync({ approvalId, comment }),
    reject: (approvalId, comment) => rejectMutation.mutateAsync({ approvalId, comment }),
    forward: (approvalId, toEmployeeId, comment) => forwardMutation.mutateAsync({ approvalId, toEmployeeId, comment }),
    requestApproval: requestMutation.mutateAsync,
    refresh: refetch
  };
}

// src/b2b/useSpendingLimits.ts
var import_react7 = require("react");
function useSpendingLimits(api, employeeId) {
  const {
    data: limits,
    isLoading,
    error,
    refetch
  } = useApiQuery(
    ["spending-limits", employeeId],
    async () => {
      if (!api?.b2b?.spending) {
        return [];
      }
      const context = api.getB2BContext?.();
      const targetEmployeeId = employeeId ?? context?.employeeId;
      if (!targetEmployeeId) {
        return [];
      }
      const spendingApi = api.b2b.spending;
      const result = await (spendingApi.getLimits ?? spendingApi.getLimit)?.(targetEmployeeId);
      if (!result) return [];
      return Array.isArray(result) ? result : result?.items ?? [result].filter(Boolean);
    },
    {
      enabled: !!api?.b2b?.spending,
      staleTime: 6e4
      // 1 minute
    }
  );
  const findLimitByPeriod = (0, import_react7.useCallback)(
    (period) => {
      return (limits ?? []).find((l) => l.period === period && l.isActive) ?? null;
    },
    [limits]
  );
  const createSummaryFromLimit = (0, import_react7.useCallback)(
    (limit) => {
      if (!limit) {
        return null;
      }
      return {
        limit: limit.limitAmount,
        spent: limit.currentSpending,
        remaining: limit.remainingAmount,
        percentageUsed: limit.percentageUsed,
        isExceeded: limit.isExceeded,
        isWarning: limit.isWarning,
        periodStart: limit.lastResetAt,
        periodEnd: limit.nextResetAt
      };
    },
    []
  );
  const summaries = (0, import_react7.useMemo)(() => {
    return {
      perOrder: createSummaryFromLimit(findLimitByPeriod("per_order")),
      daily: createSummaryFromLimit(findLimitByPeriod("daily")),
      weekly: createSummaryFromLimit(findLimitByPeriod("weekly")),
      monthly: createSummaryFromLimit(findLimitByPeriod("monthly"))
    };
  }, [findLimitByPeriod, createSummaryFromLimit]);
  const canSpend = (0, import_react7.useCallback)(
    (amount) => {
      if (!limits || limits.length === 0) {
        return { allowed: true };
      }
      const perOrderLimit = findLimitByPeriod("per_order");
      if (perOrderLimit && amount > perOrderLimit.limitAmount) {
        return {
          allowed: false,
          reason: `Order amount (\u20AC${amount.toFixed(2)}) exceeds per-order limit (\u20AC${perOrderLimit.limitAmount.toFixed(2)})`
        };
      }
      const dailyLimit = findLimitByPeriod("daily");
      if (dailyLimit && dailyLimit.currentSpending + amount > dailyLimit.limitAmount) {
        return {
          allowed: false,
          reason: `This order would exceed your daily spending limit (\u20AC${dailyLimit.limitAmount.toFixed(2)})`
        };
      }
      const weeklyLimit = findLimitByPeriod("weekly");
      if (weeklyLimit && weeklyLimit.currentSpending + amount > weeklyLimit.limitAmount) {
        return {
          allowed: false,
          reason: `This order would exceed your weekly spending limit (\u20AC${weeklyLimit.limitAmount.toFixed(2)})`
        };
      }
      const monthlyLimit = findLimitByPeriod("monthly");
      if (monthlyLimit && monthlyLimit.currentSpending + amount > monthlyLimit.limitAmount) {
        return {
          allowed: false,
          reason: `This order would exceed your monthly spending limit (\u20AC${monthlyLimit.limitAmount.toFixed(2)})`
        };
      }
      return { allowed: true };
    },
    [limits, findLimitByPeriod]
  );
  const getHistory = (0, import_react7.useCallback)(
    async (period) => {
      if (!api?.b2b?.spending) {
        return [];
      }
      const context = api.getB2BContext?.();
      const targetEmployeeId = employeeId ?? context?.employeeId;
      if (!targetEmployeeId) {
        return [];
      }
      const spendingApi = api.b2b.spending;
      if (!spendingApi.getHistory) {
        return [];
      }
      return spendingApi.getHistory(targetEmployeeId, period);
    },
    [api, employeeId]
  );
  return {
    limits: limits ?? [],
    summaries,
    isLoading,
    error,
    canSpend,
    getHistory,
    refresh: refetch
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useApprovals,
  useCompany,
  useQuotes,
  useSpendingLimits
});
//# sourceMappingURL=index.cjs.map