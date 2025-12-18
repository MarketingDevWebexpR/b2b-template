# Medusa Product Data Structure & Store API Guide

**Complete reference for building B2B product pages with Medusa v2**

---

## Table of Contents

1. [Product Object Structure](#product-object-structure)
2. [Product Variants](#product-variants)
3. [Product Options](#product-options)
4. [Product Images & Media](#product-images--media)
5. [Product Categories](#product-categories)
6. [Product Collections](#product-collections)
7. [Product Tags & Types](#product-tags--types)
8. [Metadata Capabilities](#metadata-capabilities)
9. [Store API Endpoints](#store-api-endpoints)
10. [Pricing Context](#pricing-context)
11. [Implementation Examples](#implementation-examples)

---

## Product Object Structure

### Complete ProductDTO Interface

```typescript
interface ProductDTO {
  // Core Identification
  id: string;
  title: string;                    // Product name
  handle: string;                   // URL-friendly slug
  subtitle: string | null;          // Short tagline
  description: string | null;       // Full HTML/markdown description

  // Status & Type
  status: ProductStatus;            // "draft" | "proposed" | "published" | "rejected"
  is_giftcard: boolean;

  // Media
  thumbnail: string | null;         // Main product image URL
  images: ProductImageDTO[];        // All product images (expandable)

  // Physical Characteristics
  width: number | null;             // in cm
  weight: number | null;            // in grams
  length: number | null;            // in cm
  height: number | null;            // in cm
  material: string | null;          // e.g., "Or blanc 18K"

  // Origin & Compliance
  origin_country: string | null;    // ISO country code
  hs_code: string | null;           // Harmonized System code
  mid_code: string | null;          // MID code

  // Relationships (expandable)
  collection: ProductCollectionDTO | null;
  collection_id: string | null;
  categories?: ProductCategoryDTO[] | null;
  type: ProductTypeDTO | null;
  type_id: string | null;
  tags: ProductTagDTO[];

  // Variants & Options (expandable)
  variants: ProductVariantDTO[];    // All product variants
  options: ProductOptionDTO[];      // Option types (size, color, etc.)

  // Pricing
  discountable?: boolean;           // Can apply discounts

  // Integration
  external_id: string | null;       // For 3rd-party integrations

  // Timestamps
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at: string | Date;

  // Custom Data
  metadata?: Record<string, any>;   // Extensible key-value store
}
```

### Key Fields for B2B E-commerce

**Essential Display Fields:**
- `title`, `subtitle`, `description` - Product information
- `thumbnail`, `images` - Visual assets
- `handle` - For URL routing (`/products/{handle}`)

**B2B-Specific Fields:**
- `material` - Critical for jewelry (e.g., "Or blanc 18K", "Diamant")
- `weight` - Important for jewelry weight in grams
- `origin_country` - Country of origin (France, Italy, etc.)
- `hs_code` - For international shipping compliance
- `metadata` - Store custom B2B data (warranty, certification, etc.)

**Inventory & Variants:**
- `variants[]` - Different SKUs (sizes, colors, metals)
- `options[]` - Option definitions (Ring Size: 48-64)

---

## Product Variants

### Complete ProductVariantDTO Interface

```typescript
interface ProductVariantDTO {
  // Core Identification
  id: string;
  title: string;                    // e.g., "Size 54 / Or Blanc"
  sku: string | null;               // Stock Keeping Unit

  // Identifiers
  barcode: string | null;
  ean: string | null;               // European Article Number
  upc: string | null;               // Universal Product Code

  // Inventory Management
  allow_backorder: boolean;
  manage_inventory: boolean;
  requires_shipping: boolean;

  // Media
  thumbnail: string | null;         // Variant-specific image
  images: ProductImageDTO[];        // Variant-specific images

  // Physical Characteristics
  material: string | null;
  weight: number | null;
  length: number | null;
  height: number | null;
  width: number | null;

  // Compliance
  hs_code: string | null;
  origin_country: string | null;
  mid_code: string | null;

  // Relationships
  options: ProductOptionValueDTO[];  // Selected options for this variant
  product?: ProductDTO | null;
  product_id: string | null;
  variant_rank?: number | null;     // Display order

  // Timestamps
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at: string | Date;

  // Custom Data
  metadata: Record<string, unknown> | null;
}
```

### Key Points for Variants

**Each variant represents a unique purchasable SKU:**
- A ring with 3 sizes and 2 metals = 6 variants
- Each variant can have its own price (managed separately via Pricing module)
- Each variant has independent inventory tracking

**Common B2B Use Cases:**
```typescript
// Example: Diamond Ring Variants
variants: [
  {
    id: "var_01",
    title: "Taille 54 / Or Blanc",
    sku: "RING-DIA-54-WG",
    options: [
      { option: { title: "Taille" }, value: "54" },
      { option: { title: "Métal" }, value: "Or Blanc" }
    ],
    weight: 4.5,
    material: "Or blanc 18K"
  },
  {
    id: "var_02",
    title: "Taille 56 / Or Jaune",
    sku: "RING-DIA-56-YG",
    options: [
      { option: { title: "Taille" }, value: "56" },
      { option: { title: "Métal" }, value: "Or Jaune" }
    ],
    weight: 4.7,
    material: "Or jaune 18K"
  }
]
```

---

## Product Options

### Complete ProductOptionDTO Interface

```typescript
interface ProductOptionDTO {
  id: string;
  title: string;                    // e.g., "Taille", "Couleur"
  product?: ProductDTO | null;
  product_id?: string | null;
  values: ProductOptionValueDTO[];  // Available option values
  metadata?: Record<string, any>;
  created_at: string | Date;
  updated_at: string | Date;
}

interface ProductOptionValueDTO {
  id: string;
  value: string;                    // e.g., "54", "Or Blanc"
  option: ProductOptionDTO;
  option_id: string;
  metadata?: Record<string, any>;
  created_at: string | Date;
  updated_at: string | Date;
}
```

### B2B Jewelry Options Examples

```typescript
// Ring Sizes (French sizing)
{
  title: "Taille de bague",
  values: [
    { value: "48" }, { value: "50" }, { value: "52" },
    { value: "54" }, { value: "56" }, { value: "58" },
    { value: "60" }, { value: "62" }, { value: "64" }
  ]
}

// Metal Types
{
  title: "Métal",
  values: [
    { value: "Or blanc 18K" },
    { value: "Or jaune 18K" },
    { value: "Or rose 18K" },
    { value: "Platine" }
  ]
}

// Stone Quality
{
  title: "Qualité du diamant",
  values: [
    { value: "IF (Internally Flawless)" },
    { value: "VVS1" },
    { value: "VVS2" },
    { value: "VS1" },
    { value: "VS2" }
  ]
}

// Chain Length (for necklaces)
{
  title: "Longueur de chaîne",
  values: [
    { value: "40 cm" },
    { value: "45 cm" },
    { value: "50 cm" },
    { value: "55 cm" }
  ]
}
```

---

## Product Images & Media

### Complete ProductImageDTO Interface

```typescript
interface ProductImageDTO {
  id: string;
  url: string;                      // Full image URL
  rank: number;                     // Display order (0-indexed)
  metadata?: Record<string, any>;   // Store alt text, dimensions, etc.
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at?: string | Date;
}
```

### Image Management Best Practices

**1. Image Ranking:**
```typescript
// Images are ordered by rank (lowest first)
images: [
  { id: "img_01", url: "https://...", rank: 0 },  // Main image
  { id: "img_02", url: "https://...", rank: 1 },  // Second view
  { id: "img_03", url: "https://...", rank: 2 },  // Detail shot
  { id: "img_04", url: "https://...", rank: 3 },  // Lifestyle
]
```

**2. Metadata for Images:**
```typescript
{
  url: "https://storage.example.com/ring-diamond-main.jpg",
  rank: 0,
  metadata: {
    alt: "Bague solitaire diamant 1.5 carat en or blanc",
    width: 2400,
    height: 2400,
    format: "jpg",
    view_type: "main",           // main, side, detail, lifestyle, size
    color_variant: "white_gold",
    zoom_available: true
  }
}
```

**3. Thumbnail vs Images:**
- `product.thumbnail` - Single URL for list/grid views
- `product.images[]` - Full gallery for product detail page
- Variants can override with `variant.thumbnail` and `variant.images[]`

**4. B2B Image Requirements:**
```typescript
// Recommended image setup for B2B jewelry
images: [
  { rank: 0, metadata: { view_type: "main" } },        // Front view
  { rank: 1, metadata: { view_type: "side" } },        // Side profile
  { rank: 2, metadata: { view_type: "detail" } },      // Close-up of stone/detail
  { rank: 3, metadata: { view_type: "size" } },        // Size reference
  { rank: 4, metadata: { view_type: "certificate" } }, // Certificate/documentation
  { rank: 5, metadata: { view_type: "lifestyle" } },   // Worn on hand/model
]
```

---

## Product Categories

### Complete ProductCategoryDTO Interface

```typescript
interface ProductCategoryDTO {
  // Core Identification
  id: string;
  name: string;                         // e.g., "Bagues", "Colliers"
  description: string;
  handle: string;                       // URL slug

  // Visibility
  is_active: boolean;                   // Published state
  is_internal: boolean;                 // Admin-only category
  rank: number;                         // Display order among siblings

  // Hierarchical Structure
  parent_category: ProductCategoryDTO | null;
  parent_category_id: string | null;
  category_children: ProductCategoryDTO[];  // Subcategories

  // Associated Products
  products: ProductDTO[];               // Products in this category

  // Timestamps
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at?: string | Date;

  // Custom Data
  metadata?: Record<string, any>;
}
```

### B2B Category Hierarchy Example

```typescript
// Root Categories
{
  id: "cat_bijoux",
  name: "Bijoux",
  handle: "bijoux",
  rank: 0,
  category_children: [
    {
      id: "cat_bagues",
      name: "Bagues",
      handle: "bagues",
      rank: 0,
      parent_category_id: "cat_bijoux",
      category_children: [
        {
          id: "cat_bagues_solitaire",
          name: "Solitaires",
          handle: "solitaires",
          rank: 0,
          metadata: {
            icon: "diamond",
            description_short: "Bagues solitaires avec pierre centrale"
          }
        },
        {
          id: "cat_bagues_alliance",
          name: "Alliances",
          handle: "alliances",
          rank: 1
        }
      ]
    },
    {
      id: "cat_colliers",
      name: "Colliers",
      handle: "colliers",
      rank: 1
    }
  ]
}
```

### Category Metadata for B2B

```typescript
metadata: {
  icon: "diamond",                    // Icon name for UI
  banner_image: "https://...",        // Category landing page banner
  seo_title: "Bagues de fiançailles",
  seo_description: "...",
  featured_products: ["prod_01", "prod_02"],
  min_order_quantity: 10,             // B2B minimum order
  lead_time_days: 14,                 // Production lead time
  customization_available: true,
  requires_certification: true        // Requires diamond certification
}
```

---

## Product Collections

### Complete ProductCollectionDTO Interface

```typescript
interface ProductCollectionDTO {
  id: string;
  title: string;                    // e.g., "Collection Automne/Hiver 2024"
  handle: string;                   // URL slug
  metadata?: Record<string, any>;
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at?: string | Date;
}
```

### B2B Collection Examples

```typescript
// Seasonal Collection
{
  id: "coll_aw_2024",
  title: "Automne/Hiver 2024",
  handle: "automne-hiver-2024",
  metadata: {
    season: "AW",
    year: 2024,
    launch_date: "2024-09-01",
    banner_image: "https://...",
    theme: "Elegance Intemporelle",
    featured: true
  }
}

// Style Collection
{
  id: "coll_classique",
  title: "Collection Classique",
  handle: "classique",
  metadata: {
    style: "classic",
    description: "Pièces intemporelles et élégantes",
    target_audience: "traditional"
  }
}

// Designer Collection
{
  id: "coll_heritage",
  title: "Collection Héritage",
  handle: "heritage",
  metadata: {
    designer: "Jean Dubois",
    year_established: 1890,
    price_tier: "premium",
    limited_edition: true
  }
}
```

---

## Product Tags & Types

### ProductTagDTO Interface

```typescript
interface ProductTagDTO {
  id: string;
  value: string;                    // e.g., "nouveauté", "exclusif"
  metadata?: Record<string, any>;
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at?: string | Date;
}
```

### ProductTypeDTO Interface

```typescript
interface ProductTypeDTO {
  id: string;
  value: string;                    // e.g., "Bague", "Collier"
  metadata?: Record<string, any>;
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at?: string | Date;
}
```

### B2B Tags & Types Examples

```typescript
// Tags for filtering and marketing
tags: [
  { value: "nouveauté" },           // New arrivals
  { value: "best-seller" },         // Top sellers
  { value: "exclusif" },            // Exclusive
  { value: "personnalisable" },     // Customizable
  { value: "sur-mesure" },          // Made-to-order
  { value: "eco-responsable" },     // Sustainable
  { value: "edition-limitee" },     // Limited edition
  { value: "certifie-diamant" },    // Diamond certified
]

// Product Types
type: { value: "Bague de fiançailles" }
type: { value: "Alliance" }
type: { value: "Bague cocktail" }
type: { value: "Collier solitaire" }
```

---

## Metadata Capabilities

### What is Metadata?

Metadata is a flexible key-value store available on most Medusa entities. It allows you to extend the data model without database migrations.

### Metadata on Products

```typescript
product.metadata = {
  // B2B-specific fields
  warranty_months: 36,
  certification: "GIA",
  certificate_number: "2141234567",
  hallmark: "750",                      // Gold purity mark

  // Manufacturing
  handmade: true,
  production_time_days: 21,
  made_to_order: true,
  customization_options: ["engraving", "stone_selection"],

  // Gemstone details
  gemstone_type: "Diamant",
  gemstone_carat: 1.5,
  gemstone_color: "D",                  // Diamond color grade
  gemstone_clarity: "VVS1",
  gemstone_cut: "Brillant",
  gemstone_origin: "Botswana",

  // Metal details
  metal_purity: "18K",
  metal_weight_grams: 4.5,
  rhodium_plated: true,

  // B2B pricing
  wholesale_tier: "premium",
  minimum_order_quantity: 1,
  bulk_discount_available: true,

  // Marketing
  featured_on_homepage: true,
  featured_category: "bagues-fiancailles",
  marketing_tags: ["luxury", "bridal"],

  // SEO
  seo_keywords: ["bague diamant", "solitaire or blanc"],
  schema_org_type: "Product",

  // Sustainability
  ethical_sourcing: true,
  conflict_free: true,
  recycled_metal: false,

  // Customer service
  resizing_available: true,
  resizing_free: true,
  return_policy_days: 30,

  // Internal
  supplier_code: "SUP-FR-001",
  cost_price_eur: 2500.00,              // Internal only, never expose to frontend
  margin_percentage: 40,
}
```

### Metadata on Variants

```typescript
variant.metadata = {
  // Variant-specific details
  stone_weight_carat: 1.52,
  metal_weight_grams: 4.7,

  // Production
  production_complexity: "high",
  requires_custom_sizing: false,

  // B2B inventory
  reorder_point: 2,
  supplier_lead_time_days: 14,

  // Display
  primary_variant: true,                // Featured variant
  display_priority: 1,
}
```

### Metadata on Categories

```typescript
category.metadata = {
  // Display
  icon: "diamond-ring",
  color_scheme: "rose-gold",
  banner_image_url: "https://...",

  // SEO
  meta_title: "Bagues de Fiançailles | Bijoux B2B",
  meta_description: "...",

  // B2B settings
  min_order_value_eur: 1000,
  volume_discount_tiers: {
    "10+": 0.05,
    "25+": 0.10,
    "50+": 0.15
  },

  // Filters
  available_filters: ["material", "price", "stone_type"],
  price_ranges: [
    { min: 0, max: 1000 },
    { min: 1000, max: 5000 },
    { min: 5000, max: 10000 },
    { min: 10000, max: null }
  ]
}
```

### Metadata Best Practices

1. **Never store sensitive data** - Metadata is often indexed and searchable
2. **Use consistent naming** - Establish naming conventions (snake_case, camelCase)
3. **Document your schema** - Keep a reference of custom metadata fields
4. **Keep it flat** - Avoid deeply nested objects (JSON indexing limitations)
5. **Use proper types** - Store numbers as numbers, booleans as booleans
6. **Don't duplicate core fields** - Use built-in fields when available

---

## Store API Endpoints

### Base URL

```
Production: https://api.yourdomain.com
Development: http://localhost:9000
```

### Authentication

```typescript
// Store API endpoints are public by default
// For authenticated requests (customer-specific pricing, etc.)
headers: {
  'Authorization': 'Bearer {customer_token}',
  'Content-Type': 'application/json'
}
```

### 1. List Products

**Endpoint:** `GET /store/products`

**Query Parameters:**

```typescript
interface StoreProductListParams {
  // Pagination
  limit?: number;                   // Default: 20, Max: 100
  offset?: number;                  // Default: 0

  // Filtering
  id?: string | string[];           // Filter by product ID(s)
  q?: string;                       // Search query (title, description)
  handle?: string | string[];       // Filter by handle(s)

  // Categories & Collections
  category_id?: string | string[];  // Filter by category ID(s)
  collection_id?: string | string[];

  // Tags & Types
  tag_id?: string | string[];       // Filter by tag ID(s)
  type_id?: string | string[];      // Filter by type ID(s)

  // Variant Filtering
  variants?: {
    options?: Record<string, string>;  // e.g., { "Taille": "54" }
  };

  // Relationships (expandable)
  fields?: string;                  // Select specific fields
  expand?: string;                  // Expand relationships

  // Pricing Context (for customer-specific pricing)
  region_id?: string;
  country_code?: string;
  province?: string;
  cart_id?: string;
}
```

**Example Request:**

```typescript
// Fetch rings with diamond tag, paginated
const response = await fetch(
  '/store/products?' + new URLSearchParams({
    category_id: 'cat_bagues',
    tag_id: 'tag_diamant',
    limit: '20',
    offset: '0',
    expand: 'variants,images,categories,collection'
  })
);

const data = await response.json();
```

**Response:**

```typescript
{
  products: ProductDTO[],
  count: number,
  limit: number,
  offset: number
}
```

### 2. Get Single Product

**Endpoint:** `GET /store/products/:id`

**Query Parameters:**

```typescript
interface StoreProductParams {
  // Relationships
  fields?: string;
  expand?: string;                  // Default: "variants,images"

  // Pricing Context
  region_id?: string;
  country_code?: string;
  cart_id?: string;
}
```

**Example Request:**

```typescript
const response = await fetch(
  '/store/products/prod_01?' + new URLSearchParams({
    expand: 'variants,variants.options,images,categories,collection,tags'
  })
);

const { product } = await response.json();
```

**Response:**

```typescript
{
  product: ProductDTO
}
```

### 3. Get Product by Handle

**Endpoint:** `GET /store/products?handle={handle}`

More SEO-friendly than using ID:

```typescript
const response = await fetch(
  '/store/products?handle=solitaire-eternite&expand=variants,images'
);

const { products } = await response.json();
const product = products[0];
```

### 4. Search Products

**Endpoint:** `GET /store/products?q={query}`

```typescript
const response = await fetch(
  '/store/products?' + new URLSearchParams({
    q: 'diamant',
    limit: '20',
    expand: 'variants,images'
  })
);
```

### 5. Get Products by Category

**Endpoint:** `GET /store/products?category_id={id}`

```typescript
// Get all products in "Bagues" category and subcategories
const response = await fetch(
  '/store/products?' + new URLSearchParams({
    category_id: ['cat_bagues', 'cat_bagues_solitaire', 'cat_bagues_alliance'],
    expand: 'variants,images',
    limit: '50'
  })
);
```

---

## Pricing Context

### Why Pricing Context Matters

Medusa v2 uses a sophisticated pricing system that calculates prices based on:
- **Region** - Different prices per market (EU, US, UK)
- **Currency** - Multi-currency support
- **Customer Group** - Wholesale, retail, VIP tiers
- **Quantity** - Volume-based pricing
- **Taxes** - Applied based on location

### Include Pricing Context in Requests

```typescript
// Option 1: Provide region/country explicitly
const params = new URLSearchParams({
  region_id: 'reg_eu',
  country_code: 'FR',
  province: 'île-de-france',
  expand: 'variants'
});

// Option 2: Provide cart_id (uses cart's region/address)
const params = new URLSearchParams({
  cart_id: 'cart_123',
  expand: 'variants'
});
```

### Accessing Calculated Prices

Prices are returned via expanded relationships:

```typescript
const response = await fetch('/store/products/prod_01?expand=variants');
const { product } = await response.json();

// Prices are calculated per variant
product.variants.forEach(variant => {
  // Note: Actual price structure depends on your Medusa setup
  console.log(variant.calculated_price);  // With tax
  console.log(variant.original_price);    // Without tax
  console.log(variant.price_list_price);  // Special price list
});
```

---

## Implementation Examples

### 1. Fetch Product for Detail Page (SSR)

```typescript
// app/(shop)/produit/[slug]/page.tsx
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: { slug: string };
}

async function getProduct(handle: string) {
  const response = await fetch(
    `${process.env.MEDUSA_BACKEND_URL}/store/products?` +
    new URLSearchParams({
      handle,
      expand: 'variants,variants.options,images,categories,collection,tags,type',
      region_id: 'reg_eu',
      country_code: 'FR'
    }),
    { next: { revalidate: 3600 } }  // Cache for 1 hour
  );

  if (!response.ok) throw new Error('Failed to fetch product');

  const { products } = await response.json();
  return products[0] || null;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1>{product.title}</h1>
      <p>{product.subtitle}</p>

      {/* Images */}
      <div className="gallery">
        {product.images.map(img => (
          <img key={img.id} src={img.url} alt={product.title} />
        ))}
      </div>

      {/* Variants */}
      <div className="variants">
        {product.variants.map(variant => (
          <div key={variant.id}>
            <span>{variant.title}</span>
            <span>SKU: {variant.sku}</span>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="breadcrumb">
        {product.categories?.map(cat => cat.name).join(' > ')}
      </div>

      {/* Metadata */}
      <div className="specs">
        {product.metadata?.gemstone_type && (
          <span>Pierre: {product.metadata.gemstone_type}</span>
        )}
        {product.weight && (
          <span>Poids: {product.weight}g</span>
        )}
        {product.material && (
          <span>Matériau: {product.material}</span>
        )}
      </div>
    </div>
  );
}
```

### 2. Product Listing with Filters (Client Component)

```typescript
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface ProductFilters {
  category_id?: string;
  tag_id?: string;
  search?: string;
}

export function ProductListing() {
  const [filters, setFilters] = useState<ProductFilters>({});
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['products', filters, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (page * limit).toString(),
        expand: 'variants,images',
        region_id: 'reg_eu',
        ...filters
      });

      const response = await fetch(`/api/products?${params}`);
      return response.json();
    }
  });

  return (
    <div>
      {/* Filters */}
      <div className="filters">
        <select onChange={(e) => setFilters(f => ({ ...f, category_id: e.target.value }))}>
          <option value="">All Categories</option>
          <option value="cat_bagues">Bagues</option>
          <option value="cat_colliers">Colliers</option>
        </select>

        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))}
        />
      </div>

      {/* Product Grid */}
      <div className="grid">
        {data?.products?.map(product => (
          <div key={product.id} className="card">
            <img src={product.thumbnail} alt={product.title} />
            <h3>{product.title}</h3>
            <p>{product.subtitle}</p>
            <span>{product.variants.length} variants</span>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={page === 0}
          onClick={() => setPage(p => p - 1)}
        >
          Previous
        </button>
        <span>Page {page + 1}</span>
        <button
          disabled={!data || data.products.length < limit}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### 3. Variant Selector with Options

```typescript
'use client';

import { useState } from 'react';
import type { ProductDTO, ProductVariantDTO, ProductOptionDTO } from '@medusajs/types';

interface VariantSelectorProps {
  product: ProductDTO;
}

export function VariantSelector({ product }: VariantSelectorProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Find the matching variant based on selected options
  const selectedVariant = product.variants.find(variant =>
    variant.options.every(opt =>
      selectedOptions[opt.option.title] === opt.value
    )
  );

  const handleOptionChange = (optionTitle: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionTitle]: value
    }));
  };

  return (
    <div className="variant-selector">
      {product.options.map(option => (
        <div key={option.id} className="option-group">
          <label>{option.title}</label>
          <select
            value={selectedOptions[option.title] || ''}
            onChange={(e) => handleOptionChange(option.title, e.target.value)}
          >
            <option value="">Select {option.title}</option>
            {option.values.map(value => (
              <option key={value.id} value={value.value}>
                {value.value}
              </option>
            ))}
          </select>
        </div>
      ))}

      {selectedVariant && (
        <div className="selected-variant">
          <h4>{selectedVariant.title}</h4>
          <p>SKU: {selectedVariant.sku}</p>
          <p>Weight: {selectedVariant.weight}g</p>
          {selectedVariant.metadata?.production_time_days && (
            <p>Lead time: {selectedVariant.metadata.production_time_days} days</p>
          )}
        </div>
      )}
    </div>
  );
}
```

### 4. B2B Product Card with Metadata

```typescript
import type { ProductDTO } from '@medusajs/types';
import Link from 'next/link';

interface ProductCardProps {
  product: ProductDTO;
}

export function ProductCard({ product }: ProductCardProps) {
  const metadata = product.metadata || {};

  return (
    <Link href={`/produit/${product.handle}`} className="product-card">
      <div className="image">
        <img src={product.thumbnail || '/placeholder.jpg'} alt={product.title} />

        {/* Badges */}
        {metadata.featured_on_homepage && (
          <span className="badge featured">Vedette</span>
        )}
        {metadata.made_to_order && (
          <span className="badge custom">Sur Mesure</span>
        )}
      </div>

      <div className="content">
        <h3>{product.title}</h3>
        <p className="subtitle">{product.subtitle}</p>

        {/* Material & Weight */}
        <div className="specs">
          {product.material && <span>{product.material}</span>}
          {product.weight && <span>{product.weight}g</span>}
        </div>

        {/* Gemstone Info */}
        {metadata.gemstone_type && (
          <div className="gemstone">
            <span>{metadata.gemstone_type}</span>
            {metadata.gemstone_carat && (
              <span>{metadata.gemstone_carat} carats</span>
            )}
            {metadata.gemstone_clarity && (
              <span>{metadata.gemstone_clarity}</span>
            )}
          </div>
        )}

        {/* B2B Info */}
        <div className="b2b-info">
          <span>{product.variants.length} variants</span>
          {metadata.minimum_order_quantity && (
            <span>MOQ: {metadata.minimum_order_quantity}</span>
          )}
          {metadata.production_time_days && (
            <span>Lead time: {metadata.production_time_days}j</span>
          )}
        </div>

        {/* Certifications */}
        {metadata.certification && (
          <div className="certification">
            <span>Certifié {metadata.certification}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
```

---

## Summary

### Key Takeaways

1. **ProductDTO is comprehensive** - Use all available fields for rich B2B experiences
2. **Variants are powerful** - Each SKU can have unique attributes, pricing, and inventory
3. **Options define variants** - Set up options (size, metal, etc.) to generate variants
4. **Images support ranking** - Order images for optimal display
5. **Categories are hierarchical** - Build nested category trees
6. **Collections are flexible** - Group products by season, style, or theme
7. **Metadata is extensible** - Store custom B2B data without schema changes
8. **Pricing needs context** - Always include region/cart for accurate prices
9. **Use expand wisely** - Only expand relationships you need
10. **Cache aggressively** - Product data changes infrequently

### Next Steps

1. Review your current product model in `/apps/web/types/index.ts`
2. Map Sage API fields to Medusa ProductDTO
3. Design your metadata schema for B2B-specific fields
4. Implement product detail page using all available fields
5. Build variant selector with proper option handling
6. Add category navigation using hierarchical structure
7. Implement search with filters (category, tags, metadata)

---

**For more information:**
- [Medusa v2 Documentation](https://docs.medusajs.com)
- [Product Module Reference](https://docs.medusajs.com/resources/references/product)
- [Store API Reference](https://docs.medusajs.com/api/store)
