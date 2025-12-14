# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repo overview
- This is a **pnpm + Turborepo** monorepo.
- Workspace layout:
  - `apps/web`: **Next.js 14 (App Router)** web storefront.
  - `apps/mobile`: **Expo + expo-router** React Native app.
  - `packages/types`: shared TypeScript types (including raw Sage API shapes + frontend domain models).
  - `packages/utils`: shared helpers (className merge, formatting, debounce, etc.).
  - `packages/config-tailwind`: shared design system + Tailwind presets (base/web/native).
- Tooling expectations:
  - Node is pinned to **>= 20** (see root `package.json`).
  - pnpm is pinned to **pnpm@9**.
  - `.npmrc` uses `node-linker=hoisted` / `shamefully-hoist=true` (important for Expo/Metro in a monorepo).
- Notes:
  - A `package-lock.json` exists in the repo, but the workspace is configured for **pnpm** (`pnpm-lock.yaml` + `packageManager` field).
  - `packages/ui`, `packages/hooks`, `packages/api-client` currently exist as directories but appear to be empty placeholders.

## Common commands
All commands are meant to be run from the repo root.

### Install
```sh
pnpm install
```

### Develop
Run everything (web + mobile) via Turbo:
```sh
pnpm dev
```
Run only a single app:
```sh
pnpm dev:web
pnpm dev:mobile
```
Equivalent (sometimes useful when you want to run package scripts directly):
```sh
pnpm --filter @bijoux/web dev
pnpm --filter @bijoux/mobile dev
```

Mobile platform builds:
```sh
pnpm --filter @bijoux/mobile ios
pnpm --filter @bijoux/mobile android
```

### Build
Build all workspaces:
```sh
pnpm build
```
Build a single app:
```sh
pnpm --filter @bijoux/web build
pnpm --filter @bijoux/mobile build
```

### Lint / typecheck / format
Across the repo (Turbo):
```sh
pnpm lint
pnpm type-check
```
Format (Prettier):
```sh
pnpm format
```
Per-app (when you want faster feedback):
```sh
pnpm --filter @bijoux/web lint
pnpm --filter @bijoux/web type-check

pnpm --filter @bijoux/mobile lint
pnpm --filter @bijoux/mobile type-check
```

### Clean
```sh
pnpm clean
```
Note: `pnpm clean` removes `node_modules` at the repo root.

### Tests
There is **no test runner wired up** in `package.json` scripts right now (no `test` script / no Jest/Vitest/Playwright config checked in). Some design docs mention Playwright as a future E2E option.

## Environment variables
- Root `.env.local.example` documents:
  - `NEXT_PUBLIC_SAGE_API_URL` (used by `apps/web/lib/api.ts` and some client components)
- `turbo.json` declares additional envs that are expected to influence builds:
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (used by `apps/web/lib/stripe.ts`)
  - `EXPO_PUBLIC_SAGE_API_URL`, `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` (declared as global env, but verify actual consumption in `apps/mobile`)

## High-level architecture

### Shared domain model (cross-app)
- **Canonical types** live in `packages/types/src/index.ts`.
  - Includes *raw Sage API types* (`SageArticle`, `SageFamille`, etc.) and *frontend models* (`Product`, `Category`, `Cart`, `Order`, checkout-related types).
- **Shared utilities** live in `packages/utils/src/index.ts`.
  - Web re-exports them via `apps/web/lib/utils.ts`.
- **Shared design system** lives in `packages/config-tailwind/`.
  - `src/base.ts` defines Hermes-inspired tokens (colors/typography/etc.) and exports `designTokens`.
  - `src/web.ts` extends the base preset with web-only animation/shadow/background utilities.

### Web app (`apps/web`) — Next.js App Router
Big-picture structure:
- Routing is under `apps/web/app/` with route groups:
  - `(shop)/...`: storefront pages (`/`, `/categories`, `/collections`, `/products/[id]`, `/panier`, `/checkout`, `/compte`, etc.).
  - `(auth)/...`: auth pages (`/login`, `/register`).
  - `app/api/...`: Next.js route handlers (e.g. NextAuth handler and order API).
- Data sources:
  - **Sage API** for catalog data.
    - `apps/web/lib/api.ts` fetches `/sage/articles` + `/sage/families`, maps them to `Product`/`Category`, and provides helpers like `getProductsByCategorySlug`.
    - Web uses Next.js fetch caching with `revalidate: 300` in several calls.
  - **In-memory mock data** for auth and orders (useful for demos/dev without a backend):
    - Users: `apps/web/data/users.ts`
    - Orders: `apps/web/data/orders.ts` (used by `app/api/orders/*` routes)
- Auth:
  - NextAuth v5 is configured in `apps/web/lib/auth.ts` using a **Credentials** provider backed by **mock users** in `apps/web/data/users.ts`.
  - Route handler is wired in `apps/web/app/api/auth/[...nextauth]/route.ts`.
  - Middleware: `apps/web/middleware.ts` currently matches `/account/*` + `/checkout/*`. Note that account pages in this repo appear under `/compte/*` (French routes), so auth protection may need alignment.
- Cart:
  - `apps/web/contexts/CartContext.tsx` stores the cart in React state and persists to `localStorage` (`CART_STORAGE_KEY = bijoux-cart`).
  - `apps/web/context/Providers.tsx` wraps the app in `SessionProvider`, `CartProvider`, and mounts a global `CartDrawer`.

### Mobile app (`apps/mobile`) — Expo + expo-router
Big-picture structure:
- Routing is under `apps/mobile/app/` (expo-router):
  - `(tabs)/...`: main tab screens (home, search, collections, cart, account).
  - `(auth)/...`: login/register.
  - `checkout/...`: checkout flow shown as a modal stack.
  - `product/[id].tsx`, `collection/[slug].tsx` etc.
- Providers & app shell:
  - `apps/mobile/app/_layout.tsx` loads fonts, controls the splash screen, and mounts providers:
    - `AuthProvider`, `CategoryProvider`, `CartProvider`, `CheckoutProvider`.
- Styling:
  - Mobile uses **NativeWind** (`babel.config.js`, `metro.config.js`, `global.css`).
  - There are both `tailwind.config.js` and `tailwind.config.ts` in `apps/mobile/`; confirm which one your tooling is actually picking up before changing tokens.
- Auth:
  - `apps/mobile/context/AuthContext.tsx` uses **mock users** and persists auth state in `expo-secure-store` via `apps/mobile/lib/secureStore.ts`.
- Cart:
  - `apps/mobile/context/CartContext.tsx` persists the cart to AsyncStorage (`@bijoux/cart`).
- Checkout:
  - `apps/mobile/context/CheckoutContext.tsx` centralizes checkout state (steps, addresses, payment method), persists to AsyncStorage (`@bijoux/checkout_v2`), and computes totals from the cart.
  - `apps/mobile/app/checkout/_layout.tsx` implements a custom “luxury” header + modal navigation behavior.
- Search:
  - `apps/mobile/lib/api.ts` contains higher-level search functionality: scoring, filtering, pagination, suggestions, and recent searches (stored in AsyncStorage).
  - UI building blocks live in `apps/mobile/components/search/*` (includes barcode scanning overlays).

## Product/design specs (non-code but important context)
If implementing or refactoring major UX flows, these docs encode intended behavior and terminology:
- `docs/architecture-ecommerce.md`: architecture blueprint for cart/checkout/orders/account (web-oriented).
- `docs/ux-checkout-spec.md`: UX specification for the checkout experience.
- `docs/UI-SEARCH-SPECIFICATION.md`: UX/UI specification for the “luxe” search overlay.
- `apps/web/components/ui/DESIGN_SYSTEM.md`: web UI component/design system notes.
- `apps/mobile/*CHECKOUT*` and `apps/mobile/docs/*`: mobile checkout + search/add-to-cart design specs.
