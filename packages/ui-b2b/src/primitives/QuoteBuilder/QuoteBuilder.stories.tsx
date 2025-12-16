import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { useQuoteBuilder } from "./useQuoteBuilder";
import type { QuoteCustomer, Quote, CartItem } from "./types";

/**
 * Demo component that renders the QuoteBuilder state
 */
function QuoteBuilderDemo({
  customer,
  cartItems,
}: {
  customer: QuoteCustomer;
  cartItems?: CartItem[];
}) {
  const {
    state,
    addItem,
    removeItem,
    setItemQuantity,
    applyItemDiscount,
    addDiscount,
    removeDiscount,
    setShipping,
    importFromCart,
    save,
    send,
    reset,
  } = useQuoteBuilder({
    customer,
    currency: "EUR",
    taxRate: 20,
    taxType: "excluded",
    validityDays: 30,
    onSave: (quote) => console.log("Quote saved:", quote),
    onSend: (quote) => console.log("Quote sent:", quote),
  });

  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState(100);
  const [newItemQty, setNewItemQty] = useState(1);

  const formatCurrency = (amount: number) =>
    `${amount.toFixed(2)} ${state.quote.pricing.currency}`;

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 700,
        backgroundColor: "white",
        borderRadius: 12,
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 20,
          backgroundColor: "#1e3a8a",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 24 }}>
              Quote {state.quote.quoteNumber}
            </h2>
            <p style={{ margin: "4px 0 0", opacity: 0.8, fontSize: 14 }}>
              {customer.companyName} - {customer.contactName}
            </p>
          </div>
          <div
            style={{
              backgroundColor:
                state.quote.status === "draft"
                  ? "#fbbf24"
                  : state.quote.status === "sent"
                    ? "#22c55e"
                    : "#6b7280",
              color: state.quote.status === "draft" ? "#000" : "#fff",
              padding: "4px 12px",
              borderRadius: 16,
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {state.quote.status}
          </div>
        </div>

        {state.isDirty && (
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "#fbbf24",
            }}
          >
            * Unsaved changes
          </div>
        )}
      </div>

      {/* Items */}
      <div style={{ padding: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16 }}>Line Items</h3>
          <div style={{ display: "flex", gap: 8 }}>
            {cartItems && cartItems.length > 0 && (
              <button
                onClick={() => importFromCart(cartItems)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                  backgroundColor: "white",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Import from Cart
              </button>
            )}
            <button
              onClick={() => setShowAddItem(!showAddItem)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "none",
                backgroundColor: "#3b82f6",
                color: "white",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              + Add Item
            </button>
          </div>
        </div>

        {/* Add item form */}
        {showAddItem && (
          <div
            style={{
              padding: 16,
              backgroundColor: "#f9fafb",
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Product name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                style={{
                  flex: 2,
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                  fontSize: 14,
                }}
              />
              <input
                type="number"
                placeholder="Price"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(Number(e.target.value))}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                  fontSize: 14,
                }}
              />
              <input
                type="number"
                placeholder="Qty"
                value={newItemQty}
                onChange={(e) => setNewItemQty(Number(e.target.value))}
                style={{
                  width: 60,
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                  fontSize: 14,
                }}
              />
            </div>
            <button
              onClick={() => {
                if (newItemName) {
                  addItem({
                    productId: `prod-${Date.now()}`,
                    name: newItemName,
                    unitPrice: newItemPrice,
                    quantity: newItemQty,
                  });
                  setNewItemName("");
                  setNewItemPrice(100);
                  setNewItemQty(1);
                  setShowAddItem(false);
                }
              }}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                backgroundColor: "#16a34a",
                color: "white",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Add to Quote
            </button>
          </div>
        )}

        {/* Items list */}
        {state.quote.items.length === 0 ? (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              color: "#9ca3af",
              backgroundColor: "#f9fafb",
              borderRadius: 8,
            }}
          >
            No items added yet. Click "Add Item" to start building your quote.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid #e5e7eb",
                  fontSize: 12,
                  color: "#6b7280",
                  textTransform: "uppercase",
                }}
              >
                <th style={{ padding: 8, textAlign: "left" }}>Item</th>
                <th style={{ padding: 8, textAlign: "right" }}>Price</th>
                <th style={{ padding: 8, textAlign: "center" }}>Qty</th>
                <th style={{ padding: 8, textAlign: "right" }}>Total</th>
                <th style={{ padding: 8, width: 48 }}></th>
              </tr>
            </thead>
            <tbody>
              {state.quote.items.map((item) => (
                <tr
                  key={item.id}
                  style={{ borderBottom: "1px solid #e5e7eb" }}
                >
                  <td style={{ padding: 12 }}>
                    <div style={{ fontWeight: 500 }}>{item.name}</div>
                    {item.discount && (
                      <div style={{ fontSize: 12, color: "#16a34a" }}>
                        -{item.discount.value}
                        {item.discount.type === "percentage" ? "%" : " EUR"}{" "}
                        discount
                      </div>
                    )}
                  </td>
                  <td style={{ padding: 12, textAlign: "right" }}>
                    {item.discount ? (
                      <>
                        <span
                          style={{
                            textDecoration: "line-through",
                            color: "#9ca3af",
                            marginRight: 8,
                          }}
                        >
                          {formatCurrency(item.unitPrice)}
                        </span>
                        {formatCurrency(item.effectiveUnitPrice)}
                      </>
                    ) : (
                      formatCurrency(item.unitPrice)
                    )}
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
                      <button
                        onClick={() =>
                          setItemQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 4,
                          border: "1px solid #d1d5db",
                          backgroundColor: "white",
                          cursor: item.quantity > 1 ? "pointer" : "not-allowed",
                        }}
                      >
                        -
                      </button>
                      <span style={{ padding: "0 8px" }}>{item.quantity}</span>
                      <button
                        onClick={() =>
                          setItemQuantity(item.id, item.quantity + 1)
                        }
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 4,
                          border: "1px solid #d1d5db",
                          backgroundColor: "white",
                          cursor: "pointer",
                        }}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: 12,
                      textAlign: "right",
                      fontWeight: 500,
                    }}
                  >
                    {formatCurrency(item.lineTotal)}
                  </td>
                  <td style={{ padding: 12 }}>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        border: "none",
                        backgroundColor: "#fee2e2",
                        color: "#dc2626",
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pricing Summary */}
      {state.quote.items.length > 0 && (
        <div
          style={{
            padding: 20,
            backgroundColor: "#f9fafb",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ flex: 1 }}>
              {/* Shipping */}
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "#6b7280",
                    marginBottom: 4,
                  }}
                >
                  Shipping Cost
                </label>
                <input
                  type="number"
                  value={state.quote.pricing.shipping}
                  onChange={(e) => setShipping(Number(e.target.value))}
                  style={{
                    width: 100,
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                  }}
                />
              </div>

              {/* Add discount */}
              <button
                onClick={() =>
                  addDiscount({
                    type: "percentage",
                    value: 5,
                    reason: "Volume discount",
                  })
                }
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #16a34a",
                  backgroundColor: "white",
                  color: "#16a34a",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                + Add 5% Discount
              </button>
            </div>

            {/* Totals */}
            <div style={{ width: 250 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  fontSize: 14,
                }}
              >
                <span>Subtotal</span>
                <span>{formatCurrency(state.quote.pricing.subtotal)}</span>
              </div>

              {state.quote.pricing.discountTotal > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    fontSize: 14,
                    color: "#16a34a",
                  }}
                >
                  <span>Discount</span>
                  <span>
                    -{formatCurrency(state.quote.pricing.discountTotal)}
                  </span>
                </div>
              )}

              {state.quote.pricing.shipping > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    fontSize: 14,
                  }}
                >
                  <span>Shipping</span>
                  <span>{formatCurrency(state.quote.pricing.shipping)}</span>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  fontSize: 14,
                }}
              >
                <span>Tax ({state.quote.pricing.taxRate}%)</span>
                <span>{formatCurrency(state.quote.pricing.taxAmount)}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: 12,
                  borderTop: "2px solid #e5e7eb",
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                <span>Total</span>
                <span>{formatCurrency(state.quote.pricing.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation errors */}
      {state.errors.length > 0 && (
        <div style={{ padding: "0 20px 20px" }}>
          {state.errors.map((error, i) => (
            <div
              key={i}
              style={{
                padding: 12,
                backgroundColor: error.type === "error" ? "#fef2f2" : "#fffbeb",
                color: error.type === "error" ? "#dc2626" : "#d97706",
                borderRadius: 6,
                fontSize: 14,
                marginTop: 8,
              }}
            >
              {error.message}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div
        style={{
          padding: 20,
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={reset}
          style={{
            padding: "10px 20px",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            backgroundColor: "white",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Reset Quote
        </button>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={save}
            disabled={!state.isDirty}
            style={{
              padding: "10px 20px",
              borderRadius: 6,
              border: "1px solid #3b82f6",
              backgroundColor: "white",
              color: "#3b82f6",
              cursor: state.isDirty ? "pointer" : "not-allowed",
              opacity: state.isDirty ? 1 : 0.5,
              fontSize: 14,
            }}
          >
            Save Draft
          </button>
          <button
            onClick={send}
            disabled={!state.isValid}
            style={{
              padding: "10px 20px",
              borderRadius: 6,
              border: "none",
              backgroundColor: state.isValid ? "#16a34a" : "#9ca3af",
              color: "white",
              cursor: state.isValid ? "pointer" : "not-allowed",
              fontSize: 14,
            }}
          >
            Send to Customer
          </button>
        </div>
      </div>
    </div>
  );
}

const meta: Meta<typeof QuoteBuilderDemo> = {
  title: "B2B Components/QuoteBuilder",
  component: QuoteBuilderDemo,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
# QuoteBuilder

A headless hook for building B2B quotes with line items, discounts, taxes, and terms.

## Features

- Add/edit/remove line items
- Item-level and quote-level discounts
- Automatic pricing calculations
- Tax handling (included, excluded, exempt)
- Cart import
- Validation with error messages
- Quote lifecycle (draft → send)

## Usage

\`\`\`tsx
const {
  state,
  addItem,
  importFromCart,
  addDiscount,
  setShipping,
  save,
  send,
} = useQuoteBuilder({
  customer: selectedCustomer,
  currency: 'EUR',
  taxRate: 20,
  validityDays: 30,
  onSend: async (quote) => {
    await emailQuoteToCustomer(quote);
  },
});

// Display pricing
<div>Subtotal: {state.quote.pricing.subtotal}</div>
<div>Total: {state.quote.pricing.total}</div>

// Send quote
<Button onClick={send} disabled={!state.isValid}>
  Send Quote
</Button>
\`\`\`
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample customer
const sampleCustomer: QuoteCustomer = {
  id: "cust-1",
  companyName: "Bijouterie Luxe Paris",
  contactName: "Marie Dupont",
  email: "marie@bijouterie-luxe.fr",
  phone: "+33 1 23 45 67 89",
  paymentTerms: "NET30",
};

// Sample cart items
const sampleCartItems: CartItem[] = [
  { id: "cart-1", productId: "prod-1", name: "Diamond Ring 18K", unitPrice: 2500, quantity: 2 },
  { id: "cart-2", productId: "prod-2", name: "Gold Necklace", unitPrice: 1800, quantity: 1 },
  { id: "cart-3", productId: "prod-3", name: "Pearl Earrings", unitPrice: 680, quantity: 3 },
];

/**
 * Empty quote ready to add items
 */
export const Empty: Story = {
  args: {
    customer: sampleCustomer,
  },
};

/**
 * Quote with cart items available to import
 */
export const WithCartItems: Story = {
  args: {
    customer: sampleCustomer,
    cartItems: sampleCartItems,
  },
};

/**
 * Interactive quote building demo
 */
export const Interactive: Story = {
  args: {
    customer: sampleCustomer,
    cartItems: sampleCartItems,
  },
  render: (args) => (
    <div>
      <QuoteBuilderDemo {...args} />
      <div
        style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: "#f3f4f6",
          borderRadius: 8,
          fontSize: 12,
          maxWidth: 700,
        }}
      >
        <strong>Tips:</strong>
        <ul style={{ margin: "8px 0 0", paddingLeft: 20, color: "#6b7280" }}>
          <li>Click "Import from Cart" to add sample items</li>
          <li>Use +/- buttons to change quantities</li>
          <li>Add discounts and shipping costs</li>
          <li>Save as draft or send to customer</li>
        </ul>
      </div>
    </div>
  ),
};
