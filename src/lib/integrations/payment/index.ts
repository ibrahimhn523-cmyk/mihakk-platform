// ============================================================
// SECTION: Payment Integration — هيكل جاهز
// الوصف: الربط في المرحلة الثالثة — Moyasar أو HyperPay
// الحالة: [PENDING] — الواجهة جاهزة، الربط الفعلي عند الطلب
// ============================================================

import type { Integration } from '../types'

// [PENDING] أضف هنا: PAYMENT_API_KEY و PAYMENT_SECRET في .env.local

export const PaymentIntegration: Integration = {
  async connect(): Promise<boolean> {
    // [TODO] ربط Moyasar أو HyperPay API
    console.warn('[Payment] التكامل لم يُفعَّل بعد')
    return false
  },

  async disconnect(): Promise<boolean> {
    return true
  },

  async send(_payload: unknown): Promise<boolean> {
    // [TODO] إنشاء طلب دفع أو إرسال فاتورة
    console.warn('[Payment] التكامل لم يُفعَّل بعد')
    return false
  },

  async verify(): Promise<boolean> {
    return false
  },
}
