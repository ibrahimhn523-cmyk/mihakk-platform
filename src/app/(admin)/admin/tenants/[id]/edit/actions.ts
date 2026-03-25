'use server'

// ============================================================
// SECTION: Edit Tenant Actions — تعديل بيانات المنشأة
// الوصف: يحدّث tenants + tenant_owners + tenant_limits + يسجّل العملية
// ============================================================

import { createClient }   from '@/lib/supabase/server'
import { redirect }       from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { logAction }      from '@/lib/utils/audit'

export interface EditTenantPayload {
  tenantId:    string
  name:        string
  ownerName:   string
  ownerPhone:  string
  ownerEmail:  string
  maxStudents: number
  maxPrograms: number
  maxUsers:    number
}

export interface EditActionResult { error?: string }

export async function updateTenant(
  payload: EditTenantPayload
): Promise<EditActionResult> {
  const supabase = await createClient()
  const { tenantId } = payload

  // جلب البيانات القديمة للتسجيل
  const { data: oldData } = await supabase
    .from('tenants').select('name').eq('id', tenantId).single()

  // ── [1] تحديث اسم المنشأة ───────────────────────────────
  const { error: tenantError } = await supabase
    .from('tenants').update({ name: payload.name.trim() }).eq('id', tenantId)
  if (tenantError) return { error: 'فشل تحديث بيانات المنشأة' }

  // ── [2] تحديث بيانات المالك ─────────────────────────────
  const { error: ownerError } = await supabase
    .from('tenant_owners')
    .update({
      full_name: payload.ownerName.trim(),
      phone:     payload.ownerPhone.trim(),
      email:     payload.ownerEmail.trim() || null,
    })
    .eq('tenant_id', tenantId)
  if (ownerError) return { error: 'فشل تحديث بيانات المالك' }

  // ── [3] تحديث الحدود ────────────────────────────────────
  const { error: limitsError } = await supabase
    .from('tenant_limits')
    .update({
      max_students: payload.maxStudents,
      max_programs: payload.maxPrograms,
      max_users:    payload.maxUsers,
    })
    .eq('tenant_id', tenantId)
  if (limitsError) return { error: 'فشل تحديث حدود الاستخدام' }

  // ── [4] تسجيل العملية ───────────────────────────────────
  await logAction({
    action:     'UPDATE_TENANT',
    entityType: 'tenant',
    entityId:   tenantId,
    entityName: payload.name,
    oldValue:   { name: oldData?.name },
    newValue: {
      name:      payload.name,
      ownerName: payload.ownerName,
      limits: {
        max_students: payload.maxStudents,
        max_programs: payload.maxPrograms,
        max_users:    payload.maxUsers,
      },
    },
  })

  revalidatePath(`/admin/tenants/${tenantId}`)
  revalidatePath('/admin/tenants')
  redirect(`/admin/tenants/${tenantId}`)
}
