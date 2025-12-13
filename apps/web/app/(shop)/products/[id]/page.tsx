import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import {
  getProductByReference,
  getProductBySlug as getProductBySlugApi,
  getProducts as getProductsApi,
  getCategories as getCategoriesApi,
} from '@/lib/api';
import { Container } from '@/components/ui/Container';
import { ProductGallery } from '@/components/products/ProductGallery';
import { ProductInfoWithCart } from '@/components/products/ProductInfoWithCart';
import { RelatedProducts } from '@/components/products/RelatedProducts';
import { HeaderSpacer } from '@/components/layout/Header';
import { Product, Category } from '@/types';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

// ============================================
// Data Fetching Functions with Fallback
// ============================================

/**
 * Fetch a product by ID (reference or slug) from the live Sage API.
 * Tries reference first, then slug.
 */
async function fetchProduct(id: string): Promise<Product | null> {
  // Try fetching by reference first
  let product = await getProductByReference(id);
  if (product) {
    return product;
  }

  // Then try by slug
  product = await getProductBySlugApi(id);
  if (product) {
    return product;
  }

  // No product found
  console.log(`[ProductPage] No product found via API for "${id}"`);
  return null;
}

/**
 * Fetch related products from the same category from the live Sage API.
 */
async function fetchRelatedProducts(
  product: Product,
  limit: number = 4
): Promise<Product[]> {
  const allProducts = await getProductsApi();
  return allProducts
    .filter(
      (p) =>
        p.categoryId === product.categoryId &&
        p.id !== product.id &&
        p.reference !== product.reference
    )
    .slice(0, limit);
}

/**
 * Resolve category information for a product.
 * Uses product's embedded category if available, otherwise fetches from API.
 */
async function resolveCategory(product: Product): Promise<Category | undefined> {
  // Use embedded category from API if available
  if (product.category) {
    return product.category;
  }
  // Fetch categories from API
  const categories = await getCategoriesApi();
  return categories.find(c => c.code === product.categoryId);
}

// Generate dynamic metadata
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) {
    return {
      title: 'Produit non trouve | Maison Joaillerie',
    };
  }

  const category = await resolveCategory(product);

  return {
    title: `${product.name} | Maison Joaillerie`,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} | Maison Joaillerie`,
      description: product.shortDescription,
      images: product.images.map((image) => ({
        url: image,
        width: 1200,
        height: 630,
        alt: product.name,
      })),
    },
    other: {
      'product:price:amount': product.price.toString(),
      'product:price:currency': 'EUR',
      'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
      'product:category': category?.name || '',
    },
  };
}

// JSON-LD structured data for SEO
function ProductJsonLd({ product, category }: { product: Product; category?: Category }) {
  const reference = product.reference || product.id;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: reference,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'EUR',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Maison Joaillerie',
      },
    },
    category: category?.name,
    material: product.materials.join(', '),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) {
    notFound();
  }

  const category = await resolveCategory(product);
  const relatedProducts = await fetchRelatedProducts(product, 4);

  // Format the reference for display
  const displayReference = product.reference || `MJ-${product.id.padStart(5, '0')}`;

  return (
    <>
      <ProductJsonLd product={product} category={category} />

      <main className="min-h-screen bg-background-cream">
        <HeaderSpacer />

        {/* Breadcrumbs */}
        <section className="pt-8 pb-4">
          <Container>
            <nav aria-label="Fil d'Ariane">
              <ol className="flex items-center gap-2 text-sm flex-wrap">
                <li>
                  <Link
                    href="/"
                    className="text-text-muted hover:text-hermes-500 transition-colors"
                  >
                    Accueil
                  </Link>
                </li>
                <ChevronRight
                  className="w-4 h-4 text-text-muted/50"
                  aria-hidden="true"
                />
                <li>
                  <Link
                    href="/categories"
                    className="text-text-muted hover:text-hermes-500 transition-colors"
                  >
                    Collections
                  </Link>
                </li>
                {category && (
                  <>
                    <ChevronRight
                      className="w-4 h-4 text-text-muted/50"
                      aria-hidden="true"
                    />
                    <li>
                      <Link
                        href={`/categories/${category.slug}`}
                        className="text-text-muted hover:text-hermes-500 transition-colors"
                      >
                        {category.name}
                      </Link>
                    </li>
                  </>
                )}
                <ChevronRight
                  className="w-4 h-4 text-text-muted/50"
                  aria-hidden="true"
                />
                <li>
                  <span className="text-text-primary font-medium" aria-current="page">
                    {product.name}
                  </span>
                </li>
              </ol>
            </nav>
          </Container>
        </section>

        {/* Product Details */}
        <section className="py-8 md:py-12">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
              {/* Product Gallery - Left Column */}
              <ProductGallery
                images={product.images}
                productName={product.name}
              />

              {/* Product Info - Right Column */}
              <div className="lg:sticky lg:top-8 lg:self-start">
                {/* Category Badge */}
                {category && (
                  <Link
                    href={`/categories/${category.slug}`}
                    className="inline-block mb-4 text-xs uppercase tracking-luxe text-hermes-500 hover:text-hermes-600 transition-colors"
                  >
                    {category.name}
                  </Link>
                )}

                <ProductInfoWithCart product={product} />

                {/* Full Description */}
                <div className="mt-8 pt-8 border-t border-border">
                  <h2 className="text-sm uppercase tracking-luxe text-text-muted mb-4">
                    Description
                  </h2>
                  <p className="text-text-secondary leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Product Details */}
                <div className="mt-8 pt-8 border-t border-border">
                  <h2 className="text-sm uppercase tracking-luxe text-text-muted mb-4">
                    Détails
                  </h2>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Référence</dt>
                      <dd className="text-text-primary font-medium">
                        {displayReference}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Catégorie</dt>
                      <dd className="text-text-primary font-medium">
                        {category?.name || '-'}
                      </dd>
                    </div>
                    {product.brand && (
                      <div className="flex justify-between">
                        <dt className="text-text-muted">Marque</dt>
                        <dd className="text-text-primary font-medium">
                          {product.brand}
                        </dd>
                      </div>
                    )}
                    {product.collection && (
                      <div className="flex justify-between">
                        <dt className="text-text-muted">Collection</dt>
                        <dd className="text-hermes-500 font-medium">
                          {product.collection}
                        </dd>
                      </div>
                    )}
                    {product.style && (
                      <div className="flex justify-between">
                        <dt className="text-text-muted">Style</dt>
                        <dd className="text-text-primary font-medium">
                          {product.style}
                        </dd>
                      </div>
                    )}
                    {product.materials.length > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-text-muted">Matériaux</dt>
                        <dd className="text-text-primary font-medium text-right">
                          {product.materials.join(', ')}
                        </dd>
                      </div>
                    )}
                    {product.weight && product.weight > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-text-muted">Poids</dt>
                        <dd className="text-text-primary font-medium">
                          {product.weight} {product.weightUnit}
                        </dd>
                      </div>
                    )}
                    {product.origin && (
                      <div className="flex justify-between">
                        <dt className="text-text-muted">Origine</dt>
                        <dd className="text-text-primary font-medium">
                          {product.origin}
                        </dd>
                      </div>
                    )}
                    {product.warranty && product.warranty > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-text-muted">Garantie</dt>
                        <dd className="text-text-primary font-medium">
                          {product.warranty} mois
                        </dd>
                      </div>
                    )}
                    {product.isNew && (
                      <div className="flex justify-between">
                        <dt className="text-text-muted">Nouveauté</dt>
                        <dd className="text-hermes-500 font-medium">
                          ✨ Nouveau
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Shipping & Returns */}
                <div className="mt-8 pt-8 border-t border-border space-y-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-hermes-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <div>
                      <p className="text-text-primary font-medium">
                        Livraison offerte
                      </p>
                      <p className="text-sm text-text-muted">
                        Livraison sécurisée sous 3-5 jours ouvrables
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-hermes-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-text-primary font-medium">
                        Certificat d&apos;authenticité
                      </p>
                      <p className="text-sm text-text-muted">
                        Chaque pièce est accompagnée de son certificat
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-hermes-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <div>
                      <p className="text-text-primary font-medium">
                        Retours sous 30 jours
                      </p>
                      <p className="text-sm text-text-muted">
                        Retour gratuit et remboursement intégral
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-border bg-background-beige">
            <Container>
              <RelatedProducts
                products={relatedProducts}
                title="Vous aimerez aussi"
              />
            </Container>
          </section>
        )}

        {/* Back to Category CTA */}
        {category && (
          <section className="py-12 border-t border-border">
            <Container>
              <div className="text-center">
                <Link
                  href={`/categories/${category.slug}`}
                  className="inline-flex items-center gap-2 text-hermes-500 hover:text-hermes-600 transition-colors text-sm uppercase tracking-luxe"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Retour à la collection {category.name}
                </Link>
              </div>
            </Container>
          </section>
        )}
      </main>
    </>
  );
}
