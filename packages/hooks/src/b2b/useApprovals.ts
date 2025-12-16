/**
 * Approvals Hook
 *
 * Provides access to B2B approval workflow management.
 */

import { useState, useCallback } from "react";
import type { ApprovalRequest, ApprovalStatus, ApprovalEntityType } from "@maison/types";
import type { ICommerceClient } from "@maison/api-client";
import { useApiQuery, invalidateQueries } from "../api/useApiQuery";
import { useApiMutation } from "../api/useApiMutation";

/**
 * Alias for ApprovalRequest for easier usage
 */
export type Approval = ApprovalRequest;

/**
 * Alias for ApprovalEntityType for easier usage
 */
export type ApprovalType = ApprovalEntityType;

/**
 * Approval filter options
 */
export interface ApprovalFilters {
  /** Filter by status */
  status?: ApprovalStatus | ApprovalStatus[];
  /** Filter by type */
  type?: ApprovalType;
  /** Filter by company ID */
  companyId?: string;
  /** Filter by requester ID */
  requesterId?: string;
  /** Only show my pending approvals */
  pendingForMe?: boolean;
}

/**
 * Approval decision input
 */
export interface ApprovalDecisionInput {
  /** Whether to approve */
  approved: boolean;
  /** Decision comment */
  comment?: string;
  /** Forward to another approver */
  forwardTo?: string;
}

/**
 * Approvals hook result
 */
export interface UseApprovalsResult {
  /** List of approvals */
  approvals: Approval[];
  /** Pending approvals count */
  pendingCount: number;
  /** Loading state */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
  /** Get approval details */
  getApproval: (approvalId: string) => Promise<Approval>;
  /** Approve a request */
  approve: (approvalId: string, comment?: string) => Promise<Approval>;
  /** Reject a request */
  reject: (approvalId: string, comment?: string) => Promise<Approval>;
  /** Forward approval to another person */
  forward: (approvalId: string, toEmployeeId: string, comment?: string) => Promise<Approval>;
  /** Request approval (for order/quote) */
  requestApproval: (input: RequestApprovalInput) => Promise<Approval>;
  /** Current filters */
  filters: ApprovalFilters;
  /** Set filters */
  setFilters: (filters: ApprovalFilters) => void;
  /** Refresh approvals */
  refresh: () => void;
}

/**
 * Request approval input
 */
export interface RequestApprovalInput {
  /** Type of approval */
  type: ApprovalType;
  /** Related entity ID (order, quote, etc.) */
  entityId: string;
  /** Approval amount */
  amount?: number;
  /** Request message */
  message?: string;
  /** Urgency level */
  urgency?: "low" | "normal" | "high";
}

/**
 * Hook for managing B2B approval workflows
 *
 * @param api - API client instance
 * @param initialFilters - Initial filter values
 * @returns Approvals state and actions
 *
 * @example
 * ```typescript
 * const {
 *   approvals,
 *   pendingCount,
 *   approve,
 *   reject,
 *   setFilters
 * } = useApprovals(api, { pendingForMe: true });
 *
 * // Approve a request
 * await approve('approval_123', 'Looks good');
 *
 * // Reject a request
 * await reject('approval_456', 'Budget exceeded');
 * ```
 */
export function useApprovals(
  api: ICommerceClient,
  initialFilters: ApprovalFilters = {}
): UseApprovalsResult {
  const [filters, setFilters] = useState<ApprovalFilters>(initialFilters);

  // Query for approvals list
  const {
    data: approvals,
    isLoading,
    error,
    refetch,
  } = useApiQuery<Approval[]>(
    ["approvals", filters],
    async () => {
      if (!api?.b2b?.approvals) {
        return [];
      }
      const result = await api.b2b.approvals.list(filters);
      return result.items ?? result;
    },
    {
      enabled: !!api?.b2b?.approvals,
      staleTime: 15000, // 15 seconds - approvals need fresher data
    }
  );

  // Count pending approvals
  const pendingCount = (approvals ?? []).filter(
    (a) => a.status === "pending"
  ).length;

  // Approve mutation
  const approveMutation = useApiMutation<Approval, { approvalId: string; comment?: string }>(
    async ({ approvalId, comment }) => {
      if (!api?.b2b?.approvals) {
        throw new Error("B2B approvals not available");
      }
      return api.b2b.approvals.decide(approvalId, {
        approved: true,
        comment,
      });
    },
    {
      invalidateKeys: [["approvals"], ["orders"], ["quotes"]],
    }
  );

  // Reject mutation
  const rejectMutation = useApiMutation<Approval, { approvalId: string; comment?: string }>(
    async ({ approvalId, comment }) => {
      if (!api?.b2b?.approvals) {
        throw new Error("B2B approvals not available");
      }
      return api.b2b.approvals.decide(approvalId, {
        approved: false,
        comment,
      });
    },
    {
      invalidateKeys: [["approvals"], ["orders"], ["quotes"]],
    }
  );

  // Forward mutation
  const forwardMutation = useApiMutation<
    Approval,
    { approvalId: string; toEmployeeId: string; comment?: string }
  >(
    async ({ approvalId, toEmployeeId, comment }) => {
      if (!api?.b2b?.approvals) {
        throw new Error("B2B approvals not available");
      }
      return api.b2b.approvals.forward(approvalId, toEmployeeId, comment);
    },
    {
      invalidateKeys: [["approvals"]],
    }
  );

  // Request approval mutation
  const requestMutation = useApiMutation<Approval, RequestApprovalInput>(
    async (input) => {
      if (!api?.b2b?.approvals) {
        throw new Error("B2B approvals not available");
      }
      return api.b2b.approvals.request(input);
    },
    {
      invalidateKeys: [["approvals"]],
    }
  );

  const getApproval = useCallback(
    async (approvalId: string): Promise<Approval> => {
      if (!api?.b2b?.approvals) {
        throw new Error("B2B approvals not available");
      }
      return api.b2b.approvals.get(approvalId);
    },
    [api]
  );

  return {
    approvals: approvals ?? [],
    pendingCount,
    isLoading,
    error,
    filters,
    setFilters: (newFilters) => {
      setFilters(newFilters);
      invalidateQueries(["approvals", newFilters]);
    },
    getApproval,
    approve: (approvalId, comment) =>
      approveMutation.mutateAsync({ approvalId, comment }),
    reject: (approvalId, comment) =>
      rejectMutation.mutateAsync({ approvalId, comment }),
    forward: (approvalId, toEmployeeId, comment) =>
      forwardMutation.mutateAsync({ approvalId, toEmployeeId, comment }),
    requestApproval: requestMutation.mutateAsync,
    refresh: refetch,
  };
}
