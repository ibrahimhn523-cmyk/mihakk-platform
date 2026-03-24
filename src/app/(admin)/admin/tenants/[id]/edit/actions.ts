'use server'

// ============================================================
// SECTION: Edit Tenant Actions — تعديل بيانات المنشأة
// الوصف: يحدّث tenants + tenant_owners + tenant_limits دفعة واحدة
// ============================================================

import { createClient }   from '@/lib/supabase/server'
import { redirect }       from 'next/navigation'
import { revalidatePath } from 'next/cache'

// ── Sub-section: Types ─────────────────────────────────────────

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

export interface EditActionResult {
  error?: string
}

// ============================================================
// SECTION: updateTenant — Action رئيسي للتعديل
// ============================================================

/**
 * يحدّث بيانات المنشأة والمالك والحدود
 * @param payload - البيانات المعدّلة
 * @returns error string أو يُعيد redirect عند النجاح
 */
export async function updateTenant(
  payload: EditTenantPayload
): Promise<EditActionResult> {
  const supabase = await createClient()
  const { tenantId } = payload

  // ── [1] تحديث اسم المنشأة ───────────────────────────────
  const { error: tenantError } = await supabase
    .from('tenants')
    .update({ name: payload.name.trim() })
    .eq('id', tenantId)

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

  // ── إعادة التحقق من الكاش والتوجيه ─────────────────────
  revalidatePath(`/admin/tenants/${tenantId}`)
  revalidatePath('/admin/tenants')
  redirect(`/admin/tenants/${tenantId}`)
}
