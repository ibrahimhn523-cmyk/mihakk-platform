'use client'

// ============================================================
// SECTION: AdminSidebar — الشريط الجانبي للوحة Super Admin
// الوصف: قائمة التنقل الرئيسية — داكن، RTL، متجاوب مع الجوال
// ============================================================

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ── Sub-section: Types ────────────────────────────────────────

interface NavItem {
  label: string
  href:  string
  icon:  string
}

interface NavGroup {
  title: string
  items: NavItem[]
}

interface AdminSidebarProps {
  userName: string
  userRole: string
}

// ── Sub-section: قائمة التنقل ─────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'لوحة التحكم', href: '/admin/dashboard', icon: '◈' },
    ],
  },
  {
    title: 'TENANTS',
    items: [
      { label: 'المنشآت',      href: '/admin/tenants',     icon: '⊞' },
      { label: 'إضافة منشأة', href: '/admin/tenants/new', icon: '⊕' },
    ],
  },
  {
    title: 'PLATFORM',
    items: [
      { label: 'سجل العمليات',  href: '/admin/logs',     icon: '≡' },
      { label: 'إعدادات المنصة', href: '/admin/settings', icon: '⚙' },
    ],
  },
]

// ============================================================
// SECTION: Component
// ============================================================

export default function AdminSidebar({ userName, userRole }: AdminSidebarProps) {
  const pathname          = usePathname()
  const router            = useRouter()
  const [open, setOpen]   = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  // ── Sub-section: تسجيل الخروج ─────────────────────────────

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  // ── Sub-section: تحديد القائمة النشطة ─────────────────────

  function isActive(href: string): boolean {
    if (href === '/admin/dashboard') return pathname === href
    return pathname.startsWith(href)
  }

  // ── Sub-section: محتوى الشريط الجانبي (مشترك) ─────────────

  const sidebarContent = (
    <div className="flex h-full flex-col">

      {/* ── الشعار ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
          <span className="text-white font-bold text-lg">م</span>
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">محك</p>
          <p className="text-white/40 text-xs">لوحة التحكم</p>
        </div>
      </div>

      {/* ── قوائم التنقل ────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="px-2 mb-1.5 text-[10px] font-semibold tracking-widest text-white/30 uppercase">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`
                        flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all
                        ${active
                          ? 'bg-white/15 text-white font-medium'
                          : 'text-white/60 hover:bg-white/8 hover:text-white/90'
                        }
                      `}
                    >
                      <span className={`text-base shrink-0 ${active ? 'text-white' : 'text-white/40'}`}>
                        {item.icon}
                      </span>
                      {item.label}
                      {/* شريط جانبي للقائمة النشطة */}
                      {active && (
                        <span className="me-auto h-1.5 w-1.5 rounded-full bg-white/70" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── معلومات المستخدم + تسجيل الخروج ────────────────── */}
      <div className="border-t border-white/10 px-3 py-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2 mb-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white text-xs font-bold">
            {userName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{userName}</p>
            <p className="text-[11px] text-white/40">{userRole}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/50 transition hover:bg-white/8 hover:text-red-400 disabled:opacity-50"
        >
          <span className="text-base shrink-0">→</span>
          {loggingOut ? 'جارٍ الخروج…' : 'تسجيل الخروج'}
        </button>
      </div>

    </div>
  )

  // ============================================================
  // SECTION: Render — شاشة كبيرة + جوال
  // ============================================================

  return (
    <>
      {/* ── الشريط الجانبي على الشاشات الكبيرة ─────────────── */}
      <aside className="hidden lg:flex lg:w-60 lg:shrink-0 lg:flex-col"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {sidebarContent}
      </aside>

      {/* ── شريط الجوال العلوي ──────────────────────────────── */}
      <div
        className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/10"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {/* شعار مصغّر */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <span className="text-white font-bold">م</span>
          </div>
          <span className="text-white font-semibold text-sm">محك</span>
        </div>

        {/* زر فتح/إغلاق القائمة */}
        <button
          onClick={() => setOpen(!open)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 transition"
          aria-label="القائمة"
        >
          <span className="text-xl">{open ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* ── القائمة المنسدلة على الجوال ────────────────────── */}
      {open && (
        <>
          {/* طبقة الإغلاق خلف القائمة */}
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/40"
            onClick={() => setOpen(false)}
          />
          {/* القائمة نفسها */}
          <div
            className="lg:hidden fixed top-[52px] inset-x-0 z-40 max-h-[80vh] overflow-y-auto shadow-xl"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {sidebarContent}
          </div>
        </>
      )}
    </>
  )
}
