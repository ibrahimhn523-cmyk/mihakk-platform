'use client'

// ============================================================
// SECTION: SettingsForm — نموذج إعدادات المنصة
// الوصف: هوية بصرية + إعدادات عامة + رفع شعار
// ============================================================

import { useState, useRef, useTransition } from 'react'
import { createClient }  from '@/lib/supabase/client'
import { updateSettings, type PlatformSettings, type SettingsPayload } from '../actions'

// ── Sub-section: ثوابت الخطوط ─────────────────────────────────

const ARABIC_FONTS = ['Tajawal', 'Cairo', 'Noto Kufi Arabic', 'IBM Plex Arabic']
const LATIN_FONTS  = ['Inter', 'DM Sans', 'Poppins', 'Plus Jakarta Sans']

// ── Sub-section: مكوّنات مشتركة ──────────────────────────────

const inputCls = `w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm
  text-gray-900 outline-none transition focus:border-[var(--color-primary)]
  focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/10`

function Field({ label, children, hint }: {
  label: string; children: React.ReactNode; hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

function SectionTitle({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="border-b border-gray-100 pb-3 mb-5">
      <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
    </div>
  )
}

// ── Sub-section: مكوّن Color Picker ──────────────────────────

function ColorField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-16 cursor-pointer rounded-xl border border-gray-200 p-0.5 bg-white"
          />
        </div>
        <input
          type="text"
          value={value}
          maxLength={7}
          onChange={(e) => {
            const v = e.target.value
            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v)
          }}
          className={`${inputCls} font-mono uppercase`}
          dir="ltr"
          placeholder="#000000"
        />
        <div
          className="h-10 w-10 shrink-0 rounded-xl border border-gray-100"
          style={{ backgroundColor: value }}
        />
      </div>
    </Field>
  )
}

// ============================================================
// SECTION: Component
// ============================================================

interface Props { settings: PlatformSettings }

export default function SettingsForm({ settings }: Props) {
  const [form, setForm] = useState<SettingsPayload>({
    platform_name:   settings.platform_name,
    support_email:   settings.support_email ?? '',
    primary_color:   settings.primary_color,
    secondary_color: settings.secondary_color,
    logo_url:        settings.logo_url,
    font_arabic:     settings.font_arabic,
    font_latin:      settings.font_latin,
  })

  const [isPending,   startTransition] = useTransition()
  const [success,     setSuccess]      = useState(false)
  const [error,       setError]        = useState<string | null>(null)
  const [logoLoading, setLogoLoading]  = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function set(field: keyof SettingsPayload, value: string | null) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSuccess(false)
    setError(null)
  }

  // ── رفع الشعار لـ Supabase Storage ───────────────────────

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError('حجم الملف يتجاوز 2MB')
      return
    }

    setLogoLoading(true)
    setError(null)

    try {
      const supabase  = createClient()
      const ext       = file.name.split('.').pop()
      const filePath  = `logos/platform-logo.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('platform-assets')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('platform-assets')
        .getPublicUrl(filePath)

      set('logo_url', publicUrl)
    } catch {
      setError('فشل رفع الشعار، تحقق من إعدادات Storage في Supabase')
    } finally {
      setLogoLoading(false)
    }
  }

  // ── الحفظ ─────────────────────────────────────────────────

  function handleSave() {
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const result = await updateSettings(settings.id, form)
      if (result.error) setError(result.error)
      else setSuccess(true)
    })
  }

  // ============================================================
  // SECTION: Render
  // ============================================================

  return (
    <div className="space-y-6 max-w-2xl">

      {/* رسالة النجاح / الخطأ */}
      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700">
          ✓ تم حفظ الإعدادات بنجاح
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          ⚠️ {error}
        </div>
      )}

      {/* ── قسم الهوية البصرية ───────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <SectionTitle title="الهوية البصرية" desc="ألوان وخطوط وشعار المنصة" />

        <div className="space-y-5">

          {/* الشعار */}
          <Field label="شعار المنصة" hint="PNG أو SVG — الحد الأقصى 2MB">
            <div className="flex items-center gap-4">
              {form.logo_url ? (
                <img
                  src={form.logo_url}
                  alt="شعار المنصة"
                  className="h-14 w-14 rounded-xl border border-gray-100 object-contain bg-gray-50 p-1"
                />
              ) : (
                <div className="h-14 w-14 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xl">
                  م
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={logoLoading}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  {logoLoading ? 'جارٍ الرفع…' : 'رفع شعار'}
                </button>
                {form.logo_url && (
                  <button
                    type="button"
                    onClick={() => set('logo_url', null)}
                    className="rounded-xl border border-red-100 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                  >
                    حذف
                  </button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/svg+xml,image/jpeg,image/webp"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>
          </Field>

          {/* الألوان */}
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField
              label="اللون الرئيسي"
              value={form.primary_color}
              onChange={(v) => set('primary_color', v)}
            />
            <ColorField
              label="اللون الثانوي"
              value={form.secondary_color}
              onChange={(v) => set('secondary_color', v)}
            />
          </div>

          {/* معاينة الألوان */}
          <div className="flex gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-xs text-gray-400 me-1">معاينة:</span>
            <span
              className="inline-block rounded-full px-3 py-1 text-xs text-white font-medium"
              style={{ backgroundColor: form.primary_color }}
            >
              رئيسي
            </span>
            <span
              className="inline-block rounded-full px-3 py-1 text-xs text-white font-medium"
              style={{ backgroundColor: form.secondary_color }}
            >
              ثانوي
            </span>
          </div>

          {/* الخطوط */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="الخط العربي">
              <select
                value={form.font_arabic}
                onChange={(e) => set('font_arabic', e.target.value)}
                className={inputCls}
              >
                {ARABIC_FONTS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </Field>
            <Field label="الخط اللاتيني">
              <select
                value={form.font_latin}
                onChange={(e) => set('font_latin', e.target.value)}
                className={inputCls}
                dir="ltr"
              >
                {LATIN_FONTS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </Field>
          </div>

        </div>
      </div>

      {/* ── قسم الإعدادات العامة ─────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <SectionTitle title="الإعدادات العامة" desc="معلومات المنصة والتواصل" />
        <div className="space-y-4">
          <Field label="اسم المنصة">
            <input
              type="text"
              value={form.platform_name}
              onChange={(e) => set('platform_name', e.target.value)}
              className={inputCls}
              placeholder="محك"
            />
          </Field>
          <Field label="البريد الإلكتروني للدعم">
            <input
              type="email"
              value={form.support_email}
              onChange={(e) => set('support_email', e.target.value)}
              className={inputCls}
              placeholder="support@mihakk.com"
              dir="ltr"
            />
          </Field>
        </div>
      </div>

      {/* ── زر الحفظ ─────────────────────────────────────── */}
      <button
        onClick={handleSave}
        disabled={isPending || logoLoading}
        className="w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            جارٍ الحفظ…
          </span>
        ) : 'حفظ الإعدادات'}
      </button>

    </div>
  )
}
