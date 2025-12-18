import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SearchResultsLive } from '@/components/search/SearchResults';
import { Container, Skeleton } from '@/components/ui';

/**
 * Search Results Page
 *
 * Server Component that handles search query parameters and renders
 * the search results with faceted filters using real Meilisearch API.
 *
 * URL Parameters:
 * - q: Search query
 * - category: Category filter
 * - brand: Brand filter
 * - sort: Sort option (relevance, price_asc, price_desc, newest)
 */

// ============================================================================
// Metadata
// ============================================================================

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    brand?: string;
    sort?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q;

  if (query) {
    return {
      title: `Recherche: "${query}" | WebexpR Pro B2B`,
      description: `Resultats de recherche pour "${query}". Decouvrez notre selection de bijoux professionnels pour les distributeurs B2B.`,
      robots: {
        index: false, // Don't index search results pages
        follow: true,
      },
    };
  }

  return {
    title: 'Recherche | WebexpR Pro B2B',
    description:
      'Recherchez parmi notre catalogue de bijoux professionnels. Filtrez par categorie, marque, prix et disponibilite.',
    robots: {
      index: false,
      follow: true,
    },
  };
}

// ============================================================================
// Loading Component
// ============================================================================

function SearchResultsLoading() {
  return (
    <div className="w-full">
      {/* Header skeleton */}
      <div className="mb-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="flex items-center justify-between py-3 px-4 bg-neutral-50 rounded-lg">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex gap-8">
        {/* Sidebar skeleton */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-5 w-24" />
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Skeleton key={j} className="h-6 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Grid skeleton */}
        <main className="flex-1">
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-neutral-200 overflow-hidden"
              >
                <Skeleton className="aspect-square" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// Page Component
// ============================================================================

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const category = params.category;

  return (
    <>
      {/* Header spacer for fixed header */}
      <div className="h-20" />

      <section className="py-8 min-h-screen bg-white">
        <Container>
          <Suspense fallback={<SearchResultsLoading />}>
            <SearchResultsLive
              initialQuery={query}
              initialCategory={category}
              pageSize={24}
            />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
