# B2B Admin UI Architecture Plan

## Comprehensive UI Architecture for Medusa V2 B2B Modules

This document outlines the complete UI architecture for the admin interface of the B2B modules: Companies, Quotes, Approvals, and Spending.

---

## Table of Contents

1. [Navigation Structure](#1-navigation-structure)
2. [Design System Foundation](#2-design-system-foundation)
3. [B2B Companies Module](#3-b2b-companies-module)
4. [B2B Quotes Module](#4-b2b-quotes-module)
5. [B2B Approvals Module](#5-b2b-approvals-module)
6. [B2B Spending Module](#6-b2b-spending-module)
7. [Shared Components](#7-shared-components)
8. [State Management](#8-state-management)
9. [Data Flow Architecture](#9-data-flow-architecture)
10. [File Structure](#10-file-structure)

---

## 1. Navigation Structure

### Sidebar Menu Configuration

```
B2B Management (Section Header)
|
+-- Companies
|   +-- All Companies (list)
|   +-- Pending Approval (badge: count)
|   +-- Company Tiers
|
+-- Quotes (badge: pending count)
|   +-- All Quotes
|   +-- Pending Response (badge)
|   +-- My Assigned (badge)
|
+-- Approvals
|   +-- Pending Requests (badge: count)
|   +-- Workflows
|   +-- Delegation Settings
|
+-- Spending
|   +-- Spending Limits
|   +-- Spending Rules
|   +-- Reports & Analytics
```

### Navigation Data Structure

```typescript
// /admin/ui-src/navigation/b2b-navigation.ts

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType;
  badge?: {
    count: number | 'dynamic';
    variant: 'default' | 'warning' | 'error';
  };
  children?: NavItem[];
  permissions?: string[];
}

export const b2bNavigation: NavItem[] = [
  {
    id: 'b2b-companies',
    label: 'Companies',
    href: '/admin/b2b/companies',
    icon: BuildingIcon,
    children: [
      { id: 'companies-all', label: 'All Companies', href: '/admin/b2b/companies' },
      { id: 'companies-pending', label: 'Pending Approval', href: '/admin/b2b/companies?status=pending', badge: { count: 'dynamic', variant: 'warning' } },
      { id: 'companies-tiers', label: 'Company Tiers', href: '/admin/b2b/companies/tiers' },
    ],
  },
  {
    id: 'b2b-quotes',
    label: 'Quotes',
    href: '/admin/b2b/quotes',
    icon: DocumentIcon,
    badge: { count: 'dynamic', variant: 'warning' },
    children: [
      { id: 'quotes-all', label: 'All Quotes', href: '/admin/b2b/quotes' },
      { id: 'quotes-pending', label: 'Pending Response', href: '/admin/b2b/quotes?status=submitted' },
      { id: 'quotes-assigned', label: 'My Assigned', href: '/admin/b2b/quotes?assigned_to=me' },
    ],
  },
  {
    id: 'b2b-approvals',
    label: 'Approvals',
    href: '/admin/b2b/approvals',
    icon: CheckCircleIcon,
    children: [
      { id: 'approvals-pending', label: 'Pending Requests', href: '/admin/b2b/approvals/requests?status=pending', badge: { count: 'dynamic', variant: 'error' } },
      { id: 'approvals-workflows', label: 'Workflows', href: '/admin/b2b/approvals/workflows' },
      { id: 'approvals-delegation', label: 'Delegation Settings', href: '/admin/b2b/approvals/delegation' },
    ],
  },
  {
    id: 'b2b-spending',
    label: 'Spending',
    href: '/admin/b2b/spending',
    icon: CurrencyIcon,
    children: [
      { id: 'spending-limits', label: 'Spending Limits', href: '/admin/b2b/spending/limits' },
      { id: 'spending-rules', label: 'Spending Rules', href: '/admin/b2b/spending/rules' },
      { id: 'spending-reports', label: 'Reports & Analytics', href: '/admin/b2b/spending/reports' },
    ],
  },
];
```

---

## 2. Design System Foundation

### Color Tokens (Admin Theme)

```typescript
// /admin/ui-src/design-tokens/colors.ts

export const adminColors = {
  // Primary brand colors
  primary: {
    50: '#FEF7F0',   // Lightest
    100: '#FDE8D7',
    200: '#FBCFAC',
    300: '#F7AE79',
    400: '#F18B47',
    500: '#E86F20',  // Main brand (Hermes orange)
    600: '#D05A10',
    700: '#A64A10',
    800: '#7D3B10',
    900: '#5A2D0F',
  },

  // Status colors
  status: {
    success: { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
    warning: { bg: '#FFFBEB', text: '#92400E', border: '#FCD34D' },
    error: { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' },
    info: { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' },
    neutral: { bg: '#F9FAFB', text: '#4B5563', border: '#E5E7EB' },
  },

  // Entity-specific colors (for visual distinction)
  entity: {
    company: '#4F46E5',   // Indigo
    quote: '#0891B2',     // Cyan
    approval: '#7C3AED',  // Violet
    spending: '#059669',  // Emerald
  },
};
```

### Typography Scale

```typescript
// /admin/ui-src/design-tokens/typography.ts

export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    serif: "'Cormorant Garamond', 'Georgia', serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },

  fontSize: {
    'heading-1': ['2rem', { lineHeight: '2.5rem', fontWeight: '600' }],      // 32px
    'heading-2': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],      // 24px
    'heading-3': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],  // 20px
    'heading-4': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],  // 18px
    'body': ['0.9375rem', { lineHeight: '1.5rem', fontWeight: '400' }],      // 15px
    'body-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],   // 14px
    'caption': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],       // 12px
    'label': ['0.8125rem', { lineHeight: '1.25rem', fontWeight: '500' }],    // 13px
  },
};
```

### Spacing System

```typescript
// /admin/ui-src/design-tokens/spacing.ts

export const spacing = {
  'page-x': '2rem',      // Horizontal page padding
  'page-y': '1.5rem',    // Vertical page padding
  'section': '1.5rem',   // Between major sections
  'card': '1.25rem',     // Card internal padding
  'stack': '1rem',       // Vertical stack items
  'inline': '0.75rem',   // Horizontal inline items
  'tight': '0.5rem',     // Tight groupings
  'compact': '0.25rem',  // Minimal spacing
};
```

---

## 3. B2B Companies Module

### 3.1 Companies List View

**Route:** `/admin/b2b/companies`

**Page Layout:**

```
+------------------------------------------------------------------+
|  [Breadcrumb: B2B > Companies]                                   |
|                                                                  |
|  Companies                                    [+ Add Company]    |
|  Manage B2B company accounts                                     |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  +-------------------+  +-------------------+  +----------------+ |
|  | Total Companies   |  | Pending Review    |  | Credit Used    | |
|  | 247               |  | 12                |  | 1.2M / 3.5M    | |
|  +-------------------+  +-------------------+  +----------------+ |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  [Search...              ] [Status v] [Tier v] [More Filters v]  |
|                                                                  |
|  +-------------------------------------------------------------+ |
|  | [ ] | Company           | Status    | Tier     | Credit    | |
|  +-------------------------------------------------------------+ |
|  | [ ] | Bijouterie Paris  | Active    | Gold     | 50K/100K  | |
|  | [ ] | Joaillerie Lyon   | Pending   | Standard | 0/25K     | |
|  | [ ] | ...               |           |          |           | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  [< Previous]  Page 1 of 13  [Next >]                           |
|                                                                  |
+------------------------------------------------------------------+
```

**Component Structure:**

```typescript
// Page Component
CompaniesListPage
  +-- PageHeader
  |     +-- Breadcrumbs
  |     +-- Title & Description
  |     +-- ActionButton (Add Company)
  |
  +-- StatsRow
  |     +-- StatCard (Total Companies)
  |     +-- StatCard (Pending Review)
  |     +-- StatCard (Credit Utilization)
  |
  +-- FilterBar
  |     +-- SearchInput
  |     +-- SelectFilter (Status)
  |     +-- SelectFilter (Tier)
  |     +-- FilterDropdown (Advanced)
  |
  +-- DataTable
  |     +-- TableHeader (sortable columns)
  |     +-- TableBody
  |     |     +-- CompanyRow (selectable)
  |     |           +-- CompanyCell (name, logo, email)
  |     |           +-- StatusBadge
  |     |           +-- TierBadge
  |     |           +-- CreditMeter
  |     |           +-- RowActions (dropdown)
  |     +-- TablePagination
  |
  +-- BulkActionsBar (conditional)
        +-- SelectedCount
        +-- BulkActions (Change Status, Export)
```

**Data Requirements:**

```typescript
interface CompanyListItem {
  id: string;
  name: string;
  tradeName?: string;
  slug: string;
  email: string;
  status: CompanyStatus;
  tier: CompanyTier;
  creditLimit: number;
  creditUsed: number;
  employeeCount?: number;
  accountManager?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

interface CompanyListFilters {
  search?: string;
  status?: CompanyStatus;
  tier?: CompanyTier;
  hasCredit?: boolean;
  accountManagerId?: string;
}

interface CompanyListState {
  companies: CompanyListItem[];
  total: number;
  page: number;
  pageSize: number;
  filters: CompanyListFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedIds: string[];
  isLoading: boolean;
  error?: string;
}
```

### 3.2 Company Detail View

**Route:** `/admin/b2b/companies/[id]`

**Page Layout:**

```
+------------------------------------------------------------------+
|  [< Back to Companies]                                           |
|                                                                  |
|  [Logo] Bijouterie Parisienne              [Edit] [Actions v]    |
|         contact@bijouterie-paris.fr                              |
|         [Active] [Gold Tier]                                     |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  [Overview] [Addresses] [Credit] [Orders] [Quotes] [Activity]    |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  OVERVIEW TAB:                                                   |
|                                                                  |
|  +---------------------------+  +------------------------------+ |
|  | Company Information       |  | Credit Overview              | |
|  |                           |  |                              | |
|  | Legal Name: Bijouterie... |  | [=========>     ] 67%        | |
|  | Trade Name: BP Joaillerie |  | Used: 67,000 / 100,000       | |
|  | Tax ID: FR123456789       |  |                              | |
|  | Registration: 12345678    |  | [Adjust Credit] [View Hist]  | |
|  | Website: www.bp-paris.fr  |  +------------------------------+ |
|  | Phone: +33 1 23 45 67 89  |                                  |
|  |                           |  +------------------------------+ |
|  | Account Manager:          |  | Payment Terms                | |
|  | Jean Dupont               |  |                              | |
|  |                           |  | Type: Net 30                 | |
|  | Sales Rep:                |  | Days: 30                     | |
|  | Marie Martin              |  | Early Payment: 2% if <10d    | |
|  +---------------------------+  +------------------------------+ |
|                                                                  |
|  +---------------------------+  +------------------------------+ |
|  | Company Settings          |  | Recent Activity              | |
|  |                           |  |                              | |
|  | Currency: EUR             |  | - Quote Q-2024-001 created   | |
|  | Language: French          |  | - Order ORD-123 placed       | |
|  | Tax Exempt: No            |  | - Credit adjusted +5000      | |
|  | Require Approval: Yes     |  | - Employee added             | |
|  +---------------------------+  +------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

**Component Structure:**

```typescript
// Page Component
CompanyDetailPage
  +-- PageHeader
  |     +-- BackLink
  |     +-- CompanyHeader
  |     |     +-- Avatar/Logo
  |     |     +-- CompanyInfo (name, email)
  |     |     +-- StatusBadge
  |     |     +-- TierBadge
  |     +-- ActionButtons
  |           +-- EditButton
  |           +-- ActionsDropdown
  |
  +-- TabNavigation
  |     +-- Tab (Overview)
  |     +-- Tab (Addresses)
  |     +-- Tab (Credit)
  |     +-- Tab (Orders)
  |     +-- Tab (Quotes)
  |     +-- Tab (Activity)
  |
  +-- TabContent
        +-- [Overview Tab]
        |     +-- Grid (2 columns)
        |           +-- CompanyInfoCard
        |           +-- CreditOverviewCard
        |           +-- PaymentTermsCard
        |           +-- SettingsCard
        |           +-- RecentActivityCard
        |
        +-- [Addresses Tab]
        |     +-- AddressesSection
        |           +-- AddressList
        |           +-- AddAddressButton
        |
        +-- [Credit Tab]
        |     +-- CreditManagementSection
        |           +-- CreditSummary
        |           +-- CreditAdjustmentForm
        |           +-- CreditHistoryTable
        |
        +-- [Orders Tab]
        |     +-- OrdersTable (filtered by company)
        |
        +-- [Quotes Tab]
        |     +-- QuotesTable (filtered by company)
        |
        +-- [Activity Tab]
              +-- ActivityTimeline
```

### 3.3 Company Create/Edit Form

**Route:** `/admin/b2b/companies/new` | `/admin/b2b/companies/[id]/edit`

**Form Layout:**

```
+------------------------------------------------------------------+
|  [< Back]                                                        |
|                                                                  |
|  Create New Company                           [Cancel] [Save]    |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  COMPANY INFORMATION                                             |
|  +-------------------------------------------------------------+ |
|  | Company Name *              Trade Name                      | |
|  | [_________________________] [_________________________]     | |
|  |                                                             | |
|  | Email *                     Phone                           | |
|  | [_________________________] [_________________________]     | |
|  |                                                             | |
|  | Tax ID                      Registration Number             | |
|  | [_________________________] [_________________________]     | |
|  |                                                             | |
|  | Website                     Description                     | |
|  | [_________________________] [_________________________]     | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  TIER & CREDIT                                                   |
|  +-------------------------------------------------------------+ |
|  | Company Tier *              Credit Limit                    | |
|  | [Standard v]                [_________________________]     | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  PAYMENT TERMS                                                   |
|  +-------------------------------------------------------------+ |
|  | Payment Type *              Payment Days                    | |
|  | [Net 30 v]                  [30]                            | |
|  |                                                             | |
|  | [ ] Allow Partial Payments                                  | |
|  |                                                             | |
|  | Early Payment Discount (%)  Early Payment Days              | |
|  | [_________________________] [_________________________]     | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  TEAM ASSIGNMENT                                                 |
|  +-------------------------------------------------------------+ |
|  | Account Manager             Sales Representative            | |
|  | [Select user v]             [Select user v]                 | |
|  +-------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

**Form Schema:**

```typescript
interface CompanyFormData {
  // Basic Information
  name: string;
  tradeName?: string;
  email: string;
  phone?: string;
  taxId?: string;
  registrationNumber?: string;
  website?: string;
  description?: string;

  // Tier & Credit
  tier: CompanyTier;
  creditLimit: number;

  // Payment Terms
  paymentTerms: {
    type: PaymentTermType;
    days: number;
    allowPartialPayments: boolean;
    earlyPaymentDiscount?: number;
    earlyPaymentDays?: number;
  };

  // Team Assignment
  accountManagerId?: string;
  salesRepId?: string;

  // Settings
  settings: {
    defaultCurrency: string;
    defaultLanguage: string;
    taxExempt: boolean;
    requireOrderApproval: boolean;
    allowCreditPurchases: boolean;
  };
}

// Validation schema (using Zod)
const companyFormSchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200),
  email: z.string().email('Valid email is required'),
  tier: z.enum(['standard', 'silver', 'gold', 'platinum', 'enterprise']),
  creditLimit: z.number().min(0, 'Credit limit must be non-negative'),
  paymentTerms: z.object({
    type: z.enum(['prepaid', 'net_15', 'net_30', 'net_45', 'net_60', 'net_90', 'due_on_receipt']),
    days: z.number().min(0).max(365),
    allowPartialPayments: z.boolean(),
    earlyPaymentDiscount: z.number().min(0).max(100).optional(),
    earlyPaymentDays: z.number().min(0).max(365).optional(),
  }),
  // ... other fields
});
```

---

## 4. B2B Quotes Module

### 4.1 Quotes List View

**Route:** `/admin/b2b/quotes`

**Page Layout:**

```
+------------------------------------------------------------------+
|  [Breadcrumb: B2B > Quotes]                                      |
|                                                                  |
|  Quotes                                                          |
|  Manage quote requests from B2B customers                        |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  +---------------+  +---------------+  +---------------+         |
|  | Pending       |  | Responded     |  | Accepted      |         |
|  | 23            |  | 15            |  | 47 (this mo)  |         |
|  +---------------+  +---------------+  +---------------+         |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  [All] [Pending] [My Assigned] [Responded] [Expired]            |
|                                                                  |
|  [Search...       ] [Company v] [Assigned To v] [Date Range v]   |
|                                                                  |
|  +-------------------------------------------------------------+ |
|  | Quote #    | Company         | Status   | Total   | Date    | |
|  +-------------------------------------------------------------+ |
|  | Q-2024-001 | Bijouterie...   | Pending  | 10,305  | Dec 15  | |
|  |            | Marie Dupont    | [!!]     |         | 2 days  | |
|  +-------------------------------------------------------------+ |
|  | Q-2024-002 | Joaillerie Lyon | Responded| 844.80  | Dec 14  | |
|  |            | Pierre Martin   | [->JD]   |         | 3 days  | |
|  +-------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

**Component Structure:**

```typescript
// Page Component
QuotesListPage
  +-- PageHeader
  |     +-- Breadcrumbs
  |     +-- Title & Description
  |
  +-- StatsRow
  |     +-- StatCard (Pending - urgent color)
  |     +-- StatCard (Responded)
  |     +-- StatCard (Accepted This Month)
  |
  +-- FilterTabs
  |     +-- Tab (All)
  |     +-- Tab (Pending, badge)
  |     +-- Tab (My Assigned, badge)
  |     +-- Tab (Responded)
  |     +-- Tab (Expired)
  |
  +-- FilterBar
  |     +-- SearchInput
  |     +-- SelectFilter (Company)
  |     +-- SelectFilter (Assigned To)
  |     +-- DateRangePicker
  |
  +-- QuotesTable
        +-- TableHeader
        +-- TableBody
        |     +-- QuoteRow
        |           +-- QuoteNumberCell (link, with unread indicator)
        |           +-- CompanyCell (company + requester name)
        |           +-- StatusBadge (with priority indicator)
        |           +-- TotalCell (formatted currency)
        |           +-- DateCell (created + relative time)
        |           +-- AssigneeCell (avatar + name, or Unassigned)
        |           +-- RowActions
        +-- Pagination
```

### 4.2 Quote Detail View

**Route:** `/admin/b2b/quotes/[id]`

**Page Layout:**

```
+------------------------------------------------------------------+
|  [< Back to Quotes]                                              |
|                                                                  |
|  Quote Q-2024-001                [Assign] [Respond] [Actions v]  |
|  [Pending] [Normal Priority]                                     |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  +---------------------------+  +------------------------------+ |
|  | Quote Details             |  | Actions Panel                | |
|  |                           |  |                              | |
|  | Company: Bijouterie Paris |  | Current Status: Pending      | |
|  | Requester: Marie Dupont   |  |                              | |
|  | Email: marie@bp.fr        |  | Assigned To: [Unassigned]    | |
|  |                           |  | [Assign to Me] [Assign v]    | |
|  | Created: Dec 15, 2024     |  |                              | |
|  | Valid Until: Jan 15, 2025 |  | [===================]        | |
|  | Days Remaining: 30        |  | [Respond to Quote]           | |
|  +---------------------------+  +------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  LINE ITEMS                                                      |
|  +-------------------------------------------------------------+ |
|  | Product            | SKU     | Qty | List    | Req    | Line| |
|  +-------------------------------------------------------------+ |
|  | Bracelet Or 18K    | BRA-001 | 10  | 450.00  | 382.50 | 3825| |
|  | Maille Figaro      |         |     |         | -15%   |     | |
|  +-------------------------------------------------------------+ |
|  | Collier Or 18K     | COL-001 | 5   | 680.00  | 612.00 | 3060| |
|  | Pendentif Coeur    |         |     |         | -10%   |     | |
|  +-------------------------------------------------------------+ |
|  |                                    Subtotal:     10,305.00  | |
|  |                                    Req. Disc:    -1,195.00  | |
|  |                                    Quoted Total:  TBD       | |
|  +-------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  CUSTOMER NOTES                                                  |
|  +-------------------------------------------------------------+ |
|  | "Demande de tarifs preferentiels pour commande importante.  | |
|  |  Livraison souhaitee avant fin janvier."                    | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  MESSAGES                                      [+ New Message]   |
|  +-------------------------------------------------------------+ |
|  | [Marie Dupont] Dec 15, 14:30                                | |
|  | Pouvez-vous confirmer la disponibilite des bracelets?       | |
|  +-------------------------------------------------------------+ |
|  | [Admin] Dec 15, 16:00                                       | |
|  | Les bracelets sont en stock. Reponse complete a suivre.     | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  HISTORY                                                         |
|  +-------------------------------------------------------------+ |
|  | [o] Dec 15, 16:00 - Message sent by Admin                   | |
|  | [o] Dec 15, 14:30 - Quote submitted by Marie Dupont         | |
|  | [o] Dec 15, 14:00 - Quote created by Marie Dupont           | |
|  +-------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

**Component Structure:**

```typescript
// Page Component
QuoteDetailPage
  +-- PageHeader
  |     +-- BackLink
  |     +-- QuoteTitle (number + status badges)
  |     +-- ActionButtons
  |           +-- AssignButton
  |           +-- RespondButton (primary)
  |           +-- ActionsDropdown
  |
  +-- ContentGrid (2 columns on desktop)
  |     +-- LeftColumn
  |     |     +-- QuoteDetailsCard
  |     |     |     +-- CompanyInfo
  |     |     |     +-- RequesterInfo
  |     |     |     +-- DatesInfo
  |     |     +-- CustomerNotesCard
  |     |
  |     +-- RightColumn
  |           +-- ActionsPanel
  |                 +-- StatusDisplay
  |                 +-- AssignmentSection
  |                 +-- MainActionButton
  |
  +-- LineItemsSection
  |     +-- ItemsTable
  |     |     +-- ItemRow (product, qty, prices, discounts)
  |     +-- TotalsSummary
  |
  +-- MessagesSection
  |     +-- MessagesList
  |     |     +-- MessageItem (sender, timestamp, content)
  |     +-- NewMessageForm
  |
  +-- HistoryTimeline
        +-- HistoryItem (event type, description, actor, time)
```

### 4.3 Quote Response Modal/Page

**Component:** `QuoteResponseModal`

```
+------------------------------------------------------------------+
|  Respond to Quote Q-2024-001                              [X]    |
+------------------------------------------------------------------+
|                                                                  |
|  Set your pricing response for each item:                        |
|                                                                  |
|  +-------------------------------------------------------------+ |
|  | Bracelet Or 18K - Maille Figaro                             | |
|  | Qty: 10 | List: 450.00 | Requested: 382.50 (-15%)           | |
|  |                                                             | |
|  | Your Quote Price: [___________] Discount: [____]%           | |
|  |                                                             | |
|  | [Accept Requested] [Counter at List Price]                  | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  +-------------------------------------------------------------+ |
|  | Collier Or 18K - Pendentif Coeur                            | |
|  | Qty: 5 | List: 680.00 | Requested: 612.00 (-10%)            | |
|  |                                                             | |
|  | Your Quote Price: [___________] Discount: [____]%           | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  RESPONSE DETAILS                                                |
|  +-------------------------------------------------------------+ |
|  | Valid Until:  [Jan 31, 2025  v]                             | |
|  |                                                             | |
|  | Terms & Conditions:                                         | |
|  | [_________________________________________________________] | |
|  | [_________________________________________________________] | |
|  |                                                             | |
|  | Internal Notes (not visible to customer):                   | |
|  | [_________________________________________________________] | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  SUMMARY                                                         |
|  +-------------------------------------------------------------+ |
|  | Original Request:     10,305.00                             | |
|  | Your Quote Total:      9,150.00 (-11.2%)                    | |
|  | Margin:               ~2,200.00 (24%)                       | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  [Cancel]                                   [Send Response]      |
|                                                                  |
+------------------------------------------------------------------+
```

---

## 5. B2B Approvals Module

### 5.1 Approval Requests List

**Route:** `/admin/b2b/approvals/requests`

**Page Layout:**

```
+------------------------------------------------------------------+
|  [Breadcrumb: B2B > Approvals > Requests]                        |
|                                                                  |
|  Approval Requests                                               |
|  Review and process pending approval requests                    |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  +---------------+  +---------------+  +---------------+         |
|  | Pending       |  | Overdue       |  | Processed     |         |
|  | 23            |  | 5             |  | 156 (30d)     |         |
|  | [!!]          |  | [!!!]         |  |               |         |
|  +---------------+  +---------------+  +---------------+         |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  [Pending] [My Queue] [All] [Processed]                          |
|                                                                  |
|  [Search...       ] [Entity Type v] [Company v] [Workflow v]     |
|                                                                  |
|  +-------------------------------------------------------------+ |
|  | [!!] ORDER #ORD-2024-089                      2,500.00 EUR  | |
|  |      Bijouterie Paris - Marie Dupont                        | |
|  |      Workflow: Orders > 1000                                | |
|  |      Level 1/2 | Due: Dec 18 (2 days)                       | |
|  |                                                             | |
|  |      [Approve]  [Reject]  [Delegate]  [View Details]        | |
|  +-------------------------------------------------------------+ |
|  | [!]  QUOTE #Q-2024-102                       15,000.00 EUR  | |
|  |      Joaillerie Lyon - Pierre Martin                        | |
|  |      Workflow: High Value Quotes                            | |
|  |      Level 2/2 | Due: Dec 20 (4 days)                       | |
|  |                                                             | |
|  |      [Approve]  [Reject]  [Delegate]  [View Details]        | |
|  +-------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

**Component Structure:**

```typescript
// Page Component
ApprovalRequestsPage
  +-- PageHeader
  |     +-- Breadcrumbs
  |     +-- Title & Description
  |
  +-- StatsRow
  |     +-- StatCard (Pending - warning)
  |     +-- StatCard (Overdue - error)
  |     +-- StatCard (Processed 30d)
  |
  +-- FilterTabs
  |     +-- Tab (Pending, badge)
  |     +-- Tab (My Queue, badge)
  |     +-- Tab (All)
  |     +-- Tab (Processed)
  |
  +-- FilterBar
  |     +-- SearchInput
  |     +-- SelectFilter (Entity Type: Order, Quote, etc.)
  |     +-- SelectFilter (Company)
  |     +-- SelectFilter (Workflow)
  |
  +-- RequestsList
        +-- ApprovalRequestCard (for each request)
              +-- PriorityIndicator
              +-- EntityBadge (ORDER, QUOTE, etc.)
              +-- EntityReference (link)
              +-- Amount
              +-- CompanyInfo
              +-- WorkflowInfo
              +-- ProgressInfo (Level X/Y, Due date)
              +-- ActionButtons
                    +-- ApproveButton (primary)
                    +-- RejectButton (danger outline)
                    +-- DelegateButton
                    +-- ViewDetailsLink
```

### 5.2 Approval Request Detail

**Route:** `/admin/b2b/approvals/requests/[id]`

**Page Layout:**

```
+------------------------------------------------------------------+
|  [< Back to Requests]                                            |
|                                                                  |
|  Approval Request                    [Approve] [Reject] [More v] |
|  [ORDER] #ORD-2024-089                                           |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  +---------------------------+  +------------------------------+ |
|  | Request Details           |  | Approval Progress            | |
|  |                           |  |                              | |
|  | Entity: Order ORD-2024... |  | Workflow: Orders > 1000      | |
|  | Amount: 2,500.00 EUR      |  |                              | |
|  | Company: Bijouterie Paris |  | Level 1 [====>    ] Level 2  | |
|  | Requester: Marie Dupont   |  |                              | |
|  | Submitted: Dec 15, 2024   |  | [x] Level 1: Manager         | |
|  | Due: Dec 18, 2024         |  |     Approved by J. Dupont    | |
|  |                           |  |     Dec 15, 16:30            | |
|  | Priority: High            |  |                              | |
|  +---------------------------+  | [ ] Level 2: Director        | |
|                                 |     Awaiting your decision   | |
|                                 |     Due in 2 days            | |
|                                 +------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  ENTITY DETAILS (Order Preview)                                  |
|  +-------------------------------------------------------------+ |
|  | Order #ORD-2024-089                                         | |
|  | 5 items | Total: 2,500.00 EUR                               | |
|  |                                                             | |
|  | - Bracelet Or 18K (x3) - 1,350.00                           | |
|  | - Collier Argent (x2) - 1,150.00                            | |
|  |                                                             | |
|  | [View Full Order ->]                                        | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  APPROVAL DECISION                                               |
|  +-------------------------------------------------------------+ |
|  | Decision: ( ) Approve  ( ) Reject  ( ) Delegate             | |
|  |                                                             | |
|  | Comments (required for rejection):                          | |
|  | [_________________________________________________________] | |
|  |                                                             | |
|  | [Delegate to v] (if delegating)                             | |
|  +-------------------------------------------------------------+ |
|  |                              [Cancel]  [Submit Decision]    | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  APPROVAL HISTORY                                                |
|  +-------------------------------------------------------------+ |
|  | [o] Dec 15, 16:30 - Approved by Jean Dupont (Manager)       | |
|  |     "Budget approved for Q4 orders"                         | |
|  | [o] Dec 15, 10:00 - Request created                         | |
|  +-------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

### 5.3 Workflows Configuration

**Route:** `/admin/b2b/approvals/workflows`

**Page Layout:**

```
+------------------------------------------------------------------+
|  [Breadcrumb: B2B > Approvals > Workflows]                       |
|                                                                  |
|  Approval Workflows                            [+ New Workflow]  |
|  Configure automatic approval rules                              |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  [Search...       ] [Entity Type v] [Company v] [Active Only]    |
|                                                                  |
|  +-------------------------------------------------------------+ |
|  | [ON] Orders Over 1000 EUR                     Priority: 100 | |
|  |      Entity: Order | Trigger: Amount > 1000                 | |
|  |      Company: All Companies                                 | |
|  |      Levels: Manager -> Director                            | |
|  |                                        [Edit] [Duplicate]   | |
|  +-------------------------------------------------------------+ |
|  | [ON] High Value Quotes                        Priority: 90  | |
|  |      Entity: Quote | Trigger: Amount > 5000                 | |
|  |      Company: Gold & Platinum Tiers                         | |
|  |      Levels: Sales Manager -> VP Sales                      | |
|  |                                        [Edit] [Duplicate]   | |
|  +-------------------------------------------------------------+ |
|  | [OFF] All Purchases (Suspended)               Priority: 10  | |
|  |       Entity: Order | Trigger: Always                       | |
|  |       Company: Bijouterie Paris                             | |
|  |       Levels: Finance -> CEO                                | |
|  |                                        [Edit] [Activate]    | |
|  +-------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

### 5.4 Workflow Create/Edit Form

```
+------------------------------------------------------------------+
|  [< Back to Workflows]                                           |
|                                                                  |
|  Create Approval Workflow                      [Cancel] [Save]   |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  BASIC INFORMATION                                               |
|  +-------------------------------------------------------------+ |
|  | Workflow Name *            Description                      | |
|  | [_________________________] [_________________________]     | |
|  |                                                             | |
|  | Company *                  Priority                         | |
|  | [Select company v]         [100]                            | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  TRIGGER CONDITIONS                                              |
|  +-------------------------------------------------------------+ |
|  | Entity Type *              Trigger Type *                   | |
|  | [Order v]                  [Amount Exceeds v]               | |
|  |                                                             | |
|  | Threshold Amount (when Amount Exceeds selected)             | |
|  | [1000]                                                      | |
|  |                                                             | |
|  | Categories (when Category selected)                         | |
|  | [Select categories...]                                      | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  APPROVAL LEVELS                                                 |
|  +-------------------------------------------------------------+ |
|  | Level 1                                             [Remove]| |
|  | Approver Type: [Role v]  Role: [Manager v]                  | |
|  | [ ] Require all approvers at this level                     | |
|  +-------------------------------------------------------------+ |
|  | Level 2                                             [Remove]| |
|  | Approver Type: [Role v]  Role: [Director v]                 | |
|  | [ ] Require all approvers at this level                     | |
|  +-------------------------------------------------------------+ |
|  | [+ Add Level]                                               | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  ESCALATION & EXPIRATION                                         |
|  +-------------------------------------------------------------+ |
|  | Auto-escalate after (hours)   Expire after (hours)          | |
|  | [24]                          [72]                          | |
|  +-------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

---

## 6. B2B Spending Module

### 6.1 Spending Limits List

**Route:** `/admin/b2b/spending/limits`

**Page Layout:**

```
+------------------------------------------------------------------+
|  [Breadcrumb: B2B > Spending > Limits]                           |
|                                                                  |
|  Spending Limits                               [+ New Limit]     |
|  Configure spending caps for companies and employees             |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  +---------------+  +---------------+  +---------------+         |
|  | Active Limits |  | Near Threshold|  | Exceeded      |         |
|  | 45            |  | 8             |  | 3             |         |
|  +---------------+  +---------------+  +---------------+         |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  [Company v] [Entity Type v] [Period v] [Search...]              |
|                                                                  |
|  +-------------------------------------------------------------+ |
|  | COMPANY LIMITS                                              | |
|  +-------------------------------------------------------------+ |
|  | Bijouterie Paris         Monthly    100,000 EUR             | |
|  | [=========>    ] 67,000 used (67%)                          | |
|  | Resets: Jan 1, 2025                   [Edit] [View History] | |
|  +-------------------------------------------------------------+ |
|  | Joaillerie Lyon          Weekly      25,000 EUR             | |
|  | [==>           ] 8,500 used (34%)                           | |
|  | Resets: Dec 23, 2024                  [Edit] [View History] | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  +-------------------------------------------------------------+ |
|  | EMPLOYEE LIMITS                                             | |
|  +-------------------------------------------------------------+ |
|  | Marie Dupont (Bijouterie Paris)  Per Order   5,000 EUR      | |
|  | [=============] 5,000 max per order                         | |
|  |                                       [Edit] [View History] | |
|  +-------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

### 6.2 Spending Limit Form

```
+------------------------------------------------------------------+
|  [< Back to Limits]                                              |
|                                                                  |
|  Create Spending Limit                         [Cancel] [Save]   |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  LIMIT TARGET                                                    |
|  +-------------------------------------------------------------+ |
|  | Entity Type *                                               | |
|  | ( ) Company  ( ) Department  ( ) Role  ( ) Employee         | |
|  |                                                             | |
|  | Company *                                                   | |
|  | [Select company v]                                          | |
|  |                                                             | |
|  | Employee (if Employee selected)                             | |
|  | [Select employee v]                                         | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  LIMIT CONFIGURATION                                             |
|  +-------------------------------------------------------------+ |
|  | Limit Amount *             Currency                         | |
|  | [_________________________] [EUR v]                         | |
|  |                                                             | |
|  | Period Type *                                               | |
|  | ( ) Per Order  ( ) Daily  ( ) Weekly  ( ) Monthly           | |
|  | ( ) Quarterly  ( ) Yearly  ( ) Lifetime                     | |
|  |                                                             | |
|  | Warning Threshold (%)      When to warn before limit        | |
|  | [80]                                                        | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  ACTIONS WHEN EXCEEDED                                           |
|  +-------------------------------------------------------------+ |
|  | [x] Block Order                                             | |
|  | [x] Require Approval                                        | |
|  | [x] Send Notification                                       | |
|  | [ ] Allow Override (with reason)                            | |
|  +-------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

### 6.3 Spending Rules

**Route:** `/admin/b2b/spending/rules`

```
+------------------------------------------------------------------+
|  [Breadcrumb: B2B > Spending > Rules]                            |
|                                                                  |
|  Spending Rules                                [+ New Rule]      |
|  Define business rules for spending behavior                     |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  +-------------------------------------------------------------+ |
|  | [ON] Luxury Item Approval                     Priority: 100 | |
|  |      Condition: Category = "Luxury"                         | |
|  |      Action: Require Approval                               | |
|  |      Applies to: All Companies                              | |
|  |                                               [Edit] [Off]  | |
|  +-------------------------------------------------------------+ |
|  | [ON] Weekend Order Notification               Priority: 80  | |
|  |      Condition: Day = Weekend                               | |
|  |      Action: Notify Manager                                 | |
|  |      Applies to: Standard Tier                              | |
|  |                                               [Edit] [Off]  | |
|  +-------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

### 6.4 Spending Reports

**Route:** `/admin/b2b/spending/reports`

```
+------------------------------------------------------------------+
|  [Breadcrumb: B2B > Spending > Reports]                          |
|                                                                  |
|  Spending Analytics                            [Export v]        |
|  Track and analyze B2B spending patterns                         |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  [This Month v] [All Companies v] [All Entity Types v]           |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  +---------------+  +---------------+  +---------------+         |
|  | Total Spend   |  | Avg Order     |  | Limit Usage   |         |
|  | 1,234,567 EUR |  | 2,450 EUR     |  | 67%           |         |
|  | +12% vs prev  |  | -3% vs prev   |  |               |         |
|  +---------------+  +---------------+  +---------------+         |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  +-------------------------------------------------------------+ |
|  |                    SPENDING OVER TIME                       | |
|  |  [Line chart showing daily/weekly spending trends]          | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  +---------------------------+  +------------------------------+ |
|  | TOP SPENDERS              |  | SPENDING BY CATEGORY         | |
|  |                           |  |                              | |
|  | 1. Bijouterie Paris       |  | [Pie chart]                  | |
|  |    234,567 EUR            |  |                              | |
|  | 2. Joaillerie Lyon        |  | Gold: 45%                    | |
|  |    187,234 EUR            |  | Silver: 30%                  | |
|  | 3. Maison Diamant         |  | Gems: 25%                    | |
|  |    156,789 EUR            |  |                              | |
|  +---------------------------+  +------------------------------+ |
|                                                                  |
|  LIMIT VIOLATIONS                                                |
|  +-------------------------------------------------------------+ |
|  | Date       | Company         | Limit      | Amount   | Action|
|  +-------------------------------------------------------------+ |
|  | Dec 15     | Bijouterie...   | Monthly    | 105,000  | Blocked|
|  | Dec 14     | Joaillerie...   | Per Order  | 6,200    | Approved|
|  +-------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

---

## 7. Shared Components

### 7.1 Component Library Structure

```typescript
// /admin/ui-src/components/index.ts

// Layout Components
export { AdminLayout } from './layout/AdminLayout';
export { PageContainer } from './layout/PageContainer';
export { ContentGrid } from './layout/ContentGrid';
export { SidePanel } from './layout/SidePanel';

// Navigation Components
export { Breadcrumbs } from './navigation/Breadcrumbs';
export { TabNavigation } from './navigation/TabNavigation';
export { FilterTabs } from './navigation/FilterTabs';

// Data Display Components
export { DataTable } from './data/DataTable';
export { DataList } from './data/DataList';
export { StatCard } from './data/StatCard';
export { StatsRow } from './data/StatsRow';
export { Timeline } from './data/Timeline';
export { ProgressBar } from './data/ProgressBar';

// Form Components
export { Form } from './form/Form';
export { FormField } from './form/FormField';
export { Input } from './form/Input';
export { Select } from './form/Select';
export { Textarea } from './form/Textarea';
export { Checkbox } from './form/Checkbox';
export { RadioGroup } from './form/RadioGroup';
export { DatePicker } from './form/DatePicker';
export { DateRangePicker } from './form/DateRangePicker';
export { SearchInput } from './form/SearchInput';
export { CurrencyInput } from './form/CurrencyInput';

// Feedback Components
export { StatusBadge } from './feedback/StatusBadge';
export { EntityTypeBadge } from './feedback/EntityTypeBadge';
export { TierBadge } from './feedback/TierBadge';
export { PriorityIndicator } from './feedback/PriorityIndicator';
export { Toast } from './feedback/Toast';
export { Alert } from './feedback/Alert';
export { EmptyState } from './feedback/EmptyState';
export { LoadingSpinner } from './feedback/LoadingSpinner';
export { Skeleton } from './feedback/Skeleton';

// Action Components
export { Button } from './actions/Button';
export { IconButton } from './actions/IconButton';
export { ActionButton } from './actions/ActionButton';
export { DropdownMenu } from './actions/DropdownMenu';
export { ConfirmDialog } from './actions/ConfirmDialog';
export { Modal } from './actions/Modal';
export { Drawer } from './actions/Drawer';

// B2B Specific Components
export { CompanyCard } from './b2b/CompanyCard';
export { CompanySelector } from './b2b/CompanySelector';
export { CreditMeter } from './b2b/CreditMeter';
export { QuoteItemRow } from './b2b/QuoteItemRow';
export { ApprovalProgressBar } from './b2b/ApprovalProgressBar';
export { SpendingChart } from './b2b/SpendingChart';
```

### 7.2 Key Reusable Component Specifications

#### StatusBadge Component

```typescript
// /admin/ui-src/components/feedback/StatusBadge.tsx

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'dot';
  customLabel?: string;
  className?: string;
}

// Status color mapping
const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  // Company statuses
  pending: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pending' },
  active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
  suspended: { bg: 'bg-red-100', text: 'text-red-800', label: 'Suspended' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
  closed: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Closed' },

  // Quote statuses
  draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
  submitted: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Submitted' },
  under_review: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Under Review' },
  responded: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Responded' },
  accepted: { bg: 'bg-green-100', text: 'text-green-800', label: 'Accepted' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
  expired: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Expired' },
  converted: { bg: 'bg-green-100', text: 'text-green-700', label: 'Converted' },

  // Approval statuses
  approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
  in_review: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Review' },
  escalated: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Escalated' },
  delegated: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Delegated' },
};
```

#### DataTable Component

```typescript
// /admin/ui-src/components/data/DataTable.tsx

interface Column<T> {
  key: string;
  header: string;
  render: (item: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowKey: (item: T) => string | number;

  // Selection
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;

  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string) => void;

  // Pagination
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };

  // States
  loading?: boolean;
  emptyState?: ReactNode;

  // Row behavior
  onRowClick?: (item: T) => void;
  rowClassName?: (item: T) => string;

  // Actions
  bulkActions?: ReactNode;
}
```

#### CreditMeter Component

```typescript
// /admin/ui-src/components/b2b/CreditMeter.tsx

interface CreditMeterProps {
  used: number;
  limit: number;
  currency?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  warningThreshold?: number;  // percentage (default: 80)
  dangerThreshold?: number;   // percentage (default: 95)
}

// Visual states based on usage percentage:
// - Green (0-79%): Safe zone
// - Amber (80-94%): Warning zone
// - Red (95-100%): Danger zone
```

#### ApprovalProgressBar Component

```typescript
// /admin/ui-src/components/b2b/ApprovalProgressBar.tsx

interface ApprovalLevel {
  level: number;
  status: 'pending' | 'approved' | 'rejected' | 'current';
  approverName?: string;
  approvedAt?: string;
  label?: string;
}

interface ApprovalProgressBarProps {
  levels: ApprovalLevel[];
  currentLevel: number;
  totalLevels: number;
  compact?: boolean;
}

// Visual representation:
// [===] Level 1 (Approved) -> [===] Level 2 (Current) -> [ ] Level 3 (Pending)
```

---

## 8. State Management

### 8.1 State Architecture Overview

```
+------------------------------------------------------------------+
|                     STATE MANAGEMENT LAYERS                       |
+------------------------------------------------------------------+
|                                                                  |
|  SERVER STATE (React Query / TanStack Query)                     |
|  +-------------------------------------------------------------+ |
|  | - API data fetching and caching                             | |
|  | - Automatic background refetching                           | |
|  | - Optimistic updates                                        | |
|  | - Pagination state                                          | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  UI STATE (React Context / Zustand)                              |
|  +-------------------------------------------------------------+ |
|  | - Selected items (table selections)                         | |
|  | - Filter state                                              | |
|  | - Modal/drawer open states                                  | |
|  | - Form draft states                                         | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  URL STATE (Next.js Router / nuqs)                               |
|  +-------------------------------------------------------------+ |
|  | - Current filters (query params)                            | |
|  | - Pagination (page, pageSize)                               | |
|  | - Sort order                                                | |
|  | - Active tab                                                | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  LOCAL STATE (useState)                                          |
|  +-------------------------------------------------------------+ |
|  | - Component-specific toggles                                | |
|  | - Transient form values                                     | |
|  | - Hover/focus states                                        | |
|  +-------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

### 8.2 Query Hooks Structure

```typescript
// /admin/ui-src/hooks/queries/useCompanies.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/client';

// Query Keys Factory
export const companyKeys = {
  all: ['companies'] as const,
  lists: () => [...companyKeys.all, 'list'] as const,
  list: (filters: CompanyListFilters) => [...companyKeys.lists(), filters] as const,
  details: () => [...companyKeys.all, 'detail'] as const,
  detail: (id: string) => [...companyKeys.details(), id] as const,
  credit: (id: string) => [...companyKeys.detail(id), 'credit'] as const,
  addresses: (id: string) => [...companyKeys.detail(id), 'addresses'] as const,
};

// List Query Hook
export function useCompanies(filters: CompanyListFilters = {}) {
  return useQuery({
    queryKey: companyKeys.list(filters),
    queryFn: () => adminApi.companies.list(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Detail Query Hook
export function useCompany(id: string) {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: () => adminApi.companies.get(id),
    enabled: !!id,
  });
}

// Create Mutation Hook
export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCompanyInput) => adminApi.companies.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}

// Update Mutation Hook
export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyInput }) =>
      adminApi.companies.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}

// Credit Adjustment Mutation
export function useAdjustCredit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: AdjustCreditInput & { id: string }) =>
      adminApi.companies.adjustCredit(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.credit(id) });
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(id) });
    },
  });
}
```

### 8.3 Filter State Management

```typescript
// /admin/ui-src/hooks/useListFilters.ts

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

interface UseListFiltersOptions<T> {
  defaultFilters: T;
  paramMapping?: Partial<Record<keyof T, string>>;
}

export function useListFilters<T extends Record<string, unknown>>({
  defaultFilters,
  paramMapping = {},
}: UseListFiltersOptions<T>) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Parse current filters from URL
  const filters = useMemo<T>(() => {
    const result = { ...defaultFilters };

    for (const [key, defaultValue] of Object.entries(defaultFilters)) {
      const paramName = paramMapping[key as keyof T] ?? key;
      const paramValue = searchParams.get(paramName);

      if (paramValue !== null) {
        // Type-aware parsing
        if (typeof defaultValue === 'number') {
          result[key as keyof T] = parseInt(paramValue, 10) as T[keyof T];
        } else if (typeof defaultValue === 'boolean') {
          result[key as keyof T] = (paramValue === 'true') as T[keyof T];
        } else if (Array.isArray(defaultValue)) {
          result[key as keyof T] = paramValue.split(',') as T[keyof T];
        } else {
          result[key as keyof T] = paramValue as T[keyof T];
        }
      }
    }

    return result;
  }, [searchParams, defaultFilters, paramMapping]);

  // Update filters in URL
  const setFilters = useCallback(
    (updates: Partial<T>) => {
      const params = new URLSearchParams(searchParams);

      for (const [key, value] of Object.entries(updates)) {
        const paramName = paramMapping[key as keyof T] ?? key;

        if (value === undefined || value === null || value === defaultFilters[key as keyof T]) {
          params.delete(paramName);
        } else if (Array.isArray(value)) {
          params.set(paramName, value.join(','));
        } else {
          params.set(paramName, String(value));
        }
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router, defaultFilters, paramMapping]
  );

  const resetFilters = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  return { filters, setFilters, resetFilters };
}
```

---

## 9. Data Flow Architecture

### 9.1 API Client Structure

```typescript
// /admin/ui-src/api/client.ts

import { medusaClient } from '@medusajs/admin-sdk';

export const adminApi = {
  companies: {
    list: (filters: CompanyListFilters) =>
      medusaClient.admin.custom.get<CompanyListResponse>('/b2b/companies', { params: filters }),

    get: (id: string) =>
      medusaClient.admin.custom.get<CompanyResponse>(`/b2b/companies/${id}`),

    create: (data: CreateCompanyInput) =>
      medusaClient.admin.custom.post<CompanyResponse>('/b2b/companies', data),

    update: (id: string, data: UpdateCompanyInput) =>
      medusaClient.admin.custom.patch<CompanyResponse>(`/b2b/companies/${id}`, data),

    updateStatus: (id: string, status: CompanyStatus, reason?: string) =>
      medusaClient.admin.custom.post<CompanyResponse>(`/b2b/companies/${id}/status`, { status, reason }),

    adjustCredit: (id: string, data: AdjustCreditInput) =>
      medusaClient.admin.custom.post<CompanyResponse>(`/b2b/companies/${id}/credit`, data),

    getAddresses: (id: string) =>
      medusaClient.admin.custom.get<AddressListResponse>(`/b2b/companies/${id}/addresses`),
  },

  quotes: {
    list: (filters: QuoteListFilters) =>
      medusaClient.admin.custom.get<QuoteListResponse>('/b2b/quotes', { params: filters }),

    get: (id: string) =>
      medusaClient.admin.custom.get<QuoteResponse>(`/b2b/quotes/${id}`),

    respond: (id: string, data: QuoteResponseInput) =>
      medusaClient.admin.custom.post<QuoteResponse>(`/b2b/quotes/${id}/respond`, data),

    assign: (id: string, userId: string) =>
      medusaClient.admin.custom.post<QuoteResponse>(`/b2b/quotes/${id}/assign`, { user_id: userId }),

    addMessage: (id: string, data: AddMessageInput) =>
      medusaClient.admin.custom.post<MessageResponse>(`/b2b/quotes/${id}/messages`, data),
  },

  approvals: {
    workflows: {
      list: (filters: WorkflowListFilters) =>
        medusaClient.admin.custom.get<WorkflowListResponse>('/b2b/approvals/workflows', { params: filters }),

      get: (id: string) =>
        medusaClient.admin.custom.get<WorkflowResponse>(`/b2b/approvals/workflows/${id}`),

      create: (data: CreateWorkflowInput) =>
        medusaClient.admin.custom.post<WorkflowResponse>('/b2b/approvals/workflows', data),

      update: (id: string, data: UpdateWorkflowInput) =>
        medusaClient.admin.custom.patch<WorkflowResponse>(`/b2b/approvals/workflows/${id}`, data),
    },

    requests: {
      list: (filters: RequestListFilters) =>
        medusaClient.admin.custom.get<RequestListResponse>('/b2b/approvals/requests', { params: filters }),

      get: (id: string) =>
        medusaClient.admin.custom.get<RequestResponse>(`/b2b/approvals/requests/${id}`),

      processAction: (id: string, data: ProcessActionInput) =>
        medusaClient.admin.custom.post<RequestResponse>(`/b2b/approvals/requests/${id}/action`, data),
    },
  },

  spending: {
    limits: {
      list: (filters: LimitListFilters) =>
        medusaClient.admin.custom.get<LimitListResponse>('/b2b/spending/limits', { params: filters }),

      get: (id: string) =>
        medusaClient.admin.custom.get<LimitResponse>(`/b2b/spending/limits/${id}`),

      create: (data: CreateLimitInput) =>
        medusaClient.admin.custom.post<LimitResponse>('/b2b/spending/limits', data),

      update: (id: string, data: UpdateLimitInput) =>
        medusaClient.admin.custom.patch<LimitResponse>(`/b2b/spending/limits/${id}`, data),
    },

    rules: {
      list: (filters: RuleListFilters) =>
        medusaClient.admin.custom.get<RuleListResponse>('/b2b/spending/rules', { params: filters }),

      create: (data: CreateRuleInput) =>
        medusaClient.admin.custom.post<RuleResponse>('/b2b/spending/rules', data),
    },

    reports: {
      getSummary: (params: ReportParams) =>
        medusaClient.admin.custom.get<SpendingSummary>('/b2b/spending/reports/summary', { params }),

      getTimeSeries: (params: ReportParams) =>
        medusaClient.admin.custom.get<SpendingTimeSeries>('/b2b/spending/reports/time-series', { params }),
    },
  },
};
```

### 9.2 Data Flow Diagram

```
+------------------------------------------------------------------+
|                        DATA FLOW DIAGRAM                          |
+------------------------------------------------------------------+
|                                                                  |
|  USER ACTION                                                     |
|       |                                                          |
|       v                                                          |
|  +-----------+                                                   |
|  | Component |                                                   |
|  +-----------+                                                   |
|       |                                                          |
|       | calls hook                                               |
|       v                                                          |
|  +------------------+                                            |
|  | Query/Mutation   |                                            |
|  | Hook             |                                            |
|  +------------------+                                            |
|       |                                                          |
|       | uses                                                     |
|       v                                                          |
|  +------------------+     +------------------+                   |
|  | React Query      |<--->| Query Cache      |                   |
|  | Client           |     +------------------+                   |
|  +------------------+                                            |
|       |                                                          |
|       | calls                                                    |
|       v                                                          |
|  +------------------+                                            |
|  | API Client       |                                            |
|  | (adminApi)       |                                            |
|  +------------------+                                            |
|       |                                                          |
|       | HTTP request                                             |
|       v                                                          |
|  +------------------+                                            |
|  | Medusa Admin     |                                            |
|  | API Routes       |                                            |
|  +------------------+                                            |
|       |                                                          |
|       | resolves                                                 |
|       v                                                          |
|  +------------------+                                            |
|  | Module Service   |                                            |
|  | (CompanyModule,  |                                            |
|  |  QuoteModule,    |                                            |
|  |  etc.)           |                                            |
|  +------------------+                                            |
|       |                                                          |
|       | queries                                                  |
|       v                                                          |
|  +------------------+                                            |
|  | Database         |                                            |
|  +------------------+                                            |
|                                                                  |
+------------------------------------------------------------------+
```

---

## 10. File Structure

### 10.1 Admin UI Source Structure

```
apps/backend-medusa/
|-- src/
|   |-- admin/
|   |   |-- ui-src/
|   |   |   |-- components/
|   |   |   |   |-- layout/
|   |   |   |   |   |-- AdminLayout.tsx
|   |   |   |   |   |-- PageContainer.tsx
|   |   |   |   |   |-- ContentGrid.tsx
|   |   |   |   |   |-- SidePanel.tsx
|   |   |   |   |
|   |   |   |   |-- navigation/
|   |   |   |   |   |-- Breadcrumbs.tsx
|   |   |   |   |   |-- TabNavigation.tsx
|   |   |   |   |   |-- FilterTabs.tsx
|   |   |   |   |   |-- B2BNavigation.tsx
|   |   |   |   |
|   |   |   |   |-- data/
|   |   |   |   |   |-- DataTable.tsx
|   |   |   |   |   |-- DataList.tsx
|   |   |   |   |   |-- StatCard.tsx
|   |   |   |   |   |-- StatsRow.tsx
|   |   |   |   |   |-- Timeline.tsx
|   |   |   |   |   |-- ProgressBar.tsx
|   |   |   |   |
|   |   |   |   |-- form/
|   |   |   |   |   |-- Form.tsx
|   |   |   |   |   |-- FormField.tsx
|   |   |   |   |   |-- Input.tsx
|   |   |   |   |   |-- Select.tsx
|   |   |   |   |   |-- Textarea.tsx
|   |   |   |   |   |-- Checkbox.tsx
|   |   |   |   |   |-- RadioGroup.tsx
|   |   |   |   |   |-- DatePicker.tsx
|   |   |   |   |   |-- SearchInput.tsx
|   |   |   |   |   |-- CurrencyInput.tsx
|   |   |   |   |
|   |   |   |   |-- feedback/
|   |   |   |   |   |-- StatusBadge.tsx
|   |   |   |   |   |-- EntityTypeBadge.tsx
|   |   |   |   |   |-- TierBadge.tsx
|   |   |   |   |   |-- PriorityIndicator.tsx
|   |   |   |   |   |-- Toast.tsx
|   |   |   |   |   |-- Alert.tsx
|   |   |   |   |   |-- EmptyState.tsx
|   |   |   |   |   |-- LoadingSpinner.tsx
|   |   |   |   |   |-- Skeleton.tsx
|   |   |   |   |
|   |   |   |   |-- actions/
|   |   |   |   |   |-- Button.tsx
|   |   |   |   |   |-- IconButton.tsx
|   |   |   |   |   |-- ActionButton.tsx
|   |   |   |   |   |-- DropdownMenu.tsx
|   |   |   |   |   |-- ConfirmDialog.tsx
|   |   |   |   |   |-- Modal.tsx
|   |   |   |   |   |-- Drawer.tsx
|   |   |   |   |
|   |   |   |   |-- b2b/
|   |   |   |   |   |-- CompanyCard.tsx
|   |   |   |   |   |-- CompanySelector.tsx
|   |   |   |   |   |-- CreditMeter.tsx
|   |   |   |   |   |-- QuoteItemRow.tsx
|   |   |   |   |   |-- QuoteResponseForm.tsx
|   |   |   |   |   |-- ApprovalProgressBar.tsx
|   |   |   |   |   |-- ApprovalActionPanel.tsx
|   |   |   |   |   |-- SpendingChart.tsx
|   |   |   |   |   |-- SpendingLimitCard.tsx
|   |   |   |   |
|   |   |   |   |-- index.ts
|   |   |   |
|   |   |   |-- pages/
|   |   |   |   |-- b2b/
|   |   |   |   |   |-- companies/
|   |   |   |   |   |   |-- CompaniesListPage.tsx
|   |   |   |   |   |   |-- CompanyDetailPage.tsx
|   |   |   |   |   |   |-- CompanyFormPage.tsx
|   |   |   |   |   |   |-- components/
|   |   |   |   |   |   |   |-- CompanyInfoCard.tsx
|   |   |   |   |   |   |   |-- CreditManagementCard.tsx
|   |   |   |   |   |   |   |-- AddressesTab.tsx
|   |   |   |   |   |   |   |-- CompanyFilters.tsx
|   |   |   |   |   |   |   |-- CompanyTable.tsx
|   |   |   |   |   |   |-- index.ts
|   |   |   |   |   |
|   |   |   |   |   |-- quotes/
|   |   |   |   |   |   |-- QuotesListPage.tsx
|   |   |   |   |   |   |-- QuoteDetailPage.tsx
|   |   |   |   |   |   |-- components/
|   |   |   |   |   |   |   |-- QuoteFilters.tsx
|   |   |   |   |   |   |   |-- QuoteTable.tsx
|   |   |   |   |   |   |   |-- QuoteLineItems.tsx
|   |   |   |   |   |   |   |-- QuoteMessages.tsx
|   |   |   |   |   |   |   |-- QuoteHistory.tsx
|   |   |   |   |   |   |   |-- QuoteResponseModal.tsx
|   |   |   |   |   |   |   |-- QuoteAssignModal.tsx
|   |   |   |   |   |   |-- index.ts
|   |   |   |   |   |
|   |   |   |   |   |-- approvals/
|   |   |   |   |   |   |-- RequestsListPage.tsx
|   |   |   |   |   |   |-- RequestDetailPage.tsx
|   |   |   |   |   |   |-- WorkflowsListPage.tsx
|   |   |   |   |   |   |-- WorkflowFormPage.tsx
|   |   |   |   |   |   |-- DelegationPage.tsx
|   |   |   |   |   |   |-- components/
|   |   |   |   |   |   |   |-- RequestCard.tsx
|   |   |   |   |   |   |   |-- RequestFilters.tsx
|   |   |   |   |   |   |   |-- ApprovalDecisionForm.tsx
|   |   |   |   |   |   |   |-- WorkflowCard.tsx
|   |   |   |   |   |   |   |-- WorkflowLevelEditor.tsx
|   |   |   |   |   |   |-- index.ts
|   |   |   |   |   |
|   |   |   |   |   |-- spending/
|   |   |   |   |   |   |-- LimitsListPage.tsx
|   |   |   |   |   |   |-- LimitFormPage.tsx
|   |   |   |   |   |   |-- RulesListPage.tsx
|   |   |   |   |   |   |-- RuleFormPage.tsx
|   |   |   |   |   |   |-- ReportsPage.tsx
|   |   |   |   |   |   |-- components/
|   |   |   |   |   |   |   |-- LimitCard.tsx
|   |   |   |   |   |   |   |-- LimitFilters.tsx
|   |   |   |   |   |   |   |-- RuleCard.tsx
|   |   |   |   |   |   |   |-- SpendingOverview.tsx
|   |   |   |   |   |   |   |-- SpendingTrends.tsx
|   |   |   |   |   |   |   |-- TopSpenders.tsx
|   |   |   |   |   |   |-- index.ts
|   |   |   |   |   |
|   |   |   |   |   |-- index.ts
|   |   |   |
|   |   |   |-- hooks/
|   |   |   |   |-- queries/
|   |   |   |   |   |-- useCompanies.ts
|   |   |   |   |   |-- useQuotes.ts
|   |   |   |   |   |-- useApprovals.ts
|   |   |   |   |   |-- useSpending.ts
|   |   |   |   |   |-- index.ts
|   |   |   |   |
|   |   |   |   |-- useListFilters.ts
|   |   |   |   |-- useSelection.ts
|   |   |   |   |-- usePagination.ts
|   |   |   |   |-- useDebounce.ts
|   |   |   |   |-- index.ts
|   |   |   |
|   |   |   |-- api/
|   |   |   |   |-- client.ts
|   |   |   |   |-- types.ts
|   |   |   |
|   |   |   |-- design-tokens/
|   |   |   |   |-- colors.ts
|   |   |   |   |-- typography.ts
|   |   |   |   |-- spacing.ts
|   |   |   |   |-- index.ts
|   |   |   |
|   |   |   |-- utils/
|   |   |   |   |-- formatters.ts
|   |   |   |   |-- validators.ts
|   |   |   |   |-- cn.ts
|   |   |   |   |-- index.ts
|   |   |   |
|   |   |   |-- routes.tsx (Admin route definitions)
|   |   |
|   |   |-- widgets/
|   |   |   |-- b2b-dashboard-widget.tsx
|   |   |   |-- pending-approvals-widget.tsx
|   |   |   |-- quote-stats-widget.tsx
```

### 10.2 Route Definitions

```typescript
// /admin/ui-src/routes.tsx

import { defineAdminRoutes } from '@medusajs/admin-sdk';

export const b2bRoutes = defineAdminRoutes([
  // Companies
  {
    path: '/b2b/companies',
    Component: () => import('./pages/b2b/companies/CompaniesListPage'),
  },
  {
    path: '/b2b/companies/new',
    Component: () => import('./pages/b2b/companies/CompanyFormPage'),
  },
  {
    path: '/b2b/companies/:id',
    Component: () => import('./pages/b2b/companies/CompanyDetailPage'),
  },
  {
    path: '/b2b/companies/:id/edit',
    Component: () => import('./pages/b2b/companies/CompanyFormPage'),
  },

  // Quotes
  {
    path: '/b2b/quotes',
    Component: () => import('./pages/b2b/quotes/QuotesListPage'),
  },
  {
    path: '/b2b/quotes/:id',
    Component: () => import('./pages/b2b/quotes/QuoteDetailPage'),
  },

  // Approvals
  {
    path: '/b2b/approvals/requests',
    Component: () => import('./pages/b2b/approvals/RequestsListPage'),
  },
  {
    path: '/b2b/approvals/requests/:id',
    Component: () => import('./pages/b2b/approvals/RequestDetailPage'),
  },
  {
    path: '/b2b/approvals/workflows',
    Component: () => import('./pages/b2b/approvals/WorkflowsListPage'),
  },
  {
    path: '/b2b/approvals/workflows/new',
    Component: () => import('./pages/b2b/approvals/WorkflowFormPage'),
  },
  {
    path: '/b2b/approvals/workflows/:id',
    Component: () => import('./pages/b2b/approvals/WorkflowFormPage'),
  },
  {
    path: '/b2b/approvals/delegation',
    Component: () => import('./pages/b2b/approvals/DelegationPage'),
  },

  // Spending
  {
    path: '/b2b/spending/limits',
    Component: () => import('./pages/b2b/spending/LimitsListPage'),
  },
  {
    path: '/b2b/spending/limits/new',
    Component: () => import('./pages/b2b/spending/LimitFormPage'),
  },
  {
    path: '/b2b/spending/limits/:id',
    Component: () => import('./pages/b2b/spending/LimitFormPage'),
  },
  {
    path: '/b2b/spending/rules',
    Component: () => import('./pages/b2b/spending/RulesListPage'),
  },
  {
    path: '/b2b/spending/rules/new',
    Component: () => import('./pages/b2b/spending/RuleFormPage'),
  },
  {
    path: '/b2b/spending/reports',
    Component: () => import('./pages/b2b/spending/ReportsPage'),
  },
]);
```

---

## Summary

This UI architecture provides:

1. **Consistent Navigation**: Hierarchical sidebar with badges for pending items
2. **Modular Component Structure**: Reusable components organized by function
3. **Efficient Data Management**: React Query for server state, URL state for filters
4. **Accessible Design**: WCAG 2.1 compliant with proper ARIA attributes
5. **Scalable Architecture**: Easy to extend with new modules or features
6. **Type-Safe**: Full TypeScript coverage with proper interfaces

### Key Design Decisions

- **List-Detail Pattern**: Every module follows list -> detail -> form flow
- **Filter State in URL**: Shareable, bookmarkable filtered views
- **Optimistic Updates**: Immediate UI feedback for better UX
- **Component Isolation**: B2B-specific components separate from core admin
- **Consistent Spacing**: 8px grid system throughout

### Next Steps for Implementation

1. Set up the admin UI scaffolding in Medusa V2
2. Implement shared components from the design system
3. Build Companies module as the foundation
4. Extend to Quotes, Approvals, and Spending modules
5. Add dashboard widgets for quick access
6. Implement real-time updates for pending items
