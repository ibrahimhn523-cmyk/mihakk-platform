'use client'

// ============================================================
// SECTION: TenantTabs — التبويبات الثلاثة لصفحة إدارة المنشأة
// ============================================================

import { useState }        from 'react'
import TabServices         from './TabServices'
import TabSubscription     from './TabSubscription'
import TabLimits           from './TabLimits'

// ── Sub-section: Types ─────────────────────────────────────────

interface Props {
  tenantId:      string
  services:      { service_key: string; is_enabled: boolean }[]
  subscriptions: {
    id: string; plan: string; starts_at: string; ends_at: string; is_active: boolean
  }[]
  limits: {
    id: string; tenant_id: string; max_students: number; max_programs: number; max_users: number
  } | null
}

type TabId = 'services' | 'subscription' | 'limits'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'services',     label: 'الخدمات',         icon: '⚙️' },
  { id: 'subscription', label: 'الاشتراك والمدد', icon: '💳' },
  { id: 'limits',       label: 'حدود الاستخدام',  icon: '📊' },
]

// ============================================================
// SECTION: Component
// ============================================================

export default function TenantTabs({ tenantId, services, subscriptions, limits }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('services')

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-xs overflow-hidden">

      {/* ── شريط التبويبات ──────────────────────────────── */}
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 whitespace-nowrap px-5 py-3.5 text-sm font-medium
                border-b-2 transition-all
                ${isActive
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/5'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── محتوى التبويب النشط ─────────────────────────── */}
      <div className="p-5 sm:p-6">
        {activeTab === 'services' && (
          <TabServices tenantId={tenantId} services={services} />
        )}
        {activeTab === 'subscription' && (
          <TabSubscription subscriptions={subscriptions} />
        )}
        {activeTab === 'limits' && (
          <TabLimits tenantId={tenantId} limits={limits} />
        )}
      </div>

    </div>
  )
}
