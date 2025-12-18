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

// src/api/index.ts
var api_exports = {};
__export(api_exports, {
  QueryCacheProvider: () => QueryCacheProvider,
  clearQueryCache: () => clearQueryCache,
  invalidateQueries: () => invalidateQueries,
  useApiMutation: () => useApiMutation,
  useApiQuery: () => useApiQuery,
  useInvalidateQueries: () => useInvalidateQueries,
  useQueryCache: () => useQueryCache
});
module.exports = __toCommonJS(api_exports);

// src/api/QueryCacheContext.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var QueryCacheContext = (0, import_react.createContext)(null);
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
function QueryCacheProvider({
  children
}) {
  const cacheRef = (0, import_react.useRef)(/* @__PURE__ */ new Map());
  const value = (0, import_react.useMemo)(
    () => createCacheOperations(cacheRef),
    []
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryCacheContext.Provider, { value, children });
}
function useQueryCache() {
  const context = (0, import_react.useContext)(QueryCacheContext);
  const fallbackRef = (0, import_react.useRef)(null);
  const fallbackValue = (0, import_react.useMemo)(() => {
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
function useInvalidateQueries() {
  const cache = useQueryCache();
  const invalidate = (0, import_react.useCallback)(
    (queryKey) => {
      const cacheKey = JSON.stringify(queryKey);
      cache.invalidate(cacheKey);
    },
    [cache]
  );
  const invalidateByPrefix = (0, import_react.useCallback)(
    (prefix) => {
      const prefixStr = typeof prefix === "string" ? prefix : JSON.stringify(prefix);
      const normalizedPrefix = prefixStr.endsWith("]") ? prefixStr.slice(0, -1) : prefixStr;
      cache.invalidateByPrefix(normalizedPrefix);
    },
    [cache]
  );
  const invalidateAll = (0, import_react.useCallback)(() => {
    cache.invalidateAll();
  }, [cache]);
  return {
    invalidate,
    invalidateByPrefix,
    invalidateAll
  };
}

// src/api/useApiQuery.ts
var import_react2 = require("react");
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
  const retryCountRef = (0, import_react2.useRef)(0);
  const retryTimeoutRef = (0, import_react2.useRef)(null);
  const abortControllerRef = (0, import_react2.useRef)(null);
  const isMountedRef = (0, import_react2.useRef)(true);
  const [state, setState] = (0, import_react2.useState)(() => {
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
  const fetchData = (0, import_react2.useCallback)(
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
  const refetch = (0, import_react2.useCallback)(async () => {
    retryCountRef.current = 0;
    await fetchData(true);
  }, [fetchData]);
  const reset = (0, import_react2.useCallback)(() => {
    cache.invalidate(cacheKey);
    setState({
      data: initialData ?? null,
      isLoading: false,
      error: null,
      isSuccess: false,
      isFetching: false
    });
  }, [cacheKey, initialData, cache]);
  (0, import_react2.useEffect)(() => {
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
  (0, import_react2.useEffect)(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, cacheKey]);
  (0, import_react2.useEffect)(() => {
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
function clearQueryCache() {
  console.warn(
    "clearQueryCache() is deprecated. Use useInvalidateQueries().invalidateAll() instead."
  );
}
function invalidateQueries(_queryKey) {
  console.warn(
    "invalidateQueries() is deprecated. Use useInvalidateQueries().invalidate(queryKey) instead."
  );
}

// src/api/useApiMutation.ts
var import_react3 = require("react");
function useApiMutation(mutationFn, options = {}) {
  const {
    onSuccess,
    onError,
    onSettled,
    invalidateKeys = [],
    retryCount = 0
  } = options;
  const [state, setState] = (0, import_react3.useState)({
    data: null,
    isLoading: false,
    error: null,
    isSuccess: false,
    isError: false
  });
  const reset = (0, import_react3.useCallback)(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false,
      isError: false
    });
  }, []);
  const mutateAsync = (0, import_react3.useCallback)(
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
  const mutate = (0, import_react3.useCallback)(
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  QueryCacheProvider,
  clearQueryCache,
  invalidateQueries,
  useApiMutation,
  useApiQuery,
  useInvalidateQueries,
  useQueryCache
});
//# sourceMappingURL=index.cjs.map