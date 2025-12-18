# Medusa Product Documentation - Quick Start

This directory contains comprehensive documentation for working with Medusa v2 products in your B2B e-commerce application.

## Documents Overview

### 1. MEDUSA_PRODUCT_API_GUIDE.md
**Complete reference for Medusa product data structures**

- Full ProductDTO interface with all fields explained
- Product Variants and Options
- Product Images and Media management
- Categories and Collections
- Metadata capabilities
- Store API endpoints documentation
- Pricing context handling
- Real-world implementation examples

**Use this when:**
- You need to understand what data is available from Medusa
- Designing product pages and features
- Planning your metadata schema
- Learning about the Store API

### 2. MEDUSA_INTEGRATION_EXAMPLES.md
**Practical code examples for common scenarios**

- API Client setup
- Product detail page (SSR with Next.js)
- Product listing with filters
- Variant selector component
- Price display with tax context
- Metadata display components
- B2B-specific features (bulk orders)

**Use this when:**
- Implementing product pages
- Building product listing/search
- Creating variant selectors
- Adding B2B features

### 3. Type Definitions: /types/medusa.ts
**TypeScript type definitions**

All Medusa types in one file:
- `MedusaProduct` - Complete product interface
- `MedusaProductVariant` - Variant interface
- `MedusaProductOption` - Option interface
- `MedusaProductImage` - Image interface
- `MedusaProductCategory` - Category interface
- And more...

Plus helper functions:
- `findVariantByOptions()` - Find variant by selected options
- `getAvailableOptionValues()` - Get available values for an option
- `formatPrice()` - Format price with currency
- `getPrimaryImage()` - Get main product image
- And more...

**Use this when:**
- Writing TypeScript components
- Need type safety for Medusa data
- Using helper utilities

## Quick Start Guide

### 1. Understanding Product Structure

```typescript
import type { MedusaProduct } from '@/types/medusa';

// A product has:
// - Basic info (title, description, handle)
// - Media (thumbnail, images array)
// - Variants (different SKUs)
// - Options (size, color, etc.)
// - Categories & Collections
// - Metadata (custom B2B fields)
```

### 2. Fetching a Product (SSR)

```typescript
import { medusaClient } from '@/lib/medusa/client';
import { PRODUCT_DETAIL_EXPAND } from '@/types/medusa';

const product = await medusaClient.getProductByHandle('solitaire-eternite', {
  expand: PRODUCT_DETAIL_EXPAND,
  region_id: 'reg_eu',
  country_code: 'FR',
});
```

### 3. Displaying Product with Variants

```typescript
import { VariantSelector } from '@/components/products/VariantSelector';

<VariantSelector
  product={product}
  selectedOptions={selectedOptions}
  onOptionsChange={setSelectedOptions}
/>
```

### 4. Using Metadata for B2B

```typescript
// Product metadata can store custom B2B data
const metadata = product.metadata;

// Access B2B fields
const warrantyMonths = metadata?.warranty_months;
const productionTime = metadata?.production_time_days;
const certification = metadata?.certification;
const gemstoneInfo = {
  type: metadata?.gemstone_type,
  carat: metadata?.gemstone_carat,
  clarity: metadata?.gemstone_clarity,
};
```

## Key Concepts

### Variants vs Options

- **Options** define the configurable attributes (e.g., "Taille", "Métal")
- **Variants** are the actual SKUs created from option combinations
- Each variant has a unique SKU, price, and inventory

Example:
```
Product: Bague Solitaire
Options:
  - Taille: [48, 50, 52, 54, 56]
  - Métal: [Or Blanc, Or Jaune, Or Rose]

Variants: 15 total (5 sizes × 3 metals)
  - Taille 48 / Or Blanc (SKU: RING-DIA-48-WG)
  - Taille 48 / Or Jaune (SKU: RING-DIA-48-YG)
  - ... etc
```

### Expandable Relationships

Many Medusa fields are "expandable" - they return just IDs by default:

```typescript
// Without expand: only IDs
{
  category_id: "cat_123",
  collection_id: "coll_456"
}

// With expand: full objects
{
  category: {
    id: "cat_123",
    name: "Bagues",
    handle: "bagues",
    // ... full category data
  },
  collection: {
    id: "coll_456",
    title: "Collection Automne/Hiver",
    // ... full collection data
  }
}
```

Use the `expand` parameter:
```typescript
expand: 'variants,variants.options,images,categories,collection,tags'
```

### Metadata Best Practices

1. **Use for B2B-specific fields** that don't fit in core schema
2. **Keep it flat** - avoid deeply nested objects
3. **Use proper types** - store numbers as numbers, not strings
4. **Never store sensitive data** - metadata is often indexed
5. **Document your schema** - maintain a list of custom fields

### Pricing Context

Always provide pricing context for accurate prices:

```typescript
{
  region_id: 'reg_eu',        // User's region
  country_code: 'FR',          // User's country
  cart_id: 'cart_123',         // Or use cart (includes region/address)
}
```

This ensures:
- Correct currency
- Tax calculations
- Customer-specific pricing (B2B tiers)
- Volume discounts

## Common Patterns

### Pattern 1: Product Detail Page
See: `MEDUSA_INTEGRATION_EXAMPLES.md` → Product Detail Page

### Pattern 2: Product Listing with Filters
See: `MEDUSA_INTEGRATION_EXAMPLES.md` → Product Listing

### Pattern 3: Variant Selection
See: `MEDUSA_INTEGRATION_EXAMPLES.md` → Variant Selector

### Pattern 4: B2B Bulk Orders
See: `MEDUSA_INTEGRATION_EXAMPLES.md` → B2B Features

## Troubleshooting

### "Cannot find variant for selected options"
- Check that all option values match exactly (case-sensitive)
- Use `getAvailableOptionValues()` to show only available combinations

### "Price is null or undefined"
- Ensure you're providing pricing context (region_id, country_code)
- Check that variants have prices configured in Medusa admin

### "Images not showing"
- Verify S3/MinIO configuration in medusa-config.js
- Check that image URLs are publicly accessible
- Ensure images are properly uploaded in Medusa admin

### "Metadata fields missing"
- Metadata is optional - always check existence before accessing
- Use optional chaining: `product.metadata?.custom_field`
- TypeScript types help catch these at compile time

## Next Steps

1. ✅ Read `MEDUSA_PRODUCT_API_GUIDE.md` to understand available data
2. ✅ Review `MEDUSA_INTEGRATION_EXAMPLES.md` for code patterns
3. ✅ Import types from `/types/medusa.ts` in your components
4. ✅ Set up Medusa API client in `/lib/medusa/client.ts`
5. ✅ Build your first product detail page
6. ✅ Implement variant selection
7. ✅ Add metadata display for B2B fields
8. ✅ Create product listing with filters

## Resources

- [Medusa v2 Documentation](https://docs.medusajs.com)
- [Product Module Reference](https://docs.medusajs.com/resources/references/product)
- [Store API Reference](https://docs.medusajs.com/api/store)
- [Medusa Admin](http://localhost:9000/app) - Configure products, categories, pricing

## Support

For questions about:
- **Medusa usage**: Check official Medusa docs
- **Project structure**: See main project README
- **B2B features**: Review `MEDUSA_PRODUCT_API_GUIDE.md` metadata section
- **Type definitions**: See `/types/medusa.ts` file
