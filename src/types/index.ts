// ============================================================
// SECTION: تعريفات TypeScript الأساسية — منصة محك
// الوصف: أنواع البيانات المشتركة عبر كامل المشروع
//        مشتقة من هيكل قاعدة البيانات في Supabase
// ============================================================

// ── Sub-section: Tenant — المنشأة ─────────────────────────────────────────

export interface Tenant {
  id: string
  name: string
  subdomain: string
  status: 'active' | 'trial' | 'suspended' | 'expired'
  created_at: string
  created_by: string | null
}

// ── Sub-section: TenantOwner — مالك المنشأة ───────────────────────────────

export interface TenantOwner {
  id: string
  tenant_id: string
  full_name: string
  phone: string
  email: string | null
}

// ── Sub-section: Subscription — الاشتراك ──────────────────────────────────

export interface Subscription {
  id: string
  tenant_id: string
  plan: 'trial' | 'basic' | 'advanced'
  starts_at: string
  ends_at: string
  is_active: boolean
}

// ── Sub-section: TenantLimits — حدود المنشأة ──────────────────────────────

export interface TenantLimits {
  id: string
  tenant_id: string
  max_students: number
  max_programs: number
  max_users: number
}

// ── Sub-section: TenantService — الخدمات المفعّلة ─────────────────────────

export interface TenantService {
  id: string
  tenant_id: string
  service_key: string
  is_enabled: boolean
  service_type: 'core' | 'addon'
  enabled_at: string | null
}

// ── Sub-section: User — المستخدم ──────────────────────────────────────────

export interface User {
  id: string
  tenant_id: string | null
  full_name: string
  phone: string
  role: 'super_admin' | 'owner' | 'program_manager' | 'supervisor'
  must_change_pwd: boolean
  is_active: boolean
}

// ── Sub-section: TenantBranding — هوية المنشأة البصرية ───────────────────

export interface TenantBranding {
  id: string
  tenant_id: string
  primary_color: string
  secondary_color: string
  logo_url: string | null
  font_arabic: 'Tajawal' | 'Cairo' | 'Noto Kufi Arabic' | 'IBM Plex Arabic'
  font_latin: 'Inter' | 'DM Sans' | 'Poppins' | 'Plus Jakarta Sans'
  sidebar_hidden_items: string[]
}

// ── Sub-section: Integration — التكاملات الخارجية ─────────────────────────

export interface Integration {
  id: string
  tenant_id: string
  provider: 'whatsapp' | 'sms' | 'payment' | 'accounting' | 'crm'
  config: Record<string, unknown>
  is_active: boolean
  created_at: string
}

// ============================================================
// SECTION: Database — نوع مجمّع لكل الجداول
// الوصف: يُستخدم كمرجع مركزي لربط الأنواع بأسماء الجداول
// ============================================================

export type Database = {
  tenants: Record<string, Tenant>
  tenant_owners: Record<string, TenantOwner>
  subscriptions: Record<string, Subscription>
  tenant_limits: Record<string, TenantLimits>
  tenant_services: Record<string, TenantService>
  users: Record<string, User>
  tenant_branding: Record<string, TenantBranding>
  integrations: Record<string, Integration>
}
