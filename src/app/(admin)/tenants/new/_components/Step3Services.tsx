'use client'

// ============================================================
// SECTION: Step3Services — تفعيل الخدمات للمنشأة
// الوصف: قائمة بالخدمات Core وAddons مع toggle لكل خدمة
// ============================================================

// ── Sub-section: قوائم الخدمات ────────────────────────────────

const CORE_SERVICES = [
  { key: 'db',            label: 'قاعدة البيانات',  icon: '🗄️' },
  { key: 'subscriptions', label: 'الاشتراكات',       icon: '💳' },
  { key: 'programs',      label: 'البرامج',           icon: '📚' },
  { key: 'accounting',    label: 'المحاسبة',          icon: '📊' },
  { key: 'users',         label: 'المستخدمون',        icon: '👥' },
  { key: 'permissions',   label: 'الصلاحيات',         icon: '🔐' },
  { key: 'settings',      label: 'الإعدادات',         icon: '⚙️' },
  { key: 'points',        label: 'النقاط',            icon: '⭐' },
  { key: 'attendance',    label: 'الحضور',            icon: '✅' },
]

const ADDON_SERVICES = [
  { key: 'kingsleague', label: 'Kings League', icon: '👑' },
  { key: 'league',      label: 'الدوري',       icon: '🏆' },
  { key: 'fantasy',     label: 'الفانتازي',    icon: '🎮' },
]

// ── Sub-section: Props ────────────────────────────────────────

interface Props {
  services: Record<string, boolean>
  onChange: (services: Record<string, boolean>) => void
}

// ── Sub-section: مكوّن Toggle ─────────────────────────────────

function ServiceToggle({
  serviceKey, label, icon, enabled, onToggle,
}: {
  serviceKey: string
  label:      string
  icon:       string
  enabled:    boolean
  onToggle:   (key: string, val: boolean) => void
}) {
  return (
    <div className={`
      flex items-center justify-between rounded-xl border p-3.5 transition-all
      ${enabled ? 'border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5' : 'border-gray-100 bg-white'}
    `}>
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <span className={`text-sm font-medium ${enabled ? 'text-gray-800' : 'text-gray-500'}`}>
          {label}
        </span>
      </div>
      {/* Toggle switch */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onToggle(serviceKey, !enabled)}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1
          ${enabled ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}
        `}
        style={enabled ? { '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties : {}}
      >
        <span className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md
          transition-transform
          ${enabled ? 'translate-x-0' : 'translate-x-5'}
        `} />
      </button>
    </div>
  )
}

// ============================================================
// SECTION: Component
// ============================================================

export default function Step3Services({ services, onChange }: Props) {
  function handleToggle(key: string, val: boolean) {
    onChange({ ...services, [key]: val })
  }

  function toggleAll(keys: string[], val: boolean) {
    const updated = { ...services }
    keys.forEach((k) => { updated[k] = val })
    onChange(updated)
  }

  const coreKeys  = CORE_SERVICES.map((s) => s.key)
  const addonKeys = ADDON_SERVICES.map((s) => s.key)
  const allCoreOn = coreKeys.every((k) => services[k])

  return (
    <div className="space-y-6">

      {/* ── الخدمات الأساسية (Core) ──────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Core — الخدمات الأساسية
          </h3>
          <button
            type="button"
            onClick={() => toggleAll(coreKeys, !allCoreOn)}
            className="text-xs text-[var(--color-primary)] font-medium hover:underline"
          >
            {allCoreOn ? 'إيقاف الكل' : 'تشغيل الكل'}
          </button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_SERVICES.map((svc) => (
            <ServiceToggle
              key={svc.key}
              serviceKey={svc.key}
              label={svc.label}
              icon={svc.icon}
              enabled={services[svc.key] ?? false}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>

      {/* ── الإضافات (Addons) ────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Addons — الإضافات
          </h3>
          <button
            type="button"
            onClick={() => toggleAll(addonKeys, !addonKeys.every((k) => services[k]))}
            className="text-xs text-[var(--color-primary)] font-medium hover:underline"
          >
            {addonKeys.every((k) => services[k]) ? 'إيقاف الكل' : 'تشغيل الكل'}
          </button>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {ADDON_SERVICES.map((svc) => (
            <ServiceToggle
              key={svc.key}
              serviceKey={svc.key}
              label={svc.label}
              icon={svc.icon}
              enabled={services[svc.key] ?? false}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>

    </div>
  )
}
