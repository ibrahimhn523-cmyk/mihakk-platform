// ============================================================
// SECTION: Supabase Browser Client
// الوصف: عميل Supabase للاستخدام في Client Components (المتصفح)
// الاستخدام: استدعِه داخل 'use client' components فقط
// ============================================================

import { createBrowserClient } from '@supabase/ssr'

/**
 * ينشئ عميل Supabase للاستخدام في جهة المتصفح
 * @returns Supabase client مهيأ بالـ anon key
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
