import {
  invalidateQueries,
  useApiMutation,
  useApiQuery
} from "./chunk-KPRLFJKZ.js";

// src/b2b/useCompany.ts
import { useState, useEffect, useCallback } from "react";
function useCompany(api, options = {}) {
  const { companyId, includeEmployees = false, refreshInterval } = options;
  const [state, setState] = useState({
    company: null,
    employee: null,
    isLoading: false,
    error: null,
    isB2BActive: false
  });
  const [employees, setEmployees] = useState([]);
  const fetchCompany = useCallback(
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
  const setCompany = useCallback(
    async (newCompanyId) => {
      api?.setB2BContext?.(newCompanyId);
      await fetchCompany(newCompanyId);
    },
    [api, fetchCompany]
  );
  const clearCompany = useCallback(() => {
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
  const refresh = useCallback(async () => {
    const context = api?.getB2BContext?.();
    if (context?.companyId) {
      await fetchCompany(context.companyId);
    }
  }, [api, fetchCompany]);
  const canPerform = useCallback(
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
  useEffect(() => {
    const context = api?.getB2BContext?.();
    if (context?.companyId || companyId) {
      fetchCompany(context?.companyId ?? companyId);
    }
  }, [api, companyId]);
  useEffect(() => {
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
import { useState as useState2, useCallback as useCallback2 } from "react";
function useQuotes(api, initialFilters = {}) {
  const [filters, setFilters] = useState2(initialFilters);
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
  const getQuote = useCallback2(
    async (quoteId) => {
      if (!api?.b2b?.quotes) {
        throw new Error("B2B quotes not available");
      }
      return api.b2b.quotes.get(quoteId);
    },
    [api]
  );
  const fetchQuotes = useCallback2(
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
import { useState as useState3, useCallback as useCallback3 } from "react";
function useApprovals(api, initialFilters = {}) {
  const [filters, setFilters] = useState3(initialFilters);
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
  const getApproval = useCallback3(
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
import { useMemo, useCallback as useCallback4 } from "react";
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
  const findLimitByPeriod = useCallback4(
    (period) => {
      return (limits ?? []).find((l) => l.period === period && l.isActive) ?? null;
    },
    [limits]
  );
  const createSummaryFromLimit = useCallback4(
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
  const summaries = useMemo(() => {
    return {
      perOrder: createSummaryFromLimit(findLimitByPeriod("per_order")),
      daily: createSummaryFromLimit(findLimitByPeriod("daily")),
      weekly: createSummaryFromLimit(findLimitByPeriod("weekly")),
      monthly: createSummaryFromLimit(findLimitByPeriod("monthly"))
    };
  }, [findLimitByPeriod, createSummaryFromLimit]);
  const canSpend = useCallback4(
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
  const getHistory = useCallback4(
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

export {
  useCompany,
  useQuotes,
  useApprovals,
  useSpendingLimits
};
//# sourceMappingURL=chunk-4BFXJ7WQ.js.map