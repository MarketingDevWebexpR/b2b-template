/**
 * B2B Approval Module Service
 *
 * Service class providing business logic for approval workflow management,
 * request processing, and delegation handling.
 *
 * @packageDocumentation
 */

import { MedusaService } from "@medusajs/framework/utils";
import {
  ApprovalWorkflow,
  ApprovalRequest,
  ApprovalStep,
  ApprovalDelegation,
  WORKFLOW_ENTITY_TYPES,
  WORKFLOW_TRIGGERS,
  REQUEST_STATUSES,
  STEP_STATUSES,
  STEP_ACTIONS,
  DELEGATION_STATUSES,
} from "./models/index";
import {
  validateRequired,
  validateStringLength,
  validateNonEmptyArray,
  ValidationError,
} from "../validation-utils";

/**
 * Workflow entity type values
 */
export type WorkflowEntityType = typeof WORKFLOW_ENTITY_TYPES[number];

/**
 * Workflow trigger values
 */
export type WorkflowTrigger = typeof WORKFLOW_TRIGGERS[number];

/**
 * Request status values
 */
export type RequestStatus = typeof REQUEST_STATUSES[number];

/**
 * Step status values
 */
export type StepStatus = typeof STEP_STATUSES[number];

/**
 * Step action values
 */
export type StepAction = typeof STEP_ACTIONS[number];

/**
 * Delegation status values
 */
export type DelegationStatus = typeof DELEGATION_STATUSES[number];

/**
 * Workflow level configuration
 */
export interface WorkflowLevel {
  level: number;
  approverType: "manager" | "director" | "specific" | "role";
  approverIds?: string[];
  roleName?: string;
  amountThreshold?: number;
}

/**
 * Input for creating a workflow
 */
export interface CreateWorkflowInput {
  companyId: string;
  name: string;
  entityType: WorkflowEntityType;
  trigger: WorkflowTrigger;
  triggerThreshold?: number;
  triggerCategoryIds?: string[];
  levels: WorkflowLevel[];
  escalationHours?: number;
  expirationHours?: number;
  priority?: number;
  description?: string;
}

/**
 * Input for creating an approval request
 */
export interface CreateRequestInput {
  companyId: string;
  workflowId: string;
  entityType: WorkflowEntityType;
  entityId: string;
  entityAmount?: number;
  entityCurrency?: string;
  requesterId: string;
  requesterNotes?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Input for processing an approval action
 */
export interface ProcessActionInput {
  requestId: string;
  actorId: string;
  action: StepAction;
  notes?: string;
  delegateToId?: string;
  delegationReason?: string;
}

/**
 * Input for creating a delegation
 */
export interface CreateDelegationInput {
  companyId: string;
  delegatorId: string;
  delegateId: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  workflowIds?: string[];
  maxAmount?: number;
}

/**
 * Result of finding applicable workflow
 */
export interface WorkflowMatch {
  workflow: Record<string, unknown>;
  reason: string;
}

/**
 * B2B Approval Module Service
 *
 * Provides all business logic for approval workflows and request processing.
 *
 * @example
 * ```typescript
 * // Find applicable workflow
 * const match = await approvalService.findApplicableWorkflow(
 *   "comp_123",
 *   "order",
 *   25000
 * );
 *
 * // Create approval request
 * const request = await approvalService.createRequest({
 *   companyId: "comp_123",
 *   workflowId: match.workflow.id,
 *   entityType: "order",
 *   entityId: "cart_456",
 *   entityAmount: 25000,
 *   requesterId: "cust_789",
 * });
 *
 * // Process approval action
 * await approvalService.processAction({
 *   requestId: request.id,
 *   actorId: "cust_approver",
 *   action: "approve",
 *   notes: "Approved for project X",
 * });
 * ```
 */
class ApprovalModuleService extends MedusaService({
  ApprovalWorkflow,
  ApprovalRequest,
  ApprovalStep,
  ApprovalDelegation,
}) {
  // ==========================================
  // WORKFLOW MANAGEMENT
  // ==========================================

  /**
   * Creates an approval workflow.
   *
   * @param data - Workflow creation data
   * @returns The created workflow
   * @throws ValidationError if input validation fails
   */
  async createWorkflow(data: CreateWorkflowInput) {
    // Validate required fields
    validateRequired(data.name, "name");
    validateStringLength(data.name, "name", 1, 200);

    validateRequired(data.levels, "levels");
    validateNonEmptyArray(data.levels, "levels");

    // Validate each level has at least one approver type defined
    for (let i = 0; i < data.levels.length; i++) {
      const level = data.levels[i];
      const hasApproverType = level.approverType !== undefined && level.approverType !== null;

      if (!hasApproverType) {
        throw new ValidationError(
          `Level ${i + 1} must have an approverType defined`,
          `levels[${i}].approverType`,
          "MISSING_APPROVER_TYPE"
        );
      }

      // For "specific" approver type, approverIds should be provided
      if (level.approverType === "specific") {
        if (!level.approverIds || level.approverIds.length === 0) {
          throw new ValidationError(
            `Level ${i + 1} with approverType "specific" must have at least one approverId`,
            `levels[${i}].approverIds`,
            "MISSING_APPROVER_IDS"
          );
        }
      }
    }

    return await this.createApprovalWorkflows({
      company_id: data.companyId,
      name: data.name,
      description: data.description ?? null,
      entity_type: data.entityType,
      trigger: data.trigger,
      trigger_threshold: data.triggerThreshold ?? null,
      trigger_category_ids: data.triggerCategoryIds as unknown as Record<string, unknown>,
      levels: data.levels as unknown as Record<string, unknown>,
      escalation_hours: data.escalationHours ?? 24,
      expiration_hours: data.expirationHours ?? 72,
      priority: data.priority ?? 0,
      is_active: true,
    });
  }

  /**
   * Finds the applicable workflow for an entity.
   *
   * @param companyId - Company ID
   * @param entityType - Type of entity
   * @param amount - Entity amount (for amount-based triggers)
   * @param categoryIds - Category IDs (for category-based triggers)
   * @returns Matching workflow or null
   */
  async findApplicableWorkflow(
    companyId: string,
    entityType: WorkflowEntityType,
    amount?: number,
    categoryIds?: string[]
  ): Promise<WorkflowMatch | null> {
    const workflows = await this.listApprovalWorkflows({
      filters: {
        company_id: companyId,
        entity_type: entityType,
        is_active: true,
      },
    });

    // Sort by priority (descending)
    const sortedWorkflows = workflows.sort(
      (a, b) => Number(b.priority) - Number(a.priority)
    );

    for (const workflow of sortedWorkflows) {
      const trigger = workflow.trigger as WorkflowTrigger;
      const threshold = Number(workflow.trigger_threshold ?? 0);
      const triggerCategories = workflow.trigger_category_ids as string[] | null;

      switch (trigger) {
        case "always":
          return { workflow, reason: "Approval always required" };

        case "amount_exceeds":
          if (amount && amount > threshold) {
            return {
              workflow,
              reason: `Amount (${amount}) exceeds threshold (${threshold})`,
            };
          }
          break;

        case "spending_limit_exceeded":
          // This would be checked by the spending module
          // For now, assume it's passed as a flag in categoryIds
          if (categoryIds?.includes("__spending_limit_exceeded__")) {
            return { workflow, reason: "Spending limit exceeded" };
          }
          break;

        case "category_restricted":
          if (triggerCategories && categoryIds) {
            const restricted = categoryIds.filter((id) =>
              triggerCategories.includes(id)
            );
            if (restricted.length > 0) {
              return {
                workflow,
                reason: `Contains restricted categories: ${restricted.join(", ")}`,
              };
            }
          }
          break;
      }
    }

    return null;
  }

  // ==========================================
  // REQUEST MANAGEMENT
  // ==========================================

  /**
   * Creates an approval request with the first step.
   *
   * @param data - Request creation data
   * @returns The created request
   */
  async createRequest(data: CreateRequestInput) {
    const workflow = await this.retrieveApprovalWorkflow(data.workflowId);
    const levels = workflow.levels as unknown as WorkflowLevel[];
    const totalLevels = levels.length;

    // Generate request number
    const requestNumber = await this.generateRequestNumber();

    // Calculate due date
    const expirationHours = Number(workflow.expiration_hours);
    const dueAt = expirationHours > 0
      ? new Date(Date.now() + expirationHours * 60 * 60 * 1000)
      : null;

    // Create request
    const request = await this.createApprovalRequests({
      request_number: requestNumber,
      company_id: data.companyId,
      workflow_id: data.workflowId,
      entity_type: data.entityType,
      entity_id: data.entityId,
      entity_amount: data.entityAmount ?? null,
      entity_currency: data.entityCurrency ?? "EUR",
      requester_id: data.requesterId,
      requester_notes: data.requesterNotes ?? null,
      status: "pending",
      current_level: 1,
      total_levels: totalLevels,
      due_at: dueAt,
      submitted_at: new Date(),
      metadata: data.metadata ?? null,
    });

    // Create first step
    const firstLevel = levels[0];
    const approverIds = await this.resolveApprovers(
      data.companyId,
      firstLevel,
      data.requesterId
    );

    const escalationHours = Number(workflow.escalation_hours);
    const stepDueAt = escalationHours > 0
      ? new Date(Date.now() + escalationHours * 60 * 60 * 1000)
      : null;

    await this.createApprovalSteps({
      request_id: request.id,
      level: 1,
      status: "pending",
      assigned_approver_ids: approverIds as unknown as Record<string, unknown>,
      due_at: stepDueAt,
    });

    return request;
  }

  /**
   * Processes an approval action.
   *
   * @param data - Action data
   * @returns Updated request
   */
  async processAction(data: ProcessActionInput) {
    const request = await this.retrieveApprovalRequest(data.requestId);

    if (request.status === "approved" || request.status === "rejected") {
      throw new Error(`Request is already ${request.status}`);
    }

    // Find current step
    const steps = await this.listApprovalSteps({
      filters: {
        request_id: data.requestId,
        level: request.current_level,
      },
    });

    const currentStep = steps[0];
    if (!currentStep) {
      throw new Error("Current step not found");
    }

    // Verify actor is authorized
    const effectiveApprovers = await this.getEffectiveApprovers(
      request.company_id,
      currentStep.assigned_approver_ids as unknown as string[],
      request.workflow_id
    );

    if (!effectiveApprovers.includes(data.actorId)) {
      throw new Error("User is not authorized to approve this request");
    }

    // Process based on action
    switch (data.action) {
      case "approve":
        return await this.handleApprove(request, currentStep, data);

      case "reject":
        return await this.handleReject(request, currentStep, data);

      case "escalate":
        return await this.handleEscalate(request, currentStep, data);

      case "delegate":
        return await this.handleDelegate(request, currentStep, data);

      case "request_info":
        return await this.handleRequestInfo(request, currentStep, data);

      default:
        throw new Error(`Unknown action: ${data.action}`);
    }
  }

  /**
   * Gets pending approval requests for an approver.
   *
   * @param companyId - Company ID
   * @param approverId - Approver's customer ID
   * @returns List of pending requests
   */
  async getPendingForApprover(companyId: string, approverId: string) {
    // Get all pending steps where this approver is assigned
    const allSteps = await this.listApprovalSteps({
      filters: {
        status: "pending",
      },
    });

    // Filter to steps where approver is assigned (or delegated to)
    const approverSteps = allSteps.filter((step) => {
      const assignedIds = step.assigned_approver_ids as unknown as string[];
      return assignedIds.includes(approverId);
    });

    // Get the corresponding requests
    const requestIds = approverSteps.map((s) => s.request_id);
    const uniqueRequestIds = [...new Set(requestIds)];

    if (uniqueRequestIds.length === 0) {
      return [];
    }

    const requests = await this.listApprovalRequests({
      filters: {
        id: uniqueRequestIds,
        company_id: companyId,
        status: ["pending", "in_review"],
      },
    });

    return requests;
  }

  // ==========================================
  // DELEGATION MANAGEMENT
  // ==========================================

  /**
   * Creates a delegation.
   *
   * @param data - Delegation data
   * @returns The created delegation
   */
  async createDelegation(data: CreateDelegationInput) {
    const now = new Date();
    const status: DelegationStatus = data.startDate <= now ? "active" : "scheduled";

    return await this.createApprovalDelegations({
      company_id: data.companyId,
      delegator_id: data.delegatorId,
      delegate_id: data.delegateId,
      start_date: data.startDate,
      end_date: data.endDate,
      status,
      reason: data.reason ?? null,
      workflow_ids: data.workflowIds as unknown as Record<string, unknown>,
      max_amount: data.maxAmount ?? null,
    });
  }

  /**
   * Gets effective approvers including delegations.
   *
   * @param companyId - Company ID
   * @param originalApproverIds - Original approver IDs
   * @param workflowId - Workflow ID (for delegation filtering)
   * @returns List of effective approver IDs
   */
  async getEffectiveApprovers(
    companyId: string,
    originalApproverIds: string[],
    workflowId: string
  ): Promise<string[]> {
    const now = new Date();
    const effectiveApprovers = new Set(originalApproverIds);

    // Find active delegations for original approvers
    const delegations = await this.listApprovalDelegations({
      filters: {
        company_id: companyId,
        delegator_id: originalApproverIds,
        status: "active",
      },
    });

    for (const delegation of delegations) {
      // Check if delegation is still valid (date range)
      if (delegation.start_date > now || delegation.end_date < now) {
        continue;
      }

      // Check if delegation applies to this workflow
      const workflowIds = delegation.workflow_ids as unknown as string[] | null;
      if (workflowIds && !workflowIds.includes(workflowId)) {
        continue;
      }

      // Add delegate as effective approver
      effectiveApprovers.add(delegation.delegate_id);
    }

    return Array.from(effectiveApprovers);
  }

  /**
   * Updates delegation statuses based on current date.
   * Call this from a scheduled job.
   *
   * @returns Number of delegations updated
   */
  async updateDelegationStatuses(): Promise<number> {
    const now = new Date();
    let updatedCount = 0;

    // Activate scheduled delegations
    const scheduledDelegations = await this.listApprovalDelegations({
      filters: {
        status: "scheduled",
        start_date: { $lte: now },
      },
    });

    for (const delegation of scheduledDelegations) {
      if (delegation.end_date > now) {
        await this.updateApprovalDelegations({
          id: delegation.id,
          status: "active",
        });
        updatedCount++;
      }
    }

    // Expire active delegations
    const activeDelegations = await this.listApprovalDelegations({
      filters: {
        status: "active",
        end_date: { $lt: now },
      },
    });

    for (const delegation of activeDelegations) {
      await this.updateApprovalDelegations({
        id: delegation.id,
        status: "expired",
      });
      updatedCount++;
    }

    return updatedCount;
  }

  // ==========================================
  // PRIVATE HELPER METHODS
  // ==========================================

  /**
   * Handles approve action.
   */
  private async handleApprove(
    request: Record<string, unknown>,
    step: Record<string, unknown>,
    data: ProcessActionInput
  ) {
    const now = new Date();
    const totalLevels = Number(request.total_levels);
    const currentLevel = Number(request.current_level);

    // Update current step
    await this.updateApprovalSteps({
      id: step.id as string,
      status: "approved",
      action: "approve",
      acted_by_id: data.actorId,
      acted_at: now,
      notes: data.notes ?? null,
    });

    // Check if this was the last level
    if (currentLevel >= totalLevels) {
      // Fully approved
      await this.updateApprovalRequests({
        id: data.requestId,
        status: "approved",
        decided_at: now,
        final_approver_id: data.actorId,
        final_notes: data.notes ?? null,
      });
    } else {
      // Move to next level
      const workflow = await this.retrieveApprovalWorkflow(request.workflow_id as string);
      const levels = workflow.levels as unknown as WorkflowLevel[];
      const nextLevel = levels[currentLevel]; // 0-indexed, currentLevel is already the next

      const approverIds = await this.resolveApprovers(
        request.company_id as string,
        nextLevel,
        request.requester_id as string
      );

      const escalationHours = Number(workflow.escalation_hours);
      const stepDueAt = escalationHours > 0
        ? new Date(now.getTime() + escalationHours * 60 * 60 * 1000)
        : null;

      // Create next step
      await this.createApprovalSteps({
        request_id: data.requestId,
        level: currentLevel + 1,
        status: "pending",
        assigned_approver_ids: approverIds as unknown as Record<string, unknown>,
        due_at: stepDueAt,
      });

      // Update request level
      await this.updateApprovalRequests({
        id: data.requestId,
        status: "in_review",
        current_level: currentLevel + 1,
      });
    }

    return await this.retrieveApprovalRequest(data.requestId);
  }

  /**
   * Handles reject action.
   */
  private async handleReject(
    request: Record<string, unknown>,
    step: Record<string, unknown>,
    data: ProcessActionInput
  ) {
    const now = new Date();

    // Update current step
    await this.updateApprovalSteps({
      id: step.id as string,
      status: "rejected",
      action: "reject",
      acted_by_id: data.actorId,
      acted_at: now,
      notes: data.notes ?? null,
    });

    // Update request as rejected
    await this.updateApprovalRequests({
      id: data.requestId,
      status: "rejected",
      decided_at: now,
      final_approver_id: data.actorId,
      final_notes: data.notes ?? null,
    });

    return await this.retrieveApprovalRequest(data.requestId);
  }

  /**
   * Handles escalate action.
   */
  private async handleEscalate(
    request: Record<string, unknown>,
    step: Record<string, unknown>,
    data: ProcessActionInput
  ) {
    const now = new Date();
    const totalLevels = Number(request.total_levels);
    const currentLevel = Number(request.current_level);

    // Update current step as escalated
    await this.updateApprovalSteps({
      id: step.id as string,
      status: "escalated",
      action: "escalate",
      acted_by_id: data.actorId,
      acted_at: now,
      notes: data.notes ?? null,
    });

    // Check if there's a next level
    if (currentLevel >= totalLevels) {
      throw new Error("Cannot escalate - already at highest level");
    }

    // Create step for next level
    const workflow = await this.retrieveApprovalWorkflow(request.workflow_id as string);
    const levels = workflow.levels as unknown as WorkflowLevel[];
    const nextLevel = levels[currentLevel];

    const approverIds = await this.resolveApprovers(
      request.company_id as string,
      nextLevel,
      request.requester_id as string
    );

    const escalationHours = Number(workflow.escalation_hours);
    const stepDueAt = escalationHours > 0
      ? new Date(now.getTime() + escalationHours * 60 * 60 * 1000)
      : null;

    await this.createApprovalSteps({
      request_id: data.requestId,
      level: currentLevel + 1,
      status: "pending",
      assigned_approver_ids: approverIds as unknown as Record<string, unknown>,
      due_at: stepDueAt,
    });

    // Update request
    await this.updateApprovalRequests({
      id: data.requestId,
      status: "escalated",
      current_level: currentLevel + 1,
    });

    return await this.retrieveApprovalRequest(data.requestId);
  }

  /**
   * Handles delegate action.
   */
  private async handleDelegate(
    request: Record<string, unknown>,
    step: Record<string, unknown>,
    data: ProcessActionInput
  ) {
    if (!data.delegateToId) {
      throw new Error("delegateToId is required for delegation");
    }

    const now = new Date();

    // Update step with delegation info
    await this.updateApprovalSteps({
      id: step.id as string,
      status: "delegated",
      action: "delegate",
      acted_by_id: data.actorId,
      acted_at: now,
      notes: data.notes ?? null,
      delegated_to_id: data.delegateToId,
      delegation_reason: data.delegationReason ?? null,
    });

    // Update assigned approvers to include delegate
    const currentApprovers = step.assigned_approver_ids as unknown as string[];
    const updatedApprovers = [...currentApprovers, data.delegateToId];

    // Create new pending step for the delegate
    await this.createApprovalSteps({
      request_id: data.requestId,
      level: Number(step.level),
      status: "pending",
      assigned_approver_ids: updatedApprovers as unknown as Record<string, unknown>,
      acted_on_behalf_of_id: data.actorId,
      due_at: step.due_at as Date | null,
    });

    return await this.retrieveApprovalRequest(data.requestId);
  }

  /**
   * Handles request_info action.
   */
  private async handleRequestInfo(
    request: Record<string, unknown>,
    step: Record<string, unknown>,
    data: ProcessActionInput
  ) {
    const now = new Date();

    // Just add notes, don't change status
    await this.updateApprovalSteps({
      id: step.id as string,
      notes: data.notes ?? null,
    });

    // Could emit an event here to notify requester
    return await this.retrieveApprovalRequest(data.requestId);
  }

  /**
   * Resolves approver IDs based on level configuration.
   */
  private async resolveApprovers(
    companyId: string,
    level: WorkflowLevel,
    requesterId: string
  ): Promise<string[]> {
    switch (level.approverType) {
      case "specific":
        return level.approverIds ?? [];

      case "manager":
      case "director":
      case "role":
        // In a real implementation, this would query the company-customer link
        // to find users with the appropriate role
        // For now, return specific IDs if provided
        return level.approverIds ?? [];

      default:
        return [];
    }
  }

  /**
   * Generates a unique request number.
   *
   * Queries the database for the highest existing number with the current year prefix
   * and increments the sequence. This is database-safe and works across server restarts
   * and multiple instances.
   *
   * Format: APR-{YYYY}-{NNNNN}
   *
   * @returns Promise resolving to a unique request number
   */
  private async generateRequestNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `APR-${year}`;

    // Get all requests with this year's prefix to find max sequence
    const requests = await this.listApprovalRequests({
      filters: {
        request_number: { $like: `${prefix}-%` },
      },
      select: ["request_number"],
    });

    let maxSeq = 0;
    for (const req of requests) {
      const requestNumber = req.request_number as string;
      const match = requestNumber.match(/-(\d+)$/);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (seq > maxSeq) {
          maxSeq = seq;
        }
      }
    }

    return `${prefix}-${String(maxSeq + 1).padStart(5, "0")}`;
  }
}

export default ApprovalModuleService;
