// ============================================================
// SECTION: CRM Integration — هيكل جاهز
// الوصف: النظام يُحدَّد لاحقاً
// الحالة: [PENDING] — الواجهة جاهزة، الربط الفعلي عند الطلب
// ============================================================

import type { Integration } from '../types'

// [PENDING] أضف هنا: CRM_API_KEY و CRM_BASE_URL في .env.local

export const CrmIntegration: Integration = {
  async connect(): Promise<boolean> {
    // [TODO] ربط CRM المختار
    console.warn('[CRM] التكامل لم يُفعَّل بعد')
    return false
  },

  async disconnect(): Promise<boolean> {
    return true
  },

  async send(_payload: unknown): Promise<boolean> {
    // [TODO] إضافة عميل أو تحديث بيانات
    console.warn('[CRM] التكامل لم يُفعَّل بعد')
    return false
  },

  async verify(): Promise<boolean> {
    return false
  },
}
