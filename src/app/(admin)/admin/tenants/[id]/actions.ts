'use server'

// ============================================================
// SECTION: Tenant Detail Actions — إجراءات صفحة إدارة المنشأة
// الوصف: تحديث الخدمات والحالة والحدود + تسجيل كل عملية
// ============================================================

import { createClient }   from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAction }      from '@/lib/utils/audit'

export type TenantStatus = 'active' | 'trial' | 'suspended' | 'expired'
export interface ActionResult { error?: string; success?: boolean }

async function getTenantName(tenantId: string): Promise<string> {
  const supabase = await createClient()
  const { data } = await supabase.from('tenants').select('name').eq('id', tenantId).single()
  return data?.name ?? tenantId
}

export async function toggleService(
  tenantId: string, serviceKey: string, isEnabled: boolean
): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tenant_services')
    .update({ is_enabled: isEnabled, enabled_at: isEnabled ? new Date().toISOString() : null })
    .eq('tenant_id', tenantId).eq('service_key', serviceKey)
  if (error) return { error: 'فشل تحديث حالة الخدمة' }
  const tenantName = await getTenantName(tenantId)
  await logAction({
    action: 'TOGGLE_SERVICE', entityType: 'service', entityId: tenantId,
    entityName: `${tenantName} — ${serviceKey}`,
    oldValue: { service_key: serviceKey, is_enabled: !isEnabled },
    newValue: { service_key: serviceKey, is_enabled: isEnabled },
  })
  revalidatePath(`/admin/tenants/${tenantId}`)
  return { success: true }
}

export async function updateTenantStatus(
  tenantId: string, status: TenantStatus, oldStatus?: TenantStatus
): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('tenants').update({ status }).eq('id', tenantId)
  if (error) return { error: 'فشل تحديث حالة المنشأة' }
  const tenantName = await getTenantName(tenantId)
  await logAction({
    action: 'UPDATE_TENANT_STATUS', entityType: 'tenant',
    entityId: tenantId, entityName: tenantName,
    oldValue: oldStatus ? { status: oldStatus } : undefined,
    newValue: { status },
  })
  revalidatePath(`/admin/tenants/${tenantId}`)
  revalidatePath('/admin/tenants')
  return { success: true }
}

export async function updateLimit(
  tenantId: string,
  field: 'max_students' | 'max_programs' | 'max_users',
  value: number, oldValue?: number
): Promise<ActionResult> {
  if (value < 1) return { error: 'يجب أن تكون القيمة أكبر من صفر' }
  const supabase = await createClient()
  const { error } = await supabase.from('tenant_limits').update({ [field]: value }).eq('tenant_id', tenantId)
  if (error) return { error: 'فشل تحديث الحد' }
  const tenantName = await getTenantName(tenantId)
  await logAction({
    action: 'UPDATE_LIMIT', entityType: 'limit',
    entityId: tenantId, entityName: tenantName,
    oldValue: oldValue !== undefined ? { [field]: oldValue } : undefined,
    newValue: { [field]: value },
  })
  revalidatePath(`/admin/tenants/${tenantId}`)
  return { success: true }
}
