// ============================================================
// SECTION: Root Page — توجيه حسب حالة المستخدم
// الوصف: يقرأ الجلسة ودور المستخدم ثم يُعيد التوجيه للمسار الصحيح
// ============================================================

import { redirect }     from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()

  // ── التحقق من الجلسة ────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // ── قراءة دور المستخدم من جدول users ────────────────────
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'super_admin') redirect('/admin/dashboard')

  redirect('/dashboard')
}
