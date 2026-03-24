// ============================================================
// SECTION: New Tenant Page — صفحة إضافة منشأة جديدة
// الوصف: Server Component خفيف — يُركّب النموذج التفاعلي
// ============================================================

import type { Metadata }  from 'next'
import NewTenantForm      from './_components/NewTenantForm'

export const metadata: Metadata = { title: 'إضافة منشأة' }

export default function NewTenantPage() {
  return <NewTenantForm />
}
