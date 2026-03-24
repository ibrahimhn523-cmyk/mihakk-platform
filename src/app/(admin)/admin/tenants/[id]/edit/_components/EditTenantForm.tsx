'use client'

// ============================================================
// SECTION: EditTenantForm — نموذج تعديل المنشأة
// الوصف: Client Component للتحقق من المدخلات وإرسال التعديلات
// ============================================================

import { useState }        from 'react'
import { useRouter }       from 'next/navigation'
import { updateTenant, type EditTenantPayload } from '../actions'

// ── Sub-section: Types ─────────────────────────────────────────

interface InitialData {
  tenantId:    string
  name:        string
  subdomain:   string
  createdAt:   string
  ownerName:   string
  ownerPhone:  string
  ownerEmail:  string
  maxStudents: number
  maxPrograms: number
  maxUsers:    number
}

type Errors = Partial<Record<keyof EditTenantPayload, string>>

// ── Sub-section: مكوّنات مساعدة ───────────────────────────────

const inputCls = `
  w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900
  outline-none transition placeholder-gray-400
  focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/10
`

const readonlyCls = `
  w-full rounded-xl border border-gray-100 bg-gray-100 px-4 py-2.5 text-sm text-gray-400
  cursor-not-allowed select-none
`

function Field({
  label, required = false, error, hint, children,
}: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ms-0.5">*</span>}
        {hint && <span className="ms-2 text-[11px] font-normal text-gray-400">{hint}</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 pb-3 border-b border-gray-100">
      {children}
    </h3>
  )
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(iso))
}

// ── Sub-section: التحقق من المدخلات ──────────────────────────

function validate(data: Omit<EditTenantPayload, 'tenantId'>): Errors {
  const errors: Errors = {}
  if (!data.name.trim() || data.name.trim().length < 3)
    errors.name = 'الاسم مطلوب (3 أحرف على الأقل)'
  if (!data.ownerName.trim())
    errors.ownerName = 'اسم المالك مطلوب'
  if (!/^05\d{8}$/.test(data.ownerPhone.trim()))
    errors.ownerPhone = 'رقم الجوال غير صحيح (مثال: 0512345678)'
  if (data.maxStudents < 1) errors.maxStudents = 'يجب أن يكون أكبر من صفر'
  if (data.maxPrograms < 1) errors.maxPrograms = 'يجب أن يكون أكبر من صفر'
  if (data.maxUsers    < 1) errors.maxUsers    = 'يجب أن يكون أكبر من صفر'
  return errors
}

// ============================================================
// SECTION: Component
// ============================================================

export default function EditTenantForm({ initial }: { initial: InitialData }) {
  const router = useRouter()

  const [form, setForm] = useState({
    name:        initial.name,
    ownerName:   initial.ownerName,
    ownerPhone:  initial.ownerPhone,
    ownerEmail:  initial.ownerEmail,
    maxStudents: initial.maxStudents,
    maxPrograms: initial.maxPrograms,
    maxUsers:    initial.maxUsers,
  })

  const [errors,     setErrors]     = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | undefined>()

  // ── تحديث حقل واحد ────────────────────────────────────────
  function set(field: keyof typeof form, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof Errors])
      setErrors((e) => ({ ...e, [field]: undefined }))
  }

  // ── الإرسال ────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const stepErrors = validate(form)
    if (Object.keys(stepErrors).length > 0) { setErrors(stepErrors); return }

    setSubmitting(true)
    setSubmitError(undefined)

    const result = await updateTenant({ tenantId: initial.tenantId, ...form })
    // عند النجاح: updateTenant تُنفّذ redirect تلقائياً
    if (result?.error) {
      setSubmitError(result.error)
      setSubmitting(false)
    }
  }

  // ============================================================
  // SECTION: Render
  // ============================================================

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">

      {/* رسالة خطأ الإرسال */}
      {submitError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="shrink-0 mt-0.5">⚠️</span>
          <span>{submitError}</span>
        </div>
      )}

      {/* ── قسم ١: بيانات المنشأة ──────────────────────────── */}
      <div className="space-y-4">
        <SectionTitle>بيانات المنشأة</SectionTitle>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="اسم المنشأة" required error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="أكاديمية النجوم"
              className={inputCls}
            />
          </Field>

          <Field label="الـ Subdomain" hint="غير قابل للتعديل">
            <div className="relative">
              <input
                type="text"
                value={initial.subdomain}
                readOnly
                className={`${readonlyCls} pe-32`}
                dir="ltr"
              />
              <span className="pointer-events-none absolute top-1/2 end-3 -translate-y-1/2 text-xs text-gray-400">
                .mihakk.com
              </span>
            </div>
          </Field>

          <Field label="تاريخ الإنشاء" hint="غير قابل للتعديل">
            <input
              type="text"
              value={formatDate(initial.createdAt)}
              readOnly
              className={readonlyCls}
            />
          </Field>
        </div>
      </div>

      {/* ── قسم ٢: بيانات المالك ────────────────────────────── */}
      <div className="space-y-4">
        <SectionTitle>بيانات المالك</SectionTitle>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="اسم المالك" required error={errors.ownerName}>
            <input
              type="text"
              value={form.ownerName}
              onChange={(e) => set('ownerName', e.target.value)}
              placeholder="محمد العلي"
              className={inputCls}
            />
          </Field>

          <Field label="رقم الجوال" required error={errors.ownerPhone}>
            <input
              type="tel"
              inputMode="numeric"
              value={form.ownerPhone}
              onChange={(e) => set('ownerPhone', e.target.value)}
              placeholder="0512345678"
              className={inputCls}
            />
          </Field>

          <Field label="البريد الإلكتروني" error={errors.ownerEmail}>
            <input
              type="email"
              value={form.ownerEmail}
              onChange={(e) => set('ownerEmail', e.target.value)}
              placeholder="name@example.com"
              className={inputCls}
              dir="ltr"
            />
          </Field>
        </div>
      </div>

      {/* ── قسم ٣: حدود الاستخدام ───────────────────────────── */}
      <div className="space-y-4">
        <SectionTitle>حدود الاستخدام</SectionTitle>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="حد الطلاب" required error={errors.maxStudents}>
            <input
              type="number"
              min={1}
              value={form.maxStudents}
              onChange={(e) => set('maxStudents', Number(e.target.value))}
              className={inputCls}
              dir="ltr"
            />
          </Field>

          <Field label="حد البرامج" required error={errors.maxPrograms}>
            <input
              type="number"
              min={1}
              value={form.maxPrograms}
              onChange={(e) => set('maxPrograms', Number(e.target.value))}
              className={inputCls}
              dir="ltr"
            />
          </Field>

          <Field label="حد المستخدمين" required error={errors.maxUsers}>
            <input
              type="number"
              min={1}
              value={form.maxUsers}
              onChange={(e) => set('maxUsers', Number(e.target.value))}
              className={inputCls}
              dir="ltr"
            />
          </Field>
        </div>
      </div>

      {/* ── أزرار الإجراءات ──────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.push(`/admin/tenants/${initial.tenantId}`)}
          className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          إلغاء
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              جارٍ الحفظ…
            </span>
          ) : (
            '✓ حفظ التعديلات'
          )}
        </button>
      </div>

    </form>
  )
}
