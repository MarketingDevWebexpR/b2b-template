/**
 * Loading state for Quote Detail Page
 *
 * Displayed while the quote data is being fetched.
 * Uses a skeleton layout matching the quote detail structure.
 */
export default function QuoteDetailLoading() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-pulse" aria-busy="true" aria-label="Chargement du devis">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-5 h-5 bg-gray-200 rounded" />
            <div className="w-48 h-8 bg-gray-200 rounded" />
            <div className="w-20 h-6 bg-gray-200 rounded-full" />
          </div>
          <div className="w-64 h-5 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-36 h-10 bg-gray-200 rounded-soft" />
          <div className="w-32 h-10 bg-gray-200 rounded-soft" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items section skeleton */}
          <div className="bg-white rounded-soft border border-border-light">
            <div className="p-4 border-b border-border-light">
              <div className="w-40 h-6 bg-gray-200 rounded" />
            </div>
            <div className="divide-y divide-border-light">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-soft" />
                  <div className="flex-1 space-y-2">
                    <div className="w-48 h-5 bg-gray-200 rounded" />
                    <div className="w-24 h-4 bg-gray-200 rounded" />
                    <div className="flex gap-4">
                      <div className="w-20 h-4 bg-gray-200 rounded" />
                      <div className="w-24 h-4 bg-gray-200 rounded" />
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="w-20 h-5 bg-gray-200 rounded ml-auto" />
                    <div className="w-16 h-4 bg-gray-200 rounded ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes section skeleton */}
          <div className="bg-white rounded-soft border border-border-light p-6 space-y-4">
            <div className="w-24 h-6 bg-gray-200 rounded" />
            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-200 rounded" />
              <div className="w-3/4 h-4 bg-gray-200 rounded" />
            </div>
          </div>

          {/* History section skeleton */}
          <div className="bg-white rounded-soft border border-border-light p-6 space-y-4">
            <div className="w-32 h-6 bg-gray-200 rounded" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-gray-200 rounded-full" />
                    {i < 3 && <div className="w-0.5 flex-1 bg-gray-200 mt-2" />}
                  </div>
                  <div className="flex-1 space-y-2 pb-4">
                    <div className="w-48 h-5 bg-gray-200 rounded" />
                    <div className="w-32 h-4 bg-gray-200 rounded" />
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
              <div className="w-32 h-6 bg-gray-200 rounded" />
            </div>
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="w-24 h-4 bg-gray-200 rounded" />
                  <div className="w-20 h-4 bg-gray-200 rounded" />
                </div>
              ))}
              <div className="pt-3 border-t border-border-light flex justify-between">
                <div className="w-20 h-5 bg-gray-200 rounded" />
                <div className="w-28 h-7 bg-gray-200 rounded" />
              </div>
            </div>
          </div>

          {/* Requester section skeleton */}
          <div className="bg-white rounded-soft border border-border-light p-6 space-y-4">
            <div className="w-28 h-6 bg-gray-200 rounded" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="space-y-2">
                <div className="w-32 h-5 bg-gray-200 rounded" />
                <div className="w-40 h-4 bg-gray-200 rounded" />
              </div>
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
      <span className="sr-only">Chargement du devis en cours...</span>
    </div>
  );
}
