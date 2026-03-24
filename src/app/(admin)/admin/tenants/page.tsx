// ============================================================
// SECTION: Tenants Page — صفحة إدارة المنشآت
// الوصف: Server Component — يقرأ searchParams ويجلب البيانات
//        مع JOIN بين tenants و tenant_owners و subscriptions
// ============================================================

import { Suspense }    from 'react'
import Link            from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TenantsFilter   from './_components/TenantsFilter'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'المنشآت' }

// ── Sub-section: Types ────────────────────────────────────────

interface TenantOwnerRow {
  full_name: string
  phone:     string
}

interface SubscriptionRow {
  plan:      string
  ends_at:   string
  is_active: boolean
}

interface TenantRow {
  id:            string
  name:          string
  subdomain:     string
  status:        string
  created_at:    string
  tenant_owners: TenantOwnerRow[]
  subscriptions: SubscriptionRow[]
}

// ── Sub-section: ثوابت العرض ──────────────────────────────────

const STATUS_MAP: Record<string, { label: string; style: string }> = {
  active:    { label: 'نشطة',    style: 'bg-emerald-50 text-emerald-700' },
  trial:     { label: 'تجريبية', style: 'bg-blue-50    text-blue-700'    },
  suspended: { label: 'موقوفة',  style: 'bg-amber-50   text-amber-700'   },
  expired:   { label: 'منتهية',  style: 'bg-red-50     text-red-600'     },
}

const PLAN_MAP: Record<string, string> = {
  trial:    'تجريبية',
  basic:    'أساسية',
  advanced: 'متقدمة',
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(iso))
}

// ============================================================
// SECTION: Data Fetching
// ============================================================

async function getTenants(q: string, status: string): Promise<TenantRow[]> {
  const supabase = await createClient()

  let query = supabase
    .from('tenants')
    .select(`
      id, name, subdomain, status, created_at,
      tenant_owners ( full_name, phone ),
      subscriptions ( plan, ends_at, is_active )
    `)
    .order('created_at', { ascending: false })

  // فلتر الحالة
  if (status) {
    query = query.eq('status', status)
  }

  // فلتر البحث — اسم المنشأة أو الـ subdomain
  if (q) {
    query = query.or(`name.ilike.%${q}%,subdomain.ilike.%${q}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('[tenants] خطأ في جلب المنشآت:', error.message)
    return []
  }

  return (data ?? []) as TenantRow[]
}

// ── Sub-section: استخراج آخر اشتراك نشط ───────────────────────

function getActiveSubscription(subs: SubscriptionRow[]): SubscriptionRow | null {
  const active = subs
    .filter((s) => s.is_active)
    .sort((a, b) => new Date(b.ends_at).getTime() - new Date(a.ends_at).getTime())
  return active[0] ?? null
}

// ============================================================
// SECTION: Page Component
// ============================================================

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string }>
}

export default async function TenantsPage({ searchParams }: PageProps) {
  const { q = '', status = '' } = await searchParams
  const tenants = await getTenants(q, status)

  return (
    <div className="space-y-5">

      {/* ── رأس الصفحة ───────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">المنشآت</h2>
          <p className="text-xs text-gray-400 mt-0.5">{tenants.length} منشأة</p>
        </div>
      </div>

      {/* ── شريط البحث والفلتر ───────────────────────────────── */}
      <Suspense>
        <TenantsFilter />
      </Suspense>

      {/* ── الجدول ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-xs">

        {/* ── شاشة كبيرة: جدول كامل ───────────────────────── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400">
                <th className="px-6 py-3 text-right font-medium">المنشأة</th>
                <th className="px-6 py-3 text-right font-medium">المالك</th>
                <th className="px-6 py-3 text-right font-medium">الباقة</th>
                <th className="px-6 py-3 text-right font-medium">انتهاء الاشتراك</th>
                <th className="px-6 py-3 text-right font-medium">الحالة</th>
                <th className="px-6 py-3 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">

              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState q={q} status={status} />
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => {
                  const owner = tenant.tenant_owners[0] ?? null
                  const sub   = getActiveSubscription(tenant.subscriptions)
                  const st    = STATUS_MAP[tenant.status] ?? { label: tenant.status, style: 'bg-gray-100 text-gray-600' }

                  return (
                    <tr key={tenant.id} className="hover:bg-gray-50/50 transition-colors">

                      {/* المنشأة */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold"
                            style={{ backgroundColor: 'var(--color-primary)' }}
                          >
                            {tenant.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{tenant.name}</p>
                            <p className="text-xs text-gray-400 font-mono">
                              {tenant.subdomain}.mihakk.com
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* المالك */}
                      <td className="px-6 py-4">
                        {owner ? (
                          <div>
                            <p className="text-gray-700">{owner.full_name}</p>
                            <p className="text-xs text-gray-400 font-mono">{owner.phone}</p>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>

                      {/* الباقة */}
                      <td className="px-6 py-4">
                        {sub ? (
                          <span className="text-gray-700">
                            {PLAN_MAP[sub.plan] ?? sub.plan}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>

                      {/* انتهاء الاشتراك */}
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {sub ? formatDate(sub.ends_at) : <span className="text-gray-300">—</span>}
                      </td>

                      {/* الحالة */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${st.style}`}>
                          {st.label}
                        </span>
                      </td>

                      {/* زر الإدارة */}
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/tenants/${tenant.id}`}
                          className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                        >
                          إدارة
                        </Link>
                      </td>

                    </tr>
                  )
                })
              )}

            </tbody>
          </table>
        </div>

        {/* ── جوال: بطاقات ─────────────────────────────────── */}
        <div className="md:hidden divide-y divide-gray-50">
          {tenants.length === 0 ? (
            <EmptyState q={q} status={status} />
          ) : (
            tenants.map((tenant) => {
              const owner = tenant.tenant_owners[0] ?? null
              const sub   = getActiveSubscription(tenant.subscriptions)
              const st    = STATUS_MAP[tenant.status] ?? { label: tenant.status, style: 'bg-gray-100 text-gray-600' }

              return (
                <div key={tenant.id} className="px-5 py-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      {tenant.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{tenant.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{tenant.subdomain}.mihakk.com</p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${st.style}`}>
                      {st.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div>
                      {owner && <span>{owner.full_name} · {owner.phone}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {sub && (
                        <span className="text-gray-400">
                          {PLAN_MAP[sub.plan] ?? sub.plan} · {formatDate(sub.ends_at)}
                        </span>
                      )}
                      <Link
                        href={`/admin/tenants/${tenant.id}`}
                        className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                      >
                        إدارة
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}

// ============================================================
// SECTION: EmptyState — حالة الجدول الفارغ
// ============================================================

function EmptyState({ q, status }: { q: string; status: string }) {
  const isFiltered = q || status

  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <span className="text-4xl mb-3">🏢</span>
      <p className="text-sm font-medium text-gray-600">
        {isFiltered ? 'لا توجد نتائج مطابقة' : 'لا توجد منشآت بعد'}
      </p>
      <p className="text-xs text-gray-400 mt-1">
        {isFiltered
          ? 'جرّب تعديل معايير البحث أو الفلتر'
          : 'ابدأ بإضافة أول منشأة على المنصة'}
      </p>
      {!isFiltered && (
        <Link
          href="/admin/tenants/new"
          className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          + إضافة منشأة
        </Link>
      )}
    </div>
  )
}
