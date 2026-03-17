// ============================================================
// SECTION: Tenants Loading — هيكل تحميل صفحة المنشآت
// ============================================================

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className ?? ''}`} />
}

export default function TenantsLoading() {
  return (
    <div className="space-y-5">

      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      {/* شريط البحث والفلتر */}
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* الجدول */}
      <div className="rounded-2xl border border-gray-100 bg-white">
        <div className="border-b border-gray-100 px-6 py-4">
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="divide-y divide-gray-50">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="hidden md:flex flex-col gap-2 w-32">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="hidden md:block h-6 w-16 rounded-full" />
              <Skeleton className="hidden md:block h-6 w-16 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
