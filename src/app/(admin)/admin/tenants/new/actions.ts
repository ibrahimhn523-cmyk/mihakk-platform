'use server'

// ============================================================
// SECTION: Server Actions — إنشاء منشأة جديدة
// الوصف: يُدخل البيانات في tenants, tenant_owners,
//        subscriptions, tenant_limits, tenant_services
//        ثم يُرسل رسالة ترحيب عبر WhatsApp ويُسجّل العملية
// ============================================================

import { createClient }       from '@/lib/supabase/server'
import { redirect }           from 'next/navigation'
import { sendWelcomeMessage } from '@/lib/integrations/whatsapp'
import { logAction }          from '@/lib/utils/audit'

// ── Sub-section: Type ─────────────────────────────────────────

export interface NewTenantPayload {
  name:        string
  subdomain:   string
  ownerName:   string
  ownerPhone:  string
  ownerEmail:  string
  plan:        'trial' | 'basic' | 'advanced'
  startsAt:    string
  endsAt:      string
  maxStudents: number
  maxPrograms: number
  maxUsers:    number
  services:    Record<string, boolean>
}

export interface ActionResult { error?: string }

// ============================================================
// SECTION: createTenant — Action رئيسي
// ============================================================

export async function createTenant(
  payload: NewTenantPayload
): Promise<ActionResult> {
  const supabase = await createClient()

  // ── [1] إدراج المنشأة ────────────────────────────────────
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert({ name: payload.name, subdomain: payload.subdomain })
    .select('id')
    .single()

  if (tenantError || !tenant) {
    if (tenantError?.code === '23505')
      return { error: 'هذا الـ subdomain مستخدم مسبقاً، اختر اسماً آخر' }
    return { error: 'فشل إنشاء المنشأة، يرجى المحاولة مجدداً' }
  }

  const tenantId = tenant.id

  // ── [2] إدراج مالك المنشأة ──────────────────────────────
  const { error: ownerError } = await supabase
    .from('tenant_owners')
    .insert({
      tenant_id: tenantId,
      full_name: payload.ownerName,
      phone:     payload.ownerPhone,
      email:     payload.ownerEmail || null,
    })

  if (ownerError) return { error: 'فشل حفظ بيانات المالك' }

  // ── [3] إدراج الاشتراك ───────────────────────────────────
  const { error: subError } = await supabase
    .from('subscriptions')
    .insert({
      tenant_id: tenantId,
      plan:      payload.plan,
      starts_at: payload.startsAt,
      ends_at:   payload.endsAt,
      is_active: true,
    })

  if (subError) return { error: 'فشل حفظ الاشتراك' }

  // ── [4] إدراج الحدود ────────────────────────────────────
  const { error: limitsError } = await supabase
    .from('tenant_limits')
    .insert({
      tenant_id:    tenantId,
      max_students: payload.maxStudents,
      max_programs: payload.maxPrograms,
      max_users:    payload.maxUsers,
    })

  if (limitsError) return { error: 'فشل حفظ حدود الاستخدام' }

  // ── [5] إدراج الخدمات ───────────────────────────────────
  const CORE_KEYS = ['db','subscriptions','programs','accounting',
                     'users','permissions','settings','points','attendance']

  const servicesRows = Object.entries(payload.services).map(([key, enabled]) => ({
    tenant_id:    tenantId,
    service_key:  key,
    is_enabled:   enabled,
    service_type: CORE_KEYS.includes(key) ? 'core' : 'addon',
    enabled_at:   enabled ? new Date().toISOString() : null,
  }))

  const { error: servicesError } = await supabase
    .from('tenant_services')
    .insert(servicesRows)

  if (servicesError) return { error: 'فشل حفظ الخدمات' }

  // ── [6] تسجيل العملية ───────────────────────────────────
  await logAction({
    action:     'CREATE_TENANT',
    entityType: 'tenant',
    entityId:   tenantId,
    entityName: payload.name,
    newValue: {
      name:      payload.name,
      subdomain: payload.subdomain,
      plan:      payload.plan,
      owner:     payload.ownerName,
    },
  })

  // ── [7] إرسال رسالة الترحيب عبر WhatsApp ────────────────
  if (payload.ownerPhone) {
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://mihakk.com'}/login`
    await sendWelcomeMessage(payload.ownerPhone, payload.name, loginUrl, '••••••••')
  }

  redirect(`/admin/tenants/${tenantId}`)
}
