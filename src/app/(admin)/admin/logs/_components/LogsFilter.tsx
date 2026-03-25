'use client'

// ============================================================
// SECTION: LogsFilter — فلتر سجل العمليات
// الوصف: يحدّث URL params لفلترة العمليات من السيرفر
// ============================================================

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition }              from 'react'

const ACTION_OPTIONS = [
  { value: '',                     label: 'كل العمليات'     },
  { value: 'CREATE_TENANT',        label: 'إنشاء منشأة'     },
  { value: 'UPDATE_TENANT',        label: 'تعديل منشأة'     },
  { value: 'UPDATE_TENANT_STATUS', label: 'تغيير الحالة'    },
  { value: 'TOGGLE_SERVICE',       label: 'تفعيل/إيقاف خدمة' },
  { value: 'UPDATE_LIMIT',         label: 'تعديل الحدود'    },
]

export default function LogsFilter() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  const current = searchParams.get('action') ?? ''

  function handleChange(value: string) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set('action', value)
      else params.delete('action')
      router.push(`/admin/logs?${params.toString()}`)
    })
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm text-gray-500 shrink-0">فلتر:</span>
      <div className="flex flex-wrap gap-2">
        {ACTION_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleChange(opt.value)}
            disabled={pending}
            className={`
              rounded-full px-3.5 py-1.5 text-xs font-medium transition
              ${current === opt.value
                ? 'text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}
            `}
            style={current === opt.value
              ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {pending && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--color-primary)]" />
      )}
    </div>
  )
}
