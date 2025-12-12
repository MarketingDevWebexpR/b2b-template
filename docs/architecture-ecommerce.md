# E-commerce Architecture Documentation

## Overview

This document outlines the architecture for e-commerce features (cart, checkout, orders, account) in the bijoux-next luxury jewelry site built with Next.js 14 App Router.

## Table of Contents

1. [Architecture Principles](#architecture-principles)
2. [Data Flow Diagrams](#data-flow-diagrams)
3. [Component Hierarchy](#component-hierarchy)
4. [State Management Strategy](#state-management-strategy)
5. [API Endpoint Design](#api-endpoint-design)
6. [Authentication Integration](#authentication-integration)
7. [Stock Management](#stock-management)
8. [Implementation Guidelines](#implementation-guidelines)

---

## Architecture Principles

### 1. Server Components First
- Use React Server Components (RSC) by default for static content
- Client components only where interactivity is required
- Follows existing pattern in `/app/(shop)/products/[id]/page.tsx`

### 2. Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced UX with client-side interactivity
- Graceful degradation for slow connections

### 3. Type Safety
- All data structures defined in `/types/index.ts`
- Zod validation for API inputs (following auth pattern)
- Strict TypeScript configuration

### 4. Separation of Concerns
- Data fetching in server components or `/lib/` functions
- UI components in `/components/`
- Business logic in context providers and `/lib/`
- API routes for mutations

---

## Data Flow Diagrams

### Cart Flow (Add to Cart)

```
+------------------+     +-----------------+     +------------------+
|   ProductInfo    |     |   CartContext   |     |   localStorage   |
|   (Client)       |     |   (Client)      |     |                  |
+--------+---------+     +--------+--------+     +--------+---------+
         |                        |                       |
         | 1. onAddToCart()       |                       |
         +----------------------->|                       |
                                  |                       |
                                  | 2. Update state       |
                                  +---------------------->|
                                  |                       |
                                  | 3. Sync to storage    |
                                  +---------------------->|
                                  |                       |
         | 4. UI feedback         |                       |
         |<-----------------------+                       |
         |                        |                       |
```

### Checkout Flow (Complete Order)

```
+-------------+     +---------------+     +-------------+     +---------------+
|   Cart      |     |   Checkout    |     |   API       |     |   Database    |
|   Page      |     |   Context     |     |   Route     |     |   (Mock)      |
+------+------+     +-------+-------+     +------+------+     +-------+-------+
       |                    |                    |                     |
       | 1. Proceed         |                    |                     |
       +------------------->|                    |                     |
                            |                    |                     |
       | 2. Shipping Form   |                    |                     |
       |<-------------------+                    |                     |
       |                    |                    |                     |
       | 3. Submit Address  |                    |                     |
       +------------------->|                    |                     |
                            |                    |                     |
       | 4. Payment Form    |                    |                     |
       |<-------------------+                    |                     |
       |                    |                    |                     |
       | 5. Submit Payment  |                    |                     |
       +------------------->|                    |                     |
                            |                    |                     |
                            | 6. POST /orders   |                     |
                            +------------------->|                     |
                            |                    |                     |
                            |                    | 7. Validate stock  |
                            |                    +------------------->|
                            |                    |                     |
                            |                    | 8. Create order    |
                            |                    +------------------->|
                            |                    |                     |
                            |                    | 9. Order created   |
                            |                    |<--------------------+
                            |                    |                     |
                            | 10. Response       |                     |
                            |<-------------------+                     |
                            |                    |                     |
       | 11. Confirmation   |                    |                     |
       |<-------------------+                    |                     |
       |                    |                    |                     |
```

### User Session & Stock Flow

```
+------------------+     +-----------------+     +------------------+
|   NextAuth       |     |   Product API   |     |   Stock API      |
|   Session        |     |   /lib/api.ts   |     |   (Enhanced)     |
+--------+---------+     +--------+--------+     +--------+---------+
         |                        |                       |
         | 1. Check session       |                       |
         +----------------------->|                       |
         |                        |                       |
         | 2. Session data        |                       |
         |<-----------------------+                       |
         |                        |                       |
         |                        | 3. Get stock info    |
         |                        +---------------------->|
         |                        |                       |
         |                        | 4. Return stock      |
         |                        |    (exact for auth)  |
         |                        |<----------------------+
         |                        |                       |
         | 5. Display stock       |                       |
         |    based on auth       |                       |
         |<-----------------------+                       |
```

---

## Component Hierarchy

### Cart Components

```
/components/cart/
  CartProvider.tsx          # Context provider (client)
  CartIcon.tsx              # Header cart icon with count (client)
  CartDrawer.tsx            # Slide-out cart panel (client)
  CartItem.tsx              # Individual cart item row (client)
  CartSummary.tsx           # Subtotal, shipping, total (client)
  EmptyCart.tsx             # Empty state component (server)
```

### Checkout Components

```
/components/checkout/
  CheckoutProvider.tsx      # Checkout state context (client)
  CheckoutStepper.tsx       # Step indicator (client)
  ShippingForm.tsx          # Address form (client)
  BillingForm.tsx           # Billing address form (client)
  PaymentForm.tsx           # Payment method selection (client)
  OrderReview.tsx           # Final review before purchase (client)
  OrderConfirmation.tsx     # Success page content (server)
```

### Account Components

```
/components/account/
  AccountLayout.tsx         # Account page layout (server)
  AccountNav.tsx            # Side navigation (client)
  OrderList.tsx             # User's order history (server)
  OrderDetail.tsx           # Single order view (server)
  AddressBook.tsx           # Manage addresses (client)
  ProfileForm.tsx           # Edit profile info (client)
```

### App Routes Structure

```
/app/
  (shop)/
    cart/
      page.tsx              # Cart page (server with client cart)
    checkout/
      page.tsx              # Main checkout page (client)
      confirmation/
        [orderId]/
          page.tsx          # Order confirmation (server)
    account/
      page.tsx              # Account dashboard (server)
      orders/
        page.tsx            # Order history (server)
        [orderId]/
          page.tsx          # Order detail (server)
      addresses/
        page.tsx            # Address management (client)
      profile/
        page.tsx            # Profile settings (client)
  api/
    cart/
      route.ts              # Cart sync endpoint (optional)
    orders/
      route.ts              # POST: Create order
      [orderId]/
        route.ts            # GET: Order details
    stock/
      [productId]/
        route.ts            # GET: Stock info
```

---

## State Management Strategy

### Cart State (CartContext)

```typescript
// /contexts/CartContext.tsx

interface CartContextType {
  // State
  items: CartItemWithDetails[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;

  // Actions
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // UI State
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}
```

**Persistence Strategy:**
1. State stored in React Context
2. Synced to localStorage on every change
3. Hydrated from localStorage on mount
4. Optional: Sync to server for logged-in users

### Checkout State (CheckoutContext)

```typescript
// /contexts/CheckoutContext.tsx

interface CheckoutContextType {
  // Flow State
  currentStep: CheckoutStep;
  completedSteps: CheckoutStep[];

  // Data State
  shippingAddress: ShippingAddress | null;
  billingAddress: BillingAddress | null;
  sameAsShipping: boolean;
  paymentMethod: PaymentMethod | null;

  // Actions
  setShippingAddress: (address: ShippingAddress) => void;
  setBillingAddress: (address: BillingAddress | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: CheckoutStep) => void;

  // Submission
  submitOrder: () => Promise<CreateOrderResponse>;
  isProcessing: boolean;
  error: string | null;
}
```

### Provider Composition

```typescript
// /context/Providers.tsx (updated)

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AnnouncementProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AnnouncementProvider>
    </SessionProvider>
  );
}
```

---

## API Endpoint Design

### POST /api/orders

Create a new order from cart.

```typescript
// Request
interface CreateOrderRequest {
  items: CartItemWithDetails[];
  shippingAddress: ShippingAddress;
  billingAddress?: BillingAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
}

// Response (success)
interface CreateOrderResponse {
  success: true;
  order: Order;
  paymentIntent?: string;
}

// Response (error)
interface CreateOrderErrorResponse {
  success: false;
  error: string;
  code: 'VALIDATION_ERROR' | 'STOCK_ERROR' | 'PAYMENT_ERROR';
  details?: Record<string, string>;
}
```

**Validation Flow:**
1. Validate request body with Zod
2. Verify user session
3. Check stock availability for all items
4. Process mock payment
5. Create order record
6. Clear user's cart (if server-synced)
7. Return order confirmation

### GET /api/orders/[orderId]

Get order details (authenticated).

```typescript
// Response
interface GetOrderResponse {
  success: boolean;
  order?: Order;
  error?: string;
}
```

### GET /api/orders

List user's orders (authenticated).

```typescript
// Query params
interface ListOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

// Response
interface ListOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
}
```

### GET /api/stock/[productId]

Get stock information.

```typescript
// Response (unauthenticated)
interface StockResponse {
  status: StockStatus;
  available: boolean;
}

// Response (authenticated)
interface AuthenticatedStockResponse {
  status: StockStatus;
  available: boolean;
  quantity: number;
  reserved: number;
}
```

---

## Authentication Integration

### Protected Routes

The existing middleware (`middleware.ts`) handles route protection:

```typescript
const isProtectedRoute =
  pathname.startsWith('/account') || pathname.startsWith('/checkout');
```

### Session Access

**Server Components:**
```typescript
import { auth } from '@/lib/auth';

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  // ...
}
```

**Client Components:**
```typescript
import { useSession } from 'next-auth/react';

export function ProfileForm() {
  const { data: session, status } = useSession();
  // ...
}
```

### API Routes:
```typescript
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ...
}
```

---

## Stock Management

### Stock Display Logic

```typescript
function getStockDisplay(stock: number, isAuthenticated: boolean): string {
  if (stock === 0) return 'Rupture de stock';

  if (isAuthenticated) {
    // Show exact stock to logged-in users
    if (stock <= 3) return `Plus que ${stock} en stock`;
    if (stock <= 10) return `${stock} en stock`;
    return 'En stock';
  }

  // Show generic status to guests
  if (stock <= 5) return 'Stock limite';
  return 'En stock';
}
```

### Stock Reservation (Future)

For production, implement stock reservation:
1. Reserve stock when added to cart (with TTL)
2. Release reservation on cart abandonment
3. Confirm reservation on order creation

---

## Implementation Guidelines

### 1. Follow Existing Patterns

**Error Handling (from search/route.ts):**
```typescript
try {
  // Operation
} catch (error) {
  console.error('API error:', error);
  return NextResponse.json(
    { error: 'Operation failed', success: false },
    { status: 500 }
  );
}
```

**Data Fetching with Fallback (from products/[id]/page.tsx):**
```typescript
async function fetchData(id: string): Promise<Data | null> {
  try {
    const data = await apiCall(id);
    if (data) return data;

    console.log('API returned no results, trying fallback...');
    return fallbackData(id);
  } catch (error) {
    console.error('API error:', error);
    return fallbackData(id);
  }
}
```

### 2. Context Provider Pattern

Follow the `AnnouncementContext` pattern:
```typescript
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ContextType {
  // state and actions
}

const Context = createContext<ContextType | undefined>(undefined);

export function Provider({ children }: { children: ReactNode }) {
  // implementation
  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}

export function useContextHook() {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('Hook must be used within Provider');
  }
  return context;
}
```

### 3. Form Validation with Zod

Follow the auth pattern:
```typescript
import { z } from 'zod';

const shippingAddressSchema = z.object({
  firstName: z.string().min(1, 'Prenom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  address: z.string().min(1, 'Adresse requise'),
  city: z.string().min(1, 'Ville requise'),
  postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
  country: z.string().default('France'),
  phone: z.string().min(10, 'Telephone invalide'),
});
```

### 4. Utility Functions

Use existing utilities from `/lib/utils.ts`:
- `cn()` for class merging
- `formatPrice()` for price display
- `generateId()` for client-side IDs

---

## Mock Data Strategy

For development, create mock order data:

```typescript
// /data/orders.ts
export const mockOrders: Order[] = [
  {
    id: 'order-001',
    orderNumber: 'MJ-2024-0001',
    userId: '1',
    items: [...],
    totals: {
      subtotal: 12500,
      shipping: 0,
      tax: 2500,
      discount: 0,
      total: 15000,
    },
    status: 'delivered',
    // ...
  }
];

export function getOrdersByUserId(userId: string): Order[] {
  return mockOrders.filter(o => o.userId === userId);
}

export function getOrderById(orderId: string): Order | undefined {
  return mockOrders.find(o => o.id === orderId);
}
```

---

## Implementation Order

### Phase 1: Cart
1. Create CartContext with localStorage persistence
2. Create CartProvider in Providers.tsx
3. Create cart UI components (drawer, icon, items)
4. Connect ProductInfo to CartContext
5. Create /cart page

### Phase 2: Checkout
1. Create CheckoutContext
2. Create checkout form components
3. Create /checkout page with step navigation
4. Create /api/orders route
5. Create confirmation page

### Phase 3: Account
1. Create account layout and navigation
2. Create /account dashboard
3. Create /account/orders with order list
4. Create /account/orders/[orderId] detail page
5. Create address management

### Phase 4: Stock Integration
1. Create /api/stock endpoint
2. Update ProductInfo to use session-aware stock display
3. Add stock validation to checkout flow

---

## Security Considerations

1. **Input Validation**: All API inputs validated with Zod
2. **Authentication**: Middleware protects /account and /checkout routes
3. **Authorization**: API routes verify user owns requested resources
4. **CSRF**: NextAuth handles CSRF protection
5. **Rate Limiting**: Consider adding rate limiting to order creation
6. **Data Sanitization**: Sanitize user inputs before storage

---

## Performance Considerations

1. **Cart Hydration**: Handle SSR/client mismatch with useEffect
2. **Optimistic Updates**: Update cart UI before API confirms
3. **Lazy Loading**: Load checkout forms on demand
4. **Image Optimization**: Use next/image for product images in cart
5. **Caching**: Cache product data for cart display

---

## Testing Strategy

1. **Unit Tests**: Test cart operations, price calculations
2. **Integration Tests**: Test checkout flow end-to-end
3. **E2E Tests**: Test complete purchase journey (Playwright)
4. **Visual Tests**: Snapshot tests for cart and checkout UI
