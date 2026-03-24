'use client'

// ============================================================
// SECTION: AdminTopbar — الشريط العلوي للوحة Super Admin
// الوصف: يعرض عنوان الصفحة الحالية مشتقاً من الـ pathname
// ============================================================

import { usePathname } from 'next/navigation'

// ── Sub-section: خريطة المسارات → العناوين العربية ───────────

const PATH_TITLES: Record<string, string> = {
  '/admin/dashboard':   'لوحة التحكم',
  '/admin/tenants':     'المنشآت',
  '/admin/tenants/new': 'إضافة منشأة',
  '/admin/logs':        'سجل العمليات',
  '/admin/settings':    'إعدادات المنصة',
}

/**
 * يستخرج عنوان الصفحة من الـ pathname
 * @param pathname - المسار الحالي
 * @returns العنوان بالعربية
 */
function getPageTitle(pathname: string): string {
  // بحث مباشر أولاً
  if (PATH_TITLES[pathname]) return PATH_TITLES[pathname]

  // صفحات تفاصيل المنشأة: /admin/tenants/[id]
  if (/^\/admin\/tenants\/[^/]+$/.test(pathname)) return 'تفاصيل المنشأة'

  return 'لوحة التحكم'
}

// ============================================================
// SECTION: Component
// ============================================================

export default function AdminTopbar() {
  const pathname = usePathname()
  const title    = getPageTitle(pathname)

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-gray-100 bg-white px-5 lg:px-6">
      <h1 className="text-base font-semibold text-gray-800">{title}</h1>
    </header>
  )
}
