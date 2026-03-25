// ============================================================
// SECTION: Audit Logger — تسجيل العمليات
// الوصف: دالة مركزية لتسجيل كل عملية في جدول audit_logs
//        لا تُوقف العملية الرئيسية عند الفشل — تسجيل صامت
// ============================================================

import { createClient } from '@/lib/supabase/server'

// ── Sub-section: أنواع العمليات ───────────────────────────────

export type AuditAction =
  | 'CREATE_TENANT'
  | 'UPDATE_TENANT'
  | 'UPDATE_TENANT_STATUS'
  | 'TOGGLE_SERVICE'
  | 'UPDATE_LIMIT'

export type AuditEntityType =
  | 'tenant'
  | 'service'
  | 'limit'

// ── Sub-section: Type المعاملات ──────────────────────────────

export interface LogActionParams {
  action:      AuditAction
  entityType:  AuditEntityType
  entityId:    string
  entityName:  string
  oldValue?:   Record<string, unknown>
  newValue?:   Record<string, unknown>
}

// ============================================================
// SECTION: logAction — الدالة الرئيسية
// ============================================================

/**
 * يُسجّل عملية في جدول audit_logs
 * @param params - تفاصيل العملية
 * يقرأ بيانات المنفّذ تلقائياً من الجلسة الحالية
 */
export async function logAction(params: LogActionParams): Promise<void> {
  try {
    const supabase = await createClient()

    // ── جلب بيانات المنفّذ من الجلسة ────────────────────
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // جلب اسم المنفّذ من جدول users
    const { data: userData } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const actorName = userData?.full_name ?? user.email ?? 'مستخدم غير معروف'

    // ── إدراج السجل ──────────────────────────────────────
    await supabase.from('audit_logs').insert({
      actor_id:    user.id,
      actor_name:  actorName,
      action:      params.action,
      entity_type: params.entityType,
      entity_id:   params.entityId,
      entity_name: params.entityName,
      old_value:   params.oldValue   ?? null,
      new_value:   params.newValue   ?? null,
    })

  } catch (error) {
    // التسجيل الصامت — لا يُوقف العملية الرئيسية
    console.error('[Audit] فشل تسجيل العملية:', error)
  }
}
