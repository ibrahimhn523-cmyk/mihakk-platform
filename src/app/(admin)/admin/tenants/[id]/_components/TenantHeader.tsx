'use client'

// ============================================================
// SECTION: TenantHeader — رأس صفحة إدارة المنشأة
// الوصف: معلومات المنشأة + المالك + أزرار الإجراءات
// ============================================================

import { useState }           from 'react'
import Link                   from 'next/link'
import { updateTenantStatus, type TenantStatus } from '../actions'

// ── Sub-section: Types ─────────────────────────────────────────

interface TenantHeaderProps {
  tenant: {
    id:         string
    name:       string
    subdomain:  string
    status:     TenantStatus
  }
  owner: {
    full_name: string
    phone:     string
  } | null
  subscription: {
    plan:      string
    starts_at: string
    ends_at:   string
  } | null
}

// ── Sub-section: ثوابت العرض ──────────────────────────────────

const STATUS_LABELS: Record<TenantStatus, string> = {
  active:    'نشطة',
  trial:     'تجريبية',
  suspended: 'موقوفة',
  expired:   'منتهية',
}

const STATUS_STYLES: Record<TenantStatus, string> = {
  active:    'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  trial:     'bg-blue-100    text-blue-700    ring-1 ring-blue-200',
  suspended: 'bg-amber-100   text-amber-700   ring-1 ring-amber-200',
  expired:   'bg-red-100     text-red-600     ring-1 ring-red-200',
}

// الإجراءات المتاحة حسب الحالة الحالية
const STATUS_ACTIONS: Record<TenantStatus, { label: string; next: TenantStatus }[]> = {
  active:    [{ label: 'تعليق المنشأة', next: 'suspended' }],
  trial:     [{ label: 'تفعيل المنشأة', next: 'active'    },
              { label: 'تعليق المنشأة', next: 'suspended' }],
  suspended: [{ label: 'إعادة التفعيل', next: 'active'    }],
  expired:   [{ label: 'إعادة التفعيل', next: 'active'    }],
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
    .format(new Date(iso))
}

// ============================================================
// SECTION: Component
// ============================================================

export default function TenantHeader({ tenant, owner, subscription }: TenantHeaderProps) {
  const [status,   setStatus]   = useState<TenantStatus>(tenant.status)
  const [loading,  setLoading]  = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  async function handleStatusChange(next: TenantStatus) {
    setShowMenu(false)
    setLoading(true)
    const result = await updateTenantStatus(tenant.id, next)
    if (!result.error) setStatus(next)
    setLoading(false)
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        {/* ── معلومات المنشأة ─────────────────────────────── */}
        <div className="flex items-start gap-4">
          {/* أيقونة المنشأة */}
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white text-lg font-bold"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {tenant.name.charAt(0)}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-lg font-semibold text-gray-900">{tenant.name}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
                {STATUS_LABELS[status]}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-mono mb-2">
              {tenant.subdomain}.mihakk.com
            </p>

            {/* بيانات المالك والاشتراك */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
              {owner && (
                <>
                  <span>👤 {owner.full_name}</span>
                  <span>📱 {owner.phone}</span>
                </>
              )}
              {subscription && (
                <>
                  <span>📅 من {formatDate(subscription.starts_at)}</span>
                  <span>⏳ حتى {formatDate(subscription.ends_at)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── أزرار الإجراءات ──────────────────────────────── */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/admin/tenants/${tenant.id}/edit`}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            تعديل المنشأة
          </Link>

          {/* قائمة تغيير الحالة */}
          <div className="relative">
            <button
              onClick={() => setShowMenu((v) => !v)}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: status === 'suspended' ? '#10b981' : '#f59e0b' }}
            >
              {loading
                ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : '⚡'}
              تغيير الحالة
            </button>

            {showMenu && (
              <div className="absolute start-0 top-full mt-1.5 z-10 min-w-[160px] rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                {STATUS_ACTIONS[status].map((action) => (
                  <button
                    key={action.next}
                    onClick={() => handleStatusChange(action.next)}
                    className="block w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
