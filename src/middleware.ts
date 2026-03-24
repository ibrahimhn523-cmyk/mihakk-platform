// ============================================================
// SECTION: Middleware — وضع التشخيص المؤقت
// الوصف: passthrough لتشخيص مشكلة 404
// [DISABLED 2026-03] المنطق الكامل — استُبدل مؤقتاً بـ passthrough
// ============================================================

import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

// ============================================================
// SECTION: Matcher — المسارات التي يعالجها الـ middleware
// الوصف: يشمل كل المسارات ما عدا الملفات الثابتة
// ============================================================

export const config = {
  matcher: [
    /*
     * يطابق كل المسارات ما عدا:
     * - /_next/static  (ملفات Next.js الثابتة)
     * - /_next/image   (معالج الصور)
     * - /favicon.ico   (أيقونة الموقع)
     * - الامتدادات: svg, png, jpg, jpeg, gif, webp, ico, css, js
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
