// ============================================================
// SECTION: Loading Skeleton — صفحة إدارة المنشأة
// ============================================================

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-100 ${className}`} />
}

export default function TenantDetailLoading() {
  return (
    <div className="space-y-4">

      {/* Header Skeleton */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-4">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3.5 w-36" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
        <div className="flex border-b border-gray-100 px-2 gap-1 pt-1">
          {[80, 100, 90].map((w, i) => (
            <Skeleton key={i} className={`h-10 w-${w < 90 ? 20 : 24} rounded-t-lg`} />
          ))}
        </div>
        <div className="p-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      </div>

    </div>
  )
}
