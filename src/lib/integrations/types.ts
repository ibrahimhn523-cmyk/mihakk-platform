// ============================================================
// SECTION: Integration Types — الواجهة المشتركة لكل التكاملات
// الوصف: كل تكامل خارجي يلتزم بهذه الواجهة الموحدة
// ============================================================

/**
 * الواجهة الموحدة لكل تكاملات المنصة الخارجية
 * كل provider يُنفّذ هذه الدوال الأربع
 */
export interface Integration {
  /** ربط الخدمة والتحقق من صحة الإعدادات */
  connect(): Promise<boolean>

  /** فصل الخدمة وتنظيف الجلسة */
  disconnect(): Promise<boolean>

  /** إرسال رسالة أو طلب عبر الخدمة */
  send(payload: unknown): Promise<boolean>

  /** التحقق من أن الاتصال لا يزال صحيحاً */
  verify(): Promise<boolean>
}

// ── Sub-section: أنواع مشتركة بين التكاملات ──────────────────

export type IntegrationProvider =
  | 'whatsapp'
  | 'sms'
  | 'payment'
  | 'accounting'
  | 'crm'

export interface IntegrationConfig {
  provider:  IntegrationProvider
  tenantId:  string
  isActive:  boolean
  config:    Record<string, unknown>
}
