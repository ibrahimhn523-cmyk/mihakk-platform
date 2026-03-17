// ============================================================
// SECTION: Supabase Server Client
// الوصف: عميل Supabase للاستخدام في Server Components و Route Handlers
// الاستخدام: استدعِه في server components أو api routes فقط
// ============================================================

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * ينشئ عميل Supabase للاستخدام في جهة السيرفر
 * يقرأ الكوكيز تلقائياً من الطلب الحالي
 * @returns Supabase client مهيأ مع cookie store
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll يُستدعى من Server Component — يمكن تجاهل الخطأ بأمان
            // تحديث الكوكيز يتم عبر middleware
          }
        },
      },
    }
  )
}
