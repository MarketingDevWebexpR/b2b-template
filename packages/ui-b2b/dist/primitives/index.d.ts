/**
 * DataTable Types
 *
 * Type definitions for headless data table component with
 * sorting, pagination, filtering, and row selection.
 */
/**
 * Sort direction for columns
 */
type SortDirection = "asc" | "desc" | null;
/**
 * Sort configuration for a column
 */
interface SortConfig<TData> {
    /** Column key to sort by */
    key: keyof TData | string;
    /** Sort direction */
    direction: SortDirection;
}
/**
 * Filter operator types
 */
type FilterOperator = "equals" | "notEquals" | "contains" | "notContains" | "startsWith" | "endsWith" | "gt" | "gte" | "lt" | "lte" | "between" | "in" | "notIn" | "isEmpty" | "isNotEmpty";
/**
 * Filter configuration for a column
 */
interface FilterConfig<TData> {
    /** Column key to filter */
    key: keyof TData | string;
    /** Filter operator */
    operator: FilterOperator;
    /** Filter value(s) */
    value: unknown;
    /** Second value for 'between' operator */
    valueTo?: unknown;
}
/**
 * Pagination configuration
 */
interface PaginationConfig {
    /** Current page index (0-based) */
    pageIndex: number;
    /** Number of items per page */
    pageSize: number;
}
/**
 * Pagination state with computed values
 */
interface PaginationState extends PaginationConfig {
    /** Total number of items */
    totalItems: number;
    /** Total number of pages */
    totalPages: number;
    /** Whether there is a previous page */
    hasPreviousPage: boolean;
    /** Whether there is a next page */
    hasNextPage: boolean;
    /** Start index for current page (1-based for display) */
    startIndex: number;
    /** End index for current page (1-based for display) */
    endIndex: number;
}
/**
 * Column definition for the data table
 */
interface ColumnDef<TData, TValue = unknown> {
    /** Unique column identifier */
    id: string;
    /** Access key for data (supports nested paths like 'user.name') */
    accessorKey?: keyof TData | string;
    /** Custom accessor function */
    accessorFn?: (row: TData) => TValue;
    /** Header label */
    header: string;
    /** Whether column is sortable */
    sortable?: boolean;
    /** Whether column is filterable */
    filterable?: boolean;
    /** Custom sort function */
    sortFn?: (a: TData, b: TData, direction: SortDirection) => number;
    /** Custom filter function */
    filterFn?: (row: TData, filter: FilterConfig<TData>) => boolean;
    /** Column width (CSS value) */
    width?: string | number;
    /** Minimum column width */
    minWidth?: string | number;
    /** Maximum column width */
    maxWidth?: string | number;
    /** Whether column is visible */
    visible?: boolean;
    /** Whether column can be resized */
    resizable?: boolean;
    /** Column alignment */
    align?: "left" | "center" | "right";
    /** Additional column metadata */
    meta?: Record<string, unknown>;
}
/**
 * Row selection mode
 */
type RowSelectionMode = "single" | "multiple" | "none";
/**
 * Row selection state
 */
interface RowSelectionState {
    /** Set of selected row IDs */
    selectedRowIds: Set<string>;
    /** Whether all visible rows are selected */
    allSelected: boolean;
    /** Whether some (but not all) rows are selected */
    someSelected: boolean;
}
/**
 * Data table state
 */
interface DataTableState<TData> {
    /** Current data (after sorting/filtering) */
    data: TData[];
    /** Original unprocessed data */
    originalData: TData[];
    /** Column definitions */
    columns: ColumnDef<TData>[];
    /** Current sort configuration */
    sort: SortConfig<TData> | null;
    /** Active filters */
    filters: FilterConfig<TData>[];
    /** Pagination state */
    pagination: PaginationState;
    /** Row selection state */
    rowSelection: RowSelectionState;
    /** Whether data is loading */
    isLoading: boolean;
    /** Error state */
    error: Error | null;
}
/**
 * Options for useDataTable hook
 */
interface UseDataTableOptions<TData> {
    /** Data array */
    data: TData[];
    /** Column definitions */
    columns: ColumnDef<TData>[];
    /** Function to get unique row ID */
    getRowId: (row: TData) => string;
    /** Initial page size */
    pageSize?: number;
    /** Available page sizes */
    pageSizeOptions?: number[];
    /** Row selection mode */
    selectionMode?: RowSelectionMode;
    /** Initial selected row IDs */
    initialSelection?: string[];
    /** Initial sort configuration */
    initialSort?: SortConfig<TData>;
    /** Initial filters */
    initialFilters?: FilterConfig<TData>[];
    /** Whether to enable client-side sorting */
    enableClientSideSort?: boolean;
    /** Whether to enable client-side filtering */
    enableClientSideFilter?: boolean;
    /** Whether to enable client-side pagination */
    enableClientSidePagination?: boolean;
    /** Server-side total count (for server-side pagination) */
    serverSideTotalCount?: number;
    /** Callback when sort changes */
    onSortChange?: (sort: SortConfig<TData> | null) => void;
    /** Callback when filters change */
    onFiltersChange?: (filters: FilterConfig<TData>[]) => void;
    /** Callback when pagination changes */
    onPaginationChange?: (pagination: PaginationConfig) => void;
    /** Callback when selection changes */
    onSelectionChange?: (selectedIds: string[]) => void;
}
/**
 * Return type for useDataTable hook
 */
interface UseDataTableReturn<TData> {
    /** Current table state */
    state: DataTableState<TData>;
    /** Set sort configuration */
    setSort: (sort: SortConfig<TData> | null) => void;
    /** Toggle sort for a column */
    toggleSort: (columnId: string) => void;
    /** Clear all sorting */
    clearSort: () => void;
    /** Set filter for a column */
    setFilter: (filter: FilterConfig<TData>) => void;
    /** Remove filter for a column */
    removeFilter: (columnKey: keyof TData | string) => void;
    /** Clear all filters */
    clearFilters: () => void;
    /** Set multiple filters at once */
    setFilters: (filters: FilterConfig<TData>[]) => void;
    /** Go to specific page */
    goToPage: (pageIndex: number) => void;
    /** Go to next page */
    nextPage: () => void;
    /** Go to previous page */
    previousPage: () => void;
    /** Go to first page */
    firstPage: () => void;
    /** Go to last page */
    lastPage: () => void;
    /** Set page size */
    setPageSize: (size: number) => void;
    /** Select a row */
    selectRow: (rowId: string) => void;
    /** Deselect a row */
    deselectRow: (rowId: string) => void;
    /** Toggle row selection */
    toggleRowSelection: (rowId: string) => void;
    /** Select all visible rows */
    selectAll: () => void;
    /** Deselect all rows */
    deselectAll: () => void;
    /** Toggle select all */
    toggleSelectAll: () => void;
    /** Check if a row is selected */
    isRowSelected: (rowId: string) => boolean;
    /** Get selected rows */
    getSelectedRows: () => TData[];
    /** Toggle column visibility */
    toggleColumnVisibility: (columnId: string) => void;
    /** Set column visibility */
    setColumnVisibility: (columnId: string, visible: boolean) => void;
    /** Get visible columns */
    getVisibleColumns: () => ColumnDef<TData>[];
    /** Get paginated data */
    getPaginatedData: () => TData[];
    /** Get all processed data (sorted/filtered) */
    getProcessedData: () => TData[];
    /** Get cell value */
    getCellValue: <TValue = unknown>(row: TData, columnId: string) => TValue;
    /** Reset to initial state */
    reset: () => void;
}

/**
 * Hook for headless data table state management
 *
 * Provides sorting, filtering, pagination, and row selection
 * functionality without any UI rendering.
 *
 * @example
 * ```tsx
 * const table = useDataTable({
 *   data: products,
 *   columns: [
 *     { id: 'name', accessorKey: 'name', header: 'Name', sortable: true },
 *     { id: 'price', accessorKey: 'price', header: 'Price', sortable: true },
 *   ],
 *   getRowId: (row) => row.id,
 *   pageSize: 20,
 *   selectionMode: 'multiple',
 * });
 *
 * // Use table.state.data for current page data
 * // Use table.toggleSort('name') to sort by name
 * // Use table.nextPage() to go to next page
 * ```
 */
declare function useDataTable<TData>(options: UseDataTableOptions<TData>): UseDataTableReturn<TData>;

/**
 * BulkSelector Types
 *
 * Type definitions for bulk selection functionality with
 * "select all" support and partial selection states.
 */
/**
 * Selection state
 */
type SelectionState = "none" | "some" | "all";
/**
 * Item with required ID
 */
interface SelectableItem {
    /** Unique identifier for the item */
    id: string;
}
/**
 * Bulk selection state
 */
interface BulkSelectionState {
    /** Set of selected item IDs */
    selectedIds: Set<string>;
    /** Current selection state */
    selectionState: SelectionState;
    /** Number of selected items */
    selectedCount: number;
    /** Total number of selectable items */
    totalCount: number;
    /** Whether all items are selected */
    isAllSelected: boolean;
    /** Whether some (but not all) items are selected */
    isPartiallySelected: boolean;
    /** Whether no items are selected */
    isNoneSelected: boolean;
}
/**
 * Options for useBulkSelector hook
 */
interface UseBulkSelectorOptions<T extends SelectableItem> {
    /** Array of selectable items */
    items: T[];
    /** Initial selected IDs */
    initialSelectedIds?: string[];
    /** Function to get item ID (defaults to item.id) */
    getItemId?: (item: T) => string;
    /** Whether to allow selection (items can be disabled) */
    isItemSelectable?: (item: T) => boolean;
    /** Maximum number of items that can be selected */
    maxSelection?: number;
    /** Callback when selection changes */
    onSelectionChange?: (selectedIds: string[], selectedItems: T[]) => void;
}
/**
 * Return type for useBulkSelector hook
 */
interface UseBulkSelectorReturn<T extends SelectableItem> {
    /** Current selection state */
    state: BulkSelectionState;
    /** Select a single item */
    select: (id: string) => void;
    /** Deselect a single item */
    deselect: (id: string) => void;
    /** Toggle selection for a single item */
    toggle: (id: string) => void;
    /** Select all items */
    selectAll: () => void;
    /** Deselect all items */
    deselectAll: () => void;
    /** Toggle select all */
    toggleAll: () => void;
    /** Select multiple items by ID */
    selectMany: (ids: string[]) => void;
    /** Deselect multiple items by ID */
    deselectMany: (ids: string[]) => void;
    /** Set selection to specific IDs */
    setSelection: (ids: string[]) => void;
    /** Check if an item is selected */
    isSelected: (id: string) => boolean;
    /** Check if an item is selectable */
    canSelect: (id: string) => boolean;
    /** Get selected items */
    getSelectedItems: () => T[];
    /** Get selected IDs as array */
    getSelectedIds: () => string[];
    /** Select range from last selection to target */
    selectRange: (fromId: string, toId: string) => void;
    /** Reset to initial state */
    reset: () => void;
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
declare function useBulkSelector<T extends SelectableItem>(options: UseBulkSelectorOptions<T>): UseBulkSelectorReturn<T>;

/**
 * ApprovalFlow Types
 *
 * Type definitions for visual approval workflow component
 * supporting multi-step approval processes.
 */
/**
 * Status of an approval step
 */
type ApprovalStepStatus = "pending" | "in_review" | "approved" | "rejected" | "skipped" | "cancelled";
/**
 * Overall approval workflow status
 */
type ApprovalWorkflowStatus = "draft" | "pending" | "in_progress" | "approved" | "rejected" | "cancelled";
/**
 * Approver information
 */
interface Approver {
    /** Unique approver ID */
    id: string;
    /** Approver name */
    name: string;
    /** Approver email */
    email?: string;
    /** Approver role/title */
    role?: string;
    /** Avatar URL */
    avatarUrl?: string;
}
/**
 * Action taken on an approval step
 */
interface ApprovalAction {
    /** Action type */
    type: "approve" | "reject" | "request_changes" | "delegate" | "skip";
    /** Approver who took the action */
    approver: Approver;
    /** Timestamp of the action */
    timestamp: Date;
    /** Comments/notes for the action */
    comment?: string;
    /** Delegated to (if action is delegate) */
    delegatedTo?: Approver;
}
/**
 * Approval step definition
 */
interface ApprovalStep {
    /** Unique step ID */
    id: string;
    /** Step name/title */
    name: string;
    /** Step description */
    description?: string;
    /** Step order (0-based) */
    order: number;
    /** Current status */
    status: ApprovalStepStatus;
    /** Required approvers for this step */
    requiredApprovers: Approver[];
    /** Minimum number of approvals required */
    minApprovals: number;
    /** Actions taken on this step */
    actions: ApprovalAction[];
    /** Due date for this step */
    dueDate?: Date;
    /** Whether this step is optional */
    optional?: boolean;
    /** Custom metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Approval workflow definition
 */
interface ApprovalWorkflow {
    /** Unique workflow ID */
    id: string;
    /** Workflow name */
    name: string;
    /** Workflow description */
    description?: string;
    /** Overall workflow status */
    status: ApprovalWorkflowStatus;
    /** Approval steps */
    steps: ApprovalStep[];
    /** Workflow initiator */
    initiator: Approver;
    /** Creation timestamp */
    createdAt: Date;
    /** Last update timestamp */
    updatedAt: Date;
    /** Target entity being approved */
    targetEntity?: {
        type: string;
        id: string;
        name?: string;
    };
    /** Workflow metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Approval flow state
 */
interface ApprovalFlowState {
    /** Current workflow */
    workflow: ApprovalWorkflow;
    /** Currently active step index */
    currentStepIndex: number;
    /** Current active step */
    currentStep: ApprovalStep | null;
    /** Completed steps */
    completedSteps: ApprovalStep[];
    /** Pending steps */
    pendingSteps: ApprovalStep[];
    /** Progress percentage (0-100) */
    progress: number;
    /** Whether the workflow is complete */
    isComplete: boolean;
    /** Whether the workflow is approved */
    isApproved: boolean;
    /** Whether the workflow is rejected */
    isRejected: boolean;
    /** Whether the workflow can be cancelled */
    canCancel: boolean;
    /** Current user's pending action (if any) */
    userPendingAction: ApprovalStep | null;
}
/**
 * Options for useApprovalFlow hook
 */
interface UseApprovalFlowOptions {
    /** Initial workflow configuration */
    workflow: ApprovalWorkflow;
    /** Current user (to determine pending actions) */
    currentUser?: Approver;
    /** Callback when step status changes */
    onStepChange?: (step: ApprovalStep, workflow: ApprovalWorkflow) => void;
    /** Callback when workflow status changes */
    onWorkflowChange?: (workflow: ApprovalWorkflow) => void;
    /** Callback when workflow is approved */
    onApproved?: (workflow: ApprovalWorkflow) => void;
    /** Callback when workflow is rejected */
    onRejected?: (workflow: ApprovalWorkflow) => void;
}
/**
 * Return type for useApprovalFlow hook
 */
interface UseApprovalFlowReturn {
    /** Current state */
    state: ApprovalFlowState;
    /** Approve current or specific step */
    approve: (stepId?: string, comment?: string) => void;
    /** Reject current or specific step */
    reject: (stepId?: string, comment?: string) => void;
    /** Request changes on current or specific step */
    requestChanges: (stepId?: string, comment?: string) => void;
    /** Delegate step to another approver */
    delegate: (stepId: string, delegateTo: Approver, comment?: string) => void;
    /** Skip an optional step */
    skipStep: (stepId: string, comment?: string) => void;
    /** Cancel the entire workflow */
    cancel: (comment?: string) => void;
    /** Reset workflow to draft */
    resetToDraft: () => void;
    /** Restart workflow from beginning */
    restart: () => void;
    /** Check if user can approve a step */
    canApprove: (stepId: string, userId?: string) => boolean;
    /** Check if user can reject a step */
    canReject: (stepId: string, userId?: string) => boolean;
    /** Check if step is current */
    isCurrentStep: (stepId: string) => boolean;
    /** Check if step is complete */
    isStepComplete: (stepId: string) => boolean;
    /** Get step by ID */
    getStep: (stepId: string) => ApprovalStep | undefined;
    /** Get approvers for a step */
    getStepApprovers: (stepId: string) => Approver[];
    /** Get remaining approvers for a step */
    getRemainingApprovers: (stepId: string) => Approver[];
    /** Go to specific step (for viewing) */
    goToStep: (stepId: string) => void;
    /** Get next step */
    getNextStep: () => ApprovalStep | null;
    /** Get previous step */
    getPreviousStep: () => ApprovalStep | null;
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
declare function useApprovalFlow(options: UseApprovalFlowOptions): UseApprovalFlowReturn;

/**
 * SpendingMeter Types
 *
 * Type definitions for budget usage gauge component
 * with threshold calculations and warning states.
 */
/**
 * Spending threshold level
 */
type ThresholdLevel = "safe" | "warning" | "danger" | "exceeded";
/**
 * Spending period type
 */
type SpendingPeriod = "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
/**
 * Currency configuration
 */
interface CurrencyConfig {
    /** Currency code (e.g., 'EUR', 'USD') */
    code: string;
    /** Currency symbol (e.g., '$', '???') */
    symbol: string;
    /** Decimal places */
    decimals: number;
    /** Symbol position */
    symbolPosition: "before" | "after";
    /** Thousands separator */
    thousandsSeparator: string;
    /** Decimal separator */
    decimalSeparator: string;
}
/**
 * Spending threshold configuration
 */
interface SpendingThreshold {
    /** Threshold level name */
    level: ThresholdLevel;
    /** Percentage at which this threshold starts (0-100) */
    percentage: number;
    /** Custom label for this threshold */
    label?: string;
    /** Color associated with this threshold */
    color?: string;
}
/**
 * Spending limit configuration
 */
interface SpendingLimit {
    /** Unique limit ID */
    id: string;
    /** Limit name/label */
    name: string;
    /** Maximum spending amount */
    maxAmount: number;
    /** Current spent amount */
    spentAmount: number;
    /** Spending period */
    period: SpendingPeriod;
    /** Period start date */
    periodStart: Date;
    /** Period end date */
    periodEnd: Date;
    /** Currency configuration */
    currency: CurrencyConfig;
    /** Custom thresholds */
    thresholds?: SpendingThreshold[];
    /** Whether this limit is active */
    isActive: boolean;
    /** Whether to allow exceeding the limit */
    allowExceed: boolean;
    /** Soft limit (warning threshold) */
    softLimit?: number;
    /** Hard limit (absolute maximum) */
    hardLimit?: number;
}
/**
 * Spending meter state
 */
interface SpendingMeterState {
    /** Current spending limit configuration */
    limit: SpendingLimit;
    /** Amount spent */
    spent: number;
    /** Remaining amount */
    remaining: number;
    /** Usage percentage (0-100+) */
    percentage: number;
    /** Capped percentage for display (0-100) */
    displayPercentage: number;
    /** Current threshold level */
    thresholdLevel: ThresholdLevel;
    /** Active threshold configuration */
    activeThreshold: SpendingThreshold;
    /** All thresholds for display */
    thresholds: SpendingThreshold[];
    /** Whether limit is exceeded */
    isExceeded: boolean;
    /** Whether soft limit is exceeded */
    isSoftLimitExceeded: boolean;
    /** Whether hard limit is exceeded */
    isHardLimitExceeded: boolean;
    /** Formatted spent amount */
    formattedSpent: string;
    /** Formatted remaining amount */
    formattedRemaining: string;
    /** Formatted limit amount */
    formattedLimit: string;
    /** Days remaining in period */
    daysRemaining: number;
    /** Average daily spending */
    averageDailySpending: number;
    /** Projected end-of-period spending */
    projectedSpending: number;
    /** Whether on track to stay under limit */
    isOnTrack: boolean;
}
/**
 * Options for useSpendingMeter hook
 */
interface UseSpendingMeterOptions {
    /** Spending limit configuration */
    limit: SpendingLimit;
    /** Warning threshold percentage (default: 75) */
    warningThreshold?: number;
    /** Danger threshold percentage (default: 90) */
    dangerThreshold?: number;
    /** Callback when threshold level changes */
    onThresholdChange?: (level: ThresholdLevel, state: SpendingMeterState) => void;
    /** Callback when limit is exceeded */
    onLimitExceeded?: (state: SpendingMeterState) => void;
    /** Callback when soft limit is exceeded */
    onSoftLimitExceeded?: (state: SpendingMeterState) => void;
    /** Custom currency formatter */
    formatCurrency?: (amount: number, currency: CurrencyConfig) => string;
}
/**
 * Return type for useSpendingMeter hook
 */
interface UseSpendingMeterReturn {
    /** Current state */
    state: SpendingMeterState;
    /** Update spent amount */
    setSpent: (amount: number) => void;
    /** Add to spent amount */
    addSpending: (amount: number) => void;
    /** Update limit configuration */
    updateLimit: (limit: Partial<SpendingLimit>) => void;
    /** Reset spending to zero */
    resetSpending: () => void;
    /** Check if an amount can be spent */
    canSpend: (amount: number) => boolean;
    /** Get amount that can still be spent */
    getSpendableAmount: () => number;
    /** Check if spending amount would trigger warning */
    wouldTriggerWarning: (amount: number) => boolean;
    /** Check if spending amount would exceed limit */
    wouldExceedLimit: (amount: number) => boolean;
    /** Format an amount with currency */
    formatAmount: (amount: number) => string;
    /** Get percentage for a given amount */
    getPercentage: (amount: number) => number;
    /** Get threshold level for a given percentage */
    getThresholdLevel: (percentage: number) => ThresholdLevel;
}
/**
 * Default thresholds
 */
declare const DEFAULT_THRESHOLDS: SpendingThreshold[];
/**
 * Default currency configuration (EUR)
 */
declare const DEFAULT_CURRENCY: CurrencyConfig;

/**
 * Hook for spending meter state management
 *
 * Provides budget tracking with threshold calculations,
 * projections, and warning states.
 *
 * @example
 * ```tsx
 * const { state, addSpending, canSpend } = useSpendingMeter({
 *   limit: employeeSpendingLimit,
 *   onThresholdChange: (level) => {
 *     if (level === 'danger') {
 *       showWarningToast('Approaching spending limit!');
 *     }
 *   },
 *   onLimitExceeded: () => {
 *     showErrorToast('Spending limit exceeded!');
 *   },
 * });
 *
 * // Display gauge
 * <ProgressBar
 *   value={state.displayPercentage}
 *   color={state.activeThreshold.color}
 * />
 * <p>{state.formattedSpent} / {state.formattedLimit}</p>
 * <p>{state.formattedRemaining} remaining</p>
 *
 * // Before making a purchase
 * if (canSpend(orderTotal)) {
 *   addSpending(orderTotal);
 * }
 * ```
 */
declare function useSpendingMeter(options: UseSpendingMeterOptions): UseSpendingMeterReturn;

/**
 * QuoteBuilder Types
 *
 * Type definitions for quote construction from cart items
 * supporting B2B pricing, bulk discounts, and custom terms.
 */
/**
 * Quote status
 */
type QuoteStatus = "draft" | "pending_review" | "sent" | "viewed" | "accepted" | "rejected" | "expired" | "cancelled";
/**
 * Discount type
 */
type DiscountType = "percentage" | "fixed" | "per_unit";
/**
 * Tax type
 */
type TaxType = "included" | "excluded" | "exempt";
/**
 * Quote line item
 */
interface QuoteLineItem {
    /** Unique line item ID */
    id: string;
    /** Product/SKU ID */
    productId: string;
    /** Product name */
    name: string;
    /** Product description */
    description?: string;
    /** SKU or reference */
    sku?: string;
    /** Quantity */
    quantity: number;
    /** Unit of measure */
    unit?: string;
    /** Unit price (before discounts) */
    unitPrice: number;
    /** Line discount */
    discount?: {
        type: DiscountType;
        value: number;
        reason?: string;
    };
    /** Effective unit price (after discount) */
    effectiveUnitPrice: number;
    /** Line total */
    lineTotal: number;
    /** Tax rate for this item */
    taxRate?: number;
    /** Tax amount */
    taxAmount?: number;
    /** Whether item is customizable */
    customizable?: boolean;
    /** Custom options selected */
    customOptions?: Record<string, unknown>;
    /** Lead time in days */
    leadTime?: number;
    /** Notes for this line item */
    notes?: string;
    /** Original cart item ID (if from cart) */
    cartItemId?: string;
}
/**
 * Quote customer information
 */
interface QuoteCustomer {
    /** Customer/Company ID */
    id: string;
    /** Company name */
    companyName: string;
    /** Contact name */
    contactName: string;
    /** Contact email */
    email: string;
    /** Contact phone */
    phone?: string;
    /** Billing address */
    billingAddress?: Address;
    /** Shipping address */
    shippingAddress?: Address;
    /** Tax ID / VAT number */
    taxId?: string;
    /** Payment terms (e.g., 'NET30') */
    paymentTerms?: string;
    /** Credit limit */
    creditLimit?: number;
}
/**
 * Address structure
 */
interface Address {
    /** Street address line 1 */
    line1: string;
    /** Street address line 2 */
    line2?: string;
    /** City */
    city: string;
    /** State/Province */
    state?: string;
    /** Postal code */
    postalCode: string;
    /** Country code */
    country: string;
}
/**
 * Quote pricing summary
 */
interface QuotePricing {
    /** Subtotal (before discounts and tax) */
    subtotal: number;
    /** Total discount amount */
    discountTotal: number;
    /** Discounted subtotal */
    discountedSubtotal: number;
    /** Shipping cost */
    shipping: number;
    /** Tax type */
    taxType: TaxType;
    /** Tax rate (percentage) */
    taxRate: number;
    /** Tax amount */
    taxAmount: number;
    /** Grand total */
    total: number;
    /** Currency code */
    currency: string;
}
/**
 * Quote discount (applied to entire quote)
 */
interface QuoteDiscount {
    /** Discount ID */
    id: string;
    /** Discount type */
    type: DiscountType;
    /** Discount value */
    value: number;
    /** Discount code (if applicable) */
    code?: string;
    /** Reason for discount */
    reason?: string;
    /** Minimum order value for discount */
    minOrderValue?: number;
    /** Maximum discount amount */
    maxDiscount?: number;
}
/**
 * Quote terms and conditions
 */
interface QuoteTerms {
    /** Payment terms */
    paymentTerms: string;
    /** Payment due date */
    paymentDueDate?: Date;
    /** Delivery terms (Incoterms) */
    deliveryTerms?: string;
    /** Estimated delivery date */
    deliveryDate?: Date;
    /** Validity period in days */
    validityDays: number;
    /** Quote expiration date */
    expirationDate: Date;
    /** Custom terms and conditions */
    customTerms?: string;
    /** Notes to customer */
    notes?: string;
    /** Internal notes (not shown to customer) */
    internalNotes?: string;
}
/**
 * Complete quote structure
 */
interface Quote {
    /** Unique quote ID */
    id: string;
    /** Quote number (display) */
    quoteNumber: string;
    /** Quote status */
    status: QuoteStatus;
    /** Customer information */
    customer: QuoteCustomer;
    /** Line items */
    items: QuoteLineItem[];
    /** Quote-level discounts */
    discounts: QuoteDiscount[];
    /** Pricing summary */
    pricing: QuotePricing;
    /** Terms and conditions */
    terms: QuoteTerms;
    /** Created by */
    createdBy: {
        id: string;
        name: string;
        email: string;
    };
    /** Creation date */
    createdAt: Date;
    /** Last updated */
    updatedAt: Date;
    /** Sent date (if sent) */
    sentAt?: Date;
    /** Viewed date (if viewed) */
    viewedAt?: Date;
    /** Response date (accepted/rejected) */
    respondedAt?: Date;
    /** Version number */
    version: number;
    /** Reference to original quote (if revision) */
    originalQuoteId?: string;
    /** Custom metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Cart item for conversion to quote
 */
interface CartItem {
    /** Cart item ID */
    id: string;
    /** Product ID */
    productId: string;
    /** Product name */
    name: string;
    /** Product description */
    description?: string;
    /** SKU */
    sku?: string;
    /** Quantity */
    quantity: number;
    /** Unit price */
    unitPrice: number;
    /** Custom options */
    customOptions?: Record<string, unknown>;
}
/**
 * Quote builder state
 */
interface QuoteBuilderState {
    /** Current quote being built */
    quote: Quote;
    /** Whether quote has unsaved changes */
    isDirty: boolean;
    /** Validation errors */
    errors: QuoteValidationError[];
    /** Whether quote is valid */
    isValid: boolean;
    /** Selected line items (for bulk operations) */
    selectedItems: Set<string>;
}
/**
 * Quote validation error
 */
interface QuoteValidationError {
    /** Field or path that has error */
    field: string;
    /** Error message */
    message: string;
    /** Error type */
    type: "error" | "warning";
}
/**
 * Options for useQuoteBuilder hook
 */
interface UseQuoteBuilderOptions {
    /** Initial quote (for editing) */
    initialQuote?: Partial<Quote>;
    /** Customer information */
    customer: QuoteCustomer;
    /** Default currency */
    currency?: string;
    /** Default tax rate */
    taxRate?: number;
    /** Default tax type */
    taxType?: TaxType;
    /** Default validity period in days */
    validityDays?: number;
    /** Default payment terms */
    paymentTerms?: string;
    /** Auto-calculate pricing */
    autoCalculate?: boolean;
    /** Quote number generator */
    generateQuoteNumber?: () => string;
    /** Callback when quote changes */
    onChange?: (quote: Quote) => void;
    /** Callback when quote is saved */
    onSave?: (quote: Quote) => void;
    /** Callback when quote is sent */
    onSend?: (quote: Quote) => void;
}
/**
 * Return type for useQuoteBuilder hook
 */
interface UseQuoteBuilderReturn {
    /** Current state */
    state: QuoteBuilderState;
    /** Add a line item */
    addItem: (item: Omit<QuoteLineItem, "id" | "effectiveUnitPrice" | "lineTotal">) => void;
    /** Update a line item */
    updateItem: (itemId: string, updates: Partial<QuoteLineItem>) => void;
    /** Remove a line item */
    removeItem: (itemId: string) => void;
    /** Duplicate a line item */
    duplicateItem: (itemId: string) => void;
    /** Update item quantity */
    setItemQuantity: (itemId: string, quantity: number) => void;
    /** Apply discount to item */
    applyItemDiscount: (itemId: string, discount: QuoteLineItem["discount"]) => void;
    /** Clear item discount */
    clearItemDiscount: (itemId: string) => void;
    /** Reorder items */
    reorderItems: (fromIndex: number, toIndex: number) => void;
    /** Import items from cart */
    importFromCart: (cartItems: CartItem[]) => void;
    /** Replace all items from cart */
    replaceFromCart: (cartItems: CartItem[]) => void;
    /** Add quote discount */
    addDiscount: (discount: Omit<QuoteDiscount, "id">) => void;
    /** Remove quote discount */
    removeDiscount: (discountId: string) => void;
    /** Clear all quote discounts */
    clearDiscounts: () => void;
    /** Update shipping cost */
    setShipping: (amount: number) => void;
    /** Update tax rate */
    setTaxRate: (rate: number) => void;
    /** Update tax type */
    setTaxType: (type: TaxType) => void;
    /** Recalculate all pricing */
    recalculate: () => void;
    /** Update terms */
    updateTerms: (terms: Partial<QuoteTerms>) => void;
    /** Set expiration date */
    setExpirationDate: (date: Date) => void;
    /** Set validity days */
    setValidityDays: (days: number) => void;
    /** Update customer information */
    updateCustomer: (customer: Partial<QuoteCustomer>) => void;
    /** Select item */
    selectItem: (itemId: string) => void;
    /** Deselect item */
    deselectItem: (itemId: string) => void;
    /** Toggle item selection */
    toggleItemSelection: (itemId: string) => void;
    /** Select all items */
    selectAllItems: () => void;
    /** Deselect all items */
    deselectAllItems: () => void;
    /** Remove selected items */
    removeSelectedItems: () => void;
    /** Apply discount to selected items */
    applyDiscountToSelected: (discount: QuoteLineItem["discount"]) => void;
    /** Save quote */
    save: () => Quote;
    /** Send quote to customer */
    send: () => void;
    /** Create revision */
    createRevision: () => void;
    /** Reset to initial state */
    reset: () => void;
    /** Mark as dirty */
    markDirty: () => void;
    /** Mark as clean */
    markClean: () => void;
    /** Validate quote */
    validate: () => QuoteValidationError[];
    /** Get item by ID */
    getItem: (itemId: string) => QuoteLineItem | undefined;
    /** Check if item exists */
    hasItem: (itemId: string) => boolean;
}

/**
 * Hook for quote building functionality
 *
 * Provides comprehensive quote construction from cart items
 * with support for discounts, taxes, and custom terms.
 *
 * @example
 * ```tsx
 * const {
 *   state,
 *   addItem,
 *   importFromCart,
 *   setShipping,
 *   save,
 *   send,
 * } = useQuoteBuilder({
 *   customer: selectedCustomer,
 *   currency: 'EUR',
 *   taxRate: 20,
 *   validityDays: 30,
 *   onSend: async (quote) => {
 *     await emailQuoteToCustomer(quote);
 *   },
 * });
 *
 * // Import from cart
 * importFromCart(cartItems);
 *
 * // Apply bulk discount
 * addDiscount({ type: 'percentage', value: 10, reason: 'Volume discount' });
 *
 * // Display quote
 * <QuotePreview
 *   items={state.quote.items}
 *   pricing={state.quote.pricing}
 *   onSend={send}
 * />
 * ```
 */
declare function useQuoteBuilder(options: UseQuoteBuilderOptions): UseQuoteBuilderReturn;

export { type Address, type ApprovalAction, type ApprovalFlowState, type ApprovalStep, type ApprovalStepStatus, type ApprovalWorkflow, type ApprovalWorkflowStatus, type Approver, type BulkSelectionState, type CartItem, type ColumnDef, type CurrencyConfig, DEFAULT_CURRENCY, DEFAULT_THRESHOLDS, type DataTableState, type DiscountType, type FilterConfig, type FilterOperator, type PaginationConfig, type PaginationState, type Quote, type QuoteBuilderState, type QuoteCustomer, type QuoteDiscount, type QuoteLineItem, type QuotePricing, type QuoteStatus, type QuoteTerms, type QuoteValidationError, type RowSelectionMode, type RowSelectionState, type SelectableItem, type SelectionState, type SortConfig, type SortDirection, type SpendingLimit, type SpendingMeterState, type SpendingPeriod, type SpendingThreshold, type TaxType, type ThresholdLevel, type UseApprovalFlowOptions, type UseApprovalFlowReturn, type UseBulkSelectorOptions, type UseBulkSelectorReturn, type UseDataTableOptions, type UseDataTableReturn, type UseQuoteBuilderOptions, type UseQuoteBuilderReturn, type UseSpendingMeterOptions, type UseSpendingMeterReturn, useApprovalFlow, useBulkSelector, useDataTable, useQuoteBuilder, useSpendingMeter };
