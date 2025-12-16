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

// src/utils/index.ts
var utils_exports = {};
__export(utils_exports, {
  setStorageAdapter: () => setStorageAdapter,
  useSessionStorage: () => useSessionStorage,
  useStorage: () => useStorage
});
module.exports = __toCommonJS(utils_exports);

// src/utils/useStorage.ts
var import_react = require("react");
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
  const [value, setValueState] = (0, import_react.useState)(defaultValue);
  const [isLoading, setIsLoading] = (0, import_react.useState)(true);
  const [error, setError] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
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
  const setValue = (0, import_react.useCallback)(
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
  const remove = (0, import_react.useCallback)(() => {
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
function useSessionStorage(key, defaultValue, options = {}) {
  const memoryStorage = /* @__PURE__ */ new Map();
  const sessionAdapter = {
    getItem: (k) => {
      if (typeof window !== "undefined" && window.sessionStorage) {
        return sessionStorage.getItem(k);
      }
      return memoryStorage.get(k) ?? null;
    },
    setItem: (k, v) => {
      if (typeof window !== "undefined" && window.sessionStorage) {
        sessionStorage.setItem(k, v);
      } else {
        memoryStorage.set(k, v);
      }
    },
    removeItem: (k) => {
      if (typeof window !== "undefined" && window.sessionStorage) {
        sessionStorage.removeItem(k);
      } else {
        memoryStorage.delete(k);
      }
    }
  };
  return useStorage(key, defaultValue, {
    ...options,
    storage: sessionAdapter
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  setStorageAdapter,
  useSessionStorage,
  useStorage
});
//# sourceMappingURL=index.cjs.map