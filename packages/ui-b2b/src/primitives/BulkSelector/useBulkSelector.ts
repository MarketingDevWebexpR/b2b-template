import { useCallback, useMemo, useState } from "react";
import type {
  BulkSelectionState,
  SelectableItem,
  SelectionState,
  UseBulkSelectorOptions,
  UseBulkSelectorReturn,
} from "./types";

/**
 * Default function to get item ID
 */
function defaultGetItemId<T extends SelectableItem>(item: T): string {
  return item.id;
}

/**
 * Default function to check if item is selectable
 */
function defaultIsItemSelectable(): boolean {
  return true;
}

/**
 * Hook for bulk selection functionality
 *
 * Provides "select all", partial selection, and range selection
 * capabilities for lists of items.
 *
 * @example
 * ```tsx
 * const { state, toggle, toggleAll, isSelected } = useBulkSelector({
 *   items: employees,
 *   onSelectionChange: (ids, items) => {
 *     console.log(`Selected ${items.length} employees`);
 *   },
 * });
 *
 * // In your list:
 * {employees.map(emp => (
 *   <label key={emp.id}>
 *     <input
 *       type="checkbox"
 *       checked={isSelected(emp.id)}
 *       onChange={() => toggle(emp.id)}
 *     />
 *     {emp.name}
 *   </label>
 * ))}
 *
 * // Select all checkbox:
 * <input
 *   type="checkbox"
 *   checked={state.isAllSelected}
 *   ref={el => el && (el.indeterminate = state.isPartiallySelected)}
 *   onChange={toggleAll}
 * />
 * ```
 */
export function useBulkSelector<T extends SelectableItem>(
  options: UseBulkSelectorOptions<T>
): UseBulkSelectorReturn<T> {
  const {
    items,
    initialSelectedIds = [],
    getItemId = defaultGetItemId,
    isItemSelectable = defaultIsItemSelectable,
    maxSelection,
    onSelectionChange,
  } = options;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(initialSelectedIds)
  );

  // Get selectable items
  const selectableItems = useMemo(
    () => items.filter(isItemSelectable),
    [items, isItemSelectable]
  );

  const selectableIds = useMemo(
    () => new Set(selectableItems.map(getItemId)),
    [selectableItems, getItemId]
  );

  // Calculate selection state
  const state: BulkSelectionState = useMemo(() => {
    // Only count selected IDs that are actually in the current selectable items
    const validSelectedIds = new Set(
      Array.from(selectedIds).filter((id) => selectableIds.has(id))
    );
    const selectedCount = validSelectedIds.size;
    const totalCount = selectableItems.length;

    let selectionState: SelectionState = "none";
    if (selectedCount === 0) {
      selectionState = "none";
    } else if (selectedCount === totalCount && totalCount > 0) {
      selectionState = "all";
    } else {
      selectionState = "some";
    }

    return {
      selectedIds: validSelectedIds,
      selectionState,
      selectedCount,
      totalCount,
      isAllSelected: selectionState === "all",
      isPartiallySelected: selectionState === "some",
      isNoneSelected: selectionState === "none",
    };
  }, [selectedIds, selectableIds, selectableItems.length]);

  // Notify selection change
  const notifyChange = useCallback(
    (newSelectedIds: Set<string>) => {
      if (onSelectionChange) {
        const ids = Array.from(newSelectedIds);
        const selectedItems = items.filter((item) =>
          newSelectedIds.has(getItemId(item))
        );
        onSelectionChange(ids, selectedItems);
      }
    },
    [items, getItemId, onSelectionChange]
  );

  // Selection actions
  const select = useCallback(
    (id: string) => {
      if (!selectableIds.has(id)) return;
      if (maxSelection && selectedIds.size >= maxSelection && !selectedIds.has(id)) {
        return;
      }

      setSelectedIds((prev) => {
        if (prev.has(id)) return prev;
        const newSet = new Set(prev);
        newSet.add(id);
        notifyChange(newSet);
        return newSet;
      });
    },
    [selectableIds, maxSelection, selectedIds.size, notifyChange]
  );

  const deselect = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        if (!prev.has(id)) return prev;
        const newSet = new Set(prev);
        newSet.delete(id);
        notifyChange(newSet);
        return newSet;
      });
    },
    [notifyChange]
  );

  const toggle = useCallback(
    (id: string) => {
      if (!selectableIds.has(id)) return;

      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          if (maxSelection && newSet.size >= maxSelection) {
            return prev;
          }
          newSet.add(id);
        }
        notifyChange(newSet);
        return newSet;
      });
    },
    [selectableIds, maxSelection, notifyChange]
  );

  const selectAll = useCallback(() => {
    const allIds = selectableItems.map(getItemId);
    const idsToSelect = maxSelection ? allIds.slice(0, maxSelection) : allIds;
    const newSet = new Set(idsToSelect);
    setSelectedIds(newSet);
    notifyChange(newSet);
  }, [selectableItems, getItemId, maxSelection, notifyChange]);

  const deselectAll = useCallback(() => {
    const newSet = new Set<string>();
    setSelectedIds(newSet);
    notifyChange(newSet);
  }, [notifyChange]);

  const toggleAll = useCallback(() => {
    if (state.isAllSelected) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [state.isAllSelected, selectAll, deselectAll]);

  const selectMany = useCallback(
    (ids: string[]) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        let count = newSet.size;

        for (const id of ids) {
          if (selectableIds.has(id) && !newSet.has(id)) {
            if (maxSelection && count >= maxSelection) break;
            newSet.add(id);
            count++;
          }
        }

        if (newSet.size === prev.size) return prev;
        notifyChange(newSet);
        return newSet;
      });
    },
    [selectableIds, maxSelection, notifyChange]
  );

  const deselectMany = useCallback(
    (ids: string[]) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        let changed = false;

        for (const id of ids) {
          if (newSet.has(id)) {
            newSet.delete(id);
            changed = true;
          }
        }

        if (!changed) return prev;
        notifyChange(newSet);
        return newSet;
      });
    },
    [notifyChange]
  );

  const setSelection = useCallback(
    (ids: string[]) => {
      const validIds = ids.filter((id) => selectableIds.has(id));
      const limitedIds = maxSelection ? validIds.slice(0, maxSelection) : validIds;
      const newSet = new Set(limitedIds);
      setSelectedIds(newSet);
      notifyChange(newSet);
    },
    [selectableIds, maxSelection, notifyChange]
  );

  // Query helpers
  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const canSelect = useCallback(
    (id: string) => {
      if (!selectableIds.has(id)) return false;
      if (selectedIds.has(id)) return true; // Can always deselect
      if (maxSelection && selectedIds.size >= maxSelection) return false;
      return true;
    },
    [selectableIds, selectedIds, maxSelection]
  );

  const getSelectedItems = useCallback(
    () => items.filter((item) => selectedIds.has(getItemId(item))),
    [items, selectedIds, getItemId]
  );

  const getSelectedIds = useCallback(
    () => Array.from(selectedIds),
    [selectedIds]
  );

  // Range selection
  const selectRange = useCallback(
    (fromId: string, toId: string) => {
      const fromIndex = selectableItems.findIndex(
        (item) => getItemId(item) === fromId
      );
      const toIndex = selectableItems.findIndex(
        (item) => getItemId(item) === toId
      );

      if (fromIndex === -1 || toIndex === -1) return;

      const start = Math.min(fromIndex, toIndex);
      const end = Math.max(fromIndex, toIndex);

      const rangeIds = selectableItems
        .slice(start, end + 1)
        .map(getItemId);

      selectMany(rangeIds);
    },
    [selectableItems, getItemId, selectMany]
  );

  // Reset
  const reset = useCallback(() => {
    const newSet = new Set(initialSelectedIds);
    setSelectedIds(newSet);
    notifyChange(newSet);
  }, [initialSelectedIds, notifyChange]);

  return {
    state,

    // Selection actions
    select,
    deselect,
    toggle,
    selectAll,
    deselectAll,
    toggleAll,
    selectMany,
    deselectMany,
    setSelection,

    // Query helpers
    isSelected,
    canSelect,
    getSelectedItems,
    getSelectedIds,

    // Range selection
    selectRange,

    // Reset
    reset,
  };
}
