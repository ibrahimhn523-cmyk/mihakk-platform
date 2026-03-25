// ============================================================
// SECTION: Accounting Integration — هيكل جاهز
// الوصف: الربط عند الطلب — Qoyod أو ZATCA
// الحالة: [PENDING] — الواجهة جاهزة، الربط الفعلي عند الطلب
// ============================================================

import type { Integration } from '../types'

// [PENDING] أضف هنا: ACCOUNTING_API_KEY و ACCOUNTING_BASE_URL في .env.local

export const AccountingIntegration: Integration = {
  async connect(): Promise<boolean> {
    // [TODO] ربط Qoyod أو ZATCA API
    console.warn('[Accounting] التكامل لم يُفعَّل بعد')
    return false
  },

  async disconnect(): Promise<boolean> {
    return true
  },

  async send(_payload: unknown): Promise<boolean> {
    // [TODO] إرسال فاتورة أو قيد محاسبي
    console.warn('[Accounting] التكامل لم يُفعَّل بعد')
    return false
  },

  async verify(): Promise<boolean> {
    return false
  },
}
