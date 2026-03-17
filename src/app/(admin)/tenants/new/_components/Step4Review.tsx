'use client'

// ============================================================
// SECTION: Step4Review — مراجعة وتأكيد البيانات
// الوصف: عرض ملخص كل الخطوات قبل الإرسال النهائي
// ============================================================

import type { NewTenantPayload } from '../actions'

interface Props {
  data:      NewTenantPayload
  onEdit:    (step: number) => void
  onSubmit:  () => void
  submitting: boolean
  error?:    string
}

// ── Sub-section: ثوابت العرض ──────────────────────────────────

const PLAN_LABELS: Record<string, string> = {
  trial: 'تجريبية', basic: 'أساسية', advanced: 'متقدمة',
}

const ALL_SERVICES: Record<string, string> = {
  db: 'قاعدة البيانات', subscriptions: 'الاشتراكات', programs: 'البرامج',
  accounting: 'المحاسبة', users: 'المستخدمون', permissions: 'الصلاحيات',
  settings: 'الإعدادات', points: 'النقاط', attendance: 'الحضور',
  kingsleague: 'Kings League', league: 'الدوري', fantasy: 'الفانتازي',
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(iso))
}

// ── Sub-section: مكوّن قسم المراجعة ──────────────────────────

function ReviewSection({
  title, step, onEdit, children,
}: {
  title: string; step: number; onEdit: (s: number) => void; children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="text-xs font-medium text-[var(--color-primary)] hover:underline"
        >
          تعديل
        </button>
      </div>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-1.5 text-sm border-b border-gray-50 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800 text-end">{value ?? '—'}</span>
    </div>
  )
}

// ============================================================
// SECTION: Component
// ============================================================

export default function Step4Review({ data, onEdit, onSubmit, submitting, error }: Props) {
  const enabledServices = Object.entries(data.services)
    .filter(([, enabled]) => enabled)
    .map(([key]) => ALL_SERVICES[key] ?? key)

  return (
    <div className="space-y-4">

      {/* خطأ الإرسال */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          <span className="shrink-0 mt-0.5">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── الخطوة ١: المنشأة ──────────────────────────── */}
      <ReviewSection title="بيانات المنشأة" step={1} onEdit={onEdit}>
        <Row label="الاسم"       value={data.name} />
        <Row label="الـ Subdomain" value={
          <span className="font-mono text-xs">{data.subdomain}.mihakk.com</span>
        } />
        <Row label="المالك"      value={data.ownerName} />
        <Row label="الجوال"      value={data.ownerPhone} />
        {data.ownerEmail && <Row label="البريد" value={data.ownerEmail} />}
      </ReviewSection>

      {/* ── الخطوة ٢: الباقة ───────────────────────────── */}
      <ReviewSection title="الباقة والمدة" step={2} onEdit={onEdit}>
        <Row label="الباقة"            value={PLAN_LABELS[data.plan]} />
        <Row label="تاريخ البداية"     value={formatDate(data.startsAt)} />
        <Row label="تاريخ النهاية"     value={formatDate(data.endsAt)} />
        <Row label="حد الطلاب"         value={data.maxStudents} />
        <Row label="حد البرامج"        value={data.maxPrograms} />
        <Row label="حد المستخدمين"     value={data.maxUsers} />
      </ReviewSection>

      {/* ── الخطوة ٣: الخدمات ──────────────────────────── */}
      <ReviewSection title="الخدمات المفعّلة" step={3} onEdit={onEdit}>
        {enabledServices.length === 0 ? (
          <p className="text-sm text-gray-400">لا توجد خدمات مفعّلة</p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {enabledServices.map((svc) => (
              <span
                key={svc}
                className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
              >
                ✓ {svc}
              </span>
            ))}
          </div>
        )}
      </ReviewSection>

      {/* ── زر الإرسال النهائي ─────────────────────────── */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="w-full rounded-xl py-3 text-sm font-semibold text-white transition disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            جارٍ إنشاء المنشأة…
          </span>
        ) : (
          '✓ إنشاء المنشأة'
        )}
      </button>

    </div>
  )
}
