import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { useDataTable } from "./useDataTable";
import type { ColumnDef, SortConfig, FilterConfig } from "./types";

/**
 * Sample product type for demo
 */
interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "draft" | "archived";
}

/**
 * Demo component that renders the DataTable state
 */
function DataTableDemo({
  data,
  columns,
  pageSize = 5,
  selectionMode = "multiple",
}: {
  data: Product[];
  columns: ColumnDef<Product>[];
  pageSize?: number;
  selectionMode?: "single" | "multiple" | "none";
}) {
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    pageSize,
    selectionMode,
  });

  const [filterValue, setFilterValue] = useState("");

  const getSortIcon = (columnId: string) => {
    if (table.state.sort?.key !== columnId) return "↕";
    return table.state.sort.direction === "asc" ? "↑" : "↓";
  };

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 800,
        backgroundColor: "white",
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          padding: 16,
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search by name..."
          value={filterValue}
          onChange={(e) => {
            setFilterValue(e.target.value);
            if (e.target.value) {
              table.setFilter({
                key: "name",
                operator: "contains",
                value: e.target.value,
              });
            } else {
              table.removeFilter("name");
            }
          }}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            fontSize: 14,
            flex: 1,
            maxWidth: 300,
          }}
        />

        {table.state.filters.length > 0 && (
          <button
            onClick={() => {
              table.clearFilters();
              setFilterValue("");
            }}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              backgroundColor: "white",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Clear Filters
          </button>
        )}

        {table.state.rowSelection.selectedRowIds.size > 0 && (
          <span style={{ fontSize: 14, color: "#2563eb" }}>
            {table.state.rowSelection.selectedRowIds.size} selected
          </span>
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb" }}>
              {selectionMode !== "none" && (
                <th style={{ padding: 12, textAlign: "left", width: 48 }}>
                  <input
                    type="checkbox"
                    checked={table.state.rowSelection.allSelected}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = table.state.rowSelection.someSelected;
                      }
                    }}
                    onChange={table.toggleSelectAll}
                    disabled={selectionMode === "single"}
                  />
                </th>
              )}
              {table.getVisibleColumns().map((column) => (
                <th
                  key={column.id}
                  style={{
                    padding: 12,
                    textAlign: column.align ?? "left",
                    cursor: column.sortable ? "pointer" : "default",
                    userSelect: "none",
                    fontWeight: 600,
                    fontSize: 12,
                    textTransform: "uppercase",
                    color: "#6b7280",
                    minWidth: column.minWidth,
                    width: column.width,
                  }}
                  onClick={() => column.sortable && table.toggleSort(column.id)}
                >
                  {column.header}
                  {column.sortable && (
                    <span style={{ marginLeft: 8 }}>{getSortIcon(column.id)}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.state.data.map((row) => (
              <tr
                key={row.id}
                style={{
                  backgroundColor: table.isRowSelected(row.id)
                    ? "#eff6ff"
                    : "white",
                  borderBottom: "1px solid #e5e7eb",
                }}
                onClick={() =>
                  selectionMode !== "none" && table.toggleRowSelection(row.id)
                }
              >
                {selectionMode !== "none" && (
                  <td style={{ padding: 12 }}>
                    <input
                      type="checkbox"
                      checked={table.isRowSelected(row.id)}
                      onChange={() => table.toggleRowSelection(row.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}
                {table.getVisibleColumns().map((column) => (
                  <td
                    key={column.id}
                    style={{
                      padding: 12,
                      textAlign: column.align ?? "left",
                      fontSize: 14,
                    }}
                  >
                    {renderCellValue(table.getCellValue(row, column.id), column.id)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        style={{
          padding: 16,
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 14,
          color: "#6b7280",
        }}
      >
        <span>
          Showing {table.state.pagination.startIndex}-
          {table.state.pagination.endIndex} of{" "}
          {table.state.pagination.totalItems} items
        </span>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={table.firstPage}
            disabled={!table.state.pagination.hasPreviousPage}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              backgroundColor: "white",
              cursor: table.state.pagination.hasPreviousPage
                ? "pointer"
                : "not-allowed",
              opacity: table.state.pagination.hasPreviousPage ? 1 : 0.5,
            }}
          >
            First
          </button>
          <button
            onClick={table.previousPage}
            disabled={!table.state.pagination.hasPreviousPage}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              backgroundColor: "white",
              cursor: table.state.pagination.hasPreviousPage
                ? "pointer"
                : "not-allowed",
              opacity: table.state.pagination.hasPreviousPage ? 1 : 0.5,
            }}
          >
            Prev
          </button>
          <span style={{ padding: "6px 12px" }}>
            Page {table.state.pagination.pageIndex + 1} of{" "}
            {table.state.pagination.totalPages}
          </span>
          <button
            onClick={table.nextPage}
            disabled={!table.state.pagination.hasNextPage}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              backgroundColor: "white",
              cursor: table.state.pagination.hasNextPage
                ? "pointer"
                : "not-allowed",
              opacity: table.state.pagination.hasNextPage ? 1 : 0.5,
            }}
          >
            Next
          </button>
          <button
            onClick={table.lastPage}
            disabled={!table.state.pagination.hasNextPage}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              backgroundColor: "white",
              cursor: table.state.pagination.hasNextPage
                ? "pointer"
                : "not-allowed",
              opacity: table.state.pagination.hasNextPage ? 1 : 0.5,
            }}
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Render cell value with formatting
 */
function renderCellValue(value: unknown, columnId: string): React.ReactNode {
  if (value === null || value === undefined) return "-";

  if (columnId === "price") {
    return `${(value as number).toFixed(2)} EUR`;
  }

  if (columnId === "status") {
    const colors: Record<string, string> = {
      active: "#16a34a",
      draft: "#d97706",
      archived: "#9ca3af",
    };
    return (
      <span
        style={{
          display: "inline-flex",
          padding: "2px 8px",
          borderRadius: 12,
          backgroundColor: `${colors[value as string]}20`,
          color: colors[value as string],
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        {value as string}
      </span>
    );
  }

  return String(value);
}

const meta: Meta<typeof DataTableDemo> = {
  title: "B2B Components/DataTable",
  component: DataTableDemo,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
# DataTable

A headless hook for building data tables with sorting, filtering, pagination, and row selection.

## Features

- Client-side and server-side data support
- Multi-column sorting
- Advanced filtering with multiple operators
- Row selection (single, multiple, none)
- Column visibility toggle
- Pagination with configurable page sizes

## Usage

\`\`\`tsx
const table = useDataTable({
  data: products,
  columns: [
    { id: 'name', accessorKey: 'name', header: 'Name', sortable: true },
    { id: 'price', accessorKey: 'price', header: 'Price', sortable: true },
  ],
  getRowId: (row) => row.id,
  pageSize: 20,
  selectionMode: 'multiple',
});

// Render table using state
<table>
  <thead>
    {table.getVisibleColumns().map(col => (
      <th onClick={() => table.toggleSort(col.id)}>
        {col.header}
      </th>
    ))}
  </thead>
  <tbody>
    {table.state.data.map(row => (
      <tr onClick={() => table.toggleRowSelection(row.id)}>
        {/* cells */}
      </tr>
    ))}
  </tbody>
</table>
\`\`\`
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample columns
const columns: ColumnDef<Product>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Product Name",
    sortable: true,
    filterable: true,
  },
  {
    id: "sku",
    accessorKey: "sku",
    header: "SKU",
    sortable: true,
    width: 120,
  },
  {
    id: "category",
    accessorKey: "category",
    header: "Category",
    sortable: true,
    filterable: true,
  },
  {
    id: "price",
    accessorKey: "price",
    header: "Price",
    sortable: true,
    align: "right",
    width: 100,
  },
  {
    id: "stock",
    accessorKey: "stock",
    header: "Stock",
    sortable: true,
    align: "right",
    width: 80,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    sortable: true,
    width: 100,
  },
];

// Sample data
const sampleData: Product[] = [
  { id: "1", name: "Diamond Ring", sku: "DR-001", category: "Rings", price: 2500, stock: 5, status: "active" },
  { id: "2", name: "Gold Necklace", sku: "GN-002", category: "Necklaces", price: 1800, stock: 12, status: "active" },
  { id: "3", name: "Silver Bracelet", sku: "SB-003", category: "Bracelets", price: 450, stock: 25, status: "active" },
  { id: "4", name: "Pearl Earrings", sku: "PE-004", category: "Earrings", price: 680, stock: 8, status: "draft" },
  { id: "5", name: "Sapphire Pendant", sku: "SP-005", category: "Pendants", price: 1200, stock: 3, status: "active" },
  { id: "6", name: "Ruby Ring", sku: "RR-006", category: "Rings", price: 3200, stock: 2, status: "active" },
  { id: "7", name: "Emerald Brooch", sku: "EB-007", category: "Brooches", price: 1500, stock: 0, status: "archived" },
  { id: "8", name: "Platinum Band", sku: "PB-008", category: "Rings", price: 890, stock: 18, status: "active" },
  { id: "9", name: "Opal Earrings", sku: "OE-009", category: "Earrings", price: 520, stock: 6, status: "draft" },
  { id: "10", name: "Topaz Necklace", sku: "TN-010", category: "Necklaces", price: 950, stock: 4, status: "active" },
  { id: "11", name: "Amethyst Pendant", sku: "AP-011", category: "Pendants", price: 380, stock: 15, status: "active" },
  { id: "12", name: "Garnet Bracelet", sku: "GB-012", category: "Bracelets", price: 620, stock: 9, status: "active" },
];

/**
 * Default table with all features
 */
export const Default: Story = {
  args: {
    data: sampleData,
    columns,
    pageSize: 5,
    selectionMode: "multiple",
  },
};

/**
 * Table without selection
 */
export const NoSelection: Story = {
  args: {
    data: sampleData,
    columns,
    pageSize: 5,
    selectionMode: "none",
  },
};

/**
 * Single selection mode
 */
export const SingleSelection: Story = {
  args: {
    data: sampleData,
    columns,
    pageSize: 5,
    selectionMode: "single",
  },
};

/**
 * Larger page size
 */
export const LargePageSize: Story = {
  args: {
    data: sampleData,
    columns,
    pageSize: 10,
    selectionMode: "multiple",
  },
};

/**
 * Interactive demo with events
 */
export const Interactive: Story = {
  args: {
    data: sampleData,
    columns,
    pageSize: 5,
    selectionMode: "multiple",
  },
  render: (args) => {
    const [events, setEvents] = useState<string[]>([]);

    return (
      <div>
        <DataTableDemo {...args} />
        <div
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: "#f3f4f6",
            borderRadius: 8,
            fontSize: 12,
          }}
        >
          <p style={{ margin: 0, color: "#6b7280" }}>
            Try sorting columns, filtering by name, and selecting rows.
          </p>
        </div>
      </div>
    );
  },
};
