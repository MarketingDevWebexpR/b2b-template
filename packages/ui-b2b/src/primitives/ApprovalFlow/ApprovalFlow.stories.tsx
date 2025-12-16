import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { useApprovalFlow } from "./useApprovalFlow";
import type {
  ApprovalWorkflow,
  ApprovalStep,
  ApprovalStepStatus,
  Approver,
} from "./types";

/**
 * Demo component that renders the ApprovalFlow state
 */
function ApprovalFlowDemo({
  workflow,
  currentUser,
  onApproved,
  onRejected,
}: {
  workflow: ApprovalWorkflow;
  currentUser?: Approver;
  onApproved?: (wf: ApprovalWorkflow) => void;
  onRejected?: (wf: ApprovalWorkflow) => void;
}) {
  const {
    state,
    approve,
    reject,
    delegate,
    skipStep,
    cancel,
    restart,
    canApprove,
    canReject,
    isCurrentStep,
    isStepComplete,
    getRemainingApprovers,
  } = useApprovalFlow({
    workflow,
    currentUser,
    onApproved,
    onRejected,
  });

  const [comment, setComment] = useState("");

  const getStepColor = (status: ApprovalStepStatus) => {
    switch (status) {
      case "approved":
        return "#16a34a";
      case "rejected":
        return "#dc2626";
      case "in_review":
        return "#2563eb";
      case "skipped":
        return "#9ca3af";
      case "cancelled":
        return "#9ca3af";
      default:
        return "#d1d5db";
    }
  };

  const getStatusIcon = (status: ApprovalStepStatus) => {
    switch (status) {
      case "approved":
        return "✓";
      case "rejected":
        return "✕";
      case "in_review":
        return "⏳";
      case "skipped":
        return "↷";
      case "cancelled":
        return "⊘";
      default:
        return "○";
    }
  };

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 600,
        padding: 24,
        backgroundColor: "#f9fafb",
        borderRadius: 12,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontSize: 20 }}>{state.workflow.name}</h3>
        {state.workflow.description && (
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 14 }}>
            {state.workflow.description}
          </p>
        )}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 12px",
            borderRadius: 16,
            backgroundColor:
              state.isApproved
                ? "#16a34a"
                : state.isRejected
                  ? "#dc2626"
                  : "#2563eb",
            color: "white",
            fontSize: 12,
            fontWeight: 500,
            marginTop: 8,
          }}
        >
          {state.workflow.status.toUpperCase()}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 4,
            fontSize: 12,
            color: "#6b7280",
          }}
        >
          <span>Progress</span>
          <span>{state.progress.toFixed(0)}%</span>
        </div>
        <div
          style={{
            backgroundColor: "#e5e7eb",
            borderRadius: 8,
            height: 8,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${state.progress}%`,
              height: "100%",
              backgroundColor: state.isRejected ? "#dc2626" : "#16a34a",
              transition: "width 0.3s",
              borderRadius: 8,
            }}
          />
        </div>
      </div>

      {/* Steps */}
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "#374151" }}>
          Approval Steps
        </h4>
        {state.workflow.steps.map((step, index) => (
          <div
            key={step.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              marginBottom: 16,
              position: "relative",
            }}
          >
            {/* Connector line */}
            {index < state.workflow.steps.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  left: 15,
                  top: 32,
                  width: 2,
                  height: "calc(100% + 8px)",
                  backgroundColor: isStepComplete(step.id)
                    ? "#16a34a"
                    : "#e5e7eb",
                }}
              />
            )}

            {/* Step indicator */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: getStepColor(step.status),
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 600,
                flexShrink: 0,
                border: isCurrentStep(step.id) ? "3px solid #2563eb" : "none",
                boxSizing: "border-box",
              }}
            >
              {getStatusIcon(step.status)}
            </div>

            {/* Step content */}
            <div style={{ marginLeft: 12, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 500 }}>{step.name}</span>
                {step.optional && (
                  <span
                    style={{
                      fontSize: 10,
                      color: "#6b7280",
                      backgroundColor: "#f3f4f6",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    Optional
                  </span>
                )}
              </div>
              {step.description && (
                <p style={{ margin: "4px 0", color: "#6b7280", fontSize: 13 }}>
                  {step.description}
                </p>
              )}

              {/* Approvers */}
              <div style={{ marginTop: 8, fontSize: 12 }}>
                <span style={{ color: "#6b7280" }}>Approvers: </span>
                {step.requiredApprovers.map((approver, i) => (
                  <span key={approver.id}>
                    {i > 0 && ", "}
                    <span
                      style={{
                        color: step.actions.some(
                          (a) =>
                            a.type === "approve" && a.approver.id === approver.id
                        )
                          ? "#16a34a"
                          : "#374151",
                        fontWeight: step.actions.some(
                          (a) =>
                            a.type === "approve" && a.approver.id === approver.id
                        )
                          ? 600
                          : 400,
                      }}
                    >
                      {approver.name}
                      {approver.role && ` (${approver.role})`}
                    </span>
                  </span>
                ))}
              </div>

              {/* Remaining approvers */}
              {(step.status === "pending" || step.status === "in_review") &&
                getRemainingApprovers(step.id).length > 0 && (
                  <p style={{ margin: "4px 0 0", color: "#d97706", fontSize: 12 }}>
                    Waiting for:{" "}
                    {getRemainingApprovers(step.id)
                      .map((a) => a.name)
                      .join(", ")}
                  </p>
                )}

              {/* Actions for current user */}
              {currentUser && isCurrentStep(step.id) && (
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  {canApprove(step.id) && (
                    <button
                      onClick={() => approve(step.id, comment || undefined)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "none",
                        backgroundColor: "#16a34a",
                        color: "white",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Approve
                    </button>
                  )}
                  {canReject(step.id) && (
                    <button
                      onClick={() => reject(step.id, comment || undefined)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "none",
                        backgroundColor: "#dc2626",
                        color: "white",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Reject
                    </button>
                  )}
                  {step.optional && (
                    <button
                      onClick={() => skipStep(step.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #d1d5db",
                        backgroundColor: "white",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Skip
                    </button>
                  )}
                </div>
              )}

              {/* Action history */}
              {step.actions.length > 0 && (
                <div
                  style={{
                    marginTop: 8,
                    padding: 8,
                    backgroundColor: "white",
                    borderRadius: 6,
                    fontSize: 11,
                  }}
                >
                  {step.actions.map((action, i) => (
                    <div key={i} style={{ color: "#6b7280" }}>
                      {action.approver.name} {action.type}d
                      {action.comment && `: "${action.comment}"`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Comment input */}
      {currentUser && state.userPendingAction && (
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Add a comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              fontSize: 14,
              boxSizing: "border-box",
            }}
          />
        </div>
      )}

      {/* Workflow actions */}
      <div style={{ display: "flex", gap: 8 }}>
        {state.canCancel && (
          <button
            onClick={() => cancel()}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              backgroundColor: "white",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Cancel Workflow
          </button>
        )}
        {state.isComplete && (
          <button
            onClick={() => restart()}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              backgroundColor: "#3b82f6",
              color: "white",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Restart
          </button>
        )}
      </div>

      {/* Current user info */}
      {currentUser && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: "#eff6ff",
            borderRadius: 8,
            fontSize: 12,
          }}
        >
          <strong>Logged in as:</strong> {currentUser.name}
          {currentUser.role && ` (${currentUser.role})`}
          {state.userPendingAction && (
            <p style={{ margin: "4px 0 0", color: "#2563eb" }}>
              You have a pending action on "{state.userPendingAction.name}"
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const meta: Meta<typeof ApprovalFlowDemo> = {
  title: "B2B Components/ApprovalFlow",
  component: ApprovalFlowDemo,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
# ApprovalFlow

A headless hook for managing multi-step approval workflows.

## Features

- Multi-step approval processes
- Multiple approvers per step
- Delegation support
- Progress tracking
- Action history
- Optional steps

## Usage

\`\`\`tsx
const { state, approve, reject, canApprove } = useApprovalFlow({
  workflow: purchaseOrderWorkflow,
  currentUser: currentEmployee,
  onApproved: (workflow) => {
    createPurchaseOrder(workflow.targetEntity.id);
  },
});

// Display progress
<ProgressBar value={state.progress} />

// Render approval buttons
{canApprove(step.id) && (
  <Button onClick={() => approve(step.id)}>Approve</Button>
)}
\`\`\`
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper to create approvers
const createApprover = (
  id: string,
  name: string,
  role?: string
): Approver => ({
  id,
  name,
  role,
});

// Sample approvers
const manager = createApprover("mgr-1", "Alice Martin", "Manager");
const director = createApprover("dir-1", "Bob Johnson", "Director");
const cfo = createApprover("cfo-1", "Carol White", "CFO");
const finance = createApprover("fin-1", "David Brown", "Finance");

// Helper to create a workflow
const createWorkflow = (
  steps: Partial<ApprovalStep>[],
  status: ApprovalWorkflow["status"] = "pending"
): ApprovalWorkflow => ({
  id: "wf-1",
  name: "Purchase Order Approval",
  description: "Approval workflow for PO #12345 - Office Supplies",
  status,
  steps: steps.map((step, index) => ({
    id: step.id ?? `step-${index + 1}`,
    name: step.name ?? `Step ${index + 1}`,
    description: step.description,
    order: index,
    status: step.status ?? "pending",
    requiredApprovers: step.requiredApprovers ?? [manager],
    minApprovals: step.minApprovals ?? 1,
    actions: step.actions ?? [],
    optional: step.optional,
  })),
  initiator: createApprover("emp-1", "John Doe", "Employee"),
  createdAt: new Date(),
  updatedAt: new Date(),
  targetEntity: {
    type: "purchase_order",
    id: "po-12345",
    name: "Office Supplies Order",
  },
});

/**
 * Initial pending state with 3-level approval
 */
export const Pending: Story = {
  args: {
    workflow: createWorkflow([
      {
        name: "Manager Review",
        description: "Direct manager approval",
        requiredApprovers: [manager],
        status: "in_review",
      },
      {
        name: "Director Approval",
        description: "Department director approval",
        requiredApprovers: [director],
      },
      {
        name: "Finance Review",
        description: "Finance team verification",
        requiredApprovers: [finance],
        optional: true,
      },
    ]),
    currentUser: manager,
  },
};

/**
 * Workflow in progress with some steps completed
 */
export const InProgress: Story = {
  args: {
    workflow: createWorkflow(
      [
        {
          name: "Manager Review",
          requiredApprovers: [manager],
          status: "approved",
          actions: [
            {
              type: "approve",
              approver: manager,
              timestamp: new Date(),
              comment: "Looks good, approved!",
            },
          ],
        },
        {
          name: "Director Approval",
          requiredApprovers: [director],
          status: "in_review",
        },
        {
          name: "CFO Final Approval",
          description: "Required for orders over €5,000",
          requiredApprovers: [cfo],
        },
      ],
      "in_progress"
    ),
    currentUser: director,
  },
};

/**
 * Fully approved workflow
 */
export const Approved: Story = {
  args: {
    workflow: createWorkflow(
      [
        {
          name: "Manager Review",
          requiredApprovers: [manager],
          status: "approved",
          actions: [
            { type: "approve", approver: manager, timestamp: new Date() },
          ],
        },
        {
          name: "Director Approval",
          requiredApprovers: [director],
          status: "approved",
          actions: [
            { type: "approve", approver: director, timestamp: new Date() },
          ],
        },
        {
          name: "Finance Review",
          requiredApprovers: [finance],
          status: "approved",
          actions: [
            { type: "approve", approver: finance, timestamp: new Date() },
          ],
        },
      ],
      "approved"
    ),
  },
};

/**
 * Rejected workflow
 */
export const Rejected: Story = {
  args: {
    workflow: createWorkflow(
      [
        {
          name: "Manager Review",
          requiredApprovers: [manager],
          status: "approved",
          actions: [
            { type: "approve", approver: manager, timestamp: new Date() },
          ],
        },
        {
          name: "Director Approval",
          requiredApprovers: [director],
          status: "rejected",
          actions: [
            {
              type: "reject",
              approver: director,
              timestamp: new Date(),
              comment: "Budget exceeded for this quarter",
            },
          ],
        },
        {
          name: "CFO Final Approval",
          requiredApprovers: [cfo],
          status: "cancelled",
        },
      ],
      "rejected"
    ),
  },
};

/**
 * Multi-approver step requiring consensus
 */
export const MultiApprover: Story = {
  args: {
    workflow: createWorkflow([
      {
        name: "Committee Review",
        description: "Requires approval from at least 2 committee members",
        requiredApprovers: [manager, director, finance],
        minApprovals: 2,
        status: "in_review",
        actions: [
          {
            type: "approve",
            approver: manager,
            timestamp: new Date(),
          },
        ],
      },
      {
        name: "Final Sign-off",
        requiredApprovers: [cfo],
      },
    ]),
    currentUser: director,
  },
};

/**
 * Interactive demo with event logging
 */
export const Interactive: Story = {
  args: {
    workflow: createWorkflow([
      {
        name: "Manager Review",
        requiredApprovers: [manager],
        status: "in_review",
      },
      {
        name: "Director Approval",
        requiredApprovers: [director],
      },
      {
        name: "Finance Review",
        requiredApprovers: [finance],
        optional: true,
      },
    ]),
    currentUser: manager,
  },
  render: (args) => {
    const [eventLog, setEventLog] = useState<string[]>([]);

    const handleApproved = (wf: ApprovalWorkflow) => {
      setEventLog((prev) => [
        ...prev,
        `${new Date().toLocaleTimeString()}: ✅ Workflow APPROVED`,
      ]);
    };

    const handleRejected = (wf: ApprovalWorkflow) => {
      setEventLog((prev) => [
        ...prev,
        `${new Date().toLocaleTimeString()}: ❌ Workflow REJECTED`,
      ]);
    };

    return (
      <div>
        <ApprovalFlowDemo
          {...args}
          onApproved={handleApproved}
          onRejected={handleRejected}
        />
        {eventLog.length > 0 && (
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
            <strong>Event Log:</strong>
            {eventLog.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        )}
      </div>
    );
  },
};
