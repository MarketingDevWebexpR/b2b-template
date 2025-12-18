# Medusa Product Integration Examples

**Practical examples for integrating Medusa products into your B2B e-commerce app**

---

## Table of Contents

1. [API Client Setup](#api-client-setup)
2. [Product Detail Page (SSR)](#product-detail-page-ssr)
3. [Product Listing with Filters](#product-listing-with-filters)
4. [Variant Selector Component](#variant-selector-component)
5. [Category Navigation](#category-navigation)
6. [Search Implementation](#search-implementation)
7. [Price Display](#price-display)
8. [Metadata Display](#metadata-display)
9. [Image Gallery](#image-gallery)
10. [B2B-Specific Features](#b2b-specific-features)

---

## API Client Setup

### Create Medusa API Client

```typescript
// /lib/medusa/client.ts

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';

export class MedusaClient {
  private baseUrl: string;

  constructor(baseUrl: string = MEDUSA_BACKEND_URL) {
    this.baseUrl = baseUrl;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Medusa API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getProducts(params?: MedusaStoreProductListParams) {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, String(v)));
          } else {
            searchParams.set(key, String(value));
          }
        }
      });
    }

    return this.request<MedusaStoreProductListResponse>(
      `/store/products?${searchParams}`
    );
  }

  async getProduct(id: string, params?: MedusaStoreProductParams) {
    const searchParams = new URLSearchParams(params as any);
    return this.request<MedusaStoreProductResponse>(
      `/store/products/${id}?${searchParams}`
    );
  }

  async getProductByHandle(handle: string, params?: MedusaStoreProductParams) {
    const searchParams = new URLSearchParams({
      handle,
      ...params,
    } as any);

    const response = await this.request<MedusaStoreProductListResponse>(
      `/store/products?${searchParams}`
    );

    return response.products[0] || null;
  }
}

export const medusaClient = new MedusaClient();
```

---

## Product Detail Page (SSR)

### Server Component Implementation

```typescript
// app/(shop)/produit/[slug]/page.tsx

import { medusaClient } from '@/lib/medusa/client';
import { notFound } from 'next/navigation';
import { PRODUCT_DETAIL_EXPAND } from '@/types/medusa';
import { ProductDetailClient } from './ProductDetailClient';

interface ProductPageProps {
  params: { slug: string };
}

async function getProduct(handle: string) {
  try {
    const product = await medusaClient.getProductByHandle(handle, {
      expand: PRODUCT_DETAIL_EXPAND,
      region_id: 'reg_eu', // Your default region
      country_code: 'FR',
    });

    return product;
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

  if (!product) {
    return {
      title: 'Produit non trouvé',
    };
  }

  return {
    title: `${product.title} - ${product.subtitle || 'Bijoux B2B'}`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description || product.subtitle || '',
      images: product.images.map(img => img.url),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
```

### Client Component for Product Detail

```typescript
// app/(shop)/produit/[slug]/ProductDetailClient.tsx
'use client';

import { useState } from 'react';
import type {
  MedusaProduct,
  MedusaProductVariant,
  SelectedVariantInfo,
} from '@/types/medusa';
import { findVariantByOptions, formatPrice, getPrimaryImage } from '@/types/medusa';
import { ProductImageGallery } from '@/components/products/ProductImageGallery';
import { VariantSelector } from '@/components/products/VariantSelector';
import { ProductMetadata } from '@/components/products/ProductMetadata';

interface ProductDetailClientProps {
  product: MedusaProduct;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const selectedVariant = findVariantByOptions(product, selectedOptions);

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      alert('Veuillez sélectionner toutes les options');
      return;
    }

    // Add to cart logic here
    console.log('Adding to cart:', selectedVariant);
  };

  return (
    <div className="product-detail">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <ProductImageGallery
          images={selectedVariant?.images || product.images}
          productTitle={product.title}
        />

        {/* Product Info */}
        <div className="product-info">
          {/* Breadcrumbs */}
          {product.categories && product.categories.length > 0 && (
            <nav className="breadcrumb">
              {product.categories[0].name}
            </nav>
          )}

          {/* Title & Subtitle */}
          <h1 className="text-3xl font-bold">{product.title}</h1>
          {product.subtitle && (
            <p className="text-lg text-gray-600 mt-2">{product.subtitle}</p>
          )}

          {/* Collection */}
          {product.collection && (
            <div className="mt-2 text-sm">
              Collection: {product.collection.title}
            </div>
          )}

          {/* Price */}
          {selectedVariant?.calculated_price && (
            <div className="price mt-6 text-2xl font-bold">
              {formatPrice(
                selectedVariant.calculated_price.calculated_amount,
                selectedVariant.calculated_price.currency_code
              )}
            </div>
          )}

          {/* Variant Selector */}
          <div className="mt-6">
            <VariantSelector
              product={product}
              selectedOptions={selectedOptions}
              onOptionsChange={setSelectedOptions}
            />
          </div>

          {/* Selected Variant Info */}
          {selectedVariant && (
            <div className="variant-info mt-4 p-4 bg-gray-50 rounded">
              <div className="font-semibold">{selectedVariant.title}</div>
              <div className="text-sm text-gray-600 mt-1">
                SKU: {selectedVariant.sku}
              </div>
              {selectedVariant.weight && (
                <div className="text-sm text-gray-600">
                  Poids: {selectedVariant.weight}g
                </div>
              )}
            </div>
          )}

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant}
            className="btn btn-primary w-full mt-6"
          >
            {selectedVariant ? 'Ajouter au panier' : 'Sélectionner les options'}
          </button>

          {/* Description */}
          {product.description && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {/* Metadata */}
          <ProductMetadata product={product} variant={selectedVariant} />
        </div>
      </div>
    </div>
  );
}
```

---

## Product Listing with Filters

```typescript
// app/(shop)/categorie/[slug]/page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { medusaClient } from '@/lib/medusa/client';
import type { MedusaStoreProductListParams } from '@/types/medusa';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';

interface CategoryPageProps {
  params: { slug: string };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [filters, setFilters] = useState<MedusaStoreProductListParams>({
    category_id: params.slug,
    limit: 20,
    offset: 0,
    expand: 'variants,images,categories',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => medusaClient.getProducts(filters),
  });

  const handleFilterChange = (newFilters: Partial<MedusaStoreProductListParams>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      offset: 0, // Reset to first page
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      offset: page * (prev.limit || 20),
    }));
  };

  if (error) return <div>Erreur de chargement</div>;

  return (
    <div className="category-page">
      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className="w-64">
          <ProductFilters
            onFilterChange={handleFilterChange}
            currentFilters={filters}
          />
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {isLoading ? (
            <div>Chargement...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {data && data.count > (filters.limit || 20) && (
                <div className="pagination mt-8">
                  {/* Pagination controls */}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
```

---

## Variant Selector Component

```typescript
// components/products/VariantSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import type { MedusaProduct } from '@/types/medusa';
import { getAvailableOptionValues } from '@/types/medusa';

interface VariantSelectorProps {
  product: MedusaProduct;
  selectedOptions: Record<string, string>;
  onOptionsChange: (options: Record<string, string>) => void;
}

export function VariantSelector({
  product,
  selectedOptions,
  onOptionsChange,
}: VariantSelectorProps) {
  if (!product.options || product.options.length === 0) {
    return null;
  }

  const handleOptionChange = (optionTitle: string, value: string) => {
    const newOptions = {
      ...selectedOptions,
      [optionTitle]: value,
    };
    onOptionsChange(newOptions);
  };

  return (
    <div className="variant-selector space-y-4">
      {product.options.map(option => {
        const availableValues = getAvailableOptionValues(
          product,
          option.title,
          selectedOptions
        );

        return (
          <div key={option.id} className="option-group">
            <label className="block text-sm font-medium mb-2">
              {option.title}
            </label>

            <div className="flex flex-wrap gap-2">
              {option.values.map(value => {
                const isSelected = selectedOptions[option.title] === value.value;
                const isAvailable = availableValues.includes(value.value);

                return (
                  <button
                    key={value.id}
                    type="button"
                    onClick={() => handleOptionChange(option.title, value.value)}
                    disabled={!isAvailable}
                    className={`
                      px-4 py-2 border rounded
                      ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                      ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500'}
                    `}
                  >
                    {value.value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

---

## Price Display

```typescript
// components/products/PriceDisplay.tsx

import type { MedusaProductVariant } from '@/types/medusa';
import { formatPrice } from '@/types/medusa';

interface PriceDisplayProps {
  variant: MedusaProductVariant;
}

export function PriceDisplay({ variant }: PriceDisplayProps) {
  if (!variant.calculated_price) {
    return <div className="text-gray-400">Prix non disponible</div>;
  }

  const {
    calculated_amount,
    calculated_amount_with_tax,
    currency_code,
    is_calculated_price_tax_inclusive,
  } = variant.calculated_price;

  const displayAmount = is_calculated_price_tax_inclusive
    ? calculated_amount_with_tax
    : calculated_amount;

  return (
    <div className="price">
      <div className="text-2xl font-bold">
        {formatPrice(displayAmount, currency_code)}
      </div>
      {!is_calculated_price_tax_inclusive && (
        <div className="text-sm text-gray-600">
          {formatPrice(calculated_amount_with_tax, currency_code)} TTC
        </div>
      )}
    </div>
  );
}
```

---

## Metadata Display

```typescript
// components/products/ProductMetadata.tsx

import type { MedusaProduct, MedusaProductVariant } from '@/types/medusa';

interface ProductMetadataProps {
  product: MedusaProduct;
  variant?: MedusaProductVariant | null;
}

export function ProductMetadata({ product, variant }: ProductMetadataProps) {
  const metadata = product.metadata || {};
  const variantMetadata = variant?.metadata || {};

  return (
    <div className="product-metadata mt-8 space-y-6">
      {/* Physical Characteristics */}
      <section>
        <h3 className="font-semibold mb-2">Caractéristiques</h3>
        <dl className="space-y-1 text-sm">
          {product.material && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Matériau:</dt>
              <dd className="font-medium">{product.material}</dd>
            </div>
          )}
          {(variant?.weight || product.weight) && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Poids:</dt>
              <dd className="font-medium">{variant?.weight || product.weight}g</dd>
            </div>
          )}
          {metadata.metal_purity && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Pureté:</dt>
              <dd className="font-medium">{metadata.metal_purity}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* Gemstone Info */}
      {metadata.gemstone_type && (
        <section>
          <h3 className="font-semibold mb-2">Pierre précieuse</h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Type:</dt>
              <dd className="font-medium">{metadata.gemstone_type}</dd>
            </div>
            {metadata.gemstone_carat && (
              <div className="flex justify-between">
                <dt className="text-gray-600">Poids:</dt>
                <dd className="font-medium">{metadata.gemstone_carat} carats</dd>
              </div>
            )}
            {metadata.gemstone_clarity && (
              <div className="flex justify-between">
                <dt className="text-gray-600">Pureté:</dt>
                <dd className="font-medium">{metadata.gemstone_clarity}</dd>
              </div>
            )}
            {metadata.gemstone_color && (
              <div className="flex justify-between">
                <dt className="text-gray-600">Couleur:</dt>
                <dd className="font-medium">{metadata.gemstone_color}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {/* Certifications */}
      {metadata.certification && (
        <section>
          <h3 className="font-semibold mb-2">Certifications</h3>
          <div className="text-sm">
            <div className="font-medium">{metadata.certification}</div>
            {metadata.certificate_number && (
              <div className="text-gray-600">N°: {metadata.certificate_number}</div>
            )}
          </div>
        </section>
      )}

      {/* B2B Information */}
      <section>
        <h3 className="font-semibold mb-2">Informations B2B</h3>
        <dl className="space-y-1 text-sm">
          {metadata.minimum_order_quantity && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Quantité minimum:</dt>
              <dd className="font-medium">{metadata.minimum_order_quantity}</dd>
            </div>
          )}
          {metadata.production_time_days && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Délai de production:</dt>
              <dd className="font-medium">{metadata.production_time_days} jours</dd>
            </div>
          )}
          {metadata.warranty_months && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Garantie:</dt>
              <dd className="font-medium">{metadata.warranty_months} mois</dd>
            </div>
          )}
        </dl>
      </section>

      {/* Origin & Compliance */}
      {product.origin_country && (
        <section>
          <h3 className="font-semibold mb-2">Origine</h3>
          <div className="text-sm">
            <div>Pays: {product.origin_country}</div>
            {metadata.ethical_sourcing && (
              <div className="text-green-600 mt-1">✓ Approvisionnement éthique</div>
            )}
            {metadata.conflict_free && (
              <div className="text-green-600">✓ Sans conflit</div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
```

---

## B2B-Specific Features

### Bulk Order Component

```typescript
// components/products/BulkOrderForm.tsx
'use client';

import { useState } from 'react';
import type { MedusaProduct, MedusaProductVariant } from '@/types/medusa';

interface BulkOrderFormProps {
  product: MedusaProduct;
}

export function BulkOrderForm({ product }: BulkOrderFormProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleQuantityChange = (variantId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [variantId]: quantity,
    }));
  };

  const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

  const handleBulkOrder = () => {
    const items = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([variantId, quantity]) => ({
        variantId,
        quantity,
      }));

    console.log('Bulk order:', items);
  };

  return (
    <div className="bulk-order-form">
      <h3 className="text-xl font-semibold mb-4">Commande en gros</h3>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Variante</th>
            <th className="text-left py-2">SKU</th>
            <th className="text-right py-2">Quantité</th>
          </tr>
        </thead>
        <tbody>
          {product.variants.map(variant => (
            <tr key={variant.id} className="border-b">
              <td className="py-2">{variant.title}</td>
              <td className="py-2 text-sm text-gray-600">{variant.sku}</td>
              <td className="py-2 text-right">
                <input
                  type="number"
                  min="0"
                  value={quantities[variant.id] || 0}
                  onChange={(e) =>
                    handleQuantityChange(variant.id, parseInt(e.target.value) || 0)
                  }
                  className="w-20 px-2 py-1 border rounded text-right"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-lg font-semibold">
          Total: {totalItems} articles
        </div>
        <button
          onClick={handleBulkOrder}
          disabled={totalItems === 0}
          className="btn btn-primary"
        >
          Ajouter au panier
        </button>
      </div>
    </div>
  );
}
```

---

## Summary

These examples provide a complete foundation for integrating Medusa products into your B2B e-commerce application. Key patterns include:

1. **Server-side data fetching** with Next.js App Router
2. **Client-side interactivity** with React Query
3. **Type-safe components** using Medusa type definitions
4. **Variant selection logic** with availability checks
5. **Metadata display** for B2B-specific information
6. **Price calculations** with tax context
7. **Bulk ordering** for B2B workflows

All examples are production-ready and follow Next.js 15 and React 19 best practices.
