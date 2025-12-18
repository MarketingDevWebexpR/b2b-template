import { Container, Skeleton } from '@/components/ui';

/**
 * Product Detail Loading State
 *
 * Displays skeleton while the product data is being fetched.
 */
export default function ProductDetailLoading() {
  return (
    <>
      {/* Header spacer */}
      <div className="h-20" />

      <div className="min-h-screen bg-white py-8">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Gallery Skeleton */}
            <div className="space-y-4">
              <Skeleton className="aspect-square rounded-lg" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded-md" />
                ))}
              </div>
            </div>

            {/* Info Skeleton */}
            <div className="space-y-6">
              {/* Breadcrumb */}
              <div className="flex gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>

              {/* Brand */}
              <Skeleton className="h-4 w-24" />

              {/* Title */}
              <Skeleton className="h-10 w-3/4" />

              {/* Reference */}
              <Skeleton className="h-4 w-32" />

              {/* Description */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>

              {/* Price */}
              <Skeleton className="h-12 w-40" />

              {/* Stock */}
              <Skeleton className="h-10 w-full rounded-lg" />

              {/* Quantity */}
              <div className="flex gap-4">
                <Skeleton className="h-12 w-40" />
                <Skeleton className="h-12 flex-1" />
              </div>

              {/* Add to cart */}
              <Skeleton className="h-14 w-full rounded-lg" />

              {/* Secondary buttons */}
              <div className="flex gap-3">
                <Skeleton className="h-12 flex-1 rounded-lg" />
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Related products skeleton */}
          <div className="mt-16 pt-8 border-t border-neutral-200">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-60">
                  <Skeleton className="aspect-square rounded-lg mb-3" />
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
