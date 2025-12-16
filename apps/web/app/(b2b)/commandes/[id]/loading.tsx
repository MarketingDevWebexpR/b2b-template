/**
 * Loading state for Order Detail Page
 *
 * Displayed while the order data is being fetched.
 * Uses a skeleton layout matching the order detail structure.
 */
export default function OrderDetailLoading() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-pulse" aria-busy="true" aria-label="Chargement de la commande">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-5 h-5 bg-gray-200 rounded" />
            <div className="w-56 h-8 bg-gray-200 rounded" />
            <div className="w-24 h-6 bg-gray-200 rounded-full" />
          </div>
          <div className="w-72 h-5 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-40 h-10 bg-gray-200 rounded-soft" />
          <div className="w-36 h-10 bg-gray-200 rounded-soft" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tracking section skeleton */}
          <div className="bg-purple-50 rounded-soft border border-purple-200 p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="w-36 h-6 bg-purple-200 rounded" />
                <div className="w-44 h-5 bg-purple-200 rounded" />
                <div className="w-32 h-5 bg-purple-200 rounded" />
              </div>
              <div className="text-right space-y-2">
                <div className="w-24 h-4 bg-purple-200 rounded ml-auto" />
                <div className="w-28 h-5 bg-purple-200 rounded ml-auto" />
              </div>
            </div>
            <div className="w-full h-10 bg-purple-200 rounded-soft mt-4" />
          </div>

          {/* Items section skeleton */}
          <div className="bg-white rounded-soft border border-border-light">
            <div className="p-4 border-b border-border-light">
              <div className="w-32 h-6 bg-gray-200 rounded" />
            </div>
            <div className="divide-y divide-border-light">
              {[1, 2].map((i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-soft" />
                  <div className="flex-1 space-y-2">
                    <div className="w-52 h-5 bg-gray-200 rounded" />
                    <div className="w-24 h-4 bg-gray-200 rounded" />
                    <div className="flex gap-4">
                      <div className="w-20 h-4 bg-gray-200 rounded" />
                      <div className="w-28 h-4 bg-gray-200 rounded" />
                      <div className="w-16 h-4 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="w-24 h-5 bg-gray-200 rounded ml-auto" />
                    <div className="w-12 h-4 bg-gray-200 rounded ml-auto" />
                  </div>
                </div>
              ))}
            </div>
            {/* Totals skeleton */}
            <div className="p-4 border-t border-border-light bg-background-muted space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="w-24 h-4 bg-gray-200 rounded" />
                  <div className="w-20 h-4 bg-gray-200 rounded" />
                </div>
              ))}
              <div className="pt-2 border-t border-border-light flex justify-between">
                <div className="w-20 h-5 bg-gray-200 rounded" />
                <div className="w-32 h-7 bg-gray-200 rounded" />
              </div>
            </div>
          </div>

          {/* History section skeleton */}
          <div className="bg-white rounded-soft border border-border-light p-6 space-y-6">
            <div className="w-48 h-6 bg-gray-200 rounded" />
            <div className="space-y-0">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-gray-200 rounded-full" />
                    {i < 5 && <div className="w-0.5 flex-1 bg-gray-200 my-2" />}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex justify-between">
                      <div className="w-44 h-5 bg-gray-200 rounded" />
                      <div className="w-24 h-4 bg-gray-200 rounded" />
                    </div>
                    <div className="w-28 h-4 bg-gray-200 rounded mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-6">
          {/* Summary section skeleton */}
          <div className="bg-white rounded-soft border border-border-light">
            <div className="p-6 border-b border-border-light">
              <div className="w-24 h-6 bg-gray-200 rounded" />
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="w-24 h-4 bg-gray-200 rounded" />
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="space-y-2">
                    <div className="w-28 h-5 bg-gray-200 rounded" />
                    <div className="w-36 h-4 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-20 h-4 bg-gray-200 rounded" />
                <div className="w-32 h-5 bg-gray-200 rounded" />
                <div className="w-20 h-5 bg-gray-200 rounded-full" />
              </div>
            </div>
          </div>

          {/* Shipping address skeleton */}
          <div className="bg-white rounded-soft border border-border-light p-6 space-y-4">
            <div className="w-40 h-6 bg-gray-200 rounded" />
            <div className="space-y-2">
              <div className="w-40 h-5 bg-gray-200 rounded" />
              <div className="w-48 h-4 bg-gray-200 rounded" />
              <div className="w-36 h-4 bg-gray-200 rounded" />
              <div className="w-28 h-4 bg-gray-200 rounded" />
              <div className="w-20 h-4 bg-gray-200 rounded" />
            </div>
          </div>

          {/* Help section skeleton */}
          <div className="bg-background-muted rounded-soft p-4 space-y-3">
            <div className="w-28 h-5 bg-gray-200 rounded" />
            <div className="w-full h-4 bg-gray-200 rounded" />
            <div className="w-full h-9 bg-gray-200 rounded-soft" />
          </div>
        </div>
      </div>

      {/* Screen reader loading message */}
      <span className="sr-only">Chargement de la commande en cours...</span>
    </div>
  );
}
