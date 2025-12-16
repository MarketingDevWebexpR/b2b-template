/**
 * Storage Hook
 *
 * Platform-agnostic storage abstraction for web and mobile.
 */

import { useState, useEffect, useCallback } from "react";

/**
 * Storage adapter interface
 */
export interface StorageAdapter {
  /** Get item from storage */
  getItem: (key: string) => Promise<string | null> | string | null;
  /** Set item in storage */
  setItem: (key: string, value: string) => Promise<void> | void;
  /** Remove item from storage */
  removeItem: (key: string) => Promise<void> | void;
}

/**
 * Default web storage adapter
 */
const webStorageAdapter: StorageAdapter = {
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
  },
};

/**
 * Global storage adapter - can be overridden for React Native
 */
let globalStorageAdapter: StorageAdapter = webStorageAdapter;

/**
 * Set the global storage adapter
 *
 * @param adapter - Storage adapter to use
 *
 * @example
 * ```typescript
 * // In React Native app initialization
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 *
 * setStorageAdapter({
 *   getItem: AsyncStorage.getItem,
 *   setItem: AsyncStorage.setItem,
 *   removeItem: AsyncStorage.removeItem,
 * });
 * ```
 */
export function setStorageAdapter(adapter: StorageAdapter): void {
  globalStorageAdapter = adapter;
}

/**
 * Storage hook options
 */
export interface UseStorageOptions<T> {
  /** Serializer function (default: JSON.stringify) */
  serialize?: (value: T) => string;
  /** Deserializer function (default: JSON.parse) */
  deserialize?: (value: string) => T;
  /** Custom storage adapter */
  storage?: StorageAdapter;
}

/**
 * Storage hook result
 */
export interface UseStorageResult<T> {
  /** Current value */
  value: T;
  /** Set value */
  setValue: (value: T | ((prev: T) => T)) => void;
  /** Remove value from storage */
  remove: () => void;
  /** Loading state (for async storage) */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
}

/**
 * Hook for persisted storage (localStorage/AsyncStorage)
 *
 * @param key - Storage key
 * @param defaultValue - Default value if not found
 * @param options - Hook options
 * @returns Storage state and actions
 *
 * @example
 * ```typescript
 * // Simple usage
 * const { value, setValue } = useStorage('user-preferences', { theme: 'light' });
 *
 * // Update value
 * setValue({ theme: 'dark' });
 *
 * // Update with callback
 * setValue(prev => ({ ...prev, theme: 'dark' }));
 * ```
 */
export function useStorage<T>(
  key: string,
  defaultValue: T,
  options: UseStorageOptions<T> = {}
): UseStorageResult<T> {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    storage = globalStorageAdapter,
  } = options;

  const [value, setValueState] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial value
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

  // Set value
  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValueState((prev) => {
        const resolvedValue =
          typeof newValue === "function"
            ? (newValue as (prev: T) => T)(prev)
            : newValue;

        // Save to storage
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

  // Remove value
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
    error,
  };
}

/**
 * Module-level in-memory storage for SSR/mobile fallback.
 * This persists across component renders but clears on page refresh,
 * mimicking session storage behavior.
 */
const sessionMemoryStorage = new Map<string, string>();

/**
 * Session storage adapter with SSR-safe fallback
 */
const sessionStorageAdapter: StorageAdapter = {
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
  },
};

/**
 * Hook for session storage (web only, memory fallback on mobile)
 */
export function useSessionStorage<T>(
  key: string,
  defaultValue: T,
  options: UseStorageOptions<T> = {}
): UseStorageResult<T> {
  return useStorage(key, defaultValue, {
    ...options,
    storage: sessionStorageAdapter,
  });
}
