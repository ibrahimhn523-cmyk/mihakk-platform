'use client'

// ============================================================
// SECTION: TabSubscription — تبويب الاشتراك وسجل المدد
// ============================================================

// ── Sub-section: Types ─────────────────────────────────────────

interface Subscription {
  id:        string
  plan:      string
  starts_at: string
  ends_at:   string
  is_active: boolean
}

interface Props {
  subscriptions: Subscription[]
}

// ── Sub-section: ثوابت العرض ──────────────────────────────────

const PLAN_LABELS: Record<string, string> = {
  trial: 'تجريبية', basic: 'أساسية', advanced: 'متقدمة',
}

const PLAN_STYLES: Record<string, string> = {
  trial:    'bg-blue-50   text-blue-700   ring-1 ring-blue-200',
  basic:    'bg-gray-50   text-gray-700   ring-1 ring-gray-200',
  advanced: 'bg-amber-50  text-amber-700  ring-1 ring-amber-200',
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(iso))
}

function daysDiff(from: string, to: string) {
  return Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / 86400000)
}

function daysRemaining(endsAt: string) {
  const diff = Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86400000)
  return diff
}

// ============================================================
// SECTION: Component
// ============================================================

export default function TabSubscription({ subscriptions }: Props) {
  const active = subscriptions.find((s) => s.is_active)
  const history = subscriptions.filter((s) => !s.is_active)
    .sort((a, b) => new Date(b.ends_at).getTime() - new Date(a.ends_at).getTime())

  return (
    <div className="space-y-6">

      {/* ── الاشتراك الحالي ───────────────────────────────── */}
      {active ? (
        <div className="rounded-2xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-gray-700">الاشتراك الحالي</h3>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              نشط
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-3.5 border border-gray-100">
              <p className="text-[11px] text-gray-400 mb-1">الباقة</p>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PLAN_STYLES[active.plan] ?? 'bg-gray-100 text-gray-600'}`}>
                {PLAN_LABELS[active.plan] ?? active.plan}
              </span>
            </div>
            <div className="rounded-xl bg-white p-3.5 border border-gray-100">
              <p className="text-[11px] text-gray-400 mb-1">تاريخ البداية</p>
              <p className="text-sm font-medium text-gray-800">{formatDate(active.starts_at)}</p>
            </div>
            <div className="rounded-xl bg-white p-3.5 border border-gray-100">
              <p className="text-[11px] text-gray-400 mb-1">تاريخ النهاية</p>
              <p className="text-sm font-medium text-gray-800">{formatDate(active.ends_at)}</p>
            </div>
            <div className="rounded-xl bg-white p-3.5 border border-gray-100">
              <p className="text-[11px] text-gray-400 mb-1">الأيام المتبقية</p>
              {(() => {
                const rem = daysRemaining(active.ends_at)
                return (
                  <p className={`text-sm font-semibold ${rem <= 7 ? 'text-red-600' : rem <= 30 ? 'text-amber-600' : 'text-gray-800'}`}>
                    {rem > 0 ? `${rem} يوم` : 'منتهي'}
                  </p>
                )
              })()}
            </div>
          </div>

          {/* شريط مدة الاشتراك */}
          {(() => {
            const total = daysDiff(active.starts_at, active.ends_at)
            const elapsed = daysDiff(active.starts_at, new Date().toISOString())
            const pct = Math.min(Math.max((elapsed / total) * 100, 0), 100)
            return (
              <div className="mt-4">
                <div className="flex justify-between text-[11px] text-gray-400 mb-1.5">
                  <span>بداية الاشتراك</span>
                  <span>{Math.round(pct)}% مضى</span>
                  <span>نهاية الاشتراك</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: 'var(--color-primary)' }}
                  />
                </div>
              </div>
            )
          })()}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-400">لا يوجد اشتراك نشط حالياً</p>
        </div>
      )}

      {/* ── سجل المدد السابقة ────────────────────────────── */}
      {history.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-3">سجل المدد السابقة</h3>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[11px] uppercase text-gray-400">
                <tr>
                  <th className="px-4 py-3 text-right font-medium">الباقة</th>
                  <th className="px-4 py-3 text-right font-medium">البداية</th>
                  <th className="px-4 py-3 text-right font-medium">النهاية</th>
                  <th className="px-4 py-3 text-right font-medium">المدة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.map((sub) => (
                  <tr key={sub.id} className="bg-white hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PLAN_STYLES[sub.plan] ?? 'bg-gray-100 text-gray-600'}`}>
                        {PLAN_LABELS[sub.plan] ?? sub.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(sub.starts_at)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(sub.ends_at)}</td>
                    <td className="px-4 py-3 text-gray-500">{daysDiff(sub.starts_at, sub.ends_at)} يوم</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}
