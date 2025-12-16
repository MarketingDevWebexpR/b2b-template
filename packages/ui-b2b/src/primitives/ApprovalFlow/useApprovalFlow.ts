import { useCallback, useMemo, useState } from "react";
import type {
  ApprovalAction,
  ApprovalFlowState,
  ApprovalStep,
  ApprovalStepStatus,
  ApprovalWorkflow,
  ApprovalWorkflowStatus,
  Approver,
  UseApprovalFlowOptions,
  UseApprovalFlowReturn,
} from "./types";

/**
 * Calculate workflow status based on step statuses
 */
function calculateWorkflowStatus(steps: ApprovalStep[]): ApprovalWorkflowStatus {
  if (steps.length === 0) return "draft";

  const hasRejected = steps.some((s) => s.status === "rejected");
  if (hasRejected) return "rejected";

  const hasCancelled = steps.some((s) => s.status === "cancelled");
  if (hasCancelled) return "cancelled";

  const allComplete = steps.every(
    (s) =>
      s.status === "approved" || s.status === "skipped" || (s.optional && s.status === "pending")
  );
  if (allComplete) return "approved";

  const hasInProgress = steps.some(
    (s) => s.status === "in_review" || s.status === "approved"
  );
  if (hasInProgress) return "in_progress";

  const hasPending = steps.some((s) => s.status === "pending");
  if (hasPending) return "pending";

  return "draft";
}

/**
 * Find the current active step index
 */
function findCurrentStepIndex(steps: ApprovalStep[]): number {
  // Find the first step that is pending or in_review
  const activeIndex = steps.findIndex(
    (s) => s.status === "pending" || s.status === "in_review"
  );

  if (activeIndex >= 0) return activeIndex;

  // If all steps are complete, return the last step
  const allComplete = steps.every(
    (s) => s.status === "approved" || s.status === "skipped" || s.status === "rejected"
  );
  if (allComplete && steps.length > 0) {
    return steps.length - 1;
  }

  return 0;
}

/**
 * Check if a step has enough approvals
 */
function hasEnoughApprovals(step: ApprovalStep): boolean {
  const approvalCount = step.actions.filter((a) => a.type === "approve").length;
  return approvalCount >= step.minApprovals;
}

/**
 * Hook for approval workflow state management
 *
 * Provides functionality for multi-step approval workflows
 * with support for multiple approvers, delegation, and tracking.
 *
 * @example
 * ```tsx
 * const { state, approve, reject, canApprove } = useApprovalFlow({
 *   workflow: purchaseOrderWorkflow,
 *   currentUser: currentEmployee,
 *   onApproved: (workflow) => {
 *     createPurchaseOrder(workflow.targetEntity.id);
 *   },
 *   onRejected: (workflow) => {
 *     notifyInitiator(workflow.initiator);
 *   },
 * });
 *
 * // Display progress
 * <ProgressBar value={state.progress} />
 *
 * // Render steps
 * {state.workflow.steps.map(step => (
 *   <StepCard
 *     key={step.id}
 *     step={step}
 *     isCurrent={isCurrentStep(step.id)}
 *     onApprove={() => approve(step.id)}
 *     onReject={() => reject(step.id)}
 *   />
 * ))}
 * ```
 */
export function useApprovalFlow(
  options: UseApprovalFlowOptions
): UseApprovalFlowReturn {
  const {
    workflow: initialWorkflow,
    currentUser,
    onStepChange,
    onWorkflowChange,
    onApproved,
    onRejected,
  } = options;

  const [workflow, setWorkflow] = useState<ApprovalWorkflow>(initialWorkflow);
  const [viewingStepIndex, setViewingStepIndex] = useState<number | null>(null);

  // Update workflow and trigger callbacks
  const updateWorkflow = useCallback(
    (
      updater: (prev: ApprovalWorkflow) => ApprovalWorkflow,
      changedStep?: ApprovalStep
    ) => {
      setWorkflow((prev) => {
        const updated = updater(prev);

        // Calculate new workflow status
        const newStatus = calculateWorkflowStatus(updated.steps);
        const finalWorkflow: ApprovalWorkflow = {
          ...updated,
          status: newStatus,
          updatedAt: new Date(),
        };

        // Trigger callbacks
        if (changedStep) {
          onStepChange?.(changedStep, finalWorkflow);
        }
        onWorkflowChange?.(finalWorkflow);

        if (newStatus === "approved" && prev.status !== "approved") {
          onApproved?.(finalWorkflow);
        }
        if (newStatus === "rejected" && prev.status !== "rejected") {
          onRejected?.(finalWorkflow);
        }

        return finalWorkflow;
      });
    },
    [onStepChange, onWorkflowChange, onApproved, onRejected]
  );

  // Calculate state
  const state: ApprovalFlowState = useMemo(() => {
    const steps = workflow.steps;
    const currentStepIndex =
      viewingStepIndex ?? findCurrentStepIndex(steps);
    const currentStep = steps[currentStepIndex] ?? null;

    const completedSteps = steps.filter(
      (s) => s.status === "approved" || s.status === "skipped"
    );
    const pendingSteps = steps.filter(
      (s) => s.status === "pending" || s.status === "in_review"
    );

    // Calculate progress
    const totalSteps = steps.filter((s) => !s.optional).length;
    const completedCount = completedSteps.filter((s) => !s.optional).length;
    const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

    // Find user's pending action
    let userPendingAction: ApprovalStep | null = null;
    if (currentUser) {
      userPendingAction =
        pendingSteps.find((step) =>
          step.requiredApprovers.some((a) => a.id === currentUser.id)
        ) ?? null;
    }

    return {
      workflow,
      currentStepIndex,
      currentStep,
      completedSteps,
      pendingSteps,
      progress,
      isComplete: workflow.status === "approved" || workflow.status === "rejected",
      isApproved: workflow.status === "approved",
      isRejected: workflow.status === "rejected",
      canCancel:
        workflow.status !== "cancelled" &&
        workflow.status !== "approved" &&
        workflow.status !== "rejected",
      userPendingAction,
    };
  }, [workflow, viewingStepIndex, currentUser]);

  // Helper to create an action
  const createAction = useCallback(
    (
      type: ApprovalAction["type"],
      comment?: string,
      delegatedTo?: Approver
    ): ApprovalAction => {
      const action: ApprovalAction = {
        type,
        approver: currentUser ?? {
          id: "system",
          name: "System",
        },
        timestamp: new Date(),
      };

      // Only add optional properties when defined (exactOptionalPropertyTypes)
      if (comment !== undefined) {
        action.comment = comment;
      }
      if (delegatedTo !== undefined) {
        action.delegatedTo = delegatedTo;
      }

      return action;
    },
    [currentUser]
  );

  // Update a specific step
  const updateStep = useCallback(
    (
      stepId: string,
      updater: (step: ApprovalStep) => ApprovalStep
    ) => {
      updateWorkflow((prev) => {
        const stepIndex = prev.steps.findIndex((s) => s.id === stepId);
        if (stepIndex === -1) return prev;

        const existingStep = prev.steps[stepIndex];
        // Guard against undefined (noUncheckedIndexedAccess)
        if (!existingStep) return prev;

        const updatedStep = updater(existingStep);
        const newSteps = [...prev.steps];
        newSteps[stepIndex] = updatedStep;

        return { ...prev, steps: newSteps };
      });
    },
    [updateWorkflow]
  );

  // Step actions
  const approve = useCallback(
    (stepId?: string, comment?: string) => {
      const targetStepId = stepId ?? state.currentStep?.id;
      if (!targetStepId) return;

      updateStep(targetStepId, (step) => {
        const action = createAction("approve", comment);
        const newActions = [...step.actions, action];
        const newStep = { ...step, actions: newActions };

        // Check if step now has enough approvals
        if (hasEnoughApprovals(newStep)) {
          newStep.status = "approved";
        } else {
          newStep.status = "in_review";
        }

        return newStep;
      });
    },
    [state.currentStep, updateStep, createAction]
  );

  const reject = useCallback(
    (stepId?: string, comment?: string) => {
      const targetStepId = stepId ?? state.currentStep?.id;
      if (!targetStepId) return;

      updateStep(targetStepId, (step) => {
        const action = createAction("reject", comment);
        return {
          ...step,
          status: "rejected" as ApprovalStepStatus,
          actions: [...step.actions, action],
        };
      });
    },
    [state.currentStep, updateStep, createAction]
  );

  const requestChanges = useCallback(
    (stepId?: string, comment?: string) => {
      const targetStepId = stepId ?? state.currentStep?.id;
      if (!targetStepId) return;

      updateStep(targetStepId, (step) => {
        const action = createAction("request_changes", comment);
        return {
          ...step,
          status: "pending" as ApprovalStepStatus,
          actions: [...step.actions, action],
        };
      });
    },
    [state.currentStep, updateStep, createAction]
  );

  const delegate = useCallback(
    (stepId: string, delegateTo: Approver, comment?: string) => {
      updateStep(stepId, (step) => {
        const action = createAction("delegate", comment, delegateTo);
        const newApprovers = step.requiredApprovers.some(
          (a) => a.id === delegateTo.id
        )
          ? step.requiredApprovers
          : [...step.requiredApprovers, delegateTo];

        return {
          ...step,
          requiredApprovers: newApprovers,
          actions: [...step.actions, action],
        };
      });
    },
    [updateStep, createAction]
  );

  const skipStep = useCallback(
    (stepId: string, comment?: string) => {
      updateStep(stepId, (step) => {
        if (!step.optional) return step;

        const action = createAction("skip", comment);
        return {
          ...step,
          status: "skipped" as ApprovalStepStatus,
          actions: [...step.actions, action],
        };
      });
    },
    [updateStep, createAction]
  );

  // Workflow actions
  const cancel = useCallback(
    (comment?: string) => {
      updateWorkflow((prev) => ({
        ...prev,
        status: "cancelled",
        steps: prev.steps.map((step) =>
          step.status === "pending" || step.status === "in_review"
            ? {
                ...step,
                status: "cancelled" as ApprovalStepStatus,
                actions: [
                  ...step.actions,
                  createAction("skip", comment ?? "Workflow cancelled"),
                ],
              }
            : step
        ),
      }));
    },
    [updateWorkflow, createAction]
  );

  const resetToDraft = useCallback(() => {
    updateWorkflow((prev) => ({
      ...prev,
      status: "draft",
      steps: prev.steps.map((step) => ({
        ...step,
        status: "pending" as ApprovalStepStatus,
        actions: [],
      })),
    }));
  }, [updateWorkflow]);

  const restart = useCallback(() => {
    updateWorkflow((prev) => ({
      ...prev,
      status: "pending",
      steps: prev.steps.map((step, index) => ({
        ...step,
        status:
          index === 0
            ? ("in_review" as ApprovalStepStatus)
            : ("pending" as ApprovalStepStatus),
        actions: [],
      })),
    }));
  }, [updateWorkflow]);

  // Query helpers
  const canApprove = useCallback(
    (stepId: string, userId?: string) => {
      const step = workflow.steps.find((s) => s.id === stepId);
      if (!step) return false;
      if (step.status !== "pending" && step.status !== "in_review") return false;

      const checkUserId = userId ?? currentUser?.id;
      if (!checkUserId) return false;

      // Check if user is a required approver
      const isApprover = step.requiredApprovers.some((a) => a.id === checkUserId);
      if (!isApprover) return false;

      // Check if user hasn't already approved
      const hasAlreadyApproved = step.actions.some(
        (a) => a.type === "approve" && a.approver.id === checkUserId
      );

      return !hasAlreadyApproved;
    },
    [workflow.steps, currentUser]
  );

  const canReject = useCallback(
    (stepId: string, userId?: string) => {
      const step = workflow.steps.find((s) => s.id === stepId);
      if (!step) return false;
      if (step.status !== "pending" && step.status !== "in_review") return false;

      const checkUserId = userId ?? currentUser?.id;
      if (!checkUserId) return false;

      return step.requiredApprovers.some((a) => a.id === checkUserId);
    },
    [workflow.steps, currentUser]
  );

  const isCurrentStep = useCallback(
    (stepId: string) => state.currentStep?.id === stepId,
    [state.currentStep]
  );

  const isStepComplete = useCallback(
    (stepId: string) => {
      const step = workflow.steps.find((s) => s.id === stepId);
      return step?.status === "approved" || step?.status === "skipped";
    },
    [workflow.steps]
  );

  const getStep = useCallback(
    (stepId: string) => workflow.steps.find((s) => s.id === stepId),
    [workflow.steps]
  );

  const getStepApprovers = useCallback(
    (stepId: string) => {
      const step = workflow.steps.find((s) => s.id === stepId);
      return step?.requiredApprovers ?? [];
    },
    [workflow.steps]
  );

  const getRemainingApprovers = useCallback(
    (stepId: string) => {
      const step = workflow.steps.find((s) => s.id === stepId);
      if (!step) return [];

      const approvedUserIds = new Set(
        step.actions.filter((a) => a.type === "approve").map((a) => a.approver.id)
      );

      return step.requiredApprovers.filter((a) => !approvedUserIds.has(a.id));
    },
    [workflow.steps]
  );

  // Navigation
  const goToStep = useCallback(
    (stepId: string) => {
      const index = workflow.steps.findIndex((s) => s.id === stepId);
      if (index >= 0) {
        setViewingStepIndex(index);
      }
    },
    [workflow.steps]
  );

  const getNextStep = useCallback((): ApprovalStep | null => {
    const nextIndex = state.currentStepIndex + 1;
    const nextStep = workflow.steps[nextIndex];
    return nextStep !== undefined ? nextStep : null;
  }, [workflow.steps, state.currentStepIndex]);

  const getPreviousStep = useCallback((): ApprovalStep | null => {
    const prevIndex = state.currentStepIndex - 1;
    if (prevIndex < 0) return null;
    const prevStep = workflow.steps[prevIndex];
    return prevStep !== undefined ? prevStep : null;
  }, [workflow.steps, state.currentStepIndex]);

  return {
    state,

    // Step actions
    approve,
    reject,
    requestChanges,
    delegate,
    skipStep,

    // Workflow actions
    cancel,
    resetToDraft,
    restart,

    // Query helpers
    canApprove,
    canReject,
    isCurrentStep,
    isStepComplete,
    getStep,
    getStepApprovers,
    getRemainingApprovers,

    // Navigation
    goToStep,
    getNextStep,
    getPreviousStep,
  };
}
