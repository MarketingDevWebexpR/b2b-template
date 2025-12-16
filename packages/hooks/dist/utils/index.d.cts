/**
 * Storage Hook
 *
 * Platform-agnostic storage abstraction for web and mobile.
 */
/**
 * Storage adapter interface
 */
interface StorageAdapter {
    /** Get item from storage */
    getItem: (key: string) => Promise<string | null> | string | null;
    /** Set item in storage */
    setItem: (key: string, value: string) => Promise<void> | void;
    /** Remove item from storage */
    removeItem: (key: string) => Promise<void> | void;
}
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
declare function setStorageAdapter(adapter: StorageAdapter): void;
/**
 * Storage hook options
 */
interface UseStorageOptions<T> {
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
interface UseStorageResult<T> {
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
declare function useStorage<T>(key: string, defaultValue: T, options?: UseStorageOptions<T>): UseStorageResult<T>;
/**
 * Hook for session storage (web only, memory fallback on mobile)
 */
declare function useSessionStorage<T>(key: string, defaultValue: T, options?: UseStorageOptions<T>): UseStorageResult<T>;

export { type StorageAdapter, type UseStorageOptions, type UseStorageResult, setStorageAdapter, useSessionStorage, useStorage };
