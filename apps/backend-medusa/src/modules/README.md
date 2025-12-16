# Custom Modules

This directory contains custom Medusa V2 modules for B2B e-commerce functionality.

## Medusa V2 Module Architecture

Modules are self-contained business logic units with their own:
- Data models (entities)
- Services (business logic)
- Repository layer (data access)
- Loaders (initialization)

## Module Structure

```
src/modules/
├── company/                   # Company/organization management
│   ├── index.ts               # Module entry point
│   ├── service.ts             # Business logic service
│   ├── models/                # Data models
│   │   └── company.ts
│   └── migrations/            # Database migrations
│       └── Migration20240101.ts
├── quotes/                    # Quote request system
├── approvals/                 # Order approval workflows
└── spending-limits/           # Budget management
```

## Module Definition Example

```typescript
// src/modules/company/index.ts
import { Module } from "@medusajs/framework/utils";
import CompanyService from "./service";

export const COMPANY_MODULE = "companyModuleService";

export default Module(COMPANY_MODULE, {
  service: CompanyService,
});
```

## Service Example

```typescript
// src/modules/company/service.ts
import { MedusaService } from "@medusajs/framework/utils";
import { Company } from "./models/company";

class CompanyService extends MedusaService({
  Company,
}) {
  async createCompany(data: CreateCompanyInput): Promise<Company> {
    return await this.createCompanies(data);
  }

  async getCompanyWithMembers(id: string): Promise<Company> {
    return await this.retrieveCompany(id, {
      relations: ["members"],
    });
  }
}

export default CompanyService;
```

## Data Model Example

```typescript
// src/modules/company/models/company.ts
import { model } from "@medusajs/framework/utils";

const Company = model.define("company", {
  id: model.id().primaryKey(),
  name: model.text(),
  tax_id: model.text().nullable(),
  spending_limit: model.bigNumber().nullable(),
  approval_required: model.boolean().default(false),
  created_at: model.dateTime(),
  updated_at: model.dateTime(),
});

export default Company;
```

## Planned B2B Modules

### 1. Company Module
- Company profiles and settings
- Multi-user company accounts
- Company-specific pricing tiers
- Tax ID validation

### 2. Quotes Module
- Quote request workflow
- Quote expiration management
- Quote-to-order conversion
- Quote approval requirements

### 3. Approvals Module
- Order approval workflows
- Multi-level approval chains
- Approval notifications
- Approval audit trail

### 4. Spending Limits Module
- Per-user spending limits
- Per-company budgets
- Time-based budget periods
- Limit enforcement on checkout

## Registering Modules

Register custom modules in `medusa-config.ts`:

```typescript
modules: [
  {
    resolve: "./src/modules/company",
    options: {},
  },
],
```
