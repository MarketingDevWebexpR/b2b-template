/**
 * useSearchHistory Hook
 *
 * Manages recent search history using AsyncStorage.
 * Features:
 * - Persist searches to local storage
 * - Add/remove/clear history
 * - Maximum history limit (10 items by default)
 * - Deduplication with timestamp updates
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// Types
// ============================================

/**
 * A single search history entry
 */
export interface SearchHistoryEntry {
  /** The search query */
  readonly query: string;
  /** Timestamp when the search was performed */
  readonly timestamp: number;
}

/**
 * State returned by the useSearchHistory hook
 */
export interface SearchHistoryState {
  /** Array of recent searches, sorted by timestamp (newest first) */
  readonly history: readonly SearchHistoryEntry[];
  /** Whether the history is currently being loaded */
  readonly isLoading: boolean;
  /** Error message if loading failed */
  readonly error: string | null;
}

/**
 * Actions available from the useSearchHistory hook
 */
export interface SearchHistoryActions {
  /** Add a new search to history */
  addSearch: (query: string) => Promise<void>;
  /** Remove a specific search from history */
  removeSearch: (query: string) => Promise<void>;
  /** Clear all search history */
  clearHistory: () => Promise<void>;
  /** Refresh history from storage */
  refresh: () => Promise<void>;
}

/**
 * Configuration options for useSearchHistory
 */
export interface UseSearchHistoryOptions {
  /** Maximum number of searches to keep (default: 10) */
  readonly maxItems?: number;
  /** Storage key for history (default: '@bijoux/search_history') */
  readonly storageKey?: string;
  /** Minimum query length to save (default: 2) */
  readonly minQueryLength?: number;
  /** Callback when history changes */
  readonly onChange?: (history: readonly SearchHistoryEntry[]) => void;
}

// ============================================
// Constants
// ============================================

const DEFAULT_STORAGE_KEY = '@bijoux/search_history';
const DEFAULT_MAX_ITEMS = 10;
const DEFAULT_MIN_QUERY_LENGTH = 2;

// ============================================
// Hook Implementation
// ============================================

/**
 * Custom hook for managing search history with AsyncStorage.
 *
 * @param options - Configuration options
 * @returns Search history state and actions
 *
 * @example
 * ```tsx
 * const { state, actions } = useSearchHistory({ maxItems: 10 });
 *
 * // Add a search
 * await actions.addSearch('gold ring');
 *
 * // Display recent searches
 * state.history.map(entry => (
 *   <TouchableOpacity
 *     key={entry.timestamp}
 *     onPress={() => handleSearch(entry.query)}
 *   >
 *     <Text>{entry.query}</Text>
 *   </TouchableOpacity>
 * ));
 *
 * // Remove a search
 * await actions.removeSearch('gold ring');
 *
 * // Clear all history
 * await actions.clearHistory();
 * ```
 */
export function useSearchHistory(
  options: UseSearchHistoryOptions = {}
): {
  state: SearchHistoryState;
  actions: SearchHistoryActions;
} {
  const {
    maxItems = DEFAULT_MAX_ITEMS,
    storageKey = DEFAULT_STORAGE_KEY,
    minQueryLength = DEFAULT_MIN_QUERY_LENGTH,
    onChange,
  } = options;

  // State
  const [history, setHistory] = useState<readonly SearchHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track if mounted for async operations
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Load history from AsyncStorage
   */
  const loadHistory = useCallback(async (): Promise<readonly SearchHistoryEntry[]> => {
    try {
      const stored = await AsyncStorage.getItem(storageKey);
      if (!stored) {
        return [];
      }

      const parsed: SearchHistoryEntry[] = JSON.parse(stored);

      // Validate and sort by timestamp (newest first)
      const validEntries = parsed
        .filter(
          (entry): entry is SearchHistoryEntry =>
            typeof entry.query === 'string' &&
            typeof entry.timestamp === 'number'
        )
        .sort((a, b) => b.timestamp - a.timestamp);

      return validEntries;
    } catch (err) {
      console.error('Failed to load search history:', err);
      throw err;
    }
  }, [storageKey]);

  /**
   * Save history to AsyncStorage
   */
  const saveHistory = useCallback(
    async (entries: readonly SearchHistoryEntry[]): Promise<void> => {
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(entries));
      } catch (err) {
        console.error('Failed to save search history:', err);
        throw err;
      }
    },
    [storageKey]
  );

  /**
   * Refresh history from storage
   */
  const refresh = useCallback(async (): Promise<void> => {
    if (!isMountedRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const loadedHistory = await loadHistory();
      if (isMountedRef.current) {
        setHistory(loadedHistory);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load search history'
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [loadHistory]);

  /**
   * Add a search to history
   */
  const addSearch = useCallback(
    async (query: string): Promise<void> => {
      const trimmedQuery = query.trim();

      // Validate query
      if (!trimmedQuery || trimmedQuery.length < minQueryLength) {
        return;
      }

      try {
        const currentHistory = await loadHistory();

        // Remove duplicate if exists (case-insensitive)
        const filteredHistory = currentHistory.filter(
          (entry) => entry.query.toLowerCase() !== trimmedQuery.toLowerCase()
        );

        // Create new entry
        const newEntry: SearchHistoryEntry = {
          query: trimmedQuery,
          timestamp: Date.now(),
        };

        // Add to beginning and limit to maxItems
        const updatedHistory = [newEntry, ...filteredHistory].slice(0, maxItems);

        // Save to storage
        await saveHistory(updatedHistory);

        // Update state if still mounted
        if (isMountedRef.current) {
          setHistory(updatedHistory);
          onChange?.(updatedHistory);
        }
      } catch (err) {
        console.error('Failed to add search to history:', err);
        if (isMountedRef.current) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to save search'
          );
        }
      }
    },
    [loadHistory, saveHistory, maxItems, minQueryLength, onChange]
  );

  /**
   * Remove a specific search from history
   */
  const removeSearch = useCallback(
    async (query: string): Promise<void> => {
      try {
        const currentHistory = await loadHistory();

        // Filter out the matching entry (case-insensitive)
        const updatedHistory = currentHistory.filter(
          (entry) => entry.query.toLowerCase() !== query.toLowerCase()
        );

        // Save to storage
        await saveHistory(updatedHistory);

        // Update state if still mounted
        if (isMountedRef.current) {
          setHistory(updatedHistory);
          onChange?.(updatedHistory);
        }
      } catch (err) {
        console.error('Failed to remove search from history:', err);
        if (isMountedRef.current) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to remove search'
          );
        }
      }
    },
    [loadHistory, saveHistory, onChange]
  );

  /**
   * Clear all search history
   */
  const clearHistory = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(storageKey);

      // Update state if still mounted
      if (isMountedRef.current) {
        setHistory([]);
        onChange?.([]);
      }
    } catch (err) {
      console.error('Failed to clear search history:', err);
      if (isMountedRef.current) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to clear history'
        );
      }
    }
  }, [storageKey, onChange]);

  // Load history on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Construct state object
  const state: SearchHistoryState = {
    history,
    isLoading,
    error,
  };

  // Construct actions object
  const actions: SearchHistoryActions = {
    addSearch,
    removeSearch,
    clearHistory,
    refresh,
  };

  return { state, actions };
}

// ============================================
// Utility Functions
// ============================================

/**
 * Format a timestamp for display (e.g., "2 hours ago", "Yesterday")
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted relative time string
 */
export function formatSearchTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'A l\'instant';
  }
  if (minutes < 60) {
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  if (hours < 24) {
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  }
  if (days === 1) {
    return 'Hier';
  }
  if (days < 7) {
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  }

  // Format as date for older entries
  const date = new Date(timestamp);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Group search history by time period
 *
 * @param history - Array of search history entries
 * @returns Grouped history by time period
 */
export function groupSearchHistory(
  history: readonly SearchHistoryEntry[]
): {
  today: readonly SearchHistoryEntry[];
  yesterday: readonly SearchHistoryEntry[];
  thisWeek: readonly SearchHistoryEntry[];
  older: readonly SearchHistoryEntry[];
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groups: {
    today: SearchHistoryEntry[];
    yesterday: SearchHistoryEntry[];
    thisWeek: SearchHistoryEntry[];
    older: SearchHistoryEntry[];
  } = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  for (const entry of history) {
    const entryDate = new Date(entry.timestamp);

    if (entryDate >= today) {
      groups.today.push(entry);
    } else if (entryDate >= yesterday) {
      groups.yesterday.push(entry);
    } else if (entryDate >= weekAgo) {
      groups.thisWeek.push(entry);
    } else {
      groups.older.push(entry);
    }
  }

  return groups;
}

export default useSearchHistory;
