import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { useBulkSelector } from "./useBulkSelector";
import type { SelectableItem } from "./types";

/**
 * Sample employee type for demo
 */
interface Employee extends SelectableItem {
  name: string;
  email: string;
  department: string;
  role: string;
  active: boolean;
}

/**
 * Demo component that renders the BulkSelector state
 */
function BulkSelectorDemo({
  items,
  maxSelection,
}: {
  items: Employee[];
  maxSelection?: number;
}) {
  const [lastAction, setLastAction] = useState<string | null>(null);

  const {
    state,
    toggle,
    toggleAll,
    selectAll,
    deselectAll,
    isSelected,
    canSelect,
    getSelectedItems,
    selectRange,
    reset,
  } = useBulkSelector({
    items,
    maxSelection,
    isItemSelectable: (item) => item.active,
    onSelectionChange: (ids, selectedItems) => {
      setLastAction(`Selected ${selectedItems.length} employees`);
    },
  });

  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const handleToggle = (id: string, shiftKey: boolean) => {
    if (shiftKey && lastSelectedId) {
      selectRange(lastSelectedId, id);
    } else {
      toggle(id);
    }
    setLastSelectedId(id);
  };

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 500,
        backgroundColor: "white",
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      {/* Header with selection controls */}
      <div
        style={{
          padding: 16,
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#f9fafb",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={state.isAllSelected}
              ref={(el) => {
                if (el) {
                  el.indeterminate = state.isPartiallySelected;
                }
              }}
              onChange={toggleAll}
              style={{ width: 18, height: 18 }}
            />
            <span style={{ fontWeight: 500 }}>
              {state.isAllSelected
                ? "Deselect All"
                : state.isPartiallySelected
                  ? `${state.selectedCount} Selected`
                  : "Select All"}
            </span>
          </label>

          {state.selectedCount > 0 && (
            <button
              onClick={deselectAll}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                backgroundColor: "white",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Clear Selection
            </button>
          )}
        </div>

        {/* Selection stats */}
        <div style={{ fontSize: 13, color: "#6b7280" }}>
          {state.selectedCount} of {state.totalCount} employees selected
          {maxSelection && (
            <span style={{ marginLeft: 8, color: "#d97706" }}>
              (max {maxSelection})
            </span>
          )}
        </div>
      </div>

      {/* Employee list */}
      <div style={{ maxHeight: 400, overflowY: "auto" }}>
        {items.map((employee) => {
          const selected = isSelected(employee.id);
          const selectable = canSelect(employee.id);

          return (
            <div
              key={employee.id}
              onClick={(e) => selectable && handleToggle(employee.id, e.shiftKey)}
              style={{
                padding: 16,
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: selectable ? "pointer" : "not-allowed",
                backgroundColor: selected
                  ? "#eff6ff"
                  : !employee.active
                    ? "#f9fafb"
                    : "white",
                opacity: employee.active ? 1 : 0.6,
              }}
            >
              <input
                type="checkbox"
                checked={selected}
                disabled={!selectable && !selected}
                onChange={() => toggle(employee.id)}
                onClick={(e) => e.stopPropagation()}
                style={{ width: 18, height: 18 }}
              />

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>
                  {employee.name}
                  {!employee.active && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        color: "#9ca3af",
                        backgroundColor: "#f3f4f6",
                        padding: "2px 6px",
                        borderRadius: 4,
                      }}
                    >
                      Inactive
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  {employee.role} - {employee.department}
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>
                  {employee.email}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer with actions */}
      <div
        style={{
          padding: 16,
          borderTop: "1px solid #e5e7eb",
          backgroundColor: "#f9fafb",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            onClick={reset}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              backgroundColor: "white",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Reset
          </button>

          <button
            disabled={state.selectedCount === 0}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              backgroundColor: state.selectedCount > 0 ? "#3b82f6" : "#9ca3af",
              color: "white",
              cursor: state.selectedCount > 0 ? "pointer" : "not-allowed",
              fontSize: 14,
            }}
          >
            Send Email to {state.selectedCount} Selected
          </button>
        </div>

        {lastAction && (
          <div style={{ marginTop: 12, fontSize: 12, color: "#6b7280" }}>
            Last action: {lastAction}
          </div>
        )}
      </div>

      {/* Selection preview */}
      {state.selectedCount > 0 && (
        <div
          style={{
            padding: 16,
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "#eff6ff",
            fontSize: 12,
          }}
        >
          <strong>Selected Employees:</strong>
          <div style={{ marginTop: 4 }}>
            {getSelectedItems()
              .map((e) => e.name)
              .join(", ")}
          </div>
        </div>
      )}
    </div>
  );
}

const meta: Meta<typeof BulkSelectorDemo> = {
  title: "B2B Components/BulkSelector",
  component: BulkSelectorDemo,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
# BulkSelector

A headless hook for managing bulk selection with "select all", partial selection, and range selection.

## Features

- Select all / deselect all
- Partial selection state (indeterminate)
- Range selection with Shift+click
- Maximum selection limit
- Selective item disabling
- Selection tracking and callbacks

## Usage

\`\`\`tsx
const { state, toggle, toggleAll, isSelected, selectRange } = useBulkSelector({
  items: employees,
  maxSelection: 10,
  isItemSelectable: (item) => item.active,
  onSelectionChange: (ids, items) => {
    console.log(\`Selected \${items.length} items\`);
  },
});

// Render list with checkboxes
{employees.map(emp => (
  <label key={emp.id}>
    <input
      type="checkbox"
      checked={isSelected(emp.id)}
      onChange={() => toggle(emp.id)}
    />
    {emp.name}
  </label>
))}

// Select all checkbox
<input
  type="checkbox"
  checked={state.isAllSelected}
  ref={el => el && (el.indeterminate = state.isPartiallySelected)}
  onChange={toggleAll}
/>
\`\`\`
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample employees
const sampleEmployees: Employee[] = [
  { id: "1", name: "Alice Martin", email: "alice@company.com", department: "Sales", role: "Manager", active: true },
  { id: "2", name: "Bob Johnson", email: "bob@company.com", department: "Engineering", role: "Developer", active: true },
  { id: "3", name: "Carol White", email: "carol@company.com", department: "Finance", role: "CFO", active: true },
  { id: "4", name: "David Brown", email: "david@company.com", department: "Marketing", role: "Designer", active: false },
  { id: "5", name: "Eva Green", email: "eva@company.com", department: "Sales", role: "Representative", active: true },
  { id: "6", name: "Frank Miller", email: "frank@company.com", department: "Engineering", role: "Lead Developer", active: true },
  { id: "7", name: "Grace Lee", email: "grace@company.com", department: "HR", role: "Director", active: true },
  { id: "8", name: "Henry Wilson", email: "henry@company.com", department: "Sales", role: "Representative", active: false },
  { id: "9", name: "Ivy Chen", email: "ivy@company.com", department: "Engineering", role: "QA Engineer", active: true },
  { id: "10", name: "Jack Davis", email: "jack@company.com", department: "Operations", role: "Manager", active: true },
];

/**
 * Default bulk selection
 */
export const Default: Story = {
  args: {
    items: sampleEmployees,
  },
};

/**
 * With maximum selection limit
 */
export const WithMaxSelection: Story = {
  args: {
    items: sampleEmployees,
    maxSelection: 3,
  },
};

/**
 * Small list
 */
export const SmallList: Story = {
  args: {
    items: sampleEmployees.slice(0, 4),
  },
};

/**
 * All active employees
 */
export const AllActive: Story = {
  args: {
    items: sampleEmployees.map((e) => ({ ...e, active: true })),
  },
};

/**
 * Interactive demo
 */
export const Interactive: Story = {
  args: {
    items: sampleEmployees,
  },
  render: (args) => (
    <div>
      <BulkSelectorDemo {...args} />
      <div
        style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: "#f3f4f6",
          borderRadius: 8,
          fontSize: 12,
          maxWidth: 500,
        }}
      >
        <strong>Tips:</strong>
        <ul style={{ margin: "8px 0 0", paddingLeft: 20, color: "#6b7280" }}>
          <li>Click checkbox or row to toggle selection</li>
          <li>Shift+click to select a range</li>
          <li>Inactive employees cannot be selected</li>
        </ul>
      </div>
    </div>
  ),
};
