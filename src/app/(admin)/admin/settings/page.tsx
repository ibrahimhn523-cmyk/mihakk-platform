// ============================================================
// SECTION: Settings Page — إعدادات المنصة
// الوصف: Server Component — يجلب الإعدادات ويمرّرها للنموذج
// ============================================================

import type { Metadata } from 'next'
import { getSettings }   from './actions'
import SettingsForm      from './_components/SettingsForm'

export const metadata: Metadata = { title: 'إعدادات المنصة' }

export default async function SettingsPage() {
  const settings = await getSettings()

  if (!settings) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
        <p className="text-sm text-red-600 mb-2">⚠️ لم يتم العثور على إعدادات المنصة</p>
        <p className="text-xs text-red-400">
          تأكد من تنفيذ migration 003_platform_settings.sql في Supabase
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">إعدادات المنصة</h1>
        <p className="text-sm text-gray-400 mt-0.5">تخصيص هوية محك البصرية والإعدادات العامة</p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  )
}
