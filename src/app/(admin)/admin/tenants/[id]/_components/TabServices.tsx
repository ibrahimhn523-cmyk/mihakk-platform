'use client'

// ============================================================
// SECTION: TabServices — تبويب الخدمات مع Toggles
// الوصف: يعرض Core Services وAddons مع تحديث فوري
// ============================================================

import { useState, useTransition } from 'react'
import { toggleService }           from '../actions'

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

// ── Sub-section: Types ─────────────────────────────────────────

interface ServiceRow {
  service_key: string
  is_enabled:  boolean
}

interface Props {
  tenantId: string
  services: ServiceRow[]
}

// ── Sub-section: مكوّن بطاقة الخدمة ──────────────────────────

function ServiceCard({
  tenantId, serviceKey, label, icon, initialEnabled,
}: {
  tenantId:        string
  serviceKey:      string
  label:           string
  icon:            string
  initialEnabled:  boolean
}) {
  const [enabled,    setEnabled]    = useState(initialEnabled)
  const [isPending,  startTransition] = useTransition()
  const [localError, setLocalError] = useState<string | null>(null)

  function handleToggle() {
    const next = !enabled
    setEnabled(next)        // Optimistic update
    setLocalError(null)

    startTransition(async () => {
      const result = await toggleService(tenantId, serviceKey, next)
      if (result.error) {
        setEnabled(!next)   // rollback عند الخطأ
        setLocalError(result.error)
      }
    })
  }

  return (
    <div className={`
      flex items-center justify-between rounded-xl border p-3.5 transition-all
      ${enabled ? 'border-[var(--color-primary)]/25 bg-[var(--color-primary)]/5' : 'border-gray-100 bg-white'}
    `}>
      <div className="flex items-center gap-3">
        <span className="text-base">{icon}</span>
        <div>
          <span className={`text-sm font-medium ${enabled ? 'text-gray-800' : 'text-gray-500'}`}>
            {label}
          </span>
          {localError && (
            <p className="text-[11px] text-red-500 mt-0.5">{localError}</p>
          )}
        </div>
      </div>

      {/* Toggle Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={handleToggle}
        disabled={isPending}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
          ${enabled ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}
        `}
      >
        <span className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm
          transition-transform duration-200
          ${enabled ? 'translate-x-0' : 'translate-x-5'}
        `} />
      </button>
    </div>
  )
}

// ── Sub-section: قسم منفصل ────────────────────────────────────

function ServiceSection({
  title, badge, services, tenantId, definitions,
}: {
  title:       string
  badge:       string
  tenantId:    string
  definitions: typeof CORE_SERVICES
  services:    ServiceRow[]
}) {
  const enabledCount = definitions.filter(
    (d) => services.find((s) => s.service_key === d.key)?.is_enabled
  ).length

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
          {badge}
        </span>
        <span className="ms-auto text-xs text-gray-400">
          {enabledCount} / {definitions.length} مفعّل
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {definitions.map((def) => {
          const row = services.find((s) => s.service_key === def.key)
          return (
            <ServiceCard
              key={def.key}
              tenantId={tenantId}
              serviceKey={def.key}
              label={def.label}
              icon={def.icon}
              initialEnabled={row?.is_enabled ?? false}
            />
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// SECTION: Component
// ============================================================

export default function TabServices({ tenantId, services }: Props) {
  return (
    <div className="space-y-7">
      <ServiceSection
        title="Core Services"
        badge="أساسية"
        tenantId={tenantId}
        definitions={CORE_SERVICES}
        services={services}
      />
      <ServiceSection
        title="Add-ons"
        badge="إضافات"
        tenantId={tenantId}
        definitions={ADDON_SERVICES}
        services={services}
      />
    </div>
  )
}
