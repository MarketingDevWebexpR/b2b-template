# Search Module - App Search v3 Migration

This directory contains the search functionality for the B2B e-commerce frontend, migrated to use Elastic App Search v3 directly.

## Architecture Overview

```
lib/search/
├── app-search-v3.ts           # Shared configuration, types, and transform functions
├── medusa-search-client.ts    # HTTP client for API routes
├── medusa-search-adapter.ts   # Adapter for SearchContext integration
└── README.md                  # This file

app/api/search/
├── route.ts                   # Main search endpoint (products, categories, marques)
├── suggestions/route.ts       # Autocomplete suggestions
├── categories/route.ts        # Category-only search
└── marques/route.ts           # Brand-only search
```

## App Search v3 Configuration

The engine `dev-medusa-v3` indexes 3 document types in a single engine:

| doc_type   | Description | Key Fields |
|------------|-------------|------------|
| `product`  | Products    | `category_lvl0-4`, `brand_name`, `has_stock`, `is_available` |
| `category` | Categories  | `category_lvl0-4`, `path`, `depth`, `product_count` |
| `marque`   | Brands      | `name`, `slug`, `logo_url`, `country` |

### Environment Variables

```env
APP_SEARCH_ENDPOINT=https://elasticsearch-webexpr.ent.europe-west1.gcp.cloud.es.io
APP_SEARCH_ENGINE=dev-medusa-v3
APP_SEARCH_PUBLIC_KEY=search-smojpz6bs5oufe3g9krdupke
```

## API Routes

### GET /api/search

Main search endpoint supporting multi-type search.

**Parameters:**
- `q` - Search query
- `type` - `all` | `products` | `categories` | `marques`
- `limit` - Results per page (default: 20)
- `offset` - Pagination offset
- `facets` - Include facets (default: true)
- `category` - Filter by category handle
- `brand` - Filter by brand slug
- `material` - Filter by material
- `tags` - Filter by tags (comma-separated)
- `in_stock` - Filter by stock availability
- `price_min` / `price_max` - Price range filter
- `sort` - Sort field
- `order` - `asc` | `desc`

**Response for `type=all`:**
```json
{
  "query": "bague",
  "type": "all",
  "products": { "hits": [...], "total": 42 },
  "categories": { "hits": [...], "total": 3 },
  "marques": { "hits": [...], "total": 2 },
  "meta": { "totalResults": 47, "currentPage": 1, "totalPages": 3 },
  "facetDistribution": { ... }
}
```

### GET /api/search/suggestions

Autocomplete suggestions for search input.

**Parameters:**
- `q` - Search query (min 2 chars)
- `limit` - Max suggestions (default: 8)
- `categories` - Include categories (default: true)
- `brands` - Include brands (default: true)

**Response:**
```json
{
  "query": "bag",
  "suggestions": [{ "id": "...", "title": "...", "brand_name": "..." }],
  "categories": [{ "id": "...", "name": "...", "pathString": "..." }],
  "marques": [{ "id": "...", "name": "...", "slug": "..." }]
}
```

### GET /api/search/categories

Category-specific search.

**Parameters:**
- `q` - Search query
- `limit` - Max results (default: 5)

### GET /api/search/marques

Brand-specific search.

**Parameters:**
- `q` - Search query
- `limit` - Max results (default: 5)

## Hierarchical Categories (v3)

The v3 schema uses InstantSearch-style hierarchical categories:

```
category_lvl0: "Bijoux"
category_lvl1: "Bijoux > Bagues"
category_lvl2: "Bijoux > Bagues > Fiancailles"
category_lvl3: "Bijoux > Bagues > Fiancailles > Solitaires"
category_lvl4: null
```

This enables:
- Hierarchical facet navigation
- Breadcrumb generation
- Parent/child filtering

## Key Types

```typescript
// Transformed product for frontend
interface TransformedProduct {
  id: string;
  title: string;
  handle: string;
  brand_name: string | null;
  brand_slug: string | null;
  category_lvl0: string | null;
  category_lvl1: string | null;
  category_paths: string[];
  has_stock: boolean;      // Converted from "true"/"false" string
  is_available: boolean;   // Converted from "true"/"false" string
  // ... more fields
}
```

## Usage in Components

```typescript
import { getMedusaSearchAdapter } from '@/lib/search/medusa-search-adapter';

// In a component or hook
const adapter = getMedusaSearchAdapter();

// Full search with facets
const results = await adapter.search('bague', {
  limit: 20,
  filters: { brands: ['cartier'] },
});

// Get suggestions (products, categories, brands)
const suggestions = await adapter.getAllSuggestions('bag', {
  products: 6,
  categories: 3,
  brands: 3,
});
```

## Migration Notes

1. **Boolean fields**: `has_stock` and `is_available` are stored as strings `"true"/"false"` in App Search but are converted to proper booleans by transform functions.

2. **doc_type filtering**: All documents share the same engine. Use `doc_type` filter to query specific types.

3. **Category paths**: Use `all_category_handles` for URL construction and `category_paths` for display.

4. **Brand fields**: Use `brand_name` for display, `brand_slug` for filtering/URLs.
