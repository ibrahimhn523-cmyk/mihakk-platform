// ============================================================
// SECTION: Loading Skeleton — سجل العمليات
// ============================================================

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-100 ${className}`} />
}

export default function LogsLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-24 rounded-full" />
        ))}
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 flex gap-6">
          {[60, 80, 100, 80].map((w, i) => (
            <Skeleton key={i} className={`h-3.5 w-${w < 80 ? 16 : w < 100 ? 20 : 24}`} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-4 py-3.5 border-t border-gray-50">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-4 w-36" />
          </div>
        ))}
      </div>
    </div>
  )
}
