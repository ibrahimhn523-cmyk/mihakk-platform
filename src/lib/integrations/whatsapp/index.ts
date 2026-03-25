// ============================================================
// SECTION: WhatsApp Integration — Meta Business API
// الوصف: ربط فعلي بـ WhatsApp Cloud API لإرسال رسائل الترحيب
// المتطلبات: WHATSAPP_API_TOKEN + WHATSAPP_PHONE_NUMBER_ID في .env.local
// ============================================================

import type { Integration } from '../types'

// ── Sub-section: الثوابت والإعدادات ──────────────────────────

const WA_API_VERSION = 'v21.0'
const WA_API_BASE    = 'https://graph.facebook.com'

function getApiToken(): string {
  const token = process.env.WHATSAPP_API_TOKEN
  if (!token) throw new Error('[WhatsApp] WHATSAPP_API_TOKEN غير موجود في .env')
  return token
}

function getPhoneNumberId(): string {
  const id = process.env.WHATSAPP_PHONE_NUMBER_ID
  if (!id) throw new Error('[WhatsApp] WHATSAPP_PHONE_NUMBER_ID غير موجود في .env')
  return id
}

// ── Sub-section: تنسيق رقم الجوال للـ API ────────────────────

/**
 * يحوّل رقم الجوال السعودي لصيغة دولية
 * 0512345678 → 966512345678
 */
function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('966')) return digits
  if (digits.startsWith('0'))   return '966' + digits.slice(1)
  return '966' + digits
}

// ============================================================
// SECTION: sendWelcomeMessage — رسالة الترحيب للمالك
// الوصف: تُرسل عند إنشاء منشأة جديدة
// ============================================================

/**
 * يرسل رسالة ترحيب للمالك عبر WhatsApp عند إنشاء منشأته
 * @param phone        - رقم جوال المالك
 * @param tenantName   - اسم المنشأة
 * @param loginUrl     - رابط تسجيل الدخول
 * @param tempPassword - كلمة المرور المؤقتة
 * @returns true عند النجاح، false عند الفشل (لا تُوقف العملية الرئيسية)
 */
export async function sendWelcomeMessage(
  phone:        string,
  tenantName:   string,
  loginUrl:     string,
  tempPassword: string
): Promise<boolean> {
  try {
    const token         = getApiToken()
    const phoneNumberId = getPhoneNumberId()
    const formattedPhone = formatPhoneNumber(phone)

    const url = `${WA_API_BASE}/${WA_API_VERSION}/${phoneNumberId}/messages`

    // رسالة نصية بسيطة — يمكن استبدالها لاحقاً بـ Template Message
    const body = {
      messaging_product: 'whatsapp',
      to:                formattedPhone,
      type:              'text',
      text: {
        preview_url: false,
        body: [
          `مرحباً بك في منصة محك! 🎉`,
          ``,
          `تم إنشاء منشأتك *${tenantName}* بنجاح.`,
          ``,
          `🔐 بيانات الدخول:`,
          `الرابط: ${loginUrl}`,
          `كلمة المرور المؤقتة: ${tempPassword}`,
          ``,
          `⚠️ يُرجى تغيير كلمة المرور فور تسجيل دخولك.`,
          ``,
          `للمساعدة: support@mihakk.com`,
        ].join('\n'),
      },
    }

    const response = await fetch(url, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      console.error('[WhatsApp] فشل الإرسال:', err)
      return false
    }

    console.log(`[WhatsApp] ✓ رسالة ترحيب أُرسلت إلى ${formattedPhone}`)
    return true

  } catch (error) {
    // لا نُوقف العملية الرئيسية — فقط نسجّل الخطأ
    console.error('[WhatsApp] خطأ في الإرسال:', error)
    return false
  }
}

// ============================================================
// SECTION: WhatsAppIntegration — تنفيذ الواجهة الموحدة
// ============================================================

export const WhatsAppIntegration: Integration = {
  async connect(): Promise<boolean> {
    try {
      const token         = getApiToken()
      const phoneNumberId = getPhoneNumberId()

      const res = await fetch(
        `${WA_API_BASE}/${WA_API_VERSION}/${phoneNumberId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      return res.ok
    } catch {
      return false
    }
  },

  async disconnect(): Promise<boolean> {
    // WhatsApp Cloud API لا تحتاج disconnect صريح
    return true
  },

  async send(payload: unknown): Promise<boolean> {
    if (
      typeof payload !== 'object' || payload === null ||
      !('phone' in payload) || !('message' in payload)
    ) return false

    const { phone, message } = payload as { phone: string; message: string }
    try {
      const token         = getApiToken()
      const phoneNumberId = getPhoneNumberId()

      const res = await fetch(
        `${WA_API_BASE}/${WA_API_VERSION}/${phoneNumberId}/messages`,
        {
          method:  'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type':  'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to:   formatPhoneNumber(phone),
            type: 'text',
            text: { body: message },
          }),
        }
      )
      return res.ok
    } catch {
      return false
    }
  },

  async verify(): Promise<boolean> {
    return WhatsAppIntegration.connect()
  },
}
