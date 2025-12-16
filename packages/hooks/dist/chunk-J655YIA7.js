// src/api/useApiQuery.ts
import { useState, useEffect, useCallback, useRef } from "react";
var queryCache = /* @__PURE__ */ new Map();
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
  const cacheKey = JSON.stringify(queryKey);
  const retryCountRef = useRef(0);
  const [state, setState] = useState(() => {
    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return {
        data: cached.data,
        isLoading: false,
        error: null,
        isSuccess: true,
        isFetching: false
      };
    }
    return {
      data: initialData ?? null,
      isLoading: enabled,
      error: null,
      isSuccess: false,
      isFetching: enabled
    };
  });
  const fetchData = useCallback(
    async (isRefetch = false) => {
      if (!isRefetch) {
        const cached = queryCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < staleTime) {
          setState((prev) => ({
            ...prev,
            data: cached.data,
            isLoading: false,
            isSuccess: true,
            isFetching: false
          }));
          return;
        }
      }
      setState((prev) => ({
        ...prev,
        isLoading: !prev.data,
        isFetching: true,
        error: null
      }));
      try {
        const data = await queryFn();
        queryCache.set(cacheKey, { data, timestamp: Date.now() });
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
        const error = err instanceof Error ? err : new Error(String(err));
        if (retryCountRef.current < retryCount) {
          retryCountRef.current++;
          setTimeout(() => fetchData(isRefetch), retryDelay * retryCountRef.current);
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
    [cacheKey, queryFn, staleTime, retryCount, retryDelay, onSuccess, onError]
  );
  const refetch = useCallback(async () => {
    retryCountRef.current = 0;
    await fetchData(true);
  }, [fetchData]);
  const reset = useCallback(() => {
    queryCache.delete(cacheKey);
    setState({
      data: initialData ?? null,
      isLoading: false,
      error: null,
      isSuccess: false,
      isFetching: false
    });
  }, [cacheKey, initialData]);
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, cacheKey]);
  useEffect(() => {
    if (!refetchOnWindowFocus || !enabled) return;
    const handleFocus = () => {
      const cached = queryCache.get(cacheKey);
      if (!cached || Date.now() - cached.timestamp >= staleTime) {
        fetchData(true);
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetchOnWindowFocus, enabled, cacheKey, staleTime, fetchData]);
  return {
    ...state,
    refetch,
    reset
  };
}
function clearQueryCache() {
  queryCache.clear();
}
function invalidateQueries(queryKey) {
  const cacheKey = JSON.stringify(queryKey);
  queryCache.delete(cacheKey);
}

// src/api/useApiMutation.ts
import { useState as useState2, useCallback as useCallback2 } from "react";
function useApiMutation(mutationFn, options = {}) {
  const {
    onSuccess,
    onError,
    onSettled,
    invalidateKeys = [],
    retryCount = 0
  } = options;
  const [state, setState] = useState2({
    data: null,
    isLoading: false,
    error: null,
    isSuccess: false,
    isError: false
  });
  const reset = useCallback2(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false,
      isError: false
    });
  }, []);
  const mutateAsync = useCallback2(
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
  const mutate = useCallback2(
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

export {
  useApiQuery,
  clearQueryCache,
  invalidateQueries,
  useApiMutation
};
//# sourceMappingURL=chunk-J655YIA7.js.map