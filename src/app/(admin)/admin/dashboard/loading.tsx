// ============================================================
// SECTION: Dashboard Loading — هيكل التحميل
// الوصف: Skeleton placeholders تظهر أثناء جلب البيانات
// ============================================================

// ── Sub-section: مكوّن Skeleton أساسي ─────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-200 ${className ?? ''}`} />
  )
}

// ============================================================
// SECTION: Component
// ============================================================

export default function DashboardLoading() {
  return (
    <div className="space-y-7">

      {/* ── Skeleton البطاقات الإحصائية ──────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* ── Skeleton الجدول ──────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white">
        <div className="border-b border-gray-100 px-6 py-4">
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="divide-y divide-gray-50">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
