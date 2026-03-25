'use server'

// ============================================================
// SECTION: Settings Actions — إعدادات المنصة
// ============================================================

import { createClient }   from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAction }      from '@/lib/utils/audit'

// ── Sub-section: Types ─────────────────────────────────────────

export interface PlatformSettings {
  id:              string
  platform_name:   string
  support_email:   string | null
  primary_color:   string
  secondary_color: string
  logo_url:        string | null
  font_arabic:     string
  font_latin:      string
  updated_at:      string
}

export interface SettingsPayload {
  platform_name:   string
  support_email:   string
  primary_color:   string
  secondary_color: string
  logo_url:        string | null
  font_arabic:     string
  font_latin:      string
}

export interface ActionResult {
  error?:   string
  success?: boolean
}

// ============================================================
// SECTION: getSettings — جلب الإعدادات الحالية
// ============================================================

/**
 * يُرجع سجل إعدادات المنصة الوحيد
 * @returns PlatformSettings أو null
 */
export async function getSettings(): Promise<PlatformSettings | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('platform_settings')
    .select('*')
    .limit(1)
    .single()

  if (error) return null
  return data as PlatformSettings
}

// ============================================================
// SECTION: updateSettings — حفظ الإعدادات
// ============================================================

/**
 * يحدّث إعدادات المنصة
 * @param id      - معرف السجل
 * @param payload - الإعدادات الجديدة
 */
export async function updateSettings(
  id:      string,
  payload: SettingsPayload
): Promise<ActionResult> {
  // التحقق من صيغة الألوان
  const hexRegex = /^#[0-9A-Fa-f]{6}$/
  if (!hexRegex.test(payload.primary_color))
    return { error: 'اللون الرئيسي غير صحيح — استخدم صيغة HEX مثل #0F172A' }
  if (!hexRegex.test(payload.secondary_color))
    return { error: 'اللون الثانوي غير صحيح — استخدم صيغة HEX مثل #6366F1' }
  if (!payload.platform_name.trim())
    return { error: 'اسم المنصة مطلوب' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('platform_settings')
    .update({
      platform_name:   payload.platform_name.trim(),
      support_email:   payload.support_email.trim() || null,
      primary_color:   payload.primary_color,
      secondary_color: payload.secondary_color,
      logo_url:        payload.logo_url,
      font_arabic:     payload.font_arabic,
      font_latin:      payload.font_latin,
      updated_at:      new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: 'فشل حفظ الإعدادات، يرجى المحاولة مجدداً' }

  await logAction({
    action:     'UPDATE_TENANT',
    entityType: 'tenant',
    entityId:   id,
    entityName: 'إعدادات المنصة',
    newValue: {
      platform_name:   payload.platform_name,
      primary_color:   payload.primary_color,
      secondary_color: payload.secondary_color,
      font_arabic:     payload.font_arabic,
    },
  })

  revalidatePath('/admin/settings')
  return { success: true }
}
