// ============================================================
// SECTION: Supabase Middleware Client
// الوصف: عميل Supabase مخصص للاستخدام داخل middleware.ts
// الاستخدام: استدعِه في middleware.ts فقط لتحديث جلسة المستخدم
// ============================================================

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * يحدّث جلسة المستخدم في كل طلب عبر الـ middleware
 * يضمن عدم انتهاء صلاحية الجلسة أثناء التصفح
 * @param request - كائن الطلب الحالي من Next.js
 * @returns NextResponse محدّث مع كوكيز الجلسة
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // ── Sub-section: تحديث الكوكيز في الطلب والرد معاً ──────────
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // تحديث الجلسة — يجب استدعاء getUser() لتفعيل التحديث
  // لا تحذف هذا السطر حتى لو لم تستخدم المتغير
  await supabase.auth.getUser()

  return supabaseResponse
}
