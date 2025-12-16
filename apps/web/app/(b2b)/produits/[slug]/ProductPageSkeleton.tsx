'use client';

/**
 * ProductPageSkeleton - Loading State for Product Page
 *
 * Displays a skeleton UI while the product page is loading.
 * Matches the layout of the actual product page for smooth transitions.
 *
 * @packageDocumentation
 */

import { cn } from '@/lib/utils';
import { Container } from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/Skeleton';

export function ProductPageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <Container className="py-6 md:py-8">
        {/* Main Product Section */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Gallery Skeleton */}
            <div className="space-y-4">
              {/* Main Image */}
              <Skeleton className="aspect-square w-full rounded-lg" />

              {/* Thumbnails */}
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded-md flex-shrink-0" />
                ))}
              </div>
            </div>

            {/* Right Column - Info Skeleton */}
            <div className="space-y-6">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>

              {/* Badges */}
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>

              {/* Brand */}
              <Skeleton className="h-4 w-32" />

              {/* Product Name */}
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-8 w-1/2" />

              {/* Reference */}
              <div className="flex gap-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-36" />
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>

              {/* Pricing Section */}
              <div className="pt-4 border-t border-neutral-200 space-y-4">
                {/* Price Source */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex items-baseline gap-3">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>

                {/* Volume Tiers */}
                <div className="pt-4 border-t border-neutral-200 space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <div className="grid gap-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-14 w-full rounded-lg" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Variants Section */}
              <div className="pt-4 border-t border-neutral-200 space-y-4">
                {/* Size Attribute */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-24 rounded-lg" />
                    ))}
                  </div>
                </div>

                {/* Color Attribute */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex gap-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="w-10 h-10 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="pt-4 border-t border-neutral-200 space-y-4">
                {/* Stock Banner */}
                <Skeleton className="h-12 w-full rounded-lg" />

                {/* Quantity Selector */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-40 rounded-lg" />
                    <div className="flex-1 text-right space-y-1">
                      <Skeleton className="h-4 w-12 ml-auto" />
                      <Skeleton className="h-6 w-24 ml-auto" />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <Skeleton className="h-14 w-full rounded-lg" />
                <div className="flex gap-3">
                  <Skeleton className="h-12 flex-1 rounded-lg" />
                  <Skeleton className="h-12 w-12 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="mb-12">
          {/* Tab Navigation */}
          <div className="border-b border-neutral-200 mb-6">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-32" />
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </section>

        {/* Related Products Section */}
        <section className="py-8">
          <Skeleton className="h-7 w-48 mb-6" />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-[240px]">
                <Skeleton className="aspect-square w-full rounded-lg mb-3" />
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}

export default ProductPageSkeleton;
