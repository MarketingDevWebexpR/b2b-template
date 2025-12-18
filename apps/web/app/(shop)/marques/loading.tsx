import { Container, Skeleton } from '@/components/ui';

/**
 * Loading state for Brands Page
 *
 * Displays skeleton placeholders while the brands data is loading.
 */
export default function BrandsLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-b from-neutral-50 to-white py-12 lg:py-16">
        <Container>
          <div className="text-center">
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-6" />
            <Skeleton className="h-10 w-80 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 mx-auto mb-8" />
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-1" />
                <Skeleton className="h-4 w-12 mx-auto" />
              </div>
              <div className="w-px h-12 bg-neutral-200" />
              <div className="text-center">
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
              <div className="w-px h-12 bg-neutral-200" />
              <div className="text-center">
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
                <Skeleton className="h-4 w-10 mx-auto" />
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Filter bar skeleton */}
      <div className="sticky top-0 z-40 bg-white border-b border-neutral-200 py-4">
        <Container>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 flex-1 max-w-md" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
            <div className="flex gap-1 overflow-hidden">
              <Skeleton className="h-8 w-16 rounded-md" />
              {Array.from({ length: 26 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-8 rounded-md flex-shrink-0" />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </Container>
      </div>

      {/* Grid skeleton */}
      <Container className="py-8 lg:py-12">
        {/* Premium section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-neutral-200 p-6"
              >
                <div className="flex flex-col items-center gap-4">
                  <Skeleton className="h-24 w-24 rounded-2xl" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Letter sections */}
        {['A', 'B', 'C', 'D'].map((letter) => (
          <div key={letter} className="mb-10">
            <div className="flex items-baseline gap-3 mb-4">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-4 w-20" />
              <div className="flex-1 h-px bg-neutral-200" />
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-neutral-200 p-4"
                >
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Container>
    </div>
  );
}
