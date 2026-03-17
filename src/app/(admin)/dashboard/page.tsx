// ============================================================
// SECTION: Admin Dashboard Page — لوحة تحكم Super Admin
// الوصف: Server Component — يجلب الإحصائيات وآخر المنشآت
//        مباشرة من Supabase بدون client-side fetching
// ============================================================

import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'لوحة التحكم' }

// ── Sub-section: Types ────────────────────────────────────────

interface StatCard {
  label:    string
  value:    number
  sublabel: string
  color:    string
  bg:       string
}

interface RecentTenant {
  id:         string
  name:       string
  subdomain:  string
  status:     string
  created_at: string
}

// ── Sub-section: ترجمة الحالات ────────────────────────────────

const STATUS_MAP: Record<string, { label: string; style: string }> = {
  active:    { label: 'نشطة',     style: 'bg-emerald-50 text-emerald-700' },
  trial:     { label: 'تجريبية', style: 'bg-blue-50 text-blue-700'      },
  suspended: { label: 'موقوفة',  style: 'bg-amber-50 text-amber-700'    },
  expired:   { label: 'منتهية',  style: 'bg-red-50 text-red-600'        },
}

// ── Sub-section: تنسيق التاريخ ────────────────────────────────

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ar-SA', {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  }).format(new Date(iso))
}

// ============================================================
// SECTION: Data Fetching — جلب البيانات
// ============================================================

async function getDashboardData() {
  const supabase = await createClient()

  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  // تنفيذ كل الاستعلامات بالتوازي
  const [
    { count: totalTenants },
    { count: activeTenants },
    { count: trialTenants },
    { count: expiringSubscriptions },
    { data: recentTenants },
  ] = await Promise.all([

    // إجمالي المنشآت
    supabase
      .from('tenants')
      .select('*', { count: 'exact', head: true }),

    // المنشآت النشطة
    supabase
      .from('tenants')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),

    // المنشآت التجريبية
    supabase
      .from('tenants')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'trial'),

    // الاشتراكات المنتهية خلال 30 يوم
    supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .lte('ends_at', thirtyDaysFromNow.toISOString())
      .gte('ends_at', new Date().toISOString()),

    // آخر 5 منشآت
    supabase
      .from('tenants')
      .select('id, name, subdomain, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),

  ])

  return {
    totalTenants:          totalTenants          ?? 0,
    activeTenants:         activeTenants         ?? 0,
    trialTenants:          trialTenants          ?? 0,
    expiringSubscriptions: expiringSubscriptions ?? 0,
    recentTenants:         (recentTenants ?? []) as RecentTenant[],
  }
}

// ============================================================
// SECTION: Page Component
// ============================================================

export default async function DashboardPage() {
  const {
    totalTenants,
    activeTenants,
    trialTenants,
    expiringSubscriptions,
    recentTenants,
  } = await getDashboardData()

  // ── Sub-section: بيانات البطاقات الإحصائية ────────────────

  const stats: StatCard[] = [
    {
      label:    'إجمالي المنشآت',
      value:    totalTenants,
      sublabel: 'منشأة مسجّلة',
      color:    'text-slate-700',
      bg:       'bg-slate-50',
    },
    {
      label:    'المنشآت النشطة',
      value:    activeTenants,
      sublabel: 'اشتراك فعّال',
      color:    'text-emerald-700',
      bg:       'bg-emerald-50',
    },
    {
      label:    'المنشآت التجريبية',
      value:    trialTenants,
      sublabel: 'تجربة مجانية',
      color:    'text-blue-700',
      bg:       'bg-blue-50',
    },
    {
      label:    'اشتراكات قاربت الانتهاء',
      value:    expiringSubscriptions,
      sublabel: 'خلال 30 يوم',
      color:    'text-amber-700',
      bg:       'bg-amber-50',
    },
  ]

  // ============================================================
  // SECTION: Render
  // ============================================================

  return (
    <div className="space-y-7">

      {/* ── البطاقات الإحصائية ───────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition hover:shadow-sm"
          >
            <p className="text-xs font-medium text-gray-500 mb-3">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="mt-1 text-xs text-gray-400">{stat.sublabel}</p>
          </div>
        ))}
      </div>

      {/* ── جدول آخر المنشآت المضافة ─────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-xs">

        {/* رأس الجدول */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-800">آخر المنشآت المضافة</h2>
          <span className="text-xs text-gray-400">أحدث 5 منشآت</span>
        </div>

        {/* الجدول — شاشة كبيرة */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-xs text-gray-400">
                <th className="px-6 py-3 text-right font-medium">المنشأة</th>
                <th className="px-6 py-3 text-right font-medium">الـ Subdomain</th>
                <th className="px-6 py-3 text-right font-medium">الحالة</th>
                <th className="px-6 py-3 text-right font-medium">تاريخ الإنشاء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentTenants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400">
                    لا توجد منشآت بعد
                  </td>
                </tr>
              ) : (
                recentTenants.map((tenant) => {
                  const status = STATUS_MAP[tenant.status] ?? { label: tenant.status, style: 'bg-gray-100 text-gray-600' }
                  return (
                    <tr key={tenant.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold"
                            style={{ backgroundColor: 'var(--color-primary)' }}
                          >
                            {tenant.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800">{tenant.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                        {tenant.subdomain}.mihakk.com
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.style}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {formatDate(tenant.created_at)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* الجدول — جوال (بطاقات) */}
        <div className="md:hidden divide-y divide-gray-50">
          {recentTenants.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-gray-400">لا توجد منشآت بعد</p>
          ) : (
            recentTenants.map((tenant) => {
              const status = STATUS_MAP[tenant.status] ?? { label: tenant.status, style: 'bg-gray-100 text-gray-600' }
              return (
                <div key={tenant.id} className="flex items-center gap-4 px-5 py-4">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    {tenant.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">{tenant.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{tenant.subdomain}.mihakk.com</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${status.style}`}>
                      {status.label}
                    </span>
                    <span className="text-[11px] text-gray-400">{formatDate(tenant.created_at)}</span>
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
