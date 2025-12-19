# Migration App Search v3 - Resume File

**Date**: 2024-12-19
**Commit**: `d142a05` on branch `develop`
**Status**: ~90% Complete

---

## Summary

Migration du frontend Next.js de App Search v2 vers le nouveau engine v3 (`dev-medusa-v3`).

### Engine Configuration
```
APPSEARCH_ENDPOINT=https://elasticsearch-webexpr.ent.europe-west1.gcp.cloud.es.io
APPSEARCH_ENGINE=dev-medusa-v3
APPSEARCH_PUBLIC_KEY=search-smojpz6bs5oufe3g9krdupke
```

### Index Stats
- **1244 documents total**
  - 38 marques
  - 206 categories
  - 1000 products

---

## Critical Schema Differences v2 → v3

| Aspect | v2 | v3 |
|--------|-----|-----|
| doc_type | singular (`product`, `category`, `marque`) | **PLURAL** (`products`, `categories`, `marques`) |
| Product name field | `name` | **`title`** |
| Categories hierarchy fields | `category_lvl0-4` on categories | `category_lvl0-4` **ONLY on products** |
| Boolean fields | `true`/`false` | **string** `"true"`/`"false"` |
| Multi-filter format | `{ field1, field2 }` | **`{ all: [{field1}, {field2}] }`** |

### Products Schema (v3)
```typescript
{
  id, title, handle, description, thumbnail, images,
  price_min, price_max,
  brand_name, brand_slug, brand_id,
  category_lvl0, category_lvl1, category_lvl2, category_lvl3, category_lvl4,
  all_category_handles, category_names, category_ids, category_paths,
  has_stock, is_available,  // strings "true"/"false"
  sku, barcode, tags, material, metadata,
  created_at, updated_at, doc_type
}
```

### Categories Schema (v3)
```typescript
{
  id, name, handle, description, icon, image_url,
  parent_category_id, parent_category_ids,
  path, ancestor_names, ancestor_handles,
  depth, rank, product_count, is_active,
  metadata, created_at, doc_type
}
// NOTE: NO category_lvl0-4 fields!
```

### Marques Schema (v3)
```typescript
{
  id, name, slug, description, country,
  logo_url, website_url, is_active, rank, doc_type
}
// NOTE: NO metadata field!
```

---

## Completed Work

### Phase 1: Configuration ✅
- `.env.local` updated with v3 engine

### Phase 2: API Routes Categories ✅
- `apps/web/app/api/categories/route.ts` - Fixed doc_type, removed invalid fields
- `apps/web/app/api/catalog/categories/tree/route.ts` - Updated for v3

### Phase 3: Search & Suggestions ✅
- `apps/web/lib/search/app-search-v3.ts` - New unified client
- `apps/web/app/api/search/route.ts` - Multi-type search
- `apps/web/app/api/search/suggestions/route.ts` - Suggestions
- `apps/web/app/api/search/categories/route.ts`
- `apps/web/app/api/search/marques/route.ts`

### Phase 4: MegaMenu ✅
- Already compatible with v3 schema

### Phase 5: Listing Pages ✅
- `apps/web/app/(shop)/categories/[slug]/page.tsx`
- `apps/web/app/(shop)/marques/[slug]/page.tsx`
- Brand products section updated

### Phase 6: Facets ✅
- `apps/web/components/search/SearchResults/SearchFacets.tsx`
- `apps/web/components/products/ProductFilters/FilterCategory.tsx`
- Hierarchical facets working

---

## Key Files Modified

### Core Search Library
```
apps/web/lib/search/app-search-v3.ts       # NEW - Unified v3 client
apps/web/lib/search/facet-transformers.ts  # NEW - Facet utils
apps/web/lib/search/README.md              # NEW - Documentation
```

### Brand Functions (Critical Fix)
```
apps/web/lib/brands/server.ts
```
- Rewritten to use App Search v3 instead of Medusa backend
- Filter format fixed: `{ all: [{doc_type}, {slug}] }`
- Removed `metadata` field (doesn't exist in v3)

### Products API (Critical Fix)
```
apps/web/app/api/catalog/products/route.ts
```
- Added type guards for `toLowerCase()` errors
- Check `typeof value === 'string'` before string operations

### Product Transform (Critical Fix)
```
apps/web/lib/search/app-search-v3.ts:transformProductHit()
```
- Changed `hit.name?.raw` to `hit.title?.raw`

---

## Known Issues to Verify

### 1. Product Title Display
Products may show empty titles if:
- Hot reload didn't pick up changes → Restart dev server
- `title` field not indexed → Check App Search engine

**Test:**
```bash
curl -X POST 'https://elasticsearch-webexpr.ent.europe-west1.gcp.cloud.es.io/api/as/v1/engines/dev-medusa-v3/search' \
  -H 'Authorization: Bearer search-smojpz6bs5oufe3g9krdupke' \
  -H 'Content-Type: application/json' \
  -d '{"query":"","filters":{"doc_type":"products"},"result_fields":{"title":{"raw":{}}},"page":{"size":3}}'
```

### 2. Brand Page Products
The `/marques/[slug]` page fetches products from:
```
/api/catalog/products?brand=<slug>&limit=20
```
Verify `brand_slug` filter works correctly.

### 3. Category Facets on Product Listings
Hierarchical facets use `category_lvl0-4` from product documents.
Categories themselves don't have these fields.

---

## Resume Checklist

1. [ ] Restart Next.js dev server: `pnpm run dev`
2. [ ] Test MegaMenu loads categories
3. [ ] Test search returns products with titles
4. [ ] Test brand page `/marques/cartier` shows products
5. [ ] Test category page `/categories/outillage` shows products
6. [ ] Test facets filter correctly

---

## Commands

```bash
# Start dev server
pnpm --filter @bijoux/web run dev

# Check App Search stats
curl -X POST 'https://elasticsearch-webexpr.ent.europe-west1.gcp.cloud.es.io/api/as/v1/engines/dev-medusa-v3/search' \
  -H 'Authorization: Bearer search-smojpz6bs5oufe3g9krdupke' \
  -H 'Content-Type: application/json' \
  -d '{"query":"","facets":{"doc_type":[{"type":"value"}]},"page":{"size":0}}'

# Test specific product fields
curl -X POST '.../search' -d '{"query":"","filters":{"doc_type":"products"},"result_fields":{"id":{"raw":{}},"title":{"raw":{}},"brand_name":{"raw":{}}},"page":{"size":5}}'
```

---

## Git Status

```bash
# Current commit
git log -1 --oneline
# d142a05 feat(search): migrate frontend to App Search v3 engine

# Push when ready
git push origin develop
```
