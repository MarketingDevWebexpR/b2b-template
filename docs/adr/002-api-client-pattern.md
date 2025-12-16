# ADR-002: API Client Pattern for Multi-Source Commerce

## Status

Accepted

**Date:** 2024-12-15

**Deciders:** Engineering Team

## Context

The Maison Bijoux B2B platform needs to integrate with multiple e-commerce backends:

- **Sage ERP:** Inventory, pricing, and B2B customer management
- **Medusa V2:** Primary commerce engine (future)
- **Shopify Plus:** Alternative commerce provider
- **Bridge Laravel:** Custom middleware for legacy systems

Each backend has different API structures, authentication mechanisms, and data formats. The platform must:

1. Support switching between backends without application code changes
2. Provide a consistent developer experience regardless of backend
3. Enable B2B-specific features (quotes, approvals, spending limits)
4. Allow runtime provider selection for multi-tenant scenarios
5. Maintain type safety across all provider implementations

## Decision Drivers

- **Backend flexibility:** Ability to swap or add commerce backends
- **Developer experience:** Consistent API surface for all backends
- **Type safety:** Strong TypeScript types across all implementations
- **B2B support:** First-class support for B2B commerce features
- **Testability:** Easy to mock and test in isolation
- **Performance:** Minimal overhead from abstraction layer

## Considered Options

### Option 1: Direct API Calls

**Description:** Each application makes direct calls to the relevant backend APIs.

**Pros:**
- No abstraction overhead
- Simple to understand

**Cons:**
- Code duplication across applications
- Tight coupling to specific backends
- Difficult to switch providers
- No unified type system

### Option 2: GraphQL Federation

**Description:** Create a unified GraphQL layer that federates queries to different backends.

**Pros:**
- Single query endpoint
- Strong type generation
- Flexible data fetching

**Cons:**
- Additional infrastructure complexity
- Requires GraphQL expertise
- Overhead for simple queries
- Complex error handling

### Option 3: Adapter Pattern with Unified Interface

**Description:** Define a unified commerce interface (`ICommerceClient`) with provider-specific adapters implementing this interface.

**Pros:**
- Clean separation of concerns
- Type-safe across all providers
- Easy to add new providers
- Testable via interface mocking
- No additional infrastructure

**Cons:**
- Initial design investment
- All providers must support interface features
- Potential lowest common denominator problem

## Decision

**Chosen Option:** Adapter Pattern with Unified Interface

We implement a layered architecture with three packages:

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Applications                              │
│                    (Web, Mobile, APIs)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    @maison/api-client                           │
│              (Unified Facade & Client Manager)                  │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Factory     │  │ Manager     │  │ ICommerceClient         │ │
│  │ createApi() │  │ (Singleton) │  │ Interface               │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ @maison/      │    │ @maison/      │    │ @maison/      │
│ api-sage      │    │ api-medusa    │    │ api-shopify   │
│               │    │               │    │               │
│ SageAdapter   │    │ MedusaAdapter │    │ ShopifyAdapter│
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      @maison/api-core                           │
│              (Base Client, Error Handling, Types)               │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ BaseApi     │  │ Error       │  │ Common Types            │ │
│  │ Client      │  │ Classes     │  │ (Request/Response)      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Core Interface (`ICommerceClient`)

The unified interface defines all commerce operations:

```typescript
interface ICommerceClient {
  readonly provider: ApiProvider;
  readonly config: CommerceClientConfig;

  // Core commerce services
  readonly products: IProductService;
  readonly categories: ICategoryService;
  readonly cart: ICartService;
  readonly orders: IOrderService;
  readonly customers: ICustomerService;

  // B2B services (null if B2B disabled)
  readonly b2b: IB2BServices | null;

  // Authentication
  setAuthToken(token: string): void;
  clearAuth(): void;
  getAuthToken(): string | null;

  // B2B context
  setB2BContext(companyId: string, employeeId?: string): void;
  clearB2BContext(): void;
  getB2BContext(): { companyId?: string; employeeId?: string } | null;
  isB2BEnabled(): boolean;
}
```

### B2B Services Interface

```typescript
interface IB2BServices {
  readonly companies: ICompanyService;
  readonly employees: IEmployeeService;
  readonly quotes: IQuoteService;
  readonly approvals: IApprovalService;
  readonly spending: ISpendingService;
}
```

### Client Manager (Singleton Pattern)

```typescript
// Initialize at app startup
ApiClientManager.initialize({
  provider: "sage",
  baseUrl: "https://api.example.com",
  enableB2B: true
});

// Use anywhere in application
const api = ApiClientManager.getClient();
const products = await api.products.list({ pageSize: 20 });

// B2B operations
if (api.isB2BEnabled()) {
  const quote = await api.b2b.quotes.createFromCart(cartId);
}
```

### Provider Registration

New providers are registered via factory functions:

```typescript
import { registerProvider } from "@maison/api-client";
import { createSageAdapter } from "@maison/api-sage";

registerProvider("sage", createSageAdapter);
```

**Rationale:** The adapter pattern provides maximum flexibility with strong type safety. The unified interface ensures consistent behavior while allowing provider-specific optimizations. The singleton manager simplifies usage in applications while supporting multiple named clients for multi-tenant scenarios.

## Consequences

### Positive

- **Provider agnostic applications:** Applications code against the interface, not specific backends
- **Easy provider switching:** Change provider via configuration without code changes
- **Consistent error handling:** All providers throw the same error types
- **Type-safe operations:** Full TypeScript support with interface contracts
- **Testable:** Mock `ICommerceClient` for unit tests
- **B2B first-class support:** B2B operations integrated into the main interface
- **Multi-tenant support:** Named clients allow different configurations per tenant

### Negative

- **Feature parity challenge:** All providers must implement the full interface
- **Abstraction overhead:** Slight runtime cost for indirection
- **Maintenance burden:** Interface changes require updating all adapters
- **Provider-specific features:** Unique provider features need escape hatches

### Neutral

- Requires documentation of provider capabilities and limitations
- Team needs to understand the adapter pattern

## Implementation Notes

### Error Handling

All adapters use standardized error classes from `@maison/api-core`:

```typescript
import { ApiError, NotFoundError, AuthenticationError } from "@maison/api-core";

try {
  const product = await api.products.get(productId);
} catch (error) {
  if (error instanceof NotFoundError) {
    // Handle 404
  } else if (error instanceof AuthenticationError) {
    // Handle 401
  }
}
```

### Adding a New Provider

1. Create new package (e.g., `@maison/api-newprovider`)
2. Implement `ICommerceClient` interface
3. Register provider factory in `@maison/api-client`
4. Add provider type to `ApiProvider` union

```typescript
// packages/api-newprovider/src/adapter.ts
import { ICommerceClient, ProviderConfig } from "@maison/api-client";

export function createNewProviderAdapter(config: ProviderConfig): ICommerceClient {
  // Implementation
}
```

### Configuration

```typescript
const config: ProviderConfig = {
  provider: "sage",
  baseUrl: process.env.SAGE_API_URL,
  authToken: process.env.SAGE_API_TOKEN,
  enableB2B: true,
  timeout: 30000,
  b2b: {
    companyId: "comp_123"
  }
};
```

## Related Decisions

- [ADR-001: Monorepo Structure](./001-monorepo-structure.md)

## References

- [Adapter Pattern (Design Patterns)](https://refactoring.guru/design-patterns/adapter)
- [Facade Pattern](https://refactoring.guru/design-patterns/facade)
- [TypeScript Interface Design](https://www.typescriptlang.org/docs/handbook/interfaces.html)

## Changelog

| Date | Author | Description |
|------|--------|-------------|
| 2024-12-15 | Engineering Team | Initial draft |
