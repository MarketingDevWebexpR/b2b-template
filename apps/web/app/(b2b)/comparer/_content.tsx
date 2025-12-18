'use client';


/**
 * Comparer Page - Dedicated Product Comparison Page
 *
 * B2B dedicated page for product comparison:
 * - Shareable URL with product IDs
 * - Full-page comparison table
 * - Breadcrumb navigation
 * - Empty state when no products
 *
 * @example URL: /comparer?ids=prod_001,prod_002,prod_003
 *
 * @packageDocumentation
 */

import { useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useComparisonFeatures } from '@/contexts/FeatureContext';
import {
  ComparisonTable,
  useComparison,
  MAX_COMPARISON_ITEMS,
} from '@/components/products/ProductComparison';
import { EmptyState } from '@/components/b2b';
import type { Product } from '@/types';

// Mock function to fetch products by IDs - replace with actual API call
async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  // In production, this would be an API call
  // For now, we'll return mock data for demonstration

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Mock products - replace with actual API call
  const mockProducts: Record<string, Product> = {
    'prod_001': {
      id: 'prod_001',
      reference: 'ABC-123',
      name: 'Bracelet Or 18K - Maille Figaro',
      nameEn: 'Gold 18K Bracelet - Figaro Link',
      slug: 'bracelet-or-18k-maille-figaro',
      description: 'Bracelet en or 18 carats avec maille figaro.',
      shortDescription: 'Bracelet or 18K maille figaro',
      price: 450,
      isPriceTTC: false,
      images: ['/images/products/bracelet-1.jpg'],
      categoryId: 'cat_bracelets',
      materials: ['Or 18K'],
      weight: 12.5,
      weightUnit: 'g',
      brand: 'WebexpR Pro',
      origin: 'France',
      warranty: 24,
      stock: 152,
      isAvailable: true,
      featured: true,
      isNew: false,
      collection: 'Automne/Hiver',
      style: 'Classique',
      createdAt: '2024-01-15T10:00:00Z',
    },
    'prod_002': {
      id: 'prod_002',
      reference: 'DEF-456',
      name: 'Collier Argent 925 - Maille Serpent',
      nameEn: 'Silver 925 Necklace - Snake Chain',
      slug: 'collier-argent-925-maille-serpent',
      description: 'Collier en argent 925 avec maille serpent.',
      shortDescription: 'Collier argent 925 serpent',
      price: 185,
      isPriceTTC: false,
      images: ['/images/products/collier-1.jpg'],
      categoryId: 'cat_colliers',
      materials: ['Argent 925'],
      weight: 8.2,
      weightUnit: 'g',
      brand: 'Silver Line',
      origin: 'Italie',
      warranty: 12,
      stock: 89,
      isAvailable: true,
      featured: false,
      isNew: true,
      collection: 'Printemps/Ete',
      style: 'Moderne',
      createdAt: '2024-02-20T14:30:00Z',
    },
    'prod_003': {
      id: 'prod_003',
      reference: 'GHI-789',
      name: 'Bague Or Rose 14K - Solitaire',
      nameEn: 'Rose Gold 14K Ring - Solitaire',
      slug: 'bague-or-rose-14k-solitaire',
      description: 'Bague solitaire en or rose 14 carats.',
      shortDescription: 'Bague or rose solitaire',
      price: 680,
      isPriceTTC: false,
      images: ['/images/products/bague-1.jpg'],
      categoryId: 'cat_bagues',
      materials: ['Or Rose 14K', 'Diamant'],
      weight: 3.8,
      weightUnit: 'g',
      brand: 'Rose Collection',
      origin: 'Belgique',
      warranty: 36,
      stock: 23,
      isAvailable: true,
      featured: true,
      isNew: false,
      collection: 'Mariage',
      style: 'Romantique',
      createdAt: '2024-01-05T09:00:00Z',
    },
    'prod_004': {
      id: 'prod_004',
      reference: 'JKL-012',
      name: 'Boucles Or Blanc 18K - Perles',
      nameEn: 'White Gold 18K Earrings - Pearls',
      slug: 'boucles-or-blanc-18k-perles',
      description: 'Boucles en or blanc 18K avec perles.',
      shortDescription: 'Boucles or blanc perles',
      price: 520,
      isPriceTTC: false,
      images: ['/images/products/boucles-1.jpg'],
      categoryId: 'cat_boucles',
      materials: ['Or Blanc 18K', 'Perles'],
      weight: 5.4,
      weightUnit: 'g',
      brand: 'Pearl Luxury',
      origin: 'Japon',
      warranty: 24,
      stock: 45,
      isAvailable: true,
      featured: false,
      isNew: true,
      collection: 'Ceremonie',
      style: 'Classique',
      createdAt: '2024-03-01T11:00:00Z',
    },
  };

  return ids
    .filter((id) => mockProducts[id])
    .map((id) => mockProducts[id]);
}

function ComparerPageContent() {
  const searchParams = useSearchParams();
  const { products: contextProducts, clearComparison } = useComparison();

  // Feature flags
  const { isEnabled: hasComparison } = useComparisonFeatures();

  // State for URL-loaded products - MUST be before any early return (React Hooks rules)
  const [urlProducts, setUrlProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get IDs from URL
  const urlIds = useMemo(() => {
    const idsParam = searchParams.get('ids');
    if (!idsParam) return [];
    return idsParam.split(',').slice(0, MAX_COMPARISON_ITEMS);
  }, [searchParams]);

  // Determine which products to show
  const products = urlIds.length > 0 ? urlProducts : contextProducts;

  // Fetch products from URL if IDs are provided
  useEffect(() => {
    if (urlIds.length === 0) {
      setUrlProducts([]);
      return;
    }

    let isMounted = true;

    async function loadProducts() {
      setIsLoading(true);
      setError(null);

      try {
        const fetchedProducts = await fetchProductsByIds(urlIds);
        if (isMounted) {
          setUrlProducts(fetchedProducts);
        }
      } catch (err) {
        if (isMounted) {
          setError('Erreur lors du chargement des produits');
          console.error('Error fetching products:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [urlIds]);

  // Generate shareable URL
  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined' || products.length === 0) return '';
    const ids = products.map((p) => p.id).join(',');
    return `${window.location.origin}/comparer?ids=${ids}`;
  }, [products]);

  // Copy share URL to clipboard
  const handleCopyShareUrl = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      // Could show a toast notification here
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  }, [shareUrl]);

  // Module disabled - show message (after ALL hooks per React rules)
  if (!hasComparison) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <EmptyState
          icon="document"
          message="Module comparaison desactive"
          description="La fonctionnalite de comparaison de produits n'est pas disponible pour votre compte."
          action={{ label: 'Retour aux produits', href: '/produits' }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-content-wide mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-xs">
              <li>
                <Link
                  href="/tableau-de-bord"
                  className="text-neutral-500 hover:text-accent transition-colors"
                >
                  Accueil
                </Link>
              </li>
              <li aria-hidden="true" className="text-neutral-500">
                /
              </li>
              <li>
                <Link
                  href="/produits"
                  className="text-neutral-500 hover:text-accent transition-colors"
                >
                  Produits
                </Link>
              </li>
              <li aria-hidden="true" className="text-neutral-500">
                /
              </li>
              <li>
                <span className="text-neutral-900 font-medium">
                  Comparaison
                </span>
              </li>
            </ol>
          </nav>

          {/* Title and actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">
                Comparaison de produits
              </h1>
              <p className="mt-1 text-sm text-neutral-600">
                {products.length > 0
                  ? `${products.length} produit${products.length > 1 ? 's' : ''} selectionne${products.length > 1 ? 's' : ''}`
                  : 'Aucun produit selectionne'}
              </p>
            </div>

            {products.length > 0 && (
              <div className="flex items-center gap-3">
                {/* Share button */}
                <button
                  type="button"
                  onClick={handleCopyShareUrl}
                  className={cn(
                    'inline-flex items-center gap-2',
                    'px-4 py-2.5',
                    'text-sm font-medium',
                    'text-neutral-600',
                    'bg-white',
                    'border border-neutral-200',
                    'rounded-lg',
                    'hover:bg-neutral-100 hover:text-accent',
                    'transition-colors duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                  )}
                  title="Copier le lien de partage"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Partager</span>
                </button>

                {/* Clear button */}
                {urlIds.length === 0 && (
                  <button
                    type="button"
                    onClick={clearComparison}
                    className={cn(
                      'inline-flex items-center gap-2',
                      'px-4 py-2.5',
                      'text-sm font-medium',
                      'text-red-600',
                      'bg-white',
                      'border border-red-200',
                      'rounded-lg',
                      'hover:bg-red-50',
                      'transition-colors duration-200',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500'
                    )}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span className="hidden sm:inline">Effacer tout</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-content-wide mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <svg
              className="w-12 h-12 text-accent animate-spin mb-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-sm text-neutral-600">
              Chargement des produits...
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div
            className={cn(
              'flex flex-col items-center justify-center',
              'py-16 px-4',
              'text-center'
            )}
          >
            <svg
              className="w-16 h-16 text-red-600 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-sm text-neutral-600 max-w-md mb-6">
              {error}
            </p>
            <Link
              href="/produits"
              className={cn(
                'inline-flex items-center gap-2',
                'px-5 py-2.5',
                'bg-accent text-white',
                'text-sm font-medium',
                'rounded-lg',
                'hover:bg-orange-600',
                'transition-colors duration-200'
              )}
            >
              Retour aux produits
            </Link>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && products.length === 0 && (
          <div
            className={cn(
              'flex flex-col items-center justify-center',
              'py-16 px-4',
              'text-center',
              'bg-white',
              'rounded-xl',
              'border border-neutral-200'
            )}
          >
            <svg
              className="w-20 h-20 text-neutral-500 mb-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h2 className="text-lg font-medium text-neutral-900 mb-2">
              Aucun produit a comparer
            </h2>
            <p className="text-sm text-neutral-600 max-w-md mb-6">
              Selectionnez des produits a comparer en cliquant sur le bouton
              &quot;Comparer&quot; sur les fiches produits. Vous pouvez comparer
              jusqu&apos;a {MAX_COMPARISON_ITEMS} produits.
            </p>
            <Link
              href="/produits"
              className={cn(
                'inline-flex items-center gap-2',
                'px-5 py-2.5',
                'bg-accent text-white',
                'text-sm font-medium',
                'rounded-lg',
                'hover:bg-orange-600',
                'transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
              )}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Parcourir les produits
            </Link>
          </div>
        )}

        {/* Minimum products warning */}
        {!isLoading && !error && products.length === 1 && (
          <div
            className={cn(
              'flex flex-col items-center justify-center',
              'py-16 px-4',
              'text-center',
              'bg-white',
              'rounded-xl',
              'border border-neutral-200'
            )}
          >
            <svg
              className="w-16 h-16 text-amber-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-lg font-medium text-neutral-900 mb-2">
              Ajoutez un autre produit
            </h2>
            <p className="text-sm text-neutral-600 max-w-md mb-6">
              Selectionnez au moins 2 produits pour afficher le tableau
              comparatif.
            </p>
            <Link
              href="/produits"
              className={cn(
                'inline-flex items-center gap-2',
                'px-5 py-2.5',
                'bg-accent text-white',
                'text-sm font-medium',
                'rounded-lg',
                'hover:bg-orange-600',
                'transition-colors duration-200'
              )}
            >
              Ajouter des produits
            </Link>
          </div>
        )}

        {/* Comparison table */}
        {!isLoading && !error && products.length >= 2 && (
          <div
            className={cn(
              'bg-white',
              'rounded-xl',
              'border border-neutral-200',
              'overflow-hidden'
            )}
          >
            <ComparisonTable
              products={products}
              showRemoveButton={urlIds.length === 0}
              showAddToCart={true}
              highlightBest={true}
            />
          </div>
        )}

        {/* Tips section */}
        {!isLoading && !error && products.length >= 2 && (
          <div
            className={cn(
              'mt-6',
              'p-4',
              'bg-green-50',
              'border border-green-200',
              'rounded-lg',
              'flex items-start gap-3'
            )}
          >
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-600-700">
                Astuce
              </p>
              <p className="mt-1 text-xs text-green-600-600">
                Les meilleures valeurs sont mises en evidence en vert. Vous
                pouvez partager cette comparaison avec vos collegues en copiant
                le lien.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ComparerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-pulse text-neutral-500">Chargement...</div>
      </div>
    }>
      <ComparerPageContent />
    </Suspense>
  );
}
