// ============================================================
// SECTION: Logs Page — سجل العمليات
// الوصف: Server Component — يجلب آخر 50 عملية مع فلترة اختيارية
// ============================================================

import type { Metadata } from 'next'
import { Suspense }      from 'react'
import { createClient }  from '@/lib/supabase/server'
import LogsFilter        from './_components/LogsFilter'
import LogsLoading       from './loading'

export const metadata: Metadata = { title: 'سجل العمليات' }

const ACTION_LABELS: Record<string, string> = {
  CREATE_TENANT:        'إنشاء منشأة',
  UPDATE_TENANT:        'تعديل منشأة',
  UPDATE_TENANT_STATUS: 'تغيير الحالة',
  TOGGLE_SERVICE:       'تفعيل/إيقاف خدمة',
  UPDATE_LIMIT:         'تعديل الحدود',
}

const ACTION_STYLES: Record<string, string> = {
  CREATE_TENANT:        'bg-emerald-50 text-emerald-700',
  UPDATE_TENANT:        'bg-blue-50    text-blue-700',
  UPDATE_TENANT_STATUS: 'bg-amber-50   text-amber-700',
  TOGGLE_SERVICE:       'bg-purple-50  text-purple-700',
  UPDATE_LIMIT:         'bg-gray-50    text-gray-600',
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

async function LogsTable({ action }: { action?: string }) {
  const supabase = await createClient()

  let query = supabase
    .from('audit_logs')
    .select('id, actor_name, action, entity_name, new_value, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (action) query = query.eq('action', action)

  const { data: logs, error } = await query

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-600">
        فشل تحميل السجل — {error.message}
      </div>
    )
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center">
        <p className="text-gray-400 text-sm">لا توجد عمليات مسجّلة بعد</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-xs">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-[11px] uppercase text-gray-400 border-b border-gray-100">
          <tr>
            <th className="px-4 py-3 text-right font-medium">الوقت</th>
            <th className="px-4 py-3 text-right font-medium">المنفّذ</th>
            <th className="px-4 py-3 text-right font-medium">العملية</th>
            <th className="px-4 py-3 text-right font-medium">الكيان</th>
            <th className="px-4 py-3 text-right font-medium hidden lg:table-cell">التفاصيل</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50/50 transition">
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                {formatDateTime(log.created_at)}
              </td>
              <td className="px-4 py-3 font-medium text-gray-800">{log.actor_name}</td>
              <td className="px-4 py-3">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${ACTION_STYLES[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                  {ACTION_LABELS[log.action] ?? log.action}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{log.entity_name ?? '—'}</td>
              <td className="px-4 py-3 hidden lg:table-cell">
                {log.new_value && (
                  <code className="text-[11px] text-gray-400 bg-gray-50 rounded px-1.5 py-0.5 max-w-[200px] block truncate">
                    {JSON.stringify(log.new_value)}
                  </code>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-gray-50 px-4 py-3 text-xs text-gray-400 text-end">
        يعرض آخر {logs.length} عملية
      </div>
    </div>
  )
}

export default async function LogsPage(
  { searchParams }: { searchParams: Promise<{ action?: string }> }
) {
  const { action } = await searchParams
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">سجل العمليات</h1>
          <p className="text-sm text-gray-400 mt-0.5">آخر 50 عملية نفّذها الـ super_admin</p>
        </div>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
        <Suspense fallback={<div className="h-8 animate-pulse rounded bg-gray-100" />}>
          <LogsFilter />
        </Suspense>
      </div>
      <Suspense fallback={<LogsLoading />}>
        <LogsTable action={action} />
      </Suspense>
    </div>
  )
}
