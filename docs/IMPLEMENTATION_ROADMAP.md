# Multi-Tenant E-Commerce Platform Implementation Roadmap

## Core Objective
Transform the existing B2C luxury jewelry mobile app into a multi-tenant e-commerce platform supporting multiple backends (Sage, Medusa V1/V2, Shopify, Laravel) with both B2C and B2B app variants, using a shared codebase architecture.

**Success Metric:** Deploy first B2B client app using Medusa backend within 9 weeks while maintaining existing Sage client functionality.

---

## Executive Summary

| Phase | Name | Duration | Dependencies | Priority |
|-------|------|----------|--------------|----------|
| 1 | Backend Abstraction Layer | 2-3 weeks | None | Critical |
| 2 | Tenant Configuration System | 1-2 weeks | Phase 1 | Critical |
| 3a | Medusa V1 Adapter | 1 week | Phase 1 | High |
| 4a | B2B Core Features | 2 weeks | Phase 1, 2 | High |
| 5a | Basic Theming | 1 week | Phase 2 | High |
| 3b | Medusa V2 Adapter | 1 week | Phase 1 | Medium |
| 4b | Advanced B2B Features | 2 weeks | Phase 4a | Medium |
| 6 | Build & Deployment Pipeline | 2 weeks | Phase 2 | Medium |
| 3c | Shopify Adapter | 1.5 weeks | Phase 1 | Low |
| 5b | Full Theming System | 1 week | Phase 5a | Low |

**Total Estimated Duration:** 11-17 weeks (3-4 months)

---

## Phase 1: Backend Abstraction Layer

### Goal
Extract and abstract the API integration to support multiple e-commerce backends through a unified adapter pattern.

### Duration
2-3 weeks

### Current State Analysis
- Mobile app has `apps/mobile/lib/api.ts` with hardcoded Sage API calls
- Web app has `apps/web/lib/api.ts` with similar Sage-specific logic
- Types in `packages/types/src/index.ts` mix Sage-specific types with universal types
- Code duplication between mobile and web API files

### Deliverables

#### 1.1 Create `@bijoux/api-client` Package
```
packages/api-client/
├── src/
│   ├── index.ts                 # Public exports
│   ├── types/
│   │   ├── adapter.ts           # IEcommerceAdapter interface
│   │   ├── product.ts           # Universal Product types
│   │   ├── category.ts          # Universal Category types
│   │   ├── cart.ts              # Universal Cart types
│   │   ├── order.ts             # Universal Order types
│   │   └── auth.ts              # Universal Auth types
│   ├── adapters/
│   │   ├── index.ts             # Adapter factory
│   │   ├── sage/
│   │   │   ├── index.ts         # SageAdapter class
│   │   │   ├── mapper.ts        # Sage -> Universal mappers
│   │   │   └── types.ts         # Sage-specific types
│   │   └── base.ts              # BaseAdapter abstract class
│   ├── client.ts                # EcommerceClient facade
│   └── cache.ts                 # Caching layer
├── package.json
└── tsconfig.json
```

#### 1.2 Define Universal Adapter Interface
```typescript
interface IEcommerceAdapter {
  // Products
  getProducts(options?: ProductQueryOptions): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  getProductBySlug(slug: string): Promise<Product | null>;
  searchProducts(params: SearchParams): Promise<SearchResponse>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;

  // Cart
  getCart(): Promise<Cart>;
  addToCart(productId: string, quantity: number): Promise<Cart>;
  updateCartItem(itemId: string, quantity: number): Promise<Cart>;
  removeFromCart(itemId: string): Promise<Cart>;
  clearCart(): Promise<void>;

  // Orders
  createOrder(data: CreateOrderRequest): Promise<Order>;
  getOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;

  // Auth
  login(credentials: LoginCredentials): Promise<AuthResult>;
  register(data: RegisterData): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;

  // Capabilities
  getCapabilities(): AdapterCapabilities;
}
```

#### 1.3 Migrate Existing Sage Code
- Extract `mapSageArticleToProduct` and related functions to `adapters/sage/mapper.ts`
- Move Sage-specific types to `adapters/sage/types.ts`
- Keep universal types in `packages/types`

### MVP Definition
- [ ] `@bijoux/api-client` package created and published to workspace
- [ ] `IEcommerceAdapter` interface defined with all core methods
- [ ] `SageAdapter` fully implements the interface
- [ ] Mobile app refactored to use `@bijoux/api-client`
- [ ] Web app refactored to use `@bijoux/api-client`
- [ ] All existing functionality works unchanged
- [ ] Unit tests for SageAdapter (>80% coverage)

### Acceptance Criteria
1. Running `pnpm dev:mobile` starts the app with no errors
2. All product listing, search, cart, and checkout flows work identically to current behavior
3. No Sage-specific imports remain in `apps/mobile` or `apps/web` (except environment variables)
4. Type safety maintained - no `any` types in public API

### Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing Sage client | High | Feature branch development, maintain backwards compatibility |
| Performance regression | Medium | Implement caching layer, benchmark before/after |
| Type system complexity | Medium | Strong separation between universal and adapter-specific types |

---

## Phase 2: Tenant Configuration System

### Goal
Enable per-tenant customization through environment-based configuration without code changes.

### Duration
1-2 weeks

### Dependencies
- Phase 1 (Backend Abstraction Layer)

### Deliverables

#### 2.1 Create `@bijoux/config` Package
```
packages/config/
├── src/
│   ├── index.ts
│   ├── types.ts                 # TenantConfig, FeatureFlags types
│   ├── tenant-registry.ts       # Known tenants and defaults
│   ├── loader.ts                # Config loading logic
│   └── feature-flags.ts         # Feature flag utilities
├── tenants/
│   ├── default.json             # Default/fallback config
│   ├── bijoux-sage.json         # Current Sage client
│   └── example-b2b.json         # Example B2B tenant
├── package.json
└── tsconfig.json
```

#### 2.2 TenantConfig Type Definition
```typescript
interface TenantConfig {
  // Identity
  id: string;
  name: string;
  slug: string;

  // Backend
  backend: {
    type: 'sage' | 'medusa-v1' | 'medusa-v2' | 'shopify' | 'laravel';
    apiUrl: string;
    apiKey?: string;
    additionalConfig?: Record<string, unknown>;
  };

  // Features
  features: FeatureFlags;

  // Branding (basic)
  branding: {
    name: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
  };

  // App Config
  app: {
    bundleId: string;
    appName: string;
    scheme: string;
  };

  // Payment
  payment?: {
    provider: 'stripe' | 'paypal' | 'none';
    publicKey?: string;
  };
}

interface FeatureFlags {
  isB2B: boolean;
  hasPayments: boolean;
  hasWishlist: boolean;
  hasSearch: boolean;
  hasBarcodeScanner: boolean;
  hasQuotes: boolean;
  hasOrderApproval: boolean;
  hasCreditTerms: boolean;
}
```

#### 2.3 Environment-Based Loading
```typescript
// Load tenant based on environment
const tenantId = process.env.TENANT_ID || 'default';
const config = await loadTenantConfig(tenantId);
```

### MVP Definition
- [ ] `@bijoux/config` package created
- [ ] `TenantConfig` and `FeatureFlags` types defined
- [ ] At least 2 tenant configs (existing Sage client + test tenant)
- [ ] Config loader works in both web and mobile
- [ ] `@bijoux/api-client` uses tenant config to select adapter
- [ ] Feature flags accessible throughout the app

### Acceptance Criteria
1. Setting `TENANT_ID=bijoux-sage` loads the current client configuration
2. Setting `TENANT_ID=test-b2b` loads a different configuration
3. Adapter is automatically selected based on `backend.type`
4. Feature flags can conditionally render UI elements

---

## Phase 3a: Medusa V1 Adapter

### Goal
Implement e-commerce adapter for Medusa V1 backend to support first B2B client.

### Duration
1 week

### Dependencies
- Phase 1 (Backend Abstraction Layer)

### Deliverables

#### 3a.1 MedusaV1Adapter Implementation
```
packages/api-client/src/adapters/medusa-v1/
├── index.ts              # MedusaV1Adapter class
├── client.ts             # Medusa HTTP client
├── mapper.ts             # Medusa -> Universal mappers
├── types.ts              # Medusa-specific types
└── auth.ts               # Medusa authentication
```

#### 3a.2 Medusa API Mappings
| Universal | Medusa V1 Endpoint |
|-----------|-------------------|
| `getProducts()` | `GET /store/products` |
| `getProductById()` | `GET /store/products/:id` |
| `getCategories()` | `GET /store/product-categories` |
| `getCart()` | `GET /store/carts/:id` |
| `addToCart()` | `POST /store/carts/:id/line-items` |
| `createOrder()` | `POST /store/carts/:id/complete` |
| `login()` | `POST /store/auth` |
| `register()` | `POST /store/customers` |

### MVP Definition
- [ ] `MedusaV1Adapter` implements `IEcommerceAdapter`
- [ ] Products listing and detail pages work
- [ ] Categories listing works
- [ ] Cart operations (add, update, remove) work
- [ ] Checkout flow completes successfully
- [ ] Customer authentication works
- [ ] Tested against real Medusa V1 instance

### Acceptance Criteria
1. Switching tenant to use `backend.type: 'medusa-v1'` loads products from Medusa
2. Full purchase flow completes (browse -> cart -> checkout -> order confirmation)
3. Customer can register, login, and view order history

---

## Phase 4a: B2B Core Features

### Goal
Add fundamental B2B e-commerce capabilities: tier pricing and company accounts.

### Duration
2 weeks

### Dependencies
- Phase 1 (Backend Abstraction Layer)
- Phase 2 (Tenant Configuration - for `isB2B` flag)

### Deliverables

#### 4a.1 Tier Pricing System
```typescript
interface PriceTier {
  minQuantity: number;
  maxQuantity?: number;
  price: number;
  discount?: number;  // Percentage discount from base price
}

interface B2BProduct extends Product {
  priceTiers?: PriceTier[];
  customerGroupPrices?: Record<string, number>;  // customerGroupId -> price
}
```

#### 4a.2 Company Account Management
```typescript
interface Company {
  id: string;
  name: string;
  vatNumber?: string;
  addresses: Address[];
  users: CompanyUser[];
  customerGroupId: string;
  creditLimit?: number;
  paymentTerms?: string;
}

interface CompanyUser {
  id: string;
  userId: string;
  companyId: string;
  role: 'admin' | 'buyer' | 'viewer';
  permissions: string[];
}
```

#### 4a.3 UI Components
- `<TierPricingTable>` - Shows quantity discounts
- `<B2BProductCard>` - Product card with tier pricing indicator
- `<CompanySelector>` - For users belonging to multiple companies
- `<CompanyProfile>` - Company management screen
- `<AddCompanyUser>` - Invite users to company

### MVP Definition
- [ ] Tier pricing displayed on product pages when `isB2B: true`
- [ ] Tier pricing applied in cart calculations
- [ ] Customer group pricing fetched and applied
- [ ] Company account creation flow
- [ ] Company user invitation flow
- [ ] B2B-specific product listing with pricing tiers visible

### Acceptance Criteria
1. B2B customer sees different prices than B2C customer for same product
2. Quantity discounts automatically apply when adding 10+ items
3. Company admin can add new users to their company
4. Company addresses are available at checkout

---

## Phase 5a: Basic Theming

### Goal
Enable per-tenant visual customization (colors, logo) without code changes.

### Duration
1 week

### Dependencies
- Phase 2 (Tenant Configuration)

### Deliverables

#### 5a.1 Theme Provider
```typescript
interface TenantTheme {
  colors: {
    primary: string;
    primaryDark: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    success: string;
  };
  logo: {
    light: string;  // URL or asset path
    dark: string;
  };
}
```

#### 5a.2 Dynamic Design Tokens
- Update `apps/mobile/constants/designTokens.ts` to load from tenant config
- Create `<ThemeProvider>` that wraps the app
- Update Tailwind CSS variables at runtime

#### 5a.3 Asset Configuration
- Splash screen background color from tenant config
- App icon generation script (accepts tenant logo as input)

### MVP Definition
- [ ] Primary and secondary colors load from tenant config
- [ ] Logo displays from tenant config URL
- [ ] Splash screen uses tenant primary color
- [ ] App name displays from tenant config
- [ ] Design tokens update reactively

### Acceptance Criteria
1. Two different tenants have visibly different color schemes
2. Logo in header matches tenant configuration
3. Splash screen matches tenant branding

---

## Phase 3b: Medusa V2 Adapter

### Goal
Support newer Medusa V2 API for future-proofing and clients using latest Medusa.

### Duration
1 week

### Dependencies
- Phase 1 (Backend Abstraction Layer)

### Technical Notes
- Medusa V2 uses different API structure than V1
- Some endpoints renamed, response shapes changed
- Admin API vs Storefront API separation

### MVP Definition
- [ ] `MedusaV2Adapter` implements `IEcommerceAdapter`
- [ ] Core flows (products, cart, checkout) working
- [ ] Authentication compatible with Medusa V2

---

## Phase 4b: Advanced B2B Features

### Goal
Add quote requests, order approval workflows, and credit terms.

### Duration
2 weeks

### Dependencies
- Phase 4a (B2B Core Features)

### Deliverables

#### 4b.1 Quote Requests
- Request quote button on products
- Quote creation form
- Quote status tracking
- Quote-to-order conversion

#### 4b.2 Order Approval Workflow
- Configurable approval thresholds
- Approval queue for company admins
- Email notifications for pending approvals
- Approval/rejection with comments

#### 4b.3 Credit Terms
- Credit limit display
- Available credit calculation
- Invoice payment option at checkout
- Payment terms display

### MVP Definition
- [ ] Quote request flow works end-to-end
- [ ] Orders above threshold require approval
- [ ] Company admin can approve/reject orders
- [ ] Credit limit prevents over-ordering

---

## Phase 6: Build & Deployment Pipeline

### Goal
Automate multi-tenant app building and deployment.

### Duration
2 weeks

### Dependencies
- Phase 2 (Tenant Configuration)

### Deliverables

#### 6.1 EAS Build Profiles
```json
// eas.json
{
  "build": {
    "development": { /* ... */ },
    "preview": { /* ... */ },
    "production:bijoux-sage": {
      "extends": "production",
      "env": { "TENANT_ID": "bijoux-sage" }
    },
    "production:client-b2b": {
      "extends": "production",
      "env": { "TENANT_ID": "client-b2b" }
    }
  }
}
```

#### 6.2 Build Scripts
```bash
# Build command
pnpm build:tenant <tenant-id> <platform>

# Example
pnpm build:tenant bijoux-sage ios
pnpm build:tenant client-b2b android
```

#### 6.3 App Configuration Generator
- Script to generate `app.json` from tenant config
- Bundle ID, app name, scheme from tenant config
- Icon and splash screen generation

### MVP Definition
- [ ] EAS profiles exist for each tenant
- [ ] Build command successfully creates tenant-specific builds
- [ ] Each tenant has unique bundle ID
- [ ] Manual deployment to TestFlight works

---

## Appendix A: Dependency Graph

```
Phase 1 ─────────────────┬─────────────────────────────────┐
(Foundation)             │                                 │
                         ▼                                 ▼
                    Phase 2                           Phase 3a
                    (Tenant Config)                   (Medusa V1)
                         │                                 │
          ┌──────────────┼──────────────┐                  │
          │              │              │                  │
          ▼              ▼              ▼                  │
     Phase 4a       Phase 5a       Phase 6                 │
     (B2B Core)     (Theming)      (Build)                 │
          │              │                                 │
          ▼              ▼                                 │
     Phase 4b       Phase 5b                               │
     (B2B Adv)      (Full Theme)                           │
                                                           │
                    Phase 3b ◄─────────────────────────────┤
                    (Medusa V2)                            │
                                                           │
                    Phase 3c ◄─────────────────────────────┘
                    (Shopify)
```

---

## Appendix B: Risk Register

| ID | Risk | Probability | Impact | Mitigation | Owner |
|----|------|-------------|--------|------------|-------|
| R1 | Breaking existing Sage client | Medium | High | Feature branches, E2E tests before merge | Tech Lead |
| R2 | B2B scope creep | High | High | Strict MVP definitions, feature flags for extras | PM |
| R3 | Medusa API incompatibilities | Medium | Medium | Early prototype, document adapter limitations | Dev |
| R4 | Multi-tenant build complexity | Medium | Medium | Invest in build automation early | DevOps |
| R5 | Performance regression | Low | Medium | Caching layer, benchmark suite | Dev |
| R6 | Auth system variations | Medium | Medium | Auth adapter interface in Phase 1 | Dev |
| R7 | Stripe account per-tenant | Low | Low | Abstract payment provider | Dev |
| R8 | Type system bloat | Medium | Low | Strict type boundaries, adapter-local types | Tech Lead |

---

## Appendix C: Technology Decisions

### Confirmed Stack
- **Monorepo:** Turborepo + pnpm (existing)
- **Mobile:** React Native + Expo (existing)
- **Web:** Next.js 14 (existing)
- **State Management:** React Context (existing) + Zustand for complex state
- **Styling:** NativeWind/Tailwind (existing)
- **Build:** EAS Build (existing)
- **Types:** TypeScript strict mode

### Decisions to Make
1. **Caching:** In-memory vs AsyncStorage vs React Query?
2. **B2B State:** Context vs Zustand vs Redux Toolkit?
3. **Form Handling:** React Hook Form vs Formik?
4. **Testing:** Jest + React Testing Library (mobile) + Playwright (web)?

---

## Appendix D: Success Metrics

### Phase 1 Success
- Build time increase < 10%
- No regressions in existing functionality
- > 80% test coverage on api-client

### Phase 2 Success
- Config load time < 100ms
- Zero code changes required for new tenant setup

### Phase 3a Success
- Medusa adapter passes same test suite as Sage adapter
- Full purchase flow < 3 minutes end-to-end

### Phase 4a Success
- B2B pricing calculations match expected values
- Company account creation < 2 minutes

### Overall Platform Success
- Time to deploy new tenant < 1 day (manual)
- Time to deploy new tenant < 1 hour (automated - after Phase 6)
- Maintain single codebase for all tenants
- No client-specific forks required

---

## Next Steps

1. **Immediate:** Begin Phase 1 by creating `@bijoux/api-client` package skeleton
2. **Week 1:** Define and review `IEcommerceAdapter` interface with team
3. **Week 2:** Complete SageAdapter migration
4. **Week 3:** Begin Phase 2 (Tenant Config) in parallel with Phase 1 testing

---

*Document Version: 1.0*
*Created: December 15, 2024*
*Last Updated: December 15, 2024*
