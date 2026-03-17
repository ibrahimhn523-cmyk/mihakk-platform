'use client'

// ============================================================
// SECTION: Step2Package — الباقة والمدة والحدود
// ============================================================

import type { NewTenantPayload } from '../actions'

interface Props {
  data:     NewTenantPayload
  onChange: (field: keyof NewTenantPayload, value: string | number) => void
  errors:   Partial<Record<keyof NewTenantPayload, string>>
}

// ── Sub-section: خيارات الباقات ───────────────────────────────

const PLANS = [
  {
    value:    'trial'    as const,
    label:    'تجريبية',
    desc:     'مجانية لفترة محدودة',
    color:    'border-blue-200 bg-blue-50/50',
    active:   'border-blue-500 bg-blue-50 ring-2 ring-blue-200',
    badge:    'bg-blue-100 text-blue-700',
  },
  {
    value:    'basic'    as const,
    label:    'أساسية',
    desc:     'للمنشآت الصغيرة',
    color:    'border-gray-200 bg-gray-50/50',
    active:   'ring-2',
    badge:    'bg-gray-100 text-gray-700',
  },
  {
    value:    'advanced' as const,
    label:    'متقدمة',
    desc:     'كامل المميزات',
    color:    'border-amber-200 bg-amber-50/50',
    active:   'border-amber-500 bg-amber-50 ring-2 ring-amber-200',
    badge:    'bg-amber-100 text-amber-700',
  },
]

const inputCls = `
  w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900
  outline-none transition focus:border-[var(--color-primary)] focus:bg-white
  focus:ring-2 focus:ring-[var(--color-primary)]/10
`

function Field({ label, required = false, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ms-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ============================================================
// SECTION: Component
// ============================================================

export default function Step2Package({ data, onChange, errors }: Props) {
  return (
    <div className="space-y-6">

      {/* ── اختيار الباقة ────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          نوع الباقة
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const selected = data.plan === plan.value
            return (
              <button
                key={plan.value}
                type="button"
                onClick={() => onChange('plan', plan.value)}
                className={`
                  rounded-xl border-2 p-4 text-right transition-all
                  ${selected
                    ? `border-[var(--color-primary)] bg-[var(--color-primary)]/5 ring-2 ring-[var(--color-primary)]/20`
                    : plan.color + ' hover:border-gray-300'}
                `}
              >
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium mb-2 ${plan.badge}`}>
                  {plan.label}
                </span>
                <p className="text-xs text-gray-500">{plan.desc}</p>
              </button>
            )
          })}
        </div>
        {errors.plan && <p className="mt-1 text-xs text-red-500">{errors.plan}</p>}
      </div>

      {/* ── تواريخ الاشتراك ───────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          مدة الاشتراك
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="تاريخ البداية" required error={errors.startsAt}>
            <input
              type="date"
              value={data.startsAt}
              onChange={(e) => onChange('startsAt', e.target.value)}
              className={inputCls}
              dir="ltr"
            />
          </Field>
          <Field label="تاريخ النهاية" required error={errors.endsAt}>
            <input
              type="date"
              value={data.endsAt}
              min={data.startsAt}
              onChange={(e) => onChange('endsAt', e.target.value)}
              className={inputCls}
              dir="ltr"
            />
          </Field>
        </div>
      </div>

      {/* ── حدود الاستخدام ────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          حدود الاستخدام
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="حد الطلاب" required error={errors.maxStudents}>
            <input
              type="number"
              min={1}
              value={data.maxStudents}
              onChange={(e) => onChange('maxStudents', Number(e.target.value))}
              className={inputCls}
              dir="ltr"
            />
          </Field>
          <Field label="حد البرامج" required error={errors.maxPrograms}>
            <input
              type="number"
              min={1}
              value={data.maxPrograms}
              onChange={(e) => onChange('maxPrograms', Number(e.target.value))}
              className={inputCls}
              dir="ltr"
            />
          </Field>
          <Field label="حد المستخدمين" required error={errors.maxUsers}>
            <input
              type="number"
              min={1}
              value={data.maxUsers}
              onChange={(e) => onChange('maxUsers', Number(e.target.value))}
              className={inputCls}
              dir="ltr"
            />
          </Field>
        </div>
      </div>

    </div>
  )
}
