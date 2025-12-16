/**
 * Approval Rules Utilities
 *
 * Functions for evaluating approval rules in B2B workflows.
 */

/**
 * Approval rule condition type
 */
export type RuleConditionType =
  | "amount_greater_than"
  | "amount_less_than"
  | "amount_between"
  | "quantity_greater_than"
  | "quantity_less_than"
  | "category_in"
  | "category_not_in"
  | "user_role_in"
  | "user_role_not_in"
  | "department_in"
  | "department_not_in"
  | "cost_center_in"
  | "cost_center_not_in"
  | "vendor_in"
  | "vendor_not_in"
  | "custom";

/**
 * Approval rule condition
 */
export interface RuleCondition {
  type: RuleConditionType;
  value: unknown;
  valueTo?: unknown; // For 'between' conditions
}

/**
 * Approval rule action
 */
export type RuleActionType =
  | "auto_approve"
  | "require_approval"
  | "require_multi_approval"
  | "escalate"
  | "reject"
  | "notify";

/**
 * Approval rule action configuration
 */
export interface RuleAction {
  type: RuleActionType;
  /** Approver IDs (for require_approval) */
  approverIds?: string[];
  /** Number of approvals required (for multi_approval) */
  requiredApprovals?: number;
  /** Escalation target ID */
  escalateTo?: string;
  /** Notification message */
  message?: string;
  /** Notification recipients */
  notifyRecipients?: string[];
}

/**
 * Complete approval rule
 */
export interface ApprovalRule {
  id: string;
  name: string;
  description?: string;
  /** Conditions that must all be met (AND logic) */
  conditions: RuleCondition[];
  /** Action to take when rule matches */
  action: RuleAction;
  /** Rule priority (lower = higher priority) */
  priority: number;
  /** Whether rule is active */
  isActive: boolean;
}

/**
 * Context for rule evaluation
 */
export interface RuleEvaluationContext {
  /** Order/request amount */
  amount?: number;
  /** Total quantity */
  quantity?: number;
  /** Item categories */
  categories?: string[];
  /** User role */
  userRole?: string;
  /** User department */
  department?: string;
  /** Cost center */
  costCenter?: string;
  /** Vendor/supplier ID */
  vendorId?: string;
  /** Custom data for custom conditions */
  customData?: Record<string, unknown>;
}

/**
 * Rule evaluation result
 */
export interface RuleEvaluationResult {
  /** Whether any rule matched */
  matched: boolean;
  /** Matching rule (if any) */
  matchedRule?: ApprovalRule;
  /** Action to take */
  action?: RuleAction;
  /** All evaluated rules with their match status */
  evaluations: Array<{
    rule: ApprovalRule;
    matched: boolean;
    failedConditions: RuleCondition[];
  }>;
}

/**
 * Evaluate a single condition against context
 */
export function evaluateCondition(
  condition: RuleCondition,
  context: RuleEvaluationContext
): boolean {
  switch (condition.type) {
    case "amount_greater_than":
      return (
        context.amount !== undefined &&
        context.amount > (condition.value as number)
      );

    case "amount_less_than":
      return (
        context.amount !== undefined &&
        context.amount < (condition.value as number)
      );

    case "amount_between":
      return (
        context.amount !== undefined &&
        context.amount >= (condition.value as number) &&
        context.amount <= (condition.valueTo as number)
      );

    case "quantity_greater_than":
      return (
        context.quantity !== undefined &&
        context.quantity > (condition.value as number)
      );

    case "quantity_less_than":
      return (
        context.quantity !== undefined &&
        context.quantity < (condition.value as number)
      );

    case "category_in":
      return (
        context.categories !== undefined &&
        (condition.value as string[]).some((cat) =>
          context.categories!.includes(cat)
        )
      );

    case "category_not_in":
      return (
        context.categories !== undefined &&
        !(condition.value as string[]).some((cat) =>
          context.categories!.includes(cat)
        )
      );

    case "user_role_in":
      return (
        context.userRole !== undefined &&
        (condition.value as string[]).includes(context.userRole)
      );

    case "user_role_not_in":
      return (
        context.userRole !== undefined &&
        !(condition.value as string[]).includes(context.userRole)
      );

    case "department_in":
      return (
        context.department !== undefined &&
        (condition.value as string[]).includes(context.department)
      );

    case "department_not_in":
      return (
        context.department !== undefined &&
        !(condition.value as string[]).includes(context.department)
      );

    case "cost_center_in":
      return (
        context.costCenter !== undefined &&
        (condition.value as string[]).includes(context.costCenter)
      );

    case "cost_center_not_in":
      return (
        context.costCenter !== undefined &&
        !(condition.value as string[]).includes(context.costCenter)
      );

    case "vendor_in":
      return (
        context.vendorId !== undefined &&
        (condition.value as string[]).includes(context.vendorId)
      );

    case "vendor_not_in":
      return (
        context.vendorId !== undefined &&
        !(condition.value as string[]).includes(context.vendorId)
      );

    case "custom":
      // Custom conditions require a custom evaluator
      // The value should be a function or key to look up in customData
      if (typeof condition.value === "function") {
        return (condition.value as (ctx: RuleEvaluationContext) => boolean)(
          context
        );
      }
      return false;

    default:
      return false;
  }
}

/**
 * Evaluate a single rule against context
 */
export function evaluateRule(
  rule: ApprovalRule,
  context: RuleEvaluationContext
): { matched: boolean; failedConditions: RuleCondition[] } {
  if (!rule.isActive) {
    return { matched: false, failedConditions: rule.conditions };
  }

  const failedConditions: RuleCondition[] = [];

  for (const condition of rule.conditions) {
    if (!evaluateCondition(condition, context)) {
      failedConditions.push(condition);
    }
  }

  return {
    matched: failedConditions.length === 0,
    failedConditions,
  };
}

/**
 * Evaluate all rules and return the first matching rule (by priority)
 */
export function evaluateRules(
  rules: ApprovalRule[],
  context: RuleEvaluationContext
): RuleEvaluationResult {
  // Sort rules by priority (lower number = higher priority)
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

  const evaluations: RuleEvaluationResult["evaluations"] = [];
  let matchedRule: ApprovalRule | undefined;

  for (const rule of sortedRules) {
    const { matched, failedConditions } = evaluateRule(rule, context);

    evaluations.push({
      rule,
      matched,
      failedConditions,
    });

    if (matched && !matchedRule) {
      matchedRule = rule;
      // Continue evaluating remaining rules for completeness
    }
  }

  const result: RuleEvaluationResult = {
    matched: matchedRule !== undefined,
    evaluations,
  };

  if (matchedRule) {
    result.matchedRule = matchedRule;
    result.action = matchedRule.action;
  }

  return result;
}

/**
 * Get required approvers based on rule evaluation result
 */
export function getRequiredApprovers(result: RuleEvaluationResult): string[] {
  if (!result.matched || !result.action) {
    return [];
  }

  switch (result.action.type) {
    case "require_approval":
    case "require_multi_approval":
      return result.action.approverIds ?? [];

    case "escalate":
      return result.action.escalateTo ? [result.action.escalateTo] : [];

    default:
      return [];
  }
}

/**
 * Check if approval is required based on rules
 */
export function requiresApproval(result: RuleEvaluationResult): boolean {
  if (!result.matched || !result.action) {
    // Default: require approval if no rule matches
    return true;
  }

  return (
    result.action.type === "require_approval" ||
    result.action.type === "require_multi_approval" ||
    result.action.type === "escalate"
  );
}

/**
 * Check if auto-approval is allowed based on rules
 */
export function canAutoApprove(result: RuleEvaluationResult): boolean {
  return result.matched && result.action?.type === "auto_approve";
}

/**
 * Check if request should be rejected based on rules
 */
export function shouldReject(result: RuleEvaluationResult): boolean {
  return result.matched && result.action?.type === "reject";
}

/**
 * Create a simple amount-based approval rule
 */
export function createAmountRule(
  id: string,
  name: string,
  threshold: number,
  action: RuleAction,
  priority: number = 100
): ApprovalRule {
  return {
    id,
    name,
    conditions: [
      {
        type: "amount_greater_than",
        value: threshold,
      },
    ],
    action,
    priority,
    isActive: true,
  };
}

/**
 * Create a role-based approval rule
 */
export function createRoleRule(
  id: string,
  name: string,
  roles: string[],
  action: RuleAction,
  priority: number = 100
): ApprovalRule {
  return {
    id,
    name,
    conditions: [
      {
        type: "user_role_in",
        value: roles,
      },
    ],
    action,
    priority,
    isActive: true,
  };
}

/**
 * Create a department-based approval rule
 */
export function createDepartmentRule(
  id: string,
  name: string,
  departments: string[],
  action: RuleAction,
  priority: number = 100
): ApprovalRule {
  return {
    id,
    name,
    conditions: [
      {
        type: "department_in",
        value: departments,
      },
    ],
    action,
    priority,
    isActive: true,
  };
}

/**
 * Default approval rules for B2B
 */
export const DEFAULT_APPROVAL_RULES: ApprovalRule[] = [
  {
    id: "auto-approve-small",
    name: "Auto-approve small orders",
    description: "Automatically approve orders under 500",
    conditions: [{ type: "amount_less_than", value: 500 }],
    action: { type: "auto_approve" },
    priority: 10,
    isActive: true,
  },
  {
    id: "manager-approval-medium",
    name: "Manager approval for medium orders",
    description: "Require manager approval for orders 500-5000",
    conditions: [{ type: "amount_between", value: 500, valueTo: 5000 }],
    action: {
      type: "require_approval",
      approverIds: [], // To be filled with manager IDs
    },
    priority: 20,
    isActive: true,
  },
  {
    id: "executive-approval-large",
    name: "Executive approval for large orders",
    description: "Require executive approval for orders over 5000",
    conditions: [{ type: "amount_greater_than", value: 5000 }],
    action: {
      type: "require_multi_approval",
      approverIds: [], // To be filled with executive IDs
      requiredApprovals: 2,
    },
    priority: 30,
    isActive: true,
  },
];
