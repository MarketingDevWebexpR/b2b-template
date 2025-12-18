import { Container, Skeleton } from '@/components/ui';

/**
 * Loading state for Brand Detail Page
 *
 * Displays skeleton placeholders while the brand data is loading.
 */
export default function BrandLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs skeleton */}
      <div className="bg-neutral-50 border-b border-neutral-100 py-3">
        <Container>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
        </Container>
      </div>

      {/* Hero skeleton */}
      <div className="bg-gradient-to-b from-neutral-50 to-white py-12 lg:py-16 border-b border-neutral-200">
        <Container>
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
            {/* Logo skeleton */}
            <Skeleton className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl flex-shrink-0" />

            {/* Info skeleton */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
                <Skeleton className="h-6 w-32 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>

              {/* Title */}
              <Skeleton className="h-12 w-64 mx-auto lg:mx-0 mb-4" />

              {/* Description */}
              <Skeleton className="h-5 w-full max-w-2xl mb-2" />
              <Skeleton className="h-5 w-3/4 max-w-xl mb-6" />

              {/* Info badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 lg:gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <Skeleton className="h-12 w-48" />
                <Skeleton className="h-12 w-36" />
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Products section skeleton */}
      <Container className="py-8 lg:py-12">
        {/* Section header */}
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-4 bg-neutral-50 rounded-lg border border-neutral-200 mb-6">
          <Skeleton className="h-5 w-24" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>

        {/* Product grid */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
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

        {/* Pagination skeleton */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-10 rounded-lg" />
            ))}
          </div>
        </div>
      </Container>

      {/* Related brands skeleton */}
      <div className="py-12 lg:py-16 bg-neutral-50 border-t border-neutral-200">
        <Container>
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-80 mx-auto" />
          </div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-neutral-200 p-3"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Skeleton className="h-5 w-40 mx-auto" />
          </div>
        </Container>
      </div>
    </div>
  );
}
