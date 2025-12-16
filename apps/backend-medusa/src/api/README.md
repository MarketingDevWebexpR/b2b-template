# Custom API Routes

This directory contains custom API routes for the Medusa backend.

## Medusa V2 API Route Structure

Medusa V2 uses file-based routing. Create routes by adding files following this pattern:

```
src/api/
├── store/                     # Public storefront routes (/store/*)
│   └── custom/
│       └── route.ts           # GET/POST /store/custom
├── admin/                     # Admin routes requiring authentication (/admin/*)
│   └── custom/
│       └── route.ts           # GET/POST /admin/custom
└── middlewares.ts             # Custom middleware configuration
```

## Route File Example

```typescript
// src/api/store/companies/route.ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

/**
 * GET /store/companies
 * Public endpoint to list companies
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  // Access services via req.scope
  // const companyService = req.scope.resolve("companyService");

  res.json({
    companies: [],
    message: "Company list endpoint",
  });
}

/**
 * POST /store/companies
 * Create a new company
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { name, email } = req.body;

  res.status(201).json({
    company: { name, email },
    message: "Company created",
  });
}
```

## Route Parameters

Use `[param]` syntax for dynamic route segments:

```
src/api/store/companies/[id]/route.ts  ->  /store/companies/:id
```

Access parameters via `req.params.id`.

## Middleware

Configure route middleware in `middlewares.ts`:

```typescript
import { defineMiddlewares } from "@medusajs/framework/http";
import { authenticate } from "@medusajs/framework/http";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/companies/*",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
  ],
});
```

## B2B Routes to Implement

For the B2B jewelry platform, consider implementing:

- `/store/companies` - Company management
- `/store/quotes` - Quote requests
- `/store/approvals` - Order approval endpoints
- `/admin/spending-limits` - Admin spending limit management
