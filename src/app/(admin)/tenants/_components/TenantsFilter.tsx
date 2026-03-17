'use client'

// ============================================================
// SECTION: TenantsFilter — شريط البحث وفلتر الحالة
// الوصف: Client Component — يحدّث URL params ويعيد تشغيل الـ page
// ============================================================

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useTransition }              from 'react'
import Link from 'next/link'

// ── Sub-section: خيارات الفلتر ────────────────────────────────

const STATUS_OPTIONS = [
  { value: '',          label: 'كل الحالات' },
  { value: 'active',    label: 'نشطة'       },
  { value: 'trial',     label: 'تجريبية'    },
  { value: 'suspended', label: 'موقوفة'     },
  { value: 'expired',   label: 'منتهية'     },
]

// ============================================================
// SECTION: Component
// ============================================================

export default function TenantsFilter() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  const q      = searchParams.get('q')      ?? ''
  const status = searchParams.get('status') ?? ''

  // ── Sub-section: تحديث URL params ─────────────────────────

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`)
      })
    },
    [router, pathname, searchParams]
  )

  // ============================================================
  // SECTION: Render
  // ============================================================

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

      {/* ── البحث + الفلتر ───────────────────────────────────── */}
      <div className="flex flex-1 gap-3">

        {/* حقل البحث */}
        <div className="relative flex-1">
          <span className="absolute top-1/2 end-3 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
            🔍
          </span>
          <input
            type="search"
            placeholder="ابحث بالاسم أو الـ subdomain…"
            defaultValue={q}
            onChange={(e) => updateParam('q', e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pe-9 ps-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
          />
        </div>

        {/* فلتر الحالة */}
        <select
          value={status}
          onChange={(e) => updateParam('status', e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

      </div>

      {/* ── زر إضافة منشأة ───────────────────────────────────── */}
      <Link
        href="/admin/tenants/new"
        className="inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <span className="text-base leading-none">+</span>
        إضافة منشأة
      </Link>

      {/* مؤشر تحميل أثناء التنقل */}
      {pending && (
        <span className="text-xs text-gray-400 animate-pulse">جارٍ البحث…</span>
      )}

    </div>
  )
}
