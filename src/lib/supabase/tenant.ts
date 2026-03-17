// ============================================================
// SECTION: Tenant Resolver — محلّل هوية المنشأة
// الوصف: دوال لاسترجاع بيانات المنشأة من قاعدة البيانات
//        بناءً على الـ subdomain المستخرج من الطلب
// ============================================================

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

// ── Sub-section: تعريف النوع ───────────────────────────────────────────────

export interface Tenant {
  id: string
  name: string
  subdomain: string
  status: string
}

// ── Sub-section: القيم المحجوزة التي لا تُمثّل منشأة حقيقية ──────────────

const RESERVED_SLUGS = ['admin', 'dev', 'public', 'www'] as const

// ============================================================
// SECTION: getTenantBySlug
// الوصف: استرجاع بيانات المنشأة الكاملة من جدول tenants
// ============================================================

/**
 * يسترجع بيانات المنشأة من جدول tenants بناءً على الـ subdomain
 * @param slug - الـ subdomain المستخرج من الطلب (مثال: "bare")
 * @returns بيانات المنشأة { id, name, subdomain, status } أو null
 */
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  // القيم المحجوزة لا تُمثّل منشآت — أرجع null مباشرة
  if (RESERVED_SLUGS.includes(slug as typeof RESERVED_SLUGS[number])) {
    return null
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('tenants')
      .select('id, name, subdomain, status')
      .eq('subdomain', slug)
      .single()

    if (error) {
      // PGRST116 = no rows found — ليس خطأً حقيقياً
      if (error.code === 'PGRST116') return null

      console.error('[tenant] خطأ في استرجاع المنشأة:', error.message)
      return null
    }

    return data as Tenant
  } catch (err) {
    console.error('[tenant] استثناء غير متوقع في getTenantBySlug:', err)
    return null
  }
}

// ============================================================
// SECTION: getTenantId
// الوصف: استرجاع tenant_id فقط — للاستخدام في الاستعلامات
// ============================================================

/**
 * يُرجع tenant_id فقط بناءً على الـ slug
 * @param slug - الـ subdomain المستخرج من الطلب
 * @returns tenant_id كـ string أو null إذا لم توجد المنشأة
 */
export async function getTenantId(slug: string): Promise<string | null> {
  const tenant = await getTenantBySlug(slug)
  return tenant?.id ?? null
}

// ============================================================
// SECTION: getCurrentTenant
// الوصف: يقرأ x-tenant-slug من headers الطلب الحالي
//        ثم يسترجع بيانات المنشأة تلقائياً
// ============================================================

/**
 * يستخرج المنشأة الحالية من headers الطلب المحقون من middleware.ts
 * مناسب للاستدعاء المباشر في Server Components و Route Handlers
 * @returns بيانات المنشأة الحالية أو null (في حالة admin أو dev)
 */
export async function getCurrentTenant(): Promise<Tenant | null> {
  try {
    const headerStore = await headers()
    const slug = headerStore.get('x-tenant-slug')

    if (!slug) {
      console.warn('[tenant] x-tenant-slug غير موجود في الـ headers')
      return null
    }

    return await getTenantBySlug(slug)
  } catch (err) {
    console.error('[tenant] استثناء غير متوقع في getCurrentTenant:', err)
    return null
  }
}
