# Custom Workflows

This directory contains custom Medusa V2 workflows for complex business processes.

## Medusa V2 Workflow Architecture

Workflows orchestrate multi-step operations with:
- Automatic compensation (rollback) on failure
- Step-by-step execution tracking
- Retry capabilities
- Async execution support

## Workflow Structure

```
src/workflows/
├── create-b2b-order/          # B2B order creation workflow
│   ├── index.ts               # Workflow definition
│   └── steps/                 # Individual workflow steps
│       ├── validate-spending-limit.ts
│       ├── check-approval-required.ts
│       └── create-approval-request.ts
├── process-quote/             # Quote processing workflow
└── company-onboarding/        # Company setup workflow
```

## Workflow Definition Example

```typescript
// src/workflows/create-b2b-order/index.ts
import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { validateSpendingLimitStep } from "./steps/validate-spending-limit";
import { checkApprovalRequiredStep } from "./steps/check-approval-required";
import { createApprovalRequestStep } from "./steps/create-approval-request";

type CreateB2BOrderInput = {
  cart_id: string;
  company_id: string;
  user_id: string;
};

export const createB2BOrderWorkflow = createWorkflow(
  "create-b2b-order",
  (input: CreateB2BOrderInput) => {
    // Step 1: Validate spending limit
    const limitValidation = validateSpendingLimitStep({
      company_id: input.company_id,
      user_id: input.user_id,
      cart_id: input.cart_id,
    });

    // Step 2: Check if approval is required
    const approvalCheck = checkApprovalRequiredStep({
      company_id: input.company_id,
      cart_total: limitValidation.cart_total,
    });

    // Step 3: Create approval request if needed
    const approvalRequest = createApprovalRequestStep({
      requires_approval: approvalCheck.requires_approval,
      cart_id: input.cart_id,
      company_id: input.company_id,
    });

    return new WorkflowResponse({
      requires_approval: approvalCheck.requires_approval,
      approval_id: approvalRequest.approval_id,
    });
  }
);
```

## Step Definition Example

```typescript
// src/workflows/create-b2b-order/steps/validate-spending-limit.ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { MedusaError } from "@medusajs/framework/utils";

type ValidateSpendingLimitInput = {
  company_id: string;
  user_id: string;
  cart_id: string;
};

export const validateSpendingLimitStep = createStep(
  "validate-spending-limit",
  async (input: ValidateSpendingLimitInput, { container }) => {
    const cartService = container.resolve("cartService");
    const spendingLimitService = container.resolve("spendingLimitService");

    // Get cart total
    const cart = await cartService.retrieve(input.cart_id, {
      relations: ["items"],
    });

    // Check spending limit
    const limit = await spendingLimitService.getUserLimit(
      input.company_id,
      input.user_id
    );

    if (limit && cart.total > limit.remaining) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Order total exceeds spending limit. Limit: ${limit.remaining}, Cart: ${cart.total}`
      );
    }

    return new StepResponse({
      cart_total: cart.total,
      within_limit: true,
    });
  }
);
```

## Step with Compensation (Rollback)

```typescript
export const reserveInventoryStep = createStep(
  "reserve-inventory",
  async (input: ReserveInput, { container }) => {
    const inventoryService = container.resolve("inventoryService");

    const reservation = await inventoryService.reserve(input.items);

    // Return data and compensation data
    return new StepResponse(
      { reservation_id: reservation.id },
      { reservation_id: reservation.id }  // Passed to compensation
    );
  },
  // Compensation function - runs on workflow failure
  async (compensationData, { container }) => {
    const inventoryService = container.resolve("inventoryService");
    await inventoryService.releaseReservation(compensationData.reservation_id);
  }
);
```

## Invoking Workflows

From API routes or services:

```typescript
import { createB2BOrderWorkflow } from "../workflows/create-b2b-order";

// In an API route handler
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { result, errors } = await createB2BOrderWorkflow(req.scope).run({
    input: {
      cart_id: req.body.cart_id,
      company_id: req.body.company_id,
      user_id: req.auth_context.actor_id,
    },
  });

  if (errors.length) {
    throw errors[0].error;
  }

  res.json(result);
}
```

## Planned B2B Workflows

### 1. Create B2B Order Workflow
1. Validate customer belongs to company
2. Check spending limits
3. Determine if approval required
4. Create order or approval request
5. Notify appropriate parties

### 2. Process Quote Workflow
1. Validate quote items and pricing
2. Calculate B2B-specific discounts
3. Generate quote document
4. Set expiration
5. Notify sales team

### 3. Company Onboarding Workflow
1. Validate company information
2. Create company record
3. Set up default spending limits
4. Create admin user
5. Send welcome notifications

### 4. Order Approval Workflow
1. Receive approval request
2. Route to appropriate approver
3. Wait for approval decision
4. On approve: Create order
5. On reject: Notify requester
