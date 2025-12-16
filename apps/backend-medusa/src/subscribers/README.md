# Event Subscribers

This directory contains event subscribers that react to Medusa events.

## Medusa V2 Subscriber Pattern

Subscribers listen to events emitted by Medusa modules and execute
custom logic in response. Common use cases include:

- Sending notifications on order events
- Syncing data with external systems
- Triggering workflows on state changes
- Logging and analytics

## Subscriber Structure

```
src/subscribers/
├── order-placed.ts            # React to order placement
├── customer-created.ts        # React to new customers
├── quote-requested.ts         # B2B: Quote request handling
└── approval-required.ts       # B2B: Approval workflow triggers
```

## Subscriber Example

```typescript
// src/subscribers/order-placed.ts
import type { SubscriberConfig, SubscriberArgs } from "@medusajs/framework";

/**
 * Handler for order.placed event
 * Executes when a new order is placed
 */
export default async function orderPlacedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = event.data.id;

  // Resolve services from container
  const logger = container.resolve("logger");
  const notificationService = container.resolve("notificationService");

  logger.info(`Order placed: ${orderId}`);

  // Send confirmation notification
  // await notificationService.send({
  //   to: order.email,
  //   channel: "email",
  //   template: "order-confirmation",
  //   data: { order },
  // });
}

/**
 * Subscriber configuration
 * Defines which event(s) this subscriber handles
 */
export const config: SubscriberConfig = {
  event: "order.placed",
};
```

## Multiple Events

Subscribe to multiple events:

```typescript
export const config: SubscriberConfig = {
  event: ["order.placed", "order.updated", "order.canceled"],
};
```

## Available Core Events

Common Medusa events to subscribe to:

- `order.placed` - New order created
- `order.updated` - Order modified
- `order.canceled` - Order canceled
- `order.completed` - Order fulfilled
- `customer.created` - New customer registered
- `customer.updated` - Customer profile changed
- `product.created` - New product added
- `product.updated` - Product modified
- `cart.created` - Shopping cart created
- `cart.updated` - Cart modified

## B2B Custom Events

For the B2B platform, consider these custom events:

### Quote Events
- `quote.requested` - New quote request
- `quote.approved` - Quote approved
- `quote.rejected` - Quote rejected
- `quote.expired` - Quote expiration

### Approval Events
- `approval.required` - Order needs approval
- `approval.approved` - Order approved
- `approval.rejected` - Order rejected

### Company Events
- `company.created` - New company registered
- `company.member_added` - User added to company
- `company.limit_exceeded` - Spending limit reached

## Emitting Custom Events

Emit events from services or workflows:

```typescript
import { Modules } from "@medusajs/framework/utils";

// In a service or workflow step
const eventBus = container.resolve(Modules.EVENT_BUS);

await eventBus.emit({
  name: "quote.requested",
  data: {
    quote_id: quote.id,
    company_id: quote.company_id,
    total: quote.total,
  },
});
```
