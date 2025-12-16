---
"@maison/types": minor
"@maison/api-core": minor
"@maison/api-client": minor
"@maison/api-medusa": minor
"@maison/api-bridge": minor
"@maison/api-sage": minor
"@maison/state": minor
"@maison/hooks": minor
"@maison/ui-b2b": minor
---

# B2B E-commerce Features - Initial Release

## New Packages

- **@maison/api-client**: Unified commerce client with adapter pattern supporting multiple backends
- **@maison/api-medusa**: Medusa V2 adapter with full B2B support
- **@maison/api-bridge**: Bridge Laravel adapter for external integrations
- **@maison/state**: Shared state management for B2B features (company, quotes, approvals, spending)
- **@maison/hooks**: Shared React hooks for B2B workflows
- **@maison/ui-b2b**: Headless B2B UI components (DataTable, SpendingMeter, ApprovalFlow, QuoteBuilder, BulkSelector)

## Enhanced Packages

- **@maison/types**: Added comprehensive B2B types (Company, Employee, Quote, Approval, SpendingLimit, BulkOrder)
- **@maison/api-core**: Added caching strategies, retry logic, request interceptors
- **@maison/api-sage**: Refactored to implement ICommerceClient interface

## Features

- Multi-tier company management with credit limits
- Employee roles and permissions (admin, manager, buyer, viewer)
- Quote workflow (draft -> submitted -> responded -> accepted -> converted)
- Multi-level approval workflows with delegation
- Spending limits per employee/department/role with period-based resets
- Bulk ordering with CSV import support
- B2B reporting and analytics
