// ============================================================
// SECTION: Edit Tenant Page — صفحة تعديل بيانات المنشأة
// الوصف: Server Component — يجلب البيانات ويُمرّرها للنموذج
// ============================================================

import { notFound }      from 'next/navigation'
import Link              from 'next/link'
import type { Metadata } from 'next'
import { createClient }  from '@/lib/supabase/server'
import EditTenantForm    from './_components/EditTenantForm'

// ── Sub-section: Metadata ─────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id }   = await params
  const supabase = await createClient()
  const { data } = await supabase.from('tenants').select('name').eq('id', id).single()
  return { title: data?.name ? `تعديل: ${data.name}` : 'تعديل المنشأة' }
}

// ============================================================
// SECTION: Page Component
// ============================================================

export default async function EditTenantPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id }   = await params
  const supabase = await createClient()

  // ── جلب البيانات بالتوازي ────────────────────────────────
  const [tenantRes, ownerRes, limitsRes] = await Promise.all([
    supabase
      .from('tenants')
      .select('id, name, subdomain, status, created_at')
      .eq('id', id)
      .single(),

    supabase
      .from('tenant_owners')
      .select('full_name, phone, email')
      .eq('tenant_id', id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('tenant_limits')
      .select('max_students, max_programs, max_users')
      .eq('tenant_id', id)
      .maybeSingle(),
  ])

  if (tenantRes.error || !tenantRes.data) notFound()

  const tenant = tenantRes.data
  const owner  = ownerRes.data
  const limits = limitsRes.data

  // ============================================================
  // SECTION: Render
  // ============================================================

  return (
    <div className="mx-auto max-w-2xl space-y-5">

      {/* ── رأس الصفحة مع مسار التنقل ──────────────────────── */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <Link href="/admin/tenants" className="hover:text-gray-600 transition">
            المنشآت
          </Link>
          <span>/</span>
          <Link
            href={`/admin/tenants/${id}`}
            className="hover:text-gray-600 transition max-w-[120px] truncate"
          >
            {tenant.name}
          </Link>
          <span>/</span>
          <span className="text-gray-600">تعديل</span>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/tenants/${id}`}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
            aria-label="رجوع"
          >
            ←
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">
            تعديل: {tenant.name}
          </h1>
        </div>
      </div>

      {/* ── النموذج ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
        <EditTenantForm
          initial={{
            tenantId:    tenant.id,
            name:        tenant.name,
            subdomain:   tenant.subdomain,
            createdAt:   tenant.created_at,
            ownerName:   owner?.full_name  ?? '',
            ownerPhone:  owner?.phone      ?? '',
            ownerEmail:  owner?.email      ?? '',
            maxStudents: limits?.max_students ?? 50,
            maxPrograms: limits?.max_programs ?? 3,
            maxUsers:    limits?.max_users    ?? 5,
          }}
        />
      </div>

    </div>
  )
}
