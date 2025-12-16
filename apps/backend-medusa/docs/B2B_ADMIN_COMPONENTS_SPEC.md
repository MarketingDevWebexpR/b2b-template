# B2B Admin Components Specification

## Detailed Component Props, Interfaces, and Implementation Guidelines

This document provides detailed specifications for implementing the B2B admin UI components.

---

## Table of Contents

1. [Type Definitions](#1-type-definitions)
2. [Core Components](#2-core-components)
3. [B2B Specific Components](#3-b2b-specific-components)
4. [Form Components](#4-form-components)
5. [Data Display Components](#5-data-display-components)
6. [Action Components](#6-action-components)

---

## 1. Type Definitions

### 1.1 Entity Types

```typescript
// /admin/ui-src/types/entities.ts

// ==========================================
// COMPANY TYPES
// ==========================================

export type CompanyStatus = 'pending' | 'active' | 'suspended' | 'inactive' | 'closed';

export type CompanyTier = 'standard' | 'silver' | 'gold' | 'platinum' | 'enterprise';

export type PaymentTermType = 'prepaid' | 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'net_90' | 'due_on_receipt';

export interface PaymentTerms {
  type: PaymentTermType;
  days: number;
  allowPartialPayments: boolean;
  earlyPaymentDiscount?: number;
  earlyPaymentDays?: number;
}

export interface CompanySettings {
  defaultCurrency: string;
  defaultLanguage: string;
  taxExempt: boolean;
  marketingOptIn: boolean;
  orderNotificationEmails: string[];
  invoiceNotificationEmails: string[];
  allowEmployeeOrders: boolean;
  requireOrderApproval: boolean;
  allowCreditPurchases: boolean;
  autoReorderEnabled: boolean;
}

export interface Company {
  id: string;
  name: string;
  tradeName?: string;
  slug: string;
  email: string;
  phone?: string;
  taxId?: string;
  registrationNumber?: string;
  website?: string;
  description?: string;
  status: CompanyStatus;
  tier: CompanyTier;
  creditLimit: number;
  creditUsed: number;
  paymentTerms: PaymentTerms;
  settings: CompanySettings;
  accountManagerId?: string;
  accountManager?: { id: string; name: string; email: string };
  salesRepId?: string;
  salesRep?: { id: string; name: string; email: string };
  defaultBillingAddressId?: string;
  defaultShippingAddressId?: string;
  employeeCount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyAddress {
  id: string;
  companyId: string;
  type: 'billing' | 'shipping' | 'both';
  label: string;
  isDefault: boolean;
  companyName: string;
  attention?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  countryCode: string;
  phone?: string;
  deliveryInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// QUOTE TYPES
// ==========================================

export type QuoteStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'pending_info'
  | 'responded'
  | 'negotiating'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'converted'
  | 'cancelled';

export type QuotePriority = 'low' | 'normal' | 'high' | 'urgent';

export type MessageSenderType = 'buyer' | 'seller' | 'system';

export type HistoryEventType =
  | 'created'
  | 'submitted'
  | 'viewed'
  | 'responded'
  | 'price_updated'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'converted'
  | 'cancelled'
  | 'assigned'
  | 'message_sent';

export interface QuoteTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
}

export interface QuoteTerms {
  validityDays: number;
  paymentTerms?: string;
  deliveryTerms?: string;
  specialConditions?: string;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  productId: string;
  variantId?: string;
  sku: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  quantity: number;
  unitOfMeasure: string;
  listPrice: number;
  requestedPrice?: number;
  quotedPrice?: number;
  discount?: number;
  discountPercent?: number;
  lineTotal: number;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteMessage {
  id: string;
  quoteId: string;
  senderType: MessageSenderType;
  senderId: string;
  senderName: string;
  messageType: 'text' | 'file' | 'system';
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
  isInternal: boolean;
  readAt?: string;
  createdAt: string;
}

export interface QuoteHistory {
  id: string;
  quoteId: string;
  eventType: HistoryEventType;
  description: string;
  actorId?: string;
  actorName: string;
  actorType: 'buyer' | 'seller' | 'system';
  previousValue?: string;
  newValue?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  companyId: string;
  company?: Company;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  assignedToId?: string;
  assignedTo?: { id: string; name: string; email: string };
  status: QuoteStatus;
  priority: QuotePriority;
  totals: QuoteTotals;
  terms: QuoteTerms;
  notesForSeller?: string;
  sellerNotes?: string;
  internalNotes?: string;
  validUntil: string;
  submittedAt?: string;
  respondedAt?: string;
  acceptedAt?: string;
  convertedOrderId?: string;
  items?: QuoteItem[];
  messages?: QuoteMessage[];
  history?: QuoteHistory[];
  hasUnreadMessages: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// APPROVAL TYPES
// ==========================================

export type WorkflowEntityType = 'order' | 'quote' | 'return' | 'credit_adjustment' | 'employee_registration';

export type WorkflowTrigger = 'always' | 'amount_exceeds' | 'category_match' | 'custom';

export type RequestStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'expired' | 'cancelled';

export type StepStatus = 'pending' | 'approved' | 'rejected' | 'skipped' | 'escalated' | 'delegated';

export type StepAction = 'approve' | 'reject' | 'delegate' | 'escalate' | 'request_info';

export interface WorkflowLevel {
  level: number;
  approverType: 'specific_user' | 'role' | 'manager' | 'department_head';
  approverUserId?: string;
  approverRole?: string;
  requireAll: boolean;
  canDelegate: boolean;
  autoApproveAfterHours?: number;
}

export interface ApprovalWorkflow {
  id: string;
  companyId: string;
  company?: Company;
  name: string;
  description?: string;
  entityType: WorkflowEntityType;
  trigger: WorkflowTrigger;
  triggerThreshold?: number;
  triggerCategoryIds?: string[];
  levels: WorkflowLevel[];
  escalationHours?: number;
  expirationHours?: number;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalStep {
  id: string;
  requestId: string;
  level: number;
  approverId?: string;
  approverName?: string;
  approverRole?: string;
  status: StepStatus;
  action?: StepAction;
  comments?: string;
  delegatedToId?: string;
  delegatedToName?: string;
  actionAt?: string;
  dueAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalRequest {
  id: string;
  workflowId: string;
  workflow?: ApprovalWorkflow;
  companyId: string;
  company?: Company;
  entityType: WorkflowEntityType;
  entityId: string;
  entityReference: string;
  entitySummary: string;
  entityAmount?: number;
  entityCurrency?: string;
  requesterId: string;
  requesterName: string;
  status: RequestStatus;
  currentLevel: number;
  totalLevels: number;
  priority: QuotePriority;
  steps?: ApprovalStep[];
  dueAt?: string;
  isOverdue: boolean;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// SPENDING TYPES
// ==========================================

export type SpendingEntityType = 'company' | 'department' | 'role' | 'employee';

export type SpendingPeriodType = 'per_order' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'lifetime';

export type RuleAction = 'block' | 'require_approval' | 'notify' | 'warn' | 'allow_override';

export type RuleCondition = 'amount_exceeds' | 'category_match' | 'time_of_day' | 'day_of_week' | 'custom';

export type TransactionType = 'order' | 'quote_accepted' | 'return_credit' | 'adjustment' | 'reset';

export type TransactionStatus = 'pending' | 'completed' | 'cancelled' | 'reversed';

export interface SpendingLimit {
  id: string;
  companyId: string;
  company?: Company;
  entityType: SpendingEntityType;
  entityId: string;
  entityName?: string;
  limitAmount: number;
  currentSpent: number;
  currency: string;
  periodType: SpendingPeriodType;
  periodStartDate: string;
  periodEndDate?: string;
  warningThreshold: number;
  isActive: boolean;
  lastResetAt?: string;
  nextResetAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpendingRule {
  id: string;
  companyId: string;
  company?: Company;
  name: string;
  description?: string;
  condition: RuleCondition;
  conditionValue?: string | number | string[];
  action: RuleAction;
  actionConfig?: Record<string, unknown>;
  priority: number;
  isActive: boolean;
  appliesToEntityTypes?: SpendingEntityType[];
  createdAt: string;
  updatedAt: string;
}

export interface SpendingTransaction {
  id: string;
  limitId: string;
  limit?: SpendingLimit;
  entityType: SpendingEntityType;
  entityId: string;
  transactionType: TransactionType;
  amount: number;
  currency: string;
  referenceType?: string;
  referenceId?: string;
  referenceNumber?: string;
  status: TransactionStatus;
  actorId?: string;
  actorName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 1.2 List/Filter Types

```typescript
// /admin/ui-src/types/filters.ts

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Company Filters
export interface CompanyListFilters extends Partial<PaginationParams>, Partial<SortParams> {
  search?: string;
  status?: CompanyStatus | CompanyStatus[];
  tier?: CompanyTier | CompanyTier[];
  hasCredit?: boolean;
  accountManagerId?: string;
  createdAfter?: string;
  createdBefore?: string;
}

// Quote Filters
export interface QuoteListFilters extends Partial<PaginationParams>, Partial<SortParams> {
  search?: string;
  companyId?: string;
  status?: QuoteStatus | QuoteStatus[];
  assignedToId?: string;
  requesterId?: string;
  priority?: QuotePriority | QuotePriority[];
  pendingOnly?: boolean;
  hasUnreadMessages?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  validAfter?: string;
  validBefore?: string;
}

// Approval Request Filters
export interface ApprovalRequestFilters extends Partial<PaginationParams>, Partial<SortParams> {
  search?: string;
  companyId?: string;
  workflowId?: string;
  entityType?: WorkflowEntityType | WorkflowEntityType[];
  status?: RequestStatus | RequestStatus[];
  priority?: QuotePriority | QuotePriority[];
  approverId?: string;
  isOverdue?: boolean;
  createdAfter?: string;
  createdBefore?: string;
}

// Approval Workflow Filters
export interface WorkflowListFilters extends Partial<PaginationParams> {
  companyId?: string;
  entityType?: WorkflowEntityType;
  isActive?: boolean;
}

// Spending Limit Filters
export interface SpendingLimitFilters extends Partial<PaginationParams> {
  companyId?: string;
  entityType?: SpendingEntityType;
  periodType?: SpendingPeriodType;
  isActive?: boolean;
  nearThreshold?: boolean;
  exceeded?: boolean;
}

// Spending Rule Filters
export interface SpendingRuleFilters extends Partial<PaginationParams> {
  companyId?: string;
  condition?: RuleCondition;
  action?: RuleAction;
  isActive?: boolean;
}
```

---

## 2. Core Components

### 2.1 PageHeader Component

```typescript
// /admin/ui-src/components/layout/PageHeader.tsx

import { ReactNode } from 'react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  /** Page title displayed prominently */
  title: string;
  /** Optional subtitle/description */
  description?: ReactNode;
  /** Breadcrumb navigation items */
  breadcrumbs?: BreadcrumbItem[];
  /** Action buttons (right side) */
  actions?: ReactNode;
  /** Back button configuration */
  backLink?: {
    href: string;
    label?: string;
  };
  /** Optional badge next to title */
  badge?: ReactNode;
  /** Additional content below header */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  backLink,
  badge,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('space-y-4', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRightIcon className="w-4 h-4 text-gray-400" aria-hidden="true" />
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{item.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Back Link */}
      {backLink && (
        <Link
          href={backLink.href}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          {backLink.label || 'Back'}
        </Link>
      )}

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {children}
    </header>
  );
}
```

### 2.2 FilterBar Component

```typescript
// /admin/ui-src/components/filters/FilterBar.tsx

import { ReactNode } from 'react';

export interface FilterBarProps {
  /** Search input configuration */
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  /** Filter components to render */
  filters?: ReactNode;
  /** Additional actions (right side) */
  actions?: ReactNode;
  /** Show active filter count */
  activeFilterCount?: number;
  /** Clear all filters callback */
  onClearFilters?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function FilterBar({
  search,
  filters,
  actions,
  activeFilterCount,
  onClearFilters,
  className,
}: FilterBarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-4', className)}>
      {/* Search Input */}
      {search && (
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder={search.placeholder || 'Search...'}
            className={cn(
              'w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300',
              'text-sm placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            )}
          />
        </div>
      )}

      {/* Filter Controls */}
      {filters && (
        <div className="flex items-center gap-3">
          {filters}
        </div>
      )}

      {/* Active Filter Indicator */}
      {activeFilterCount && activeFilterCount > 0 && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-primary-600 hover:text-primary-700"
        >
          <span className="bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full">
            {activeFilterCount}
          </span>
          Clear filters
        </button>
      )}

      {/* Actions */}
      {actions && (
        <div className="ml-auto flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
```

### 2.3 SelectFilter Component

```typescript
// /admin/ui-src/components/filters/SelectFilter.tsx

import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';

export interface SelectFilterOption<T = string> {
  value: T;
  label: string;
  icon?: ReactNode;
  count?: number;
  disabled?: boolean;
}

export interface SelectFilterProps<T = string> {
  /** Filter label */
  label: string;
  /** Current selected value(s) */
  value: T | T[] | undefined;
  /** Available options */
  options: SelectFilterOption<T>[];
  /** Change handler */
  onChange: (value: T | T[] | undefined) => void;
  /** Allow multiple selection */
  multiple?: boolean;
  /** Allow clearing the selection */
  clearable?: boolean;
  /** Placeholder when no selection */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Width class */
  width?: 'auto' | 'sm' | 'md' | 'lg';
}

export function SelectFilter<T = string>({
  label,
  value,
  options,
  onChange,
  multiple = false,
  clearable = true,
  placeholder = 'All',
  disabled = false,
  width = 'auto',
}: SelectFilterProps<T>) {
  const widthClasses = {
    auto: 'min-w-[120px]',
    sm: 'w-32',
    md: 'w-48',
    lg: 'w-64',
  };

  const selectedOptions = Array.isArray(value)
    ? options.filter((o) => value.includes(o.value))
    : options.find((o) => o.value === value);

  const displayValue = Array.isArray(selectedOptions)
    ? selectedOptions.length > 0
      ? `${selectedOptions.length} selected`
      : placeholder
    : selectedOptions?.label || placeholder;

  return (
    <Listbox
      value={value}
      onChange={onChange}
      multiple={multiple}
      disabled={disabled}
    >
      <div className="relative">
        <Listbox.Label className="sr-only">{label}</Listbox.Label>
        <Listbox.Button
          className={cn(
            widthClasses[width],
            'relative py-2 pl-3 pr-10 text-left bg-white rounded-lg border border-gray-300',
            'cursor-pointer text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:bg-gray-50 disabled:cursor-not-allowed'
          )}
        >
          <span className="block truncate">{displayValue}</span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            className={cn(
              'absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white',
              'py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'
            )}
          >
            {clearable && (
              <Listbox.Option
                value={undefined}
                className={({ active }) =>
                  cn(
                    'relative cursor-pointer select-none py-2 pl-10 pr-4',
                    active ? 'bg-primary-50 text-primary-900' : 'text-gray-900'
                  )
                }
              >
                <span className="text-gray-500">{placeholder}</span>
              </Listbox.Option>
            )}

            {options.map((option) => (
              <Listbox.Option
                key={String(option.value)}
                value={option.value}
                disabled={option.disabled}
                className={({ active, selected }) =>
                  cn(
                    'relative cursor-pointer select-none py-2 pl-10 pr-4',
                    active ? 'bg-primary-50 text-primary-900' : 'text-gray-900',
                    option.disabled && 'opacity-50 cursor-not-allowed'
                  )
                }
              >
                {({ selected }) => (
                  <>
                    <span
                      className={cn(
                        'block truncate',
                        selected ? 'font-medium' : 'font-normal'
                      )}
                    >
                      {option.label}
                    </span>

                    {option.count !== undefined && (
                      <span className="ml-2 text-gray-400">
                        ({option.count})
                      </span>
                    )}

                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600">
                        <CheckIcon className="w-4 h-4" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
```

---

## 3. B2B Specific Components

### 3.1 StatusBadge Component (Extended)

```typescript
// /admin/ui-src/components/b2b/StatusBadge.tsx

type BadgeVariant = 'default' | 'outline' | 'dot';
type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

interface StatusConfig {
  bg: string;
  text: string;
  border?: string;
  dot?: string;
  label: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  // Company statuses
  pending: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500', label: 'Pending' },
  active: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', label: 'Active' },
  suspended: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', label: 'Suspended' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400', label: 'Inactive' },
  closed: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400', label: 'Closed' },

  // Quote statuses
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400', label: 'Draft' },
  submitted: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500', label: 'Submitted' },
  under_review: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500', label: 'Under Review' },
  pending_info: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500', label: 'Info Requested' },
  responded: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Responded' },
  negotiating: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500', label: 'Negotiating' },
  accepted: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', label: 'Accepted' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', label: 'Rejected' },
  expired: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400', label: 'Expired' },
  converted: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-600', label: 'Converted' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400', label: 'Cancelled' },

  // Approval statuses
  approved: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', label: 'Approved' },
  in_review: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500', label: 'In Review' },
  escalated: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500', label: 'Escalated' },
  delegated: { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500', label: 'Delegated' },
};

export interface StatusBadgeProps {
  /** The status value */
  status: string;
  /** Optional custom label override */
  label?: string;
  /** Badge visual variant */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Show pulsing animation for active/pending states */
  pulse?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function StatusBadge({
  status,
  label,
  variant = 'default',
  size = 'sm',
  pulse = false,
  className,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-400',
    label: status,
  };

  const displayLabel = label || config.label;

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm',
  };

  if (variant === 'dot') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5',
          sizeClasses[size],
          config.text,
          className
        )}
      >
        <span
          className={cn(
            'w-2 h-2 rounded-full',
            config.dot,
            pulse && 'animate-pulse'
          )}
        />
        {displayLabel}
      </span>
    );
  }

  if (variant === 'outline') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full font-medium',
          'border',
          sizeClasses[size],
          config.text,
          `border-current`,
          className
        )}
      >
        {displayLabel}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizeClasses[size],
        config.bg,
        config.text,
        className
      )}
      role="status"
      aria-label={`Status: ${displayLabel}`}
    >
      {displayLabel}
    </span>
  );
}
```

### 3.2 CreditMeter Component

```typescript
// /admin/ui-src/components/b2b/CreditMeter.tsx

export interface CreditMeterProps {
  /** Amount currently used */
  used: number;
  /** Maximum limit */
  limit: number;
  /** Currency code for formatting */
  currency?: string;
  /** Show numeric labels */
  showLabels?: boolean;
  /** Show percentage */
  showPercentage?: boolean;
  /** Component size */
  size?: 'sm' | 'md' | 'lg';
  /** Warning threshold (percentage) */
  warningThreshold?: number;
  /** Danger threshold (percentage) */
  dangerThreshold?: number;
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Additional CSS classes */
  className?: string;
}

export function CreditMeter({
  used,
  limit,
  currency = 'EUR',
  showLabels = true,
  showPercentage = false,
  size = 'md',
  warningThreshold = 80,
  dangerThreshold = 95,
  orientation = 'horizontal',
  className,
}: CreditMeterProps) {
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const available = Math.max(limit - used, 0);

  // Determine color based on usage
  const getBarColor = () => {
    if (percentage >= dangerThreshold) return 'bg-red-500';
    if (percentage >= warningThreshold) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getTextColor = () => {
    if (percentage >= dangerThreshold) return 'text-red-600';
    if (percentage >= warningThreshold) return 'text-amber-600';
    return 'text-green-600';
  };

  const sizeClasses = {
    sm: { bar: 'h-1', text: 'text-xs' },
    md: { bar: 'h-2', text: 'text-sm' },
    lg: { bar: 'h-3', text: 'text-base' },
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        <div
          className={cn(
            'relative w-4 bg-gray-200 rounded-full overflow-hidden',
            sizeClasses[size].bar === 'h-1' ? 'h-16' : sizeClasses[size].bar === 'h-2' ? 'h-24' : 'h-32'
          )}
        >
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 rounded-full transition-all duration-500',
              getBarColor()
            )}
            style={{ height: `${percentage}%` }}
          />
        </div>
        {showLabels && (
          <div className={cn('text-center', sizeClasses[size].text)}>
            <div className={getTextColor()}>{percentage.toFixed(0)}%</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      {showLabels && (
        <div className={cn('flex justify-between', sizeClasses[size].text)}>
          <span className="text-gray-600">
            Used: {formatAmount(used)}
          </span>
          <span className="text-gray-600">
            Limit: {formatAmount(limit)}
          </span>
        </div>
      )}

      <div
        className={cn(
          'relative w-full bg-gray-200 rounded-full overflow-hidden',
          sizeClasses[size].bar
        )}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Credit usage: ${percentage.toFixed(0)}%`}
      >
        <div
          className={cn(
            'absolute top-0 left-0 h-full rounded-full transition-all duration-500',
            getBarColor()
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {(showLabels || showPercentage) && (
        <div className={cn('flex justify-between', sizeClasses[size].text)}>
          {showLabels && (
            <span className={getTextColor()}>
              Available: {formatAmount(available)}
            </span>
          )}
          {showPercentage && (
            <span className={getTextColor()}>
              {percentage.toFixed(0)}% used
            </span>
          )}
        </div>
      )}
    </div>
  );
}
```

### 3.3 ApprovalProgressBar Component

```typescript
// /admin/ui-src/components/b2b/ApprovalProgressBar.tsx

interface ApprovalLevelData {
  level: number;
  status: 'pending' | 'approved' | 'rejected' | 'current' | 'skipped';
  approverName?: string;
  approverRole?: string;
  actionAt?: string;
  label?: string;
}

export interface ApprovalProgressBarProps {
  /** Approval levels data */
  levels: ApprovalLevelData[];
  /** Current active level */
  currentLevel: number;
  /** Total number of levels */
  totalLevels: number;
  /** Compact display mode */
  compact?: boolean;
  /** Show approver details */
  showDetails?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function ApprovalProgressBar({
  levels,
  currentLevel,
  totalLevels,
  compact = false,
  showDetails = true,
  className,
}: ApprovalProgressBarProps) {
  const getStatusColor = (status: ApprovalLevelData['status']) => {
    switch (status) {
      case 'approved':
        return { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-600' };
      case 'rejected':
        return { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-600' };
      case 'current':
        return { bg: 'bg-primary-500', border: 'border-primary-500', text: 'text-primary-600' };
      case 'skipped':
        return { bg: 'bg-gray-300', border: 'border-gray-300', text: 'text-gray-400' };
      default:
        return { bg: 'bg-gray-200', border: 'border-gray-300', text: 'text-gray-400' };
    }
  };

  const getStatusIcon = (status: ApprovalLevelData['status']) => {
    switch (status) {
      case 'approved':
        return <CheckIcon className="w-4 h-4 text-white" />;
      case 'rejected':
        return <XIcon className="w-4 h-4 text-white" />;
      case 'current':
        return <ClockIcon className="w-4 h-4 text-white" />;
      case 'skipped':
        return <MinusIcon className="w-4 h-4 text-gray-500" />;
      default:
        return <span className="w-4 h-4" />;
    }
  };

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {levels.map((level, index) => {
          const colors = getStatusColor(level.status);
          return (
            <div
              key={level.level}
              className={cn(
                'w-6 h-2 rounded-full transition-colors',
                colors.bg
              )}
              title={`Level ${level.level}: ${level.status}`}
            />
          );
        })}
        <span className="ml-2 text-xs text-gray-500">
          {currentLevel}/{totalLevels}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Progress Line */}
      <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200" aria-hidden="true">
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{
            width: `${((currentLevel - 1) / (totalLevels - 1)) * 100}%`,
          }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex justify-between">
        {levels.map((level, index) => {
          const colors = getStatusColor(level.status);
          const isCompleted = level.status === 'approved';
          const isCurrent = level.status === 'current';

          return (
            <div
              key={level.level}
              className={cn(
                'flex flex-col items-center',
                index === 0 && 'items-start',
                index === levels.length - 1 && 'items-end'
              )}
            >
              {/* Step Circle */}
              <div
                className={cn(
                  'relative z-10 w-8 h-8 rounded-full flex items-center justify-center',
                  'border-2 transition-colors',
                  colors.bg,
                  colors.border,
                  isCurrent && 'ring-4 ring-primary-100'
                )}
              >
                {getStatusIcon(level.status)}
              </div>

              {/* Step Details */}
              {showDetails && (
                <div className="mt-2 text-center">
                  <div className={cn('text-xs font-medium', colors.text)}>
                    Level {level.level}
                  </div>
                  {level.approverName && (
                    <div className="text-xs text-gray-500 max-w-[80px] truncate">
                      {level.approverName}
                    </div>
                  )}
                  {level.approverRole && (
                    <div className="text-xs text-gray-400">
                      {level.approverRole}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### 3.4 EntityTypeBadge Component

```typescript
// /admin/ui-src/components/b2b/EntityTypeBadge.tsx

const ENTITY_CONFIG: Record<string, { bg: string; text: string; icon: string; label: string }> = {
  order: { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'shopping-cart', label: 'ORDER' },
  quote: { bg: 'bg-cyan-100', text: 'text-cyan-800', icon: 'document-text', label: 'QUOTE' },
  return: { bg: 'bg-orange-100', text: 'text-orange-800', icon: 'arrow-uturn-left', label: 'RETURN' },
  credit_adjustment: { bg: 'bg-purple-100', text: 'text-purple-800', icon: 'currency-dollar', label: 'CREDIT' },
  employee_registration: { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: 'user-plus', label: 'EMPLOYEE' },
  company: { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: 'building-office', label: 'COMPANY' },
};

export interface EntityTypeBadgeProps {
  /** The entity type */
  entityType: string;
  /** Show icon */
  showIcon?: boolean;
  /** Badge size */
  size?: 'xs' | 'sm' | 'md';
  /** Additional CSS classes */
  className?: string;
}

export function EntityTypeBadge({
  entityType,
  showIcon = true,
  size = 'sm',
  className,
}: EntityTypeBadgeProps) {
  const config = ENTITY_CONFIG[entityType] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    icon: 'document',
    label: entityType.toUpperCase(),
  };

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded font-semibold uppercase tracking-wide',
        sizeClasses[size],
        config.bg,
        config.text,
        className
      )}
    >
      {showIcon && (
        <span className={iconSizes[size]}>
          {/* Icon would be rendered here based on config.icon */}
        </span>
      )}
      {config.label}
    </span>
  );
}
```

### 3.5 TierBadge Component

```typescript
// /admin/ui-src/components/b2b/TierBadge.tsx

const TIER_CONFIG: Record<CompanyTier, { bg: string; text: string; border: string; icon?: string }> = {
  standard: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-300' },
  silver: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-400' },
  gold: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-400', icon: 'star' },
  platinum: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-400', icon: 'star' },
  enterprise: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-400', icon: 'crown' },
};

export interface TierBadgeProps {
  /** Company tier */
  tier: CompanyTier;
  /** Show icon for premium tiers */
  showIcon?: boolean;
  /** Badge size */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

export function TierBadge({
  tier,
  showIcon = true,
  size = 'sm',
  className,
}: TierBadgeProps) {
  const config = TIER_CONFIG[tier];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm',
  };

  const label = tier.charAt(0).toUpperCase() + tier.slice(1);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium border',
        sizeClasses[size],
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {showIcon && config.icon && (
        <span className="w-3 h-3">
          {/* Star or crown icon */}
        </span>
      )}
      {label}
    </span>
  );
}
```

---

## 4. Form Components

### 4.1 CompanyForm Component

```typescript
// /admin/ui-src/components/b2b/forms/CompanyForm.tsx

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const companyFormSchema = z.object({
  // Basic Information
  name: z.string().min(1, 'Company name is required').max(200, 'Name too long'),
  tradeName: z.string().max(200).optional(),
  email: z.string().email('Valid email required'),
  phone: z.string().max(30).optional(),
  taxId: z.string().max(50).optional(),
  registrationNumber: z.string().max(50).optional(),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().max(2000).optional(),

  // Tier & Credit
  tier: z.enum(['standard', 'silver', 'gold', 'platinum', 'enterprise']),
  creditLimit: z.number().min(0, 'Must be non-negative'),

  // Payment Terms
  paymentTerms: z.object({
    type: z.enum(['prepaid', 'net_15', 'net_30', 'net_45', 'net_60', 'net_90', 'due_on_receipt']),
    days: z.number().min(0).max(365),
    allowPartialPayments: z.boolean(),
    earlyPaymentDiscount: z.number().min(0).max(100).optional(),
    earlyPaymentDays: z.number().min(0).max(365).optional(),
  }),

  // Team Assignment
  accountManagerId: z.string().optional(),
  salesRepId: z.string().optional(),

  // Settings
  settings: z.object({
    defaultCurrency: z.string().default('EUR'),
    defaultLanguage: z.string().default('fr'),
    taxExempt: z.boolean().default(false),
    requireOrderApproval: z.boolean().default(false),
    allowCreditPurchases: z.boolean().default(false),
  }),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

export interface CompanyFormProps {
  /** Initial form values (for editing) */
  defaultValues?: Partial<CompanyFormValues>;
  /** Submit handler */
  onSubmit: (data: CompanyFormValues) => Promise<void>;
  /** Cancel handler */
  onCancel: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Edit mode */
  isEditing?: boolean;
}

export function CompanyForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false,
}: CompanyFormProps) {
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      tier: 'standard',
      creditLimit: 0,
      paymentTerms: {
        type: 'net_30',
        days: 30,
        allowPartialPayments: false,
      },
      settings: {
        defaultCurrency: 'EUR',
        defaultLanguage: 'fr',
        taxExempt: false,
        requireOrderApproval: false,
        allowCreditPurchases: false,
      },
      ...defaultValues,
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Handle error
      console.error('Form submission error:', error);
    }
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information Section */}
      <FormSection title="Company Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Company Name"
            required
            error={form.formState.errors.name?.message}
          >
            <Input
              {...form.register('name')}
              placeholder="Enter company name"
            />
          </FormField>

          <FormField label="Trade Name">
            <Input
              {...form.register('tradeName')}
              placeholder="Optional trade name"
            />
          </FormField>

          <FormField
            label="Email"
            required
            error={form.formState.errors.email?.message}
          >
            <Input
              {...form.register('email')}
              type="email"
              placeholder="company@example.com"
            />
          </FormField>

          <FormField label="Phone">
            <Input
              {...form.register('phone')}
              type="tel"
              placeholder="+33 1 23 45 67 89"
            />
          </FormField>

          <FormField label="Tax ID">
            <Input
              {...form.register('taxId')}
              placeholder="FR12345678901"
            />
          </FormField>

          <FormField label="Registration Number">
            <Input
              {...form.register('registrationNumber')}
              placeholder="RCS Paris 123 456 789"
            />
          </FormField>

          <FormField label="Website">
            <Input
              {...form.register('website')}
              type="url"
              placeholder="https://www.example.com"
            />
          </FormField>
        </div>

        <FormField label="Description">
          <Textarea
            {...form.register('description')}
            placeholder="Brief description of the company"
            rows={3}
          />
        </FormField>
      </FormSection>

      {/* Tier & Credit Section */}
      <FormSection title="Tier & Credit">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            name="tier"
            control={form.control}
            render={({ field }) => (
              <FormField label="Company Tier" required>
                <Select
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: 'standard', label: 'Standard' },
                    { value: 'silver', label: 'Silver' },
                    { value: 'gold', label: 'Gold' },
                    { value: 'platinum', label: 'Platinum' },
                    { value: 'enterprise', label: 'Enterprise' },
                  ]}
                />
              </FormField>
            )}
          />

          <Controller
            name="creditLimit"
            control={form.control}
            render={({ field }) => (
              <FormField
                label="Credit Limit"
                error={form.formState.errors.creditLimit?.message}
              >
                <CurrencyInput
                  value={field.value}
                  onChange={field.onChange}
                  currency="EUR"
                />
              </FormField>
            )}
          />
        </div>
      </FormSection>

      {/* Payment Terms Section */}
      <FormSection title="Payment Terms">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            name="paymentTerms.type"
            control={form.control}
            render={({ field }) => (
              <FormField label="Payment Type" required>
                <Select
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: 'prepaid', label: 'Prepaid' },
                    { value: 'due_on_receipt', label: 'Due on Receipt' },
                    { value: 'net_15', label: 'Net 15' },
                    { value: 'net_30', label: 'Net 30' },
                    { value: 'net_45', label: 'Net 45' },
                    { value: 'net_60', label: 'Net 60' },
                    { value: 'net_90', label: 'Net 90' },
                  ]}
                />
              </FormField>
            )}
          />

          <Controller
            name="paymentTerms.days"
            control={form.control}
            render={({ field }) => (
              <FormField label="Payment Days">
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              </FormField>
            )}
          />

          <Controller
            name="paymentTerms.allowPartialPayments"
            control={form.control}
            render={({ field }) => (
              <FormField>
                <Checkbox
                  checked={field.value}
                  onChange={field.onChange}
                  label="Allow Partial Payments"
                />
              </FormField>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <Controller
            name="paymentTerms.earlyPaymentDiscount"
            control={form.control}
            render={({ field }) => (
              <FormField label="Early Payment Discount (%)">
                <Input
                  type="number"
                  step="0.1"
                  max="100"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  placeholder="e.g., 2"
                />
              </FormField>
            )}
          />

          <Controller
            name="paymentTerms.earlyPaymentDays"
            control={form.control}
            render={({ field }) => (
              <FormField label="Early Payment Days">
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                  placeholder="e.g., 10"
                />
              </FormField>
            )}
          />
        </div>
      </FormSection>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isLoading}>
          {isEditing ? 'Save Changes' : 'Create Company'}
        </Button>
      </div>
    </form>
  );
}

// Helper Components
function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
        {title}
      </h2>
      <div className="pt-2">{children}</div>
    </div>
  );
}

function FormField({
  label,
  required,
  error,
  helpText,
  children,
}: {
  label?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {helpText && !error && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
```

---

## 5. Data Display Components

### 5.1 DataTable Component (Extended)

```typescript
// /admin/ui-src/components/data/DataTable.tsx

interface Column<T> {
  /** Unique key for the column */
  key: string;
  /** Column header text */
  header: string | ReactNode;
  /** Cell render function */
  render: (item: T, index: number) => ReactNode;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Column width (CSS value) */
  width?: string;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Sort key (if different from key) */
  sortKey?: string;
  /** Sticky column position */
  sticky?: 'left' | 'right';
  /** Hide on mobile */
  hideOnMobile?: boolean;
  /** Additional class names */
  className?: string;
}

interface DataTableProps<T> {
  /** Column definitions */
  columns: Column<T>[];
  /** Data array */
  data: T[];
  /** Row key extractor */
  getRowKey: (item: T, index: number) => string | number;

  // Selection
  /** Enable row selection */
  selectable?: boolean;
  /** Currently selected row IDs */
  selectedIds?: Set<string | number>;
  /** Selection change handler */
  onSelectionChange?: (selectedIds: Set<string | number>) => void;
  /** Disable selection for specific rows */
  isRowSelectable?: (item: T) => boolean;

  // Sorting
  /** Current sort column */
  sortBy?: string;
  /** Current sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Sort change handler */
  onSort?: (column: string, order: 'asc' | 'desc') => void;

  // Pagination
  /** Pagination configuration */
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    pageSizeOptions?: number[];
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };

  // Row behavior
  /** Row click handler */
  onRowClick?: (item: T, index: number) => void;
  /** Row class name generator */
  rowClassName?: (item: T, index: number) => string;
  /** Expandable row content */
  expandedRowRender?: (item: T) => ReactNode;
  /** Currently expanded row IDs */
  expandedRowIds?: Set<string | number>;
  /** Expansion change handler */
  onExpandChange?: (expandedIds: Set<string | number>) => void;

  // States
  /** Loading state */
  loading?: boolean;
  /** Custom loading component */
  loadingComponent?: ReactNode;
  /** Empty state content */
  emptyState?: ReactNode;
  /** Error state */
  error?: string | Error;

  // Bulk actions
  /** Bulk actions component (shown when items selected) */
  bulkActions?: ReactNode;

  // Styling
  /** Container class names */
  className?: string;
  /** Enable striped rows */
  striped?: boolean;
  /** Enable row hover effect */
  hoverable?: boolean;
  /** Table size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Sticky header */
  stickyHeader?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  isRowSelectable,
  sortBy,
  sortOrder = 'asc',
  onSort,
  pagination,
  onRowClick,
  rowClassName,
  expandedRowRender,
  expandedRowIds = new Set(),
  onExpandChange,
  loading = false,
  loadingComponent,
  emptyState,
  error,
  bulkActions,
  className,
  striped = false,
  hoverable = true,
  size = 'md',
  stickyHeader = false,
}: DataTableProps<T>) {
  // Size variants
  const sizeClasses = {
    sm: { cell: 'px-3 py-2 text-xs', header: 'px-3 py-2 text-xs' },
    md: { cell: 'px-4 py-3 text-sm', header: 'px-4 py-3 text-xs' },
    lg: { cell: 'px-6 py-4 text-base', header: 'px-6 py-3 text-sm' },
  };

  // Selection handlers
  const allSelectableIds = data
    .filter((item) => !isRowSelectable || isRowSelectable(item))
    .map((item, index) => getRowKey(item, index));

  const isAllSelected = allSelectableIds.length > 0 &&
    allSelectableIds.every((id) => selectedIds.has(id));

  const isIndeterminate = !isAllSelected &&
    allSelectableIds.some((id) => selectedIds.has(id));

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (isAllSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(allSelectableIds));
    }
  };

  const handleSelectRow = (id: string | number) => {
    if (!onSelectionChange) return;

    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    onSelectionChange(newSelected);
  };

  // Sort handler
  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSort) return;

    const key = column.sortKey || column.key;
    const newOrder = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(key, newOrder);
  };

  // Alignment classes
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-2">Error loading data</div>
        <div className="text-sm text-gray-500">
          {typeof error === 'string' ? error : error.message}
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        {emptyState || (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-2">No data found</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Bulk Actions Bar */}
      {selectable && selectedIds.size > 0 && bulkActions && (
        <div className="bg-primary-50 border border-primary-200 rounded-t-lg px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-primary-700">
            {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-3">{bulkActions}</div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className={cn(
            'bg-gray-50 border-b border-gray-200',
            stickyHeader && 'sticky top-0 z-10'
          )}>
            <tr>
              {/* Selection Column */}
              {selectable && (
                <th className={cn(sizeClasses[size].header, 'w-10')}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    aria-label="Select all rows"
                  />
                </th>
              )}

              {/* Expand Column */}
              {expandedRowRender && (
                <th className={cn(sizeClasses[size].header, 'w-10')} />
              )}

              {/* Data Columns */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    sizeClasses[size].header,
                    'font-medium text-gray-500 uppercase tracking-wider',
                    alignClasses[column.align || 'left'],
                    column.sortable && 'cursor-pointer hover:text-gray-700',
                    column.sticky === 'left' && 'sticky left-0 bg-gray-50',
                    column.sticky === 'right' && 'sticky right-0 bg-gray-50',
                    column.hideOnMobile && 'hidden md:table-cell',
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && (
                      <SortIndicator
                        active={sortBy === (column.sortKey || column.key)}
                        direction={sortOrder}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (expandedRowRender ? 1 : 0)}
                  className="p-8 text-center"
                >
                  {loadingComponent || <LoadingSpinner />}
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const rowKey = getRowKey(item, index);
                const isSelected = selectedIds.has(rowKey);
                const isExpanded = expandedRowIds.has(rowKey);
                const canSelect = !isRowSelectable || isRowSelectable(item);

                return (
                  <Fragment key={rowKey}>
                    <tr
                      className={cn(
                        striped && index % 2 === 1 && 'bg-gray-50',
                        hoverable && 'hover:bg-gray-50',
                        onRowClick && 'cursor-pointer',
                        isSelected && 'bg-primary-50',
                        rowClassName?.(item, index)
                      )}
                      onClick={() => onRowClick?.(item, index)}
                    >
                      {/* Selection Cell */}
                      {selectable && (
                        <td
                          className={cn(sizeClasses[size].cell)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={!canSelect}
                            onChange={() => handleSelectRow(rowKey)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                            aria-label={`Select row ${rowKey}`}
                          />
                        </td>
                      )}

                      {/* Expand Cell */}
                      {expandedRowRender && (
                        <td
                          className={cn(sizeClasses[size].cell)}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!onExpandChange) return;
                            const newExpanded = new Set(expandedRowIds);
                            if (isExpanded) {
                              newExpanded.delete(rowKey);
                            } else {
                              newExpanded.add(rowKey);
                            }
                            onExpandChange(newExpanded);
                          }}
                        >
                          <ChevronIcon
                            className={cn(
                              'w-4 h-4 text-gray-400 cursor-pointer transition-transform',
                              isExpanded && 'rotate-90'
                            )}
                          />
                        </td>
                      )}

                      {/* Data Cells */}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={cn(
                            sizeClasses[size].cell,
                            alignClasses[column.align || 'left'],
                            column.sticky === 'left' && 'sticky left-0 bg-white',
                            column.sticky === 'right' && 'sticky right-0 bg-white',
                            column.hideOnMobile && 'hidden md:table-cell',
                            column.className
                          )}
                        >
                          {column.render(item, index)}
                        </td>
                      ))}
                    </tr>

                    {/* Expanded Row */}
                    {expandedRowRender && isExpanded && (
                      <tr className="bg-gray-50">
                        <td
                          colSpan={columns.length + (selectable ? 1 : 0) + 1}
                          className="px-4 py-4"
                        >
                          {expandedRowRender(item)}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>

          <div className="flex items-center gap-4">
            {pagination.onPageSizeChange && pagination.pageSizeOptions && (
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange!(parseInt(e.target.value, 10))}
                className="text-sm border-gray-300 rounded-md"
              >
                {pagination.pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
              >
                Previous
              </Button>

              <span className="text-sm text-gray-600">
                Page {pagination.page} of{' '}
                {Math.ceil(pagination.total / pagination.pageSize)}
              </span>

              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sort Indicator Helper
function SortIndicator({ active, direction }: { active: boolean; direction: 'asc' | 'desc' }) {
  return (
    <span className={cn('ml-1', !active && 'opacity-30')}>
      {direction === 'asc' ? '\u2191' : '\u2193'}
    </span>
  );
}
```

---

## 6. Action Components

### 6.1 Button Component

```typescript
// /admin/ui-src/components/actions/Button.tsx

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size variant */
  size?: ButtonSize;
  /** Loading state */
  loading?: boolean;
  /** Icon to display before text */
  leftIcon?: ReactNode;
  /** Icon to display after text */
  rightIcon?: ReactNode;
  /** Make button full width */
  fullWidth?: boolean;
  /** Render as link */
  href?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-primary-600 text-white',
    'hover:bg-primary-700',
    'focus:ring-primary-500',
    'disabled:bg-primary-300'
  ),
  secondary: cn(
    'bg-white text-gray-700 border border-gray-300',
    'hover:bg-gray-50',
    'focus:ring-primary-500',
    'disabled:bg-gray-100 disabled:text-gray-400'
  ),
  danger: cn(
    'bg-red-600 text-white',
    'hover:bg-red-700',
    'focus:ring-red-500',
    'disabled:bg-red-300'
  ),
  ghost: cn(
    'bg-transparent text-gray-700',
    'hover:bg-gray-100',
    'focus:ring-gray-500'
  ),
  link: cn(
    'bg-transparent text-primary-600 underline-offset-4',
    'hover:underline',
    'focus:ring-primary-500'
  ),
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  href,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2',
    'rounded-lg font-medium',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:cursor-not-allowed',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    className
  );

  const content = (
    <>
      {loading && <LoadingSpinner size="sm" />}
      {!loading && leftIcon}
      {children}
      {!loading && rightIcon}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
}
```

### 6.2 ConfirmDialog Component

```typescript
// /admin/ui-src/components/actions/ConfirmDialog.tsx

export interface ConfirmDialogProps {
  /** Dialog open state */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Confirm handler */
  onConfirm: () => void | Promise<void>;
  /** Dialog title */
  title: string;
  /** Dialog description/message */
  description: ReactNode;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Confirm button variant */
  confirmVariant?: 'primary' | 'danger';
  /** Loading state for confirm action */
  loading?: boolean;
  /** Icon to display */
  icon?: 'warning' | 'danger' | 'info' | 'question';
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  loading = false,
  icon = 'question',
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    if (!loading) {
      onClose();
    }
  };

  const iconConfig = {
    warning: { bg: 'bg-amber-100', color: 'text-amber-600' },
    danger: { bg: 'bg-red-100', color: 'text-red-600' },
    info: { bg: 'bg-blue-100', color: 'text-blue-600' },
    question: { bg: 'bg-gray-100', color: 'text-gray-600' },
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 shadow-xl transition-all">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={cn(
              'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
              iconConfig[icon].bg
            )}>
              <IconComponent type={icon} className={cn('w-6 h-6', iconConfig[icon].color)} />
            </div>

            {/* Content */}
            <div className="flex-1">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-gray-600">
                {description}
              </Dialog.Description>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button
              variant={confirmVariant}
              onClick={handleConfirm}
              loading={loading}
            >
              {confirmText}
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
```

---

## Summary

This component specification document provides:

1. **Complete Type Definitions**: All entity types, filter types, and API response types
2. **Core Component Props**: Detailed interfaces for PageHeader, FilterBar, SelectFilter
3. **B2B-Specific Components**: StatusBadge, CreditMeter, ApprovalProgressBar, EntityTypeBadge, TierBadge
4. **Form Components**: CompanyForm with full validation schema
5. **Data Display**: Extended DataTable with selection, sorting, pagination, and expansion
6. **Action Components**: Button and ConfirmDialog with all variants

These specifications serve as the foundation for implementing a consistent, type-safe, and accessible admin UI for B2B management.
