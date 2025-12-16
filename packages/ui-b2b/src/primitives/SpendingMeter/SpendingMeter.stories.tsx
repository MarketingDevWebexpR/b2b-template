import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { useSpendingMeter } from "./useSpendingMeter";
import type { SpendingLimit, ThresholdLevel } from "./types";

/**
 * Demo component that renders the SpendingMeter state
 */
function SpendingMeterDemo({
  limit,
  warningThreshold,
  dangerThreshold,
  onThresholdChange,
}: {
  limit: SpendingLimit;
  warningThreshold?: number;
  dangerThreshold?: number;
  onThresholdChange?: (level: ThresholdLevel) => void;
}) {
  const { state, addSpending, resetSpending, canSpend, formatAmount } =
    useSpendingMeter({
      limit,
      warningThreshold,
      dangerThreshold,
      onThresholdChange,
    });

  const [pendingAmount, setPendingAmount] = useState(100);

  const getBackgroundColor = () => {
    switch (state.thresholdLevel) {
      case "exceeded":
        return "#fef2f2";
      case "danger":
        return "#fef2f2";
      case "warning":
        return "#fffbeb";
      default:
        return "#f0fdf4";
    }
  };

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 400,
        padding: 24,
        backgroundColor: getBackgroundColor(),
        borderRadius: 12,
        border: `2px solid ${state.activeThreshold.color}`,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>{limit.name}</h3>
        <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 14 }}>
          {limit.periodLabel} limit
        </p>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          backgroundColor: "#e5e7eb",
          borderRadius: 8,
          height: 24,
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: `${state.displayPercentage}%`,
            height: "100%",
            backgroundColor: state.activeThreshold.color,
            transition: "width 0.3s, background-color 0.3s",
            borderRadius: 8,
          }}
        />
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <p style={{ margin: 0, color: "#6b7280", fontSize: 12 }}>Spent</p>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 18 }}>
            {state.formattedSpent}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, color: "#6b7280", fontSize: 12 }}>Remaining</p>
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: 18,
              color: state.isExceeded ? "#dc2626" : "#16a34a",
            }}
          >
            {state.formattedRemaining}
          </p>
        </div>
      </div>

      {/* Status Badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "4px 12px",
          borderRadius: 16,
          backgroundColor: state.activeThreshold.color,
          color: "white",
          fontSize: 12,
          fontWeight: 500,
          marginBottom: 16,
        }}
      >
        {state.activeThreshold.label} ({state.percentage.toFixed(0)}%)
      </div>

      {/* Projection */}
      {state.daysRemaining > 0 && (
        <div
          style={{
            padding: 12,
            backgroundColor: "white",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 14,
          }}
        >
          <p style={{ margin: 0, color: "#6b7280" }}>
            Projected spending: {formatAmount(state.projectedSpending)}
          </p>
          <p style={{ margin: "4px 0 0", color: "#6b7280" }}>
            Avg daily: {formatAmount(state.averageDailySpending)} ({state.daysRemaining} days remaining)
          </p>
          {!state.isOnTrack && (
            <p style={{ margin: "8px 0 0", color: "#dc2626", fontWeight: 500 }}>
              At this pace, you will exceed your limit!
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="number"
          value={pendingAmount}
          onChange={(e) => setPendingAmount(Number(e.target.value))}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            fontSize: 14,
          }}
        />
        <button
          onClick={() => addSpending(pendingAmount)}
          disabled={!canSpend(pendingAmount)}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: "none",
            backgroundColor: canSpend(pendingAmount) ? "#3b82f6" : "#9ca3af",
            color: "white",
            cursor: canSpend(pendingAmount) ? "pointer" : "not-allowed",
            fontSize: 14,
          }}
        >
          Add Spending
        </button>
        <button
          onClick={resetSpending}
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
      </div>

      {!canSpend(pendingAmount) && (
        <p style={{ margin: "8px 0 0", color: "#dc2626", fontSize: 12 }}>
          Cannot add {formatAmount(pendingAmount)} - would exceed limit
        </p>
      )}
    </div>
  );
}

const meta: Meta<typeof SpendingMeterDemo> = {
  title: "B2B Components/SpendingMeter",
  component: SpendingMeterDemo,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
# SpendingMeter

A headless hook for tracking and visualizing spending limits.

## Features

- Track spending against configurable limits
- Threshold-based status levels (safe, warning, danger, exceeded)
- Period tracking with projections
- Soft and hard limit support
- Currency formatting

## Usage

\`\`\`tsx
const { state, addSpending, canSpend } = useSpendingMeter({
  limit: employeeSpendingLimit,
  onThresholdChange: (level) => {
    if (level === 'danger') showWarning();
  },
});

// Render your UI using state
<ProgressBar value={state.displayPercentage} />
<span>{state.formattedRemaining} remaining</span>
\`\`\`
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const createLimit = (
  spent: number,
  max: number,
  name = "Monthly Budget"
): SpendingLimit => ({
  id: "limit-1",
  name,
  type: "employee",
  maxAmount: max,
  spentAmount: spent,
  periodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
  periodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
  periodLabel: "Monthly",
  isActive: true,
  currency: {
    code: "EUR",
    symbol: "\u20ac",
    symbolPosition: "before",
    decimals: 2,
    decimalSeparator: ",",
    thousandsSeparator: " ",
  },
});

/**
 * Default state showing a healthy spending level
 */
export const Safe: Story = {
  args: {
    limit: createLimit(500, 2000),
    warningThreshold: 75,
    dangerThreshold: 90,
  },
};

/**
 * Warning state when approaching the limit
 */
export const Warning: Story = {
  args: {
    limit: createLimit(1600, 2000),
    warningThreshold: 75,
    dangerThreshold: 90,
  },
};

/**
 * Danger state when very close to the limit
 */
export const Danger: Story = {
  args: {
    limit: createLimit(1850, 2000),
    warningThreshold: 75,
    dangerThreshold: 90,
  },
};

/**
 * Exceeded state when over the limit
 */
export const Exceeded: Story = {
  args: {
    limit: createLimit(2200, 2000, "Exceeded Budget"),
    warningThreshold: 75,
    dangerThreshold: 90,
  },
};

/**
 * Interactive demo with threshold change callback
 */
export const Interactive: Story = {
  args: {
    limit: createLimit(0, 1000, "Test Budget"),
    warningThreshold: 75,
    dangerThreshold: 90,
  },
  render: (args) => {
    const [thresholdLog, setThresholdLog] = useState<string[]>([]);

    const handleThresholdChange = (level: ThresholdLevel) => {
      setThresholdLog((prev) => [
        ...prev,
        `${new Date().toLocaleTimeString()}: Threshold changed to ${level}`,
      ]);
    };

    return (
      <div>
        <SpendingMeterDemo {...args} onThresholdChange={handleThresholdChange} />
        {thresholdLog.length > 0 && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: "#f3f4f6",
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "monospace",
            }}
          >
            <strong>Threshold Events:</strong>
            {thresholdLog.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        )}
      </div>
    );
  },
};
