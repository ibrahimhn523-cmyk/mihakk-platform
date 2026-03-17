'use server'

// ============================================================
// SECTION: Tenant Detail Actions — إجراءات صفحة إدارة المنشأة
// الوصف: تحديث الخدمات والحالة والحدود عبر Server Actions
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── Sub-section: Types ─────────────────────────────────────────

export type TenantStatus = 'active' | 'trial' | 'suspended' | 'expired'

export interface ActionResult {
  error?: string
  success?: boolean
}

// ============================================================
// SECTION: toggleService — تشغيل / إيقاف خدمة
// ============================================================

/**
 * تحديث حالة خدمة واحدة لمنشأة محددة
 * @param tenantId  - معرف المنشأة
 * @param serviceKey - مفتاح الخدمة
 * @param isEnabled  - الحالة الجديدة
 */
export async function toggleService(
  tenantId:   string,
  serviceKey: string,
  isEnabled:  boolean
): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tenant_services')
    .update({
      is_enabled: isEnabled,
      enabled_at: isEnabled ? new Date().toISOString() : null,
    })
    .eq('tenant_id',   tenantId)
    .eq('service_key', serviceKey)

  if (error) return { error: 'فشل تحديث حالة الخدمة' }

  revalidatePath(`/admin/tenants/${tenantId}`)
  return { success: true }
}

// ============================================================
// SECTION: updateTenantStatus — تغيير حالة المنشأة
// ============================================================

/**
 * تحديث status للمنشأة (active / suspended / expired / trial)
 * @param tenantId - معرف المنشأة
 * @param status   - الحالة الجديدة
 */
export async function updateTenantStatus(
  tenantId: string,
  status:   TenantStatus
): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tenants')
    .update({ status })
    .eq('id', tenantId)

  if (error) return { error: 'فشل تحديث حالة المنشأة' }

  revalidatePath(`/admin/tenants/${tenantId}`)
  revalidatePath('/admin/tenants')
  return { success: true }
}

// ============================================================
// SECTION: updateLimit — تعديل حد استخدام
// ============================================================

/**
 * تعديل حد واحد من حدود الاستخدام
 * @param tenantId - معرف المنشأة
 * @param field    - الحقل المراد تعديله
 * @param value    - القيمة الجديدة
 */
export async function updateLimit(
  tenantId: string,
  field:    'max_students' | 'max_programs' | 'max_users',
  value:    number
): Promise<ActionResult> {
  if (value < 1) return { error: 'يجب أن تكون القيمة أكبر من صفر' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('tenant_limits')
    .update({ [field]: value })
    .eq('tenant_id', tenantId)

  if (error) return { error: 'فشل تحديث الحد' }

  revalidatePath(`/admin/tenants/${tenantId}`)
  return { success: true }
}
