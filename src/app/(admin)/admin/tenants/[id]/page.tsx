// ============================================================
// SECTION: Tenant Detail Page — صفحة إدارة المنشأة
// الوصف: Server Component — يجلب كل بيانات المنشأة دفعة واحدة
// ============================================================

import { notFound }    from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import TenantHeader    from './_components/TenantHeader'
import TenantTabs      from './_components/TenantTabs'

// ── Sub-section: Metadata ────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id }   = await params
  const supabase = await createClient()
  const { data } = await supabase.from('tenants').select('name').eq('id', id).single()
  return { title: data?.name ? `${data.name} — إدارة` : 'إدارة المنشأة' }
}

// ============================================================
// SECTION: Page Component
// ============================================================

export default async function TenantDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id }   = await params
  const supabase = await createClient()

  // ── جلب كل البيانات بالتوازي ─────────────────────────────

  const [tenantRes, ownerRes, subsRes, limitsRes, servicesRes] = await Promise.all([
    supabase
      .from('tenants')
      .select('id, name, subdomain, status')
      .eq('id', id)
      .single(),

    supabase
      .from('tenant_owners')
      .select('full_name, phone')
      .eq('tenant_id', id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('subscriptions')
      .select('id, plan, starts_at, ends_at, is_active')
      .eq('tenant_id', id)
      .order('created_at', { ascending: false }),

    supabase
      .from('tenant_limits')
      .select('id, tenant_id, max_students, max_programs, max_users')
      .eq('tenant_id', id)
      .maybeSingle(),

    supabase
      .from('tenant_services')
      .select('service_key, is_enabled')
      .eq('tenant_id', id),
  ])

  // ── 404 إذا لم تُوجد المنشأة ─────────────────────────────
  if (tenantRes.error || !tenantRes.data) notFound()

  const tenant        = tenantRes.data
  const owner         = ownerRes.data   ?? null
  const subscriptions = subsRes.data    ?? []
  const limits        = limitsRes.data  ?? null
  const services      = servicesRes.data ?? []

  // الاشتراك النشط — للعرض في الـ Header
  const activeSub = subscriptions.find((s) => s.is_active) ?? null

  // ============================================================
  // SECTION: Render
  // ============================================================

  return (
    <div className="space-y-4">

      {/* ── Header ──────────────────────────────────────── */}
      <TenantHeader
        tenant={tenant}
        owner={owner}
        subscription={activeSub ? {
          plan:      activeSub.plan,
          starts_at: activeSub.starts_at,
          ends_at:   activeSub.ends_at,
        } : null}
      />

      {/* ── التبويبات الثلاثة ────────────────────────────── */}
      <TenantTabs
        tenantId={id}
        services={services}
        subscriptions={subscriptions}
        limits={limits}
      />

    </div>
  )
}
