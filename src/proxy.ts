// ============================================================
// SECTION: Proxy الرئيسي — منصة محك
// الوصف: يعالج كل طلب — يستخرج الـ tenant، يحدّث الجلسة، يحمي المسارات
// ملاحظة: تم الانتقال من middleware.ts إلى proxy.ts (Next.js 16+)
// ============================================================

import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

// ── Sub-section: استخراج tenant_slug من الـ hostname ──────────────────────

/**
 * يستخرج tenant_slug من hostname الطلب
 * @param hostname - الـ hostname كاملاً (مثال: bare.mihakk.com)
 * @returns tenant_slug أو "admin" أو "dev"
 */
function extractTenantSlug(hostname: string): string {
  // إزالة رقم البورت إن وُجد (localhost:3000 → localhost)
  const host = hostname.split(':')[0]

  // بيئة التطوير
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'dev'
  }

  // mihakk.com بدون subdomain — الصفحة الرئيسية
  if (host === 'mihakk.com' || host === 'www.mihakk.com') {
    return 'public'
  }

  // استخراج الـ subdomain من *.mihakk.com
  const subdomain = host.replace(/\.mihakk\.com$/, '')

  // admin.mihakk.com → Super Admin
  if (subdomain === 'admin') {
    return 'admin'
  }

  // bare.mihakk.com → "bare" | tamiz.mihakk.com → "tamiz"
  return subdomain
}

// ── Sub-section: التحقق من صلاحية super_admin ─────────────────────────────

/**
 * يتحقق من أن المستخدم الحالي يملك دور super_admin
 * @param request - الطلب الحالي
 * @returns true إذا كان المستخدم super_admin
 */
async function isSuperAdmin(request: NextRequest): Promise<boolean> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // القراءة فقط هنا — التحديث يتم في updateSession
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  // التحقق من الدور في user_metadata أو app_metadata
  const role =
    user.app_metadata?.role ??
    user.user_metadata?.role

  return role === 'super_admin'
}

// ============================================================
// SECTION: middleware الرئيسي — الاسم يبقى middleware حسب Next.js API
// ============================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') ?? 'localhost:3000'

  // ── Sub-section: استخراج وحقن tenant_slug ─────────────────
  const tenantSlug = extractTenantSlug(hostname)

  // تحديث جلسة Supabase وتجديد الكوكيز
  const response = await updateSession(request)

  // حقن tenant_slug كـ header لاستخدامه في Server Components
  response.headers.set('x-tenant-slug', tenantSlug)
  // حقن الـ pathname لاستخدامه في layouts
  response.headers.set('x-pathname', pathname)

  // ── Sub-section: حماية مسارات /admin ──────────────────────
  if (pathname.startsWith('/admin')) {
    const adminAllowed = await isSuperAdmin(request)

    if (!adminAllowed) {
      // غير مصادق أصلاً → صفحة تسجيل الدخول
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return response
  }

  // ── Sub-section: حماية بقية المسارات الخاصة ───────────────
  // المسارات العامة التي لا تحتاج جلسة
  const publicPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/auth',        // Supabase auth callbacks
  ]

  const isPublicPath = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )

  if (!isPublicPath) {
    // التحقق من وجود جلسة نشطة
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

// ============================================================
// SECTION: Matcher — المسارات التي يعالجها الـ proxy
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
