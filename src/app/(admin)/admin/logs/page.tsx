// ============================================================
// SECTION: Logs Page — سجل العمليات
// الوصف: صفحة مؤقتة — قيد التطوير
// ============================================================

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'سجل العمليات' }

export default function LogsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
        📋
      </div>
      <h1 className="text-xl font-semibold text-gray-800">سجل العمليات</h1>
      <p className="text-sm text-gray-400">هذه الصفحة قيد التطوير — ستتوفر قريباً</p>
      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600 ring-1 ring-amber-200">
        قيد التطوير
      </span>
    </div>
  )
}
