// ============================================================
// SECTION: SMS Integration — هيكل جاهز
// الوصف: الربط لاحقاً — Unifonic أو Taqnyat
// الحالة: [PENDING] — الواجهة جاهزة، الربط الفعلي عند الطلب
// ============================================================

import type { Integration } from '../types'

// [PENDING] أضف هنا: SMS_API_TOKEN و SMS_SENDER_ID في .env.local

export const SmsIntegration: Integration = {
  async connect(): Promise<boolean> {
    // [TODO] ربط Unifonic أو Taqnyat API
    console.warn('[SMS] التكامل لم يُفعَّل بعد')
    return false
  },

  async disconnect(): Promise<boolean> {
    return true
  },

  async send(_payload: unknown): Promise<boolean> {
    // [TODO] إرسال SMS عبر المزود المختار
    console.warn('[SMS] التكامل لم يُفعَّل بعد')
    return false
  },

  async verify(): Promise<boolean> {
    return false
  },
}
