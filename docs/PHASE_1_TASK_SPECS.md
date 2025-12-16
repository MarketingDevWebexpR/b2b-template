# Phase 1: Backend Abstraction Layer - Task Specifications

## Phase Overview

**Core Objective:** Create a unified API client package that abstracts e-commerce backend implementations, enabling the same app to work with multiple backends (Sage, Medusa, Shopify, Laravel).

**Success Metric:** Mobile and web apps fully functional using `@bijoux/api-client` with zero regression in existing Sage functionality.

**Duration:** 2-3 weeks

---

## Task Queue (Priority Order)

```
1. [P1-001] Create @bijoux/api-client package structure - Priority: Critical
2. [P1-002] Define IEcommerceAdapter interface - Priority: Critical
3. [P1-003] Define universal types (Product, Category, Cart, Order) - Priority: Critical
4. [P1-004] Implement BaseAdapter abstract class - Priority: High
5. [P1-005] Extract SageAdapter from existing code - Priority: Critical
6. [P1-006] Implement caching layer - Priority: High
7. [P1-007] Create EcommerceClient facade - Priority: High
8. [P1-008] Migrate mobile app to use @bijoux/api-client - Priority: Critical
9. [P1-009] Migrate web app to use @bijoux/api-client - Priority: Critical
10. [P1-010] Write unit tests for SageAdapter - Priority: High
11. [P1-011] Write integration tests - Priority: Medium
12. [P1-012] Documentation and README - Priority: Medium
```

---

## Task Specification: P1-001

**Task ID:** P1-001
**Objective:** Create the `@bijoux/api-client` package with proper monorepo configuration
**Epic:** Phase 1 - Backend Abstraction Layer
**Priority:** Critical

### Acceptance Criteria
- [ ] Package exists at `packages/api-client/`
- [ ] `package.json` configured with name `@bijoux/api-client`
- [ ] TypeScript configuration extends workspace base config
- [ ] Package exports work correctly (`import { X } from '@bijoux/api-client'`)
- [ ] Package is listed in root `pnpm-workspace.yaml`
- [ ] `turbo.json` includes build task for this package

### Technical Context
Current monorepo structure:
```
packages/
├── api-client/        # NEW - to be created
├── config-tailwind/   # Existing
├── types/             # Existing
├── utils/             # Existing
├── hooks/             # Existing
└── ui/                # Existing (empty)
```

### Suggested Approach
```bash
# Create directory structure
mkdir -p packages/api-client/src/{types,adapters/sage}

# Create package.json
# Create tsconfig.json extending base
# Create src/index.ts with placeholder exports
# Verify with: pnpm install && pnpm build
```

### File Structure to Create
```
packages/api-client/
├── src/
│   ├── index.ts                 # Main exports
│   ├── types/
│   │   └── index.ts             # Type re-exports
│   ├── adapters/
│   │   └── index.ts             # Adapter exports
│   └── client.ts                # EcommerceClient placeholder
├── package.json
├── tsconfig.json
└── README.md
```

---

## Task Specification: P1-002

**Task ID:** P1-002
**Objective:** Define the `IEcommerceAdapter` interface that all backend adapters must implement
**Epic:** Phase 1 - Backend Abstraction Layer
**Priority:** Critical

### Acceptance Criteria
- [ ] Interface defined at `packages/api-client/src/types/adapter.ts`
- [ ] All core methods defined: products, categories, cart, orders, auth
- [ ] Method signatures use universal types (not backend-specific)
- [ ] Optional methods marked with `?`
- [ ] `AdapterCapabilities` type defined to indicate what each adapter supports
- [ ] JSDoc comments on all methods

### Dependencies
- P1-001: Package structure exists

### Technical Context
Based on analysis of existing `apps/mobile/lib/api.ts` and `apps/web/lib/api.ts`, the following operations are currently supported:
- Products: getProducts, getProductById, getProductBySlug, searchProducts
- Categories: getCategories, getCategoryBySlug, getProductsByCategory
- Cart: Local state only (no backend persistence currently)
- Orders: Not fully implemented yet
- Auth: NextAuth on web, local context on mobile

### Interface Definition
```typescript
// packages/api-client/src/types/adapter.ts

import type {
  Product,
  Category,
  Cart,
  CartItem,
  Order,
  User,
  SearchParams,
  SearchResponse,
} from './index';

export interface ProductQueryOptions {
  limit?: number;
  offset?: number;
  categoryId?: string;
  featured?: boolean;
  isNew?: boolean;
  sortBy?: 'price-asc' | 'price-desc' | 'name' | 'newest';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface CreateOrderRequest {
  cartId?: string;
  items: Array<{ productId: string; quantity: number }>;
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: string;
  notes?: string;
}

export interface AdapterCapabilities {
  // Core features
  hasProducts: boolean;
  hasCategories: boolean;
  hasCart: boolean;
  hasOrders: boolean;
  hasAuth: boolean;

  // Extended features
  hasSearch: boolean;
  hasWishlist: boolean;
  hasReviews: boolean;
  hasInventory: boolean;

  // B2B features
  hasTierPricing: boolean;
  hasCustomerGroups: boolean;
  hasQuotes: boolean;
  hasCompanyAccounts: boolean;
}

export interface IEcommerceAdapter {
  /** Unique identifier for this adapter type */
  readonly type: string;

  /** Adapter capabilities */
  getCapabilities(): AdapterCapabilities;

  // ============ PRODUCTS ============

  /** Fetch all products with optional filtering */
  getProducts(options?: ProductQueryOptions): Promise<Product[]>;

  /** Fetch a single product by its unique ID */
  getProductById(id: string): Promise<Product | null>;

  /** Fetch a single product by URL slug */
  getProductBySlug(slug: string): Promise<Product | null>;

  /** Search products with full-text search and filters */
  searchProducts?(params: SearchParams): Promise<SearchResponse>;

  /** Fetch featured/promoted products */
  getFeaturedProducts?(limit?: number): Promise<Product[]>;

  // ============ CATEGORIES ============

  /** Fetch all categories */
  getCategories(): Promise<Category[]>;

  /** Fetch a single category by URL slug */
  getCategoryBySlug(slug: string): Promise<Category | null>;

  /** Fetch products within a category */
  getProductsByCategory(categoryId: string): Promise<Product[]>;

  // ============ CART ============

  /** Get or create cart for current session */
  getCart(): Promise<Cart>;

  /** Add item to cart */
  addToCart(productId: string, quantity: number, variantId?: string): Promise<Cart>;

  /** Update quantity of cart item */
  updateCartItem(itemId: string, quantity: number): Promise<Cart>;

  /** Remove item from cart */
  removeFromCart(itemId: string): Promise<Cart>;

  /** Clear all items from cart */
  clearCart(): Promise<void>;

  // ============ ORDERS ============

  /** Create order from cart */
  createOrder(data: CreateOrderRequest): Promise<Order>;

  /** Get all orders for current user */
  getOrders(): Promise<Order[]>;

  /** Get single order by ID */
  getOrderById(id: string): Promise<Order | null>;

  // ============ AUTHENTICATION ============

  /** Login with email/password */
  login(credentials: LoginCredentials): Promise<AuthResult>;

  /** Register new account */
  register(data: RegisterData): Promise<AuthResult>;

  /** Logout current user */
  logout(): Promise<void>;

  /** Get currently authenticated user */
  getCurrentUser(): Promise<User | null>;

  /** Check if user is authenticated */
  isAuthenticated(): Promise<boolean>;

  // ============ LIFECYCLE ============

  /** Initialize adapter (called once on startup) */
  initialize?(): Promise<void>;

  /** Cleanup adapter resources */
  dispose?(): Promise<void>;
}
```

---

## Task Specification: P1-003

**Task ID:** P1-003
**Objective:** Define universal types that work across all backends
**Epic:** Phase 1 - Backend Abstraction Layer
**Priority:** Critical

### Acceptance Criteria
- [ ] `Product` type defined without backend-specific fields
- [ ] `Category` type defined
- [ ] `Cart` and `CartItem` types defined
- [ ] `Order` and `OrderItem` types defined
- [ ] `User` type defined
- [ ] `Address` type defined
- [ ] All types have JSDoc documentation
- [ ] Types are compatible with existing `@bijoux/types` package

### Dependencies
- P1-001: Package structure exists

### Technical Context
Existing types in `packages/types/src/index.ts`:
- `Product` - Already fairly universal, needs review
- `Category` - Already fairly universal
- `Cart`, `CartItem` - Need enhancement
- `Order`, `OrderItem` - Already defined
- `User` - Already defined
- Sage-specific types should NOT be in universal types

### Decision
**Option A:** Create new types in `@bijoux/api-client` (duplication)
**Option B:** Enhance `@bijoux/types` and re-export from `@bijoux/api-client`

**Recommended:** Option B - Enhance existing types, re-export from api-client

### Suggested Approach
1. Review existing types in `packages/types/src/index.ts`
2. Move Sage-specific types to `packages/api-client/src/adapters/sage/types.ts`
3. Keep universal types in `packages/types`
4. Re-export from `packages/api-client/src/types/index.ts`

---

## Task Specification: P1-004

**Task ID:** P1-004
**Objective:** Implement BaseAdapter abstract class with common functionality
**Epic:** Phase 1 - Backend Abstraction Layer
**Priority:** High

### Acceptance Criteria
- [ ] Abstract class at `packages/api-client/src/adapters/base.ts`
- [ ] Common utility methods implemented (slugify, date parsing, etc.)
- [ ] Error handling pattern established
- [ ] Logging hooks defined
- [ ] All concrete adapters extend this class

### Dependencies
- P1-001: Package structure
- P1-002: Interface definition

### Technical Context
Common functionality to extract:
- `slugify()` function (currently duplicated in both apps)
- Date parsing (ASP.NET format for Sage, ISO for others)
- Error wrapping and standardization
- Request/response logging

### Implementation
```typescript
// packages/api-client/src/adapters/base.ts

export abstract class BaseAdapter implements IEcommerceAdapter {
  abstract readonly type: string;

  protected readonly baseUrl: string;
  protected readonly headers: Record<string, string>;

  constructor(config: AdapterConfig) {
    this.baseUrl = config.apiUrl;
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  // Common utilities
  protected slugify(text: string): string { /* ... */ }
  protected parseDate(dateString: string): Date { /* ... */ }
  protected async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> { /* ... */ }

  // Abstract methods that each adapter must implement
  abstract getCapabilities(): AdapterCapabilities;
  abstract getProducts(options?: ProductQueryOptions): Promise<Product[]>;
  // ... etc
}
```

---

## Task Specification: P1-005

**Task ID:** P1-005
**Objective:** Extract and refactor existing Sage API code into SageAdapter class
**Epic:** Phase 1 - Backend Abstraction Layer
**Priority:** Critical

### Acceptance Criteria
- [ ] `SageAdapter` class at `packages/api-client/src/adapters/sage/index.ts`
- [ ] All existing Sage functionality preserved
- [ ] Mapper functions in separate `mapper.ts` file
- [ ] Sage-specific types in separate `types.ts` file
- [ ] SageAdapter passes all existing functionality tests
- [ ] No Sage-specific code remains in `apps/mobile/lib/api.ts`
- [ ] No Sage-specific code remains in `apps/web/lib/api.ts`

### Dependencies
- P1-001: Package structure
- P1-002: Interface definition
- P1-003: Universal types
- P1-004: BaseAdapter class

### Technical Context
Files to refactor:
- `apps/mobile/lib/api.ts` (612 lines)
- `apps/mobile/lib/searchUtils.ts` (search-specific utilities)
- `apps/web/lib/api.ts` (531 lines)

Sage-specific code to extract:
- `mapSageArticleToProduct()` - Maps Sage article to universal Product
- `mapSageFamilleToCategory()` - Maps Sage family to universal Category
- `parseAspNetDate()` - ASP.NET date format parsing
- `getInfoLibreValue()` - Sage-specific field extraction
- `SageArticle`, `SageFamille` types

### File Structure
```
packages/api-client/src/adapters/sage/
├── index.ts           # SageAdapter class
├── mapper.ts          # mapSageArticleToProduct, mapSageFamilleToCategory
├── types.ts           # SageArticle, SageFamille, SageInfoLibre, etc.
├── client.ts          # HTTP client for Sage API
└── search.ts          # Search utilities (from searchUtils.ts)
```

### Migration Steps
1. Copy Sage-specific types to `sage/types.ts`
2. Copy mapper functions to `sage/mapper.ts`
3. Create `SageAdapter` class implementing `IEcommerceAdapter`
4. Move each API method into the adapter class
5. Update imports in mobile app to use adapter
6. Verify all functionality works
7. Update imports in web app
8. Delete old api.ts files

---

## Task Specification: P1-006

**Task ID:** P1-006
**Objective:** Implement caching layer for API responses
**Epic:** Phase 1 - Backend Abstraction Layer
**Priority:** High

### Acceptance Criteria
- [ ] Cache interface defined at `packages/api-client/src/cache.ts`
- [ ] In-memory cache implementation
- [ ] AsyncStorage cache implementation (for React Native)
- [ ] Configurable TTL per endpoint
- [ ] Cache invalidation methods
- [ ] Products and categories cached by default
- [ ] Cart NOT cached (always fresh)

### Dependencies
- P1-001: Package structure
- P1-004: BaseAdapter class

### Technical Context
Current caching:
- Web app uses Next.js `revalidate: 300` (5 min)
- Mobile app has no caching (fetches every time)

Performance impact:
- Products list: ~2-3 seconds without cache
- Categories: ~1 second without cache

### Implementation
```typescript
// packages/api-client/src/cache.ts

export interface CacheConfig {
  ttl: number;           // Time to live in milliseconds
  storage?: 'memory' | 'async-storage';
}

export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

export class MemoryCache implements ICache { /* ... */ }
export class AsyncStorageCache implements ICache { /* ... */ }
```

---

## Task Specification: P1-007

**Task ID:** P1-007
**Objective:** Create EcommerceClient facade for simplified API usage
**Epic:** Phase 1 - Backend Abstraction Layer
**Priority:** High

### Acceptance Criteria
- [ ] `EcommerceClient` class at `packages/api-client/src/client.ts`
- [ ] Factory method to create client with appropriate adapter
- [ ] Client handles adapter selection based on config
- [ ] Client provides simplified API surface
- [ ] Client manages caching transparently
- [ ] Singleton pattern for global client instance

### Dependencies
- P1-001: Package structure
- P1-002: Interface definition
- P1-004: BaseAdapter
- P1-005: SageAdapter
- P1-006: Cache

### Implementation
```typescript
// packages/api-client/src/client.ts

export interface EcommerceClientConfig {
  adapter: 'sage' | 'medusa-v1' | 'medusa-v2' | 'shopify' | 'laravel';
  apiUrl: string;
  apiKey?: string;
  cache?: CacheConfig;
}

export class EcommerceClient {
  private adapter: IEcommerceAdapter;
  private cache: ICache;

  private constructor(adapter: IEcommerceAdapter, cache: ICache) {
    this.adapter = adapter;
    this.cache = cache;
  }

  static create(config: EcommerceClientConfig): EcommerceClient {
    const adapter = createAdapter(config);
    const cache = createCache(config.cache);
    return new EcommerceClient(adapter, cache);
  }

  // Delegate to adapter with caching
  async getProducts(options?: ProductQueryOptions): Promise<Product[]> {
    const cacheKey = `products:${JSON.stringify(options)}`;
    const cached = await this.cache.get<Product[]>(cacheKey);
    if (cached) return cached;

    const products = await this.adapter.getProducts(options);
    await this.cache.set(cacheKey, products);
    return products;
  }

  // ... other methods
}

// Global singleton
let globalClient: EcommerceClient | null = null;

export function getClient(): EcommerceClient {
  if (!globalClient) {
    throw new Error('EcommerceClient not initialized. Call initializeClient first.');
  }
  return globalClient;
}

export function initializeClient(config: EcommerceClientConfig): EcommerceClient {
  globalClient = EcommerceClient.create(config);
  return globalClient;
}
```

---

## Task Specification: P1-008

**Task ID:** P1-008
**Objective:** Migrate mobile app to use `@bijoux/api-client`
**Epic:** Phase 1 - Backend Abstraction Layer
**Priority:** Critical

### Acceptance Criteria
- [ ] All imports from local `lib/api.ts` replaced with `@bijoux/api-client`
- [ ] Client initialized in app entry point (`_layout.tsx`)
- [ ] All screens use client for data fetching
- [ ] Search functionality works using api-client
- [ ] Cart context continues to work (local state for now)
- [ ] All existing functionality preserved
- [ ] No TypeScript errors
- [ ] App runs without crashes

### Dependencies
- P1-005: SageAdapter complete
- P1-007: EcommerceClient facade

### Technical Context
Files that import from `lib/api.ts`:
```
apps/mobile/app/(tabs)/index.tsx           # Uses api.getProducts, api.getFeaturedProducts
apps/mobile/app/(tabs)/search.tsx          # Uses api.searchProducts
apps/mobile/app/(tabs)/collections/        # Uses api.getCategories
apps/mobile/app/product/[...id].tsx        # Uses api.getProductById
apps/mobile/context/SearchContext.tsx      # Uses api.searchProducts
```

### Migration Steps
1. Add `@bijoux/api-client` to mobile app dependencies
2. Create initialization in `app/_layout.tsx`
3. Update each screen/component one at a time
4. Test each screen after migration
5. Remove old `lib/api.ts` file
6. Run full E2E test pass

---

## Task Specification: P1-009

**Task ID:** P1-009
**Objective:** Migrate web app to use `@bijoux/api-client`
**Epic:** Phase 1 - Backend Abstraction Layer
**Priority:** Critical

### Acceptance Criteria
- [ ] All imports from local `lib/api.ts` replaced with `@bijoux/api-client`
- [ ] Server-side data fetching uses client
- [ ] Client-side components use client
- [ ] API routes use client where applicable
- [ ] All existing functionality preserved
- [ ] No TypeScript errors
- [ ] Build completes successfully

### Dependencies
- P1-005: SageAdapter complete
- P1-007: EcommerceClient facade
- P1-008: Mobile migration (for learning/validation)

### Technical Context
Web app uses server components extensively:
```
apps/web/app/page.tsx                      # Server component - getProducts
apps/web/app/collections/page.tsx          # Server component - getCategories
apps/web/app/collections/[slug]/page.tsx   # Server component - getProductsByCategorySlug
apps/web/app/products/[slug]/page.tsx      # Server component - getProductBySlug
apps/web/app/api/categories/route.ts       # API route - getCategories
apps/web/app/api/search/route.ts           # API route - searchProducts
```

### Considerations
- Server components need to initialize client differently (no global state)
- Consider creating server-side and client-side exports
- Next.js caching may need adjustment

---

## Task Specification: P1-010

**Task ID:** P1-010
**Objective:** Write comprehensive unit tests for SageAdapter
**Epic:** Phase 1 - Backend Abstraction Layer
**Priority:** High

### Acceptance Criteria
- [ ] Test file at `packages/api-client/src/adapters/sage/__tests__/sage-adapter.test.ts`
- [ ] Tests cover all public methods
- [ ] Mocked HTTP responses for deterministic tests
- [ ] Edge cases covered (empty responses, errors, malformed data)
- [ ] > 80% code coverage
- [ ] Tests pass in CI

### Dependencies
- P1-005: SageAdapter complete

### Test Cases
```typescript
describe('SageAdapter', () => {
  describe('getProducts', () => {
    it('returns mapped products from Sage API');
    it('filters out dormant products');
    it('filters out fictitious products');
    it('handles empty response');
    it('handles network error');
    it('handles malformed data gracefully');
  });

  describe('getCategories', () => {
    it('returns only leaf categories');
    it('includes product counts');
    it('excludes categories with no products');
  });

  describe('mapSageArticleToProduct', () => {
    it('maps all required fields');
    it('handles missing optional fields');
    it('parses ASP.NET date format');
    it('calculates isAvailable correctly');
  });
});
```

---

## Task Specification: P1-011

**Task ID:** P1-011
**Objective:** Write integration tests verifying end-to-end flows
**Epic:** Phase 1 - Backend Abstraction Layer
**Priority:** Medium

### Acceptance Criteria
- [ ] Integration tests for mobile app critical paths
- [ ] Integration tests for web app critical paths
- [ ] Tests run against mock backend or test Sage instance
- [ ] Tests verify data flows correctly through adapter layer
- [ ] CI pipeline runs integration tests

### Dependencies
- P1-008: Mobile migration complete
- P1-009: Web migration complete
- P1-010: Unit tests complete

---

## Task Specification: P1-012

**Task ID:** P1-012
**Objective:** Document the api-client package and adapter pattern
**Epic:** Phase 1 - Backend Abstraction Layer
**Priority:** Medium

### Acceptance Criteria
- [ ] README.md in `packages/api-client/`
- [ ] Usage examples for creating new adapter
- [ ] API reference for `IEcommerceAdapter` interface
- [ ] Migration guide for existing code
- [ ] Architecture decision record (ADR) for adapter pattern choice

### Dependencies
- All other Phase 1 tasks complete

---

## Phase 1 Completion Checklist

### Before Starting Phase 2:

- [ ] All P1 tasks marked complete
- [ ] Mobile app works with @bijoux/api-client
- [ ] Web app works with @bijoux/api-client
- [ ] No Sage-specific code in apps (only in adapter)
- [ ] Unit test coverage > 80%
- [ ] Integration tests passing
- [ ] Team walkthrough of adapter pattern complete
- [ ] Documentation reviewed and approved

---

*Document Version: 1.0*
*Created: December 15, 2024*
