'use client'

// ============================================================
// SECTION: LoginForm — نموذج تسجيل الدخول
// الوصف: Client Component — يتعامل مع إدخال المستخدم واستدعاء Supabase Auth
// ============================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ── Sub-section: Props ────────────────────────────────────────

interface LoginFormProps {
  tenantName: string
}

// ============================================================
// SECTION: Component
// ============================================================

export default function LoginForm({ tenantName }: LoginFormProps) {
  const router = useRouter()
  const [phone, setPhone]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  // ── Sub-section: معالجة تسجيل الدخول ──────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()

      // تسجيل الدخول عبر رقم الجوال وكلمة المرور
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        phone: phone.trim(),
        password,
      })

      if (authError) {
        setError(getArabicError(authError.message))
        return
      }

      if (!data.user) {
        setError('حدث خطأ غير متوقع، يرجى المحاولة مجدداً')
        return
      }

      // جلب دور المستخدم من جدول users
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      // التوجيه بناءً على الدور
      if (userData?.role === 'super_admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }

    } catch {
      setError('حدث خطأ في الاتصال، يرجى المحاولة مجدداً')
    } finally {
      setLoading(false)
    }
  }

  // ── Sub-section: ترجمة رسائل الخطأ للعربية ────────────────

  function getArabicError(msg: string): string {
    if (msg.includes('Invalid login credentials'))
      return 'رقم الجوال أو كلمة المرور غير صحيحة'
    if (msg.includes('Email not confirmed'))
      return 'الحساب لم يتم تفعيله بعد'
    if (msg.includes('Too many requests'))
      return 'محاولات كثيرة، يرجى الانتظار قليلاً'
    if (msg.includes('User not found'))
      return 'لا يوجد حساب بهذا الرقم'
    return 'حدث خطأ، يرجى المحاولة مجدداً'
  }

  // ============================================================
  // SECTION: Render
  // ============================================================

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">

        {/* ── البطاقة الرئيسية ─────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* ── رأس الصفحة ───────────────────────────────────── */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <span className="text-white text-2xl font-bold">م</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{tenantName}</h1>
            <p className="text-sm text-gray-500 mt-1">أدخل بياناتك للدخول إلى حسابك</p>
          </div>

          {/* ── رسالة الخطأ ──────────────────────────────────── */}
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* ── النموذج ──────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* حقل رقم الجوال */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                رقم الجوال
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                required
                placeholder="05XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/10"
              />
            </div>

            {/* حقل كلمة المرور */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                كلمة المرور
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/10"
              />
            </div>

            {/* زر تسجيل الدخول */}
            <button
              type="submit"
              disabled={loading || !phone || !password}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  جارٍ تسجيل الدخول…
                </span>
              ) : (
                'تسجيل الدخول'
              )}
            </button>

          </form>
        </div>

        {/* ── تذييل ────────────────────────────────────────── */}
        <p className="text-center text-xs text-gray-400 mt-6">
          منصة محك © {new Date().getFullYear()}
        </p>

      </div>
    </div>
  )
}
