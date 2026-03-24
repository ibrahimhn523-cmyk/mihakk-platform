'use client'

// ============================================================
// SECTION: NewTenantForm — نموذج إضافة منشأة (Stepper رئيسي)
// الوصف: يدير حالة الخطوات الأربع والتحقق والإرسال
// ============================================================

import { useState }   from 'react'
import StepIndicator  from './StepIndicator'
import Step1TenantData from './Step1TenantData'
import Step2Package   from './Step2Package'
import Step3Services  from './Step3Services'
import Step4Review    from './Step4Review'
import { createTenant, type NewTenantPayload } from '../actions'

// ── Sub-section: الحالة الابتدائية للنموذج ───────────────────

const today = new Date().toISOString().split('T')[0]
const in30  = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

const INITIAL_SERVICES: Record<string, boolean> = {
  db: true, subscriptions: true, programs: true, accounting: false,
  users: true, permissions: true, settings: true, points: false,
  attendance: false, kingsleague: false, league: false, fantasy: false,
}

const INITIAL_DATA: NewTenantPayload = {
  name: '', subdomain: '', ownerName: '', ownerPhone: '', ownerEmail: '',
  plan: 'trial', startsAt: today, endsAt: in30,
  maxStudents: 50, maxPrograms: 3, maxUsers: 5,
  services: INITIAL_SERVICES,
}

const STEPS = [
  { number: 1, label: 'المنشأة'  },
  { number: 2, label: 'الباقة'   },
  { number: 3, label: 'الخدمات' },
  { number: 4, label: 'المراجعة' },
]

// ── Sub-section: قواعد التحقق لكل خطوة ───────────────────────

type Errors = Partial<Record<keyof NewTenantPayload, string>>

function validateStep(step: number, data: NewTenantPayload): Errors {
  const errors: Errors = {}

  if (step === 1) {
    if (!data.name.trim())
      errors.name = 'اسم المنشأة مطلوب'
    if (!data.subdomain.trim())
      errors.subdomain = 'الـ subdomain مطلوب'
    else if (!/^[a-z0-9-]+$/.test(data.subdomain))
      errors.subdomain = 'حروف إنجليزية صغيرة وأرقام وشرطة فقط'
    if (!data.ownerName.trim())
      errors.ownerName = 'اسم المالك مطلوب'
    if (!data.ownerPhone.trim())
      errors.ownerPhone = 'رقم الجوال مطلوب'
    else if (!/^05\d{8}$/.test(data.ownerPhone))
      errors.ownerPhone = 'رقم جوال سعودي غير صحيح'
  }

  if (step === 2) {
    if (!data.startsAt) errors.startsAt = 'تاريخ البداية مطلوب'
    if (!data.endsAt)   errors.endsAt   = 'تاريخ النهاية مطلوب'
    else if (data.endsAt <= data.startsAt)
      errors.endsAt = 'تاريخ النهاية يجب أن يكون بعد البداية'
    if (data.maxStudents < 1) errors.maxStudents = 'يجب أن يكون أكبر من صفر'
    if (data.maxPrograms < 1) errors.maxPrograms = 'يجب أن يكون أكبر من صفر'
    if (data.maxUsers    < 1) errors.maxUsers    = 'يجب أن يكون أكبر من صفر'
  }

  return errors
}

// ============================================================
// SECTION: Component
// ============================================================

export default function NewTenantForm() {
  const [step,       setStep]       = useState(1)
  const [data,       setData]       = useState<NewTenantPayload>(INITIAL_DATA)
  const [errors,     setErrors]     = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | undefined>()

  // ── Sub-section: تحديث حقل واحد ──────────────────────────

  function handleChange(field: keyof NewTenantPayload, value: string | number) {
    setData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function handleServicesChange(services: Record<string, boolean>) {
    setData((prev) => ({ ...prev, services }))
  }

  // ── Sub-section: التنقل بين الخطوات ──────────────────────

  function handleNext() {
    const stepErrors = validateStep(step, data)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    setErrors({})
    setStep((s) => Math.min(s + 1, 4))
  }

  function handleBack() {
    setErrors({})
    setStep((s) => Math.max(s - 1, 1))
  }

  // ── Sub-section: الإرسال النهائي ─────────────────────────

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError(undefined)
    const result = await createTenant(data)
    if (result?.error) {
      setSubmitError(result.error)
      setSubmitting(false)
    }
    // عند النجاح: createTenant تُعيد redirect تلقائياً
  }

  // ============================================================
  // SECTION: Render
  // ============================================================

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-xs">

        {/* ── رأس النموذج + مؤشر الخطوات ─────────────────── */}
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">إضافة منشأة جديدة</h2>
          <StepIndicator currentStep={step} steps={STEPS} />
        </div>

        {/* ── محتوى الخطوة الحالية ────────────────────────── */}
        <div className="px-6 py-6">
          {step === 1 && (
            <Step1TenantData data={data} onChange={handleChange} errors={errors} />
          )}
          {step === 2 && (
            <Step2Package data={data} onChange={handleChange} errors={errors} />
          )}
          {step === 3 && (
            <Step3Services services={data.services} onChange={handleServicesChange} />
          )}
          {step === 4 && (
            <Step4Review
              data={data}
              onEdit={setStep}
              onSubmit={handleSubmit}
              submitting={submitting}
              error={submitError}
            />
          )}
        </div>

        {/* ── أزرار التنقل (الخطوات ١–٣) ─────────────────── */}
        {step < 4 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              السابق
            </button>
            <span className="text-xs text-gray-400">
              الخطوة {step} من {STEPS.length}
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {step === 3 ? 'مراجعة البيانات' : 'التالي'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
