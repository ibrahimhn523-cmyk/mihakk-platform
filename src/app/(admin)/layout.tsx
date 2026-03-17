// ============================================================
// SECTION: Admin Layout — هيكل لوحة Super Admin
// الوصف: Server Component — يتحقق من الجلسة والصلاحية
//        ثم يُركّب الشريط الجانبي والعلوي حول المحتوى
// ============================================================

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from './_components/AdminSidebar'
import AdminTopbar  from './_components/AdminTopbar'

// ── Sub-section: تعريف نوع الـ user المُسترجع ─────────────────

interface AdminUser {
  id:        string
  full_name: string
  role:      string
}

// ============================================================
// SECTION: Layout Component
// ============================================================

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // ── Sub-section: التحقق من الجلسة ─────────────────────────

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // ── Sub-section: التحقق من صلاحية super_admin ─────────────

  const { data: adminUser } = await supabase
    .from('users')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single<AdminUser>()

  if (!adminUser || adminUser.role !== 'super_admin') {
    // مستخدم عادي حاول الوصول للوحة الإدارة → أعده للوحته
    redirect('/dashboard')
  }

  // ── Sub-section: ترجمة اسم الدور للعربية ──────────────────

  const roleLabel: Record<string, string> = {
    super_admin:     'مدير المنصة',
    owner:           'مالك منشأة',
    program_manager: 'مدير برنامج',
    supervisor:      'مشرف',
  }

  // ============================================================
  // SECTION: Render — الهيكل الكامل
  // ============================================================

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50" dir="rtl">

      {/* ── الشريط الجانبي + شريط الجوال العلوي ─────────────── */}
      <AdminSidebar
        userName={adminUser.full_name}
        userRole={roleLabel[adminUser.role] ?? adminUser.role}
      />

      {/* ── منطقة المحتوى الرئيسية ──────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* الشريط العلوي — عنوان الصفحة */}
        <AdminTopbar />

        {/* المحتوى */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          {children}
        </main>

      </div>
    </div>
  )
}
