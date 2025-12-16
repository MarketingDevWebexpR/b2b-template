/**
 * BulkSelector Types
 *
 * Type definitions for bulk selection functionality with
 * "select all" support and partial selection states.
 */

/**
 * Selection state
 */
export type SelectionState = "none" | "some" | "all";

/**
 * Item with required ID
 */
export interface SelectableItem {
  /** Unique identifier for the item */
  id: string;
}

/**
 * Bulk selection state
 */
export interface BulkSelectionState {
  /** Set of selected item IDs */
  selectedIds: Set<string>;
  /** Current selection state */
  selectionState: SelectionState;
  /** Number of selected items */
  selectedCount: number;
  /** Total number of selectable items */
  totalCount: number;
  /** Whether all items are selected */
  isAllSelected: boolean;
  /** Whether some (but not all) items are selected */
  isPartiallySelected: boolean;
  /** Whether no items are selected */
  isNoneSelected: boolean;
}

/**
 * Options for useBulkSelector hook
 */
export interface UseBulkSelectorOptions<T extends SelectableItem> {
  /** Array of selectable items */
  items: T[];
  /** Initial selected IDs */
  initialSelectedIds?: string[];
  /** Function to get item ID (defaults to item.id) */
  getItemId?: (item: T) => string;
  /** Whether to allow selection (items can be disabled) */
  isItemSelectable?: (item: T) => boolean;
  /** Maximum number of items that can be selected */
  maxSelection?: number;
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[], selectedItems: T[]) => void;
}

/**
 * Return type for useBulkSelector hook
 */
export interface UseBulkSelectorReturn<T extends SelectableItem> {
  /** Current selection state */
  state: BulkSelectionState;

  // Selection actions
  /** Select a single item */
  select: (id: string) => void;
  /** Deselect a single item */
  deselect: (id: string) => void;
  /** Toggle selection for a single item */
  toggle: (id: string) => void;
  /** Select all items */
  selectAll: () => void;
  /** Deselect all items */
  deselectAll: () => void;
  /** Toggle select all */
  toggleAll: () => void;
  /** Select multiple items by ID */
  selectMany: (ids: string[]) => void;
  /** Deselect multiple items by ID */
  deselectMany: (ids: string[]) => void;
  /** Set selection to specific IDs */
  setSelection: (ids: string[]) => void;

  // Query helpers
  /** Check if an item is selected */
  isSelected: (id: string) => boolean;
  /** Check if an item is selectable */
  canSelect: (id: string) => boolean;
  /** Get selected items */
  getSelectedItems: () => T[];
  /** Get selected IDs as array */
  getSelectedIds: () => string[];

  // Range selection
  /** Select range from last selection to target */
  selectRange: (fromId: string, toId: string) => void;

  // Reset
  /** Reset to initial state */
  reset: () => void;
}
