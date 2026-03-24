'use client'

// ============================================================
// SECTION: TabLimits — تبويب حدود الاستخدام
// الوصف: عرض الحدود مع شريط استخدام + نافذة تعديل
// ============================================================

import { useState, useTransition } from 'react'
import { updateLimit }             from '../actions'

// ── Sub-section: Types ─────────────────────────────────────────

interface Limits {
  id:           string
  tenant_id:    string
  max_students: number
  max_programs: number
  max_users:    number
}

interface Props {
  tenantId: string
  limits:   Limits | null
  // الاستخدام الفعلي — سيُحقن لاحقاً عند توفر جداول الطلاب والبرامج
  usage?: { students?: number; programs?: number; users?: number }
}

// ── Sub-section: مكوّن بطاقة الحد ────────────────────────────

type LimitField = 'max_students' | 'max_programs' | 'max_users'

function LimitCard({
  tenantId, field, label, icon, max, current,
}: {
  tenantId: string
  field:    LimitField
  label:    string
  icon:     string
  max:      number
  current:  number
}) {
  const [isEditing,   setIsEditing]   = useState(false)
  const [inputVal,    setInputVal]    = useState(String(max))
  const [localMax,    setLocalMax]    = useState(max)
  const [error,       setError]       = useState<string | null>(null)
  const [isPending,   startTransition] = useTransition()

  const pct = localMax > 0 ? Math.min((current / localMax) * 100, 100) : 0
  const barColor = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : 'var(--color-primary)'

  function openEdit() {
    setInputVal(String(localMax))
    setError(null)
    setIsEditing(true)
  }

  function handleSave() {
    const val = Number(inputVal)
    if (isNaN(val) || val < 1) {
      setError('يجب أن تكون القيمة أكبر من صفر')
      return
    }
    startTransition(async () => {
      const result = await updateLimit(tenantId, field, val)
      if (result.error) { setError(result.error); return }
      setLocalMax(val)
      setIsEditing(false)
    })
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      {/* رأس البطاقة */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
        </div>
        <button
          onClick={openEdit}
          className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 transition"
        >
          تعديل
        </button>
      </div>

      {/* الأرقام */}
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-2xl font-bold text-gray-800">{current}</span>
        <span className="text-sm text-gray-400">/ {localMax}</span>
      </div>

      {/* شريط الاستخدام */}
      <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-gray-400 mt-1.5">
        <span>{Math.round(pct)}% مستخدم</span>
        <span>{localMax - current} متاح</span>
      </div>

      {/* نافذة التعديل */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h4 className="text-base font-semibold text-gray-800 mb-1">تعديل {label}</h4>
            <p className="text-xs text-gray-400 mb-4">الحد الحالي: {localMax}</p>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              الحد الجديد
            </label>
            <input
              type="number"
              min={1}
              value={inputVal}
              onChange={(e) => { setInputVal(e.target.value); setError(null) }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[var(--color-primary)] focus:bg-white"
              dir="ltr"
              autoFocus
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {isPending ? 'جارٍ الحفظ…' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// SECTION: Component
// ============================================================

export default function TabLimits({ tenantId, limits, usage = {} }: Props) {
  if (!limits) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
        <p className="text-sm text-gray-400">لا توجد بيانات حدود لهذه المنشأة</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
        ℹ️ الاستخدام الفعلي سيظهر تلقائياً عند تفعيل وحدات الطلاب والبرامج
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <LimitCard
          tenantId={tenantId} field="max_students"
          label="الطلاب"  icon="🎓"
          max={limits.max_students}
          current={usage.students ?? 0}
        />
        <LimitCard
          tenantId={tenantId} field="max_programs"
          label="البرامج"  icon="📚"
          max={limits.max_programs}
          current={usage.programs ?? 0}
        />
        <LimitCard
          tenantId={tenantId} field="max_users"
          label="المستخدمون" icon="👥"
          max={limits.max_users}
          current={usage.users ?? 0}
        />
      </div>
    </div>
  )
}
