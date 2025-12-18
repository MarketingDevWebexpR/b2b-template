// src/utils/useStorage.ts
import { useState, useEffect, useCallback } from "react";
var webStorageAdapter = {
  getItem: (key) => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  },
  setItem: (key, value) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  }
};
var globalStorageAdapter = webStorageAdapter;
function setStorageAdapter(adapter) {
  globalStorageAdapter = adapter;
}
function useStorage(key, defaultValue, options = {}) {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    storage = globalStorageAdapter
  } = options;
  const [value, setValueState] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const loadValue = async () => {
      try {
        setIsLoading(true);
        const stored = await storage.getItem(key);
        if (stored !== null) {
          setValueState(deserialize(stored));
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    loadValue();
  }, [key, storage, deserialize]);
  const setValue = useCallback(
    (newValue) => {
      setValueState((prev) => {
        const resolvedValue = typeof newValue === "function" ? newValue(prev) : newValue;
        try {
          storage.setItem(key, serialize(resolvedValue));
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
        return resolvedValue;
      });
    },
    [key, storage, serialize]
  );
  const remove = useCallback(() => {
    try {
      storage.removeItem(key);
      setValueState(defaultValue);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [key, storage, defaultValue]);
  return {
    value,
    setValue,
    remove,
    isLoading,
    error
  };
}
var sessionMemoryStorage = /* @__PURE__ */ new Map();
var sessionStorageAdapter = {
  getItem: (k) => {
    if (typeof window !== "undefined" && window.sessionStorage) {
      return sessionStorage.getItem(k);
    }
    return sessionMemoryStorage.get(k) ?? null;
  },
  setItem: (k, v) => {
    if (typeof window !== "undefined" && window.sessionStorage) {
      sessionStorage.setItem(k, v);
    } else {
      sessionMemoryStorage.set(k, v);
    }
  },
  removeItem: (k) => {
    if (typeof window !== "undefined" && window.sessionStorage) {
      sessionStorage.removeItem(k);
    } else {
      sessionMemoryStorage.delete(k);
    }
  }
};
function useSessionStorage(key, defaultValue, options = {}) {
  return useStorage(key, defaultValue, {
    ...options,
    storage: sessionStorageAdapter
  });
}

export {
  setStorageAdapter,
  useStorage,
  useSessionStorage
};
//# sourceMappingURL=chunk-HVO66BPO.js.map