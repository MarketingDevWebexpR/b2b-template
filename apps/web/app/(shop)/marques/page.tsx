import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Container, Skeleton } from '@/components/ui';
import { BrandsPageClient } from './BrandsPageClient';
import { getServerBrands } from '@/lib/brands/server';

/**
 * Brands Listing Page
 *
 * Server Component that displays all partner brands.
 * Features:
 * - Hero section with title
 * - Alphabetical filters (A-Z)
 * - Premium/featured brands section
 * - Brands grouped by letter
 * - Search functionality
 * - SEO optimized
 *
 * Uses Server Components with Suspense for optimal performance.
 */

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'Nos Marques Partenaires | WebexpR Pro B2B',
  description:
    'Decouvrez notre selection de marques partenaires de bijoux professionnels. Plus de 120 marques de confiance pour les professionnels B2B.',
  openGraph: {
    title: 'Nos Marques Partenaires | WebexpR Pro B2B',
    description:
      'Decouvrez notre selection de marques partenaires de bijoux professionnels.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/marques',
  },
};

// ============================================================================
// Loading Component
// ============================================================================

function BrandsPageLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-b from-neutral-50 to-white py-12 lg:py-16">
        <Container>
          <div className="text-center">
            <Skeleton className="h-10 w-80 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
        </Container>
      </div>

      {/* Filter bar skeleton */}
      <div className="sticky top-0 z-40 bg-white border-b border-neutral-200 py-4">
        <Container>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1 max-w-md" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 27 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-8 rounded-md" />
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* Grid skeleton */}
      <Container className="py-8">
        {/* Premium section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Letter sections */}
        {['A', 'B', 'C'].map((letter) => (
          <div key={letter} className="mb-10">
            <div className="flex items-baseline gap-3 mb-4">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-4 w-20" />
              <div className="flex-1 h-px bg-neutral-200" />
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </Container>
    </div>
  );
}

// ============================================================================
// Data Fetching
// ============================================================================

async function getBrandsData() {
  try {
    const brandsResponse = await getServerBrands();
    return brandsResponse;
  } catch (error) {
    console.error('Failed to fetch brands:', error);
    return {
      brands: [],
      total: 0,
      premium: [],
      byLetter: {},
    };
  }
}

// ============================================================================
// Page Component
// ============================================================================

export default async function BrandsPage() {
  const brandsData = await getBrandsData();

  // Get unique countries for filter
  const countries = [
    ...new Set(brandsData.brands.map((b) => b.country).filter(Boolean)),
  ] as string[];

  return (
    <Suspense fallback={<BrandsPageLoading />}>
      <BrandsPageClient
          initialBrands={brandsData.brands}
          initialByLetter={brandsData.byLetter}
          initialPremium={brandsData.premium}
          initialTotal={brandsData.total}
          countries={countries}
        />
    </Suspense>
  );
}
