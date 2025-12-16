# B2B Module Links

This directory contains module link definitions that connect Medusa modules together for B2B e-commerce functionality.

## Overview

Links define relationships between entities from different modules, enabling data to be connected without tight coupling between modules. Each link creates a join table in the database with optional extra fields for metadata.

## Link Structure

```
src/links/
├── company-customer.ts           # Link companies to customers (employees)
├── quote-order.ts                # Link quotes to converted orders
├── approval-order.ts             # Link approval requests to orders
├── approval-quote.ts             # Link approval requests to quotes
├── spending-transaction-order.ts # Link spending transactions to orders
└── README.md
```

## Link Definitions

### 1. Company-Customer Link

**File:** `company-customer.ts`
**Join Table:** `company_customer_link`

Links B2B companies to Medusa customers (employees).

**Extra Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `role` | enum | Employee role (admin, manager, buyer, viewer) |
| `job_title` | text | Employee's job title |
| `department` | text | Department name |
| `can_create_orders` | boolean | Permission to place orders |
| `can_request_quotes` | boolean | Permission to request quotes |
| `can_approve_orders` | boolean | Permission to approve orders |
| `individual_spending_limit` | bigNumber | Per-employee spending cap |
| `is_primary_contact` | boolean | Primary company contact |
| `joined_at` | dateTime | When employee joined |

**Use Cases:**
- B2B customer authentication
- Role-based access control
- Per-employee spending limits
- Order approval routing

---

### 2. Quote-Order Link

**File:** `quote-order.ts`
**Join Table:** `quote_order_link`

Links converted quotes to their resulting orders.

**Extra Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `converted_at` | dateTime | Conversion timestamp |
| `converted_by_id` | text | Customer who converted |
| `original_quote_total` | bigNumber | Quote total at conversion |
| `final_order_total` | bigNumber | Final order total |
| `price_variance` | bigNumber | Difference between quote/order |
| `conversion_notes` | text | Notes about conversion |
| `prices_honored` | boolean | Whether quoted prices were kept |

**Use Cases:**
- Quote-to-order traceability
- Quote conversion analytics
- Price variance reporting

---

### 3. Approval-Order Link

**File:** `approval-order.ts`
**Join Table:** `approval_order_link`

Links approval requests to orders requiring approval.

**Extra Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `approval_status` | enum | Current status snapshot |
| `required_at` | dateTime | When approval was required |
| `approved_at` | dateTime | Final approval timestamp |
| `rejected_at` | dateTime | Rejection timestamp |
| `final_approver_id` | text | ID of final approver |
| `final_approver_name` | text | Name of final approver |
| `approval_level` | number | Level at which approved |
| `rejection_reason` | text | Reason if rejected |
| `was_expedited` | boolean | If flow was bypassed |
| `order_amount_at_approval` | bigNumber | Order amount for audit |

**Use Cases:**
- Order approval tracking
- Pending approval management
- Approval audit trail

---

### 4. Approval-Quote Link

**File:** `approval-quote.ts`
**Join Table:** `approval_quote_link`

Links approval requests to quotes requiring approval.

**Extra Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `approval_status` | enum | Current status snapshot |
| `required_at` | dateTime | When approval was required |
| `approved_at` | dateTime | Final approval timestamp |
| `rejected_at` | dateTime | Rejection timestamp |
| `final_approver_id` | text | ID of final approver |
| `quote_amount_at_approval` | bigNumber | Quote amount for audit |
| `trigger_reason` | text | Why approval was required |
| `rejection_reason` | text | Reason if rejected |
| `can_proceed` | boolean | Whether quote can proceed |
| `approval_conditions` | text | Conditions attached |

**Use Cases:**
- High-value quote approval
- Special pricing approval
- Custom terms approval

---

### 5. SpendingTransaction-Order Link

**File:** `spending-transaction-order.ts`
**Join Table:** `spending_transaction_order_link`

Links spending transactions to orders for tracking and refunds.

**Extra Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `transaction_type` | enum | Type (purchase, refund, adjustment, reversal) |
| `linked_at` | dateTime | When linked |
| `amount` | bigNumber | Transaction amount |
| `currency_code` | text | Currency code |
| `counts_toward_limit` | boolean | Affects spending limits |
| `notes` | text | Transaction notes |
| `spending_limit_id` | text | Related limit ID |
| `limit_balance_after` | bigNumber | Balance after transaction |

**Use Cases:**
- Order spending tracking
- Refund handling
- Budget audit trail

---

## Usage Examples

### Creating a Link

```typescript
import { remoteLink } from "@medusajs/medusa";
import { B2B_COMPANY_MODULE } from "../modules/b2b-company";
import { Modules } from "@medusajs/framework/utils";

// Link a customer to a company
await remoteLink.create({
  [B2B_COMPANY_MODULE]: { company_id: "comp_123" },
  [Modules.CUSTOMER]: { customer_id: "cust_456" },
});
```

### Creating a Link with Extra Fields

```typescript
// Link with extra fields
await remoteLink.create(
  {
    [B2B_COMPANY_MODULE]: { company_id: "comp_123" },
    [Modules.CUSTOMER]: { customer_id: "cust_456" },
  },
  {
    // Extra fields stored in link table
    role: "manager",
    department: "Purchasing",
    can_approve_orders: true,
  }
);
```

### Querying Linked Data

```typescript
import { remoteQuery } from "@medusajs/medusa";

// Get company with all employees
const result = await remoteQuery({
  company: {
    fields: ["id", "name", "tax_id"],
    customer: {
      fields: ["id", "email", "first_name", "last_name"],
    },
  },
  filters: {
    id: companyId,
  },
});

// Get order with quote and approval status
const orderResult = await remoteQuery({
  order: {
    fields: ["id", "total", "status"],
    quote: {
      fields: ["id", "quote_number", "status"],
    },
    approval_request: {
      fields: ["id", "status", "current_level"],
    },
  },
  filters: {
    id: orderId,
  },
});
```

### Dismissing (Removing) a Link

```typescript
await remoteLink.dismiss({
  [B2B_COMPANY_MODULE]: { company_id: "comp_123" },
  [Modules.CUSTOMER]: { customer_id: "cust_456" },
});
```

---

## Link Registration

Links are automatically registered when their files are placed in the `src/links/` directory. Medusa scans this directory on startup and creates the necessary join tables.

No manual registration in `medusa-config.ts` is required.

---

## Database Migrations

When you add a new link or modify extra fields:

1. Run migrations: `npx medusa db:migrate`
2. For development, you can use: `npx medusa db:sync`

The join tables will be created with all defined extra fields.

---

## Best Practices

1. **Use Extra Fields Wisely**: Store frequently queried data in link extra fields for better performance
2. **Denormalize for Display**: Store names/titles in links if you need them for display without joins
3. **Audit Fields**: Include timestamps for audit trail requirements
4. **Status Snapshots**: Store status in links for fast filtering without joining
5. **Amounts for History**: Store amounts at action time for accurate historical reporting
