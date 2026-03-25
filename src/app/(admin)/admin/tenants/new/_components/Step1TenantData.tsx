'use client'

// ============================================================
// SECTION: Step1TenantData — بيانات المنشأة والمالك
// ============================================================

import type { NewTenantPayload } from '../actions'

interface Props {
  data:     NewTenantPayload
  onChange: (field: keyof NewTenantPayload, value: string) => void
  errors:   Partial<Record<keyof NewTenantPayload, string>>
}

// ── Sub-section: مكوّن حقل الإدخال ────────────────────────────

function Field({
  label, required = false, error, children,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ms-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

const inputCls = `
  w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900
  placeholder-gray-400 outline-none transition
  focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/10
`

// ============================================================
// SECTION: Component
// ============================================================

export default function Step1TenantData({ data, onChange, errors }: Props) {
  // التحقق من subdomain: حروف صغيرة وأرقام وشرطة فقط
  function handleSubdomain(val: string) {
    onChange('subdomain', val.toLowerCase().replace(/[^a-z0-9-]/g, ''))
  }

  return (
    <div className="space-y-6">

      {/* ── بيانات المنشأة ───────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          بيانات المنشأة
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">

          <Field label="اسم المنشأة" required error={errors.name}>
            <input
              type="text"
              placeholder="أكاديمية النجوم"
              value={data.name}
              onChange={(e) => onChange('name', e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="الـ Subdomain" required error={errors.subdomain}>
            <div className="relative">
              <input
                type="text"
                placeholder="stars"
                value={data.subdomain}
                onChange={(e) => handleSubdomain(e.target.value)}
                className={`${inputCls} pr-28`}
                dir="ltr"
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-gray-400 select-none">
                .mihakk.com
              </span>
            </div>
            {/* معاينة الرابط */}
            {data.subdomain && (
              <p className="mt-1.5 text-xs text-emerald-600 font-mono">
                ✓ &nbsp;{data.subdomain}.mihakk.com
              </p>
            )}
          </Field>

        </div>
      </div>

      {/* ── بيانات المالك ────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          بيانات المالك
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">

          <Field label="اسم المالك" required error={errors.ownerName}>
            <input
              type="text"
              placeholder="محمد العلي"
              value={data.ownerName}
              onChange={(e) => onChange('ownerName', e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="رقم الجوال" required error={errors.ownerPhone}>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="05XXXXXXXX"
              value={data.ownerPhone}
              onChange={(e) => onChange('ownerPhone', e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="البريد الإلكتروني" error={errors.ownerEmail}>
            <input
              type="email"
              placeholder="name@example.com"
              value={data.ownerEmail}
              onChange={(e) => onChange('ownerEmail', e.target.value)}
              className={`${inputCls} sm:col-span-2`}
              dir="ltr"
            />
          </Field>

        </div>
      </div>

    </div>
  )
}
