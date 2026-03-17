// ============================================================
// SECTION: Login Page — صفحة تسجيل الدخول
// الوصف: Server Component — يقرأ tenant_slug من الـ header
//        ويمرر اسم المنشأة للنموذج
// ============================================================

import { headers } from 'next/headers'
import type { Metadata } from 'next'
import LoginForm from './_components/LoginForm'

// ── Sub-section: Metadata ─────────────────────────────────────

export const metadata: Metadata = {
  title: 'تسجيل الدخول',
}

// ── Sub-section: استخراج اسم العرض من الـ slug ───────────────

/**
 * يحوّل tenant_slug إلى اسم عرض مناسب للصفحة
 * @param slug - القيمة المستخرجة من x-tenant-slug header
 * @returns اسم العرض بالعربية
 */
function getTenantDisplayName(slug: string | null): string {
  if (!slug || slug === 'dev') return 'محك'
  if (slug === 'admin')        return 'محك — لوحة التحكم'
  // غير ذلك: أرجع الـ slug كما هو — سيُستبدَل لاحقاً بالاسم الحقيقي
  return slug
}

// ============================================================
// SECTION: Page Component
// ============================================================

export default async function LoginPage() {
  const headerStore = await headers()
  const slug        = headerStore.get('x-tenant-slug')
  const tenantName  = getTenantDisplayName(slug)

  return <LoginForm tenantName={tenantName} />
}
