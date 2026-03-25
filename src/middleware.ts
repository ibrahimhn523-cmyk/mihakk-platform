// ============================================================
// SECTION: Middleware الرئيسي — منصة محك
// الوصف: يعالج كل طلب — يستخرج الـ tenant، يحدّث الجلسة، يحمي المسارات
// ============================================================

import { type NextRequest, NextResponse } from 'next/server'
import { updateSession }    from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

// ── Sub-section: المسارات العامة التي لا تحتاج جلسة ──────────

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password']

// ============================================================
// SECTION: extractTenantSlug — استخراج الـ tenant من الـ hostname
// ============================================================

/**
 * يستخرج tenant_slug من hostname الطلب
 * @param hostname - الـ hostname كاملاً (مثال: bare.mihakk.com)
 * @returns tenant_slug أو "admin" أو "dev"
 */
function extractTenantSlug(hostname: string): string {
  const host = hostname.split(':')[0]

  if (host === 'localhost' || host === '127.0.0.1') return 'dev'
  if (host === 'mihakk.com' || host === 'www.mihakk.com') return 'public'

  // استخراج الـ subdomain من *.mihakk.com
  const subdomain = host.replace(/\.mihakk\.com$/, '')
  return subdomain  // "admin" | "bare" | "tamiz" | ...
}

// ============================================================
// SECTION: getUserRole — قراءة دور المستخدم من جدول users
// الوصف: يستعلم من قاعدة البيانات مباشرة — لا يعتمد على JWT فقط
// ============================================================

/**
 * يُرجع دور المستخدم المسجّل أو null إذا لم تكن هناك جلسة
 * @param request - الطلب الحالي
 */
async function getUserRole(request: NextRequest): Promise<string | null> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},  // القراءة فقط هنا — التحديث يتم في updateSession
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // التحقق من الدور في جدول users (المصدر الموثوق)
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  return data?.role ?? null
}

// ============================================================
// SECTION: middleware الرئيسي
// ============================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname     = request.headers.get('host') ?? 'localhost:3000'

  // ── [١] استخراج وحقن tenant_slug ────────────────────────
  const tenantSlug = extractTenantSlug(hostname)

  // تحديث جلسة Supabase وتجديد الكوكيز
  const response = await updateSession(request)
  response.headers.set('x-tenant-slug', tenantSlug)
  response.headers.set('x-pathname',    pathname)

  // ── [٢] المسارات العامة — لا تحتاج حماية ───────────────
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
  if (isPublic) return response

  // ── [٣] حماية مسارات /admin/* ───────────────────────────
  if (pathname.startsWith('/admin')) {
    const role = await getUserRole(request)

    if (!role || role !== 'super_admin') {
      const url = new URL('/login', request.url)
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }

    return response
  }

  // ── [٤] حماية بقية المسارات الخاصة ─────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return response
}

// ============================================================
// SECTION: config — المسارات التي يعالجها الـ middleware
// الوصف: يشمل كل المسارات ما عدا الملفات الثابتة
// ============================================================

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
